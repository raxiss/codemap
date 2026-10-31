import { SourceTabs } from "@/components/landing/SourceTabs";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(6,182,212,0.15),rgba(255,255,255,0))] pointer-events-none" />

      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500 flex items-center justify-center font-bold text-slate-950 text-base shadow-lg shadow-cyan-500/25">
            CM
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-100">
            CodeMap
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span className="hidden sm:inline">JS & TS Dependency Visualizer</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-cyan-400">
            v1.0
          </span>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-cyan-400 font-mono mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          Zero install • Paste repo URL • Visualize architecture
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 mb-4 max-w-2xl leading-tight">
          Visual Source Code{" "}
          <span className="bg-linear-to-r from-cyan-400 to-sky-400 bg-clip-text text-transparent">
            Dependency Analyzer
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-xl mb-10 leading-relaxed">
          Explore file relationships, analyze the blast radius of changes, and
          instantly flag circular dependencies across any JavaScript or TypeScript
          codebase.
        </p>

        <div className="w-full">
          <SourceTabs />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mt-16 pt-12 border-t border-slate-900/90 text-left">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/60">
            <div className="text-xl mb-2">🗺️</div>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">
              Interactive Dagre Graph
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hierarchical layout with pan, zoom, folder color-coding, and one-click
              import inspection.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/60">
            <div className="text-xl mb-2">💥</div>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">
              Blast Radius Analysis
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Answers &ldquo;If I change this file, what breaks?&rdquo; using BFS over
              transitive dependents.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/60">
            <div className="text-xl mb-2">🔄</div>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">
              Cycle Detection
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Finds circular dependency loops using Tarjan&apos;s SCC algorithm and
              highlights them in red.
            </p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full border-t border-slate-900/80 py-6 text-center text-xs text-slate-500 font-mono">
        CodeMap: Visual Source Code Dependency Analyzer • Built with Next.js & React Flow
      </footer>
    </div>
  );
}
