import React, { useState, useEffect, useRef } from 'react';
import { GitPullRequest, Search, Play, Check, Keyboard, X } from 'lucide-react';

interface CommandHeaderProps {
  onSearch: (repoUrl: string) => void;
  isLoading: boolean;
  loadingStage: string;
  activeRepo: string;
}

const DEMO_REPOS = [
  { label: 'pallets/flask', slug: 'pallets/flask', lang: 'Python' },
  { label: 'fastapi/fastapi', slug: 'tiangolo/fastapi', lang: 'Python' },
  { label: 'expressjs/express', slug: 'expressjs/express', lang: 'Node.js' },
];

export const CommandHeader: React.FC<CommandHeaderProps> = ({
  onSearch,
  isLoading,
  loadingStage,
  activeRepo,
}) => {
  const [inputVal, setInputVal] = useState(activeRepo);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputVal(activeRepo);
  }, [activeRepo]);

  // Global ⌘K / Ctrl+K keyboard shortcut to focus search input, and ? for shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (e.key === '?' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }
      if (e.key === 'Escape' && showShortcuts) {
        setShowShortcuts(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showShortcuts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim() && !isLoading) {
      onSearch(inputVal.trim());
    }
  };

  return (
    <>
      <header className="bg-white border-b border-zinc-200 text-zinc-900 sticky top-0 z-30 shadow-xs">
        {/* Top linear progress bar (solid Cloudflare orange) */}
        {isLoading && (
          <div className="h-0.5 w-full bg-orange-100 overflow-hidden">
            <div className="h-full bg-orange-500 animate-[pulse_1s_infinite] w-full" />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Brand identity - Cloudflare / Grafana Developer Style */}
          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md border border-orange-200 bg-orange-50 flex items-center justify-center text-orange-600 shadow-2xs">
                <GitPullRequest className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-zinc-900 tracking-tight">
                    git-archaeologist
                  </span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-orange-50 text-orange-700 border border-orange-200 font-semibold">
                    v1.0
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 font-sans hidden sm:block">
                  Architectural Debt & Git Volatility Inspector
                </p>
              </div>
            </div>

            {/* Mobile shortcuts button */}
            <button
              onClick={() => setShowShortcuts(true)}
              className="md:hidden text-zinc-500 hover:text-zinc-800 p-1 rounded border border-zinc-200"
              title="Keyboard shortcuts"
            >
              <Keyboard className="w-4 h-4" />
            </button>
          </div>

          {/* Search Command Input */}
          <form onSubmit={handleSubmit} className="flex-1 max-w-xl w-full">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-zinc-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Enter public repository, e.g. pallets/flask or encode/uvicorn..."
                disabled={isLoading}
                className="w-full bg-zinc-50 border border-zinc-300 hover:border-zinc-400 focus:border-orange-500 focus:bg-white rounded-md pl-9 pr-24 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 font-mono focus:outline-none transition-colors"
              />
              <div className="absolute right-1.5 flex items-center gap-1.5">
                <kbd className="hidden sm:inline-block text-[10px] font-mono bg-white text-zinc-500 border border-zinc-300 rounded px-1.5 py-0.5 shadow-2xs">
                  ⌘K
                </kbd>
                <button
                  type="submit"
                  disabled={isLoading || !inputVal.trim()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-orange-600 hover:bg-orange-500 text-white disabled:opacity-40 transition-colors shadow-2xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Analyze</span>
                </button>
              </div>
            </div>
          </form>

          {/* Quick Demo Pre-baked Chips & Shortcuts Button */}
          <div className="flex items-center gap-1.5 shrink-0 w-full md:w-auto justify-end">
            <span className="text-[11px] text-zinc-400 font-mono uppercase tracking-wider hidden lg:inline mr-1">
              Snapshots:
            </span>
            {DEMO_REPOS.map((demo) => {
              const isActive = activeRepo === demo.slug;
              return (
                <button
                  key={demo.slug}
                  onClick={() => onSearch(demo.slug)}
                  disabled={isLoading}
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono transition-colors border ${
                    isActive
                      ? 'bg-orange-50 text-orange-700 border-orange-300 font-semibold shadow-2xs'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  {isActive && <Check className="w-3 h-3 text-orange-600 stroke-[3]" />}
                  <span>{demo.label.split('/')[1]}</span>
                </button>
              );
            })}

            <button
              onClick={() => setShowShortcuts(true)}
              className="hidden md:inline-flex items-center gap-1 text-xs font-mono text-zinc-500 hover:text-zinc-800 p-1.5 rounded border border-zinc-200 hover:bg-zinc-50 transition-colors ml-1 shadow-2xs"
              title="Keyboard Shortcuts (?)"
            >
              <Keyboard className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Loading status bar indicator */}
        {isLoading && (
          <div className="bg-orange-50 border-t border-orange-200 px-6 py-1.5 text-xs text-orange-800 flex items-center justify-between">
            <span className="font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-600 animate-ping inline-block" />
              {loadingStage || 'Auditing repository commits...'}
            </span>
            <span className="text-[11px] text-orange-600 font-mono">
              Cloning depth 50 into sandbox
            </span>
          </div>
        )}
      </header>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <div className="bg-white border border-zinc-200 rounded-lg max-w-sm w-full p-5 shadow-xl text-zinc-900 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-orange-600" />
                <h3 className="font-mono font-bold text-sm">Keyboard Shortcuts</h3>
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-600">Focus repository search</span>
                <kbd className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-300 rounded font-bold text-zinc-800 shadow-2xs">
                  ⌘K / Ctrl+K
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-600">Close Inspector Drawer</span>
                <kbd className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-300 rounded font-bold text-zinc-800 shadow-2xs">
                  Esc
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-600">Toggle shortcuts guide</span>
                <kbd className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-300 rounded font-bold text-zinc-800 shadow-2xs">
                  ?
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-zinc-600">Filter table hotspots</span>
                <span className="text-zinc-400 font-sans">Type in filter input</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowShortcuts(false)}
                className="w-full py-1.5 text-xs font-semibold rounded bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
