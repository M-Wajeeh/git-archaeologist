import React, { useState } from 'react';
import { CommitInfo } from '../types';
import { GitCommit, Calendar, User, Activity } from 'lucide-react';

interface VolatilityTimelineProps {
  timeline: CommitInfo[];
  onHoverCommit?: (commit: CommitInfo | null) => void;
}

export const VolatilityTimeline: React.FC<VolatilityTimelineProps> = ({
  timeline,
  onHoverCommit,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Group commits or calculate activity buckets for a clean commit rhythm bar strip
  const maxFilesChanged = Math.max(...timeline.map((c) => c.files_changed_count || 1), 1);

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
          <div className="flex items-end gap-1 h-9 w-full bg-zinc-100 p-1.5 rounded border border-zinc-200">
            {timeline.slice(0, 30).map((commit, idx) => {
              const heightPct = Math.max(
                15,
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
                  className={`flex-1 rounded-xs cursor-pointer transition-colors ${
                    isHovered
                      ? 'bg-orange-500'
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
      <div className="flex-1 overflow-y-auto max-h-[460px] divide-y divide-zinc-200 font-mono text-xs">
        {timeline.map((commit, idx) => {
          const isHovered = hoveredIndex === idx;

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
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-900 border border-zinc-300 font-medium">
                    {commit.hash.slice(0, 7)}
                  </span>
                  <span className="text-zinc-700 text-[11px] flex items-center gap-1 font-sans font-medium">
                    <User className="w-3 h-3 text-zinc-400" />
                    {commit.author}
                  </span>
                </div>
                <span className="text-zinc-500 text-[10px] flex items-center gap-1 shrink-0 font-sans">
                  <Calendar className="w-3 h-3 text-zinc-400" />
                  {commit.date}
                </span>
              </div>

              <p className="text-xs text-zinc-900 mt-1.5 font-sans line-clamp-2 leading-relaxed">
                {commit.message}
              </p>

              <div className="mt-1.5 flex items-center gap-1 text-[11px] text-zinc-500 font-sans">
                <GitCommit className="w-3 h-3 text-zinc-400" />
                <span>{commit.files_changed_count} file(s) modified</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
