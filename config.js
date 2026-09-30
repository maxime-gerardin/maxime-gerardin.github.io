const isPreview = window.name === 'cms-preview'
    || new URLSearchParams(location.search).has('cms-preview');

if (isPreview) {
    window.portfolioTemplate = await new Promise((resolve) => {
        window.addEventListener('message', function onMsg(e) {
            if (e.data?.type !== 'cms-preview') return;
            window.removeEventListener('message', onMsg);
            clearInterval(retry);
            resolve(e.data.data);
        });
        // On redemande jusqu'à recevoir les données (l'admin peut ne pas être prêt)
        const ask = () => top.postMessage({ type: 'preview-ready' }, '*');
        const retry = setInterval(ask, 500);
        ask();
    });

    // Garde la position de scroll entre deux rechargements
    addEventListener('scroll', () => sessionStorage.setItem('previewScroll', scrollY));
    addEventListener('load', () => {
        setTimeout(() => scrollTo(0, Number(sessionStorage.getItem('previewScroll')) || 0), 300);
    });

    // Signale à l'admin chaque changement de hash (ex: page projet)
    addEventListener('hashchange', () => {
        top.postMessage({
            type: 'preview-location',
            page: location.pathname + location.search + location.hash
        }, '*');
    });

    // Les liens internes changent de page via l'admin (garde le mode preview)
    document.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (!a || a.target === '_blank' || !a.href) return;
        const url = new URL(a.href, location.href);
        if (url.origin !== location.origin) return;
        if (url.pathname === location.pathname && url.hash) return; // ancre sur la même page (hashchange s'en occupe)
        e.preventDefault();
        sessionStorage.removeItem('previewScroll');
        top.postMessage({
            type: 'preview-navigate',
            page: url.pathname + url.search + url.hash
        }, '*');
    });
} else {
    window.portfolioTemplate = await (await fetch('./portfolio.json')).json();
}

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