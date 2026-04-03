import { useState, useMemo } from 'react';
import { Search, Loader2, Book, Filter, BookOpen, Info } from 'lucide-react';
import { useDictionary } from './hooks/useDictionary';
import { TermCard } from './components/TermCard';
import { formatStatus, getScopeLabel } from './utils';

function App() {
  const { loading, error, search, data, lastUpdated } = useDictionary();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Alle');
  const [scopeFilter, setScopeFilter] = useState<string>('Alle');

  const results = useMemo(() => {
    let filtered = search(query);

    if (statusFilter !== 'Alle') {
      filtered = filtered.filter(entry => formatStatus(entry.status) === statusFilter);
    }

    if (scopeFilter !== 'Alle') {
      filtered = filtered.filter(entry => {
        const label = getScopeLabel(entry.scope, entry.subject);
        return label === scopeFilter;
      });
    }

    return filtered;
  }, [query, statusFilter, scopeFilter, search]);

  const allTerms = useMemo(() => data.map(e => e.term), [data]);

  const handleTermClick = (term: string) => {
    setQuery(term);
    setStatusFilter('Alle');
    setScopeFilter('Alle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const uniqueStatuses = ['Alle', 'Implementeret', 'Godkendt', 'Kladde', 'Afvist'];
  const uniqueScopes = ['Alle', 'Kernebegreb', 'Fremmed begreb'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Henter begrebsliste...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-500">
        Fejl: {error.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Book className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">Ordbog for Uddannelsesbegreber</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Det Uofficielle Begrebskatalog for Uddannelsesdomænet på de Danske Universiteter</p>
            </div>
          </div>


          <div className="space-y-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow shadow-sm"
                placeholder="Søg efter begreber, definitioner, synonymer..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>


            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-0.5">
                <p>{results.length} resultater fundet</p>
                {(query || statusFilter !== 'Alle' || scopeFilter !== 'Alle') && (
                  <button
                    onClick={() => {
                      setQuery('');
                      setStatusFilter('Alle');
                      setScopeFilter('Alle');
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    Ryd søgning & filtre
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 ml-1">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="pl-9 pr-8 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-gray-900 dark:text-gray-100 placeholder-gray-500 text-sm h-10 w-40"
                      aria-label="Filtrer efter status"
                    >
                      {uniqueStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Filter className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 ml-1">
                    Begrebstype
                  </label>
                  <div className="relative">
                    <select
                      value={scopeFilter}
                      onChange={(e) => setScopeFilter(e.target.value)}
                      className="pl-9 pr-8 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-gray-900 dark:text-gray-100 placeholder-gray-500 text-sm h-10 w-44"
                      aria-label="Filtrer efter scope"
                    >
                      {uniqueScopes.map(scope => (
                        <option key={scope} value={scope}>{scope}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
        {results.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">Ingen resultater fundet</p>
            <p className="text-sm mt-2">Prøv at ændre dine søgekriterier.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((entry) => (
              <TermCard
                key={entry.id}
                entry={entry}
                highlight={query}
                allTerms={allTerms}
                onTermClick={handleTermClick}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm z-20 py-2.5">
        <div className="max-w-full mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-x-12 gap-y-1 text-[10px] leading-tight text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Info className="w-3 h-3 shrink-0 text-blue-500" />
            <p className="flex flex-wrap gap-x-1 items-center">
              <span className="font-semibold text-gray-700 dark:text-gray-300">DKUNI Begrebsmodel v1.1.0</span>
              {lastUpdated && <span className="opacity-70">({lastUpdated})</span>}
              <span className="hidden sm:inline mx-1">|</span>
              <span>Baseret på Begrebsmodel v. 2020, der er godkendt som del af Kopernikus-programmet i 2020.</span>
              <span className="text-gray-400 dark:text-gray-500 italic">Nye begreber tilføjes løbende fra Nyt SIS Programmet (status: Kladde).</span>
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a 
              href={`mailto:ordbog-for-uddannelsesbegreber@proton.me?subject=Generel feedback på ordbogen`}
              className="px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors flex items-center gap-1 font-medium"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              Giv feedback
            </a>
            <a href="https://informationsmodeller.sdu.dk/sis/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
              Kilde: SIS Informationsmodel
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;