# CodeMap: Visual Source Code Dependency Analyzer

Turn any public GitHub repository into an interactive dependency graph with zero install. CodeMap visualizes file import relationships, flags circular dependencies, and answers the question: **"If I change this file, what else might break?"**

---

## Features

- 🗺️ **Interactive Dependency Graph:** Hierarchical dagre layout rendered via React Flow (`@xyflow/react`) with smooth panning, zooming, and hover highlighting.
- 💥 **Impact Analysis (Blast Radius):** Breadth-first search traversal across reversed dependency edges to light up all direct and transitive dependents of any selected file.
- 🔄 **Circular Dependency Detection:** Tarjan's strongly connected components algorithm identifies dependency loops and highlights cycle edges in red.
- 📂 **Top-Level Folder Grouping:** Color-coded modules (`src/`, `lib/`, `components/`, `utils/`, etc.) for instant architectural orientation.
- 🔍 **Instant Search:** Fuzzy search by file name with `Cmd+K` keyboard shortcut and match counter.
- 📊 **Aggregate Stats:** Real-time metrics bar displaying total file count, line count, cycle count, top hub files, and orphan files.
- 📦 **Dual Ingestion:** Support for both public GitHub repository URLs (with custom branches and `/tree/branch/subdir` scopes) and local ZIP archive uploads.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | Next.js 16 (App Router) + TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Graph Visualization** | React Flow (`@xyflow/react`) + Dagre |
| **State Management** | Zustand v5 |
| **Parsing** | Regex over comment-stripped source (ES imports, exports, require, dynamic import) |
| **Testing** | Vitest (57 unit tests) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd codemap

# Install dependencies
npm install
```

### Environment Variables (Optional)

To raise GitHub API rate limits from 60 requests/hour to 5,000 requests/hour:

```bash
# .env.local
GITHUB_TOKEN=your_personal_access_token
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running Tests & Typechecks

```bash
# Run Vitest test suite
npx vitest run

# Run TypeScript type check
npx tsc --noEmit

# Run ESLint
npm run lint

# Production build
npm run build
```

---

## Architecture

```
Browser (Next.js App Router + React Flow)
   │  POST /api/analyze/github  { url, branch? }
   │  POST /api/analyze/zip     (multipart/form-data)
   ▼
Route Handlers (/app/api/analyze/*)
   ├─ parseGithubUrl     → Validate host, owner, repo, branch, subdir
   ├─ fetchGithubFiles   → GitHub Trees API + raw file fetches (concurrency = 10)
   ├─ extractZip         → AdmZip extraction with prefix stripping
   ├─ rateLimit          → Per-IP sliding window rate limiter
   ▼
Analyzer Engine (lib/analyzer/* - Pure TypeScript)
   ├─ scanFiles          → Filter JS/TS files, ignore node_modules/.git/dist
   ├─ parseImports       → Detect import, export ... from, require, import()
   ├─ resolveImport      → Relative path resolution, extension guessing, index fallback
   ├─ buildGraph         → Nodes with imports & importedBy lists, non-duplicate edges
   ├─ detectCycles       → Tarjan's SCC algorithm (cycles with > 1 node)
   ├─ computeImpact      → BFS over reversed edges (blast radius)
   └─ computeStats       → Totals, most-connected hub, orphans
   ▼
AnalysisResult JSON
   └─ Rendered in interactive GraphCanvas, StatsBar, and InspectorPanel
```

---

## License

MIT
