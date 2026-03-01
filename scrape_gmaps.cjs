const puppeteer = require('puppeteer');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const QUERIES = [
    'cafe in Jakarta Barat',
    'restaurant in Jakarta Barat',
    'barbershop in Jakarta Barat'
];

async function scrapeMaps() {
    const browser = await puppeteer.launch({ headless: "new" });

    const csvWriter = createCsvWriter({
        path: 'clientlist.csv',
        header: [
            { id: 'name', title: 'Name' },
            { id: 'phone', title: 'Phone' },
            { id: 'category', title: 'Category' },
            { id: 'query', title: 'Query' },
            { id: 'link', title: 'Link' },
        ],
        append: fs.existsSync('clientlist.csv')
    });

    for (const query of QUERIES) {
        console.log(`\n--- Searching for: ${query} ---`);
        const page = await browser.newPage();
        try {
            await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(query)}`);

            // wait for the results
            await page.waitForSelector('[role="feed"]', { timeout: 10000 }).catch(() => { });

            let placesUrls = new Set();
            let lastCount = 0;
            let retries = 0;

            console.log('Scrolling to find listings...');
            while (true) {
                // extract links
                const links = await page.$$eval('a[href*="/maps/place/"]', els => els.map(e => e.href));
                for (const l of links) placesUrls.add(l);

                // scroll down
                await page.evaluate(() => {
                    const feed = document.querySelector('[role="feed"]');
                    if (feed) feed.scrollTop = feed.scrollHeight;
                });

                // wait for lazy load
                await new Promise(r => setTimeout(r, 2500));

                if (placesUrls.size === lastCount) {
                    retries++;
                    if (retries >= 3) {
                        console.log('No new places found or reached the end. Proceeding to extract details.');
                        break;
                    }
                } else {
                    retries = 0;
                }
                lastCount = placesUrls.size;
                console.log(`Found ${placesUrls.size} listings so far...`);

                // arbitrary limit to prevent infinite loops (e.g. max 150 per query)
                if (placesUrls.size >= 150) break;
            }

            console.log(`Extracting details for ${placesUrls.size} locations for query: ${query}`);
            const urlsArray = Array.from(placesUrls);

            for (let i = 0; i < urlsArray.length; i++) {
                const url = urlsArray[i];
                try {
                    const detailsPage = await browser.newPage();
                    await detailsPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

                    await detailsPage.waitForSelector('h1', { timeout: 5000 }).catch(() => { });
                    const name = await detailsPage.$eval('h1', el => el.textContent).catch(() => 'Unknown');

                    const hasWebsite = await detailsPage.$('a[data-item-id="authority"]');
                    if (hasWebsite) {
                        console.log(`[${i + 1}/${urlsArray.length}] SKIP: ${name} (Has website)`);
                        await detailsPage.close();
                        continue;
                    }

                    const phoneBtn = await detailsPage.$('button[data-item-id^="phone:tel:"]');
                    if (phoneBtn) {
                        let phone = await detailsPage.evaluate(el => el.getAttribute('data-item-id'), phoneBtn);
                        phone = phone.replace('phone:tel:', '');

                        // Check if it's a mobile/WA number in Indonesia (+628... or 08...)
                        const cleanPhone = phone.replace(/[\s\-]/g, '');
                        if (cleanPhone.startsWith('+628') || cleanPhone.startsWith('08')) {
                            console.log(`[${i + 1}/${urlsArray.length}] ADD: ${name} - ${phone}`);
                            await csvWriter.writeRecords([{
                                name: name,
                                phone: phone,
                                category: query.split(' ')[0], // simple category extraction
                                query: query,
                                link: url
                            }]);
                        } else {
                            console.log(`[${i + 1}/${urlsArray.length}] SKIP: ${name} (Phone ${phone} is not a WA mobile number)`);
                        }
                    } else {
                        console.log(`[${i + 1}/${urlsArray.length}] SKIP: ${name} (No phone found)`);
                    }
                    await detailsPage.close();
                } catch (err) {
                    console.log(`[${i + 1}/${urlsArray.length}] ERROR extracting url: ${url}`, err.message);
                }
            }
        } catch (err) {
            console.log(`Failed on query ${query}:`, err.message);
        } finally {
            await page.close();
        }
    }

    await browser.close();
    console.log('\n--- Done Scraping ---');
}

scrapeMaps().catch(console.error);
