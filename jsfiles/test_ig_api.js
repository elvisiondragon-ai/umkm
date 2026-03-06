import https from 'https';

function testIGA(query) {
    const options = {
        hostname: 'www.instagram.com',
        port: 443,
        path: `/web/search/topsearch/?context=blended&query=${encodeURIComponent(query)}`,
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
            'Accept': 'application/json',
            'X-IG-App-ID': '936619743392459',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
        }
    };

    const req = https.request(options, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log("Status:", res.statusCode);
            const body = data.substring(0, 500);
            console.log("Response chunk:", body);
            try {
                const json = JSON.parse(data);
                if (json.users && json.users.length > 0) {
                    console.log("Found:", json.users[0].user.username);
                } else {
                    console.log("No users found in JSON");
                }
            } catch (e) {
                console.log("Not JSON or error parsing.");
            }
        });
    });

    req.on('error', e => console.error(e));
    req.end();
}

testIGA("SAGA Coffee");
