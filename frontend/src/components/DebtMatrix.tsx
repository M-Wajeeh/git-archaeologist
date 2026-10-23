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
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/80">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          Critical ({score})
        </span>
      );
    }
    if (score >= 40) {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/80">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
          Moderate ({score})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
        Healthy ({score})
      </span>
    );
  };

  // Pure solid colors without gradients or mixing
  const getScoreBarColor = (score: number) => {
    if (score >= 70) return 'bg-red-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex flex-col h-full">
      {/* Table Header & Controls */}
      <div className="px-5 py-3 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-900">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-mono text-sm font-semibold text-zinc-100">
              Architectural Debt Matrix
            </h2>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
              {files.length} tracked files
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Files weighted by commit frequency, multi-author churn, and file size
          </p>
        </div>

        {/* Quick Filter Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter file path..."
            className="w-full bg-zinc-950 border border-zinc-700 focus:border-blue-500 rounded pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 font-mono focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Structured Hotspots Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[580px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 bg-zinc-950 border-b border-zinc-800 text-zinc-400 font-mono z-10">
            <tr>
              <th className="py-2.5 px-4 font-medium">File Path</th>
              <th
                onClick={() => handleSort('debt_score')}
                className="py-2.5 px-4 font-medium cursor-pointer hover:text-zinc-200 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Debt Score</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('churn_count')}
                className="py-2.5 px-4 font-medium cursor-pointer hover:text-zinc-200 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Commit Churn</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('unique_authors')}
                className="py-2.5 px-4 font-medium cursor-pointer hover:text-zinc-200 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Contributors</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('lines')}
                className="py-2.5 px-4 font-medium cursor-pointer hover:text-zinc-200 transition-colors hidden md:table-cell"
              >
                <div className="flex items-center gap-1.5">
                  <span>Lines</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                </div>
              </th>
              <th className="py-2.5 px-4 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 font-mono">
            {filteredAndSortedFiles.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-zinc-500">
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
                        ? 'bg-zinc-800 text-white'
                        : isHighlighted
                        ? 'bg-blue-950/40 text-blue-200'
                        : 'hover:bg-zinc-800/60'
                    }`}
                  >
                    {/* File Path */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <FileCode2 className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 shrink-0" />
                        <span className="text-zinc-200 group-hover:text-white truncate max-w-[280px] lg:max-w-[340px]">
                          {file.path}
                        </span>
                      </div>
                    </td>

                    {/* Debt Score & Solid Bar */}
                    <td className="py-2.5 px-4">
                      <div className="space-y-1 w-32">
                        <div>{getRiskBadge(file.debt_score)}</div>
                        <div className="w-full bg-zinc-950 rounded h-1 overflow-hidden border border-zinc-800">
                          <div
                            className={`h-full ${getScoreBarColor(file.debt_score)}`}
                            style={{ width: `${file.debt_score}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Churn Count */}
                    <td className="py-2.5 px-4 text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        <GitCommit className="w-3 h-3 text-zinc-500" />
                        <span>{file.churn_count} commits</span>
                      </div>
                    </td>

                    {/* Unique Authors */}
                    <td className="py-2.5 px-4 text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-zinc-500" />
                        <span>{file.unique_authors} authors</span>
                      </div>
                    </td>

                    {/* Lines */}
                    <td className="py-2.5 px-4 text-zinc-400 hidden md:table-cell">
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
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
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
