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
            project => slugify(project.name) === projectCode
        );

        return foundProject || goToHome();
    }
}

// =====================================================================
// =====================================================================

function createProjectBoardRow(rowTitle, rowValue)
{
    if(rowValue)
    {
        let projectBoard = document.getElementById("project-board");
        const projectRowTemplate = document.getElementById("project-board-row-template");
        let projectRowClone = projectRowTemplate.content.cloneNode(true);
        let projectTitleNode = projectRowClone.querySelector(".project-board-row-title")
        let projectTitleValue = projectRowClone.querySelector(".project-board-row-value")
        projectTitleNode.innerText = rowTitle
        projectTitleValue.innerHTML = rowValue
        projectBoard.appendChild(projectRowClone)
    }
}

// =====================================================================
// =====================================================================

function createProjectLinksContainerHTML(project) {

    let projectLinksContainer = document.createElement("div");
    projectLinksContainer.classList.add("project-links-container");
    project.links.forEach(link => {
        let projectLink = document.createElement("a")
        projectLink.href = link.url;
        projectLink.innerText = `${link.text} ↗`;
        projectLink.classList.add("project-link");
        projectLinksContainer.append(projectLink);
    })

    return project.links.length === 0 ? "" : projectLinksContainer.outerHTML
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
    projectMedias.style.gridTemplateColumns = `repeat(${maxElements}, 1fr)`;
    console.log(mediasByGridLine);
    Object.entries(mediasByGridLine).forEach(([gridLine, medias]) => {
        let projectMediaRow = document.createElement("div");
        projectMediaRow.classList.add('project-medias-row');
        projectMediaRow.style.gridTemplateColumns = `repeat(${medias.length}, 1fr)`;

        medias.forEach(media => {
            let projectMediaTemplateID = media.type === "video" ? "project-video-media-template" : "project-img-media-template";
            let projectMediaClone = document.getElementById(projectMediaTemplateID).content.cloneNode(true);
            let projectMedia = projectMediaClone.querySelector(".project-media")
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

function fillProjectInfo() {
    let project = getProjectByHash()

    if("projects" in portfolioTemplate) {
        let projectTitleNode = document.getElementById("project-title");
        let projectThumbnailNode = document.getElementById("project-thumbnail");
        projectTitleNode.innerHTML = project.name;
        setVideoUrl(projectThumbnailNode, project.videoThumbnail)
        if (project.client) {
            createProjectBoardRow("Client", project.client)
        }
        else {
            createProjectBoardRow("Client", "Personnal project")
        }
        createProjectBoardRow("Tags", project.tags.join(", "))
        createProjectBoardRow("Year", project.year)
        createProjectBoardRow("About", project.description)
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

        
    }
}

// =====================================================================
// =====================================================================

function setBackButton() {
    document.getElementById("back-button").onclick = () => {
        goToHome()
    };
}

// =====================================================================
// =====================================================================

async function main()
{
    setBackButton()

    fillHeader()

    fillProjectInfo()

    fillFooter()

    applyConfigStyles()

    await displayPage()
}

main()