---
doc: prd
status: approved
---

# GitArchaeologist — Product Requirements

An interactive visual audit dashboard that turns git history into an Architectural Debt Matrix and Git Timeline, diagnosing high-risk hotspots with plain-English AI explanations.
Source: `scope.md > The Unique Kernel` and `scope.md > The Core Loop`.

## The Core Journey
1. **Arrival**: The developer opens GitArchaeologist and lands on "The Developer Cockpit"—a sleek, dark-slate interface. The header displays 3 quick-load pills (`pallets/flask`, `fastapi/fastapi`, `expressjs/express`) and a URL input (`⌘K` / `Ctrl+K`).
2. **Trigger**: The user clicks one of the quick-load pills or pastes any public GitHub repo URL and presses Enter.
3. **Progressive Shimmer**: A top-bar shimmer indicator pulses through status milestones ("Cloning commits...", "Calculating churn metrics...", "Synthesizing debt matrix...") in under 3 seconds.
4. **Cockpit Renders**:
   - **Left/Main Panel (The Debt Matrix)**: File rows sorted by volatility with color-coded Debt Score bars (red/amber/green), churn counts, active author badges, and file sizes.
   - **Right Panel (The Volatility Sparkline & Timeline)**: Chronological commit frequency strip showing commit rhythm across the analyzed window.
5. **Hotspot Inspection**: The user clicks a high-debt file row. A smooth right-side Inspector Drawer slides in with a blurred backdrop.
6. **Actionable Diagnosis**: The user reads the file's stats, reviews the key commit messages that altered it, and consumes an AI Diagnostic callout ("Why this is debt" + two concrete refactoring steps).
7. **Close / Next**: The user presses `Esc` or clicks outside to close the drawer and continues inspecting other hotspots or switches repositories.

## Screens and Layout

GitArchaeologist is designed as a single-view **Split Cockpit** with a persistent Command Header and an overlaid Inspector Drawer:

### 1. Command Header (Top Bar)
- **Brand Identity**: Monospaced `git-archaeologist` logo with a glowing status indicator.
- **Quick-Load Pills**: One-click demo triggers for `pallets/flask`, `fastapi/fastapi`, and `expressjs/express`.
- **Repo URL Input**: Streamlined input box with `⌘K` / `Ctrl+K` focus shortcut and an "Audit" submit button.
- **Top-Border Shimmer**: Integrated horizontal progress strip active during fetching and computation.

### 2. Main Cockpit (Split View)
- **Left Panel (Debt Matrix)**:
  - Table view of analyzed repository files.
  - Columns: File Path (with language icon/badge), Debt Score (0–100 progress bar, color-coded), Churn Count (number of modifications), Active Authors count, and File Size (lines of code).
  - Interactive row hover states and click-to-inspect trigger.
  - Filter/Sort controls (Sort by: Debt Score, Churn, or Authors).
- **Right Panel (Volatility Sparkline & Timeline)**:
  - Commit frequency sparkline across the analyzed 50-commit history.
  - Chronological commit feed showing commit hash (mono), author, timestamp, and message.
  - Hovering a commit highlights files touched in the Debt Matrix.

### 3. Inspector Drawer (Slide-In Panel)
- **Overlay**: Smooth right slide-in with subtle backdrop blur (`backdrop-blur-sm`).
- **Header**: File name, relative path badge, and `Esc` / Close button.
- **Stat Micro-Grid**: 3 compact cards:
  - *Total Churn* (e.g. `24 modifications`)
  - *Unique Contributors* (e.g. `6 active authors`)
  - *Refactor Priority* (e.g. `Critical / High / Moderate`)
- **Recent Volatility Feed**: List of recent commits that specifically touched this file.
- **AI Architectural Diagnosis Box**:
  - Markdown-rendered callout block.
  - **Why this is debt**: Plain-English structural post-mortem (e.g., "High multi-author churn paired with heavy line count indicates this file serves as a God Object orchestrating too many domain responsibilities.").
  - **Recommended Refactoring Steps**: 2 concrete, numbered architectural improvements.

