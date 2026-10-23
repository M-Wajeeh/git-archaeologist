import json
import os
from pathlib import Path
from typing import Optional
from app.models import AnalysisResult

PREBAKED_DIR = Path(__file__).resolve().parent / "data" / "prebaked"

DEMO_MAPPINGS = {
    "pallets/flask": "flask.json",
    "flask": "flask.json",
    "https://github.com/pallets/flask": "flask.json",
    "https://github.com/pallets/flask.git": "flask.json",
    
    "tiangolo/fastapi": "fastapi.json",
    "fastapi/fastapi": "fastapi.json",
    "fastapi": "fastapi.json",
    "https://github.com/tiangolo/fastapi": "fastapi.json",
    "https://github.com/tiangolo/fastapi.git": "fastapi.json",
    
    "expressjs/express": "express.json",
    "express": "express.json",
    "https://github.com/expressjs/express": "express.json",
    "https://github.com/expressjs/express.git": "express.json",
}

def get_prebaked_analysis(repo_url: str) -> Optional[AnalysisResult]:
    clean_key = repo_url.strip().lower().rstrip("/")
    filename = DEMO_MAPPINGS.get(clean_key)
    
    # Try slug matching if full URL was passed
    if not filename and "github.com/" in clean_key:
        slug = clean_key.split("github.com/")[-1].replace(".git", "")
        filename = DEMO_MAPPINGS.get(slug)
        
    if not filename:
        return None
        
    file_path = PREBAKED_DIR / filename
    if not file_path.exists():
        return None
        
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        return AnalysisResult(**data)
