import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const OUTPUT_FILE = join(ROOT_DIR, 'begrebsliste.xlsx');
const LANDING_PAGE_URL = 'https://informationsmodeller.sdu.dk/dkuni/';

async function harvest() {
    console.log(`Fetching landing page: ${LANDING_PAGE_URL}`);
    try {
        const { data } = await axios.get(LANDING_PAGE_URL);
        const $ = cheerio.load(data);

        // Strategy: Find the "Begrebsmodel" section, then find the xlsx link.
        // Based on provided HTML: <div class="column"> <h2>Begrebsmodel</h2> ... <div class="card"> ... <a href="...xlsx">

        let excelUrl = null;

        // Find the column with "Begrebsmodel" header
        $('.column').each((_, col) => {
            if ($(col).find('h2').text().includes('Begrebsmodel')) {
                // Look for xlsx link in this column
                $(col).find('a').each((_, a) => {
                    const href = $(a).attr('href');
                    if (href && href.endsWith('.xlsx') && href.includes('begrebsliste')) {
                        excelUrl = new URL(href, LANDING_PAGE_URL).toString();
                        return false; // Break loop
                    }
                });
            }
        });

        if (!excelUrl) {
            console.error('\n❌ ERROR: Could not find Excel file link on landing page.');
            console.error(`   Visited: ${LANDING_PAGE_URL}`);
            console.error('   Expected: A link ending in ".xlsx" under the "Begrebsmodel" column.');
            console.error('   Action: Check if the website layout has changed or if the file extension is no longer .xlsx.\n');
            process.exit(1);
        }

        console.log(`Found Excel URL: ${excelUrl}`);
        console.log(`Downloading to ${OUTPUT_FILE}...`);

        const response = await axios.get(excelUrl, { responseType: 'stream' });
        await pipeline(response.data, createWriteStream(OUTPUT_FILE));

        console.log('Download complete.');

    } catch (error) {
        console.error('Harvest failed:', error.message);
        process.exit(1);
    }
}

harvest();
