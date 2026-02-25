function fillAboutInfo() {

  if("about" in portfolioTemplate && portfolioTemplate.about) {
    let aboutInfosContainer = document.getElementById("about-page")

    portfolioTemplate.about.forEach((aboutInfo, index) => {
      const aboutInfoTemplate = document.getElementById("about-info-template");
      let aboutInfoClone = aboutInfoTemplate.content.cloneNode(true);
      let aboutInfoElm = aboutInfoClone.querySelector(".about-info");

      showOrHide(aboutInfo, "title", aboutInfoElm.querySelector(".about-info-title"))
      let showImg = showOrHide(aboutInfo, "img", aboutInfoElm.querySelector(".about-info-img"))
      if (!showImg) {
        aboutInfoElm.style.justifyContent = "center"
      }
      let aboutInfoText = aboutInfoElm.querySelector(".about-info-text");
      aboutInfoText.innerHTML = aboutInfo.text.replace("{AGE}", getAge()).replace("{WORK_YEARS}", getWorkingYears());
      if(index % 2 == 1)
      {
        aboutInfoElm.classList.add("reverse")
      }
      
      aboutInfosContainer.appendChild(aboutInfoElm)
    })
  }
}

async function main()
{
    applyConfigStyles()

    fillAboutInfo()

    await displayPage()
}

main()