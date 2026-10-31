"use client";

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
    isImpacted,
    isInCycle,
    isHighlighted,
    isDimmed,
    isSearchMatch,
  } = data;

  const theme = getFolderTheme(folder);
  const isSelfSelected = selected || data.isSelected;

  let borderStyle = theme.border;
  let ringStyle = "";
  let glowStyle = "";

  if (isInCycle) {
    borderStyle = "border-red-500";
    ringStyle = "ring-2 ring-red-500/80";
    glowStyle = "shadow-[0_0_15px_rgba(239,68,68,0.4)]";
  } else if (isImpacted) {
    borderStyle = "border-amber-400";
    ringStyle = "ring-2 ring-amber-400/80";
    glowStyle = "shadow-[0_0_15px_rgba(251,191,36,0.35)]";
  } else if (isSelfSelected) {
    borderStyle = "border-cyan-400";
    ringStyle = "ring-2 ring-cyan-400";
    glowStyle = "shadow-[0_0_15px_rgba(34,211,238,0.4)]";
  } else if (isHighlighted) {
    borderStyle = "border-cyan-400/80";
    ringStyle = "ring-1 ring-cyan-400/60";
  } else if (isSearchMatch) {
    borderStyle = "border-emerald-400";
    ringStyle = "ring-2 ring-emerald-400/80";
  }

  return (
    <div
      className={`relative group rounded-lg px-3 py-2 border transition-all duration-150 backdrop-blur-md cursor-pointer select-none min-w-42.5 max-w-60 ${
        theme.bg
      } ${borderStyle} ${ringStyle} ${glowStyle} ${
        isDimmed ? "opacity-25" : "opacity-100"
      }`}
      title={fullPath}
    >
      {/* Incoming imports (imported by) */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2! h-2! bg-cyan-400! border! border-slate-900! transition-colors"
      />

      <div className="flex items-center justify-between gap-1 text-[10px] mb-1 font-mono">
        <span
          className={`px-1.5 py-0.2 rounded border font-medium truncate max-w-22.5 ${theme.badge}`}
        >
          {folder}
        </span>
        <span className="text-slate-400 text-[10px]">{lines} lines</span>
      </div>

      <div className="font-semibold text-xs tracking-tight text-slate-100 truncate font-mono">
        {label}
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 pt-1 border-t border-slate-700/40">
        <span title="Imports count">
          ⬇ <span className="text-slate-300 font-medium">{importsCount}</span>
        </span>
        <span title="Imported by count">
          ⬆ <span className="text-slate-300 font-medium">{importedByCount}</span>
        </span>
      </div>

      {/* Outgoing imports */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2! h-2! bg-cyan-400! border! border-slate-900! transition-colors"
      />
    </div>
  );
});
