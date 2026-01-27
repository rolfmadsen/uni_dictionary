import type { DictionaryEntry } from '../types';
import { useState } from 'react';
import { BookOpen, Globe, Tag } from 'lucide-react';
import { formatStatus, getScopeLabel } from '../utils';

interface TermCardProps {
    entry: DictionaryEntry;
    highlight?: string;
}

const LEGISLATION_LINKS: Record<string, string> = {
    // 1. Universitetsloven (LBK nr 391 af 10/04/2024)
    'Universitetsloven': 'https://www.retsinformation.dk/eli/lta/2024/391',
    'Bekendtgørelse af lov om universiteter (universitetsloven)': 'https://www.retsinformation.dk/eli/lta/2024/391',

    // 2. Uddannelsesbekendtgørelsen (BEK nr 1119 af 19/09/2025)
    'Uddannelsesbekendtgørelsen': 'https://www.retsinformation.dk/eli/lta/2025/1119',
    'Bekendtgørelse om universitetsuddannelser tilrettelagt på heltid (uddannelsesbekendtgørelsen)': 'https://www.retsinformation.dk/eli/lta/2025/1119',

    // 3. Adgangsbekendtgørelsen (BEK nr 1120 af 19/09/2025)
    'Adgangsbekendtgørelsen': 'https://www.retsinformation.dk/eli/lta/2025/1120',
    'Bekendtgørelse om adgang til universitetsuddannelser tilrettelagt på heltid (adgangsbekendtgørelsen)': 'https://www.retsinformation.dk/eli/lta/2025/1120',

    // 4. Eksamensbekendtgørelsen (BEK nr 1121 af 19/09/2025)
    'Eksamensbekendtgørelsen': 'https://www.retsinformation.dk/eli/lta/2025/1121',
    'Bekendtgørelse om eksamen og censur ved universitetsuddannelser (eksamensbekendtgørelsen)': 'https://www.retsinformation.dk/eli/lta/2025/1121',

    // 5. Masterbekendtgørelsen (BEK nr 19 af 09/01/2020)
    'Masterbekendtgørelsen': 'https://www.retsinformation.dk/eli/lta/2020/19',

    // 6. LEP-loven (LBK nr 396 af 12/04/2024)
    'Bekendtgørelse af lov om erhvervsakademiudd. og professionsbachelorudd.': 'https://www.retsinformation.dk/eli/lta/2024/396',

    // 7. Adgangskursus (BEK nr 659 af 12/06/2025)
    'Bekendtgørelse om adgangskursus og adgangseksamen til ingeniøruddannelserne': 'https://www.retsinformation.dk/eli/lta/2025/659',
};

