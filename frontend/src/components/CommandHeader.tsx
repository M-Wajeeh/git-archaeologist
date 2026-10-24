import React, { useState, useEffect, useRef } from 'react';
import { Search, Play, Check, ChevronDown, FolderGit2 } from 'lucide-react';

interface CommandHeaderProps {
  onSearch: (repoUrl: string) => void;
  isLoading: boolean;
  loadingStage: string;
  activeRepo: string;
  activeTab: 'map' | 'hotspots' | 'profiles' | 'report';
  onTabChange: (tab: 'map' | 'hotspots' | 'profiles' | 'report') => void;
}

const DEMO_REPOS = [
  { label: 'pallets/flask', slug: 'pallets/flask' },
  { label: 'tiangolo/fastapi', slug: 'tiangolo/fastapi' },
  { label: 'expressjs/express', slug: 'expressjs/express' },
];

export const CommandHeader: React.FC<CommandHeaderProps> = ({
  onSearch,
  isLoading,
  loadingStage,
  activeRepo,
  activeTab,
  onTabChange,
}) => {
  const [inputVal, setInputVal] = useState(activeRepo);
  const [isRepoPickerOpen, setIsRepoPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputVal(activeRepo);
  }, [activeRepo]);

  // Global ⌘K / Ctrl+K keyboard shortcut
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

  // Click outside to close picker
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsRepoPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim() && !isLoading) {
      onSearch(inputVal.trim());
      setIsRepoPickerOpen(false);
    }
  };

  const cleanRepoName = activeRepo.replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');

  return (
    <header className="bg-white border-b border-zinc-200 text-zinc-900 sticky top-0 z-30">
      {/* Top linear progress bar during live shallow clone */}
      {isLoading && (
        <div className="h-0.5 w-full bg-orange-100 overflow-hidden">
          <div className="h-full bg-orange-600 animate-[pulse_1s_infinite] w-full" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Brand Identity & Active Repository Dropdown */}
        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            {/* Concept 1 Dark Brand Icon */}
            <div className="w-7 h-7 rounded bg-zinc-900 flex items-center justify-center text-white shadow-xs">
              <FolderGit2 className="w-4 h-4 text-orange-400" />
            </div>
            <span className="font-mono font-bold text-sm tracking-tight text-zinc-900">
              GitArchaeologist
            </span>
          </div>

          {/* Repo Selector Dropdown (Concept 1 style) */}
          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => setIsRepoPickerOpen((prev) => !prev)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 transition-colors shadow-2xs"
            >
              <span>{cleanRepoName}</span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>

            {isRepoPickerOpen && (
              <div className="absolute left-0 mt-1.5 w-60 bg-white border border-zinc-200 rounded-lg shadow-xl py-1.5 z-40 text-xs font-mono">
                <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-zinc-400 font-bold border-b border-zinc-100">
                  Switch Demo Snapshot:
                </div>
                {DEMO_REPOS.map((demo) => (
                  <button
                    key={demo.slug}
                    onClick={() => {
                      onSearch(demo.slug);
                      setIsRepoPickerOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-zinc-50 transition-colors ${
                      activeRepo === demo.slug ? 'font-bold text-orange-600 bg-orange-50/50' : 'text-zinc-700'
                    }`}
                  >
                    <span>{demo.label}</span>
                    {activeRepo === demo.slug && <Check className="w-3.5 h-3.5 text-orange-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Navigation Pills (Concept 1: Map, Hotspots, Profiles, Report) */}
        <div className="hidden lg:flex items-center gap-1 p-0.5 rounded-lg bg-zinc-100 border border-zinc-200 text-xs font-mono">
          <button
            onClick={() => onTabChange('map')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'map'
                ? 'bg-zinc-900 text-white font-bold shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Map
          </button>
          <button
            onClick={() => onTabChange('hotspots')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'hotspots'
                ? 'bg-zinc-900 text-white font-bold shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Hotspots
          </button>
          <button
            onClick={() => onTabChange('profiles')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'profiles'
                ? 'bg-zinc-900 text-white font-bold shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Profiles
          </button>
          <button
            onClick={() => onTabChange('report')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'report'
                ? 'bg-zinc-900 text-white font-bold shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Report
          </button>
        </div>

        {/* Right: Search Input & Analyze / Share Action */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <form onSubmit={handleSubmit} className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Search repo, e.g. encode/uvicorn..."
              disabled={isLoading}
              className="w-full bg-zinc-50 border border-zinc-300 focus:border-zinc-500 focus:bg-white rounded-md pl-8 pr-12 py-1.5 text-xs font-mono text-zinc-900 placeholder-zinc-400 focus:outline-none transition-colors"
            />
            <kbd className="hidden sm:inline-block absolute right-2 top-2 text-[10px] font-mono text-zinc-400 bg-white border border-zinc-200 rounded px-1 shadow-2xs">
              ⌘K
            </kbd>
          </form>

          <button
            onClick={handleSubmit}
            disabled={isLoading || !inputVal.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-md bg-zinc-900 hover:bg-zinc-800 text-white disabled:opacity-40 transition-colors shadow-2xs shrink-0"
          >
            <Play className="w-3 h-3 fill-current text-orange-400" />
            <span>Analyze</span>
          </button>
        </div>
      </div>

      {/* Loading banner */}
      {isLoading && (
        <div className="bg-orange-50 border-t border-orange-200 px-6 py-1.5 text-xs text-orange-800 flex items-center justify-between">
          <span className="font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-600 animate-ping inline-block" />
            {loadingStage || 'Auditing repository commits shallow depth 50...'}
          </span>
          <span className="text-[11px] text-orange-600 font-mono">
            Sandboxed shallow clone
          </span>
        </div>
      )}
    </header>
  );
};
