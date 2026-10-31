# CodeMap: Product Requirements Document

Author:  | Status: Draft v1.0 | Date: October 31, 2026 | Type: Mini project

## 1. Overview

CodeMap is a web app that turns a public GitHub repository into an interactive dependency graph. The user pastes a repo URL, and CodeMap shows which file imports which, flags circular dependencies, and answers the question: 'If I change this file, what else might break?' Think of it as Google Maps for a codebase.

Full title: CodeMap: Visual Source Code Dependency Analyzer.

## 2. Problem Statement

When developers open an unfamiliar project, they cannot see how its files connect. Beginners spend 30 minutes or more opening files one by one, and even experienced developers lack a quick answer to the impact of a change. Existing tools are either tied to an IDE, CLI-only (madge, dependency-cruiser), or need local setup. There is no zero-install way to paste a link and see the architecture.

## 3. Goals and Non-Goals

**Goals**

- Show the import structure of any public JS/TS repo within about 30 seconds of pasting a URL.
- Let users inspect any file's imports and dependents in one click.
- Detect and clearly flag circular dependencies.
- Demonstrate file processing, parsing, graph algorithms, and visualization (rather than login and CRUD screens).

**Non-goals for v1**

- Authentication, user accounts, database, or saved projects.
- ZIP or local folder upload (GitHub URL is the only input).
- Languages other than JavaScript and TypeScript.
- Runtime or call-graph analysis; only static import relationships.
- Private repositories.
- Editing or refactoring code.

## 4. Target Users

| Persona | Need |
| --- | --- |
| Student or beginner | Understand an unfamiliar codebase quickly and know where to start reading |
| Open-source contributor | Evaluate a repo's structure before making a first PR |
| Reviewer or tech lead | Estimate the blast radius of a change |
| Project evaluator / demo audience | See a clear, working end-to-end demo |

## 5. User Stories

- As a newcomer, I paste a repo URL and see the project structure, so I know where to start.
- As a contributor, I click a file and see what it imports and what imports it.
- As a reviewer, I highlight everything that transitively depends on a file, so I can judge the impact of a change.
- As a maintainer, I am warned about circular dependencies.
- As a user, I search for 'auth' and see the matching files and their connections.

## 6. Scope

**MVP (must work for the demo)**

- GitHub URL input with an optional branch
- Fetch source files through the GitHub API
- Import parsing, path resolution, graph building
- Interactive graph with a click panel (imports / imported by)
- Circular dependency detection with a warning

**Stretch (after the MVP is solid)**

- Impact analysis, search, stats bar, folder colors
- Subfolder support (/tree/branch/path)
- tsconfig path aliases
- Result caching by owner/repo@sha
- Private repos via a user token

## 7. Functional Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-1 | Accept a GitHub repo URL (github.com/owner/repo), with optional branch and /tree/branch/subdir forms | P0 |
| FR-2 | Validate the URL and reject non-GitHub hosts and malformed owner/repo names | P0 |
| FR-3 | Read the file list with one GitHub Trees API call, then fetch only JS/TS source files from raw.githubusercontent.com, skipping node\_modules, dist, build, and .git | P0 |
| FR-4 | Detect ES import, export ... from, require(), and dynamic import() | P0 |
| FR-5 | Resolve relative imports to project files (extension guessing, index files, .js to .ts mapping); ignore external packages | P0 |
| FR-6 | Build a directed graph with nodes (files), edges (imports), and an importedBy list per node | P0 |
| FR-7 | Render an auto-laid-out interactive graph with pan, zoom, and hover highlighting | P0 |
| FR-8 | Clicking a node opens an inspector with imports, imported-by, line count, and used-by count | P0 |
| FR-9 | Detect circular dependencies, show a warning banner, and highlight the cycle in red | P0 |
| FR-10 | Show progress while analyzing and clear error messages on failure | P0 |
| FR-11 | Impact analysis: highlight all direct and transitive dependents of the selected file | P1 |
| FR-12 | Search by file name; highlight matches and their connections | P1 |
| FR-13 | Stats bar: file count, line count, cycle count, most-connected file, orphan files | P1 |
| FR-14 | Color nodes by top-level folder | P1 |
| FR-15 | Support tsconfig path aliases such as @/components | P2 |
| FR-16 | Cache results by owner/repo@commit SHA | P2 |
| FR-17 | Optional access token for private repos | P2 |
| FR-18 | 'Open on GitHub' link per file in the inspector | P2 |

## 8. User Flow

1. **Landing:** one input ('Paste a GitHub repo URL'), an optional branch field, and example repo chips.
2. **Analyze:** the user clicks Analyze. Progress shows 'Reading file list, Fetching N files, Building graph'.
3. **Graph screen:** stats bar on top, graph canvas, search box.
4. **Explore:** pan, zoom, and hover a node to highlight its edges.
5. **Inspect:** click a node to open the side panel with Imports, Imported By, and Used by N files.
6. **Impact mode:** toggle to light up every transitive dependent.
7. **Warnings:** a cycle banner appears; clicking it focuses the cycle in the graph.
8. **Reset:** 'Analyze another repo'.
9. **Errors:** repo not found or private, rate limit reached, too many files.

## 9. Screen Layout

```
┌──────────────────────────────────────────────────────┐
│ CodeMap     [Search files...]     [Analyze another]  │
├──────────────────────────────────────────────────────┤
│ 127 files │ 18k lines │ 2 cycles │ Top: database.js  │
├────────────────────────────────────┬─────────────────┤
│                                    │ User.js         │
│          GRAPH CANVAS              │ Imports (1)     │
│         (React Flow)               │  └ database.js  │
│                                    │ Imported by (3) │
│                                    │  ├ userCtrl     │
│                                    │  ├ authCtrl     │
│                                    │  └ adminCtrl    │
│                                    │ [Show impact]   │
└────────────────────────────────────┴─────────────────┘
```

