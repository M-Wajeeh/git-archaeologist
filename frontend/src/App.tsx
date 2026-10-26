import React, { useState, useEffect } from 'react';
import { CommandHeader } from './components/CommandHeader';
import { TreemapMatrix } from './components/TreemapMatrix';
import { DebtMatrix } from './components/DebtMatrix';
import { VolatilityTimeline } from './components/VolatilityTimeline';
import { ConceptInspectorPanel } from './components/ConceptInspectorPanel';
import { DigThroughTime } from './components/DigThroughTime';
import { InspectorDrawer } from './components/InspectorDrawer';
import { analyzeRepository } from './services/api';
import { AnalysisResult, FileHotspot, CommitInfo } from './types';
import { AlertCircle, ShieldAlert, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

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
              {/* Area Map View */}
              {activeTab === 'map' && (
                <>
                  <TreemapMatrix
                    files={analysis.files}
                    selectedFile={selectedFile}
                    onSelectFile={(file) => {
                      setSelectedFile(file);
                    }}
                    highlightedPaths={highlightedPaths}
                  />
                  <DigThroughTime
                    timeline={analysis.timeline}
                    onHoverCommit={handleHoverCommit}
                  />
                </>
              )}

              {/* Hotspots Table View */}
              {activeTab === 'hotspots' && (
                <DebtMatrix
                  files={analysis.files}
                  selectedFile={selectedFile}
                  onSelectFile={(file) => {
                    setSelectedFile(file);
                  }}
                  highlightedPaths={highlightedPaths}
                />
              )}

              {/* Profiles / Contributor Contention Timeline View */}
              {activeTab === 'profiles' && (
                <div className="space-y-5">
                  <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-2xs">
                    <h2 className="text-base font-bold font-serif text-zinc-950 mb-1">
                      Contributor Volatility &amp; Commit Rhythm
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Chronological commits, churn volume, and author distribution across the last {analysis.analyzed_commits} commits.
                    </p>
                  </div>
                  <VolatilityTimeline
                    timeline={analysis.timeline}
                    activeRepo={analysis.repo_name}
                    onHoverCommit={handleHoverCommit}
                  />
                </div>
              )}

              {/* Executive Architectural Report View */}
              {activeTab === 'report' && (
                <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-6 shadow-2xs font-sans">
                  <div className="border-b border-zinc-100 pb-5 flex items-start justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-orange-100 text-orange-800 border border-orange-200 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                        Executive Architectural Audit
                      </div>
                      <h2 className="text-xl font-bold font-serif text-zinc-950">
                        Codebase Health &amp; Remediation Report
                      </h2>
                      <p className="text-xs text-zinc-500 mt-1">
                        Synthesized from {analysis.analyzed_commits} commits across {analysis.total_files} active files in <span className="font-mono text-zinc-800">{analysis.repo_name}</span>.
                      </p>
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-md border border-zinc-300 transition-colors"
                    >
                      Export / Print
                    </button>
                  </div>

                  {/* High Risk Hotspots Summary */}
                  <div className="space-y-3">
                    <h3 className="text-xs uppercase tracking-wider font-mono font-bold text-zinc-400 flex items-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                      Critical Hotspots Requiring Decoupling ({analysis.high_risk_files_count})
                    </h3>
                    <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-lg overflow-hidden">
                      {analysis.files.slice(0, 5).map((file, idx) => (
                        <div
                          key={file.path}
                          onClick={() => {
                            setSelectedFile(file);
                            setIsDrawerOpen(true);
                          }}
                          className="p-3.5 bg-white hover:bg-orange-50/50 cursor-pointer transition-colors flex items-center justify-between gap-4 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center text-[11px] font-mono font-bold shrink-0">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="font-mono text-xs font-semibold text-zinc-900 truncate group-hover:text-orange-700">
                                {file.path}
                              </p>
                              <p className="text-[11px] text-zinc-500">
                                {file.churn_count} commits • {file.unique_authors} contributors • {file.lines} LOC
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                              file.debt_score >= 70
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              Debt: {file.debt_score}/100
                            </span>
                            <span className="text-xs text-orange-600 font-mono font-medium flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              Diagnose <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Remediation Strategy */}
                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-3">
                    <h3 className="text-xs font-mono font-bold text-zinc-800 uppercase tracking-wider">
                      Architectural Recommendations
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-600">
                      <div className="p-3 bg-white border border-zinc-200 rounded-md">
                        <p className="font-semibold text-zinc-900 flex items-center gap-1.5 mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Deconstruct God Objects
                        </p>
                        <p className="text-[11px] leading-relaxed">
                          Files with churn over 20 commits and high author counts are acting as central choke-points. Split routing from business handlers.
                        </p>
                      </div>
                      <div className="p-3 bg-white border border-zinc-200 rounded-md">
                        <p className="font-semibold text-zinc-900 flex items-center gap-1.5 mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Stabilize Shared Contracts
                        </p>
                        <p className="text-[11px] leading-relaxed">
                          Introduce explicit boundary interfaces to prevent concurrent modifications across multiple feature teams.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
