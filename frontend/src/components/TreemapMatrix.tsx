import React, { useState, useMemo } from 'react';
import { FileHotspot } from '../types';
import {
  ArrowUpDown,
  Search,
  ChevronRight,
  Copy,
  Check,
  Download,
  Grid3X3,
  List as ListIcon,
} from 'lucide-react';

interface TreemapMatrixProps {
  files: FileHotspot[];
  selectedFile: FileHotspot | null;
  onSelectFile: (file: FileHotspot) => void;
  highlightedPaths?: string[];
}

type ViewMode = 'treemap' | 'table';
type SortField = 'debt_score' | 'churn_count' | 'unique_authors' | 'lines';

export const TreemapMatrix: React.FC<TreemapMatrixProps> = ({
  files,
  selectedFile,
  onSelectFile,
  highlightedPaths = [],
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('treemap');
  const [sortField, setSortField] = useState<SortField>('debt_score');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
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
    link.setAttribute('download', `gitarchaeologist-audit-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Color generator based on Debt Score matching the Concept 1 palette
  const getTileStyle = (score: number, isSelected: boolean, isHighlighted: boolean) => {
    let bg = '#e2e8f0';
    let text = '#334155';
    let sub = '#64748b';
    let border = '#cbd5e1';

    if (score >= 90) {
      // Deep crimson / blood rust
      bg = '#841f1f';
      text = '#ffffff';
      sub = '#fca5a5';
      border = '#681515';
    } else if (score >= 70) {
      // Rich terracotta / burnt orange
      bg = '#be3b1e';
      text = '#ffffff';
      sub = '#fdba74';
      border = '#9c2e17';
    } else if (score >= 55) {
      // Warm amber / gold
      bg = '#ea8b2e';
      text = '#ffffff';
      sub = '#fed7aa';
      border = '#c26e1c';
    } else if (score >= 45) {
      // Soft ochre / mustard cream
      bg = '#f5cf7c';
      text = '#1c1917';
      sub = '#78350f';
      border = '#d8b05c';
    } else if (score >= 30) {
      // Light sand / warm yellow
      bg = '#faeec8';
      text = '#1c1917';
      sub = '#854d0e';
      border = '#e2d3a3';
    } else {
      // Soft pale blue-gray
      bg = '#e2e8f0';
      text = '#1e293b';
      sub = '#64748b';
      border = '#cbd5e1';
    }

    return {
      backgroundColor: bg,
      color: text,
      borderColor: isSelected ? '#ffffff' : border,
      boxShadow: isSelected
        ? '0 0 0 3px #ea580c, 0 10px 15px -3px rgba(0, 0, 0, 0.2)'
        : isHighlighted
        ? '0 0 0 2px #f97316'
        : '0 1px 2px rgba(0,0,0,0.04)',
      subColor: sub,
    };
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

  // Group files into 5 visual clusters for the Concept 1 Treemap grid
  const treemapClusters = useMemo(() => {
    const list = [...files].sort((a, b) => b.debt_score - a.debt_score);
    if (list.length === 0) return [];

    // Col 1: Top major hotspot (e.g. app.py, score 98) + lower box
    const col1 = [list[0], list[4]].filter(Boolean);
    // Col 2: High friction files (e.g. blueprints.py 74, ctx.py 47)
    const col2 = [list[1], list[5]].filter(Boolean);
    // Col 3: Secondary hotspots (e.g. helpers 75, templating 62, configs 15)
    const col3 = [list[2], list[3], list[6]].filter(Boolean);
    // Col 4: Moderate files (e.g. sessions 56, small utils 15, 17)
    const col4 = [list[7], list[8], list[9], list[10]].filter(Boolean);
    // Col 5: Tail files
    const col5 = list.slice(11, 16);

    return [col1, col2, col3, col4, col5].filter((c) => c.length > 0);
  }, [files]);

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs flex flex-col h-full">
      {/* Top Controller Bar */}
      <div className="px-5 py-3 border-b border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white">
        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center p-0.5 rounded-lg bg-zinc-100 border border-zinc-200 text-xs font-mono">
            <button
              onClick={() => setViewMode('treemap')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                viewMode === 'treemap'
                  ? 'bg-white text-zinc-900 font-bold shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5 text-orange-600" />
              <span>Area Map</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-zinc-900 font-bold shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5 text-zinc-500" />
              <span>List View</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-zinc-400 hidden md:inline ml-2">
            Weighted by churn &amp; multi-author dispersion
          </span>
        </div>

        {/* Severity Legend or Table Search */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {viewMode === 'treemap' ? (
            <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500">
              <span className="uppercase text-[10px] tracking-wider text-zinc-400">Severity:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#e2e8f0] border border-zinc-300" title="Low" />
                <span className="w-2.5 h-2.5 rounded-xs bg-[#f5cf7c]" title="Moderate" />
                <span className="w-2.5 h-2.5 rounded-xs bg-[#ea8b2e]" title="High" />
                <span className="w-2.5 h-2.5 rounded-xs bg-[#be3b1e]" title="Critical" />
                <span className="w-2.5 h-2.5 rounded-xs bg-[#841f1f]" title="Severe" />
              </div>
              <span className="text-zinc-400 ml-1">15 → 98</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter path..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-300 focus:border-orange-500 focus:bg-white rounded-md pl-8 pr-2.5 py-1 text-xs font-mono"
                />
              </div>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-mono rounded border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
              >
                <Download className="w-3 h-3 text-zinc-500" />
                <span>Export</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Viewport */}
      {viewMode === 'treemap' ? (
        /* ================= TREEMAP VIEW (Concept 1) ================= */
        <div className="p-4 sm:p-5 flex-1 bg-[#fafaf9]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 min-h-[380px] h-full">
            {/* Column 1: Dominant Giant Hotspot (col-span-3) */}
            {treemapClusters[0] && (
              <div className="md:col-span-3 flex flex-col gap-2.5">
                {treemapClusters[0].map((file, idx) => {
                  const isSelected = selectedFile?.path === file.path;
                  const isHighlighted = highlightedPaths.includes(file.path);
                  const style = getTileStyle(file.debt_score, isSelected, isHighlighted);
                  const isPrimary = idx === 0;

                  return (
                    <div
                      key={file.path}
                      onClick={() => onSelectFile(file)}
                      style={{
                        backgroundColor: style.backgroundColor,
                        color: style.color,
                        boxShadow: style.boxShadow,
                      }}
                      className={`rounded-lg p-3.5 cursor-pointer transition-all relative flex flex-col justify-between border select-none group ${
                        isPrimary ? 'flex-2 min-h-[220px]' : 'flex-1 min-h-[120px]'
                      }`}
                    >
                      {/* Top Header: File Name */}
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className="font-mono font-bold text-xs truncate max-w-[140px] tracking-tight"
                            title={file.path}
                          >
                            {file.path.split('/').pop()}
                          </span>
                          <span
                            className="text-[10px] font-mono opacity-80"
                            style={{ color: style.subColor }}
                          >
                            {file.churn_count}c • {file.unique_authors}a
                          </span>
                        </div>
                        <p
                          className="text-[10px] font-mono truncate mt-0.5 opacity-75"
                          style={{ color: style.subColor }}
                          title={file.path}
                        >
                          {file.path}
                        </p>
                      </div>

                      {/* Bottom Footer: Massive Debt Score */}
                      <div className="flex items-end justify-between mt-4">
                        <span className="font-mono font-extrabold text-2xl tracking-tighter leading-none">
                          {file.debt_score}
                        </span>
                        <span
                          className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: file.debt_score >= 70 ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)',
                          }}
                        >
                          {file.risk_level}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Column 2: Secondary Hotspots (col-span-3) */}
            {treemapClusters[1] && (
              <div className="md:col-span-3 flex flex-col gap-2.5">
                {treemapClusters[1].map((file, idx) => {
                  const isSelected = selectedFile?.path === file.path;
                  const isHighlighted = highlightedPaths.includes(file.path);
                  const style = getTileStyle(file.debt_score, isSelected, isHighlighted);
                  const isLarge = idx === 0;

                  return (
                    <div
                      key={file.path}
                      onClick={() => onSelectFile(file)}
                      style={{
                        backgroundColor: style.backgroundColor,
                        color: style.color,
                        boxShadow: style.boxShadow,
                      }}
                      className={`rounded-lg p-3.5 cursor-pointer transition-all relative flex flex-col justify-between border select-none group ${
                        isLarge ? 'flex-2 min-h-[200px]' : 'flex-1 min-h-[140px]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className="font-mono font-bold text-xs truncate max-w-[130px] tracking-tight"
                            title={file.path}
                          >
                            {file.path.split('/').pop()}
                          </span>
                          <span
                            className="text-[10px] font-mono opacity-80"
                            style={{ color: style.subColor }}
                          >
                            {file.churn_count}c
                          </span>
                        </div>
                        <p
                          className="text-[10px] font-mono truncate mt-0.5 opacity-75"
                          style={{ color: style.subColor }}
                        >
                          {file.path}
                        </p>
                      </div>

                      <div className="flex items-end justify-between mt-4">
                        <span className="font-mono font-extrabold text-2xl tracking-tighter leading-none">
                          {file.debt_score}
                        </span>
                        <span
                          className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: file.debt_score >= 70 ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)',
                          }}
                        >
                          {file.risk_level}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Column 3: Medium Tier Hotspots (col-span-2) */}
            {treemapClusters[2] && (
              <div className="md:col-span-2 flex flex-col gap-2.5">
                {treemapClusters[2].map((file) => {
                  const isSelected = selectedFile?.path === file.path;
                  const isHighlighted = highlightedPaths.includes(file.path);
                  const style = getTileStyle(file.debt_score, isSelected, isHighlighted);

                  return (
                    <div
                      key={file.path}
                      onClick={() => onSelectFile(file)}
                      style={{
                        backgroundColor: style.backgroundColor,
                        color: style.color,
                        boxShadow: style.boxShadow,
                      }}
                      className="rounded-lg p-3 cursor-pointer transition-all flex flex-col justify-between border select-none flex-1 min-h-[105px]"
                    >
                      <div>
                        <span
                          className="font-mono font-bold text-[11px] truncate block tracking-tight"
                          title={file.path}
                        >
                          {file.path.split('/').pop()}
                        </span>
                      </div>
                      <div className="flex items-end justify-between mt-2">
                        <span className="font-mono font-extrabold text-xl tracking-tighter">
                          {file.debt_score}
                        </span>
                        <span className="text-[10px] font-mono opacity-80">
                          {file.churn_count}c
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Column 4: Moderate Files (col-span-2) */}
            {treemapClusters[3] && (
              <div className="md:col-span-2 flex flex-col gap-2.5">
                {treemapClusters[3].map((file) => {
                  const isSelected = selectedFile?.path === file.path;
                  const isHighlighted = highlightedPaths.includes(file.path);
                  const style = getTileStyle(file.debt_score, isSelected, isHighlighted);

                  return (
                    <div
                      key={file.path}
                      onClick={() => onSelectFile(file)}
                      style={{
                        backgroundColor: style.backgroundColor,
                        color: style.color,
                        boxShadow: style.boxShadow,
                      }}
                      className="rounded-lg p-2.5 cursor-pointer transition-all flex flex-col justify-between border select-none flex-1 min-h-[80px]"
                    >
                      <span
                        className="font-mono font-bold text-[10px] truncate block"
                        title={file.path}
                      >
                        {file.path.split('/').pop()}
                      </span>
                      <div className="flex items-end justify-between mt-1">
                        <span className="font-mono font-bold text-base leading-none">
                          {file.debt_score}
                        </span>
                        <span className="text-[9px] font-mono opacity-70">
                          {file.churn_count}c
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Column 5: Stable Edges / Tail Files (col-span-2) */}
            {treemapClusters[4] && (
              <div className="md:col-span-2 flex flex-col gap-2.5">
                {treemapClusters[4].map((file) => {
                  const isSelected = selectedFile?.path === file.path;
                  const isHighlighted = highlightedPaths.includes(file.path);
                  const style = getTileStyle(file.debt_score, isSelected, isHighlighted);

                  return (
                    <div
                      key={file.path}
                      onClick={() => onSelectFile(file)}
                      style={{
                        backgroundColor: style.backgroundColor,
                        color: style.color,
                        boxShadow: style.boxShadow,
                      }}
                      className="rounded-lg p-2 cursor-pointer transition-all flex flex-col justify-between border select-none flex-1 min-h-[65px]"
                    >
                      <span
                        className="font-mono text-[10px] font-medium truncate block"
                        title={file.path}
                      >
                        {file.path.split('/').pop()}
                      </span>
                      <div className="flex items-end justify-between mt-1">
                        <span className="font-mono font-bold text-sm">
                          {file.debt_score}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-400">
                          {file.unique_authors}a
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= TABLE LIST VIEW ================= */
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
                    <span>Churn</span>
                    <ArrowUpDown className={`w-3 h-3 ${sortField === 'churn_count' ? 'text-orange-600' : 'text-zinc-400'}`} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('unique_authors')}
                  className="py-2.5 px-4 font-semibold cursor-pointer hover:text-zinc-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Authors</span>
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
              {filteredAndSortedFiles.map((file) => {
                const isSelected = selectedFile?.path === file.path;
                const isCrossHighlighted = highlightedPaths.includes(file.path);

                return (
                  <tr
                    key={file.path}
                    onClick={() => onSelectFile(file)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-orange-50/80 border-l-4 border-l-orange-600'
                        : isCrossHighlighted
                        ? 'bg-amber-50/60 border-l-4 border-l-amber-500'
                        : 'hover:bg-zinc-50'
                    }`}
                  >
                    <td className="py-2.5 px-4 font-mono font-medium text-zinc-900">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-xs">{file.path}</span>
                        <button
                          onClick={(e) => handleCopyPath(e, file.path)}
                          title="Copy file path"
                          className="text-zinc-400 hover:text-zinc-700 p-0.5 rounded"
                        >
                          {copiedPath === file.path ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                          file.debt_score >= 70
                            ? 'bg-red-100 text-red-800'
                            : file.debt_score >= 40
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {file.debt_score} / 100
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-zinc-600">
                      {file.churn_count} commits
                    </td>
                    <td className="py-2.5 px-4 font-mono text-zinc-600">
                      {file.unique_authors} contributors
                    </td>
                    <td className="py-2.5 px-4 font-mono text-zinc-600">
                      {file.lines.toLocaleString()} loc
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFile(file);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-mono text-orange-600 hover:text-orange-700 font-semibold"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
