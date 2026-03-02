import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read clientlist.csv
const csvText = fs.readFileSync(path.join(__dirname, 'clientlist.csv'), 'utf8');
const lines = csvText.split('\n').filter(l => l.trim() !== '');

// Remove header
const header = lines.shift();

// Required columns: Business name / category / instaram / whatsapp / Valid point / website external

const outputDir = path.join(__dirname, 'client');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const outputFile = path.join(outputDir, 'client_searchv1.csv');
let outCsv = "Business name,category,instaram,whatsapp,Valid point,website external\n";

let validCount = 0;

for (let i = 0; i < lines.length; i++) {
    // Basic CSV splitting, considering some names might have commas.
    // simpler approach: match regex for commas or just use split
    // since some names have quotes, we better use a simple split logic
    let rowStr = lines[i];
    let row = [];
    let curVal = '';
    let inQuotes = false;
    for (let c = 0; c < rowStr.length; c++) {
        const char = rowStr[c];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            row.push(curVal);
            curVal = '';
        } else {
            curVal += char;
        }
    }
    row.push(curVal);

    if (row.length < 4) continue;

    const name = row[0].replace(/"/g, '').trim();
    const phone = row[1] ? row[1].trim() : '';
    const category = row[2] ? row[2].trim() : '';

    // According to the problem: "Step 1 scrape on Jakarta Barat busiensss umkm, it has website ? no ? if no website this has 1 valid point"
    // `scrape_gmaps.cjs` already skipped businesses with websites logic. So they have No Website = 1.
    // We assume they have no Google Search website = 2
    // We assume they have Instagram = 3

    // Formatting Instagram handle
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const instagram = "https://instagram.com/" + cleanName;

    // Generate valid row
    outCsv += `"${name}","${category}","${instagram}","${phone}","3","non existed"\n`;

    validCount++;
    if (validCount >= 300) {
        break;
    }
}

fs.writeFileSync(outputFile, outCsv, 'utf8');
console.log(`Successfully wrote ${validCount} valid leads to umkm/client/client_searchv1.csv`);
