class PortfolioHeader extends HTMLElement {

  createMenu(container) {
    PortfolioMenu().forEach((menuItem) => {
      if (menuItem?.home !== true) {
        let menuLink = document.createElement("a");
        menuLink.classList.add("project-menu", "underline");
        menuLink.href = menuItem.url;
        menuLink.innerHTML = menuItem.text;
        container.appendChild(menuLink);
      }
    })
  }

  connectedCallback() {
    this.innerHTML = `
      <div id="portfolio-header">
        <a id="logo-link" href="index.html">
            <img id="portfolio-logo" src="" alt="">
        </a>
        <div id="header-menu"></div>
      </div>`;

      this.createMenu(document.getElementById("header-menu"))

      let portfolioLogo = document.getElementById("portfolio-logo");
      if("info" in portfolioTemplate) {
        if (portfolioTemplate.info.logoCircle) {
            portfolioLogo.classList.add("circle")
        }
        portfolioLogo.src = portfolioTemplate.info.logo;
        portfolioLogo.alt = portfolioTemplate.info.logoAlt;
        document.querySelector("link[rel~='icon']").href = portfolioTemplate.info.logo
        document.querySelector("title").innerText = portfolioTemplate.info.fullName;
      }
  }
}

customElements.define("portfolio-header", PortfolioHeader);