## Look and Feel
- **Aesthetic**: "The Developer Cockpit" inspired by Linear, Vercel, and Raycast.
- **Palette**: Deep slate/zinc dark mode (`#090d16`, `#0f172a`, `#1e293b`) with high-contrast text (`#f8fafc`).
- **Accent Signals**:
  - Red / Crimson (`#ef4444`) for high-debt hotspots (>70 score).
  - Amber / Orange (`#f59e0b`) for moderate debt (40–70 score).
  - Emerald / Green (`#10b981`) for low-churn healthy files (<40 score).
  - Cyan / Neon Violet for interactive focus rings and active commit highlights.
- **Typography**: Clean modern sans-serif (Inter / System) paired with strict monospaced data badges (commit hashes, paths, byte counts).

## Features and Behavior

### Command Header & Repository Ingestion
- Ingests public GitHub URLs (`https://github.com/owner/repo` or `owner/repo`).
- Provides 3 instant demo repository pills with pre-calculated fallback payloads.
- **Acceptance Criteria**:
  - [ ] Clicking any demo pill instantly populates the URL input and launches analysis.
  - [ ] Pressing `Enter` in the URL input triggers analysis.
  - [ ] The loading shimmer appears immediately with stage-by-stage status text.

### Architectural Debt Matrix
- Calculates Debt Score using: $\text{DebtScore} = \text{norm}(\text{churn} \times \text{author\_count} \times \log(\text{lines}))$.
- Renders ranked file list with visually differentiated risk levels.
- **Acceptance Criteria**:
  - [ ] High-risk files are sorted to the top by default.
  - [ ] Debt Score bars reflect color thresholds (Red >= 70, Amber 40-69, Green < 40).
  - [ ] Clicking any file row opens the Inspector Drawer for that file.

### Git Volatility Timeline
- Visualizes commit distribution and chronological history of the last 50 commits.
- **Acceptance Criteria**:
  - [ ] Displays commit messages, short commit hashes, and relative timestamps.
  - [ ] Clicking a commit filters or indicates which files were affected.

### Inspector Drawer & AI Architectural Diagnosis
- Slide-in panel displaying file-specific analytics and plain-English AI advice.
- **Acceptance Criteria**:
  - [ ] Pressing `Esc` or clicking the backdrop smoothly closes the drawer.
  - [ ] Shows file stats (churn, authors, size, refactor priority).
  - [ ] Renders formatted AI explanation containing "Why this is debt" and "2 Concrete Refactoring Steps".
  - [ ] Gracefully falls back to heuristic architectural advice if offline or without an API key.

## States and Boundaries

- **Initial / Empty State**:
  - Dashboard loads with pre-selected demo repo active or prominent quick-loader cards so the interface is never a blank void.
- **Loading State**:
  - Top-bar shimmer with clear status progression ("Cloning last 50 commits...", "Analyzing churn...", "Synthesizing debt matrix...").
  - Content skeleton pulses softly.
- **Error State**:
  - If URL is invalid, private, or GitHub rejects the request:
  - An inline alert banner drops down below the header with a clear error message (e.g. `REPO_NOT_FOUND`) and an immediate action button: *"Load Demo Repository Instead"*.
- **Persistence**:
  - Purely client/memory state during session. No user accounts or persistent database needed.

## Product Decisions

- **Pre-cached Demo Repositories**: To guarantee a bulletproof 1-minute video demo and zero API rate limit issues, the app includes pre-baked analysis results for 3 popular repos.
- **Drawer instead of Page Navigation**: Keeping file inspection in an overlay drawer preserves the user's scroll position and mental context in the Debt Matrix.
- **Plain-English Markdown Callouts over Chat**: Replaces conversational chat latency with a direct, scannable architectural verdict.

## What We're Building
- Single-page responsive React Cockpit dashboard with Command Header, Split View (Debt Matrix + Timeline), and Inspector Drawer.
- Fast heuristic debt calculation engine on FastAPI analyzing commit churn, author count, and line counts.
- Pre-cached datasets for instant demo execution.
- LLM prompt synthesizing concise architectural post-mortems and refactoring advice (with heuristic fallback).

## Deferred From the POC
- Custom date-range selectors for git history.
- Multi-branch diffing or PR bot commentary.
- User authentication and persistent project bookmarks.

## Non-Goals
- Full historical cloning of repos with 10,000+ commits.
- Semantic AST parsing across multiple programming languages.
- User management or database migrations.

## Open Questions
- None blocking spec: Heuristic fallback ensures full functionality even without an external LLM API key.
