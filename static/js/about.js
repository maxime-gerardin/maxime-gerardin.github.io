function fillAboutInfo() {

  if("about" in portfolioTemplate && portfolioTemplate.about) {
    let aboutInfosContainer = document.getElementById("about-page")

    portfolioTemplate.about.forEach((aboutInfo, index) => {
      const aboutInfoTemplate = document.getElementById("about-info-template");
      let aboutInfoClone = aboutInfoTemplate.content.cloneNode(true);
      let aboutInfoElm = aboutInfoClone.querySelector(".about-info");

      showOrHide(aboutInfo, "title", aboutInfoElm.querySelector(".about-info-title"))
      let aboutImg = aboutInfoElm.querySelector(".about-info-img")
      let showImg = showOrHide(aboutInfo, "img", aboutImg)
      if (showImg) {
        aboutImg.alt = "About illustration"
      }

      let showText = showOrHide(aboutInfo, "text", aboutInfoElm.querySelector(".about-info-text"), true)
      if (showText) {
        let aboutInfoText = aboutInfoElm.querySelector(".about-info-text")
        aboutInfoText.innerHTML = (aboutInfo.text.replace("{AGE}", getDiffYear(portfolioTemplate.info.birthday))
                                                 .replace("{WORK_YEARS}", getDiffYear(portfolioTemplate.info.startWorkingDate)));
      } 
      else {
        aboutInfoElm.querySelector(".about-info-text-container").remove()
      }

      if (!showImg || !showText) {
        aboutInfoElm.style.justifyContent = "center"
      }
      
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