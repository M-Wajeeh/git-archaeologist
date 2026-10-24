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
    if (score >= 85) return { label: 'P0 - Immediate', color: 'text-red-700 border-red-300 bg-red-50' };
    if (score >= 70) return { label: 'P1 - High', color: 'text-orange-700 border-orange-300 bg-orange-50' };
    if (score >= 40) return { label: 'P2 - Moderate', color: 'text-amber-800 border-amber-300 bg-amber-50' };
    return { label: 'P3 - Low', color: 'text-emerald-800 border-emerald-300 bg-emerald-50' };
  };

  const priority = getPriorityLabel(file.debt_score);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Soft Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-2xs transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-xl bg-white border-l border-zinc-200 text-zinc-900 flex flex-col shadow-2xl overflow-y-auto">
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-200 flex items-start justify-between gap-4 bg-zinc-50 sticky top-0 z-10">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white text-zinc-800 border border-zinc-300 font-semibold shadow-2xs">
                  Debt Score: {file.debt_score}/100
                </span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded border font-semibold ${priority.color}`}>
                  {priority.label}
                </span>
              </div>
              <h2 className="text-base font-mono font-bold text-zinc-900 mt-2 truncate">
                {file.path.split('/').pop()}
              </h2>
              <p className="text-xs font-mono text-zinc-500 truncate mt-0.5">
                {file.path}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-800 p-1 rounded hover:bg-zinc-200 transition-colors shrink-0"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 flex-1 bg-white">
            {/* Stat Micro-Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-mono font-medium">
                  <GitCommit className="w-3.5 h-3.5 text-zinc-400" />
                  <span>TOTAL CHURN</span>
                </div>
                <p className="text-lg font-mono font-bold text-zinc-900 mt-1">
                  {file.churn_count}
                </p>
                <span className="text-[10px] text-zinc-500 font-sans">in last 50 commits</span>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-mono font-medium">
                  <Users className="w-3.5 h-3.5 text-zinc-400" />
                  <span>AUTHORS</span>
                </div>
                <p className="text-lg font-mono font-bold text-zinc-900 mt-1">
                  {file.unique_authors}
                </p>
                <span className="text-[10px] text-zinc-500 font-sans">contributors</span>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-mono font-medium">
                  <FileCode2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>LINES</span>
                </div>
                <p className="text-lg font-mono font-bold text-zinc-900 mt-1">
                  {file.lines.toLocaleString()}
                </p>
                <span className="text-[10px] text-zinc-500 font-sans">approx loc</span>
              </div>
            </div>

            {/* AI Architectural Diagnosis Callout Box */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-orange-600" />
                  <h3 className="font-mono text-xs font-bold text-zinc-900 uppercase tracking-tight">
                    Architectural Diagnosis
                  </h3>
                </div>
                {diagnosis && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-zinc-700 border border-zinc-200 font-medium">
                    Source: {diagnosis.source === 'gemini' ? 'Gemini 2.0' : 'Heuristic Engine'}
                  </span>
                )}
              </div>

              {isLoadingDiagnosis ? (
                <div className="py-6 text-center space-y-2">
                  <div className="inline-block w-4 h-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                  <p className="text-xs font-mono text-zinc-500">
                    Analyzing code-churn volatility & synthesizing refactor advice...
                  </p>
                </div>
              ) : diagError ? (
                <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded border border-red-200">
                  {diagError}
                </div>
              ) : diagnosis ? (
                <div className="space-y-3.5 text-xs">
                  {/* Why it is debt */}
                  <div>
                    <h4 className="text-[11px] font-mono uppercase text-zinc-600 font-bold mb-1 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Why This Is Debt
                    </h4>
                    <p className="text-zinc-800 leading-relaxed font-sans bg-white p-3 rounded border border-zinc-200">
                      {diagnosis.why_it_is_debt}
                    </p>
                  </div>

                  {/* Recommended Refactoring Steps */}
                  <div>
                    <h4 className="text-[11px] font-mono uppercase text-zinc-600 font-bold mb-1.5 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-orange-600" />
                      Recommended Refactoring Steps
                    </h4>
                    <ol className="space-y-2 list-none font-sans">
                      {diagnosis.refactoring_steps.map((step, idx) => (
                        <li
                          key={idx}
                          className="bg-white p-3 rounded border border-zinc-200 flex items-start gap-2.5"
                        >
                          <span className="w-4 h-4 rounded bg-orange-100 text-orange-800 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-orange-200">
                            {idx + 1}
                          </span>
                          <span className="text-zinc-800 leading-relaxed">{step}</span>
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
                <Layers className="w-4 h-4 text-zinc-500" />
                <h3 className="font-mono text-xs font-bold text-zinc-900 uppercase tracking-tight">
                  Recent Commit Touchpoints ({file.recent_commits?.length || 0})
                </h3>
              </div>

              {(!file.recent_commits || file.recent_commits.length === 0) ? (
                <p className="text-xs text-zinc-400 font-mono italic">
                  No individual commit messages cached for this file in sample dataset.
                </p>
              ) : (
                <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-lg bg-white font-mono text-xs shadow-2xs">
                  {file.recent_commits.map((c, i) => (
                    <div key={c.hash || i} className="p-3 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200 font-medium">
                          {c.hash.slice(0, 7)}
                        </span>
                        <span className="text-zinc-400 text-[10px] flex items-center gap-1 font-sans">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          {c.date}
                        </span>
                      </div>
                      <p className="text-zinc-800 font-sans text-xs pt-0.5">{c.message}</p>
                      <p className="text-zinc-500 text-[11px] font-sans">by {c.author}</p>
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
