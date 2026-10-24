import React, { useState, useMemo } from 'react';
import { FileHotspot } from '../types';
import {
  FileCode2,
  ArrowUpDown,
  Search,
  ChevronRight,
  GitCommit,
  Users,
  Copy,
  Check,
  Download,
  Filter,
} from 'lucide-react';

interface DebtMatrixProps {
  files: FileHotspot[];
  selectedFile: FileHotspot | null;
  onSelectFile: (file: FileHotspot) => void;
  highlightedPaths?: string[];
}

type SortField = 'debt_score' | 'churn_count' | 'unique_authors' | 'lines';
type RiskFilter = 'all' | 'critical' | 'moderate' | 'low';

export const DebtMatrix: React.FC<DebtMatrixProps> = ({
  files,
  selectedFile,
  onSelectFile,
  highlightedPaths = [],
}) => {
  const [sortField, setSortField] = useState<SortField>('debt_score');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // Default descending for audit
    }
  };

  const handleCopyPath = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 1500);
  };

  const handleExportCSV = () => {
    const headers = ['File Path', 'Debt Score', 'Risk Level', 'Commit Churn', 'Contributors', 'Lines of Code'];
    const rows = files.map((f) => [
      f.path,
      f.debt_score,
      f.risk_level,
      f.churn_count,
      f.unique_authors,
      f.lines,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `architectural-debt-audit-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAndSortedFiles = useMemo(() => {
    return files
      .filter((file) => {
        const matchesSearch = file.path.toLowerCase().includes(searchFilter.toLowerCase().trim());
        const matchesRisk = riskFilter === 'all' || file.risk_level === riskFilter;
        return matchesSearch && matchesRisk;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        return sortAsc ? valA - valB : valB - valA;
      });
  }, [files, searchFilter, riskFilter, sortField, sortAsc]);

  // Risk counts for filter pills
  const riskCounts = useMemo(() => {
    return {
      all: files.length,
      critical: files.filter((f) => f.risk_level === 'critical').length,
      moderate: files.filter((f) => f.risk_level === 'moderate').length,
      low: files.filter((f) => f.risk_level === 'low').length,
    };
  }, [files]);

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

  const getFileExtensionBadge = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'py':
        return <span className="text-[10px] font-mono px-1 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">py</span>;
      case 'ts':
      case 'tsx':
        return <span className="text-[10px] font-mono px-1 rounded bg-sky-50 text-sky-700 border border-sky-200 font-semibold">{ext}</span>;
      case 'js':
      case 'jsx':
        return <span className="text-[10px] font-mono px-1 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">{ext}</span>;
      case 'json':
      case 'toml':
      case 'yaml':
      case 'yml':
        return <span className="text-[10px] font-mono px-1 rounded bg-orange-50 text-orange-700 border border-orange-200 font-semibold">{ext}</span>;
      case 'md':
        return <span className="text-[10px] font-mono px-1 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 font-semibold">md</span>;
      default:
        return <span className="text-[10px] font-mono px-1 rounded bg-zinc-100 text-zinc-600 border border-zinc-200 font-semibold">{ext || 'file'}</span>;
    }
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

        {/* Right side controls: Search & Export */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter file path..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-300 hover:border-zinc-400 focus:border-orange-500 focus:bg-white rounded-md pl-8 pr-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 font-mono focus:outline-none transition-colors"
            />
          </div>
          <button
            onClick={handleExportCSV}
            title="Export CSV Audit Report"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium rounded border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 transition-colors shadow-2xs shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Risk Filter Tabs */}
      <div className="px-5 py-2 border-b border-zinc-100 bg-zinc-50/70 flex items-center justify-between gap-2 overflow-x-auto text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-400 text-[11px] uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <button
            onClick={() => setRiskFilter('all')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              riskFilter === 'all'
                ? 'bg-zinc-800 text-white font-bold'
                : 'text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            All ({riskCounts.all})
          </button>
          <button
            onClick={() => setRiskFilter('critical')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
              riskFilter === 'critical'
                ? 'bg-red-600 text-white font-bold'
                : 'text-red-700 hover:bg-red-50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Critical ({riskCounts.critical})
          </button>
          <button
            onClick={() => setRiskFilter('moderate')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
              riskFilter === 'moderate'
                ? 'bg-amber-600 text-white font-bold'
                : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Moderate ({riskCounts.moderate})
          </button>
          <button
            onClick={() => setRiskFilter('low')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
              riskFilter === 'low'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Healthy ({riskCounts.low})
          </button>
        </div>

        <span className="text-[11px] text-zinc-400 hidden md:inline">
          Showing {filteredAndSortedFiles.length} of {files.length}
        </span>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/50 text-[11px] font-mono text-zinc-500 uppercase tracking-wider select-none">
              <th className="py-2.5 px-4 font-semibold">File Path</th>
              <th
                onClick={() => handleSort('debt_score')}
                className="py-2.5 px-4 font-semibold cursor-pointer hover:text-zinc-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Debt Score</span>
                  <ArrowUpDown className={`w-3 h-3 ${sortField === 'debt_score' ? 'text-orange-600' : 'text-zinc-400'}`} />
                </div>
              </th>
              <th
                onClick={() => handleSort('churn_count')}
                className="py-2.5 px-4 font-semibold cursor-pointer hover:text-zinc-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Commit Churn</span>
                  <ArrowUpDown className={`w-3 h-3 ${sortField === 'churn_count' ? 'text-orange-600' : 'text-zinc-400'}`} />
                </div>
              </th>
              <th
                onClick={() => handleSort('unique_authors')}
                className="py-2.5 px-4 font-semibold cursor-pointer hover:text-zinc-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Contributors</span>
                  <ArrowUpDown className={`w-3 h-3 ${sortField === 'unique_authors' ? 'text-orange-600' : 'text-zinc-400'}`} />
                </div>
              </th>
              <th
                onClick={() => handleSort('lines')}
                className="py-2.5 px-4 font-semibold cursor-pointer hover:text-zinc-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Lines</span>
                  <ArrowUpDown className={`w-3 h-3 ${sortField === 'lines' ? 'text-orange-600' : 'text-zinc-400'}`} />
                </div>
              </th>
              <th className="py-2.5 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {filteredAndSortedFiles.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-zinc-500 font-mono">
                  <FileCode2 className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-zinc-700 font-medium">No hotspot files matched your filter.</p>
                  <button
                    onClick={() => {
                      setSearchFilter('');
                      setRiskFilter('all');
                    }}
                    className="mt-2 text-xs text-orange-600 hover:text-orange-700 font-semibold underline"
                  >
                    Clear filters
                  </button>
                </td>
              </tr>
            ) : (
              filteredAndSortedFiles.map((file) => {
                const isSelected = selectedFile?.path === file.path;
                const isCrossHighlighted = highlightedPaths.includes(file.path);

                return (
                  <tr
                    key={file.path}
                    onClick={() => onSelectFile(file)}
                    className={`cursor-pointer transition-colors group ${
                      isSelected
                        ? 'bg-orange-50/70 border-l-4 border-l-orange-600'
                        : isCrossHighlighted
                        ? 'bg-amber-50/60 border-l-4 border-l-amber-500'
                        : 'hover:bg-zinc-50'
                    }`}
                  >
                    {/* File Path & Type Badge */}
                    <td className="py-3 px-4 font-mono font-medium text-zinc-900 max-w-xs sm:max-w-sm truncate">
                      <div className="flex items-center gap-2">
                        {getFileExtensionBadge(file.path)}
                        <span className="truncate group-hover:text-orange-700 transition-colors" title={file.path}>
                          {file.path}
                        </span>
                        <button
                          onClick={(e) => handleCopyPath(e, file.path)}
                          title="Copy file path"
                          className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-700 p-0.5 rounded transition-opacity"
                        >
                          {copiedPath === file.path ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Debt Score & Gauge Bar */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {getRiskBadge(file.debt_score)}
                        <div className="w-24 h-1 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              file.debt_score >= 70
                                ? 'bg-red-500'
                                : file.debt_score >= 40
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, file.debt_score)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Churn Count */}
                    <td className="py-3 px-4 font-mono text-zinc-600">
                      <div className="flex items-center gap-1.5">
                        <GitCommit className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{file.churn_count} commits</span>
                      </div>
                    </td>

                    {/* Unique Authors */}
                    <td className="py-3 px-4 font-mono text-zinc-600">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{file.unique_authors} authors</span>
                      </div>
                    </td>

                    {/* Lines of Code */}
                    <td className="py-3 px-4 font-mono text-zinc-600">
                      <span>{file.lines.toLocaleString()} loc</span>
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFile(file);
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-colors shadow-2xs ${
                          isSelected
                            ? 'bg-orange-600 text-white font-semibold'
                            : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100 group-hover:border-zinc-300'
                        }`}
                      >
                        <span>Inspect</span>
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
