const fs = require("fs");
const path = require("path");

// --- À CONFIGURER ---
const ARTSTATION_USERNAME = "maximegerardin";
const ARTSTATION_FILTER_TAG = "side";

const OUTPUT_PATH = path.join(__dirname, "data", "artstation-projects.json");
// ---------------------

const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    "Referer": "https://www.artstation.com/",
};

// Petite pause entre les requêtes pour éviter de se faire bloquer par
// le anti-bot d'ArtStation (Cloudflare) quand on enchaîne beaucoup d'appels.
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Node ne gère pas les cookies automatiquement comme un navigateur.
// On récupère les cookies de session sur la page d'accueil une première fois,
// puis on les renvoie sur toutes les requêtes suivantes — ça évite d'être
// traité comme un bot "anonyme" par Cloudflare sur chaque appel.
async function warmUpSession() {
    const res = await fetch("https://www.artstation.com/", { headers: HEADERS });
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
        // On ne garde que les paires nom=valeur, sans les attributs (Path, Expires...)
        HEADERS["Cookie"] = setCookie
            .split(/,(?=[^;]+=[^;]+;? )/) // sépare les multiples cookies renvoyés
            .map(c => c.split(";")[0])
            .join("; ");
    }
}

// Requête avec retry + backoff exponentiel en cas de blocage anti-bot (403/429).
async function fetchWithRetry(url, retries = 5, baseDelay = 2000) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        const res = await fetch(url, { headers: HEADERS });

        if (res.status !== 403 && res.status !== 429) {
            return res;
        }

        if (attempt === retries) {
            return res; // tentatives épuisées, on laisse l'appelant gérer l'échec
        }

        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`  ⏳ ${res.status} sur ${url} — retry dans ${delay}ms (essai ${attempt + 1}/${retries})`);
        await sleep(delay);
    }
}

function extractIframeSrc(embedHtml) {
    if (!embedHtml) return null;
    const match = embedHtml.match(/src=["']([^"']+)["']/);
    return match ? match[1] : null;
}

async function fetchArtstationVideoClip(embedHtml) {
    const match = embedHtml?.match(
        /video_clips\/([0-9a-f-]{36})\/embed\.html\?s=([^&'"]+)&t=([^&'"]+)/
    );
    if (!match) return null;
    const [, uuid, sToken, tToken] = match;
    const url = `https://www.artstation.com/api/v2/animation/video_clips/${uuid}.json?s=${sToken}&t=${tToken}`;
    try {
        const res = await fetchWithRetry(url);
        if (!res.ok) return null;
        const data = await res.json();
        return data?.video_sources?.[0]?.video_url ?? null;
    } catch (err) {
        console.warn("Erreur video_clip:", err.message);
        return null;
    }
}

async function fetchAllProjectSummaries(username) {
    let page = 1;
    let allProjects = [];

    while (true) {
        const res = await fetchWithRetry(
            `https://www.artstation.com/users/${username}/projects.json?page=${page}`
        );
        if (!res.ok) {
            console.warn("Erreur récupération liste projets, page", page, res.status);
            break;
        }
        const data = await res.json();
        const projects = data.data ?? [];
        if (projects.length === 0) break;

        allProjects = allProjects.concat(projects);
        page++;
        await sleep(500);
    }

    return allProjects;
}

async function fetchProjectDetails(summary) {
    const hashId = summary.hash_id
    const res = await fetchWithRetry(`https://www.artstation.com/projects/${hashId}.json`);
    if (!res.ok) throw new Error(`Projet ${hashId} introuvable (${res.status})`);
    const data = await res.json();

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
        }))
    };
}

async function main() {
    console.log("Initialisation de la session (récupération des cookies)...");
    await warmUpSession();

    console.log(`Récupération des projets de "${ARTSTATION_USERNAME}"...`);
    const summaries = await fetchAllProjectSummaries(ARTSTATION_USERNAME);
    console.log(`${summaries.length} projets trouvés au total.`);

    const selected = [];

    for (const summary of summaries) {
        try {
            const details = await fetchProjectDetails(summary);
            if (details.tags.includes(ARTSTATION_FILTER_TAG)) {
                console.log(`  ✓ Sélectionné: ${details.name}`);
                selected.push(details);
            }
        } catch (err) {
            console.warn(`  ✗ Erreur sur ${summary.hash_id}:`, err.message);
        }
        await sleep(250); // évite d'enchaîner les requêtes trop vite
    }

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(selected, null, 2), "utf-8");

    console.log(`\n${selected.length} projets tagués "${ARTSTATION_FILTER_TAG}" écrits dans ${OUTPUT_PATH}`);
}

main().catch(err => {
    console.error("Échec du script:", err);
    process.exit(1);
});
