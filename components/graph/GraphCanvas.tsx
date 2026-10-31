"use client";

// ---------------------------------------------------------------------------
// CodeMap – Main React Flow Canvas (Hierarchical Tree Views)
// ---------------------------------------------------------------------------

import React, { useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
  type NodeMouseHandler,
  type Node,
  type Edge,
} from "@xyflow/react";

import { useAnalysisStore } from "@/store/useAnalysisStore";
import { FileNode, type FileNodeData } from "./FileNode";
import { computeDagreLayout, computeFileSystemTree } from "./useGraphLayout";
import { getConnectedElements, getSearchMatches } from "./graphHighlight";

const nodeTypes = {
  fileNode: FileNode,
};

const EMPTY_SET = new Set<string>();

function FlowInner() {
  const {
    result,
    selectedNodeId,
    selectNode,
    impactedNodes,
    highlightedNodes,
    highlightedEdges,
    cycleHighlightNodes,
    cycleHighlightEdges,
    searchQuery,
    treeViewMode,
    treeOrientation,
    setTreeViewMode,
    setTreeOrientation,
    setHighlight,
    clearHighlight,
  } = useAnalysisStore();

  const { fitView } = useReactFlow();

  // 1. Dependency Tree: Compute centered Dagre positions with isolated orphans separated
  const depPositions = useMemo(() => {
    if (!result || result.nodes.length === 0) {
      return new Map<string, { x: number; y: number }>();
    }
    return computeDagreLayout(result.nodes, result.edges, treeOrientation);
  }, [result, treeOrientation]);

  // 2. File System Tree: Compute folder hierarchy tree
  const fileSystemData = useMemo(() => {
    if (!result || result.nodes.length === 0) {
      return { nodes: [] as Node<FileNodeData>[], edges: [] as Edge[] };
    }
    return computeFileSystemTree(result.nodes, result.repo.name, treeOrientation);
  }, [result, treeOrientation]);

  // 3. Search matches
  const searchMatches = useMemo(() => {
    if (!result || !searchQuery.trim()) return EMPTY_SET;
    return getSearchMatches(searchQuery, result.nodes);
  }, [result, searchQuery]);

  // 4. Determine final Nodes array based on active view mode
  const nodes: Node<FileNodeData>[] = useMemo(() => {
    if (!result || result.nodes.length === 0) return [];

    // A. File System Tree Mode
    if (treeViewMode === "filesystem") {
      const hasActiveSelection = Boolean(selectedNodeId);
      return fileSystemData.nodes.map((node) => {
        const isSelected = selectedNodeId === node.id;
        const isSearchMatch = searchMatches.has(node.id);
        const isDimmed = hasActiveSelection && !isSelected && !isSearchMatch;

        return {
          ...node,
          data: {
            ...node.data,
            isSelected,
            isDimmed,
            isSearchMatch,
          },
        };
      });
    }

    // B. Dependency Tree Mode
    const hasActiveSelection =
      Boolean(selectedNodeId) ||
      highlightedNodes.size > 0 ||
      cycleHighlightNodes.size > 0;

    return result.nodes.map((node) => {
      const pos = depPositions.get(node.id) || { x: 0, y: 0 };
      const isSelected = selectedNodeId === node.id;
      const isImpacted = impactedNodes.has(node.id);
      const isInCycle = cycleHighlightNodes.has(node.id);
      const isHighlighted = highlightedNodes.has(node.id);
      const isSearchMatch = searchMatches.has(node.id);

      const isDimmed =
        hasActiveSelection &&
        !isSelected &&
        !isImpacted &&
        !isInCycle &&
        !isHighlighted &&
        !isSearchMatch;

      const label = node.id.split("/").pop() || node.id;

      return {
        id: node.id,
        type: "fileNode",
        position: pos,
        data: {
          label,
          fullPath: node.id,
          folder: node.folder,
          lines: node.lines,
          importsCount: node.imports.length,
          importedByCount: node.importedBy.length,
          isSelected,
          isImpacted,
          isInCycle,
          isHighlighted,
          isDimmed,
          isSearchMatch,
        },
      };
    });
  }, [
    result,
    treeViewMode,
    fileSystemData.nodes,
    depPositions,
    selectedNodeId,
    impactedNodes,
    cycleHighlightNodes,
    highlightedNodes,
    searchMatches,
  ]);

  // 5. Determine final Edges array with tree arrowheads
  const edges: Edge[] = useMemo(() => {
    if (!result) return [];

    // A. File System Tree Mode Edges
    if (treeViewMode === "filesystem") {
      return fileSystemData.edges.map((edge) => ({
        ...edge,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: "#06b6d4",
        },
      }));
    }

    // B. Dependency Tree Mode Edges
    if (result.edges.length === 0) return [];

    const hasActiveSelection =
      Boolean(selectedNodeId) ||
      highlightedNodes.size > 0 ||
      cycleHighlightNodes.size > 0;

    const sourceHandleId =
      treeOrientation === "TB" ? "source-bottom" : "source-right";
    const targetHandleId =
      treeOrientation === "TB" ? "target-top" : "target-left";

    return result.edges.map((edge) => {
      const edgeId = `${edge.source}->${edge.target}`;
      const isCycleEdge = cycleHighlightEdges.has(edgeId);
      const isHighlighted = highlightedEdges.has(edgeId);
      const isSourceSelected = selectedNodeId === edge.source;
      const isTargetSelected = selectedNodeId === edge.target;

      let stroke = "#64748b"; // slate-500
      let strokeWidth = 1.4;
      let animated = false;
      let opacity = 0.55;

      if (isCycleEdge) {
        stroke = "#ef4444"; // red-500
        strokeWidth = 2.5;
        animated = true;
        opacity = 1;
      } else if (isHighlighted || isSourceSelected || isTargetSelected) {
        stroke = "#22d3ee"; // cyan-400
        strokeWidth = 2.2;
        animated = true;
        opacity = 1;
      } else if (hasActiveSelection) {
        opacity = 0.12;
      }

      return {
        id: edgeId,
        source: edge.source,
        target: edge.target,
        sourceHandle: sourceHandleId,
        targetHandle: targetHandleId,
        type: "smoothstep",
        animated,
        style: {
          stroke,
          strokeWidth,
          opacity,
          transition: "all 0.2s ease",
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: stroke,
        },
      };
    });
  }, [
    result,
    treeViewMode,
    treeOrientation,
    fileSystemData.edges,
    selectedNodeId,
    cycleHighlightEdges,
    highlightedEdges,
    highlightedNodes.size,
    cycleHighlightNodes.size,
  ]);

  // 6. Automatically fit view on repository load, mode switch, or orientation switch
  useEffect(() => {
    if (nodes.length > 0) {
      const timeout = setTimeout(() => {
        fitView({ padding: 0.18, duration: 400 });
      }, 70);
      return () => clearTimeout(timeout);
    }
  }, [result, treeViewMode, treeOrientation, fitView, nodes.length]);

  // Click & hover interactions
  const handleNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      if (node.data.isFolder) {
        return;
      }
      selectNode(node.id === selectedNodeId ? null : node.id);
    },
    [selectNode, selectedNodeId],
  );

  const handleNodeMouseEnter: NodeMouseHandler = useCallback(
    (_, node) => {
      if (!result || treeViewMode === "filesystem") return;
      const { nodeIds, edgeIds } = getConnectedElements(node.id, result.nodes);
      setHighlight(nodeIds, edgeIds);
    },
    [result, treeViewMode, setHighlight],
  );

  const handleNodeMouseLeave = useCallback(() => {
    clearHighlight();
  }, [clearHighlight]);

  const handlePaneClick = useCallback(() => {
    selectNode(null);
    clearHighlight();
  }, [selectNode, clearHighlight]);

  return (
    <div className="w-full h-full relative bg-slate-950">
      {/* Floating Tree Controls */}
      <div className="absolute top-4 right-6 z-20 flex items-center gap-2 bg-slate-900/95 border border-slate-800 rounded-xl p-1.5 shadow-xl backdrop-blur-md">
        {/* View Mode: Dependency Tree vs Directory Tree */}
        <div className="flex bg-slate-950/80 rounded-lg p-0.5 border border-slate-800">
          <button
            type="button"
            onClick={() => setTreeViewMode("dependency")}
            className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              treeViewMode === "dependency"
                ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>🌲</span>
            <span>Dependency Tree</span>
          </button>
          <button
            type="button"
            onClick={() => setTreeViewMode("filesystem")}
            className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              treeViewMode === "filesystem"
                ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>📁</span>
            <span>Directory Tree</span>
          </button>
        </div>

        {/* Orientation: Top-to-Bottom vs Left-to-Right */}
        <div className="flex bg-slate-950/80 rounded-lg p-0.5 border border-slate-800">
          <button
            type="button"
            onClick={() => setTreeOrientation("TB")}
            className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
              treeOrientation === "TB"
                ? "bg-slate-800 text-cyan-300 border border-slate-700/80 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Top-to-Bottom Hierarchy"
          >
            ⬇ Top-Down
          </button>
          <button
            type="button"
            onClick={() => setTreeOrientation("LR")}
            className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
              treeOrientation === "LR"
                ? "bg-slate-800 text-cyan-300 border border-slate-700/80 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Left-to-Right Dendrogram"
          >
            ➡ Left-Right
          </button>
        </div>

        {/* Fit View */}
        <button
          type="button"
          onClick={() => fitView({ padding: 0.2, duration: 400 })}
          className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1"
          title="Recenter and Fit View"
        >
          <span>⛶</span>
          <span className="hidden sm:inline">Fit</span>
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={handleNodeClick}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        minZoom={0.03}
        maxZoom={2.5}
        defaultEdgeOptions={{ type: "smoothstep" }}
        nodesDraggable={false}
        className="codemap-flow"
      >
        <Background color="#334155" gap={24} size={1} />
        <Controls
          className="!bg-slate-900 !border-slate-800 !text-slate-300 [&>button]:!border-slate-800 [&>button]:!bg-slate-900 hover:[&>button]:!bg-slate-800"
          showInteractive={false}
        />
        <MiniMap
          nodeColor="#06b6d4"
          maskColor="rgba(15, 23, 42, 0.75)"
          className="!bg-slate-900 !border !border-slate-800 !rounded-lg overflow-hidden"
          zoomable
          pannable
        />
      </ReactFlow>
    </div>
  );
}

export function GraphCanvas() {
  return (
    <ReactFlowProvider>
      <FlowInner />
    </ReactFlowProvider>
  );
}
