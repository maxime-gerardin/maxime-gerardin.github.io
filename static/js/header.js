class PortfolioHeader extends HTMLElement {

  connectedCallback() {
    this.innerHTML = `
      <div id="portfolio-header">
        <a id="logo-link" href="index.html">
            <img id="portfolio-logo" src="" alt="">
        </a>
      </div>`;

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