const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

// --- À CONFIGURER ---
const ARTSTATION_USERNAME = "maximegerardin";
const ARTSTATION_FILTER_TAG = "side";

const OUTPUT_PATH = path.join(__dirname, "data", "artstation-projects.json");
const CACHE_PATH = path.join(__dirname, "data", "artstation-cache.json");
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

// Visite la home ArtStation sans attendre "networkidle" (qui n'arrive jamais
// sur ce site). On attend juste le DOM, puis une marge pour laisser un éventuel
// challenge Cloudflare se résoudre. Un timeout de navigation n'est pas fatal :
// les cookies sont souvent déjà posés, on continue.
async function visitHome(extraWaitMs = 5000) {
    try {
        await page.goto("https://www.artstation.com/", {
            waitUntil: "domcontentloaded",
            timeout: 60000,
        });
    } catch (err) {
        console.warn("  ⚠ Navigation vers la home lente/échouée :", err.message.split("\n")[0]);
    }
    await page.waitForTimeout(extraWaitMs);
}

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

    await visitHome(5000);

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
            await visitHome(2000);
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

function loadCache() {
    try {
        const parsed = JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (err) {
        return {};
    }
}

// "Version" d'un projet d'après la liste : sert à savoir s'il a changé.
// Si aucun champ de date n'est présent, on renvoie null => on refait toujours
// l'appel de détail (comportement sûr).
function projectVersion(summary) {
    return summary.updated_at ?? summary.published_at ?? null;
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
        const oldCache = loadCache();
        const newCache = {};

        console.log(`Récupération des projets de "${ARTSTATION_USERNAME}"...`);
        const { projects: summaries, failed: listFailed } = await fetchAllProjectSummaries(
            ARTSTATION_USERNAME
        );
        console.log(`${summaries.length} projets trouvés au total.`);

        if (listFailed) {
            console.error(
                "Liste des projets incomplète ou inaccessible (erreur réseau/Cloudflare). " +
                "Fichiers existants conservés tels quels, rien n'est écrasé."
            );
            return;
        }

        const selected = [];
        let anyDetailError = false;
        let fetchedCount = 0;
        let reusedCount = 0;

        for (const summary of summaries) {
            const hashId = summary.hash_id;
            const version = projectVersion(summary);
            const cached = oldCache[hashId];
            const previous = existingByHashId.get(hashId);

            // Projet inchangé depuis le dernier run : pas d'appel de détail.
            const unchanged = cached && version !== null && cached.version === version;
            if (unchanged && !cached.hasTag) {
                newCache[hashId] = cached;
                reusedCount++;
                continue;
            }
            if (unchanged && cached.hasTag && previous) {
                newCache[hashId] = cached;
                selected.push(previous);
                reusedCount++;
                continue;
            }

            try {
                const details = await fetchProjectDetails(summary);
                fetchedCount++;
                const hasTag = details.tags.includes(ARTSTATION_FILTER_TAG);
                newCache[hashId] = { version, hasTag };
                if (hasTag) {
                    console.log(`  ✓ Sélectionné: ${details.name}`);
                    selected.push(details);
                }
            } catch (err) {
                anyDetailError = true;
                console.warn(`  ✗ Erreur sur ${hashId}:`, err.message);
                // On garde l'ancien cache et l'ancienne version du projet.
                if (cached) newCache[hashId] = cached;
                if (previous) {
                    console.warn(`    → réutilisation des données précédentes pour ${previous.name}`);
                    selected.push(previous);
                }
            }
            await sleep(800 + Math.random() * 700);
        }

        console.log(`Appels de détail : ${fetchedCount} — projets réutilisés depuis le cache : ${reusedCount}`);

        // Garde-fou : jamais d'écrasement par un résultat vide si on avait des données.
        if (selected.length === 0 && existingByHashId.size > 0) {
            console.error(
                "Aucun projet valide récupéré cette fois-ci. Fichiers existants conservés tels quels."
            );
            return;
        }

        fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(selected, null, 2), "utf-8");
        fs.writeFileSync(CACHE_PATH, JSON.stringify(newCache, null, 2), "utf-8");

        const status = anyDetailError ? " (résultat partiel, voir avertissements ci-dessus)" : "";
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