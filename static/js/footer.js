class PortfolioFooter extends HTMLElement {

  static footerItemTemplate = document.createElement("template");
  static footerItemLinkTemplate = document.createElement("template");
  static footerMenu = [
    {
        text: "Home",
        url: "index.html"
    },
    {
      text: "Projects",
      url: "projects.html"
    },
    {
      text: "Contact",
      url: "contact.html"
    }
  ]

  fillFooterSection(sectionID, templateObj){
    let footerSectionContact = this.querySelector(`#${sectionID}`)
    if (hasNonEmptyString(templateObj))
    {
        templateObj.forEach(obj => {
          if (hasNonEmptyString(obj) && obj?.showFooter !== false) {
            let footerItemTemplate
            let footerItemClone
            if(obj.url !== "") {
                footerItemTemplate = PortfolioFooter.footerItemLinkTemplate;
                footerItemClone = footerItemTemplate.content.cloneNode(true);
                let footerItemLink = footerItemClone.querySelector(".footer-section-item-link")
                footerItemLink.href = obj.url
            }
            else {
                footerItemTemplate = PortfolioFooter.footerItemTemplate;
                footerItemClone = footerItemTemplate.content.cloneNode(true);
            }
            let footerItemIcon = footerItemClone.querySelector(".footer-section-item-icon")
            let footerItemText = footerItemClone.querySelector(".footer-section-item-text")
            if (obj.icon) {
              footerItemIcon.src = obj.icon
            } else {
              footerItemIcon.remove()
            }
            footerItemText.innerText = obj.text
            footerSectionContact.querySelector(".footer-section-list").appendChild(footerItemClone)
          }
        })
    }
    else {
      footerSectionContact.style.display = "none";
    }
  }

  connectedCallback() {

    PortfolioFooter.footerItemTemplate.innerHTML = `
      <div class="footer-section-item">
        <img class="footer-section-item-icon" src="" alt="">
        <div class="footer-section-item-text"></div>
      </div>`;

    PortfolioFooter.footerItemLinkTemplate.innerHTML = `
      <a class="footer-section-item-link underline" href="">
        <div class="footer-section-item">
          <img class="footer-section-item-icon" src="" alt="">
          <div class="footer-section-item-text"></div>
        </div>
      </a>`;

    this.innerHTML = `
      <hr>
      <footer>
        <div id="footer"> 
            <div id="footer-info">
                <div id="footer-portfolio-name" class="full-name"></div>
                <div id="footer-section-menu" class="footer-section">
                    <div class="footer-section-title">Menu</div>
                    <div class="footer-section-list"></div>
                </div>
                <div id="footer-section-contact" class="footer-section">
                    <div class="footer-section-title">Contact</div>
                    <div class="footer-section-list"></div>
                </div>
                <div id="footer-section-socials" class="footer-section">
                    <div class="footer-section-title">Socials</div>
                    <div class="footer-section-list"></div>
                </div>
            </div>
            <div id="portfolio-copy-footer">&copy;<span id="portfolio-copy-footer-name"></span> <span id="portfolio-copy-year-footer"></span></div>
        </div>
      </footer>`;

    if("footer" in portfolioTemplate) {
      let footerName = this.querySelector("#footer-portfolio-name");
      let footerCopyName = this.querySelector("#portfolio-copy-footer-name");
      let footerCopyYear = this.querySelector("#portfolio-copy-year-footer");
      footerName.innerText = portfolioTemplate.info.fullName
      footerCopyName.innerText = ` ${portfolioTemplate.info.fullName}`
      footerCopyYear.textContent = new Date().getFullYear().toString()

      this.fillFooterSection("footer-section-menu", PortfolioMenu())
      this.fillFooterSection("footer-section-contact", portfolioTemplate.footer.contact)
      this.fillFooterSection("footer-section-socials", portfolioTemplate.socials)
    }
  }
}

customElements.define("portfolio-footer", PortfolioFooter);