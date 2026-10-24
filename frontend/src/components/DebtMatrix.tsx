import React, { useState, useMemo } from 'react';
import { FileHotspot } from '../types';
import {
  FileCode2,
  ArrowUpDown,
  Search,
  ChevronRight,
  GitCommit,
  Users,
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
      setSortAsc(false); // Default descending for audit
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
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-medium shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
          Critical ({score})
        </span>
      );
    }
    if (score >= 40) {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
          Moderate ({score})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
        Healthy ({score})
      </span>
    );
  };

  // Solid flat bars without AI gradients
  const getScoreBarColor = (score: number) => {
    if (score >= 70) return 'bg-red-600';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-emerald-600';
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden flex flex-col h-full shadow-2xs">
      {/* Table Header & Controls */}
      <div className="px-5 py-3.5 border-b border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-mono text-sm font-bold text-zinc-900 uppercase tracking-tight">
              Architectural Debt Matrix
            </h2>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-300 font-medium">
              {files.length} tracked files
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Files weighted by commit frequency, multi-author churn, and file size
          </p>
        </div>

        {/* Quick Filter Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter file path..."
            className="w-full bg-zinc-50 border border-zinc-300 focus:border-orange-500 rounded pl-8 pr-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 font-mono focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Structured Hotspots Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[580px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-mono z-10 font-semibold">
            <tr>
              <th className="py-2.5 px-4">File Path</th>
              <th
                onClick={() => handleSort('debt_score')}
                className="py-2.5 px-4 cursor-pointer hover:text-orange-600 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Debt Score</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('churn_count')}
                className="py-2.5 px-4 cursor-pointer hover:text-orange-600 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Commit Churn</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('unique_authors')}
                className="py-2.5 px-4 cursor-pointer hover:text-orange-600 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Contributors</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('lines')}
                className="py-2.5 px-4 cursor-pointer hover:text-orange-600 transition-colors hidden md:table-cell"
              >
                <div className="flex items-center gap-1.5">
                  <span>Lines</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                </div>
              </th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 font-mono">
            {filteredAndSortedFiles.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-zinc-500 font-sans">
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
                        ? 'bg-orange-50/70 text-zinc-950 font-semibold ring-1 ring-orange-400/80'
                        : isHighlighted
                        ? 'bg-orange-50/40 text-orange-950 font-medium'
                        : 'hover:bg-zinc-50'
                    }`}
                  >
                    {/* File Path */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <FileCode2 className="w-3.5 h-3.5 text-zinc-400 group-hover:text-orange-600 shrink-0" />
                        <span className="text-zinc-800 group-hover:text-zinc-950 font-medium truncate max-w-[280px] lg:max-w-[340px]">
                          {file.path}
                        </span>
                      </div>
                    </td>

                    {/* Debt Score & Bar */}
                    <td className="py-2.5 px-4">
                      <div className="space-y-1 w-32">
                        <div>{getRiskBadge(file.debt_score)}</div>
                        <div className="w-full bg-zinc-100 rounded h-1 overflow-hidden border border-zinc-200">
                          <div
                            className={`h-full ${getScoreBarColor(file.debt_score)}`}
                            style={{ width: `${file.debt_score}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Churn Count */}
                    <td className="py-2.5 px-4 text-zinc-700">
                      <div className="flex items-center gap-1.5">
                        <GitCommit className="w-3 h-3 text-zinc-400" />
                        <span>{file.churn_count} commits</span>
                      </div>
                    </td>

                    {/* Unique Authors */}
                    <td className="py-2.5 px-4 text-zinc-700">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-zinc-400" />
                        <span>{file.unique_authors} authors</span>
                      </div>
                    </td>

                    {/* Lines */}
                    <td className="py-2.5 px-4 text-zinc-500 hidden md:table-cell">
                      <span>{file.lines.toLocaleString()} loc</span>
                    </td>

                    {/* Action Trigger */}
                    <td className="py-2.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFile(file);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-white hover:bg-orange-600 hover:text-white text-zinc-800 border border-zinc-300 hover:border-orange-600 transition-colors shadow-2xs font-medium"
                      >
                        Inspect
                        <ChevronRight className="w-3 h-3 text-zinc-400 group-hover:text-white" />
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
