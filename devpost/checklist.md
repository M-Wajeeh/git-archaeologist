---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Bootstrap full-stack cockpit with command header and pre-baked audit engine**
  Becomes usable: The user can start the FastAPI backend and React frontend, open the cockpit at `http://localhost:5173`, see the Command Header with 3 quick-load pills (`flask`, `fastapi`, `express`), click a pill, and see the repository statistics and file count update with zero latency.
  Why now: Bootstraps the full-stack plumbing (FastAPI + Vite React + dev proxy) and immediately proves end-to-end communication with instant demo data, so no later slice builds on speculation.
  PRD ref: `prd.md > The Core Journey` (steps 1-3), `prd.md > Command Header & Repository Ingestion`
  Spec ref: `spec.md > Stack`, `spec.md > File Structure`, `spec.md > Backend Components` (1. API Server, 4. Pre-cached Dataset Provider), `spec.md > Frontend Components` (1. CommandHeader)
  Build: Initialize FastAPI application (`backend/app/main.py`, `models.py`, `cache_service.py` with pre-baked JSONs for flask, fastapi, express). Initialize Vite React TypeScript project (`frontend/`), set up TailwindCSS with the dark slate theme, configure Vite proxy to `:8000`, build `CommandHeader.tsx` with quick-load pills and progress shimmer, and render active repo overview in `App.tsx`.
  Verify (mechanical): Start FastAPI server and verify `GET /api/health` returns 200; execute `POST /api/analyze` with `pallets/flask` and verify valid JSON with 40+ files; run `npm run build` in frontend with 0 TypeScript/lint errors.
  Learner check: Open `http://localhost:5173`, click the `pallets/flask` pill, and confirm the top-bar shimmer triggers and the repository name and file count appear in the cockpit.
  Commit: `Bootstrap full-stack app with command header and pre-baked audit engine`

- [x] **2. Architectural Debt Matrix table and sortable hotspots**
  Becomes usable: The Left Cockpit panel displays the full Architectural Debt Matrix—sorted by Debt Score (0–100), with colored risk bars (red/amber/green), churn counts, active author badges, and lines of code.
  Why now: Proves the core kernel early—turning raw commit metrics into an immediate visual debt matrix with clear visual hierarchy, rather than leaving core value for the end.
  PRD ref: `prd.md > Architectural Debt Matrix`, `prd.md > Main Cockpit (Split View)`
  Spec ref: `spec.md > Frontend Components` (2. DebtMatrix), `spec.md > Debt Scoring Heuristic`, `spec.md > Look and Feel`
  Build: Implement `DebtMatrix.tsx` table with high-contrast slate styling, Debt Score bars with threshold colors, sorting controls (Debt Score, Churn, Authors), row hover effects, and selection state. Wire into `App.tsx`.
  Verify (mechanical): Verify files are sorted descending by debt score by default; verify score color classes match PRD thresholds (<40 green, 40-69 amber, >=70 red); confirm clicking sort toggles reorders rows accurately.
  Learner check: Look at the Debt Matrix table in the browser, click column sort toggles, and verify high-debt hotspot files are highlighted in red at the top.
  Commit: `Add interactive Architectural Debt Matrix with risk scoring and sorting`

- [x] **3. Git Volatility Timeline and rhythm sparkline**
  Becomes usable: The Right Cockpit panel renders the chronological commit volatility feed for the repository's last 50 commits, displaying commit hashes, authors, timestamps, and commit messages with interactive linking to the debt matrix.
  Why now: Completes the two-panel Split Cockpit experience specified in PRD & Spec, giving temporal context to the debt matrix.
  PRD ref: `prd.md > Git Volatility Timeline`, `prd.md > Main Cockpit (Split View)`
  Spec ref: `spec.md > Frontend Components` (3. VolatilityTimeline)
  Build: Implement `VolatilityTimeline.tsx` with commit activity sparkline, scrollable chronological commit cards with monospaced hashes, and author badges. Highlight affected files in the matrix when hovering commits.
  Verify (mechanical): Verify commit list renders all 50 commits with valid dates and hashes; verify hovering a commit card passes affected file IDs to highlight state.
  Learner check: Scroll through the Git Volatility Timeline on the right, see the commit history rhythm, and see affected files highlight.
  Commit: `Add Git Volatility Timeline and commit rhythm visualization`

