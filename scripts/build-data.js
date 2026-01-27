import * as fs from 'fs';
import ExcelJS from 'exceljs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const INPUT_FILE = join(ROOT_DIR, 'begrebsliste.xlsx');
const OUTPUT_FILE = join(ROOT_DIR, 'public', 'dictionary.json');

async function buildData() {
    console.log(`Reading ${INPUT_FILE}...`);
    if (!fs.existsSync(INPUT_FILE)) {
        console.error(`Error: File not found: ${INPUT_FILE}`);
        process.exit(1);
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(INPUT_FILE);

    const sheet = workbook.worksheets[0]; // Assuming first sheet
    console.log(`Processing sheet: ${sheet.name}`);

    // Get headers from first row
    const firstRow = sheet.getRow(1);
    const headers = [];
    firstRow.eachCell((cell, colNumber) => {
        headers[colNumber] = cell.value?.toString().trim() || '';
    });

    console.log('Headers found:', headers.filter(h => h).join(', '));

    const data = [];
    sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        const rowData = {};
        row.eachCell((cell, colNumber) => {
            const header = headers[colNumber];
            if (header) {
                // Handle rich text or other cell types if necessary, keeping it simple for now
                // ExcelJS cell.value can be an object for formulas/rich text.
                let val = cell.value;
                if (typeof val === 'object' && val !== null) {
                    if (val.text) val = val.text;
                    else if (val.result) val = val.result;
                }
                rowData[header] = val?.toString().trim();
            }
        });
        data.push(rowData);
    });

    console.log(`Found ${data.length} entries.`);

    // Load scraped metadata if exists
    let metadata = { terms: {} };
    const METADATA_FILE = join(ROOT_DIR, 'scraped-metadata.json');
    if (fs.existsSync(METADATA_FILE)) {
        console.log(`Loading metadata from ${METADATA_FILE}...`);
        metadata = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf8'));
    }

    const normalizedData = data.map((row, index) => {
        const getVal = (keyPart) => {
            const key = Object.keys(row).find(k => k.toLowerCase() === keyPart.toLowerCase());
            return key ? row[key] : undefined;
        };

        const term = getVal('Term (foretrukken)') || 'Unknown Term';
        const meta = metadata.terms[term.toLowerCase()];

        return {
            id: row['Id'] || `term-${index}`,
            term: term,
            definition: getVal('Definition'),
            definitionEn: getVal('Definition (en)') || getVal('Definition (UK)'),
            synonyms: getVal('Synonym (accepteret)'),
            scope: getVal('Scope'),
            status: getVal('Status'),
            subject: getVal('Tilhører emneområdet'),
            legislation: getVal('Lovgivning'),
            termEn: getVal('Term (en)'),
            example: getVal('Eksempel'),
            exampleEn: getVal('Eksempel (en)'),
            explanation: getVal('Forklaring'),
            explanationEn: getVal('Forklaring (en)'),
            modelLink: meta?.url,
            diagrams: meta?.diagrams
        };
    });

    const cleanData = normalizedData.filter(d => d.term && d.term !== 'Unknown Term');

    console.log(`Writing ${cleanData.length} entries to ${OUTPUT_FILE}...`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cleanData, null, 2));
    console.log('Done.');
}

buildData().catch(err => {
    console.error(err);
    process.exit(1);
});
