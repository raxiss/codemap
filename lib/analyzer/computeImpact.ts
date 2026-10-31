import type { GraphNode } from "@/types/graph";

/**
 * Returns all files that directly or transitively import `nodeId`,
 * excluding `nodeId` itself.
 */
export function computeImpact(nodeId: string, nodes: GraphNode[]): string[] {
  const nodeMap = new Map<string, GraphNode>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  const startNode = nodeMap.get(nodeId);
  if (!startNode) return [];

  const visited = new Set<string>();
  const queue: string[] = [...startNode.importedBy];

  visited.add(nodeId);

  for (const id of queue) {
    visited.add(id);
  }

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const current = nodeMap.get(currentId);
    if (!current) continue;

    for (const depId of current.importedBy) {
      if (!visited.has(depId)) {
        visited.add(depId);
        queue.push(depId);
      }
    }
  }

  visited.delete(nodeId);
  return Array.from(visited);
}
