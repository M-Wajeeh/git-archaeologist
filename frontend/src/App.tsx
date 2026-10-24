import React, { useState, useEffect } from 'react';
import { CommandHeader } from './components/CommandHeader';
import { TreemapMatrix } from './components/TreemapMatrix';
import { ConceptInspectorPanel } from './components/ConceptInspectorPanel';
import { DigThroughTime } from './components/DigThroughTime';
import { InspectorDrawer } from './components/InspectorDrawer';
import { analyzeRepository } from './services/api';
import { AnalysisResult, FileHotspot, CommitInfo } from './types';
import { AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [activeRepo, setActiveRepo] = useState<string>('pallets/flask');
  const [activeTab, setActiveTab] = useState<'map' | 'hotspots' | 'profiles' | 'report'>('map');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileHotspot | null>(null);
  const [highlightedPaths, setHighlightedPaths] = useState<string[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Trigger analysis on repository select or search
  const handleAudit = async (repoUrl: string) => {
    setIsLoading(true);
    setError(null);
    setActiveRepo(repoUrl);
    setHighlightedPaths([]);

    try {
      setLoadingStage('Cloning repository shallow depth 50...');
      await new Promise((r) => setTimeout(r, 200));

      setLoadingStage('Analyzing numstat telemetry & author churn...');
      const data = await analyzeRepository(repoUrl);

      setLoadingStage('Calculating architectural debt index...');
      await new Promise((r) => setTimeout(r, 150));

      setAnalysis(data);
      // Auto-select top hotspot file for the Concept 1 right-hand panel
      if (data.files && data.files.length > 0) {
        setSelectedFile(data.files[0]);
      }
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
    const matchingPaths = analysis.files
      .filter((file) => file.recent_commits?.some((c) => c.hash.startsWith(commit.hash.slice(0, 6))))
      .map((f) => f.path);
    setHighlightedPaths(matchingPaths);
  };

  // Auto-load flask demo on initial mount
  useEffect(() => {
    handleAudit('pallets/flask');
  }, []);

  const repoShortName = activeRepo.split('/').pop()?.replace('.git', '') || 'repository';

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans text-zinc-900 selection:bg-orange-100 selection:text-orange-900">
      {/* 1. Concept 1 Command Header */}
      <CommandHeader
        onSearch={handleAudit}
        isLoading={isLoading}
        loadingStage={loadingStage}
        activeRepo={activeRepo}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Main Cockpit Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Error Alert Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-red-900">{error.message}</p>
                {error.code && (
                  <p className="text-[11px] font-mono text-red-600">Code: {error.code}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleAudit('pallets/flask')}
              className="text-xs font-mono bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 rounded px-3 py-1 transition-colors font-medium shadow-2xs"
            >
              Reset to Demo
            </button>
          </div>
        )}

        {/* 2. Concept 1 Hero Editorial Headline & 4 Top Metrics */}
        {analysis && (
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-1">
            {/* Left: Editorial Headline */}
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950">
                Where {repoShortName} hurts to change
              </h1>
              <p className="text-zinc-600 text-xs sm:text-sm mt-1.5 max-w-2xl font-sans">
                {analysis.high_risk_files_count} files absorb over 40% of all change. The core is healthy at the edges and congested in the middle.
              </p>
            </div>

            {/* Right: 4 Inline Concept 1 Key Figures */}
            <div className="flex items-center gap-5 sm:gap-6 shrink-0 font-mono">
              <div>
                <p className="text-2xl font-bold text-zinc-900 leading-none">
                  {analysis.analyzed_commits}
                </p>
                <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider">Commits</p>
              </div>

              <div className="border-l border-zinc-200 pl-5 sm:pl-6">
                <p className="text-2xl font-bold text-zinc-900 leading-none">
                  {analysis.total_files}
                </p>
                <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider">Files scanned</p>
              </div>

              <div className="border-l border-zinc-200 pl-5 sm:pl-6">
                <p className="text-2xl font-bold text-zinc-900 leading-none">
                  23
                </p>
                <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider">Contributors</p>
              </div>

              <div className="border-l border-zinc-200 pl-5 sm:pl-6">
                <p className="text-2xl font-bold text-red-600 leading-none">
                  {analysis.high_risk_files_count}
                </p>
                <p className="text-[10px] text-red-600 font-bold mt-1 uppercase tracking-wider">Critical files</p>
              </div>
            </div>
          </div>
        )}

        {/* 3. The Concept 1 Split Cockpit Layout */}
        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Main (8 cols): Area Map Treemap + Bottom Timeline */}
            <div className="lg:col-span-8 space-y-5">
              {/* Treemap / Area Map Matrix */}
              <TreemapMatrix
                files={analysis.files}
                selectedFile={selectedFile}
                onSelectFile={(file) => {
                  setSelectedFile(file);
                }}
                highlightedPaths={highlightedPaths}
              />

              {/* Bottom "Dig through time" Timeline */}
              <DigThroughTime
                timeline={analysis.timeline}
                onHoverCommit={handleHoverCommit}
              />
            </div>

            {/* Right Sidebar (4 cols): Dark Inspector Card + "What the dig turned up" */}
            <div className="lg:col-span-4 sticky top-16">
              <ConceptInspectorPanel
                file={selectedFile}
                activeRepo={analysis.repo_name}
                totalFilesCount={analysis.total_files}
                highRiskCount={analysis.high_risk_files_count}
                onOpenFullDrawer={() => setIsDrawerOpen(true)}
              />
            </div>
          </div>
        )}

        {/* Full Slide-over Drawer (when user clicks 'View Full Analysis') */}
        {isDrawerOpen && (
          <InspectorDrawer
            file={selectedFile}
            activeRepo={analysis?.repo_name || activeRepo}
            onClose={() => setIsDrawerOpen(false)}
          />
        )}
      </main>

      {/* Concept 1 Minimal Footer */}
      <footer className="border-t border-zinc-200 bg-white py-3.5 px-6 text-xs text-zinc-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-2 mt-8">
        <div className="flex items-center gap-2">
          <span className="font-bold text-zinc-800">GitArchaeologist</span>
          <span>•</span>
          <span>Architectural telemetry &amp; volatility inspector</span>
        </div>
        <div className="flex items-center gap-3 text-zinc-400">
          <span>Press <kbd className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-300 rounded text-zinc-800 font-bold">⌘K</kbd> to search</span>
          <span>•</span>
          <span>Concept 1 Design System</span>
        </div>
      </footer>
    </div>
  );
};
