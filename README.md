# GitArchaeologist

> **Architectural Debt Matrix & Git Volatility Inspector**  
> Built for the Devpost Learn *Build With AI: Basics* Hackathon.

GitArchaeologist is an interactive developer cockpit that audits and visualizes architectural technical debt in public Git repositories. Instead of relying solely on static line counts, it uncovers files that evolve into architectural bottlenecks through the lens of commit volatility: identifying code hotspots that suffer from high churn across multiple contributors.

---

## ✨ Features

- **Live Repository Shallow Cloner**: Clones public Git repositories with `--depth 50` into an isolated sandboxed environment to extract commit-level telemetry in under 2 seconds.
- **Architectural Debt Scoring Engine**: Ranks files using a volatility formula:
  $$D = \text{churn} \times (\text{authors}^{1.2}) \times \ln(\text{lines} + 10)$$
- **Architectural Debt Matrix**: Sortable table displaying hotspot files, debt severity badges (Critical, Moderate, Healthy), churn frequency, author counts, and lines of code.
- **Git Volatility Timeline**: Visual commit sparklines and chronological touchpoint cards with real-time matrix cross-highlighting on hover.
- **Inspector Drawer & AI Diagnosis**: Sliding detail drawer powered by Google Gemini (with an automated rule-based heuristic fallback engine) providing a plain-English explanation of why the file represents technical debt and 2 concrete refactoring steps.
- **Zero-Latency Pre-baked Datasets**: Instant cached audits for `pallets/flask`, `tiangolo/fastapi`, and `expressjs/express`.
- **Grafana / Cloudflare Developer Aesthetic**: Minimalist, high-contrast light mode with warm amber/orange accents.

---

## 🏗 Architecture

```
git-archaeologist/
├── backend/                  # FastAPI Application (Python 3.11)
│   ├── app/
│   │   ├── main.py           # API endpoints (/api/analyze, /api/diagnose, /api/health)
│   │   ├── analyzer.py       # Git subprocess shallow cloner & volatility parser
│   │   ├── ai_service.py     # Gemini client + deterministic heuristic fallback
│   │   ├── cache_service.py  # Pre-baked JSON dataset loader
│   │   ├── models.py         # Pydantic data schemas
│   │   └── data/prebaked/    # Pre-cached JSON snapshots
│   └── requirements.txt
├── frontend/                 # React 18 + Vite + TypeScript Cockpit
│   ├── src/
│   │   ├── components/
│   │   │   ├── CommandHeader.tsx      # Repository search bar (⌘K) & quick demo chips
│   │   │   ├── DebtMatrix.tsx         # Architectural Debt Matrix table
│   │   │   ├── VolatilityTimeline.tsx # Timeline sparkline & commit feed
│   │   │   └── InspectorDrawer.tsx    # Slide-over AI diagnosis panel
│   │   ├── services/api.ts            # Typed API client
│   │   └── types/index.ts             # TypeScript domain models
│   └── package.json
└── devpost/                  # Hackathon Planning & App Map
    ├── scope.md              # Scope definition & boundaries
    ├── prd.md                # Product requirements document
    ├── spec.md               # Technical specification
    ├── checklist.md          # Verification checklist
    └── app-map.html          # Interactive visual architecture guide
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- Git CLI installed and available in PATH

### 1. Clone the Repository
```bash
git clone https://github.com/M-Wajeeh/git-archaeologist.git
cd git-archaeologist
```

### 2. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt

# (Optional) Add your Gemini API key:
# export GEMINI_API_KEY="your-api-key"

# Run FastAPI backend on port 8008:
uvicorn app.main:app --port 8008 --reload
```

Backend API documentation is available at `http://localhost:8008/docs`.

### 3. Frontend Setup (React + Vite)
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📖 App Map & Planning Docs

Full planning documents produced during the hackathon are located in the [`devpost/`](./devpost) directory:
- [devpost/app-map.html](./devpost/app-map.html): Standalone visual data flow diagram and code tour.
- [devpost/scope.md](./devpost/scope.md): Product kernel and constraints.
- [devpost/prd.md](./devpost/prd.md): User journey and acceptance criteria.
- [devpost/spec.md](./devpost/spec.md): Technical plan and data contracts.
- [devpost/checklist.md](./devpost/checklist.md): Incremental build verification log.

---

## 📄 License
MIT License.
