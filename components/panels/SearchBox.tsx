"use client";

import React, { useRef, useEffect } from "react";
import { useAnalysisStore } from "@/store/useAnalysisStore";
import { getSearchMatches } from "../graph/graphHighlight";

export function SearchBox() {
  const { searchQuery, setSearchQuery, result } = useAnalysisStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        setSearchQuery("");
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setSearchQuery]);

  const matchCount = React.useMemo(() => {
    if (!result || !searchQuery) return 0;
    return getSearchMatches(searchQuery, result.nodes).size;
  }, [result, searchQuery]);

  return (
    <div className="relative w-64 md:w-80">
      <div className="relative flex items-center">
        <span className="absolute left-3 text-slate-500 text-xs">🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search files... (⌘K)"
          className="w-full pl-8 pr-16 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
        />

        {searchQuery ? (
          <div className="absolute right-2 flex items-center gap-1.5">
            <span className="text-[10px] bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
              {matchCount}
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-slate-500 hover:text-slate-300 text-xs px-1"
            >
              ✕
            </button>
          </div>
        ) : (
          <span className="absolute right-2.5 text-[10px] text-slate-500 border border-slate-700 rounded px-1 py-0.2 select-none">
            ⌘K
          </span>
        )}
      </div>
    </div>
  );
}
