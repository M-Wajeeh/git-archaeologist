import React, { useState, useEffect, useRef } from 'react';
import { GitPullRequest, Search, Play, Check } from 'lucide-react';

interface CommandHeaderProps {
  onSearch: (repoUrl: string) => void;
  isLoading: boolean;
  loadingStage: string;
  activeRepo: string;
}

const DEMO_REPOS = [
  { label: 'pallets/flask', slug: 'pallets/flask', lang: 'Python' },
  { label: 'fastapi/fastapi', slug: 'tiangolo/fastapi', lang: 'Python' },
  { label: 'expressjs/express', slug: 'expressjs/express', lang: 'JavaScript' },
];

export const CommandHeader: React.FC<CommandHeaderProps> = ({
  onSearch,
  isLoading,
  loadingStage,
  activeRepo,
}) => {
  const [inputVal, setInputVal] = useState(activeRepo);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputVal(activeRepo);
  }, [activeRepo]);

  // Global ⌘K / Ctrl+K keyboard shortcut to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim() && !isLoading) {
      onSearch(inputVal.trim());
    }
  };

  return (
    <header className="bg-[#faf8f4] border-b border-[#e5dfd5] text-stone-900 sticky top-0 z-20 shadow-xs">
      {/* Top linear progress bar (solid warm terracotta) */}
      {isLoading && (
        <div className="h-0.5 w-full bg-[#ede8df] overflow-hidden">
          <div className="h-full bg-[#c2410c] animate-[pulse_1s_infinite] w-full" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand identity - Warm Craft Developer Tool Style */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded border border-[#d8d0c2] bg-[#ede8df] flex items-center justify-center text-[#c2410c] shadow-2xs">
            <GitPullRequest className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-stone-900 tracking-tight">
                git-archaeologist
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#ede8df] text-stone-700 border border-[#d8d0c2] font-semibold">
                Audit
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-sans">
              Architectural Debt & Git Volatility Inspector
            </p>
          </div>
        </div>

        {/* Search Command Input */}
        <form onSubmit={handleSubmit} className="flex-1 max-w-lg w-full">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-stone-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="e.g. pallets/flask or github.com/owner/repo"
              disabled={isLoading}
              className="w-full bg-[#f4efe6] border border-[#dcd5c9] hover:border-[#b8ac96] focus:border-[#c2410c] focus:bg-white rounded-md pl-9 pr-24 py-1.5 text-xs text-stone-900 placeholder-stone-400 font-mono focus:outline-none transition-colors"
            />
            <div className="absolute right-1.5 flex items-center gap-1.5">
              <kbd className="hidden sm:inline-block text-[10px] font-mono bg-[#ede8df] text-stone-600 border border-[#d8d0c2] rounded px-1.5 py-0.5 shadow-2xs">
                ⌘K
              </kbd>
              <button
                type="submit"
                disabled={isLoading || !inputVal.trim()}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-stone-900 hover:bg-stone-800 text-stone-100 disabled:opacity-40 transition-colors shadow-2xs"
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                Analyze
              </button>
            </div>
          </div>
        </form>

        {/* Demo Repositories */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-mono text-stone-500 uppercase mr-1">
            Samples:
          </span>
          {DEMO_REPOS.map((demo) => {
            const isActive = activeRepo === demo.slug || activeRepo === demo.label;
            return (
              <button
                key={demo.slug}
                type="button"
                onClick={() => onSearch(demo.slug)}
                disabled={isLoading}
                className={`text-xs font-mono px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#fff7ed] text-[#c2410c] border-[#fdba74] font-semibold shadow-2xs'
                    : 'bg-[#ede8df] hover:bg-[#e4ded3] text-stone-700 hover:text-stone-900 border-[#d8d0c2]'
                }`}
              >
                {isActive && <Check className="w-3 h-3 text-[#c2410c]" />}
                {demo.label.split('/')[1]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Warm status bar during loading */}
      {isLoading && (
        <div className="bg-[#fff7ed] border-t border-[#fed7aa] px-6 py-1.5 text-xs font-mono text-[#9a3412] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#c2410c] animate-ping" />
            <span>{loadingStage || 'Analyzing repository commits...'}</span>
          </div>
          <span className="text-stone-600">History window: 50 commits</span>
        </div>
      )}
    </header>
  );
};
