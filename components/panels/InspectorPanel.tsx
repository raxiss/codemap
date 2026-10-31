"use client";

import React from "react";
import { useAnalysisStore } from "@/store/useAnalysisStore";
import { getFolderTheme } from "../graph/graphHighlight";

export function InspectorPanel() {
  const {
    selectedNodeId,
    selectNode,
    result,
    showImpact,
    toggleImpact,
    impactedNodes,
  } = useAnalysisStore();

  if (!selectedNodeId || !result) return null;

  const node = result.nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const fileName = node.id.split("/").pop() || node.id;
  const theme = getFolderTheme(node.folder);
  const githubUrl = `https://github.com/${result.repo.owner}/${result.repo.name}/blob/${result.repo.branch}/${node.id}`;

  return (
    <aside className="w-80 md:w-96 bg-slate-900/95 border-l border-slate-800 flex flex-col h-full shadow-2xl backdrop-blur-xl z-20 transition-all">
      <div className="p-4 border-b border-slate-800 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono border ${theme.badge}`}
            >
              {node.folder}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {node.lines} lines
            </span>
          </div>
          <h2
            className="text-sm font-bold text-slate-100 font-mono truncate"
            title={node.id}
          >
            {fileName}
          </h2>
          <p
            className="text-[11px] text-slate-400 font-mono truncate mt-0.5"
            title={node.id}
          >
            {node.id}
          </p>
        </div>

        <button
          type="button"
          onClick={() => selectNode(null)}
          className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800 transition-colors text-xs cursor-pointer"
          title="Close Inspector"
        >
          ✕
        </button>
      </div>

      <div className="p-3 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-950/40">
        <button
          type="button"
          onClick={toggleImpact}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
            showImpact
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
              : "bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/60"
          }`}
          title="Highlight all direct and transitive dependents affected by this file"
        >
          <span>💥</span>
          <span>{showImpact ? "Hide Blast Radius" : "Show Blast Radius"}</span>
          {showImpact && (
            <span className="bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded text-[10px]">
              {impactedNodes.size}
            </span>
          )}
        </button>

        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-cyan-300 text-xs transition-colors flex items-center gap-1.5"
          title="View file on GitHub"
        >
          <span>↗</span>
          <span className="hidden sm:inline">GitHub</span>
        </a>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs font-mono">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-300 font-sans text-xs flex items-center gap-1.5">
              <span>⬇ Imports</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded border border-slate-700 font-mono">
                {node.imports.length}
              </span>
            </h3>
          </div>

          {node.imports.length === 0 ? (
            <p className="text-slate-600 text-[11px] italic font-sans">
              No project imports (leaf module)
            </p>
          ) : (
            <ul className="space-y-1.5">
              {node.imports.map((imp) => {
                const impName = imp.split("/").pop() || imp;
                return (
                  <li key={imp}>
                    <button
                      type="button"
                      onClick={() => selectNode(imp)}
                      className="w-full text-left p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-750 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer group"
                    >
                      <div className="font-medium truncate group-hover:underline">
                        {impName}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {imp}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-300 font-sans text-xs flex items-center gap-1.5">
              <span>⬆ Imported By</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded border border-slate-700 font-mono">
                {node.importedBy.length}
              </span>
            </h3>
          </div>

          {node.importedBy.length === 0 ? (
            <p className="text-slate-600 text-[11px] italic font-sans">
              Not imported by any project file (entry point or orphan)
            </p>
          ) : (
            <ul className="space-y-1.5">
              {node.importedBy.map((dep) => {
                const depName = dep.split("/").pop() || dep;
                return (
                  <li key={dep}>
                    <button
                      type="button"
                      onClick={() => selectNode(dep)}
                      className="w-full text-left p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-750 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer group"
                    >
                      <div className="font-medium truncate group-hover:underline">
                        {depName}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {dep}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {showImpact && impactedNodes.size > 0 && (
          <div className="pt-2 border-t border-slate-800">
            <h3 className="font-semibold text-amber-300 font-sans text-xs mb-2">
              💥 Affected Files ({impactedNodes.size})
            </h3>
            <ul className="space-y-1">
              {Array.from(impactedNodes).map((impId) => (
                <li
                  key={impId}
                  onClick={() => selectNode(impId)}
                  className="text-[11px] text-slate-400 hover:text-amber-200 cursor-pointer truncate p-1 rounded hover:bg-slate-800/50"
                  title={impId}
                >
                  • {impId}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
