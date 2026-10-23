---
doc: spec
status: approved
---

# GitArchaeologist — Technical Spec

## How This Works, In Plain Language
GitArchaeologist is a lightweight, full-stack audit application designed to run locally. It consists of a FastAPI backend and a React (Vite + TailwindCSS) single-page frontend.

When the user enters a public GitHub repository URL or clicks one of the instant demo pills (`pallets/flask`, `fastapi/fastapi`, `expressjs/express`):
1. **Repository Ingestion**: The backend checks if the repository matches a pre-cached JSON dataset. If so, it instantly returns the audit payload (<50ms). If it's a new live URL, it executes a fast shallow clone (`git clone --depth 50`) into an isolated temporary directory.
2. **Git Commit Archaeology**: The backend runs `git log --numstat` to parse commit metadata: which files changed, lines added/deleted, author names, and commit timestamps across the last 50 commits.
3. **Debt Scoring Heuristic**: The backend computes a normalized Debt Score (0–100) for each file using a formula that weights modification frequency (churn), contributor count (team coordination overhead), and lines of code:
   $$\text{RawScore} = \text{churn} \times (\text{unique\_authors})^{1.2} \times \ln(\text{lines} + 10)$$
4. **Visual Cockpit**: The React frontend renders the **Debt Matrix** table (color-coded red/amber/green) alongside a **Volatility Timeline** showing commit activity rhythm over time.
5. **AI Architectural Diagnosis**: When the user clicks a high-risk file, the frontend requests an architectural diagnosis. The backend calls the Google Gemini API (or triggers its built-in rule-based fallback if no key is configured) to generate plain-English bullet points explaining why the file is structural debt and two concrete refactoring steps.

## The Core Journey Through the System
1. **Load**: User opens `http://localhost:5173`. Frontend loads initial state with demo quick-load pills visible.
   - *PRD ref*: `prd.md > The Core Journey (Step 1)`.
2. **Trigger Audit**: User clicks a pill or inputs a GitHub URL and presses Enter.
   - Frontend triggers loading shimmer and sends `POST /api/analyze` with `{ "repo_url": "..." }`.
   - *PRD ref*: `prd.md > The Core Journey (Steps 2-3)`.
3. **Data Return & Render**:
   - Backend returns files list, aggregate repository metrics, and commit timeline list.
   - Frontend populates the **Debt Matrix** (sorted by highest debt) and **Volatility Timeline**.
   - *PRD ref*: `prd.md > The Core Journey (Step 4)` and `prd.md > Main Cockpit (Split View)`.
4. **Inspect Hotspot**:
   - User clicks a red hotspot file.
   - Frontend opens the **Inspector Drawer** and requests `POST /api/diagnose` with file stats.
   - Backend returns markdown summary ("Why this is debt" + 2 refactoring steps).
   - *PRD ref*: `prd.md > The Core Journey (Steps 5-6)` and `prd.md > Inspector Drawer (Slide-In Panel)`.
5. **Dismiss**: User presses `Esc` or clicks backdrop to close drawer.
   - *PRD ref*: `prd.md > The Core Journey (Step 7)`.

## Stack
- **Backend**:
  - Python 3.10+
  - **FastAPI** (`fastapi`): Fast, typed, lightweight async HTTP API framework.
  - **Uvicorn** (`uvicorn`): ASGI production-grade local web server.
  - **Google GenAI SDK** (`google-genai`): Access to Google Gemini API for architectural diagnostics.
  - **Python Subprocess & Git CLI**: Native, dependency-free shallow clone and `git log` parsing.
  - **Pydantic**: Robust request/response schema validation.
- **Frontend**:
  - **React 18** with **TypeScript**: Modern type-safe component architecture.
  - **Vite**: Sub-second local build tool and development server.
  - **TailwindCSS**: High-speed utility styling configured for the dark slate/zinc cockpit aesthetic.
  - **Lucide React** (`lucide-react`): Crisp developer iconography.
