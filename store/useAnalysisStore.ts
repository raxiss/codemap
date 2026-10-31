import { create } from "zustand";
import type {
  AnalysisProgress,
  AnalysisResult,
  AnalysisStage,
} from "@/types/graph";
import { computeImpact } from "@/lib/analyzer/computeImpact";

export interface AnalysisStore {
  stage: AnalysisStage;
  progress: AnalysisProgress | null;
  result: AnalysisResult | null;
  error: string | null;
  selectedNodeId: string | null;
  searchQuery: string;
  showImpact: boolean;
  impactedNodes: Set<string>;
  highlightedNodes: Set<string>;
  highlightedEdges: Set<string>;
  cycleHighlightNodes: Set<string>;
  cycleHighlightEdges: Set<string>;
  treeViewMode: "dependency" | "filesystem";
  treeOrientation: "TB" | "LR";

  setStage: (stage: AnalysisStage) => void;
  setProgress: (progress: AnalysisProgress | null) => void;
  setResult: (result: AnalysisResult | null) => void;
  setError: (error: string | null) => void;
  selectNode: (nodeId: string | null) => void;
  setSearchQuery: (query: string) => void;
  toggleImpact: () => void;
  focusCycle: (cycle: string[]) => void;
  clearCycleHighlight: () => void;
  setHighlight: (nodeIds: Set<string>, edgeIds: Set<string>) => void;
  clearHighlight: () => void;
  setTreeViewMode: (mode: "dependency" | "filesystem") => void;
  setTreeOrientation: (orientation: "TB" | "LR") => void;
  reset: () => void;

  analyzeGithub: (url: string, branch?: string) => Promise<boolean>;
  analyzeZip: (file: File) => Promise<boolean>;
}

export const useAnalysisStore = create<AnalysisStore>((set, get) => ({
  stage: "idle",
  progress: null,
  result: null,
  error: null,
  selectedNodeId: null,
  searchQuery: "",
  showImpact: false,
  impactedNodes: new Set<string>(),
  highlightedNodes: new Set<string>(),
  highlightedEdges: new Set<string>(),
  cycleHighlightNodes: new Set<string>(),
  cycleHighlightEdges: new Set<string>(),
  treeViewMode: "dependency",
  treeOrientation: "TB",

  setStage: (stage) => set({ stage }),
  setProgress: (progress) => set({ progress }),
  setResult: (result) => set({ result, error: null }),
  setError: (error) => set({ error, stage: "error", progress: null }),

  selectNode: (nodeId) => {
    const { result, showImpact } = get();
    if (!nodeId || !result) {
      set({
        selectedNodeId: null,
        impactedNodes: new Set<string>(),
      });
      return;
    }

    const nextImpacted = showImpact
      ? new Set(computeImpact(nodeId, result.nodes))
      : new Set<string>();

    set({
      selectedNodeId: nodeId,
      impactedNodes: nextImpacted,
    });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleImpact: () => {
    const { showImpact, selectedNodeId, result } = get();
    const nextShow = !showImpact;

    let impacted = new Set<string>();
    if (nextShow && selectedNodeId && result) {
      impacted = new Set(computeImpact(selectedNodeId, result.nodes));
    }

    set({
      showImpact: nextShow,
      impactedNodes: impacted,
    });
  },

  focusCycle: (cycle) => {
    const nodes = new Set<string>(cycle);
    const edges = new Set<string>();

    for (let i = 0; i < cycle.length; i++) {
      const source = cycle[i];
      const target = cycle[(i + 1) % cycle.length];
      edges.add(`${source}->${target}`);
    }

    set({
      cycleHighlightNodes: nodes,
      cycleHighlightEdges: edges,
      selectedNodeId: cycle[0] || null,
    });
  },

  clearCycleHighlight: () => {
    set({
      cycleHighlightNodes: new Set<string>(),
      cycleHighlightEdges: new Set<string>(),
    });
  },

  setHighlight: (nodeIds, edgeIds) => {
    set({
      highlightedNodes: nodeIds,
      highlightedEdges: edgeIds,
    });
  },

  clearHighlight: () => {
    set({
      highlightedNodes: new Set<string>(),
      highlightedEdges: new Set<string>(),
    });
  },

  setTreeViewMode: (mode) => set({ treeViewMode: mode, selectedNodeId: null }),
  setTreeOrientation: (orientation) => set({ treeOrientation: orientation }),

  reset: () => {
    set({
      stage: "idle",
      progress: null,
      result: null,
      error: null,
      selectedNodeId: null,
      searchQuery: "",
      showImpact: false,
      impactedNodes: new Set<string>(),
      highlightedNodes: new Set<string>(),
      highlightedEdges: new Set<string>(),
      cycleHighlightNodes: new Set<string>(),
      cycleHighlightEdges: new Set<string>(),
      treeViewMode: "dependency",
      treeOrientation: "TB",
    });
  },

  analyzeGithub: async (url: string, branch?: string) => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      set({ error: "Please enter a GitHub repository URL", stage: "error" });
      return false;
    }

    set({
      stage: "fetching-tree",
      error: null,
      progress: {
        stage: "fetching-tree",
        message: "Reading file list from GitHub...",
        percent: 25,
      },
    });

    try {
      const timer = setTimeout(() => {
        if (get().stage === "fetching-tree") {
          set({
            stage: "fetching-files",
            progress: {
              stage: "fetching-files",
              message: "Fetching and analyzing source files...",
              percent: 65,
            },
          });
        }
      }, 1500);

      const res = await fetch("/api/analyze/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmedUrl, branch: branch?.trim() || undefined }),
      });

      clearTimeout(timer);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze repository");
      }

      set({
        stage: "done",
        result: data,
        progress: {
          stage: "done",
          message: "Analysis complete!",
          percent: 100,
        },
        error: null,
      });

      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred during analysis";
      set({
        stage: "error",
        error: message,
        progress: null,
      });
      return false;
    }
  },

  analyzeZip: async (file: File) => {
    set({
      stage: "fetching-files",
      error: null,
      progress: {
        stage: "fetching-files",
        message: `Extracting ${file.name}...`,
        percent: 40,
      },
    });

    try {
      const formData = new FormData();
      formData.append("file", file);

      set({
        stage: "parsing",
        progress: {
          stage: "parsing",
          message: "Parsing imports & building graph...",
          percent: 75,
        },
      });

      const res = await fetch("/api/analyze/zip", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze ZIP file");
      }

      set({
        stage: "done",
        result: data,
        progress: {
          stage: "done",
          message: "Analysis complete!",
          percent: 100,
        },
        error: null,
      });

      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to analyze ZIP";
      set({
        stage: "error",
        error: message,
        progress: null,
      });
      return false;
    }
  },
}));
