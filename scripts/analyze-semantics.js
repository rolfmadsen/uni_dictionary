import * as fs from 'fs';
import ExcelJS from 'exceljs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT_FILE = join(__dirname, '..', 'begrebsliste_v1_1_0.xlsx');

async function analyzeAllColumns() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(INPUT_FILE);
    const sheet = workbook.worksheets[0];

    const headers = [];
    const uniqueValues = {};

    const firstRow = sheet.getRow(1);
    firstRow.eachCell((cell, colNumber) => {
        const header = cell.toString().trim();
        headers[colNumber] = header;
        uniqueValues[header] = new Set();
    });

    sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;

        row.eachCell((cell, colNumber) => {
            const header = headers[colNumber];
            if (header) {
                const val = cell.value ? cell.value.toString().trim() : '';
                if (val.length > 0 && uniqueValues[header].size < 20) { // Limit to 20 unique values for brevity
                    uniqueValues[header].add(val);
                } else if (val.length > 0) {
                    // Mark as 'Many' if limit reached
                    uniqueValues[header].add('...');
                }
            }
        });
    });

    for (const [header, values] of Object.entries(uniqueValues)) {
        // Cast values to Set to iterate
        const set = values;
        if (set.has('...')) {
            console.log(`${header}: > 20 unique values (e.g. ${Array.from(set).slice(0, 5).join(', ')})`);
        } else {
            console.log(`${header}: ${Array.from(set).sort().join(', ')}`);
        }
    }
}

analyzeAllColumns().catch(console.error);
