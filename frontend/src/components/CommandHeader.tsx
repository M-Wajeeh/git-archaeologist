import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Search, Play, Sparkles, CheckCircle2 } from 'lucide-react';

interface CommandHeaderProps {
  onSearch: (repoUrl: string) => void;
  isLoading: boolean;
  loadingStage: string;
  activeRepo: string;
}

const DEMO_REPOS = [
  { label: 'pallets/flask', slug: 'pallets/flask', desc: 'Python WSGI' },
  { label: 'fastapi/fastapi', slug: 'tiangolo/fastapi', desc: 'Python ASGI' },
  { label: 'expressjs/express', slug: 'expressjs/express', desc: 'Node.js Web' },
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
    <header className="relative bg-slate-900 border-b border-slate-800 px-6 py-3.5 z-20 shadow-lg">
      {/* Top Border Progress Shimmer */}
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-slate-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent w-1/2 animate-shimmer" />
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center text-cyan-400 shadow-inner">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold tracking-tight text-white text-base">
                git-archaeologist
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                PoC
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Architectural Debt Heatmap & Git Timeline
            </p>
          </div>
        </div>

        {/* Central Search Command Bar */}
        <form onSubmit={handleSubmit} className="flex-1 max-w-xl w-full">
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-slate-500 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Paste public GitHub URL (e.g. pallets/flask)..."
              disabled={isLoading}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/80 rounded-lg pl-10 pr-24 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 font-mono transition-all"
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              <kbd className="hidden sm:inline-block text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700 rounded px-1.5 py-0.5">
                ⌘K
              </kbd>
              <button
                type="submit"
                disabled={isLoading || !inputVal.trim()}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 disabled:opacity-40 transition-colors"
              >
                <Play className="w-3 h-3 fill-current" />
                Audit
              </button>
            </div>
          </div>
        </form>

        {/* 3 Quick-Load Demo Pills */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono hidden lg:inline">
            Demos:
          </span>
          {DEMO_REPOS.map((demo) => {
            const isActive = activeRepo === demo.slug || activeRepo === demo.label;
            return (
              <button
                key={demo.slug}
                type="button"
                onClick={() => onSearch(demo.slug)}
                disabled={isLoading}
                title={`Load ${demo.desc} repository snapshot`}
                className={`text-xs font-mono px-2.5 py-1 rounded-md border transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-800 text-cyan-300 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-950/60 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                }`}
              >
                {isActive && <CheckCircle2 className="w-3 h-3 text-cyan-400" />}
                {demo.label.split('/')[1]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Status Notification under search during Loading */}
      {isLoading && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-800/50 flex items-center justify-between text-xs text-slate-400 font-mono animate-pulse">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>{loadingStage || 'Processing repository commits...'}</span>
          </div>
          <span className="text-slate-500 text-[11px]">Depth: 50 commits</span>
        </div>
      )}
    </header>
  );
};
