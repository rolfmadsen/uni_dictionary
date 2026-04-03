import React, { memo } from 'react';

interface TermLinkerProps {
    text: string;
    allTerms?: string[]; // Kept for interface compatibility but no longer used for expensive matching
    highlight?: string;
    onTermClick: (termName: string) => void;
}

/**
 * A HIGH-PERFORMANCE component that renders text with:
 * 1. Pre-computed internal links (identified by [[Marker]]).
 * 2. Highlighting for search matches.
 * 
 * Performance: Since the linking logic is now pre-processed at build-time into 
 * the [[...]] format, this component no longer needs to run a massive regex 
 * against 1000+ terms for every keystroke.
 */
export const TermLinker = memo(function TermLinker({ text, highlight, onTermClick }: TermLinkerProps) {
    if (!text) return null;

    // Helper to render highlight within a text segment
    const renderWithHighlight = (segmentText: string, searchHighlight?: string) => {
        if (!searchHighlight || !searchHighlight.trim()) return <React.Fragment>{segmentText}</React.Fragment>;

        const escapedHighlight = searchHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const highlightRegex = new RegExp(`(${escapedHighlight})`, 'gi');
        const subParts = segmentText.split(highlightRegex);

        return (
            <>
                {subParts.map((subPart, i) =>
                    subPart.toLowerCase() === searchHighlight.toLowerCase() ? (
                        <span key={i} className="bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-100 rounded px-0.5">
                            {subPart}
                        </span>
                    ) : (
                        subPart
                    )
                )}
            </>
        );
    };

    // Regex matches [[ and EVERYTHING until the first ]]
    const markerRegex = /\[\[(.*?)\]\]/g;
    const parts = text.split(markerRegex);

    return (
        <>
            {parts.map((part, i) => {
                const isTerm = i % 2 === 1;

                if (isTerm) {
                    return (
                        <button
                            key={i}
                            onClick={() => onTermClick(part)}
                            className="text-blue-600 dark:text-blue-400 font-medium hover:underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        >
                            {renderWithHighlight(part, highlight)}
                        </button>
                    );
                }

                return <React.Fragment key={i}>{renderWithHighlight(part, highlight)}</React.Fragment>;
            })}
        </>
    );
});
