import React, { useState } from 'react';
import { CommitInfo } from '../types';
import { Activity } from 'lucide-react';

interface DigThroughTimeProps {
  timeline: CommitInfo[];
  onHoverCommit?: (commit: CommitInfo | null) => void;
}

export const DigThroughTime: React.FC<DigThroughTimeProps> = ({
  timeline,
  onHoverCommit,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxFiles = Math.max(...timeline.map((c) => c.files_changed_count || 1), 1);

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-orange-600" />
          <h3 className="font-mono font-bold text-sm text-zinc-900 tracking-tight">
            Dig through time
          </h3>
          <span className="text-[11px] font-mono text-zinc-400">
            • 50 commits sampled across recent history
          </span>
        </div>

        <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-zinc-300" /> 1-2 files
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-zinc-700" /> 3+ files
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-orange-500" /> Active selection
          </span>
        </div>
      </div>

      {/* Commit Activity Histogram / Rhythm Strip */}
      <div className="relative pt-2">
        <div className="flex items-end gap-1 sm:gap-1.5 h-16 w-full bg-[#f8f9fa] p-2 rounded-lg border border-zinc-200">
          {timeline.slice(0, 40).map((commit, idx) => {
            const heightPct = Math.max(
              18,
              Math.round((commit.files_changed_count / maxFiles) * 100)
            );
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={commit.hash || idx}
                onMouseEnter={() => {
                  setHoveredIdx(idx);
                  onHoverCommit?.(commit);
                }}
                onMouseLeave={() => {
                  setHoveredIdx(null);
                  onHoverCommit?.(null);
                }}
                className={`flex-1 rounded-xs cursor-pointer transition-all ${
                  isHovered
                    ? 'bg-orange-500 scale-y-110'
                    : commit.files_changed_count >= 3
                    ? 'bg-zinc-700 hover:bg-orange-500'
                    : 'bg-zinc-300 hover:bg-zinc-500'
                }`}
                style={{ height: `${heightPct}%` }}
                title={`${commit.hash.slice(0, 7)}: ${commit.message} (${commit.files_changed_count} files)`}
              />
            );
          })}
        </div>

        {/* Timeline Axis Labels */}
        <div className="flex justify-between text-[11px] font-mono text-zinc-400 mt-1.5 px-1">
          <span>Historical baseline</span>
          <span>Recent commit velocity (Hover bars to highlight tiles)</span>
          <span>HEAD</span>
        </div>

        {/* Hovered Commit Details Card */}
        {hoveredIdx !== null && timeline[hoveredIdx] && (
          <div className="mt-2.5 p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono flex items-center justify-between gap-4 animate-in fade-in duration-100">
            <div className="flex items-center gap-2 truncate">
              <span className="px-1.5 py-0.5 rounded bg-white border border-zinc-200 font-bold text-zinc-900 shadow-2xs">
                {timeline[hoveredIdx].hash.slice(0, 7)}
              </span>
              <span className="truncate text-zinc-800 font-sans">
                {timeline[hoveredIdx].message}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0 text-zinc-500 text-[11px]">
              <span>by {timeline[hoveredIdx].author}</span>
              <span className="font-bold text-orange-600">
                {timeline[hoveredIdx].files_changed_count} files touched
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
