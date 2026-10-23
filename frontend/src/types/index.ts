export interface FileCommit {
  hash: string;
  author: string;
  date: string;
  message: string;
}

export interface FileHotspot {
  path: string;
  debt_score: number;
  risk_level: 'critical' | 'moderate' | 'low';
  churn_count: number;
  unique_authors: number;
  lines: number;
  recent_commits: FileCommit[];
}

export interface CommitInfo {
  hash: string;
  author: string;
  date: string;
  message: string;
  files_changed_count: number;
}

export interface AnalysisResult {
  repo_name: string;
  analyzed_commits: number;
  total_files: number;
  high_risk_files_count: number;
  files: FileHotspot[];
  timeline: CommitInfo[];
}

export interface DiagnosisResult {
  file_path: string;
  why_it_is_debt: string;
  refactoring_steps: string[];
  source: string;
}
