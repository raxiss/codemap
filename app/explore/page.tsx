"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAnalysisStore } from "@/store/useAnalysisStore";
import { GraphCanvas } from "@/components/graph/GraphCanvas";
import { StatsBar } from "@/components/panels/StatsBar";
import { InspectorPanel } from "@/components/panels/InspectorPanel";
import { SearchBox } from "@/components/panels/SearchBox";
import { CycleBanner } from "@/components/panels/CycleBanner";

export default function ExplorePage() {
  const router = useRouter();
  const { result, reset } = useAnalysisStore();
  const isRedirectingRef = useRef(false);

  useEffect(() => {
    if (!result && !isRedirectingRef.current) {
      isRedirectingRef.current = true;
      router.replace("/");
    }
  }, [result, router]);

  if (!result) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-mono">Loading analysis...</span>
        </div>
      </div>
    );
  }

  const handleReset = () => {
    reset();
    router.push("/");
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 px-4 md:px-6 flex items-center justify-between gap-4 z-30 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            onClick={reset}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center font-bold text-slate-950 text-sm shadow-md shadow-cyan-500/20 group-hover:bg-cyan-400 transition-colors">
              CM
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-100 group-hover:text-cyan-400 transition-colors">
              CodeMap
            </span>
          </Link>
          <span className="text-slate-600 hidden sm:inline">/</span>
          <span className="text-xs text-slate-400 hidden sm:inline truncate max-w-50">
            {result.repo.name}
          </span>
        </div>

        <div className="flex-1 max-w-sm mx-auto hidden sm:block">
          <SearchBox />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-200 hover:text-cyan-300 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>←</span>
            <span>Analyze Another</span>
          </button>
        </div>
      </header>

      <StatsBar />

      <main className="flex-1 flex relative overflow-hidden">
        <div className="flex-1 relative h-full">
          <CycleBanner />
          <GraphCanvas />
        </div>

        <InspectorPanel />
      </main>
    </div>
  );
}
