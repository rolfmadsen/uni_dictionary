import * as fs from 'fs';
import ExcelJS from 'exceljs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT_FILE = join(__dirname, '..', 'begrebsliste_v1_1_0.xlsx');

async function analyzeLegislation() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(INPUT_FILE);
    const sheet = workbook.worksheets[0];

    const headers = [];
    sheet.getRow(1).eachCell((cell, colNumber) => {
        headers[colNumber] = cell.toString().trim();
    });

    const legCol = headers.findIndex(h => h === 'Lovgivning');
    if (legCol === -1) {
        console.log('Lovgivning column not found');
        return;
    }

    const counts = {};

    sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const val = row.getCell(legCol + 1).value; // +1 because getCell is 1-based, headers array index matches excel col index-1? Wait.
        // headers array is sparse, index == colNumber.
        // getCell(colNumber) matches.
        // headers index was populated using colNumber. So headers[colNumber] is corect.
        // So findIndex gives us the colNumber index.

        // Actually headers array indices match colNumber. So if 'Lovgivning' is at 10, headers[10] = 'Lovgivning'.
        // headers.findIndex will return 10.
        // row.getCell(10) is correct.

        const cellVal = row.getCell(legCol).value;

        // Double check logic:
        // firstRow.eachCell((cell, colNumber) => headers[colNumber] = val)
        // So headers[1] = 'Term'.
        // headers.findIndex(x=>x=='Term') -> 1.
        // row.getCell(1) -> correct.

        if (cellVal) {
            let text = cellVal.toString().trim();
            // Split by comma or newline to find distinct laws
            const parts = text.split(/[,\n]/).map(s => s.trim()).filter(s => s.length > 0);
            parts.forEach(p => {
                counts[p] = (counts[p] || 0) + 1;
            });
        }
    });

    // Sort by count
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    console.log(sorted.slice(0, 20));
}

analyzeLegislation();
