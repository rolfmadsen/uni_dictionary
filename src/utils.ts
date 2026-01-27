export const formatStatus = (raw: string | undefined): string => {
    if (!raw) return 'Kladde';
    const lower = raw.toLowerCase();
    if (lower.includes('implementeret') || lower.startsWith('8')) return 'Implementeret';
    if (lower.includes('godkendt') || lower.startsWith('5')) return 'Godkendt';
    if (lower.includes('afvist') || lower.startsWith('9')) return 'Afvist';
    if (lower.includes('draft') || lower.startsWith('1')) return 'Kladde';
    return raw;
};

export const getScopeLabel = (scope: string | undefined, subject: string | undefined) => {
    if (scope?.toLowerCase().includes('fremmed')) {
        return 'Fremmed begreb';
    }
    if (subject?.toLowerCase() === 'ja' || scope?.toLowerCase().includes('model')) {
        return 'Kernebegreb';
    }
    return null;
};
