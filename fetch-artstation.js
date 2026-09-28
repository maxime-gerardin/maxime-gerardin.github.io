const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

// --- À CONFIGURER ---
const ARTSTATION_USERNAME = "maximegerardin";
const ARTSTATION_FILTER_TAG = "side";

const OUTPUT_PATH = path.join(__dirname, "data", "artstation-projects.json");
// ---------------------

const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Navigateur persistant ---
// Toute la logique 403 vient du fait que Cloudflare ne se fie pas qu'aux
// cookies : il fingerprint aussi la couche TLS/HTTP2 du client. Le fetch()
// natif de Node a une signature différente de Chromium, donc même avec les
// bons cookies copiés, les requêtes Node se font recaler.
// Solution : on garde le navigateur ouvert et on fait TOUTES les requêtes
// JSON via page.evaluate(fetch(...)), donc avec la vraie stack réseau de
// Chromium (cookies gérés automatiquement, bon Referer/Origin, bon TLS).
let browser, context, page;

async function initBrowser() {
    console.log("Lancement de Chromium headless pour passer la protection Cloudflare...");
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext({
        userAgent: USER_AGENT,
        locale: "fr-FR",
        extraHTTPHeaders: {
            "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
        },
    });
    page = await context.newPage();

    await page.goto("https://www.artstation.com/", { waitUntil: "networkidle" });
    // Marge pour laisser un éventuel challenge JS se résoudre
    await page.waitForTimeout(3000);

    console.log("Session navigateur prête.");
}

async function closeBrowser() {
    if (browser) await browser.close();
}

// Exécute un fetch JSON depuis l'intérieur de la page (même fingerprint que
// le navigateur qui a résolu le challenge Cloudflare).
async function browserFetchJson(url) {
    return await page.evaluate(async (targetUrl) => {
        try {
            const res = await fetch(targetUrl, {
                headers: { "Accept": "application/json, text/plain, */*" },
                credentials: "include",
            });
            let json = null;
            try {
                json = await res.json();
            } catch (e) {
                /* pas du JSON valide */
            }
            return { ok: res.ok, status: res.status, json };
        } catch (err) {
            return { ok: false, status: 0, error: String(err) };
        }
    }, url);
}

async function fetchWithRetry(url, retries = 5, baseDelay = 2000) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        const result = await browserFetchJson(url);

        if (result.status !== 403 && result.status !== 429 && result.status !== 0) {
            return result;
        }

        if (attempt === retries) {
            return result;
        }

        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(
            `  ⏳ ${result.status} sur ${url} — retry dans ${delay}ms (essai ${attempt + 1}/${retries})`
        );
        await sleep(delay);

        // Si on se prend un 403, on re-visite la home pour rafraîchir la
        // session / relancer un éventuel challenge Cloudflare.
        if (result.status === 403) {
            try {
                await page.goto("https://www.artstation.com/", { waitUntil: "networkidle" });
                await page.waitForTimeout(1500);
            } catch (e) {
                // on retente quand même l'appel JSON après
            }
        }
    }
}

