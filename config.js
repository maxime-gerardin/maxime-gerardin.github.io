portfolioTemplate = {
    info: {
        fullName: "Maxime Gerardin",
        personalDescription: "3D and Environment freelance artist based in south of France, creating immersive visuals for personal projects and brands.",
        logo: "./static/assets/logo.jpg",
        logoCircle: true,
        logoAlt: "Logo icon",
        backgroundVideo: "./static/assets/thumbnails/secret-lab.mp4",
    },
    socials: [
        {
            text: "ArtStation",
            icon: "./static/assets/icons/artstation.svg",
            url: "https://www.artstation.com/maximegerardin"
        },
        {
            text: "Instagram",
            icon: "./static/assets/icons/instagram.svg",
            url: "https://www.instagram.com/maxime.gerardin"
        },
        {
            text: "LinkedIn",
            icon: "./static/assets/icons/linkedin.svg",
            url: "https://www.linkedin.com/in/maximusgerardin/"
        },
        {
            text: "Patreon",
            icon: "./static/assets/icons/patreon.svg",
            url: "https://www.patreon.com/maximegerardin"
        },
        {
            text: "Youtube",
            icon: "./static/assets/icons/youtube.svg",
            url: "https://www.youtube.com/@maximusgerardin"
        }
    ],
    projects: [
        {
            name: "Valorant - SUPERPOWER",
            videoThumbnail: "./static/assets/thumbnails/valorant.mp4",
            tags: ["3D", "Environments"],
            year: "2024",
            description: "Valorant worlds championship video clip SUPERPOWER",
            client: "Riot Games",
            links: [
                {
                    url: "https://www.youtube.com/watch?v=DX4BE9GmpH4&list=RDDX4BE9GmpH4&start_radio=1",
                    text: "View on Youtube"
                }
            ],
            medias: [
                {
                    src: "./static/assets/medias/valorant_2.mp4",
                    type: "video"
                },
                {
                    src: "./static/assets/medias/valorant_3.mp4",
                    type: "video"
                }
            ],
        },
        {
            name: "Island",
            videoThumbnail: "./static/assets/thumbnails/island.mp4",
            tags: ["3D", "Environments"],
            year: "2024",
            description: "Island environment",
            client: "",
            links: [],
            medias: [],
        },
        {
            name: "Secret Lab Basement",
            videoThumbnail: "./static/assets/thumbnails/secret-lab.mp4",
            tags: ["3D", "Animation"],
            year: "2025",
            description: "Hello, here's an 3D render made a year ago. " +
                         "I originally just wanted to help my girlfriend on her 3D Assignment for her art school",
            client: "",
            links: [
                {
                    url: "https://www.artstation.com/artwork/mAn3De",
                    text: "View in ArtStation",
                }
            ],
            medias: [
                {
                    src: "./static/assets/thumbnails/secret-lab.mp4",
                    type: "video",
                    controls: true,
                    gridLine: 1,
                },
                {
                    src: "./static/assets/medias/secret-lab-2.jpg",
                    type: "img",
                    text: "Viewport Screenshot",
                    gridLine: 2,
                },
                {
                    src: "./static/assets/medias/secret-lab-3.jpg",
                    type: "img",
                    text: "Viewport Screenshot in Rendered View",
                    gridLine: 2,
                },
                {
                    src: "https://cdna.artstation.com/p/assets/images/images/086/911/290/large/maxime-gerardin-basement-grading-1-1-2-1-2-1.jpg?1744379618",
                    type: "img",
                    text: "Final Render + Color grade"
                }
            ],
        },
        {
            name: "Frozen Bridge",
            videoThumbnail: "./static/assets/thumbnails/horse.mp4",
            tags: ["3D", "Animation"],
            year: "2025",
            description: "Here's a different shot I made to get a full grasp at my previous artwork 'Winter Bridge' inspired by Bram Lepelaar concept art",
            client: "",
            links: [
                {
                    url: "https://www.artstation.com/artwork/VdzaQZ",
                    text: "Bram Lepelaar concept art",
                },
                {
                    url: "https://www.artstation.com/artwork/VdzaQZ",
                    text: "Winter bridge",
                },
            ],
            medias: [],
        }
    ],
    footer: {
        contact: [
            {
                icon: "./static/assets/icons/location.svg",
                url: "",
                text: "South of France"
            },
            {
                icon: "./static/assets/icons/mail.svg",
                url: "mailto:maximegerardincontact@gmail.com",
                text: "maximegerardincontact@gmail.com"
            }
        ]
    }
}

styleConfig = {
    portfolioFont: { name: 'Outfit', weights: '100..900', useWeight: '400' }, // Google fonts
    fullNameFont: { name: 'Outfit', weights: '100..900', useWeight: '900'} // Google fonts
}