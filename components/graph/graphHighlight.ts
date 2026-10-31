import type { GraphNode } from "@/types/graph";

export function getConnectedElements(
  nodeId: string,
  nodes: GraphNode[],
): { nodeIds: Set<string>; edgeIds: Set<string> } {
  const nodeIds = new Set<string>();
  const edgeIds = new Set<string>();

  const targetNode = nodes.find((n) => n.id === nodeId);
  if (!targetNode) return { nodeIds, edgeIds };

  nodeIds.add(nodeId);

  // Files this node imports: edge is nodeId -> imp
  for (const imp of targetNode.imports) {
    nodeIds.add(imp);
    edgeIds.add(`${nodeId}->${imp}`);
  }

  // Files that import this node: edge is dep -> nodeId
  for (const dep of targetNode.importedBy) {
    nodeIds.add(dep);
    edgeIds.add(`${dep}->${nodeId}`);
  }

  return { nodeIds, edgeIds };
}

export function getSearchMatches(
  query: string,
  nodes: GraphNode[],
): Set<string> {
  const matches = new Set<string>();
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return matches;

  for (const node of nodes) {
    if (node.id.toLowerCase().includes(trimmed)) {
      matches.add(node.id);
    }
  }

  return matches;
}

export const FOLDER_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  src: { bg: "bg-cyan-950/40", border: "border-cyan-500/50", text: "text-cyan-300", badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" },
  app: { bg: "bg-blue-950/40", border: "border-blue-500/50", text: "text-blue-300", badge: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
  lib: { bg: "bg-emerald-950/40", border: "border-emerald-500/50", text: "text-emerald-300", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
  components: { bg: "bg-violet-950/40", border: "border-violet-500/50", text: "text-violet-300", badge: "bg-violet-500/20 text-violet-300 border-violet-500/40" },
  utils: { bg: "bg-teal-950/40", border: "border-teal-500/50", text: "text-teal-300", badge: "bg-teal-500/20 text-teal-300 border-teal-500/40" },
  hooks: { bg: "bg-pink-950/40", border: "border-pink-500/50", text: "text-pink-300", badge: "bg-pink-500/20 text-pink-300 border-pink-500/40" },
  pages: { bg: "bg-indigo-950/40", border: "border-indigo-500/50", text: "text-indigo-300", badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" },
  routes: { bg: "bg-amber-950/40", border: "border-amber-500/50", text: "text-amber-300", badge: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  models: { bg: "bg-rose-950/40", border: "border-rose-500/50", text: "text-rose-300", badge: "bg-rose-500/20 text-rose-300 border-rose-500/40" },
  controllers: { bg: "bg-orange-950/40", border: "border-orange-500/50", text: "text-orange-300", badge: "bg-orange-500/20 text-orange-300 border-orange-500/40" },
  services: { bg: "bg-sky-950/40", border: "border-sky-500/50", text: "text-sky-300", badge: "bg-sky-500/20 text-sky-300 border-sky-500/40" },
  test: { bg: "bg-zinc-900/40", border: "border-zinc-500/50", text: "text-zinc-300", badge: "bg-zinc-500/20 text-zinc-300 border-zinc-500/40" },
  tests: { bg: "bg-zinc-900/40", border: "border-zinc-500/50", text: "text-zinc-300", badge: "bg-zinc-500/20 text-zinc-300 border-zinc-500/40" },
  "(root)": { bg: "bg-slate-900/60", border: "border-slate-600/50", text: "text-slate-300", badge: "bg-slate-700/30 text-slate-300 border-slate-600/40" },
};

const DEFAULT_COLOR = {
  bg: "bg-slate-900/50",
  border: "border-slate-700/60",
  text: "text-slate-200",
  badge: "bg-slate-700/30 text-slate-300 border-slate-600/40",
};

export function getFolderTheme(folder: string) {
  const key = folder.toLowerCase();
  return FOLDER_COLORS[key] || DEFAULT_COLOR;
}