const Highlight = ({ text, highlight }: { text: string; highlight?: string }) => {
    if (!highlight || !highlight.trim()) return <>{text}</>;

    // Escape regex characters
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedHighlight})`, 'gi'));

    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === highlight.toLowerCase() ? (
                    <span key={i} className="bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 rounded px-0.5">
                        {part}
                    </span>
                ) : (
                    part
                )
            )}
        </>
    );
};

const LegislationDisplay = ({ text }: { text: string }) => {
    const parts = text.split(/,(?![^()]*\))/).map(s => s.trim());

    return (
        <div className="mt-2 text-xs text-gray-400 flex flex-col gap-1">
            {parts.map((part, i) => {
                const url = LEGISLATION_LINKS[part] || Object.entries(LEGISLATION_LINKS).find(([k]) => part.includes(k))?.[1];

                if (url) {
                    return (
                        <div key={i} className="flex items-start gap-1">
                            <span className="text-gray-400 font-serif font-bold text-base leading-none mt-0.5 select-none" aria-hidden="true">§</span>
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-600 hover:underline"
                            >
                                {part}
                            </a>
                        </div>
                    );
                }

                return (
                    <div key={i} className="text-gray-500">
                        {part}
                    </div>
                );
            })}
        </div>
    );
};

export function TermCard({ entry, highlight }: TermCardProps) {
    const [showEnglish, setShowEnglish] = useState(false);
    const statusLabel = formatStatus(entry.status);
    const scopeLabel = getScopeLabel(entry.scope, entry.subject);
    const modelSource = entry.scope?.includes('Begrebsmodel')
        ? { label: 'Begrebsmodel', url: 'https://informationsmodeller.sdu.dk/dkuni/begrebsmodel/latest/EARoot/EA1/EA1.htm' }
        : entry.scope?.includes('Informationsmodel')
            ? { label: 'Informationsmodel', url: 'https://informationsmodeller.sdu.dk/sis/v1_1_8/' }
            : null;

    const hasEnglishContent = !!(entry.definitionEn || entry.explanationEn || entry.exampleEn);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4 gap-4">
                <div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            <Highlight text={entry.term} highlight={highlight} />
                        </h3>
                        {scopeLabel && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${scopeLabel === 'Kernebegreb'
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                                }`}>
                                <BookOpen className="w-3 h-3 mr-1" />
                                {scopeLabel}
                            </span>
                        )}
                    </div>
                    {entry.termEn && (
                        hasEnglishContent ? (
                            <button
                                onClick={() => setShowEnglish(!showEnglish)}
                                className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none text-left"
                                title={showEnglish ? "Skjul engelsk oversættelse" : "Vis engelsk oversættelse"}
                            >
                                <Globe className={`w-3 h-3 ${showEnglish ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                                <Highlight text={entry.termEn} highlight={highlight} />
                            </button>
                        ) : (
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1 cursor-default" title="Ingen engelsk beskrivelse tilgængelig">
                                <Globe className="w-3 h-3 opacity-50" />
                                <Highlight text={entry.termEn} highlight={highlight} />
                            </p>
                        )
                    )}
                </div>
                <span className={`px-2 py-1 text-xs rounded-full border whitespace-nowrap ${statusLabel === 'Godkendt' || statusLabel === 'Implementeret'
                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                    : statusLabel === 'Afvist'
                        ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                    }`}>
                    {statusLabel}
                </span>
            </div>

            <div className="space-y-4">
                {entry.definition && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">Definition</h4>
                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                            <Highlight text={entry.definition} highlight={highlight} />
                        </p>
                    </div>
                )}

                {showEnglish && entry.definitionEn && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <Globe className="w-3 h-3 text-gray-400" /> Definition
                        </h4>
                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed italic border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                            <Highlight text={entry.definitionEn} highlight={highlight} />
                        </p>
                    </div>
                )}

                {entry.explanation && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">Forklaring</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                            <Highlight text={entry.explanation} highlight={highlight} />
                        </p>
                    </div>
                )}

                {showEnglish && entry.explanationEn && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <Globe className="w-3 h-3 text-gray-400" /> Explanation
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed italic border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                            <Highlight text={entry.explanationEn} highlight={highlight} />
                        </p>
                    </div>
                )}

                {entry.example && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded text-sm text-gray-600 dark:text-gray-400 italic">
                        <span className="font-semibold not-italic mr-1">Eksempel:</span>
                        <Highlight text={entry.example} highlight={highlight} />
                    </div>
                )}

                {showEnglish && entry.exampleEn && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded text-sm text-gray-600 dark:text-gray-400 italic border-l-4 border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-1 mb-1">
                            <Globe className="w-3 h-3 text-gray-400" />
                            <span className="font-semibold not-italic">Example:</span>
                        </div>
                        <Highlight text={entry.exampleEn} highlight={highlight} />
                    </div>
                )}

                {entry.synonyms && (
                    <div className="flex items-start gap-2">
                        <Tag className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Synonymer: </span>
                            <span className="text-gray-800 dark:text-gray-200">
                                <Highlight text={entry.synonyms} highlight={highlight} />
                            </span>
                        </div>
                    </div>
                )}

                {(modelSource || entry.diagrams?.length) && (
                    <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500">
                        {entry.diagrams && entry.diagrams.length > 0 && (
                            <div>
                                <span className="font-medium mr-2">Indgår i modeller:</span>
                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                    {entry.diagrams.map((d, i) => (
                                        <a key={i} href={d.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                            {d.title}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {modelSource && (
                            <div className="flex flex-wrap gap-2">
                                <span className="">Kilde:</span>
                                <a
                                    href={entry.modelLink || modelSource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                >
                                    {modelSource.label}
                                    {entry.modelLink && <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>}
                                </a>
                                {entry.scope &&
                                    entry.scope !== scopeLabel &&
                                    !entry.scope.includes('Begrebsmodel') &&
                                    !entry.scope.includes('Informationsmodel') && (
                                        <span className="text-gray-400 ml-2">
                                            ({entry.scope})
                                        </span>
                                    )}
                            </div>
                        )}
                    </div>
                )}

                {entry.legislation && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">Lovgivning</h4>
                        <LegislationDisplay text={entry.legislation} />
                    </div>
                )}
            </div>
        </div>
    );
}
