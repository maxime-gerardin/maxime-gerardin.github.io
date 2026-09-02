let allTags = []

function mergeAndSortByDate(configArray, artstationArray) {
  const merged = [
    ...configArray.map(item => ({ ...item, source: "config", date: new Date(item.year) })),
    ...artstationArray.map(item => ({ ...item, source: "artstation", date: new Date(item.publishedAt) })),
  ];

  merged.sort((a, b) => b.date - a.date);
  return merged.map(({ date, ...rest }) => rest);
}

function mergeByName(arrays) {
    const merged = [];

    arrays.forEach(arr => {
        arr.forEach(item => {
            const existing = merged.find(
                m => m.name.toLowerCase() === item.name.toLowerCase()
            );
            if (existing) {
                Object.assign(existing, item);
            } else {
                merged.push({ ...item }); 
            }
        });
    });

    return merged;
}

async function fillAllProjectsInfo()
{
        let configProjects = portfolioTemplate?.projects ?? []
        let allProjects = mergeAndSortByDate(configProjects, artstationProjects)
        
        let softwares = []
	
	let projectsNode = document.getElementById("projects-container");
        allProjects.forEach(project => {
        const projectTemplate = document.getElementById("project-template");
        let projectClone = projectTemplate.content.cloneNode(true);
        let projectElm = projectClone.querySelector(".project")
        let projectLink = projectClone.querySelector(".project-link")
        let projectImg = projectClone.querySelector(".project-img")
        let projectTitle = projectClone.querySelector(".project-title")
	
	projectTitle.innerHTML = project.name
	
	if(project.source === "config")
	{
	  projectElm.dataset.category = project.client ? "work" : "personal"
	  projectElm.dataset.softwares = project.software.map(s => s.toLowerCase()).join(",")
          projectLink.href = `./project.html#${slugify(cleanProjectName(project))}`
          projectImg.src = project.imgMiniThumbnail
          projectImg.alt = `${cleanProjectName(project)} thumbnail`
	}
	else if (project.source === "artstation")
	{
	  softwares.push(project.software)
	  projectElm.dataset.category = "personal"
	  projectElm.dataset.softwares = project.software.map(s => s.name.toLowerCase()).join(",")
          projectLink.href = `./project.html#${slugify(project.name)}`
          projectImg.src = project.coverUrl
          projectImg.alt = `${project.name} thumbnail`
	}
        
        projectsNode.appendChild(projectClone)
    })
    
    allTags = mergeByName(softwares)
    filterProjects("all", true)
}

// =====================================================================
// =====================================================================

function addTag(tag)
{
  let container = document.getElementById("projects-tags-container")
  let taglElm = createSoftwareTag(tag, null, allTags)
  taglElm.addEventListener("click", () => {
    taglElm.remove()
    const activeCategory = document.querySelector(".projects-category.active").dataset.category;
    const url = new URL(window.location.href);
    const params = url.searchParams;
    const tags = params.getAll("tag").filter(t => t.toLowerCase() !== tag);
    params.delete("tag");
    tags.forEach(t => params.append("tag", t));
    window.history.replaceState({}, "", url.toString());
    filterProjects(activeCategory)
  })
  container.appendChild(taglElm)
  container.style.display = "flex"
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

async function filterProjects(selectedCategory, first = false) {
    const projects = Array.from(document.querySelectorAll(".project"));
    let currentProjects = projects.filter(proj =>
        proj.classList.contains("visible")
    );

    if(first) {
      currentProjects = projects
    }

    // handle URL tags
    const params = new URLSearchParams(window.location.search);
    const tags = params.getAll("tag");
    let projectsTagsContainer = document.getElementById("projects-tags-container")
    projectsTagsContainer.replaceChildren()
    projectsTagsContainer.style.display = tags.length == 0 ? "none" : "flex"
    tags.forEach(t => addTag(t))

    const projectsToShow = projects.filter(proj => 
      ((selectedCategory === "all" || proj.dataset.category === selectedCategory) && 
      (tags.length === 0 || tags.some(tag => proj.dataset.softwares.split(",").includes(tag))))
    );
    
    if(!first && projectsToShow.length === currentProjects.length && 
                 projectsToShow.every((v, i) => v === currentProjects[i]))
    {
      return
    }
    
    if (!first)
    {
      await hideProjects(currentProjects);
      await Promise.all(currentProjects.map(waitForTransition));
    }
    currentProjects.forEach(proj => {proj.style.display = "none";});

    projectsToShow.forEach(proj => {
        proj.style.display = "block";
        proj.offsetHeight;
        proj.classList.add("visible");
    });

    document.getElementById("no-projects-text").style.display = projectsToShow.length > 0 ? "none" : "block"
}

// =====================================================================
// =====================================================================

function setUpCategories()
{
  const categories = document.querySelectorAll(".projects-category");
  const activeBar = document.querySelector(".active-bar");

  const first = categories[0];
  const rect = first.getBoundingClientRect();
  const containerRect = first.parentElement.getBoundingClientRect();
  activeBar.style.left = (rect.left - containerRect.left) + "px";
  activeBar.style.width = rect.width + "px";

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
  setUpCategories()

  await loadArtstationProjects();
  
  localStorage.setItem("lastPage", window.location.origin + window.location.pathname);

  applyConfigStyles()
  
  await fillAllProjectsInfo()

  await displayPage()
}

main()
