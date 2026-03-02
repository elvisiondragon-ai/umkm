const puppeteer = require('puppeteer');
const fs = require('fs');

async function testGmapsIg() {
    console.log("Launching puppeteer for Gmaps...");
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();

    try {
        await page.goto(`https://www.google.com/maps/search/cafe+in+Jakarta+Barat`, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('[role="feed"]', { timeout: 10000 }).catch(() => { });

        let placesUrls = new Set();

        // Just extract top 5 to test
        const links = await page.$$eval('a[href*="/maps/place/"]', els => els.map(e => e.href));
        for (const l of links) placesUrls.add(l);

        const urlsArray = Array.from(placesUrls).slice(0, 5);
        console.log(`Found ${urlsArray.length} places. Inspecting...`);

        for (let url of urlsArray) {
            const detailsPage = await browser.newPage();
            try {
                await detailsPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
                const name = await detailsPage.$eval('h1', el => el.textContent).catch(() => 'Unknown');

                let igLink = "none";

                // Get Website Link
                const websiteEl = await detailsPage.$('a[data-item-id="authority"]');
                if (websiteEl) {
                    const websiteHref = await detailsPage.evaluate(el => el.href, websiteEl);
                    if (websiteHref.includes('instagram.com')) {
                        igLink = websiteHref.split('?')[0]; // simple cleanup
                    }
                }

                console.log(`Name: ${name} | IG: ${igLink}`);

            } catch (err) {
                console.log(`Error on ${url}`);
            } finally {
                await detailsPage.close();
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

testGmapsIg();
