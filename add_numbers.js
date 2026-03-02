import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputFile = path.join(__dirname, 'client', 'client_searchv1.csv');
const csvText = fs.readFileSync(outputFile, 'utf8');
const lines = csvText.split('\n').filter(l => l.trim() !== '');

const header = lines.shift();

let newCsv = "No," + header + "\n";

for (let i = 0; i < lines.length; i++) {
    newCsv += `${i + 1},${lines[i]}\n`;
}

fs.writeFileSync(outputFile, newCsv, 'utf8');
console.log("Added numbers to CSV successfully.");
