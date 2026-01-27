import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const OUTPUT_FILE = join(ROOT_DIR, 'scraped-metadata.json');

const BASE_URL = 'https://informationsmodeller.sdu.dk/dkuni/begrebsmodel/latest/EARoot/EA1/';
const INDEX_URL = `${BASE_URL}EA1.htm`;
const DIAGRAM_INDEX_URL = `${BASE_URL}EA2/EA981.htm`;

async function fetchPage(url) {
    try {
        const { data } = await axios.get(url);
        return cheerio.load(data);
    } catch (error) {
        console.error(`Error fetching ${url}:`, error.message);
        return null;
    }
}

async function scrape() {
    console.log('Starting scrape...');
    const metadata = {
        terms: {}, // termName -> { url, id, diagrams: [] }
        diagrams: [] // { title, url }
    };

    // 1. Scrape Term Index to get Term IDs and Detail URLs
    console.log(`Fetching Term Index: ${INDEX_URL}`);
    const $index = await fetchPage(INDEX_URL);
    if ($index) {
        let foundTerms = 0;
        // Look for <li><img ... alt="Class"/> <a href="...">Term</a></li>
        $index('img[alt="Class"]').each((_, img) => {
            const $a = $index(img).parent().find('a');
            const name = $a.text().trim();
            const href = $a.attr('href');

            if (name && href) {
                // href is like "EA4.htm"
                const id = href;
                const fullUrl = new URL(href, BASE_URL).toString();

                metadata.terms[name.toLowerCase()] = {
                    id: id,
                    url: fullUrl,
                    diagrams: []
                };
                foundTerms++;
            }
        });

        if (foundTerms === 0) {
            console.error(`\n⚠️  WARNING: No terms found on ${INDEX_URL}`);
            console.error('   Possible cause: The HTML structure of the Term Index page may have changed.');
            console.error('   Expected: <li><img alt="Class"/> <a href="...">Term</a></li>');
            console.error('   Consequence: Deep links will NOT be generated.\n');
        } else {
            console.log(`Found ${Object.keys(metadata.terms).length} terms.`);
        }
    } else {
        console.error(`\n❌ ERROR: Failed to load Term Index page at ${INDEX_URL}`);
    }

    // 2. Scrape Diagram Index
    console.log(`Fetching Diagram Index: ${DIAGRAM_INDEX_URL}`);
    const $diagIndex = await fetchPage(DIAGRAM_INDEX_URL);
    const diagramLinks = [];

    if ($diagIndex) {
        // Look for <li><img ... alt="Diagram"/> <a href="...">Title</a></li>
        $diagIndex('img[alt="Diagram"]').each((_, img) => {
            const $a = $diagIndex(img).parent().find('a');
            const title = $a.text().trim();
            const href = $a.attr('href'); // relative to EA2/EA981.htm, e.g., "EA939.htm"

            if (title && href) {
                const fullUrl = new URL(href, `${BASE_URL}EA2/`).toString();
                diagramLinks.push({ title, url: fullUrl });
            }
        });
    }
    console.log(`Found ${diagramLinks.length} diagrams.`);

    // 3. Scrape each Diagram Page for Term usage
    for (const diag of diagramLinks) {
        console.log(`Processing Diagram: ${diag.title}`);
        const $d = await fetchPage(diag.url);
        if (!$d) continue;

        // Find <area> tags in map
        // They typically look like <area shape="rect" coords="..." href="../EA643.htm" target="_self">
        // The href is relative to the diagram page. Diagram pages are in EA1/EA2/, Terms are in EA1/.
        // So "../EA643.htm" refers to EA1/EA643.htm

        $d('area').each((_, el) => {
            const href = $d(el).attr('href');
            if (!href) return;

            // Check if it links to a term (e.g., "../EA643.htm") or sub-packages (starts with ../)
            // We're looking for links that resolve to one of our Term IDs.
            // Our Term IDs are "EAxxx.htm".
            // The href "../EA643.htm" resolves to "EA643.htm" relative to the parent root.

            // Extract ID from href
            const parts = href.split('/');
            const linkedId = parts[parts.length - 1]; // "EA643.htm"

            // Find matching term by ID
            const termName = Object.keys(metadata.terms).find(key => metadata.terms[key].id === linkedId);

            if (termName) {
                // Avoid duplicates
                const exists = metadata.terms[termName].diagrams.find(d => d.url === diag.url);
                if (!exists) {
                    metadata.terms[termName].diagrams.push({
                        title: diag.title,
                        url: diag.url
                    });
                }
            }
        });
    }

    console.log('Writing metadata to file...');
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(metadata, null, 2));
    console.log(`Done. Saved to ${OUTPUT_FILE}`);
}

scrape().catch(console.error);