async function fetchArtstationVideoClip(embedHtml) {
    const match = embedHtml?.match(
        /video_clips\/([0-9a-f-]{36})\/embed\.html\?s=([^&'"]+)&t=([^&'"]+)/
    );
    if (!match) return null;
    const [, uuid, sToken, tToken] = match;
    const url = `https://www.artstation.com/api/v2/animation/video_clips/${uuid}.json?s=${sToken}&t=${tToken}`;
    try {
        const result = await fetchWithRetry(url);
        if (!result?.ok) return null;
        return result.json?.video_sources?.[0]?.video_url ?? null;
    } catch (err) {
        console.warn("Erreur video_clip:", err.message);
        return null;
    }
}

function loadExistingData() {
    try {
        const raw = fs.readFileSync(OUTPUT_PATH, "utf-8");
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return new Map();
        return new Map(parsed.map(p => [p.hashId, p]));
    } catch (err) {
        // Pas de fichier existant, ou fichier invalide : on repart de zéro
        return new Map();
    }
}

async function fetchAllProjectSummaries(username) {
    let pageNum = 1;
    let allProjects = [];

    while (true) {
        const result = await fetchWithRetry(
            `https://www.artstation.com/users/${username}/projects.json?page=${pageNum}`
        );
        if (!result?.ok) {
            console.warn("Erreur récupération liste projets, page", pageNum, result?.status);
            // Échec réseau/Cloudflare, PAS "plus de projets" : on le signale
            // pour ne pas écraser le fichier existant avec une liste vide.
            return { projects: allProjects, failed: true };
        }
        const projects = result.json?.data ?? [];
        if (projects.length === 0) break;

        allProjects = allProjects.concat(projects);
        pageNum++;
        await sleep(800 + Math.random() * 700); // délai variable, moins robotique
    }

    return { projects: allProjects, failed: false };
}

async function fetchProjectDetails(summary) {
    const hashId = summary.hash_id;
    const result = await fetchWithRetry(`https://www.artstation.com/projects/${hashId}.json`);
    if (!result?.ok) throw new Error(`Projet ${hashId} introuvable (${result?.status})`);
    const data = result.json;

    const simplifiedAssets = [];

    for (const asset of data.assets ?? []) {
        if (asset.asset_type === "image" || asset.asset_type === "cover") {
            simplifiedAssets.push({
                type: asset.asset_type,
                url: asset.image_url,
                description: asset.title || null,
            });
            continue;
        }

        if (!asset.has_embedded_player) continue;

        if (asset.asset_type === "video_clip") {
            const videoUrl = await fetchArtstationVideoClip(asset.player_embedded);
            simplifiedAssets.push({
                type: "video",
                url: videoUrl,
                description: asset.title || null,
            });
        }
    }

    return {
        id: data.id,
        hashId: data.hash_id,
        name: data.title,
        description: data.description,
        tags: data.tags ?? [],
        coverUrl: summary.cover.small_square_url,
        publishedAt: data.published_at,
        url: `https://www.artstation.com/artwork/${data.hash_id}`,
        assets: simplifiedAssets,
        software: (data.software_items ?? []).map(s => ({
            name: s.name,
            iconUrl: s.icon_url,
        })),
    };
}

async function main() {
    await initBrowser();

    try {
        const existingByHashId = loadExistingData();

        console.log(`Récupération des projets de "${ARTSTATION_USERNAME}"...`);
        const { projects: summaries, failed: listFailed } = await fetchAllProjectSummaries(
            ARTSTATION_USERNAME
        );
        console.log(`${summaries.length} projets trouvés au total.`);

        if (listFailed && summaries.length === 0) {
            console.error(
                "Impossible de récupérer la liste des projets (erreur réseau/Cloudflare). " +
                "Fichier existant conservé tel quel, rien n'est écrasé."
            );
            return;
        }

        const selected = [];
        let anyDetailError = false;

        for (const summary of summaries) {
            try {
                const details = await fetchProjectDetails(summary);
                if (details.tags.includes(ARTSTATION_FILTER_TAG)) {
                    console.log(`  ✓ Sélectionné: ${details.name}`);
                    selected.push(details);
                }
            } catch (err) {
                anyDetailError = true;
                console.warn(`  ✗ Erreur sur ${summary.hash_id}:`, err.message);
                // On retombe sur l'ancienne version de ce projet si on l'a déjà,
                // plutôt que de le faire disparaître du JSON de sortie.
                const previous = existingByHashId.get(summary.hash_id);
                if (previous) {
                    console.warn(`    → réutilisation des données précédentes pour ${previous.name}`);
                    selected.push(previous);
                }
            }
            await sleep(800 + Math.random() * 700);
        }

        // Si la liste de projets est incomplète (échec en cours de route) OU si
        // aucun projet tagué n'a pu être récupéré alors qu'on en avait déjà
        // en mémoire, on n'écrase pas le fichier : mieux vaut garder l'ancien
        // résultat qu'un résultat vide/partiel.
        if (selected.length === 0 && existingByHashId.size > 0) {
            console.error(
                "Aucun projet valide récupéré cette fois-ci. Fichier existant conservé tel quel."
            );
            return;
        }

        fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(selected, null, 2), "utf-8");

        const status = listFailed || anyDetailError ? " (résultat partiel, voir avertissements ci-dessus)" : "";
        console.log(
            `\n${selected.length} projets tagués "${ARTSTATION_FILTER_TAG}" écrits dans ${OUTPUT_PATH}${status}`
        );
    } finally {
        await closeBrowser();
    }
}

main().catch(err => {
    console.error("Échec du script:", err);
    process.exit(1);
});