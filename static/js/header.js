class PortfolioHeader extends HTMLElement {

  createMenu(container, fullmenuContainer) {
    PortfolioMenu().forEach((menuItem) => {
      if (menuItem?.home !== true) {
        let menuLink = document.createElement("a");
        menuLink.classList.add("menu-link", "underline");
        menuLink.href = menuItem.url;
        menuLink.innerHTML = menuItem.text;
        container.appendChild(menuLink);
        
        let burgerMenuLink = document.createElement("a");
        burgerMenuLink.href = menuItem.url
        burgerMenuLink.innerHTML = menuItem.text
        let burgerMenuLinkWrapper = document.createElement("div");
        burgerMenuLinkWrapper.classList.add("burger-menu-link-wrapper")
        burgerMenuLinkWrapper.appendChild(burgerMenuLink)
        fullmenuContainer.appendChild(burgerMenuLinkWrapper)
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
        <div id="header-burger-menu">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div id="header-fullscreen-menu">
          <div id="burger-menu-close-btn"><img src="static/assets/icons/cross.svg"></div>
          <div id="burger-menu-links"></div>
        </div>
      </div>`;

      this.createMenu(document.getElementById("header-menu"), document.getElementById("burger-menu-links"))

      const burger = document.getElementById("header-burger-menu");
      const menu = document.getElementById("header-fullscreen-menu");
      const closeBtn = document.getElementById("burger-menu-close-btn");
      const links = document.querySelectorAll("#burger-menu-links a");

      burger.addEventListener("click", () => {
        document.body.style.overflow = "hidden"
        menu.classList.add("active");
        links.forEach((link, index) => {
          setTimeout(() => {
            link.classList.add("show");
          }, index * 175);
        });
      });
      
      closeBtn.addEventListener("click", () => {
        document.body.style.overflow = "inherit"
        links.forEach(link => link.classList.remove("show"));
        menu.classList.remove("active");
      });

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