"use client";

// ---------------------------------------------------------------------------
// CodeMap – Custom React Flow Node: FileNode / FolderNode
// ---------------------------------------------------------------------------

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { getFolderTheme } from "./graphHighlight";

export type FileNodeData = {
  label: string;
  fullPath: string;
  folder: string;
  lines: number;
  importsCount: number;
  importedByCount: number;
  isFolder?: boolean;
  itemCount?: number;
  isSelected?: boolean;
  isImpacted?: boolean;
  isInCycle?: boolean;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  isSearchMatch?: boolean;
  [key: string]: unknown;
};

export const FileNode = memo(function FileNode({
  data,
  selected,
}: NodeProps & { data: FileNodeData }) {
  const {
    label,
    fullPath,
    folder,
    lines,
    importsCount,
    importedByCount,
    isFolder,
    itemCount,
    isImpacted,
    isInCycle,
    isHighlighted,
    isDimmed,
    isSearchMatch,
  } = data;

  const theme = getFolderTheme(folder);
  const isSelfSelected = selected || data.isSelected;

  // Determine role in the dependency tree
  const isRoot = !isFolder && importedByCount === 0 && importsCount > 0;
  const isLeaf = !isFolder && importsCount === 0 && importedByCount > 0;
  const isOrphan = !isFolder && importsCount === 0 && importedByCount === 0;

  // Border & Glow styling
  let borderStyle = theme.border;
  let ringStyle = "";
  let glowStyle = "";

  if (isInCycle) {
    borderStyle = "border-red-500";
    ringStyle = "ring-2 ring-red-500/80";
    glowStyle = "shadow-[0_0_18px_rgba(239,68,68,0.45)]";
  } else if (isImpacted) {
    borderStyle = "border-amber-400";
    ringStyle = "ring-2 ring-amber-400/80";
    glowStyle = "shadow-[0_0_18px_rgba(251,191,36,0.4)]";
  } else if (isSelfSelected) {
    borderStyle = "border-cyan-400";
    ringStyle = "ring-2 ring-cyan-400";
    glowStyle = "shadow-[0_0_18px_rgba(34,211,238,0.45)]";
  } else if (isHighlighted) {
    borderStyle = "border-cyan-400/80";
    ringStyle = "ring-1 ring-cyan-400/60";
  } else if (isSearchMatch) {
    borderStyle = "border-emerald-400";
    ringStyle = "ring-2 ring-emerald-400/80";
  }

  // Folder Node Card (for File System Tree View)
  if (isFolder) {
    return (
      <div
        className={`relative group rounded-xl px-4 py-2.5 border transition-all duration-150 backdrop-blur-md cursor-pointer select-none min-w-[190px] max-w-[260px] bg-slate-900/90 border-cyan-500/50 shadow-lg shadow-cyan-950/20 ${ringStyle} ${glowStyle} ${
          isDimmed ? "opacity-25" : "opacity-100"
        }`}
        title={`Directory: ${fullPath}`}
      >
        <Handle
          type="target"
          id="target-top"
          position={Position.Top}
          className="!w-2 !h-2 !bg-cyan-400 !border !border-slate-900"
        />
        <Handle
          type="target"
          id="target-left"
          position={Position.Left}
          className="!w-2 !h-2 !bg-cyan-400 !border !border-slate-900"
        />

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm">📁</span>
            <span className="font-bold text-xs text-cyan-300 font-mono truncate">
              {label}
            </span>
          </div>
          {typeof itemCount === "number" && (
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono shrink-0">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        <Handle
          type="source"
          id="source-bottom"
          position={Position.Bottom}
          className="!w-2 !h-2 !bg-cyan-400 !border !border-slate-900"
        />
        <Handle
          type="source"
          id="source-right"
          position={Position.Right}
          className="!w-2 !h-2 !bg-cyan-400 !border !border-slate-900"
        />
      </div>
    );
  }

  // File Node Card (for Dependency & File System Tree Views)
  return (
    <div
      className={`relative group rounded-xl px-3.5 py-2.5 border transition-all duration-150 backdrop-blur-md cursor-pointer select-none min-w-[185px] max-w-[245px] ${
        theme.bg
      } ${borderStyle} ${ringStyle} ${glowStyle} ${
        isDimmed ? "opacity-25" : "opacity-100"
      }`}
      title={fullPath}
    >
      {/* Handles for Top-to-Bottom (TB) and Left-to-Right (LR) tree flow */}
      <Handle
        type="target"
        id="target-top"
        position={Position.Top}
        className="!w-2 !h-2 !bg-cyan-400 !border !border-slate-900 transition-colors"
      />
      <Handle
        type="target"
        id="target-left"
        position={Position.Left}
        className="!w-2 !h-2 !bg-cyan-400 !border !border-slate-900 transition-colors"
      />

      {/* Header: Tree Role Badge + Folder Badge */}
      <div className="flex items-center justify-between gap-1 text-[10px] mb-1 font-mono">
        <span
          className={`px-1.5 py-0.2 rounded border font-medium truncate max-w-[95px] ${theme.badge}`}
        >
          {folder}
        </span>

        {/* Tree hierarchy tag */}
        {isRoot && (
          <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-semibold flex items-center gap-0.5">
            <span>🌲</span>
            <span>Root</span>
          </span>
        )}
        {isLeaf && (
          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-semibold flex items-center gap-0.5">
            <span>🍃</span>
            <span>Leaf</span>
          </span>
        )}
        {isOrphan && (
          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[9px]">
            Isolated
          </span>
        )}
        {!isRoot && !isLeaf && !isOrphan && (
          <span className="text-slate-400 text-[10px]">{lines} lines</span>
        )}
      </div>

      {/* Node Label: File name */}
      <div className="font-semibold text-xs tracking-tight text-slate-100 truncate font-mono">
        {label}
      </div>

      {/* Node Footer: Connection counts */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 pt-1 border-t border-slate-700/40 font-mono">
        <span title="Imports count (Dependencies)">
          ⬇ <span className="text-slate-200 font-medium">{importsCount}</span>
        </span>
        <span className="text-slate-400 text-[9px]">
          {lines}L
        </span>
        <span title="Imported by count (Dependents)">
          ⬆ <span className="text-slate-200 font-medium">{importedByCount}</span>
        </span>
      </div>

      {/* Outgoing handles */}
      <Handle
        type="source"
        id="source-bottom"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-cyan-400 !border !border-slate-900 transition-colors"
      />
      <Handle
        type="source"
        id="source-right"
        position={Position.Right}
        className="!w-2 !h-2 !bg-cyan-400 !border !border-slate-900 transition-colors"
      />
    </div>
  );
});
