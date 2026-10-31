"use client";

import React, { useState } from "react";
import { useAnalysisStore } from "@/store/useAnalysisStore";

export function CycleBanner() {
  const { result, focusCycle, clearCycleHighlight, cycleHighlightNodes } =
    useAnalysisStore();
  const [expanded, setExpanded] = useState(false);

  if (!result || result.cycles.length === 0) return null;

  const cycleCount = result.cycles.length;
  const isHighlighting = cycleHighlightNodes.size > 0;

  return (
    <div className="absolute top-4 left-6 z-20 max-w-xl">
      <div className="bg-red-950/85 border border-red-800/80 rounded-xl p-3 shadow-xl backdrop-blur-md text-xs text-red-200">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-red-400 text-sm font-bold animate-pulse">⚠</span>
            <span className="font-semibold text-red-100">
              {cycleCount} Circular Dependenc{cycleCount === 1 ? "y" : "ies"} Detected
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isHighlighting && (
              <button
                type="button"
                onClick={clearCycleHighlight}
                className="text-[11px] px-2 py-0.5 rounded bg-red-900/60 hover:bg-red-800 text-red-300 transition-colors cursor-pointer"
              >
                Clear Focus
              </button>
            )}
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-[11px] underline text-red-300 hover:text-red-100 transition-colors cursor-pointer"
            >
              {expanded ? "Hide Details" : "View Cycles"}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 pt-2.5 border-t border-red-900/60 space-y-2 max-h-56 overflow-y-auto">
            {result.cycles.map((cycle, index) => (
              <div
                key={index}
                onClick={() => focusCycle(cycle)}
                className="p-2 rounded bg-red-900/40 hover:bg-red-900/70 border border-red-800/40 cursor-pointer transition-colors"
                title="Click to highlight this cycle on the canvas"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[11px] text-red-300">
                    Cycle #{index + 1} ({cycle.length} files)
                  </span>
                  <span className="text-[10px] text-red-400 font-sans">
                    Click to inspect
                  </span>
                </div>
                <div className="font-mono text-[11px] text-red-200 leading-relaxed break-all">
                  {cycle.map((filePath, i) => (
                    <span key={filePath}>
                      <span className="text-red-100 font-semibold">
                        {filePath.split("/").pop()}
                      </span>
                      {i < cycle.length - 1 ? " ➔ " : " ➔ (loop)"}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
