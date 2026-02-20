function goToHome() {
    window.location.href = "index.html";
}

// =====================================================================
// =====================================================================

function getProjectByHash() {
    const hash = window.location.hash;
    if (hash === "") {
        goToHome()
    }
    else {
        const projectCode = window.location.hash.substring(1);
        const foundProject = portfolioTemplate.projects.find(
            project => slugify(project.name.replaceAll("<br>", "")) === projectCode
        );

        return foundProject || goToHome();
    }
}

// =====================================================================
// =====================================================================

function createProjectBoardRow(rowTitle, rowValue, optionClasses = [])
{
    if(rowValue)
    {
        let projectBoard = document.getElementById("project-board");
        const projectRowTemplate = document.getElementById("project-board-row-template");
        let projectRowClone = projectRowTemplate.content.cloneNode(true);
        let projectTitleNode = projectRowClone.querySelector(".project-board-row-title")
        let projectRowValue = projectRowClone.querySelector(".project-board-row-value")
        projectRowValue.classList.add(...optionClasses)
        projectTitleNode.innerText = rowTitle

        if(typeof rowValue === "string")
        {
            projectRowValue.innerHTML = rowValue
        }
        else {
            projectRowValue.appendChild(rowValue)
        }

        projectBoard.appendChild(projectRowClone)
    }
}

// =====================================================================
// =====================================================================

function createProjectLinksContainerHTML(project) {

    if (project.links)
    {
        let projectLinksContainer = document.createElement("div");
        projectLinksContainer.classList.add("project-links-container");
        project.links.forEach(link => {
            let projectLink = document.createElement("a")
            let linkArrowIcon = document.createElement("img")
            linkArrowIcon.classList.add("project-link-icon")
            linkArrowIcon.src = "./static/assets/icons/link-arrow.svg"
            projectLink.href = link.url;
            projectLink.innerText = `${link.text}`;
            projectLink.classList.add("project-link");
            projectLink.append(linkArrowIcon)
            projectLinksContainer.append(projectLink);
        })

        return project.links.length === 0 ? null : projectLinksContainer
    }

    return null
}

// =====================================================================
// =====================================================================

function createProjectSoftwareContainerHTML(project) {

    if (project.software)
    {
        let projectSoftwareContainer = document.createElement("div");
        projectSoftwareContainer.classList.add("project-links-container");
        project.software.forEach(software => {
            let projectSoftware = createSoftwareTag(software, `./projects.html?tag=${software.toLowerCase()}`)
            projectSoftwareContainer.append(projectSoftware);
        })

        return project.software.length === 0 ? null : projectSoftwareContainer
    }

    return null
}

// =====================================================================
// =====================================================================

function createProjectDescriptionHTML(project)
{
    if (project.description) 
    {
        let descriptionContainer = document.createElement("div")
        descriptionContainer.id = "project-description"
        let descriptionText = document.createElement("span");
        descriptionText.innerHTML = project.description
        descriptionText.id = "project-description-text"
        let showMoreButton = document.createElement("div");
        showMoreButton.id = "show-more-btn";
        showMoreButton.innerHTML = "Show more"
        
        descriptionContainer.append(descriptionText)
        descriptionContainer.append(showMoreButton)

        return project.description.length === 0 ? null : descriptionContainer
    }
    return null
}

// =====================================================================
// =====================================================================