## 10. Technical Design

**Stack**

| Layer | Choice |
| --- | --- |
| Framework | Next.js (App Router) with TypeScript |
| Styling | Tailwind CSS |
| Graph | React Flow (@xyflow/react) with dagre layout |
| State | Zustand |
| Data source | GitHub Trees API and raw.githubusercontent.com |
| Parsing | Regex for the MVP; optionally @babel/parser later |
| Tests | Vitest |
| Database | None. All analysis is in memory and nothing is written to disk |

**Architecture**

```
Browser (Next.js + React Flow)
   │  POST /api/analyze/github  (url, branch?)
   ▼
Route handler
  ├─ parseGithubUrl     → owner, repo, branch, subdir
  ├─ fetchGithubFiles   → 1 Trees API call + raw file fetches (10 at a time)
  ├─ analyzeFiles       → parse → resolve → graph → cycles → stats
   ▼
AnalysisResult JSON
```

**API contract**

- Endpoint: POST /api/analyze/github
- Request body: url (required), branch (optional)
- 200: AnalysisResult with nodes, edges, cycles, stats, and repo (owner, name, branch)
- 400: invalid GitHub URL
- 404: repo not found or private
- 413: too many source files
- 429: rate limit reached

**Data model**

- GraphNode: id (file path), folder, lines, imports\[\], importedBy\[\]
- GraphEdge: source, target
- Stats: files, lines, cycles, mostConnected, mostConnectedCount, orphans\[\]
- AnalysisResult: nodes\[\], edges\[\], cycles\[\]\[\], stats

**Algorithms**

- Parsing: regex over comment-stripped source; swap to AST parsing if accuracy requires it.
- Resolution: relative paths only; try the exact path, then known extensions, then /index.\* variants, then .js to .ts mapping.
- Cycle detection: Tarjan's strongly connected components; any component with more than one node is a cycle.
- Impact analysis: breadth-first search over reversed edges from the selected node.
- Layout: dagre, top-to-bottom hierarchy.

## 11. Non-Functional Requirements

| Area | Requirement |
| --- | --- |
| Performance | Analysis of a repo with up to 300 source files completes in under 30 seconds; the graph stays responsive up to about 500 nodes |
| Security | Only github.com URLs accepted; owner and repo validated against ^\[A-Za-z0-9\_.-\]+$; outgoing URLs built server-side to prevent SSRF; GITHUB\_TOKEN kept server-side only; per-IP rate limiting on the endpoint |
| Reliability | Clear error for private repos, rate limits, truncated trees, and oversized repos; configurable file cap (default 500 for the hosted demo) |
| Privacy | No user data stored; repo contents are processed in memory and discarded |
| Compatibility | Latest Chrome, Edge, Firefox, and Safari on desktop; mobile is out of scope |
| Maintainability | Analyzer code is pure TypeScript with no React or filesystem dependencies and is unit tested |

## 12. Success Metrics

- **Correctness:** the seeded a, b, c circular demo is detected 100% of the time; at least 90% of relative imports resolve correctly on three real test repos.
- **Speed:** under 30 seconds for repos with up to 300 source files.
- **Demo reliability:** the full flow (paste URL, graph, inspect, impact, cycle warning) runs end to end without errors.
- **Usability:** a first-time user can find which files depend on a given file in under one minute.

## 13. Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| GitHub API rate limit (60 per hour unauthenticated) | Use a server-side GITHUB\_TOKEN; one API call per analysis; show a clear error |
| Large repos produce an unreadable hairball graph | File cap, hide leaf and external files, folder coloring, later folder collapsing |
| Regex parser misses edge cases | Test on real repos early; upgrade to the Babel AST parser if needed |
| Path aliases (@/...) leave imports unresolved | Treat tsconfig paths support as a P2 feature; show unresolved count in stats |
| Hundreds of fetches exceed serverless time limits | Concurrency of 10, file cap, longer maxDuration, or deploy on Railway or Render |
| Live demo fails on poor network | Keep a pre-analyzed result cached as a fallback |

## 14. Milestones (about 9 days)

| Days | Deliverable |
| --- | --- |
| 1 | Types, constants, import parser with tests |
| 2 | Resolver, graph builder, cycle detection, stats, analyzeFiles with tests |
| 3 | GitHub URL parser, file fetcher, and API route; tested with curl on three real repos |
| 4 | Token support, rate limiting, error handling, resolver fixes from real repos |
| 5-6 | Minimal UI: URL form, React Flow graph with dagre layout, node click panel |
| 7 | Cycle banner and focus |
| 8 | Impact analysis and search |
| 9 | Stats bar, folder colors, polish, README, demo preparation |

## 15. Demo Plan (2 minutes)

1. Paste the seeded circular-dependency repo; the graph appears.
2. Click a file to show its imports and imported-by lists.
3. Toggle impact mode to show the blast radius.
4. Show the red circular-dependency warning.
5. Paste a small well-known repo to show it works on real code.

## 16. Open Questions

- What is the maximum repo size for the hosted demo?
- Is regex parsing accurate enough for v1, or should the Babel parser be used from the start?
- Deployment target: Vercel (simple, time-limited) or Railway/Render (no time limit)?
- Should Python support be part of the final submission or left for later?

## 17. Future Roadmap

- Python and other language support
- Private repos through GitHub OAuth
- Pull-request impact view (changed files and their dependents)
- Folder-level collapsing for large graphs
- Export graph as PNG or JSON
- VS Code extension
