import puppeteer from 'puppeteer';

async function testBingPuppeteer() {
    console.log("Launching puppeteer for Bing...");
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

    const testCases = [
        'SAGA Coffee Jakarta Barat site:instagram.com',
        'TOMORO COFFEE Citra 6 site:instagram.com',
        'Reffel Professional Salon Jakarta Barat site:instagram.com'
    ];

    try {
        for (let query of testCases) {
            console.log("Searching for:", query);
            await page.goto('https://www.bing.com/search?q=' + encodeURIComponent(query), { waitUntil: 'domcontentloaded' });

            await page.waitForSelector('#b_results', { timeout: 5000 }).catch(() => { });

            const links = await page.$$eval('#b_results a', els => els.map(e => e.href));

            const igRegex = /instagram\.com\/([a-zA-Z0-9_.]+)/g;
            let foundIg = null;

            for (let link of links) {
                const dec = decodeURIComponent(link);
                // use .match instead of .matchAll for single checks, but we want all matches globally inside loop, so wait... we can just do match without g for single string or check against igRegex globally using exec.
                // better yet: link just has one url usually.
                const singleRegex = /instagram\.com\/([a-zA-Z0-9_.]+)/;
                const match = dec.match(singleRegex);
                if (match) {
                    const username = match[1];
                    const ignored = ['p', 'reel', 'explore', 'tags', 'stories', 'reels', 'web', 'login', 'about', 'developer'];
                    if (!ignored.includes(username.toLowerCase())) {
                        foundIg = "https://instagram.com/" + username;
                        break;
                    }
                }
            }

            if (!foundIg) {
                const text = await page.evaluate(() => document.body.innerText);
                let m;
                const ignored = ['p', 'reel', 'explore', 'tags', 'stories', 'reels', 'web', 'login', 'about', 'developer'];
                while ((m = igRegex.exec(text)) !== null) {
                    const username = m[1];
                    if (!ignored.includes(username.toLowerCase()) && username.length > 2) {
                        foundIg = "https://instagram.com/" + username;
                        break;
                    }
                }
            }

            console.log("Result:", foundIg || "Not found");
            console.log("-----------------");

            await new Promise(r => setTimeout(r, 2000));
        }
    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

testBingPuppeteer();
