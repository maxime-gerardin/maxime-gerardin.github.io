const PortfolioMenu = () => ([
  {
      text: "Home",
      url: "index.html",
      home: true,
  },
  {
      text: "About",
      url: "about.html"
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

function filename(path)
{
  const fileNameWithExt = path.split('/').pop();
  return fileNameWithExt.split('.').slice(0, -1).join('.');
}

function cleanProjectName(project)
{
  return project.name.replaceAll("<br>", "")
}