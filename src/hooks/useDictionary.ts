import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import type { DictionaryEntry } from '../types';

export function useDictionary() {
    const [data, setData] = useState<DictionaryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Use import.meta.env.BASE_URL to ensure correct path in GitHub Pages
        const basePath = import.meta.env.BASE_URL.endsWith('/')
            ? import.meta.env.BASE_URL
            : `${import.meta.env.BASE_URL}/`;

        fetch(`${basePath}dictionary.json`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to load dictionary');
                return res.json();
            })
            .then((jsonData: DictionaryEntry[]) => {
                // Sort alphabetically by term
                return jsonData.sort((a, b) => a.term.localeCompare(b.term, 'da'));
            })
            .then(setData)
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

    return { data, loading, error, search };
}
