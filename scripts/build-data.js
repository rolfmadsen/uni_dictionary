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

    // Extract Latest Date from column Q (Ændret)
    let latestDate = null;
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/;

    sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const cell = row.getCell(17); // Column Q is 17
        let val = cell.value;
        let d = null;

        if (val instanceof Date) {
            d = val;
        } else if (typeof val === 'string') {
            const m = val.match(dateRegex);
            if (m) {
                // DD/MM/YYYY HH:MM -> YYYY-MM-DD THH:MM
                d = new Date(`${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}:00`);
            }
        }

        if (d && !isNaN(d.getTime())) {
            if (!latestDate || d > latestDate) {
                latestDate = d;
            }
        } else if (val) {
            console.warn(`[WARNING] Invalid date format in Row ${rowNumber}, Column Q: ${val}`);
        }
    });

    const BUILD_INFO_FILE = join(ROOT_DIR, 'public', 'build-info.json');
    if (latestDate) {
        // Format as DD.MM.YYYY
        const day = String(latestDate.getDate()).padStart(2, '0');
        const month = String(latestDate.getMonth() + 1).padStart(2, '0');
        const year = latestDate.getFullYear();
        const formattedDate = `${day}.${month}.${year}`;
        
        console.log(`Latest modification date found: ${formattedDate}`);
        fs.writeFileSync(BUILD_INFO_FILE, JSON.stringify({ lastUpdated: formattedDate }, null, 2));
    } else {
        console.warn(`\n[WARNING] Could not find any valid modification dates in Column Q (Ændret). Footer date will be hidden.\n`);
        fs.writeFileSync(BUILD_INFO_FILE, JSON.stringify({ lastUpdated: null }, null, 2));
    }

    console.log('Done.');
}

buildData().catch(err => {
    console.error(err);
    process.exit(1);
});
