"use client";

import React from "react";
import { useAnalysisStore } from "@/store/useAnalysisStore";

export function StatsBar() {
  const { result } = useAnalysisStore();

  if (!result) return null;

  const { stats, repo } = result;

  return (
    <div className="w-full bg-slate-900/90 border-b border-slate-800 px-6 py-2.5 flex items-center justify-between text-xs text-slate-300 font-mono backdrop-blur-md z-10 flex-wrap gap-3">
      <div className="flex items-center gap-2">
        <span className="text-slate-400 font-sans font-medium text-xs">Repo:</span>
        <span className="text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
          {repo.owner}/{repo.name}
        </span>
        <span className="text-slate-400 text-[11px]">@{repo.branch}</span>
      </div>

      <div className="flex items-center gap-5 flex-wrap">
        <div>
          <span className="text-slate-400 font-sans">Files: </span>
          <span className="text-slate-100 font-semibold">{stats.files}</span>
        </div>

        <div className="h-3 w-px bg-slate-800" />

        <div>
          <span className="text-slate-400 font-sans">Lines: </span>
          <span className="text-slate-100 font-semibold">
            {stats.lines.toLocaleString()}
          </span>
        </div>

        <div className="h-3 w-px bg-slate-800" />

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-sans">Cycles: </span>
          <span
            className={`font-semibold px-1.5 py-0.2 rounded border ${
              stats.cycles > 0
                ? "bg-red-950/60 text-red-400 border-red-800/80 animate-pulse"
                : "bg-emerald-950/40 text-emerald-400 border-emerald-800/40"
            }`}
          >
            {stats.cycles}
          </span>
        </div>

        <div className="h-3 w-px bg-slate-800" />

        {stats.mostConnected && (
          <div className="hidden md:flex items-center gap-1">
            <span className="text-slate-400 font-sans">Top Hub: </span>
            <span
              className="text-cyan-300 truncate max-w-40"
              title={`${stats.mostConnected} (${stats.mostConnectedCount} connections)`}
            >
              {stats.mostConnected.split("/").pop()}
            </span>
            <span className="text-slate-400 text-[11px]">
              ({stats.mostConnectedCount})
            </span>
          </div>
        )}

        {stats.orphans.length > 0 && (
          <>
            <div className="h-3 w-px bg-slate-800" />
            <div className="hidden lg:flex items-center gap-1 text-slate-400">
              <span className="font-sans">Orphans: </span>
              <span className="text-slate-300">{stats.orphans.length}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
