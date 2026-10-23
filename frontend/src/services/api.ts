import { AnalysisResult, DiagnosisResult, FileHotspot } from '../types';

export async function analyzeRepository(repoUrl: string): Promise<AnalysisResult> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repo_url: repoUrl }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail?.message || errorData.detail || 'Failed to analyze repository';
    const code = errorData.detail?.code || 'ANALYSIS_ERROR';
    const error: any = new Error(typeof message === 'string' ? message : JSON.stringify(message));
    error.code = code;
    throw error;
  }

  return response.json();
}

export async function diagnoseHotspot(file: FileHotspot): Promise<DiagnosisResult> {
  const response = await fetch('/api/diagnose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_path: file.path,
      churn: file.churn_count,
      authors: file.unique_authors,
      lines: file.lines,
      recent_commits: file.recent_commits,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate architectural diagnosis');
  }

  return response.json();
}
