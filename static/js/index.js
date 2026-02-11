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
        let portfolioBgVideoElm = document.getElementById("portfolio-video-background");

        portfolioName.innerText = portfolioTemplate.info.fullName
        portfolioDescription.innerText = portfolioTemplate.info.personalDescription
        setVideoUrl(portfolioBgVideoElm, portfolioTemplate.info.backgroundVideo);
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
            if (!project.main) {
                return
            }
            const projectTemplate = document.getElementById("portfolio-project-template");
            let projectClone = projectTemplate.content.cloneNode(true);
            let projectElement = projectClone.querySelector(".portfolio-project")
            let projectLink = projectClone.querySelector(".portfolio-project-link")
            let projectThumbnail = projectClone.querySelector(".portfolio-project-thumbnail")
            let projectTitle = projectClone.querySelector(".project-title")
            let projectYear = projectClone.querySelector(".project-year")
            let projectTag = projectClone.querySelector(".project-tag")

            projectLink.href = `./project.html#${slugify(project.name)}`
            setVideoUrl(projectThumbnail, project.videoThumbnail)
            projectTitle.innerText = project.name
            projectYear.innerText = project.year
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

(() => {
    const fade = document.getElementById("black-fade");

    window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    const fadeHeight = window.innerHeight * 0.6;
    let progress = scrollY / fadeHeight;
    progress = Math.pow(Math.min(Math.max(progress, 0), 1), 2);
    fade.style.backgroundColor = `rgba(0, 0, 0, ${progress})`;
    });
})();


// =====================================================================
// =====================================================================

async function main() {

    localStorage.setItem("lastPage", window.location.href);

    fillPortfolioInfo()

    await displayPage(() => {
        document.getElementById("portfolio-about-container").classList.replace("transparent", "opaque");
        document.getElementById("projects-container").querySelectorAll(".portfolio-project")
                                                              .forEach((project) => {
            project.classList.add("scaled");
        })
    })
}

main()