- **Documentation Links**:
  - FastAPI: [https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/)
  - Vite: [https://vitejs.dev/](https://vitejs.dev/)
  - Google Gemini API: [https://ai.google.dev/gemini-api/docs](https://ai.google.dev/gemini-api/docs)
  - TailwindCSS: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)

## Where It Runs and How Someone Tries It
- **Runtime**: Local workstation (Windows/macOS/Linux) with `python` (>=3.10), `git`, and `npm` installed.
- **Environment Variables**:
  - Optional: `GEMINI_API_KEY` (if set in `backend/.env`, enables live Gemini 1.5/2.0 calls; if omitted, deterministic heuristic engine generates diagnoses without error).
- **Start Commands**:
  1. Backend:
     ```bash
     cd backend
     python -m venv venv
     ./venv/Scripts/activate  # On Windows (or source venv/bin/activate on Unix)
     pip install -r requirements.txt
     uvicorn app.main:app --reload --port 8000
     ```
  2. Frontend:
     ```bash
     cd frontend
     npm install
     npm run dev
     ```
  3. Open Browser: `http://localhost:5173`
- **Hackathon Demo Recording**:
  - Open `http://localhost:5173`.
  - Click `pallets/flask` demo pill (demonstrates instant audit rendering).
  - Walk through the Debt Matrix and Volatility Timeline.
  - Click a red hotspot file to show the sliding Inspector Drawer and AI diagnosis.
  - Input a live public GitHub URL (e.g. `fastapi/fastapi`) to showcase live shallow-clone execution in ~3 seconds.

## Look and Feel
Carried directly from `prd.md > Look and Feel`:
- **Palette**: Deep slate/zinc `#090d16` (background), `#0f172a` (panels), `#1e293b` (borders/cards).
- **Text & Badges**: Clean white `#f8fafc`, muted slate `#94a3b8`, monospaced badges (`font-mono`) for paths and hashes.
- **Risk Colors**:
  - Red (`#ef4444` / `bg-red-500/20 text-red-400 border-red-500/30`) for high debt (>=70).
  - Amber (`#f59e0b` / `bg-amber-500/20 text-amber-400 border-amber-500/30`) for moderate debt (40-69).
  - Emerald (`#10b981` / `bg-emerald-500/20 text-emerald-400 border-emerald-500/30`) for low debt (<40).
- **Density**: Compact, high-information cockpit layout with zero visual clutter.

## Components

### Backend Components

#### 1. API Server (`app/main.py`)
- Exposes CORS-enabled routes:
  - `GET /api/health`: Health status.
  - `POST /api/analyze`: Ingests `{ "repo_url": str }`, coordinates cloning or cached lookup, returns full audit payload.
  - `POST /api/diagnose`: Ingests file metrics `{ "file_path": str, "churn": int, "authors": int, "lines": int, "sample_commits": list[str] }`, returns diagnosis markdown.
- PRD ref: `prd.md > Command Header & Repository Ingestion`.

#### 2. Git Archaeology Engine (`app/analyzer.py`)
- Manages temporary directory shallow cloning via `subprocess.run(["git", "clone", "--depth", "50", ...])`.
- Executes `git log --numstat --pretty=format:"COMMIT:%H|%an|%ad|%s"` and parses per-file additions, deletions, author counts, and total changes.
- Calculates normalized Debt Score (0–100) and formats output JSON.
- PRD ref: `prd.md > Architectural Debt Matrix` and `prd.md > Git Volatility Timeline`.

#### 3. AI Diagnostic Service (`app/ai_service.py`)
- Checks for `GEMINI_API_KEY`. If present, calls Gemini Flash model with an architectural audit prompt requesting:
  - "Why this is debt" (concise 2 sentences).
  - "Recommended Refactoring Steps" (2 numbered items).
- If key is absent or API errors, falls back to an intelligent heuristic template based on the file's churn-to-author ratio and size.
- PRD ref: `prd.md > Inspector Drawer & AI Architectural Diagnosis`.

#### 4. Pre-cached Dataset Provider (`app/cache_service.py`)
- Loads pre-baked JSON audit snapshots for `pallets/flask`, `fastapi/fastapi`, and `expressjs/express` directly from disk.
- PRD ref: `prd.md > Product Decisions (Pre-cached Demo Repositories)`.

---

### Frontend Components

#### 1. CommandHeader (`src/components/CommandHeader.tsx`)
- Renders brand logo, 3 quick-load pills, input box with `⌘K` badge, and top-border progress shimmer.
- PRD ref: `prd.md > Command Header (Top Bar)`.

#### 2. DebtMatrix (`src/components/DebtMatrix.tsx`)
- Structured table rendering file paths, Debt Score progress bar with color badges, churn count, and author count.
- Provides sort toggles (by score, churn, authors).
- Emits `onSelectFile(file)` on row click.
- PRD ref: `prd.md > Left Panel (Debt Matrix)`.

#### 3. VolatilityTimeline (`src/components/VolatilityTimeline.tsx`)
- Renders chronological commit rhythm, commit message list, author tags, and relative timestamps.
- PRD ref: `prd.md > Right Panel (Volatility Sparkline & Timeline)`.

#### 4. InspectorDrawer (`src/components/InspectorDrawer.tsx`)
- Slides in smoothly from the right with backdrop blur.
- Shows file metadata, 3 stat micro-cards, recent commit log for that file, and the formatted AI diagnosis block.
- Closes on `Esc` or backdrop click.
- PRD ref: `prd.md > Inspector Drawer (Slide-In Panel)`.

#### 5. ErrorBanner (`src/components/ErrorBanner.tsx`)
- Inline notification under header on clone failure with 1-click fallback button.
- PRD ref: `prd.md > Error State`.

## Data Model

### Analysis Response Schema (`AnalysisResult`)
```json
{
  "repo_name": "pallets/flask",
  "analyzed_commits": 50,
  "total_files": 42,
  "high_risk_files_count": 5,
  "files": [
    {
      "path": "src/flask/app.py",
      "debt_score": 92,
      "risk_level": "critical",
      "churn_count": 28,
      "unique_authors": 7,
      "lines": 1420,
      "recent_commits": [
        { "hash": "a1b2c3d", "author": "Alice", "message": "Refactor router dispatch", "date": "2026-03-12" }
      ]
    }
  ],
  "timeline": [
    {
      "hash": "a1b2c3d",
      "author": "Alice",
      "date": "2026-03-12",
      "message": "Refactor router dispatch",
      "files_changed_count": 4
    }
  ]
}
```

### Diagnosis Response Schema (`DiagnosisResult`)
```json
{
  "file_path": "src/flask/app.py",
  "why_it_is_debt": "With 28 modifications across 7 different authors, this file acts as a central God Object orchestrating app configuration, routing, and lifecycle hooks.",
  "refactoring_steps": [
    "Extract configuration and lifecycle handler hooks into a dedicated AppConfig module.",
    "Decouple route registration logic using pluggable Blueprint dispatchers."
  ],
  "source": "gemini" // or "heuristic_fallback"
}
```

## File Structure
```
git-archaeologist/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application & endpoints
│   │   ├── analyzer.py          # Git shallow clone & churn analysis engine
│   │   ├── ai_service.py        # Gemini API client & heuristic fallback
│   │   ├── cache_service.py     # Pre-cached demo repository loader
│   │   ├── models.py            # Pydantic data schemas
│   │   └── data/
│   │       └── prebaked/        # Pre-calculated demo JSON files
│   │           ├── flask.json
│   │           ├── fastapi.json
│   │           └── express.json
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CommandHeader.tsx
│   │   │   ├── DebtMatrix.tsx
│   │   │   ├── VolatilityTimeline.tsx
│   │   │   ├── InspectorDrawer.tsx
│   │   │   └── ErrorBanner.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── devpost/
│   ├── learner-profile.md
│   ├── scope.md
│   ├── prd.md
│   └── spec.md
├── .gitignore
└── README.md
```

## External Services and Dependencies
- **Git CLI**: Native git executable on system path for shallow cloning.
- **Google Gemini API**:
  - Endpoint: `gemini-1.5-flash` or `gemini-2.0-flash` via `google-genai`.
  - Auth: `GEMINI_API_KEY` environment variable.
  - Cost: Free tier / low cost.
  - Fallback: Deterministic algorithmic diagnosis if key absent or quota exceeded.

## Important Failure Modes
1. **GitHub Shallow Clone Fails (Private Repo / Bad URL / Network Timeout)**:
   - Backend catches `subprocess.CalledProcessError` or timeout (>10s).
   - Returns structured HTTP 400 error: `{"detail": "Unable to clone repository. Is it public?", "code": "CLONE_FAILED"}`.
   - Frontend drops down `ErrorBanner` with mono error code and button: *"Load Demo Repository Instead"*.
2. **Missing Gemini API Key or Quota Limit**:
   - `ai_service.py` intercepts `google.genai.errors.APIError` or absence of key.
   - Returns intelligent heuristic diagnostic payload seamlessly without user disruption.
3. **Empty or Shallow Repositories (<5 commits)**:
   - Analyzer adapts normalization bounds so scores remain proportional and readable.

## What Was Simplified and Why
- **Git Subprocess instead of Libgit2/PyGit2**: Using `subprocess.run(["git", ...])` avoids binary build failures on Windows/macOS while remaining blazing fast for a 50-commit shallow clone.
- **In-Memory & Pre-cached Storage instead of SQLite/PostgreSQL**: Guarantees zero migration headaches and allows any hackathon evaluator to run the app with single commands.
- **50-Commit Shallow Clone instead of Full Clone**: Reduces clone time from 45 seconds down to <1.5 seconds, fitting comfortably within the 3-second UI response target.

## Decisions and Open Issues
- **Decisions**:
  - Agreed on Python `subprocess` git approach for shallow cloning.
  - Agreed on Google Gemini with built-in heuristic fallback.
  - Agreed on single-view Split Cockpit (Debt Matrix + Timeline + Inspector Drawer).
  - Review format confirmed as Markdown.
- **Learner Concept / Uncertainty Resolution**:
  - Handled the risk of git network latency and API quota during live hackathon demos by creating pre-cached zero-latency JSON snapshots for the 3 demo repositories.
- **Open Issues**:
  - None blocking implementation. Ready for `5-build`.
