import fs from 'fs';

async function testBingSearch(query) {
    const url = 'https://www.bing.com/search?q=' + encodeURIComponent(query);
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
            }
        });
        const text = await response.text();
        console.log("Bing Status:", response.status);

        // Look for instagram profiles
        // We avoid common IG paths like /p/, /reel/, /explore/, /tags/, /stories/
        const igRegex = /instagram\.com\/([a-zA-Z0-9_.]+)/g;
        const matches = [...text.matchAll(igRegex)].map(m => m[1]);

        const ignored = ['p', 'reel', 'explore', 'tags', 'stories', 'reels', 'web', 'login', 'about', 'developer'];

        const validUsernames = [...new Set(matches)].filter(uname => {
            if (uname.length < 2) return false;
            // Ignore if it's a known non-profile path
            for (let ig of ignored) {
                if (uname.toLowerCase() === ig) return false;
                if (uname.toLowerCase().startsWith(ig + '/')) return false;
            }
            return true;
        });

        console.log("Found real IG Matches:", validUsernames);

    } catch (err) {
        console.error(err);
    }
}

testBingSearch("SAGA Coffee Jakarta Barat site:instagram.com");
testBingSearch("TOMORO COFFEE Citra 6 site:instagram.com");
