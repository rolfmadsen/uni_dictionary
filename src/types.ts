export interface DictionaryEntry {
    id: string;
    term: string;
    definition?: string;
    definitionEn?: string;
    synonyms?: string;
    scope?: string;
    status?: string;
    subject?: string;
    legislation?: string;
    termEn?: string;
    example?: string;
    exampleEn?: string;
    explanation?: string;
    explanationEn?: string;
    modelLink?: string;
    diagrams?: { title: string; url: string }[];
}

export type DictionaryData = DictionaryEntry[];
