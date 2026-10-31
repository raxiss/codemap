"use client";

import React from "react";
import { useAnalysisStore } from "@/store/useAnalysisStore";
import type { AnalysisStage } from "@/types/graph";

interface StageConfig {
  key: AnalysisStage;
  label: string;
}

const STAGES: StageConfig[] = [
  { key: "fetching-tree", label: "Reading file list" },
  { key: "fetching-files", label: "Fetching source files" },
  { key: "parsing", label: "Parsing imports & building graph" },
  { key: "detecting-cycles", label: "Detecting circular dependencies" },
];

function getStageStatus(
  currentStage: AnalysisStage,
  stageKey: AnalysisStage,
): "pending" | "active" | "done" {
  const order: AnalysisStage[] = [
    "fetching-tree",
    "fetching-files",
    "parsing",
    "detecting-cycles",
    "done",
  ];

  const currentIndex = order.indexOf(currentStage);
  const stageIndex = order.indexOf(stageKey);

  if (currentStage === "done" || currentIndex > stageIndex) {
    return "done";
  }
  if (currentIndex === stageIndex) {
    return "active";
  }
  return "pending";
}

export function ProgressStages() {
  const { stage, progress, error } = useAnalysisStore();

  if (stage === "idle") return null;

  return (
    <div className="w-full max-w-lg mx-auto bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-200">
          {stage === "error" ? "Analysis Failed" : "Analyzing Codebase..."}
        </h3>
        {progress && (
          <span className="text-xs font-mono text-cyan-400">
            {progress.percent}%
          </span>
        )}
      </div>

      {stage !== "error" && (
        <div className="w-full bg-slate-800 rounded-full h-1.5 mb-5 overflow-hidden">
          <div
            className="bg-cyan-400 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress?.percent || 15}%` }}
          />
        </div>
      )}

      <div className="space-y-3">
        {STAGES.map((s) => {
          const status = getStageStatus(stage, s.key);
          return (
            <div
              key={s.key}
              className={`flex items-center gap-3 text-xs transition-colors ${
                status === "done"
                  ? "text-slate-300"
                  : status === "active"
                  ? "text-cyan-400 font-medium"
                  : "text-slate-600"
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                {status === "done" ? (
                  <span className="text-emerald-400 font-bold">✓</span>
                ) : status === "active" ? (
                  <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-700" />
                )}
              </div>
              <span>{s.label}</span>
            </div>
          );
        })}
      </div>

      {progress?.message && stage !== "error" && (
        <p className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 font-mono truncate">
          {progress.message}
        </p>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-950/60 border border-red-900/80 rounded-lg text-xs text-red-300 flex items-start gap-2">
          <span className="text-red-400 font-bold">!</span>
          <p className="leading-relaxed">{error}</p>
        </div>
      )}
    </div>
  );
}
