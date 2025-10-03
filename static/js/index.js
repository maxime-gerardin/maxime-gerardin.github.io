const style = getComputedStyle(document.documentElement);

let visibles = new Set();
let ticking = false;
let observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            visibles.add(entry.target);
        } else {
            visibles.delete(entry.target);
        }
    });
}, { threshold: 0.5 });

// =====================================================================
// =====================================================================

function highlightProject() {
    let center = window.innerHeight / 2;
    let closest = null;
    let closestDistance = Infinity;
    let projectBrightness = style.getPropertyValue('--project-brightness')

    visibles.forEach(card => {
        let rect = card.getBoundingClientRect();
        let cardCenter = rect.top + rect.height / 2;
        let distance = Math.abs(center - cardCenter);
        if (distance < closestDistance) {
            closestDistance = distance;
            closest = card;
        }
    });

    document.querySelectorAll(".portfolio-project").forEach(c => {
        c.querySelectorAll(".project-text").forEach(v => {
            v.classList.replace("opaque", "transparent");
        });
        c.style.filter = `brightness(${projectBrightness})`
    });

    if (closest) {
        closest.style.filter = "brightness(1)";
        closest.querySelectorAll(".project-text").forEach(v => {
            v.classList.replace("transparent", "opaque");
        });
    }

    ticking = false;
}

// =====================================================================
// =====================================================================

window.addEventListener("scroll", () => {
    if (!ticking) {
        console.log('scroll')
        requestAnimationFrame(highlightProject);
        ticking = true;
    }
});

// =====================================================================
// =====================================================================

function fillAbout()
{
    if("info" in portfolioTemplate) {
        let portfolioName = document.getElementById("portfolio-name");
        let portfolioDescription = document.getElementById("portfolio-description");

        portfolioName.innerText = portfolioTemplate.info.fullName
        portfolioDescription.innerText = portfolioTemplate.info.personalDescription
    }
    if("socials" in portfolioTemplate) {
        let portfolioSocials = document.getElementById("portfolio-socials");
        portfolioTemplate.socials.forEach(social => {
            const socialTemplate = document.getElementById("portfolio-social-template");
            let socialClone = socialTemplate.content.cloneNode(true);
            let socialIcon = socialClone.querySelector(".portfolio-social-icon")
            let socialLink = socialClone.querySelector(".portfolio-social-link")
            socialLink.href = social.url
            socialIcon.src = social.icon
            portfolioSocials.appendChild(socialClone)
        })
    }
}

// =====================================================================
// =====================================================================

function fillProjects ()
{
    if("projects" in portfolioTemplate) {
        let projectsNode = document.getElementById("projects");
        portfolioTemplate.projects.forEach(project => {
            const projectTemplate = document.getElementById("portfolio-project-template");
            let projectClone = projectTemplate.content.cloneNode(true);
            let projectElement = projectClone.querySelector(".portfolio-project")
            let projectLink = projectClone.querySelector(".portfolio-project-link")
            let projectThumbnail = projectClone.querySelector(".portfolio-project-thumbnail")
            let projectTitle = projectClone.querySelector(".project-title")
            let projectTag = projectClone.querySelector(".project-tag")

            projectLink.href = `./project.html#${slugify(project.name)}`
            projectThumbnail.src = project.videoThumbnail
            projectTitle.innerText = project.name
            projectTag.innerText = project.tags?.[0]
            observer.observe(projectElement);
            projectsNode.appendChild(projectClone)
        })
    }
}

// =====================================================================
// =====================================================================

function fillPortfolioInfo() {
    fillAbout()
    fillProjects()
}

// =====================================================================
// =====================================================================

async function main() {

    fillHeader()

    fillPortfolioInfo()

    fillFooter()

    applyConfigStyles()

    await displayPage(() => {
        document.getElementById("portfolio-about-container").classList.replace("transparent", "opaque");
        document.getElementById("projects-container").querySelectorAll(".portfolio-project")
                                                              .forEach((project) => {
            project.classList.add("scaled");
        })
    })
}

main()
