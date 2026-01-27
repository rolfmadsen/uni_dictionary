# Project Initiation Document: Online University Dictionary

## 1. Project Overview
The goal of this project is to develop an online, searchable dictionary for the Danish university education domain. The application will provide students, staff, and administrators with clear definitions, synonyms, and translations of key terms used within the sector.

## 2. Background
The educational sector in Denmark is moving towards a common "New SIS" (Studieadministrative Informationssystemer), based on the shared "DKUNI" information model. A standardized list of terms (`begrebsliste_v1_1_0.xlsx`, derived from the DKUNI Concept Model) ensures clear communication. There is now a need to make these standardized definitions easily accessible via a user-friendly web interface.

## 3. Objectives
- **Accessibility**: Make the standardized terminology (from the DKUNI/SIS model) available to a broad audience online.
- **Clarity**: Provide clear definitions, examples, and explanations for each term in both Danish and English.
- **Standardization**: Promote the use of preferred terms as defined in the official SIS information models.

## 4. Scope
### 4.1 In Scope
- **Data Import**: Parsing and importing the `begrebsliste_v1_1_0.xlsx` file (corresponding to SIS Information Model v1.1.0 from August 2024).
- **Web Application**:
    - **Search Functionality**: Search by term, synonym, or ID in both Danish and English.
    - **Detail View**: Display comprehensive information for each term including definitions, examples, and legislative references.
    - **Filtering**: Filter terms by "Subject Area" (Emneområde) or "Status".
- **Localization**: Support for the bilingual nature of the dataset (Danish/English).

### 4.2 Out of Scope
- **Term Management**: The application is a *viewer* for the dictionary. The master data is managed by the SIS/DKUNI project at [informationsmodeller.sdu.dk](https://informationsmodeller.sdu.dk/sis/).
- **User Accounts**: The dictionary will be public and does not require authentication for viewing.

## 5. Data Source
- **Primary Source**: `begrebsliste_v1_1_0.xlsx`, sourced from the [SIS Information Model](https://informationsmodeller.sdu.dk/sis/) (likely v1.1.0).
- **Context**: Part of the "Nyt SIS" and "DKUNI" common information model for higher education in Denmark.
- **Key Data Points**:
    - `Term (foretrukken)`: The primary term name.
    - `Definition` / `Definition (en)`: The core meaning.
    - `Synonym (accepteret)`: Alternative valid terms.
    - `Tilhører emneområdet`: Categorization.
    - `Lovgivning`: References to relevant laws.

## 6. Deliverables
1.  **Project Initiation Document** (This document).
2.  **Implementation Plan**: Technical design and roadmap.
3.  **Web Application**: Functional dictionary site.
4.  **Source Code Repository**: Hosted on GitHub.

## 7. Assumptions & Constraints
- The structure of the Excel source file is stable.
- The application will be a static web app or a lightweight server-side app suitable for simple hosting.
- The project is open-source or internal to the organization.

## 8. Next Steps
1.  Approve this Project Initiation Document.
2.  Design the technical architecture (Implementation Plan).
3.  Begin development of the data parser and frontend interface.
