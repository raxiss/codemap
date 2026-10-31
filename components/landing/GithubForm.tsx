"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAnalysisStore } from "@/store/useAnalysisStore";

const EXAMPLE_REPOS = [
  { label: "expressjs/express", url: "https://github.com/expressjs/express", branch: "master" },
  { label: "reduxjs/redux", url: "https://github.com/reduxjs/redux", branch: "master" },
  { label: "colinhacks/zod", url: "https://github.com/colinhacks/zod", branch: "master" },
];

export function GithubForm() {
  const router = useRouter();
  const { stage, analyzeGithub } = useAnalysisStore();

  const [url, setUrl] = useState("");
  const [branch, setBranch] = useState("");
  const [showBranch, setShowBranch] = useState(false);
  const [localError, setLocalError] = useState("");

  const isLoading = stage !== "idle" && stage !== "error" && stage !== "done";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setLocalError("Please enter a GitHub repository URL");
      return;
    }

    if (!trimmedUrl.includes("github.com")) {
      setLocalError("Only github.com repository URLs are supported");
      return;
    }

    const success = await analyzeGithub(trimmedUrl, branch.trim() || undefined);
    if (success) {
      router.push("/explore");
    }
  };

  const handleSelectExample = (exampleUrl: string, exampleBranch: string) => {
    setUrl(exampleUrl);
    setBranch(exampleBranch);
    setLocalError("");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-4">
      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (localError) setLocalError("");
            }}
            placeholder="https://github.com/owner/repository"
            disabled={isLoading}
            className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500 transition-all font-mono disabled:opacity-50 shadow-inner"
          />
          {url && !isLoading && (
            <button
              type="button"
              onClick={() => setUrl("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs px-1.5 py-0.5 rounded"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-xs px-1">
          <button
            type="button"
            onClick={() => setShowBranch(!showBranch)}
            className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>{showBranch ? "▼" : "▶"}</span>
            <span>Specify custom branch / subfolder</span>
          </button>
        </div>

        {showBranch && (
          <div className="pt-1">
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="Branch (e.g. main, dev, or v2)"
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono disabled:opacity-50"
            />
          </div>
        )}
      </div>

      {localError && (
        <p className="text-xs text-red-400 px-1 font-medium">{localError}</p>
      )}

      <button
        type="submit"
        disabled={isLoading || !url.trim()}
        className="w-full py-3.5 px-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            <span>Analyzing Repository...</span>
          </>
        ) : (
          <span>Analyze Architecture</span>
        )}
      </button>

      <div className="pt-3">
        <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium mb-2 text-center">
          Or try a quick demo repo:
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {EXAMPLE_REPOS.map((repo) => (
            <button
              key={repo.label}
              type="button"
              onClick={() => handleSelectExample(repo.url, repo.branch)}
              disabled={isLoading}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-slate-700 transition-all font-mono disabled:opacity-50 cursor-pointer"
            >
              {repo.label}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
