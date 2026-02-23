const PortfolioMenu = () => ([
    {
        text: "Home",
        url: "index.html",
        home: true,
    },
    {
        text: "Projects",
        url: "projects.html"
    },
    {
        text: "Contact",
        url: "contact.html"
    }
]);

function setLoadingIcon() {
    if(portfolioTemplate.info.logoCircle) {
        document.getElementById("loading-img").classList.add("circle")
    }
    document.getElementById("loading-img").src = portfolioTemplate.info.logo;
}

// =====================================================================
// =====================================================================

function loadFonts(...fonts) {
    const display = 'swap';

    const families = fonts.map(font => {
        if (typeof font === 'object' && font.name) {
            const name = font.name.replace(/ /g, '+');
            return font.weights
                ? `${name}:wght@${font.weights}`
                : name;
        }
        return font.replace(/ /g, '+');
    }).join('&family=');

    const url = `https://fonts.googleapis.com/css2?family=${families}&display=${display}`;
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = url;
    document.head.appendChild(link);
}

// =====================================================================
// =====================================================================

function slugify(text) {
    return text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// =====================================================================
// =====================================================================

function hasNonEmptyString(configObj) {
    return Object.values(configObj).some(value => {
        if (typeof value === "string") return value.trim() !== "";
        if (typeof value === "object" && value !== null) return hasNonEmptyString(value);
        return false;
    });
}

// =====================================================================
// =====================================================================

function showOrHide(obj, key, element) {
    const value = obj?.[key];
    if (value === null || value === undefined || value === "") {
      element.style.display = "none";
    } else {
      element.innerText = value;
    }
  }

// =====================================================================
// =====================================================================

function createSoftwareTag(software, link = null)
{
    let tagElm = document.createElement("div")
    let softwareKey = Object.keys(portfolioTemplate.softwares).find(k => k.toLowerCase() === software.toLowerCase());
    if (softwareKey !== undefined)
    {
        let tagIcon = document.createElement("img")
        tagIcon.classList.add("project-software-icon")
        tagIcon.src = `./static/assets/icons/software/${portfolioTemplate.softwares[softwareKey]}`
        tagElm.append(tagIcon)
    } 
    else {
        softwareKey = software
    }
    tagElm.insertAdjacentText("beforeend", softwareKey);
    tagElm.classList.add("project-software")
    if (link)
    {
        let linkElm = document.createElement("a")
        linkElm.href = link
        linkElm.appendChild(tagElm)
        return linkElm
    }
    return tagElm
}

// =====================================================================
// =====================================================================

function applyConfigFonts()
{
    loadFonts(styleConfig.portfolioFont, styleConfig.fullNameFont);
    document.querySelectorAll(".full-name").forEach(el => {
        el.style.fontFamily = styleConfig.fullNameFont.name;
        el.style.fontWeight = styleConfig.fullNameFont?.useWeight ?? 'normal';
    })
    document.body.style.fontFamily = styleConfig.portfolioFont.name;
    document.body.style.fontWeight = styleConfig.portfolioFont?.useWeight ?? 'normal';
}

// =====================================================================
// =====================================================================

function applyProjectStyle()
{
    if(styleConfig.projectDescriptionMaxLine)
    {
        document.documentElement.style.setProperty('--project-description-max-line', styleConfig.projectDescriptionMaxLine);
    }
}

// =====================================================================
// =====================================================================

function applyConfigStyles()
{
    applyConfigFonts()
    applyProjectStyle()
}

// =====================================================================
// =====================================================================

function setVideoUrl(videoElm, url)
{
    videoElm.src = url
    videoElm.load()
    videoElm.onloadeddata = () => {
        videoElm.play().catch();
    };
}

// =====================================================================
// =====================================================================

async function waitForAllMedia(timeout = 10000) {
    const allMedia = Array.from(document.querySelectorAll('img, video'));
    const media = allMedia.filter(el => !el.classList.contains("no-wait"));

    const mediaPromises = media.map(m => new Promise(resolve => {
        if (m.tagName === 'IMG') {
            if (m.complete && m.naturalWidth !== 0) return resolve('loaded');
            m.onload = () => resolve('loaded');
            m.onerror = () => resolve('error');
        } else if (m.tagName === 'VIDEO') {
            if (m.readyState >= 3) return resolve('loaded');
            m.onloadeddata = () => resolve('loaded');
            m.onerror = () => resolve('error');
        }
    }));

    const timeoutPromise = new Promise(resolve => {
        setTimeout(() => resolve('timeout'), timeout);
    });

    const result = await Promise.race([
        Promise.all(mediaPromises),
        timeoutPromise
    ]);

    if (result === 'timeout' || (Array.isArray(result) && result.some(r => r !== 'loaded'))) {
        alert("Warning: Some media could not be fully loaded yet.");
    }
}

// =====================================================================
// =====================================================================

async function displayPage(callback) {

    await waitForAllMedia()

    setTimeout(() => {

        document.getElementById("loading-container").style.display = "none";
        document.getElementById("page-container").classList.remove("transparent", "hidden");

        document.getElementById("portfolio-logo").classList.add("scaled");
        if(callback) {
            callback()
        }
    }, 150);
}

setLoadingIcon()
