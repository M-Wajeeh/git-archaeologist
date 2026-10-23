import React, { useState, useEffect } from 'react';
import { CommandHeader } from './components/CommandHeader';
import { DebtMatrix } from './components/DebtMatrix';
import { VolatilityTimeline } from './components/VolatilityTimeline';
import { InspectorDrawer } from './components/InspectorDrawer';
import { analyzeRepository } from './services/api';
import { AnalysisResult, FileHotspot, CommitInfo } from './types';
import { GitBranch, AlertCircle, Layers, FileCode2 } from 'lucide-react';

export const App: React.FC = () => {
  const [activeRepo, setActiveRepo] = useState<string>('pallets/flask');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileHotspot | null>(null);
  const [highlightedPaths, setHighlightedPaths] = useState<string[]>([]);

  // Trigger analysis on repository select or search
  const handleAudit = async (repoUrl: string) => {
    setIsLoading(true);
    setError(null);
    setActiveRepo(repoUrl);
    setSelectedFile(null);
    setHighlightedPaths([]);

    try {
      setLoadingStage('Fetching 50 commits...');
      await new Promise((r) => setTimeout(r, 250));

      setLoadingStage('Calculating churn & author distribution...');
      const data = await analyzeRepository(repoUrl);

      setLoadingStage('Formatting matrix and timeline...');
      await new Promise((r) => setTimeout(r, 200));

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

  // Cross-highlight files when hovering commits in the timeline
  const handleHoverCommit = (commit: CommitInfo | null) => {
    if (!commit || !analysis) {
      setHighlightedPaths([]);
      return;
    }
    // Find files modified in this commit
    const matchingPaths = analysis.files
      .filter((file) => file.recent_commits?.some((c) => c.hash.startsWith(commit.hash.slice(0, 6))))
      .map((f) => f.path);
    setHighlightedPaths(matchingPaths);
  };

  // Auto-load flask demo on initial mount
  useEffect(() => {
    handleAudit('pallets/flask');
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-zinc-100">
      <CommandHeader
        onSearch={handleAudit}
        isLoading={isLoading}
        loadingStage={loadingStage}
        activeRepo={activeRepo}
      />

      {/* Main Cockpit Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-5">
        {/* Error Alert Banner */}
        {error && (
          <div className="bg-red-950/60 border border-red-800 rounded-lg p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <p className="text-xs font-medium text-red-200">{error.message}</p>
                {error.code && (
                  <p className="text-[11px] font-mono text-red-400">Code: {error.code}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleAudit('pallets/flask')}
              className="text-xs font-mono bg-red-900 hover:bg-red-800 text-red-100 border border-red-700 rounded px-2.5 py-1 transition-colors"
            >
              Reset to Demo
            </button>
          </div>
        )}

        {/* Repository Stats Summary Header */}
        {analysis && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3.5">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
                <span>REPOSITORY</span>
                <GitBranch className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <p className="text-base font-mono font-semibold text-zinc-100 mt-1 truncate">
                {analysis.repo_name}
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3.5">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
                <span>COMMITS SCANNED</span>
                <Layers className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <p className="text-base font-mono font-semibold text-blue-400 mt-1">
                {analysis.analyzed_commits} commits
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3.5">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
                <span>FILES TRACKED</span>
                <FileCode2 className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <p className="text-base font-mono font-semibold text-zinc-200 mt-1">
                {analysis.total_files} files
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3.5">
              <div className="flex items-center justify-between text-red-400 text-xs font-mono">
                <span>HIGH DEBT HOTSPOTS</span>
                <span className="w-2 h-2 rounded-full bg-red-500" />
              </div>
              <p className="text-base font-mono font-semibold text-red-400 mt-1">
                {analysis.high_risk_files_count} files
              </p>
            </div>
          </div>
        )}

        {/* The Split Cockpit View: Matrix (Left) + Timeline (Right) */}
        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left/Main: Debt Matrix */}
            <div className="lg:col-span-7 xl:col-span-8">
              <DebtMatrix
                files={analysis.files}
                selectedFile={selectedFile}
                onSelectFile={(file) => setSelectedFile(file)}
                highlightedPaths={highlightedPaths}
              />
            </div>

            {/* Right/Secondary: Git Volatility Timeline */}
            <div className="lg:col-span-5 xl:col-span-4">
              <VolatilityTimeline
                timeline={analysis.timeline}
                onHoverCommit={handleHoverCommit}
              />
            </div>
          </div>
        )}

        {/* Sliding Inspector Drawer */}
        <InspectorDrawer
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      </main>
    </div>
  );
};
