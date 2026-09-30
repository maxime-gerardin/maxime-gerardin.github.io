window.portfolioTemplate = await (await fetch('./portfolio.json')).json();

window.styleConfig = {
    portfolioFont: { name: 'Outfit', weights: '100..900', useWeight: '400' },
    fullNameFont: { name: 'Outfit', weights: '100..900', useWeight: '900' },
    projectDescriptionMaxLine: 3,
};


const scripts = ['utils.js', 'header.js', 'footer.js', 'global.js'];

const page = document.body.dataset.page;
if (page) scripts.push(`${page}.js`);

for (const name of scripts) {
    const s = document.createElement('script');
    s.src = `./static/js/${name}`;
    s.async = false;
    document.body.appendChild(s);
}
