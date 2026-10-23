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
    <header className="bg-zinc-950 border-b border-zinc-800 text-zinc-100 sticky top-0 z-20">
      {/* Top linear progress bar (solid blue, no gradients) */}
      {isLoading && (
        <div className="h-0.5 w-full bg-zinc-800 overflow-hidden">
          <div className="h-full bg-blue-500 animate-[pulse_1s_infinite] w-full" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand identity - Developer tool style */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-300">
            <GitPullRequest className="w-4 h-4 text-blue-400" />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-zinc-100 tracking-tight">
                git-archaeologist
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                Audit
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans">
              Architectural Debt & Git Volatility Inspector
            </p>
          </div>
        </div>

        {/* Search Command Input */}
        <form onSubmit={handleSubmit} className="flex-1 max-w-lg w-full">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-zinc-500 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="e.g. pallets/flask or github.com/owner/repo"
              disabled={isLoading}
              className="w-full bg-zinc-900 border border-zinc-700 hover:border-zinc-600 focus:border-blue-500 rounded-md pl-9 pr-24 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 font-mono focus:outline-none transition-colors"
            />
            <div className="absolute right-1.5 flex items-center gap-1.5">
              <kbd className="hidden sm:inline-block text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700 rounded px-1.5 py-0.5">
                ⌘K
              </kbd>
              <button
                type="submit"
                disabled={isLoading || !inputVal.trim()}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-colors"
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                Analyze
              </button>
            </div>
          </div>
        </form>

        {/* Demo Repositories */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-mono text-zinc-500 uppercase mr-1">
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
                    ? 'bg-zinc-800 text-blue-400 border-blue-500/60 font-semibold'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-700/80'
                }`}
              >
                {isActive && <Check className="w-3 h-3 text-blue-400" />}
                {demo.label.split('/')[1]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clean status bar during loading (no sparkles or spinners) */}
      {isLoading && (
        <div className="bg-zinc-900 border-t border-zinc-800 px-6 py-1.5 text-xs font-mono text-zinc-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span>{loadingStage || 'Analyzing repository commits...'}</span>
          </div>
          <span className="text-zinc-500">History window: 50 commits</span>
        </div>
      )}
    </header>
  );
};
