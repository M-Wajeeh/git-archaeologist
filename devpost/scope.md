---
doc: scope
status: approved
---

# GitArchaeologist

An interactive visual audit tool that analyzes git commit history to expose architectural debt hotspots and explain why they're breaking down in plain English.

## The Unique Kernel
Pairing deterministic Git commit archaeology (churn frequency, multi-author churn, and file size) with an instant AI diagnosis of why that specific hotspot became architectural debt and how to untangle it. Instead of drowning in raw git logs or abstract SonarQube metrics, developers see an immediate visual debt heatmap and get plain-English architectural commentary on click.

## Who It's For
- **The Inheriting Engineer**: A software engineer taking over a legacy repository who needs to know within 5 minutes where the dangerous minefields and "God files" live.
- **The Tech Lead / Auditor**: An engineering lead conducting a fast architectural health check before sprint planning or a major refactor.
- *What they do today*: Manually grepping `git log`, guessing based on intuition, or running heavy static analyzers that flag trivial lints rather than structural volatility.

## The Core Loop
1. **Input**: Paste a public GitHub repository URL or click the "Load Demo Repo" button for instant demonstration.
2. **Analysis**: FastAPI shallow-clones the repo (last 50 commits) or pulls pre-cached metrics, calculating file churn, multi-author edits, and file size to compute a Debt Score (0–100).
3. **Explore**: The user views an interactive **Architectural Debt Heatmap** (color-coded red/amber/green) and a synchronized **Git Timeline** of volatile commits.
4. **Diagnosis**: The user clicks a glowing red hotspot file to inspect its volatility story (commit spike timeline, top contributors) and reads an AI-generated architectural diagnosis with actionable refactoring advice.

## Inspiration & Identity
- **Visual Feel**: Sleek, modern engineering cockpit—dark theme, glowing neon warning accents for critical debt hotspots, clean typographic hierarchy, and responsive data cards.
- **Tone**: High-signal, authoritative, forensic, and direct.

## Why This Matters to the Learner
Building a practical full-stack application that marries high-performance backend heuristics (Python/Git analysis) with dynamic React data visualization and targeted LLM insights, adhering strictly to a tight proof-of-concept scope that can be built and demonstrated end-to-end within the hackathon timeframe.

## What "Working" Looks Like
In the 1-minute video demo:
1. The app loads with a pre-configured demo repository ready to click.
2. The user clicks "Load Demo Repo" (or pastes a live repo URL like `pallets/flask`).
3. Within 3–5 seconds, the dashboard renders an interactive **Architectural Debt Heatmap** and **Git Timeline**.
4. The user clicks a highlighted hotspot file (e.g. `app.py` / `routes.py`).
5. A slide-out or modal displays:
   - High-churn breakdown (20+ commits, 5 contributors, 800+ lines).
   - Commit history timeline showing volatility spikes.
   - AI Architectural Diagnosis summarizing *why* this file is a high-risk bottleneck and recommending 2 concrete refactoring steps.

## The POC Boundary
- **In**:
  - FastAPI backend with endpoint to shallow clone/analyze git logs (capped at 50 commits for speed).
  - Pre-cached / sample demo repositories (zero latency, zero API rate-limit risk).
  - Debt Score formula: Churn frequency × Author diversity × Line count weight.
  - React frontend with interactive Heatmap cards/grid, Commit Timeline component, and File Detail Inspector.
  - LLM integration for generating on-demand plain-English architectural diagnoses and refactoring tips.
- **Later**:
  - Semantic AST code parsing (e.g., cyclomatic complexity, coupling graph).
  - Multi-branch comparison and PR risk evaluation.
  - Automated pull request bot integration.
  - User account workspaces and saved audit histories.
- **Explicitly Cut**:
  - **User Auth / Logins**: Unnecessary overhead for a public audit PoC; keeps the app stateless and frictionless.
  - **Persistent Databases**: Kept in-memory or ephemeral caching; no database migrations or setup complexity.
  - **Full Git History Clones**: Capped strictly to shallow clone (last 50 commits) to keep response times under 5 seconds and prevent server disk saturation.
  - **Deep AST Code Analysis**: Avoids language-specific parsing dependencies; git metadata provides universal language-agnostic churn signals.
