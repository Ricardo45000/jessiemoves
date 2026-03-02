const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    await page.goto('http://localhost:5173/');

    // Wait for the page to load
    await page.waitForSelector('.tpc-hero');

    const html = await page.evaluate(() => document.body.innerHTML);
    const fs = require('fs');
    fs.writeFileSync('dom_dump.html', html);

    await browser.close();
})();
