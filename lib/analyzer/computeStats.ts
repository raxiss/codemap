import type { GraphNode, Stats } from "@/types/graph";

export function computeStats(nodes: GraphNode[], cycles: string[][]): Stats {
  const files = nodes.length;
  const lines = nodes.reduce((sum, n) => sum + n.lines, 0);

  let mostConnected = "";
  let mostConnectedCount = 0;

  for (const node of nodes) {
    const connections = node.imports.length + node.importedBy.length;
    if (connections > mostConnectedCount) {
      mostConnectedCount = connections;
      mostConnected = node.id;
    }
  }

  const orphans = nodes
    .filter((n) => n.imports.length === 0 && n.importedBy.length === 0)
    .map((n) => n.id);

  return {
    files,
    lines,
    cycles: cycles.length,
    mostConnected,
    mostConnectedCount,
    orphans,
  };
}
