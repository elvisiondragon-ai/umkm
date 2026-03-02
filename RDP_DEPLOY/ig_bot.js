import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_FILE = path.join(__dirname, 'client', 'client_searchv2.csv');

// --- CONFIGURATION ---
// "COMMENT" or "DM"
const OUTREACH_METHOD = "DM";

// Using Spintax to avoid exact-match spam detection from Meta, while delivering the core message exactly as requested.
const messages = [
    "Halo kak! 👋 Mau infoin nih kak, kita ada support UMKM gratis. Buat website cuman 2 menit, udah dipakai 2500+ UMKM se-Indonesia. 100% tanpa potongan komisi sama sekali (ngga kaya gojek/shopee). Langsung cek dan daftar gratis di sini kak: https://umkm.elvisiongroup.com",
    "Siang kak admin! 🙏 Numpang share ya kak, kita lagi ada program support UMKM gratis 100%. Bikin website jualan sendiri ngga sampai 2 menit, udah dipercaya 2500 UMKM. Tanpa potongan komisi sepeserpun lho kak. Daftar gratisnya bisa klik disini ya: https://umkm.elvisiongroup.com",
    "Permisi kak! ✨ Sekedar info nih buat bantu usahanya, sekarang udah bisa bikin website UMKM gratis nggak sampai 2 menit lho. Udah dipake 2500 UMKM dan ini tanpa potongan sama sekali kak. Yuk langsung dicoba gratis di link ini kak: https://umkm.elvisiongroup.com",
    "Halo kak, salam kenal! 😊 Kita ada solusi support UMKM nih. Kakak bisa buat website jualan sendiri under 2 mins, udah dipake lebih dari 2500 UMKM. Keuntungannya 100% buat kakak, ngga ada potongan komisi apps sama sekali. Gratis kak, cek di sini ya: https://umkm.elvisiongroup.com"
];

const getMessage = () => messages[Math.floor(Math.random() * messages.length)];

const delay = (min, max) => {
    const ms = Math.floor(Math.random() * (max - min + 1) + min);
    return new Promise(resolve => setTimeout(resolve, ms));
};

async function readLeads() {
    if (!fs.existsSync(CSV_FILE)) {
        console.error(`File not found: ${CSV_FILE}`);
        return [];
    }
    const csvText = fs.readFileSync(CSV_FILE, 'utf8');
    const lines = csvText.split('\n').filter(l => l.trim() !== '');
    lines.shift();

    const leads = [];
    for (let l of lines) {
        const parts = l.split(',');
        if (parts.length >= 4) {
            let ig = parts[3].replace(/"/g, '').trim();
            if (ig.startsWith('http')) {
                leads.push(ig);
            }
        }
    }
    return leads;
}

async function runInstagramOutreach() {
    const leads = await readLeads();
    console.log(`Found ${leads.length} Instagram leads.`);

    // Launch Edge natively to bypass Windows Server sandbox restrictions
    const browser = await puppeteer.launch({
        headless: false, // Must be false on first run to login 
        executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        userDataDir: path.join(__dirname, 'ig_session'),
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log("Navigating to Instagram...");
    await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2' });

    console.log("Waiting 15 seconds. Please log in if you are not already logged in.");
    await delay(15000, 15000);

    console.log("Starting slow drip sequence...");
    for (let i = 0; i < leads.length; i++) {
        const url = leads[i];
        console.log(`\n[${i + 1}/${leads.length}] Processing ${url}`);

        try {
            await page.goto(url, { waitUntil: 'networkidle2' });
            await delay(3000, 5000); // 3-5s human wait looking at profile

            if (OUTREACH_METHOD === "COMMENT") {
                console.log("Executing Comment Method...");

                // 1. Click the first post
                const posts = await page.$$('article a'); // Selects post links
                if (posts.length > 0) {
                    await posts[0].click();
                    await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => console.log("Navigated to post"));
                    await delay(2000, 4000); // Wait on post

                    // 2. Click the comment box
                    const commentBox = await page.$('textarea[placeholder*="comment"]', 'textarea[aria-label*="comment"]');
                    if (commentBox) {
                        await commentBox.click();
                        await delay(500, 1000);

                        // 3. Type message
                        const msg = getMessage();
                        await page.keyboard.type(msg, { delay: 100 });
                        await delay(500, 1000);

                        // 4. Hit Enter
                        await page.keyboard.press('Enter');
                        console.log("Comment posted successfully!");

                    } else {
                        console.log("Could not find comment box. Comments might be disabled.");
                    }
                } else {
                    console.log("No posts found to comment on.");
                }
            }
            else if (OUTREACH_METHOD === "DM") {
                console.log("Executing DM Method...");

                // Find "Message" button text. IG uses various DOM structures for this.
                const [messageBtn] = await page.$x("//div[contains(text(), 'Message')] | //div[contains(text(), 'Kirim pesan')]");

                if (messageBtn) {
                    await messageBtn.click();
                    await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => console.log("Opened DM chat"));
                    await delay(3000, 5000);

                    const chatBox = await page.$('div[role="textbox"]');
                    if (chatBox) {
                        await chatBox.click();
                        const msg = getMessage();
                        await page.keyboard.type(msg, { delay: 50 });
                        await delay(1000, 2000);
                        await page.keyboard.press('Enter');
                        console.log("DM sent successfully!");
                    } else {
                        console.log("Could not find chat text box.");
                    }
                } else {
                    console.log("Message button not found. User might not allow DMs from non-followers.");
                }
            }

            console.log(`Action completed. Executing anti-spam delay (5-15 mins)...`);
            // Anti-spam delay: 5 mins (300,000) to 15 mins (900,000)
            await delay(300000, 900000);

        } catch (err) {
            console.error(`Failed on ${url}:`, err.message);
        }
    }

    await browser.close();
    console.log("Outreach complete!");
}

// Execute immediately upon start
runInstagramOutreach();
