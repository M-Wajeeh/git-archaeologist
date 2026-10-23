import os
import json
import logging
from app.models import DiagnoseRequest, DiagnosisResult

logger = logging.getLogger("ai_service")

async def generate_diagnosis(req: DiagnoseRequest) -> DiagnosisResult:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()

    # If Gemini API key is available, attempt live LLM call
    if api_key:
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=api_key)

            commits_summary = "\n".join([f"- {c.hash[:7]}: {c.message}" for c in req.recent_commits[:4]])

            prompt = f"""You are a principal software architect performing a forensic git code-debt audit.
Analyze this high-churn repository hotspot:
- File Path: {req.file_path}
- Modification Churn: {req.churn} commits in the last 50 commits
- Active Contributors: {req.authors} unique developers
- Size: {req.lines} lines of code
- Recent Commits:
{commits_summary}

Respond with valid JSON containing:
1. "why_it_is_debt": 2 concise, punchy sentences in plain English explaining why this file is a high-risk architectural bottleneck.
2. "refactoring_steps": A JSON array of exactly 2 concrete, actionable refactoring steps to reduce architectural coupling.

JSON response:"""

            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.3
                )
            )

            if response and response.text:
                parsed = json.loads(response.text)
                return DiagnosisResult(
                    file_path=req.file_path,
                    why_it_is_debt=parsed.get("why_it_is_debt", ""),
                    refactoring_steps=parsed.get("refactoring_steps", []),
                    source="gemini"
                )
        except Exception as e:
            logger.warning(f"Gemini API invocation failed, falling back to heuristic engine: {e}")

    # Deterministic Architectural Heuristic Engine (zero downtime fallback)
    churn = req.churn
    authors = req.authors
    lines = req.lines

    if churn >= 20 and authors >= 5:
        why = (
            f"With {churn} commits across {authors} distinct contributors, '{req.file_path}' has evolved into an architectural God Object. "
            f"Heavy multi-author modification velocity creates frequent merge contention and suggests multiple domain responsibilities are tightly entangled here."
        )
        steps = [
            "Decompose top-level orchestration responsibilities into discrete sub-domain modules behind explicit boundary interfaces.",
            "Extract configuration hooks and request lifecycle handlers into dedicated pluggable dispatchers."
        ]
    elif lines >= 1000:
        why = (
            f"At {lines} lines of code and {churn} recent modifications, this file has accrued significant structural inertia. "
            f"Its large surface area increases the blast radius of changes and makes regression-free modifications difficult for the team."
        )
        steps = [
            "Carve out cohesive sub-routines into focused utility classes with explicit input/output type signatures.",
            "Implement high-coverage boundary unit tests to verify stability before refactoring internal logic."
        ]
    else:
        why = (
            f"With {churn} modifications across {authors} developers, this file exhibits disproportionate volatility compared to the rest of the codebase. "
            f"Frequent localized changes suggest unstable interface contracts that force downstream components to adapt repeatedly."
        )
        steps = [
            "Freeze the core public API surface and encapsulate internal implementation state behind accessor functions.",
            "Separate volatile business rules from the stable configuration and routing scaffolding."
        ]

    return DiagnosisResult(
        file_path=req.file_path,
        why_it_is_debt=why,
        refactoring_steps=steps,
        source="heuristic_fallback"
    )
