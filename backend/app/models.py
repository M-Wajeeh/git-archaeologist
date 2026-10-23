from pydantic import BaseModel, Field
from typing import List, Optional

class AnalyzeRequest(BaseModel):
    repo_url: str = Field(..., description="GitHub repository URL or owner/repo slug")

class FileCommit(BaseModel):
    hash: str
    author: str
    date: str
    message: str

class FileHotspot(BaseModel):
    path: str
    debt_score: int
    risk_level: str  # "critical", "moderate", "low"
    churn_count: int
    unique_authors: int
    lines: int
    recent_commits: List[FileCommit] = []

class CommitInfo(BaseModel):
    hash: str
    author: str
    date: str
    message: str
    files_changed_count: int = 1

class AnalysisResult(BaseModel):
    repo_name: str
    analyzed_commits: int
    total_files: int
    high_risk_files_count: int
    files: List[FileHotspot]
    timeline: List[CommitInfo]

class DiagnoseRequest(BaseModel):
    file_path: str
    churn: int
    authors: int
    lines: int
    recent_commits: List[FileCommit] = []

class DiagnosisResult(BaseModel):
    file_path: str
    why_it_is_debt: str
    refactoring_steps: List[str]
    source: str  # "gemini" or "heuristic_fallback"
