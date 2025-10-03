function setLoadingIcon() {
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

function applyConfigStyles(document)
{
    applyConfigFonts(document)
}

// =====================================================================
// =====================================================================

function fillHeader()
{
    let portfolioLogo = document.getElementById("portfolio-logo");
    if("info" in portfolioTemplate) {
        portfolioLogo.src = portfolioTemplate.info.logo;
        portfolioLogo.alt = portfolioTemplate.info.logoAlt;
        document.querySelector("link[rel~='icon']").href = portfolioTemplate.info.logo
        document.querySelector("title").innerText = portfolioTemplate.info.fullName;
        if (portfolioTemplate.info.logoCircle) {
            portfolioLogo.style.borderRadius = "50%";
        }
    }
}

// =====================================================================
// =====================================================================

function fillFooterSection(sectionID, templateObj){
    let footerSectionContact = document.getElementById(sectionID)
    if (hasNonEmptyString(templateObj))
    {
        templateObj.forEach(obj => {
            if (hasNonEmptyString(obj)) {
                let footerItemTemplate
                let footerItemClone
                if(obj.url !== "") {
                    footerItemTemplate = document.getElementById("footer-section-item-link-template");
                    footerItemClone = footerItemTemplate.content.cloneNode(true);
                    let footerItemLink = footerItemClone.querySelector(".footer-section-item-link")
                    footerItemLink.href = obj.url
                }
                else {
                    footerItemTemplate = document.getElementById("footer-section-item-template");
                    footerItemClone = footerItemTemplate.content.cloneNode(true);
                }
                let footerItemIcon = footerItemClone.querySelector(".footer-section-item-icon")
                let footerItemText = footerItemClone.querySelector(".footer-section-item-text")
                footerItemIcon.src = obj.icon
                footerItemText.innerText = obj.text
                footerSectionContact.querySelector(".footer-section-list").appendChild(footerItemClone)
            }
        })
    }
    else {
        footerSectionContact.style.display = "none";
    }
}

// =====================================================================
// =====================================================================

function fillFooter() {

    if("footer" in portfolioTemplate) {
        let footerName = document.getElementById("footer-portfolio-name");
        let footerCopyName = document.getElementById("portfolio-copy-footer-name");
        let footerCopyYear = document.getElementById("portfolio-copy-year-footer");
        footerName.innerText = portfolioTemplate.info.fullName
        footerCopyName.innerText = ` ${portfolioTemplate.info.fullName}`
        footerCopyYear.textContent = new Date().getFullYear().toString()

        fillFooterSection("footer-section-contact", portfolioTemplate.footer.contact)
        fillFooterSection("footer-section-socials", portfolioTemplate.socials)
    }
}

// =====================================================================
// =====================================================================

function displayPage(callback) {
    
    if(portfolioTemplate.info.logoCircle) {
        document.getElementById("loading-img").classList.add("circle")
    }

    setTimeout(() => {
        document.getElementById("loading-container").style.display = "none";

        document.getElementById("page-container").classList.remove("transparent", "hidden");

        if(callback) {
            callback()
        }

        document.getElementById("portfolio-logo").classList.add("scaled");
    }, 300);
}

setLoadingIcon()