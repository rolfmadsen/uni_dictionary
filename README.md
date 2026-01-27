# Ordbog for Uddannelsesbegreber i Nyt SIS Programmet (DKUNI)

En hurtig, søgbar og brugervenlig online ordbog for den fælles begrebsmodel på det danske universitetsområde. Baseret på data fra [DKUNI Begrebsmodel](https://informationsmodeller.sdu.dk/dkuni/).

![Screenshot of Application](https://informationsmodeller.sdu.dk/dkuni/static/umlicon.jpg)

## 🌟 Funktionalitet

*   **Lynhurtig Søgning**: Fuzzy search (Fuse.js) finder begreber, selvom du staver lidt forkert.
*   **Filtrering**: Filtrer på status (Godkendt, Kladde, etc.) og emneområde (Scope).
*   **Dybde-links**: Direkte links fra hvert begreb til dets officielle definition i HTML-eksporten.
*   **Diagram-visning**: Se præcis hvilke modeller og diagrammer et begreb indgår i.
*   **Engelsk Oversættelse**: Indbygget toggle for at se engelske termer, definitioner og forklaringer.
*   **Lovgivning**: Direkte links til retsinformation.dk for begreber knyttet til paragraffer.

## 🛠️ Teknisk Stack

*   **Frontend**: React 19 + TypeScript (bygget med Vite)
*   **Styling**: Tailwind CSS v4
*   **Data**: JSON-baseret (genereret fra Excel) - Ingen backend database.
*   **Hosting**: GitHub Pages (100% statisk site)

## 🚀 Kom i gang

### Installation

```bash
# Hent koden
git clone https://github.com/din-bruger/uni_dictionary.git
cd uni_dictionary

# Installer afhængigheder
npm install

# Start udviklingsserver
npm run dev
```

### Opdatering af Data (Fuldautomatisk)

Når SDU/DKUNI udgiver en ny version af begrebsmodellen (Excel-fil eller HTML-eksport), kan du opdatere hele ordbogen med én kommando:

```bash
npm run update-all
```

Denne kommando udfører følgende 3 trin:
1.  **Harvest**: Henter den nyeste `begrebsliste_*.xlsx` fra [informationsmodeller.sdu.dk](https://informationsmodeller.sdu.dk/dkuni/).
2.  **Scrape**: Crawler HTML-eksporten for at finde dybe links og diagram-referencer.
3.  **Build**: Bygger den nye applikation med de friske data.

### Manuelt Build

Hvis du vil bygge applikationen uden at hente nye data:

```bash
npm run build
```

## 🤖 CI/CD Automatisering

Projektet indeholder en **GitHub Action** (`.github/workflows/deploy.yml`), der automatisk:
*   Kører hver morgen kl. 06:00 UTC.
*   Kører `npm run update-all`.
*   Opdaterer live-sitet på GitHub Pages med de nyeste ændringer.

Du behøver derfor sjældent at opdatere manuelt, medmindre du ønsker ændringer her og nu.

## 📂 Projektstruktur

*   `/public/dictionary.json`: Den genererede datafil, som appen indlæser.
*   `/scripts`:
    *   `src/harvest.js`: Downloader Excel-filen.
    *   `src/scrape-links.js`: Scraper websites for metadata.
    *   `src/build-data.js`: Konverterer Excel + Metadata til JSON.
*   `/src`: React kildekode.

## 📝 Fejlfinding

Hvis `npm run update-all` fejler:

*   **"Could not find Excel file link"**: Tjek om SDUs website har ændret layout eller filnavn. Opdater selector i `scripts/harvest.js`.
*   **"No terms found"**: Tjek om HTML-eksporten har ændret ikoner eller struktur. Opdater selectors i `scripts/scrape-links.js`.

---

Udviklet til det danske universitetslandskab.
