"use client";

import React, { useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  type NodeMouseHandler,
  type Node,
  type Edge,
} from "@xyflow/react";

import { useAnalysisStore } from "@/store/useAnalysisStore";
import { FileNode, type FileNodeData } from "./FileNode";
import { computeDagreLayout } from "./useGraphLayout";
import { getConnectedElements, getSearchMatches } from "./graphHighlight";

const nodeTypes = {
  fileNode: FileNode,
};

// Stable empty set reference to avoid unnecessary re-renders
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
    setHighlight,
    clearHighlight,
  } = useAnalysisStore();

  const { fitView } = useReactFlow();

  const positions = useMemo(() => {
    if (!result || result.nodes.length === 0) {
      return new Map<string, { x: number; y: number }>();
    }
    return computeDagreLayout(result.nodes, result.edges);
  }, [result]);

  const searchMatches = useMemo(() => {
    if (!result || !searchQuery.trim()) return EMPTY_SET;
    return getSearchMatches(searchQuery, result.nodes);
  }, [result, searchQuery]);

  const nodes: Node<FileNodeData>[] = useMemo(() => {
    if (!result || result.nodes.length === 0) return [];

    const hasActiveSelection =
      Boolean(selectedNodeId) ||
      highlightedNodes.size > 0 ||
      cycleHighlightNodes.size > 0;

    return result.nodes.map((node) => {
      const pos = positions.get(node.id) || { x: 0, y: 0 };
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
    positions,
    selectedNodeId,
    impactedNodes,
    cycleHighlightNodes,
    highlightedNodes,
    searchMatches,
  ]);

  const edges: Edge[] = useMemo(() => {
    if (!result || result.edges.length === 0) return [];

    const hasActiveSelection =
      Boolean(selectedNodeId) ||
      highlightedNodes.size > 0 ||
      cycleHighlightNodes.size > 0;

    return result.edges.map((edge) => {
      const edgeId = `${edge.source}->${edge.target}`;
      const isCycleEdge = cycleHighlightEdges.has(edgeId);
      const isHighlighted = highlightedEdges.has(edgeId);
      const isSourceSelected = selectedNodeId === edge.source;
      const isTargetSelected = selectedNodeId === edge.target;

      let stroke = "#475569"; // slate-600 default
      let strokeWidth = 1.2;
      let animated = false;
      let opacity = 0.5;

      if (isCycleEdge) {
        stroke = "#ef4444"; // red-500
        strokeWidth = 2.5;
        animated = true;
        opacity = 1;
      } else if (isHighlighted || isSourceSelected || isTargetSelected) {
        stroke = "#22d3ee"; // cyan-400
        strokeWidth = 2;
        animated = true;
        opacity = 1;
      } else if (hasActiveSelection) {
        opacity = 0.15;
      }

      return {
        id: edgeId,
        source: edge.source,
        target: edge.target,
        type: "smoothstep",
        animated,
        style: {
          stroke,
          strokeWidth,
          opacity,
          transition: "all 0.2s ease",
        },
      };
    });
  }, [
    result,
    selectedNodeId,
    cycleHighlightEdges,
    highlightedEdges,
    highlightedNodes.size,
    cycleHighlightNodes.size,
  ]);

  useEffect(() => {
    if (result && result.nodes.length > 0) {
      const timeout = setTimeout(() => {
        fitView({ padding: 0.2, duration: 400 });
      }, 80);
      return () => clearTimeout(timeout);
    }
  }, [result, fitView]);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      selectNode(node.id === selectedNodeId ? null : node.id);
    },
    [selectNode, selectedNodeId],
  );

  const handleNodeMouseEnter: NodeMouseHandler = useCallback(
    (_, node) => {
      if (!result) return;
      const { nodeIds, edgeIds } = getConnectedElements(node.id, result.nodes);
      setHighlight(nodeIds, edgeIds);
    },
    [result, setHighlight],
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
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={handleNodeClick}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        minZoom={0.05}
        maxZoom={2.5}
        defaultEdgeOptions={{ type: "smoothstep" }}
        nodesDraggable={false}
        className="codemap-flow"
      >
        <Background color="#334155" gap={24} size={1} />
        <Controls
          className="bg-slate-900! border-slate-800! text-slate-300! [&>button]:border-slate-800! [&>button]:bg-slate-900! hover:[&>button]:bg-slate-800!"
          showInteractive={false}
        />
        <MiniMap
          nodeColor="#06b6d4"
          maskColor="rgba(15, 23, 42, 0.75)"
          className="bg-slate-900! border! border-slate-800! rounded-lg! overflow-hidden"
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
