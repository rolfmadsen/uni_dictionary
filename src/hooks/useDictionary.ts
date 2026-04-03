import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import type { DictionaryEntry } from '../types';

export function useDictionary() {
    const [data, setData] = useState<DictionaryEntry[]>([]);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Use import.meta.env.BASE_URL to ensure correct path in GitHub Pages
        const basePath = import.meta.env.BASE_URL.endsWith('/')
            ? import.meta.env.BASE_URL
            : `${import.meta.env.BASE_URL}/`;

        const dataUrl = `${basePath}dictionary.json`;
        const infoUrl = `${basePath}build-info.json`;

        Promise.all([
            fetch(dataUrl).then(res => {
                if (!res.ok) throw new Error('Failed to load dictionary');
                return res.json();
            }),
            fetch(infoUrl).then(res => {
                if (!res.ok) return { lastUpdated: null }; // Silent fail for metadata
                return res.json();
            })
        ])
        .then(([jsonData, infoData]: [DictionaryEntry[], { lastUpdated: string | null }]) => {
            // Sort alphabetically by term
            const sortedData = jsonData.sort((a, b) => a.term.localeCompare(b.term, 'da'));
            setData(sortedData);
            setLastUpdated(infoData.lastUpdated);
        })
        .catch(setError)
        .finally(() => setLoading(false));
    }, []);

    const fuse = useMemo(() => {
        return new Fuse(data, {
            keys: [
                { name: 'term', weight: 2 },
                { name: 'synonyms', weight: 1.5 },
                { name: 'id', weight: 1 },
                { name: 'termEn', weight: 1.5 },
                'definition',
                'ai-definition',
                'legislation',
            ],
            threshold: 0.3,
            ignoreLocation: true,
        });
    }, [data]);

    const search = (query: string) => {
        if (!query) return data;
        return fuse.search(query).map(result => result.item);
    };

    return { data, lastUpdated, loading, error, search };
}
