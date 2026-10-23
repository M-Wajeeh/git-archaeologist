import React, { useState, useEffect } from 'react';
import { CommandHeader } from './components/CommandHeader';
import { DebtMatrix } from './components/DebtMatrix';
import { analyzeRepository } from './services/api';
import { AnalysisResult, FileHotspot } from './types';
import { GitBranch, AlertTriangle, Layers, FileCode2 } from 'lucide-react';

export const App: React.FC = () => {
  const [activeRepo, setActiveRepo] = useState<string>('pallets/flask');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileHotspot | null>(null);

  // Trigger analysis on repository select or search
  const handleAudit = async (repoUrl: string) => {
    setIsLoading(true);
    setError(null);
    setActiveRepo(repoUrl);
    setSelectedFile(null);

    try {
      setLoadingStage('Cloning latest 50 commits...');
      await new Promise((r) => setTimeout(r, 400));

      setLoadingStage('Calculating churn and multi-author metrics...');
      const data = await analyzeRepository(repoUrl);

      setLoadingStage('Synthesizing debt matrix and timeline...');
      await new Promise((r) => setTimeout(r, 300));

      setAnalysis(data);
    } catch (err: any) {
      console.error('Audit failed:', err);
      setError({
        message: err.message || 'Failed to analyze repository. Verify it is public and accessible.',
        code: err.code || 'AUDIT_ERROR',
      });
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  // Auto-load flask demo on initial mount
  useEffect(() => {
    handleAudit('pallets/flask');
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100">
      <CommandHeader
        onSearch={handleAudit}
        isLoading={isLoading}
        loadingStage={loadingStage}
        activeRepo={activeRepo}
      />

      {/* Main Cockpit Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Error Alert Banner */}
        {error && (
          <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-200">{error.message}</p>
                {error.code && (
                  <p className="text-xs font-mono text-red-400 mt-0.5">Code: {error.code}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleAudit('pallets/flask')}
              className="text-xs font-mono bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-500/50 rounded-lg px-3 py-1.5 transition-colors"
            >
              Load Demo Repo
            </button>
          </div>
        )}

        {/* Repository Stats Summary Header */}
        {analysis && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>ACTIVE REPOSITORY</span>
                <GitBranch className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-lg font-mono font-bold text-white mt-2 truncate">
                {analysis.repo_name}
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>COMMITS SCANNED</span>
                <Layers className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-lg font-mono font-bold text-cyan-300 mt-2">
                {analysis.analyzed_commits} commits
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>TOTAL FILES AUDITED</span>
                <FileCode2 className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-lg font-mono font-bold text-slate-200 mt-2">
                {analysis.total_files} files
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-red-400 text-xs font-mono">
                <span>CRITICAL HOTSPOTS</span>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-lg font-mono font-bold text-red-400 mt-2">
                {analysis.high_risk_files_count} files
              </p>
            </div>
          </div>
        )}

        {/* Cockpit Main Panel: The Architectural Debt Matrix */}
        {analysis && (
          <div className="grid grid-cols-1 gap-6">
            <DebtMatrix
              files={analysis.files}
              selectedFile={selectedFile}
              onSelectFile={(file) => setSelectedFile(file)}
            />
          </div>
        )}
      </main>
    </div>
  );
};
