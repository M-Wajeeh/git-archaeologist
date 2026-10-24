# GitArchaeologist

> **Architectural Debt Matrix & Git Volatility Inspector**  
> *Quantifying codebase friction through multi-author commit churn and AI architectural forensics.*  
> Built for the Devpost Learn **Build With AI: Basics** Hackathon.

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.115-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18.3_TypeScript-61DAFB.svg?logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS_3.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com)
[![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini_1.5_Flash-4285F4.svg?logo=google)](https://ai.google.dev/)

---

## 📑 Table of Contents

1. [Executive Summary](#-executive-summary)
2. [The Core Philosophy: Why Volatility > Raw Lines](#-the-core-philosophy-why-volatility--raw-lines)
3. [The Architectural Debt Formula](#-the-architectural-debt-formula)
4. [Key Features & User Journey](#-key-features--user-journey)
5. [User Interface Design System](#-user-interface-design-system)
6. [System Architecture & Data Flow](#-system-architecture--data-flow)
7. [Subsystem Deep Dives](#-subsystem-deep-dives)
   - [Git Shallow Cloner & Telemetry Parser](#1-git-shallow-cloner--telemetry-parser-backendappanalyzerpy)
   - [AI Diagnostic Engine & Deterministic Fallback](#2-ai-diagnostic-engine--fallback-backendappai_servicepy)
   - [Pre-baked Zero-Latency Engine](#3-pre-baked-zero-latency-engine-backendappcache_servicepy)
   - [Interactive Split Cockpit](#4-interactive-split-cockpit-frontend)
8. [API Reference & Data Contracts](#-api-reference--data-contracts)
9. [Project Directory Structure](#-project-directory-structure)
10. [Exhaustive Setup & Installation Guide](#-exhaustive-setup--installation-guide)
11. [Configuration & Environment Variables](#-configuration--environment-variables)
12. [Troubleshooting & FAQ](#-troubleshooting--faq)
13. [Hackathon Verification & Planning Artifacts](#-hackathon-verification--planning-artifacts)

---

## 💡 Executive Summary

Most static code analyzers evaluate technical debt using superficial metrics like line counts, cyclomatic complexity, or linter warnings. While helpful, these static metrics fail to capture where **active engineering friction** actually occurs. A 3,000-line utility file that hasn't been modified in three years causes almost zero drag on a team. Conversely, a 400-line orchestration file modified 35 times across 8 distinct engineers in a single month is an architectural crisis: merge conflicts arise constantly, mental context is fragmented, and regressions are frequent.

**GitArchaeologist** is an automated developer cockpit that performs forensic analysis on public Git repositories. By shallow-cloning recent commit history, it constructs an **Architectural Debt Matrix** that ranks files by collaborative volatility, correlates commit bursts along a **Volatility Timeline**, and provides an **AI Inspector Drawer** that delivers plain-English architectural diagnoses and actionable two-step refactoring blueprints.

---

## 🔬 The Core Philosophy: Why Volatility > Raw Lines

GitArchaeologist models technical debt as a function of **Collaborative Friction**:

| Metric Dimension | Why It Matters | In GitArchaeologist |
| :--- | :--- | :--- |
| **Commit Churn ($C$)** | Indicates how frequently a module requires modification. High frequency signals unstable interfaces or leaky abstractions. | Extracted from `git log --numstat` across the last 50 commits. |
| **Author Dispersion ($A$)** | When multiple engineers independently modify the same file, merge contention and diverging mental models multiply non-linearly. | Super-linear exponent ($A^{1.2}$) penalizes high multi-contributor overlap. |
| **File Footprint ($L$)** | Larger files increase blast radius, but length alone is not debt without velocity. | Logarithmic dampener ($\ln(L + 10)$) ensures code size scales debt proportionally rather than dominating it. |

---

## 🧮 The Architectural Debt Formula

For every modified file in the target repository's recent history, GitArchaeologist computes a raw debt score:

$$\text{RawDebtScore} = \text{churn} \times (\text{authors}^{1.2}) \times \ln(\text{lines} + 10)$$

### 1. Variables
- $\text{churn} \in [1, \infty)$: The exact number of commits in the scan window touching this file.
- $\text{authors} \in [1, \infty)$: Count of unique commit authors who touched this file.
- $\text{lines} \in [1, \infty)$: Lines of code on disk (calculated from shallow checkout; defaults to 100-150 if removed).

### 2. Normalization & Grading
Raw debt scores are normalized across the active repository's file set into a calibrated index from **15 to 98**:

$$\text{DebtScore} = \min\left(98, \max\left(15, \left\lfloor \frac{\text{RawDebtScore}}{\max(\text{RawDebtScores})} \times 98 \right\rfloor \right)\right)$$

### 3. Severity Categorization
- 🔴 **Critical Hotspot ($70 \le \text{Score} \le 98$)**: Urgent architectural attention required. Heavy churn across multiple contributors with significant blast radius.
- 🟡 **Moderate Risk ($40 \le \text{Score} < 70$)**: Emerging bottleneck. Worth monitoring or scheduling for preventative modularization.
- 🟢 **Healthy / Low Risk ($\text{Score} < 40$)**: Stable module with isolated authorship or low modification frequency.

---

## ⚡ Key Features & User Journey

### 1. Live Shallow-Clone Subprocess
Users can enter any public GitHub repository (e.g. `facebook/react`, `encode/uvicorn`, `django/django`, or `owner/repo`). GitArchaeologist clones the repository with `--depth 50 --single-branch` into an ephemeral sandboxed temporary directory, runs `git log --numstat`, computes all scores, and purges the directory—returning full telemetry in 1.5 to 3 seconds.

### 2. Pre-baked Demo Engines
To guarantee 100% reliability during offline demos, video recordings, or network drops, instant cached snapshots are provided for three canonical repositories:
- `pallets/flask` (Python)
- `tiangolo/fastapi` (Python)
- `expressjs/express` (JavaScript / Node.js)

Clicking any quick chip loads the complete matrix and timeline with 0ms latency.

### 3. Command Header & Quick Search
- Global keyboard shortcut: Press **`⌘K`** (macOS) or **`Ctrl+K`** (Windows/Linux) to instantly focus the repository search bar.
- Animated linear progress bar on top edge during live clones.
- One-click demo chips to switch between repositories seamlessly.

### 4. Split Cockpit Layout
- **Architectural Debt Matrix (Left Panel)**: Sortable by Debt Score, Commit Churn, Contributors, or Lines. Includes a real-time substring path filter.
- **Git Volatility Timeline (Right Panel)**: Displays an SVG commit velocity sparkline and a reverse-chronological list of commit cards showing commit hash, author, relative date, and commit message.

### 5. Bi-Directional Cross-Highlighting
Hovering over any commit card in the Volatility Timeline instantly highlights all files modified by that specific commit in the Architectural Debt Matrix, allowing developers to visually spot multi-file architectural ripple effects.

### 6. Slide-Over Inspector Drawer & AI Forensics
Clicking any file row in the matrix smoothly slides out the Inspector Drawer from the right with backdrop blur:
- **Micro-Metric Stats**: Total Churn count, Unique Contributor count, and total Lines of Code.
- **AI Architectural Diagnosis**: Powered by **Google Gemini 1.5 Flash**, answering *"Why this file is architectural debt"* and detailing **2 actionable refactoring steps**.
- **Deterministic Heuristic Fallback Engine**: If no `GEMINI_API_KEY` is present or if API rate limits trigger, the backend seamlessly switches to an algorithmic diagnosis engine, ensuring zero broken UI states.
- **Recent Commit Touchpoint Feed**: Chronological list of the specific commits that modified this file.
- **Accessibility**: Closes via `Esc` key, clicking the close button, or clicking the blurred backdrop.

---

## 🎨 User Interface Design System

GitArchaeologist rejects generic dark-mode gradients and purple neon sparkles in favor of a crisp, high-contrast, developer-centric aesthetic inspired by **Grafana**, **Cloudflare**, and **Vercel**:

- **Background Canvas**: Ultra-clean `#fafafa` (Zinc-50)
- **Component Panels**: Crisp white `#ffffff` with subtle `#e4e4e7` (Zinc-200) structural borders
- **Typography**: System font stack (`-apple-system`, `BlinkMacSystemFont`, `Inter`, `Segoe UI`) paired with high-contrast JetBrains Mono / Consolas for code paths, commit hashes, and numbers.
- **Primary Brand Accents**: Warm Amber / Solid Orange (`#ea580c` / `#f97316`)
- **Semantic Indicators**:
  - Critical: Soft crimson container (`bg-red-50`, `border-red-200`, `text-red-700`)
  - Moderate: Warm amber container (`bg-amber-50`, `border-amber-200`, `text-amber-800`)
  - Healthy: Mint emerald container (`bg-emerald-50`, `border-emerald-200`, `text-emerald-700`)

---

## 🏛 System Architecture & Data Flow

```
[ User Browser ]
       │
       ▼ (HTTP GET / :5173)
[ Vite + React 18 Cockpit ]
       │
       ├─► (POST /api/analyze { repo_url }) ──────────────┐
       │                                                   ▼
       │                                     [ FastAPI Backend :8008 ]
       │                                                   │
       │                         ┌─────────────────────────┴─────────────────────────┐
       │                         ▼                                                   ▼
       │             Is Pre-baked Slug?                                    Live Repository Input
       │                         │                                                   │
       │                [ YES ]      [ NO ]                                  [ subprocess.run ]
       │                   │           └─────────────────────────────┐               │
       │                   ▼                                         │      git clone --depth 50
       │          Load JSON Snapshot                                 │               │
       │      (backend/app/data/prebaked/)                           │      git log --numstat
       │                   │                                         │               │
       │                   │                                         ▼      Parse Churn, Authors, LOC
       │                   │                                  Temp Directory         │
       │                   │                                     Sandbox             │
       │                   │                                         │      Calculate Debt Formula
       │                   │                                         ▼               │
       │                   │                                   shutil.rmtree         │
       │                   │                                  (Zero Disk Leak)       │
       │                   │                                         │               │
       │                   └─────────────────────┬───────────────────┘               │
       │                                         ▼                                   │
       │                             [ AnalysisResult JSON ] ◄───────────────────────┘
       │                                         │
       ├─◄ Render Matrix & Timeline ─────────────┘
       │
       ▼ (User clicks file row)
[ Open InspectorDrawer ]
       │
       ├─► (POST /api/diagnose { file, churn, authors, lines })
       │                                         │
       │                                         ▼
       │                             [ Backend AI Service ]
       │                                         │
       │                         ┌───────────────┴───────────────┐
       │                         ▼                               ▼
       │                Has GEMINI_API_KEY?              No Key / Network Error
       │                         │                               │
       │                      [ YES ]                         [ NO ]
       │                         │                               │
       │                         ▼                               ▼
       │                Google Gemini 1.5              Deterministic Heuristic
       │                Flash LLM Client                   Fallback Engine
       │                         │                               │
       │                         └───────────────┬───────────────┘
       │                                         ▼
       ├─◄ Render Why It Is Debt + Steps ────────┘
```

---

## 🔍 Subsystem Deep Dives

### 1. Git Shallow Cloner & Telemetry Parser (`backend/app/analyzer.py`)

- **Sandboxed Execution**: Creates an isolated directory via Python's `tempfile.mkdtemp(prefix="gitarch_")`.
- **Clone Optimization**: Runs `git clone --depth 50 --filter=blob:none --single-branch <url> <temp_dir>` with an 18-second timeout. If the remote Git server does not support partial blob filtering, it automatically falls back to standard single-branch shallow cloning.
- **Log Parsing**: Runs `git log -n 50 --numstat --pretty=format:COMMIT:%H|%an|%ad|%s --date=short`.
- **Numstat Tokenization**: Loops through output lines; commits are parsed into `hash`, `author`, `date`, `message`, while subsequent numstat lines capture additions, deletions, and filepaths. File rename notations (`old => new`) and `.git` internal paths are automatically filtered out.
- **LOC Counting**: Safely opens the file from the shallow checkout and streams line counts with `sum(1 for _ in f)`. Non-text or removed files receive a safe fallback value.
- **Resource Cleanup**: Wrapped in a strict `try ... finally: shutil.rmtree(temp_dir, ignore_errors=True)` block, guaranteeing that no temporary directories or clone artifacts linger on the host machine.
- **Payload Capping**: Sorts all discovered hotspots by Debt Score descending and caps the matrix payload to the top 40 files for instant rendering in the client browser.

### 2. AI Diagnostic Engine & Fallback (`backend/app/ai_service.py`)

- **Gemini SDK Integration**: Utilizes `google-generativeai` configured with `models/gemini-1.5-flash`.
- **Structured System Prompt**: Supplies file name, churn count, unique author count, line count, and recent commit messages. Instructs the model to return valid JSON containing `why_it_is_debt` (a 2-3 sentence forensic explanation) and `refactoring_steps` (an array of exactly 2 concrete technical refactoring steps).
- **Graceful Deterministic Fallback**: If `GEMINI_API_KEY` is not exported, or if Google returns a 429 quota/network error, the engine instantly evaluates the file against algorithmic heuristics:
  - High Churn ($>20$) + High Authors ($\ge 5$): Flags God Object / Central Bottleneck.
  - Large LOC ($>1,000$): Flags Structural Inertia and High Blast Radius.
  - Low Churn: Flags Diverging Responsibility.
  Generates targeted refactoring steps based on real metrics, tagging the response source as `"heuristic_fallback"`.

### 3. Pre-baked Zero-Latency Engine (`backend/app/cache_service.py`)

- Normalizes input slugs: handles `pallets/flask`, `flask`, `https://github.com/pallets/flask`, and `https://github.com/pallets/flask.git`.
- Reads pre-generated JSON fixture files from `backend/app/data/prebaked/`.
- Validates data against Pydantic models before returning.

### 4. Interactive Split Cockpit (`frontend/`)

- **State Management**: Built with React hooks (`useState`, `useEffect`, `useRef`), maintaining active repo state, selected file, loading stages, and hover cross-highlighting arrays.
- **Vite Proxy**: Configured in `vite.config.ts` to proxy all `/api/*` calls from port `5173` to `http://localhost:8008` seamlessly, eliminating browser CORS issues in development.

---

## 📡 API Reference & Data Contracts

All endpoints are hosted on the FastAPI backend (default: `http://localhost:8008`).

### 1. Health Check
`GET /api/health`

**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "GitArchaeologist Backend",
  "version": "1.0.0"
}
```

---

### 2. Analyze Repository
`POST /api/analyze`

**Request Body:**
```json
{
  "repo_url": "encode/uvicorn"
}
```
*Note: Accepts repository slugs (`owner/repo`) or full GitHub URLs (`https://github.com/owner/repo.git`).*

**Response (200 OK):**
```json
{
  "repo_name": "encode/uvicorn",
  "analyzed_commits": 50,
  "total_files": 125,
  "high_risk_files_count": 8,
  "files": [
    {
      "path": "uv.lock",
      "debt_score": 98,
      "risk_level": "critical",
      "churn_count": 13,
      "unique_authors": 2,
      "lines": 2136,
      "recent_commits": [
        {
          "hash": "724f82f8a",
          "author": "dependabot[bot]",
          "date": "2026-10-01",
          "message": "chore(deps): bump urllib3 from 2.7.0 to 2.8.0 (#3180)"
        }
      ]
    }
  ],
  "timeline": [
    {
      "hash": "724f82f8a",
      "author": "dependabot[bot]",
      "date": "2026-10-01",
      "message": "chore(deps): bump urllib3 from 2.7.0 to 2.8.0 (#3180)",
      "files_changed_count": 2
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request`: `{"detail": {"message": "Failed to clone repository. Ensure the URL is valid, public, and accessible.", "code": "CLONE_FAILED"}}`
- `400 Bad Request`: `{"detail": {"message": "Cloning repository timed out. Try a smaller repository.", "code": "CLONE_TIMEOUT"}}`

---

### 3. Diagnose Hotspot File
`POST /api/diagnose`

**Request Body:**
```json
{
  "file_path": "uv.lock",
  "churn": 13,
  "authors": 2,
  "lines": 2136,
  "recent_commits": [
    {
      "hash": "724f82f8a",
      "author": "dependabot[bot]",
      "date": "2026-10-01",
      "message": "chore(deps): bump urllib3 from 2.7.0 to 2.8.0 (#3180)"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "file_path": "uv.lock",
  "why_it_is_debt": "At 2136 lines of code and 13 recent modifications, this file has accrued significant structural inertia. Its large surface area increases the blast radius of changes and makes regression-free modifications difficult for the team.",
  "refactoring_steps": [
    "Carve out cohesive sub-routines into focused utility classes with explicit input/output type signatures.",
    "Implement high-coverage boundary unit tests to verify stability before refactoring internal logic."
  ],
  "source": "heuristic_fallback"
}
```

---

## 📂 Project Directory Structure

```
git-archaeologist/
├── .gitignore                     # Ignores learner-profile.md, .env, venv, node_modules, dist
├── README.md                      # Comprehensive system documentation (this file)
├── skills-lock.json               # Devpost Learn hackathon skill lockfile
│
├── backend/                       # Python FastAPI Backend Service
│   ├── requirements.txt           # fastapi, uvicorn, pydantic, google-generativeai, python-dotenv
│   └── app/
│       ├── __init__.py            # Package root & metadata
│       ├── main.py                # FastAPI app initialization, CORS middleware, routes
│       ├── models.py              # Pydantic schemas (AnalysisResult, FileHotspot, etc.)
│       ├── analyzer.py            # Git subprocess shallow cloner & volatility parser
│       ├── ai_service.py          # Google Gemini integration & deterministic heuristic engine
│       ├── cache_service.py       # Pre-baked JSON dataset resolver & loader
│       └── data/
│           └── prebaked/          # Zero-latency demo fixtures
│               ├── flask.json     # pallets/flask snapshot
│               ├── fastapi.json   # tiangolo/fastapi snapshot
│               └── express.json   # expressjs/express snapshot
│
├── frontend/                      # React + TypeScript + Vite Cockpit
│   ├── index.html                 # App shell with Inter web font and meta headers
│   ├── package.json               # React 18, Lucide React, TailwindCSS, TypeScript
│   ├── postcss.config.js          # PostCSS configuration for Tailwind
│   ├── tailwind.config.js         # Custom palette, typography, animations
│   ├── tsconfig.json              # TypeScript strict configuration
│   ├── vite.config.ts             # Dev server config & /api reverse proxy to port 8008
│   └── src/
│       ├── main.tsx               # React DOM entrypoint
│       ├── App.tsx                # Master cockpit container, error boundaries, state
│       ├── index.css              # Tailwind base utilities and custom scrollbar rules
│       ├── types/
│       │   └── index.ts           # TypeScript interfaces matching backend models
│       ├── services/
│       │   └── api.ts             # Fetch API client (analyzeRepository, diagnoseHotspot)
│       └── components/
│           ├── CommandHeader.tsx  # Search bar (⌘K), progress indicator, quick demo chips
│           ├── DebtMatrix.tsx     # Architectural Debt Matrix table with sorting & search
│           ├── VolatilityTimeline.tsx # SVG commit sparkline & chronological commit feed
│           └── InspectorDrawer.tsx    # Slide-over panel with AI diagnosis & commit history
│
└── devpost/                       # Hackathon Planning Documents & Architecture Guide
    ├── scope.md                   # Kernel, proof of concept boundary, now vs cut
    ├── prd.md                     # Product requirements, user journey, edge cases
    ├── spec.md                    # Technical plan, failure modes, data contracts
    ├── checklist.md               # 5-slice incremental build log & review records
    └── app-map.html               # Interactive offline visual architecture guide
```

---

## 🛠 Exhaustive Setup & Installation Guide

### Prerequisites
Before starting, ensure you have the following installed on your machine:
- **Git CLI**: Version 2.25+ installed and accessible via `git --version`
- **Python**: Version 3.10 or 3.11+ installed via `python --version`
- **Node.js**: Version 18.0+ and `npm` installed via `node --version`

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/M-Wajeeh/git-archaeologist.git
cd git-archaeologist
```

---

### Step 2: Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a Python virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Windows (Command Prompt)**:
     ```cmd
     .\venv\Scripts\activate.bat
     ```
   - **macOS / Linux**:
     ```bash
     source venv/bin/activate
     ```

4. Install backend dependencies:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

5. *(Optional)* Set up your Google Gemini API Key:
   ```bash
   # Linux/macOS
   export GEMINI_API_KEY="AIzaSy..."

   # Windows (PowerShell)
   $env:GEMINI_API_KEY="AIzaSy..."
   ```
   *(Note: If omitted, GitArchaeologist will automatically use its built-in heuristic diagnosis engine seamlessly without error).*

6. Launch the FastAPI server on port **8008**:
   ```bash
   uvicorn app.main:app --port 8008 --reload
   ```

7. Verify backend health:
   Open `http://localhost:8008/api/health` in your browser. You should see:
   ```json
   {"status":"ok","service":"GitArchaeologist Backend","version":"1.0.0"}
   ```
   Interactive Swagger documentation is available at `http://localhost:8008/docs`.

---

### Step 3: Frontend Setup (React + Vite)

1. Open a **new terminal tab or window** and navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```

4. Open the application:
   Navigate to **`http://localhost:5173`** in your browser.

---

## ⚙️ Configuration & Environment Variables

| Variable | Location | Default | Description |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Backend OS Environment / `.env` | *None* | Google Gemini API key. If unset, activates deterministic heuristic fallback. |
| `PORT` | Backend uvicorn command | `8008` | HTTP port for the FastAPI backend service. |
| Vite Proxy Target | `frontend/vite.config.ts` | `http://localhost:8008` | Reverse proxy target for `/api` requests to avoid browser CORS issues. |

---

## ❓ Troubleshooting & FAQ

#### 1. Why is the backend running on port 8008 instead of default 8000?
Port `8000` is frequently occupied by background system daemons, Docker containers, or local database tools on developer workstations. To prevent `[Errno 10048] address already in use` collisions, GitArchaeologist explicitly runs on port **8008**, and `frontend/vite.config.ts` routes all `/api` calls there.

#### 2. What happens if a repository clone times out?
If a repository is excessively large (e.g. hundreds of thousands of commits on a slow connection) or unreachable, the shallow cloner aborts after 18 seconds, returning a structured `CLONE_TIMEOUT` error. The frontend catches this and displays a user-friendly error banner with a one-click **"Reset to Demo"** button.

#### 3. Does GitArchaeologist retain cloned repositories on disk?
**No.** All shallow clones are executed inside an ephemeral Python `tempfile.mkdtemp` sandbox and purged in a `finally: shutil.rmtree` statement immediately after telemetry is parsed. Your disk usage remains zero.

#### 4. Can I analyze private repositories?
The proof-of-concept currently targets **public** GitHub repositories. To clone private repositories, ensure your local Git CLI has credentials configured (e.g. via GitHub CLI `gh auth login` or SSH keys configured in `~/.ssh`).

---

## 🏆 Hackathon Verification & Planning Artifacts

This project was built following the rigorous Devpost Learn spec-driven curriculum. Complete planning artifacts are preserved in the [`devpost/`](./devpost) folder:

- **[devpost/app-map.html](./devpost/app-map.html)**: Standalone visual architecture guide with SVG data-flow diagrams, code routes, and reusable patterns.
- **[devpost/scope.md](./devpost/scope.md)**: Product kernel, proof-of-concept boundary, and explicit scope cuts.
- **[devpost/prd.md](./devpost/prd.md)**: Product requirements document, 7-step core journey, edge cases, and acceptance criteria.
- **[devpost/spec.md](./devpost/spec.md)**: Technical specification, API contracts, failure modes, and directory plan.
- **[devpost/checklist.md](./devpost/checklist.md)**: Verified 5-slice incremental build log with mechanical check results and design revisions.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.  
Crafted with precision by **M-Wajeeh** for the Devpost Learn *Build With AI: Basics* Hackathon.
