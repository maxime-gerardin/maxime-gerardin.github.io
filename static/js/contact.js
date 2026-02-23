function createContactInfo(title, contactInfoList)
{
    const contactInfoTemplate = document.getElementById("contact-info-template");
    let contactInfoClone = contactInfoTemplate.content.cloneNode(true);
    let contactInfoElm = contactInfoClone.querySelector(".contact-info");

    let contactInfoTitle = contactInfoElm.querySelector(".contact-info-title");
    contactInfoTitle.innerHTML = title;
    contactInfoList.forEach(contactInfo => {
        let contactInfoValue = document.createElement("div")
        contactInfoValue.classList.add("contact-info-value")
        contactInfoValue.innerHTML = contactInfo.text;
        contactInfoElm.appendChild(contactInfoValue)

        if(contactInfo.url) {
            console.log("here")
            let contactInfoLink = createExternalLink(contactInfo.url, contactInfo.text, ["contact-info-link"], ["link-icon"])
            contactInfoLink.classList.add("contact-info-value")
            contactInfoValue.replaceWith(contactInfoLink);
        }
    })
    
    return contactInfoElm
}

function fillContactInfo() {

    if(portfolioTemplate.footer.contact) {
        let contactInfosContainer = document.getElementById("contact-infos")

        portfolioTemplate.footer.contact.forEach(contactInfo => {
            let contactInfoElm = createContactInfo(contactInfo.title, [contactInfo])
            contactInfosContainer.appendChild(contactInfoElm)
        })

        let socialsToDisplay = portfolioTemplate.socials.filter(s => s?.showContact === true)
        let socialInfoElm = createContactInfo("Socials", socialsToDisplay)
        contactInfosContainer.appendChild(socialInfoElm)
    }

}

async function main()
{
    applyConfigStyles()

    fillContactInfo()

    await displayPage()
}

main()