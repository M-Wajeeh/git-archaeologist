import React, { useEffect, useState } from 'react';
import { FileHotspot, DiagnosisResult } from '../types';
import { diagnoseHotspot } from '../services/api';
import {
  X,
  GitCommit,
  Users,
  FileCode2,
  Calendar,
  AlertTriangle,
  Lightbulb,
  Cpu,
  Layers,
} from 'lucide-react';

interface InspectorDrawerProps {
  file: FileHotspot | null;
  onClose: () => void;
}

export const InspectorDrawer: React.FC<InspectorDrawerProps> = ({ file, onClose }) => {
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [isLoadingDiagnosis, setIsLoadingDiagnosis] = useState<boolean>(false);
  const [diagError, setDiagError] = useState<string | null>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Request AI diagnosis when a file is opened
  useEffect(() => {
    if (!file) {
      setDiagnosis(null);
      return;
    }

    let isMounted = true;
    setIsLoadingDiagnosis(true);
    setDiagError(null);

    diagnoseHotspot(file)
      .then((res) => {
        if (isMounted) setDiagnosis(res);
      })
      .catch((err) => {
        if (isMounted) setDiagError(err.message || 'Unable to generate diagnosis');
      })
      .finally(() => {
        if (isMounted) setIsLoadingDiagnosis(false);
      });

    return () => {
      isMounted = false;
    };
  }, [file]);

  if (!file) return null;

  const getPriorityLabel = (score: number) => {
    if (score >= 85) return { label: 'P0 - Immediate', color: 'text-[#991b1b] border-[#fecaca] bg-[#fef2f2]' };
    if (score >= 70) return { label: 'P1 - High', color: 'text-[#c2410c] border-[#fed7aa] bg-[#fff7ed]' };
    if (score >= 40) return { label: 'P2 - Moderate', color: 'text-[#92400e] border-[#fde68a] bg-[#fffbeb]' };
    return { label: 'P3 - Low', color: 'text-[#166534] border-[#bbf7d0] bg-[#f0fdf4]' };
  };

  const priority = getPriorityLabel(file.debt_score);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Soft Blurred Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/40 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-xl bg-[#faf8f5] border-l border-[#e4ded3] text-stone-900 flex flex-col shadow-2xl overflow-y-auto">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#e4ded3] flex items-start justify-between gap-4 bg-[#f4efe6] sticky top-0 z-10 backdrop-blur-sm">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#ede8df] text-stone-800 border border-[#d8d0c2] font-semibold shadow-2xs">
                  Debt Score: {file.debt_score}/100
                </span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded border font-semibold ${priority.color}`}>
                  {priority.label}
                </span>
              </div>
              <h2 className="text-base font-mono font-bold text-stone-900 mt-2 truncate">
                {file.path.split('/').pop()}
              </h2>
              <p className="text-xs font-mono text-stone-500 truncate mt-0.5">
                {file.path}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-800 p-1 rounded hover:bg-[#ede8df] transition-colors shrink-0"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 flex-1 bg-[#faf8f5]">
            {/* Stat Micro-Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#ede8df] border border-[#dcd5c9] rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-stone-600 text-xs font-mono font-medium">
                  <GitCommit className="w-3.5 h-3.5 text-stone-500" />
                  <span>TOTAL CHURN</span>
                </div>
                <p className="text-lg font-mono font-bold text-stone-900 mt-1">
                  {file.churn_count}
                </p>
                <span className="text-[10px] text-stone-500 font-sans">in last 50 commits</span>
              </div>

              <div className="bg-[#ede8df] border border-[#dcd5c9] rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-stone-600 text-xs font-mono font-medium">
                  <Users className="w-3.5 h-3.5 text-stone-500" />
                  <span>AUTHORS</span>
                </div>
                <p className="text-lg font-mono font-bold text-stone-900 mt-1">
                  {file.unique_authors}
                </p>
                <span className="text-[10px] text-stone-500 font-sans">contributors</span>
              </div>

              <div className="bg-[#ede8df] border border-[#dcd5c9] rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-stone-600 text-xs font-mono font-medium">
                  <FileCode2 className="w-3.5 h-3.5 text-stone-500" />
                  <span>LINES</span>
                </div>
                <p className="text-lg font-mono font-bold text-stone-900 mt-1">
                  {file.lines.toLocaleString()}
                </p>
                <span className="text-[10px] text-stone-500 font-sans">approx loc</span>
              </div>
            </div>

            {/* AI Architectural Diagnosis Callout Box */}
            <div className="bg-[#f4efe6] border border-[#dcd5c9] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#e4ded3] pb-2.5">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#c2410c]" />
                  <h3 className="font-mono text-xs font-bold text-stone-900 uppercase tracking-wide">
                    Architectural Diagnosis
                  </h3>
                </div>
                {diagnosis && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#ede8df] text-stone-700 border border-[#d8d0c2] font-medium">
                    Source: {diagnosis.source === 'gemini' ? 'Gemini 2.0' : 'Heuristic Engine'}
                  </span>
                )}
              </div>

              {isLoadingDiagnosis ? (
                <div className="py-6 text-center space-y-2">
                  <div className="inline-block w-4 h-4 rounded-full border-2 border-[#c2410c] border-t-transparent animate-spin" />
                  <p className="text-xs font-mono text-stone-600">
                    Analyzing code-churn volatility & synthesizing refactor advice...
                  </p>
                </div>
              ) : diagError ? (
                <div className="text-xs text-[#991b1b] bg-[#fef2f2] p-2.5 rounded border border-[#fecaca]">
                  {diagError}
                </div>
              ) : diagnosis ? (
                <div className="space-y-3.5 text-xs">
                  {/* Why it is debt */}
                  <div>
                    <h4 className="text-[11px] font-mono uppercase text-stone-600 font-bold mb-1 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#d97706]" />
                      Why This Is Debt
                    </h4>
                    <p className="text-stone-800 leading-relaxed font-sans bg-[#faf8f5] p-3 rounded border border-[#e4ded3]">
                      {diagnosis.why_it_is_debt}
                    </p>
                  </div>

                  {/* Recommended Refactoring Steps */}
                  <div>
                    <h4 className="text-[11px] font-mono uppercase text-stone-600 font-bold mb-1.5 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-[#c2410c]" />
                      Recommended Refactoring Steps
                    </h4>
                    <ol className="space-y-2 list-none font-sans">
                      {diagnosis.refactoring_steps.map((step, idx) => (
                        <li
                          key={idx}
                          className="bg-[#faf8f5] p-3 rounded border border-[#e4ded3] flex items-start gap-2.5"
                        >
                          <span className="w-4 h-4 rounded bg-[#ede8df] text-stone-800 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-[#d8d0c2]">
                            {idx + 1}
                          </span>
                          <span className="text-stone-800 leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Volatility History for this File */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-stone-500" />
                <h3 className="font-mono text-xs font-bold text-stone-900 uppercase tracking-wide">
                  Recent Commit Touchpoints ({file.recent_commits?.length || 0})
                </h3>
              </div>

              {(!file.recent_commits || file.recent_commits.length === 0) ? (
                <p className="text-xs text-stone-400 font-mono italic">
                  No individual commit messages cached for this file in sample dataset.
                </p>
              ) : (
                <div className="divide-y divide-[#e8e2d8] border border-[#e4ded3] rounded-lg bg-[#faf8f5] font-mono text-xs shadow-2xs">
                  {file.recent_commits.map((c, i) => (
                    <div key={c.hash || i} className="p-3 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="px-1.5 py-0.5 rounded bg-[#ede8df] text-stone-800 border border-[#d8d0c2] font-medium">
                          {c.hash.slice(0, 7)}
                        </span>
                        <span className="text-stone-500 text-[10px] flex items-center gap-1 font-sans">
                          <Calendar className="w-3 h-3" />
                          {c.date}
                        </span>
                      </div>
                      <p className="text-stone-800 font-sans text-xs pt-0.5">{c.message}</p>
                      <p className="text-stone-500 text-[11px] font-sans">by {c.author}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
