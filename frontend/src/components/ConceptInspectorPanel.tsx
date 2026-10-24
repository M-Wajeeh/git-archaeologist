import React, { useState } from 'react';
import { FileHotspot } from '../types';
import {
  FileCode2,
  ExternalLink,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Flame,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';

interface ConceptInspectorPanelProps {
  file: FileHotspot | null;
  activeRepo: string;
  totalFilesCount: number;
  highRiskCount: number;
  onOpenFullDrawer: () => void;
}

export const ConceptInspectorPanel: React.FC<ConceptInspectorPanelProps> = ({
  file,
  activeRepo,
  totalFilesCount,
  highRiskCount,
  onOpenFullDrawer,
}) => {
  const [copied, setCopied] = useState(false);

  if (!file) {
    return (
      <div className="bg-[#0b1120] text-white rounded-xl p-6 border border-zinc-800 shadow-lg text-center flex flex-col items-center justify-center min-h-[360px]">
        <FileCode2 className="w-10 h-10 text-zinc-600 mb-3" />
        <p className="text-zinc-300 font-mono text-sm font-semibold">Select a file tile</p>
        <p className="text-zinc-500 text-xs mt-1 max-w-xs">
          Click any block on the Area Map to inspect its churn metrics, architectural debt score, and refactoring plan.
        </p>
      </div>
    );
  }

  const cleanRepo = activeRepo.replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
  const githubFileUrl = cleanRepo ? `https://github.com/${cleanRepo}/blob/HEAD/${file.path}` : null;

  const handleCopyPath = () => {
    navigator.clipboard.writeText(file.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isCritical = file.debt_score >= 70;
  const isModerate = file.debt_score >= 40 && file.debt_score < 70;

  return (
    <div className="space-y-4">
      {/* 1. Deep Obsidian Dark Inspector Card (Concept 1 signature) */}
      <div className="bg-[#0b1120] text-white rounded-xl p-5 border border-slate-800 shadow-xl space-y-4">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-orange-400 font-semibold block">
              Hotspot Inspection
            </span>
            <h3 className="text-lg font-mono font-bold text-white truncate max-w-[220px] mt-0.5" title={file.path}>
              {file.path.split('/').pop()}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-[11px] font-mono text-zinc-400 truncate max-w-[180px]" title={file.path}>
                {file.path}
              </p>
              <button
                onClick={handleCopyPath}
                title="Copy file path"
                className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {githubFileUrl && (
            <a
              href={githubFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open file on GitHub"
              className="text-zinc-400 hover:text-white p-1.5 rounded bg-zinc-800/80 hover:bg-zinc-700 transition-colors border border-zinc-700/60"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Large Debt Score Display */}
        <div className="flex items-baseline justify-between pt-1 border-t border-zinc-800/80">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-mono font-extrabold text-amber-400 tracking-tight leading-none">
              {file.debt_score}
            </span>
            <span className="text-xs font-mono text-zinc-400">/ 100</span>
          </div>

          <span
            className={`text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded font-bold border ${
              isCritical
                ? 'bg-red-950/80 text-red-300 border-red-800'
                : isModerate
                ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
            }`}
          >
            {isCritical ? 'Critical Hotspot' : isModerate ? 'Moderate Risk' : 'Healthy Edge'}
          </span>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/60 text-center font-mono">
          <div className="bg-zinc-900/90 rounded p-2 border border-zinc-800">
            <p className="text-sm font-bold text-white">{file.churn_count}</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">Commits</p>
          </div>
          <div className="bg-zinc-900/90 rounded p-2 border border-zinc-800">
            <p className="text-sm font-bold text-white">{file.unique_authors}</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">Authors</p>
          </div>
          <div className="bg-zinc-900/90 rounded p-2 border border-zinc-800">
            <p className="text-sm font-bold text-white">{file.lines.toLocaleString()}</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">Lines</p>
          </div>
        </div>

        {/* Diagnostic Explanation Summary */}
        <div className="text-xs text-zinc-300 bg-zinc-900/70 p-3 rounded-lg border border-zinc-800/80 leading-relaxed font-sans">
          {file.churn_count > 15 && file.unique_authors >= 4 ? (
            <p>
              <strong className="text-amber-300 font-mono font-medium">{file.path.split('/').pop()}</strong> has accrued{' '}
              {file.churn_count} commits across {file.unique_authors} contributors. High multi-author velocity creates frequent merge contention and architectural inertia.
            </p>
          ) : (
            <p>
              Modifications are moderately dispersed across {file.unique_authors} contributors with {file.lines} lines of code. Isolated maintenance boundaries recommended.
            </p>
          )}
        </div>

        {/* Two Concrete Refactoring Steps */}
        <div className="space-y-1.5 text-xs font-sans">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
            Refactor Plan
          </span>
          <div className="space-y-1 font-mono text-[11px] text-zinc-300">
            <div className="flex items-start gap-2 bg-zinc-900/50 p-2 rounded border border-zinc-800/60">
              <span className="text-amber-400 font-bold shrink-0">1.</span>
              <span>Decompose top-level routing into discrete sub-domain modules.</span>
            </div>
            <div className="flex items-start gap-2 bg-zinc-900/50 p-2 rounded border border-zinc-800/60">
              <span className="text-amber-400 font-bold shrink-0">2.</span>
              <span>Extract shared configuration state into pluggable context dispatchers.</span>
            </div>
          </div>
        </div>

        {/* Primary Action Button (Concept 1 signature warm gold pill) */}
        <div className="pt-2">
          <button
            onClick={onOpenFullDrawer}
            className="w-full py-2 px-4 rounded-lg bg-[#f6d070] hover:bg-[#eab308] text-zinc-950 font-mono font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
          >
            <span>View Full Analysis &amp; Touchpoints</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. "What the dig turned up" Insight Findings Card (Concept 1 signature) */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs space-y-3">
        <h4 className="font-mono font-bold text-xs uppercase tracking-tight text-zinc-900 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-orange-600" />
          <span>What the dig turned up</span>
        </h4>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0 mt-0.5">
              <Flame className="w-3 h-3 text-red-600" />
            </div>
            <div className="leading-tight">
              <p className="font-semibold text-zinc-900">Frequent churn bottleneck</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Top 4 files absorb over 40% of all commit modifications across the codebase.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
              <TrendingUp className="w-3 h-3 text-amber-600" />
            </div>
            <div className="leading-tight">
              <p className="font-semibold text-zinc-900">Coordination friction</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {highRiskCount} files require simultaneous modifications across multiple contributors.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
            </div>
            <div className="leading-tight">
              <p className="font-semibold text-zinc-900">Healthy architectural edges</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {Math.max(1, totalFilesCount - highRiskCount)} files demonstrate clean modular isolation and low commit velocity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