function createMediasGridLayout(project, projectMedias)
{
    const mediasByGridLine = project.medias.reduce((acc, item) => {
        if (item.gridLine !== undefined) {
            const key = item.gridLine;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(item);
        } else {
            const existingKeys = Object.keys(acc).map(Number);
            const nextKey = existingKeys.length > 0 ? Math.max(...existingKeys) + 1 : 1;
            acc[nextKey] = [item];
        }
        return acc;
    }, {}); // Group medias by gridLine

    const maxElements = Math.max(...Object.values(mediasByGridLine).map(arr => arr.length));

    // Create medias elements and apply grid layout
    Object.entries(mediasByGridLine).forEach(([gridLine, medias]) => {
        let projectMediaRow = document.createElement("div");
        projectMediaRow.classList.add('project-medias-row');
        projectMediaRow.style.gridTemplateColumns = `repeat(${medias.length}, 1fr)`;

        medias.forEach(media => {
            let projectMediaTemplateID = media.type === "video" ? "project-video-media-template" : "project-img-media-template";
            let projectMediaClone = document.getElementById(projectMediaTemplateID).content.cloneNode(true);
            let projectMedia = projectMediaClone.querySelector(".project-media")
            if (media.useAutoWidth === true) {
                projectMedia.style.width = "auto"
            }
            projectMedia.src = media.src
            showOrHide(media, "text", projectMediaClone.querySelector(".project-media-text"))

            if (media.type === "video") {
                projectMedia.controls = media.controls ?? false
                projectMedia.load()
                projectMedia.onloadeddata = () => {
                    projectMedia.play().catch();
                };
            }
            projectMediaRow.appendChild(projectMediaClone)
        })
        projectMedias.appendChild(projectMediaRow)
    })
}

// =====================================================================
// =====================================================================

function handleDescriptionSize(first = false)
{
    const text = document.getElementById("project-description-text");
    const btn = document.getElementById("show-more-btn");
    let showMoreStr = "Show more"
    let showLessStr = "Show less"

    const wasExpanded = text.classList.contains("expanded");
    text.classList.remove("expanded");
    const needsButton = text.scrollHeight > text.clientHeight + 1;
    if (wasExpanded) text.classList.add("expanded");
    
    if (!needsButton)
    {
        text.classList.remove("expanded");
        btn.style.display = "none";
        btn.textContent = showMoreStr;
    }
    else
    {
        btn.style.display = "block";
        btn.textContent = text.classList.contains("expanded") ? showLessStr : showMoreStr;
    }

    if(first === true)
    {
        btn.addEventListener("click", () => {
            text.classList.toggle("expanded");
            btn.textContent = text.classList.contains("expanded") ? showLessStr : showMoreStr;
        });
    }
}

// =====================================================================
// =====================================================================

function fillProjectInfo() {
    let project = getProjectByHash()

    if("projects" in portfolioTemplate) {
        let projectTitleNode = document.getElementById("project-title");
        projectTitleNode.innerHTML = project.name;
        let projectThumbnailNodeImg = document.getElementById("project-thumbnail-img");
        let projectThumbnailNode = document.getElementById("project-thumbnail");
        if (project.imgThumbnail) {
            projectThumbnailNode.remove()
            projectThumbnailNodeImg.src = project.imgThumbnail;
        }
        else {
            projectThumbnailNodeImg.remove()
            setVideoUrl(projectThumbnailNode, project.videoThumbnail)
        }
        if (project.client) {
            createProjectBoardRow("Client", project.client)
        }
        else {
            createProjectBoardRow("Client", "Personnal project")
        }
        createProjectBoardRow("Tags", project.tags.join(", "))
        createProjectBoardRow("Year", project.year)
        createProjectBoardRow("About", createProjectDescriptionHTML(project))
        createProjectBoardRow("Software", createProjectSoftwareContainerHTML(project))
        createProjectBoardRow("Links", createProjectLinksContainerHTML(project))

        let projectMedias = document.getElementById("project-medias");
        if(project.medias.length !== 0)
        {
            createMediasGridLayout(project, projectMedias)
        }
        else 
        {
            projectMedias.style.display = "none"
        }

        handleDescriptionSize(true)
        window.addEventListener("resize", handleDescriptionSize);
    }
}

// =====================================================================
// =====================================================================

function setBackButton() {
    document.getElementById("back-button").onclick = () => {
        let lastPage = localStorage.getItem("lastPage")
        if (lastPage)
        {
            window.location.href = lastPage
            return
        }
        goToHome()
    };
}

// =====================================================================
// =====================================================================

async function main()
{   
    applyConfigStyles()

    setBackButton()

    fillProjectInfo()

    await displayPage()
}

main()