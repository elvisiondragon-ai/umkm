import puppeteer from 'puppeteer';

async function testDDGPuppeteer() {
    console.log("Launching puppeteer for DDG...");
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    // Spoof user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

    try {
        const query = 'SAGA Coffee Jakarta Barat site:instagram.com';
        await page.goto('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query), { waitUntil: 'domcontentloaded' });

        const html = await page.content();
        console.log("HTML length:", html.length);

        const links = await page.$$eval('a.result__url', els => els.map(e => e.href));
        console.log("Found links via DDG:", links);

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

testDDGPuppeteer();
