"use client";

import React, { useState } from "react";
import { GithubForm } from "./GithubForm";
import { ZipDropzone } from "./ZipDropzone";
import { ProgressStages } from "./ProgressStages";
import { useAnalysisStore } from "@/store/useAnalysisStore";

export function SourceTabs() {
  const [activeTab, setActiveTab] = useState<"github" | "zip">("github");
  const { stage } = useAnalysisStore();
  const isAnalyzing = stage !== "idle" && stage !== "done" && stage !== "error";

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab("github")}
          disabled={isAnalyzing}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "github"
              ? "bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/60"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>GitHub Repository</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("zip")}
          disabled={isAnalyzing}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "zip"
              ? "bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/60"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>Upload ZIP Archive</span>
        </button>
      </div>

      <div className="pt-2">
        {activeTab === "github" ? <GithubForm /> : <ZipDropzone />}
      </div>

      <div className="pt-2">
        <ProgressStages />
      </div>
    </div>
  );
}
