import React, { useState, useMemo } from 'react';
import { FileHotspot } from '../types';
import {
  FileCode2,
  ArrowUpDown,
  Search,
  ChevronRight,
  Flame,
  AlertTriangle,
  ShieldCheck,
  Users,
  GitCommit,
} from 'lucide-react';

interface DebtMatrixProps {
  files: FileHotspot[];
  selectedFile: FileHotspot | null;
  onSelectFile: (file: FileHotspot) => void;
  highlightedPaths?: string[];
}

type SortField = 'debt_score' | 'churn_count' | 'unique_authors' | 'lines';

export const DebtMatrix: React.FC<DebtMatrixProps> = ({
  files,
  selectedFile,
  onSelectFile,
  highlightedPaths = [],
}) => {
  const [sortField, setSortField] = useState<SortField>('debt_score');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // Default descending for metrics
    }
  };

  const filteredAndSortedFiles = useMemo(() => {
    return files
      .filter((file) =>
        file.path.toLowerCase().includes(searchFilter.toLowerCase().trim())
      )
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        return sortAsc ? valA - valB : valB - valA;
      });
  }, [files, searchFilter, sortField, sortAsc]);

  const getRiskBadge = (score: number) => {
    if (score >= 70) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-red-950/70 text-red-400 border border-red-800/60 shadow-sm">
          <Flame className="w-3 h-3 text-red-400 animate-pulse" />
          Critical ({score})
        </span>
      );
    }
    if (score >= 40) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800/50">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          Moderate ({score})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-800/40">
        <ShieldCheck className="w-3 h-3 text-emerald-400" />
        Healthy ({score})
      </span>
    );
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 70) return 'bg-gradient-to-r from-red-600 to-red-400';
    if (score >= 40) return 'bg-gradient-to-r from-amber-600 to-amber-400';
    return 'bg-gradient-to-r from-emerald-600 to-emerald-400';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      {/* Table Header & Controls */}
      <div className="px-5 py-4 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/50">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-mono text-sm font-semibold tracking-wide text-white uppercase">
              The Architectural Debt Matrix
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {files.length} Files
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked by structural volatility: churn frequency × author diversity × code size
          </p>
        </div>

        {/* Quick Filter Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter files..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
        </div>
      </div>

      {/* Structured Hotspots Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[580px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800 text-slate-400 font-mono z-10">
            <tr>
              <th className="py-3 px-4 font-medium">File Path</th>
              <th
                onClick={() => handleSort('debt_score')}
                className="py-3 px-4 font-medium cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Debt Score</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('churn_count')}
                className="py-3 px-4 font-medium cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Churn</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('unique_authors')}
                className="py-3 px-4 font-medium cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Authors</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('lines')}
                className="py-3 px-4 font-medium cursor-pointer hover:text-white transition-colors hidden md:table-cell"
              >
                <div className="flex items-center gap-1.5">
                  <span>Lines</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-4 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredAndSortedFiles.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  No files matching "{searchFilter}"
                </td>
              </tr>
            ) : (
              filteredAndSortedFiles.map((file) => {
                const isSelected = selectedFile?.path === file.path;
                const isHighlighted = highlightedPaths.includes(file.path);

                return (
                  <tr
                    key={file.path}
                    onClick={() => onSelectFile(file)}
                    className={`group cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-slate-800/90 ring-1 ring-cyan-500/50'
                        : isHighlighted
                        ? 'bg-cyan-950/30'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    {/* File Path */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <FileCode2 className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0" />
                        <span className="text-slate-200 group-hover:text-white font-medium truncate max-w-[280px] lg:max-w-[340px]">
                          {file.path}
                        </span>
                      </div>
                    </td>

                    {/* Debt Score & Bar */}
                    <td className="py-3 px-4">
                      <div className="space-y-1.5 w-36">
                        <div className="flex items-center justify-between">
                          {getRiskBadge(file.debt_score)}
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(
                              file.debt_score
                            )}`}
                            style={{ width: `${file.debt_score}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Churn Count */}
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <GitCommit className="w-3.5 h-3.5 text-slate-500" />
                        <span>{file.churn_count} commits</span>
                      </div>
                    </td>

                    {/* Unique Authors */}
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>{file.unique_authors} devs</span>
                      </div>
                    </td>

                    {/* Lines */}
                    <td className="py-3 px-4 text-slate-400 hidden md:table-cell">
                      <span>{file.lines.toLocaleString()} loc</span>
                    </td>

                    {/* Action Trigger */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFile(file);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/30 transition-all opacity-80 group-hover:opacity-100"
                      >
                        Inspect
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
