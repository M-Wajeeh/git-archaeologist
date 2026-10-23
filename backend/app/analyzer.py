import os
import re
import math
import shutil
import tempfile
import subprocess
from datetime import datetime
from typing import List, Dict, Set
from fastapi import HTTPException
from app.models import AnalysisResult, FileHotspot, FileCommit, CommitInfo

def normalize_repo_url(repo_url: str) -> str:
    url = repo_url.strip()
    if not url.startswith("http://") and not url.startswith("https://") and not url.startswith("git@"):
        url = f"https://github.com/{url}"
    if not url.endswith(".git") and "github.com" in url:
        url = f"{url}.git"
    return url

def extract_repo_name(repo_url: str) -> str:
    cleaned = repo_url.strip().rstrip("/").replace(".git", "")
    if "github.com/" in cleaned:
        return cleaned.split("github.com/")[-1]
    return cleaned

async def analyze_live_repo(repo_input: str) -> AnalysisResult:
    target_url = normalize_repo_url(repo_input)
    repo_name = extract_repo_name(repo_input)

    temp_dir = tempfile.mkdtemp(prefix="gitarch_")

    try:
        # Shallow clone last 50 commits with a 15-second timeout
        clone_cmd = [
            "git", "clone",
            "--depth", "50",
            "--filter=blob:none", # partial clone optimization if supported
            "--single-branch",
            target_url,
            temp_dir
        ]

        try:
            subprocess.run(
                clone_cmd,
                check=True,
                capture_output=True,
                text=True,
                timeout=18
            )
        except subprocess.TimeoutExpired:
            raise HTTPException(
                status_code=400,
                detail={"message": "Cloning repository timed out. Try a smaller repository.", "code": "CLONE_TIMEOUT"}
            )
        except subprocess.CalledProcessError as e:
            # Fallback without blob filter if remote doesn't support partial clone
            try:
                subprocess.run(
                    ["git", "clone", "--depth", "50", "--single-branch", target_url, temp_dir],
                    check=True,
                    capture_output=True,
                    text=True,
                    timeout=18
                )
            except Exception:
                raise HTTPException(
                    status_code=400,
                    detail={"message": "Failed to clone repository. Ensure the URL is valid, public, and accessible.", "code": "CLONE_FAILED"}
                )

        # Run git log with numstat to capture commit details and file diffs
        log_cmd = [
            "git", "log",
            "-n", "50",
            "--numstat",
            "--pretty=format:COMMIT:%H|%an|%ad|%s",
            "--date=short"
        ]

        log_proc = subprocess.run(
            log_cmd,
            cwd=temp_dir,
            check=True,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace"
        )

        lines = log_proc.stdout.splitlines()

        timeline: List[CommitInfo] = []
        file_churn: Dict[str, int] = {}
        file_authors: Dict[str, Set[str]] = {}
        file_recent_commits: Dict[str, List[FileCommit]] = {}
        file_loc: Dict[str, int] = {}

        current_commit: Dict = {}
        current_commit_files: int = 0

        for line in lines:
            line = line.strip()
            if not line:
                continue

            if line.startswith("COMMIT:"):
                # Save previous commit if exists
                if current_commit:
                    current_commit["files_changed_count"] = current_commit_files
                    timeline.append(CommitInfo(**current_commit))

                parts = line[len("COMMIT:"):].split("|", 3)
                chash = parts[0] if len(parts) > 0 else ""
                cauthor = parts[1] if len(parts) > 1 else "Unknown"
                cdate = parts[2] if len(parts) > 2 else ""
                cmessage = parts[3] if len(parts) > 3 else ""

                current_commit = {
                    "hash": chash,
                    "author": cauthor,
                    "date": cdate,
                    "message": cmessage,
                    "files_changed_count": 0
                }
                current_commit_files = 0
            else:
                # Numstat line: <added> <deleted> <filepath>
                parts = line.split(maxsplit=2)
                if len(parts) == 3:
                    added_str, deleted_str, fpath = parts
                    fpath = fpath.strip()

                    # Ignore binary or rename notations like {old => new}
                    if "=>" in fpath or fpath.startswith(".git"):
                        continue

                    current_commit_files += 1

                    # Count churn
                    file_churn[fpath] = file_churn.get(fpath, 0) + 1

                    # Track authors
                    if fpath not in file_authors:
                        file_authors[fpath] = set()
                    if current_commit.get("author"):
                        file_authors[fpath].add(current_commit["author"])

                    # Track recent commits for this file
                    if fpath not in file_recent_commits:
                        file_recent_commits[fpath] = []
                    if len(file_recent_commits[fpath]) < 4 and current_commit.get("hash"):
                        file_recent_commits[fpath].append(FileCommit(
                            hash=current_commit["hash"],
                            author=current_commit.get("author", "Unknown"),
                            date=current_commit.get("date", ""),
                            message=current_commit.get("message", "")
                        ))

        # Push the final commit
        if current_commit:
            current_commit["files_changed_count"] = current_commit_files
            timeline.append(CommitInfo(**current_commit))

        # Approximate line count from files on disk if present
        for fpath in file_churn.keys():
            full_path = os.path.join(temp_dir, fpath)
            if os.path.isfile(full_path):
                try:
                    with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                        file_loc[fpath] = sum(1 for _ in f)
                except Exception:
                    file_loc[fpath] = 100
            else:
                file_loc[fpath] = 150

        # Calculate Raw Debt Scores
        raw_scores: Dict[str, float] = {}
        for fpath, churn in file_churn.items():
            author_count = len(file_authors.get(fpath, [])) or 1
            lines_count = file_loc.get(fpath, 100)
            # Formula: RawScore = churn * (author_count^1.2) * ln(lines + 10)
            score = churn * (author_count ** 1.2) * math.log(lines_count + 10)
            raw_scores[fpath] = score

        max_raw = max(raw_scores.values()) if raw_scores else 1.0

        # Build FileHotspots list
        hotspots: List[FileHotspot] = []
        for fpath, raw in raw_scores.items():
            normalized_score = min(98, max(15, int((raw / max_raw) * 98)))
            risk = "critical" if normalized_score >= 70 else ("moderate" if normalized_score >= 40 else "low")

            hotspots.append(FileHotspot(
                path=fpath,
                debt_score=normalized_score,
                risk_level=risk,
                churn_count=file_churn[fpath],
                unique_authors=len(file_authors.get(fpath, set())),
                lines=file_loc.get(fpath, 100),
                recent_commits=file_recent_commits.get(fpath, [])
            ))

        # Sort hotspots by debt score descending
        hotspots.sort(key=lambda h: h.debt_score, reverse=True)

        high_risk_count = sum(1 for h in hotspots if h.debt_score >= 70)

        return AnalysisResult(
            repo_name=repo_name,
            analyzed_commits=len(timeline),
            total_files=len(hotspots),
            high_risk_files_count=high_risk_count,
            files=hotspots[:40], # Top 40 volatile files for snappy UI
            timeline=timeline
        )

    finally:
        # Clean up temporary directory
        shutil.rmtree(temp_dir, ignore_errors=True)
