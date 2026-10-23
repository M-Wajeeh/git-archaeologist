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
    <header className="bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-20 shadow-xs">
      {/* Top linear progress bar (solid blue) */}
      {isLoading && (
        <div className="h-0.5 w-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-blue-600 animate-[pulse_1s_infinite] w-full" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand identity - Developer tool style */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded border border-slate-300 bg-slate-100 flex items-center justify-center text-blue-600 shadow-2xs">
            <GitPullRequest className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-slate-900 tracking-tight">
                git-archaeologist
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                Audit
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Architectural Debt & Git Volatility Inspector
            </p>
          </div>
        </div>

        {/* Search Command Input */}
        <form onSubmit={handleSubmit} className="flex-1 max-w-lg w-full">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="e.g. pallets/flask or github.com/owner/repo"
              disabled={isLoading}
              className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:bg-white rounded-md pl-9 pr-24 py-1.5 text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none transition-colors"
            />
            <div className="absolute right-1.5 flex items-center gap-1.5">
              <kbd className="hidden sm:inline-block text-[10px] font-mono bg-white text-slate-500 border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs">
                ⌘K
              </kbd>
              <button
                type="submit"
                disabled={isLoading || !inputVal.trim()}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-colors shadow-2xs"
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                Analyze
              </button>
            </div>
          </div>
        </form>

        {/* Demo Repositories */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-mono text-slate-500 uppercase mr-1">
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
                    ? 'bg-blue-50 text-blue-700 border-blue-400 font-semibold shadow-2xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-300'
                }`}
              >
                {isActive && <Check className="w-3 h-3 text-blue-600" />}
                {demo.label.split('/')[1]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clean status bar during loading */}
      {isLoading && (
        <div className="bg-blue-50/60 border-t border-blue-100 px-6 py-1.5 text-xs font-mono text-blue-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span>{loadingStage || 'Analyzing repository commits...'}</span>
          </div>
          <span className="text-blue-600">History window: 50 commits</span>
        </div>
      )}
    </header>
  );
};
