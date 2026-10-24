import React, { useState } from 'react';
import { CommitInfo } from '../types';
import { Calendar, Activity, ExternalLink, Copy, Check, FileText } from 'lucide-react';

interface VolatilityTimelineProps {
  timeline: CommitInfo[];
  activeRepo?: string;
  onHoverCommit?: (commit: CommitInfo | null) => void;
}

export const VolatilityTimeline: React.FC<VolatilityTimelineProps> = ({
  timeline,
  activeRepo = '',
  onHoverCommit,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Group commits or calculate activity buckets for a clean commit rhythm bar strip
  const maxFilesChanged = Math.max(...timeline.map((c) => c.files_changed_count || 1), 1);

  const handleCopyHash = (e: React.MouseEvent, hash: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 1500);
  };

  // Deterministic author initials and color generator
  const getAuthorBadge = (author: string) => {
    const initials = author
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';

    let hash = 0;
    for (let i = 0; i < author.length; i++) {
      hash = author.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'bg-orange-100 text-orange-800 border-orange-200',
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-emerald-100 text-emerald-800 border-emerald-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-amber-100 text-amber-800 border-amber-200',
      'bg-rose-100 text-rose-800 border-rose-200',
    ];
    const colorClass = colors[Math.abs(hash) % colors.length];

    return (
      <span
        title={author}
        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0 ${colorClass}`}
      >
        {initials}
      </span>
    );
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden flex flex-col h-full shadow-2xs">
      {/* Panel Header */}
      <div className="px-4 py-3.5 border-b border-zinc-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-600" />
            <h3 className="font-mono text-sm font-bold text-zinc-900 uppercase tracking-tight">
              Git Volatility Timeline
            </h3>
          </div>
          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-300 font-medium">
            {timeline.length} commits
          </span>
        </div>
        <p className="text-xs text-zinc-500 mt-0.5">
          Chronological commit rhythm across the 50-commit analysis window
        </p>

        {/* Clean Activity Sparkline / Rhythm Strip */}
        <div className="mt-3 pt-2.5 border-t border-zinc-200">
          <div className="flex items-end gap-1 h-10 w-full bg-zinc-50 p-1.5 rounded border border-zinc-200">
            {timeline.slice(0, 30).map((commit, idx) => {
              const heightPct = Math.max(
                20,
                Math.round((commit.files_changed_count / maxFilesChanged) * 100)
              );
              const isHovered = hoveredIndex === idx;

              return (
                <div
                  key={commit.hash || idx}
                  title={`${commit.hash.slice(0, 7)}: ${commit.message} (${commit.files_changed_count} files)`}
                  onMouseEnter={() => {
                    setHoveredIndex(idx);
                    onHoverCommit?.(commit);
                  }}
                  onMouseLeave={() => {
                    setHoveredIndex(null);
                    onHoverCommit?.(null);
                  }}
                  className={`flex-1 rounded-xs cursor-pointer transition-all ${
                    isHovered
                      ? 'bg-orange-500 scale-y-105'
                      : commit.files_changed_count >= 3
                      ? 'bg-zinc-700 hover:bg-orange-500'
                      : 'bg-zinc-300 hover:bg-zinc-500'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] font-mono text-zinc-400 mt-1 px-0.5">
            <span>Older commits</span>
            <span>Recent commits</span>
          </div>
        </div>
      </div>

      {/* Chronological Commit Feed */}
      <div className="flex-1 overflow-y-auto max-h-[500px] divide-y divide-zinc-200 font-mono text-xs">
        {timeline.map((commit, idx) => {
          const isHovered = hoveredIndex === idx;
          const githubCommitUrl = activeRepo
            ? `https://github.com/${activeRepo.replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '')}/commit/${commit.hash}`
            : null;

          return (
            <div
              key={commit.hash || idx}
              onMouseEnter={() => {
                setHoveredIndex(idx);
                onHoverCommit?.(commit);
              }}
              onMouseLeave={() => {
                setHoveredIndex(null);
                onHoverCommit?.(null);
              }}
              className={`p-3 transition-colors cursor-default ${
                isHovered ? 'bg-orange-50/70' : 'hover:bg-zinc-50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200 font-bold text-[11px] shadow-2xs">
                    {commit.hash.slice(0, 7)}
                  </span>
                  <button
                    onClick={(e) => handleCopyHash(e, commit.hash)}
                    title="Copy full hash"
                    className="text-zinc-400 hover:text-zinc-700 p-0.5 rounded transition-colors"
                  >
                    {copiedHash === commit.hash ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                  {githubCommitUrl && (
                    <a
                      href={githubCommitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View commit on GitHub"
                      className="text-zinc-400 hover:text-orange-600 p-0.5 rounded transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                  <Calendar className="w-3 h-3 text-zinc-400" />
                  <span>{commit.date || 'Recent'}</span>
                </div>
              </div>

              {/* Commit Message */}
              <p className="mt-1.5 text-zinc-800 font-sans text-xs line-clamp-2 leading-relaxed">
                {commit.message}
              </p>

              {/* Author & Touched Files Count */}
              <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
                <div className="flex items-center gap-1.5">
                  {getAuthorBadge(commit.author)}
                  <span className="truncate max-w-[140px] text-zinc-700 font-medium">
                    {commit.author}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200 font-mono text-[10px]">
                  <FileText className="w-3 h-3 text-zinc-400" />
                  {commit.files_changed_count} {commit.files_changed_count === 1 ? 'file' : 'files'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
