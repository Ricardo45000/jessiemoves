const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 3000, height: 1600 });
    await page.goto('http://localhost:5173/');

    // Wait for the page to load
    await page.waitForSelector('.tpc-hero');

    const layoutInfo = await page.evaluate(() => {
        function getElementInfo(selector) {
            const el = document.querySelector(selector);
            if (!el) return null;
            const rect = el.getBoundingClientRect();
            const styles = window.getComputedStyle(el);
            return {
                tag: el.tagName,
                classes: el.className,
                width: rect.width,
                height: rect.height,
                left: rect.left,
                right: rect.right,
                maxWidth: styles.maxWidth,
                padding: styles.padding,
                margin: styles.margin,
                borderRadius: styles.borderRadius,
                transform: styles.transform,
                overflow: styles.overflow
            };
        }

        return {
            window: { innerWidth: window.innerWidth },
            html: getElementInfo('html'),
            body: getElementInfo('body'),
            root: getElementInfo('#root'),
            tpcContainer: getElementInfo('.tpc-container'),
            tpcHero: getElementInfo('.tpc-hero'),
        };
    });

    console.log(JSON.stringify(layoutInfo, null, 2));
    await browser.close();
})();
