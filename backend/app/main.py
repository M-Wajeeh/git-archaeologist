from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models import AnalyzeRequest, AnalysisResult, DiagnoseRequest, DiagnosisResult
from app.cache_service import get_prebaked_analysis
import os

app = FastAPI(
    title="GitArchaeologist API",
    description="Automated Architectural Debt Matrix & Git Volatility Timeline Engine",
    version="1.0.0"
)

# CORS setup for Vite frontend (http://localhost:5173) and local testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "GitArchaeologist Backend", "version": "1.0.0"}

@app.post("/api/analyze", response_model=AnalysisResult)
async def analyze_repository(req: AnalyzeRequest):
    # Check pre-baked demo repository cache first
    cached = get_prebaked_analysis(req.repo_url)
    if cached:
        return cached

    # If not prebaked, in Slice 4 we integrate the live git shallow clone analyzer.
    # For now, if someone passes an unknown repo, gracefully fallback or hint:
    # Try importing analyzer if available (for Slice 4 onwards)
    try:
        from app.analyzer import analyze_live_repo
        return await analyze_live_repo(req.repo_url)
    except ImportError:
        # Before Slice 4 is built, fallback to flask demo so the app never crashes
        fallback = get_prebaked_analysis("pallets/flask")
        if fallback:
            return fallback
        raise HTTPException(
            status_code=400,
            detail={"message": "Repository not found in demo cache", "code": "NOT_IN_DEMO_CACHE"}
        )

@app.post("/api/diagnose", response_model=DiagnosisResult)
async def diagnose_file(req: DiagnoseRequest):
    # In Slice 5 we connect live Gemini + heuristic engine
    try:
        from app.ai_service import generate_diagnosis
        return await generate_diagnosis(req)
    except ImportError:
        # Heuristic fallback for Slice 1-4
        is_high = req.churn > 20 and req.authors >= 5
        why = (
            f"With {req.churn} modifications across {req.authors} authors and {req.lines} lines, "
            f"this file exhibits severe multi-author churn and functions as a high-friction bottleneck."
            if is_high else
            f"With {req.churn} commits and {req.authors} authors, this file shows moderate architectural concentration."
        )
        return DiagnosisResult(
            file_path=req.file_path,
            why_it_is_debt=why,
            refactoring_steps=[
                "Decompose orchestrator responsibilities into discrete sub-domain modules.",
                "Isolate volatile state handlers behind stable interface boundaries."
            ],
            source="heuristic_fallback"
        )
