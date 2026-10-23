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
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded bg-[#fef2f2] text-[#991b1b] border border-[#fecaca] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#b91c1c] shrink-0" />
          Critical ({score})
        </span>
      );
    }
    if (score >= 40) {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded bg-[#fffbeb] text-[#92400e] border border-[#fde68a] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] shrink-0" />
          Moderate ({score})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0] font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-[#15803d] shrink-0" />
        Healthy ({score})
      </span>
    );
  };

  // Warm solid colors without gradient blending
  const getScoreBarColor = (score: number) => {
    if (score >= 70) return 'bg-[#b91c1c]';
    if (score >= 40) return 'bg-[#d97706]';
    return 'bg-[#15803d]';
  };

  return (
    <div className="bg-[#faf8f5] border border-[#e4ded3] rounded-lg overflow-hidden flex flex-col h-full shadow-xs">
      {/* Table Header & Controls */}
      <div className="px-5 py-3.5 border-b border-[#e4ded3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#f4efe6]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-mono text-sm font-bold text-stone-900">
              Architectural Debt Matrix
            </h2>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#ede8df] text-stone-700 border border-[#d8d0c2] font-medium">
              {files.length} tracked files
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-0.5">
            Files weighted by commit frequency, multi-author churn, and file size
          </p>
        </div>

        {/* Quick Filter Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter file path..."
            className="w-full bg-[#faf8f5] border border-[#dcd5c9] focus:border-[#c2410c] rounded pl-8 pr-3 py-1.5 text-xs text-stone-900 placeholder-stone-400 font-mono focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Structured Hotspots Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[580px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 bg-[#ede8df] border-b border-[#e4ded3] text-stone-700 font-mono z-10 font-semibold">
            <tr>
              <th className="py-2.5 px-4">File Path</th>
              <th
                onClick={() => handleSort('debt_score')}
                className="py-2.5 px-4 cursor-pointer hover:text-stone-950 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Debt Score</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('churn_count')}
                className="py-2.5 px-4 cursor-pointer hover:text-stone-950 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Commit Churn</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('unique_authors')}
                className="py-2.5 px-4 cursor-pointer hover:text-stone-950 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Contributors</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('lines')}
                className="py-2.5 px-4 cursor-pointer hover:text-stone-950 transition-colors hidden md:table-cell"
              >
                <div className="flex items-center gap-1.5">
                  <span>Lines</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-500" />
                </div>
              </th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8e2d8] font-mono">
            {filteredAndSortedFiles.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-stone-500 font-sans">
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
                        ? 'bg-[#fff7ed] text-stone-900 font-semibold'
                        : isHighlighted
                        ? 'bg-[#fed7aa]/30 text-stone-950 font-medium'
                        : 'hover:bg-[#f5f0e6]'
                    }`}
                  >
                    {/* File Path */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <FileCode2 className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#c2410c] shrink-0" />
                        <span className="text-stone-800 group-hover:text-stone-950 font-medium truncate max-w-[280px] lg:max-w-[340px]">
                          {file.path}
                        </span>
                      </div>
                    </td>

                    {/* Debt Score & Solid Bar */}
                    <td className="py-2.5 px-4">
                      <div className="space-y-1 w-32">
                        <div>{getRiskBadge(file.debt_score)}</div>
                        <div className="w-full bg-[#ede8df] rounded h-1 overflow-hidden border border-[#dcd5c9]">
                          <div
                            className={`h-full ${getScoreBarColor(file.debt_score)}`}
                            style={{ width: `${file.debt_score}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Churn Count */}
                    <td className="py-2.5 px-4 text-stone-700">
                      <div className="flex items-center gap-1.5">
                        <GitCommit className="w-3 h-3 text-stone-500" />
                        <span>{file.churn_count} commits</span>
                      </div>
                    </td>

                    {/* Unique Authors */}
                    <td className="py-2.5 px-4 text-stone-700">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-stone-500" />
                        <span>{file.unique_authors} authors</span>
                      </div>
                    </td>

                    {/* Lines */}
                    <td className="py-2.5 px-4 text-stone-600 hidden md:table-cell">
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
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-[#ede8df] hover:bg-[#e4ded3] text-stone-800 border border-[#d8d0c2] transition-colors shadow-2xs font-medium"
                      >
                        Inspect
                        <ChevronRight className="w-3 h-3 text-stone-500" />
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
