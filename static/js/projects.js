function fillProjectsInfo()
{
  if("projects" in portfolioTemplate) {
    let projectsNode = document.getElementById("projects-container");
    portfolioTemplate.projects.forEach(project => {
        const projectTemplate = document.getElementById("project-template");
        let projectClone = projectTemplate.content.cloneNode(true);
        let projectElm = projectClone.querySelector(".project")
        let projectLink = projectClone.querySelector(".project-link")
        let projectImg = projectClone.querySelector(".project-img")
        let projectTitle = projectClone.querySelector(".project-title")

        projectElm.dataset.category = project.client ? "work" : "personal"
        projectLink.href = `./project.html#${slugify(project.name)}`
        projectTitle.innerText = project.name
        projectImg.src = project.imgMiniThumbnail
        projectsNode.appendChild(projectClone)
    })
  }
}

// =====================================================================
// =====================================================================

function waitForTransition(el) {
    return new Promise(resolve => {
        const onEnd = (e) => {
            if (e.propertyName === "opacity") {
                el.removeEventListener("transitionend", onEnd);
                resolve();
            }
        };
        el.addEventListener("transitionend", onEnd);
    });
}

// =====================================================================
// =====================================================================

function hideProjects(projects) {
    projects.forEach(proj => proj.classList.remove("visible"));
    return new Promise(resolve => requestAnimationFrame(resolve));
}

// =====================================================================
// =====================================================================

async function filterProjects(selectedCategory) {
    const projects = Array.from(document.querySelectorAll(".project"));
    const currentProjects = projects.filter(proj =>
        proj.classList.contains("visible")
    );
    const projectsToShow = projects.filter(proj =>
        selectedCategory === "all" || proj.dataset.category === selectedCategory
    );

    await hideProjects(currentProjects);
    await Promise.all(currentProjects.map(waitForTransition));
    currentProjects.forEach(proj => {proj.style.display = "none";});

    projectsToShow.forEach(proj => {
        proj.style.display = "block";
        proj.offsetHeight;
        proj.classList.add("visible");
    });
}

// =====================================================================
// =====================================================================

function setUpCategories()
{
  const categories = document.querySelectorAll(".projects-category");
  const activeBar = document.querySelector(".active-bar");

  window.addEventListener("DOMContentLoaded", () => {
    const first = categories[0];
    const rect = first.getBoundingClientRect();
    const containerRect = first.parentElement.getBoundingClientRect();
    activeBar.style.left = (rect.left - containerRect.left) + "px";
    activeBar.style.width = rect.width + "px";
  });

  categories.forEach(cat => {
    cat.addEventListener("click", () => {

      // Moving bar
      const rect = cat.getBoundingClientRect();
      const containerRect = cat.parentElement.getBoundingClientRect();
      const left = rect.left - containerRect.left;
      const width = rect.width;
      activeBar.style.left = left + "px";
      activeBar.style.width = width + "px";

      const selected = cat.dataset.category;
      const activeClass = "active"
      if(cat.classList.contains(activeClass))
      {
        return
      }
      document.querySelectorAll(".projects-category").forEach(c => c.classList.remove(activeClass));
      cat.classList.add(activeClass)
      filterProjects(selected);
    });
  });
}


async function main()
{
    localStorage.setItem("lastPage", window.location.href);

    fillProjectsInfo()

    setUpCategories()

    await displayPage(() => {
      document.getElementById("projects-container").querySelectorAll(".project")
                                                   .forEach((project) => {
          project.classList.add("visible");
      })
  })
}

main()