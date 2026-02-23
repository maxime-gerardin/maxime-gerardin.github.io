function fillContactInfo() {

    if(portfolioTemplate.footer.contact) {
        let contactInfosContainer = document.getElementById("contact-infos")
        portfolioTemplate.footer.contact.forEach(contactInfo => {
            const contactInfoTemplate = document.getElementById("contact-info-template");
            let contactInfoClone = contactInfoTemplate.content.cloneNode(true);
            let contactInfoElm = contactInfoClone.querySelector(".contact-info");

            let contactInfoTitle = contactInfoElm.querySelector(".contact-info-title");
            contactInfoTitle.innerHTML = contactInfo.title;
            let contactInfoValue = contactInfoElm.querySelector(".contact-info-value");
            contactInfoValue.innerHTML = contactInfo.text;

            if(contactInfo.url) {
                let contactInfoLink = document.createElement("a");
                contactInfoLink.classList.add("underline", "contact-info-value");
                contactInfoLink.href = contactInfo.url;
                contactInfoLink.textContent = contactInfo.text;
                contactInfoValue.replaceWith(contactInfoLink);
            }

            contactInfosContainer.appendChild(contactInfoElm)
        })
    }

}

async function main()
{
    applyConfigStyles()

    fillContactInfo()

    await displayPage()
}

main()