- [x] **4. Live Git shallow clone analyzer and error fallback**
  Becomes usable: Entering any live public GitHub repository URL (e.g. `tiangolo/fastapi`) performs a real-time shallow clone (`git clone --depth 50`), analyzes git logs via subprocess, and renders live debt metrics. If an invalid or private repo is entered, the inline `ErrorBanner` drops down with 1-click fallback.
  Why now: Bridges the app from pre-cached demos to live public repo analysis, validating the core technical risk (subprocess git execution and error recovery).
  PRD ref: `prd.md > The Core Journey` (Step 2), `prd.md > States and Boundaries` (Error State)
  Spec ref: `spec.md > Backend Components` (2. Git Archaeology Engine), `spec.md > Important Failure Modes` (1)
  Build: Implement `backend/app/analyzer.py` using `subprocess.run` to shallow clone into a temporary directory, parse `git log --numstat`, compute debt scores, and clean up temp files. Implement `ErrorBanner.tsx` on frontend with 1-click fallback button.
  Verify (mechanical): Run backend test calling `analyze_repo` on a real public repo and on an invalid URL; confirm correct 200 output for valid and structured 400 error with `CLONE_FAILED` for invalid.
  Learner check: Paste a public GitHub URL in the header and press Enter to see it clone and analyze live, then test typing `https://github.com/nonexistent/fake-repo-xyz` to see the error banner drop down with the fallback button.
  Commit: `Add live git shallow clone analyzer with automated error banner fallback`

- [x] **5. Inspector Drawer and AI Architectural Diagnosis with heuristic fallback**
  Becomes usable: Clicking any hotspot file in the Debt Matrix smoothly slides out the Inspector Drawer from the right with backdrop blur, displaying micro-stats, recent commit history for that file, and a formatted AI diagnosis explaining why it is debt plus 2 concrete refactoring steps (using Gemini API or instant rule-based fallback).
  Why now: Delivers the "aha!" climax of the product journey—providing actionable plain-English architectural remediation right inside the cockpit.
  PRD ref: `prd.md > Inspector Drawer & AI Architectural Diagnosis`, `prd.md > The Core Journey` (Steps 5-7)
  Spec ref: `spec.md > Backend Components` (3. AI Diagnostic Service), `spec.md > Frontend Components` (4. InspectorDrawer)
  Build: Implement `backend/app/ai_service.py` integrating Gemini API client with prompt engineering for architectural diagnostics and robust deterministic heuristic fallback. Implement `InspectorDrawer.tsx` with slide animation, backdrop blur, stat micro-grid, volatility history, markdown diagnostic callout box, and `Esc`/backdrop dismissal.
  Verify (mechanical): Call `POST /api/diagnose` without an API key to verify fallback output; call with test key to verify Gemini output; verify frontend drawer opens on file click and closes on `Esc`.
  Learner check: Click a red hotspot row in the Debt Matrix, watch the drawer glide in, read the AI architectural diagnosis and refactor steps, and press `Esc` to close it.
  Commit: `Add Inspector Drawer with Gemini AI architectural diagnosis and fallback`

## Hands-on Checkpoints

- [x] Early usable behavior explored — Slice 2 (Debt Matrix with risk scoring and sorting interactive in browser)
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: [what actually happened; real document/test/code references; unfinished work if interrupted]
Route and stops: [actual paths and symbols; guided stops completed, or reference-only route]
Edit outcome: [tried/kept/reverted/declined/not applicable; verification if changed]
Reflection: [offered/answered/declined/already covered — personal answer belongs only in the ignored profile]
Activity mode: [live app and editor, explicit static fallback, focused alternative, prior practice, or recap]

## Revisions

- Redesigned complete application interface from dark mode to a clean, crisp, high-contrast light theme with solid developer colors — user requested a clean light theme without dark AI-generated gradient shades.
