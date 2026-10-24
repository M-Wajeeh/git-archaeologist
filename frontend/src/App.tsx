import React, { useState, useEffect } from 'react';
import { CommandHeader } from './components/CommandHeader';
import { DebtMatrix } from './components/DebtMatrix';
import { VolatilityTimeline } from './components/VolatilityTimeline';
import { InspectorDrawer } from './components/InspectorDrawer';
import { analyzeRepository } from './services/api';
import { AnalysisResult, FileHotspot, CommitInfo } from './types';
import { GitBranch, AlertCircle, Layers, FileCode2, ExternalLink, ShieldAlert } from 'lucide-react';

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
      setLoadingStage('Cloning repository shallow depth 50...');
      await new Promise((r) => setTimeout(r, 200));

      setLoadingStage('Analyzing numstat telemetry & author churn...');
      const data = await analyzeRepository(repoUrl);

      setLoadingStage('Calculating architectural debt index...');
      await new Promise((r) => setTimeout(r, 150));

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

  // Compute percentage of files in high risk
  const highRiskPct = analysis && analysis.total_files > 0
    ? Math.round((analysis.high_risk_files_count / analysis.total_files) * 100)
    : 0;

  const githubRepoUrl = analysis
    ? `https://github.com/${analysis.repo_name.replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '')}`
    : null;

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900 selection:bg-orange-100 selection:text-orange-900">
      <CommandHeader
        onSearch={handleAudit}
        isLoading={isLoading}
        loadingStage={loadingStage}
        activeRepo={activeRepo}
      />

      {/* Main Cockpit Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* Error Alert Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 flex items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-red-900">{error.message}</p>
                {error.code && (
                  <p className="text-[11px] font-mono text-red-600">Code: {error.code}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleAudit('pallets/flask')}
              className="text-xs font-mono bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 rounded px-2.5 py-1 transition-colors font-medium shadow-2xs"
            >
              Reset to Demo
            </button>
          </div>
        )}

        {/* Repository Stats Summary Bento Grid */}
        {analysis && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Card 1: Repository Info */}
            <div className="bg-white border border-zinc-200 rounded-lg p-3.5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-500 text-[11px] font-mono font-medium">
                <span>TARGET REPOSITORY</span>
                <GitBranch className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="mt-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-mono font-bold text-zinc-900 truncate" title={analysis.repo_name}>
                    {analysis.repo_name}
                  </p>
                  {githubRepoUrl && (
                    <a
                      href={githubRepoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open on GitHub"
                      className="text-zinc-400 hover:text-orange-600 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                  git branch: default
                </p>
              </div>
            </div>

            {/* Card 2: Commits Scanned */}
            <div className="bg-white border border-zinc-200 rounded-lg p-3.5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-500 text-[11px] font-mono font-medium">
                <span>SAMPLE DEPTH</span>
                <Layers className="w-3.5 h-3.5 text-orange-600" />
              </div>
              <div className="mt-1">
                <p className="text-base font-mono font-bold text-orange-600">
                  {analysis.analyzed_commits} commits
                </p>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                  shallow history window
                </p>
              </div>
            </div>

            {/* Card 3: Files Tracked */}
            <div className="bg-white border border-zinc-200 rounded-lg p-3.5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-500 text-[11px] font-mono font-medium">
                <span>ACTIVE FILES</span>
                <FileCode2 className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="mt-1">
                <p className="text-base font-mono font-bold text-zinc-800">
                  {analysis.total_files} files
                </p>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                  touched in scan window
                </p>
              </div>
            </div>

            {/* Card 4: High Debt Hotspots */}
            <div className="bg-white border border-zinc-200 rounded-lg p-3.5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-red-600 text-[11px] font-mono font-medium">
                <span>HIGH DEBT HOTSPOTS</span>
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              </div>
              <div className="mt-1">
                <div className="flex items-baseline gap-2">
                  <p className="text-base font-mono font-bold text-red-600">
                    {analysis.high_risk_files_count} files
                  </p>
                  <span className="text-[10px] font-mono text-zinc-400">
                    ({highRiskPct}%)
                  </span>
                </div>
                <p className="text-[10px] text-red-600 font-mono mt-0.5">
                  debt index &ge; 70 (P0/P1)
                </p>
              </div>
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
                activeRepo={analysis.repo_name}
                onHoverCommit={handleHoverCommit}
              />
            </div>
          </div>
        )}

        {/* Sliding Inspector Drawer */}
        <InspectorDrawer
          file={selectedFile}
          activeRepo={analysis?.repo_name || activeRepo}
          onClose={() => setSelectedFile(null)}
        />
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-zinc-200 bg-white py-3 px-6 text-xs text-zinc-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span>GitArchaeologist v1.0</span>
          <span>•</span>
          <span className="text-zinc-400">Press <kbd className="px-1 py-0.2 bg-zinc-100 border border-zinc-300 rounded text-[10px] text-zinc-700">?</kbd> for shortcuts</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Architectural telemetry powered by Git shallow cloner &amp; Gemini</span>
        </div>
      </footer>
    </div>
  );
};
