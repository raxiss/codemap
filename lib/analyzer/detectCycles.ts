import type { GraphNode } from "@/types/graph";

/**
 * Detects circular dependencies using Tarjan's strongly connected
 * components algorithm. Only components with more than one node are cycles.
 */
export function detectCycles(nodes: GraphNode[]): string[][] {
  const adj = new Map<string, string[]>();
  const nodeIds = new Set<string>();

  for (const node of nodes) {
    adj.set(node.id, node.imports);
    nodeIds.add(node.id);
  }

  let index = 0;
  const nodeIndex = new Map<string, number>();
  const nodeLowlink = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  const sccs: string[][] = [];

  function strongConnect(v: string): void {
    nodeIndex.set(v, index);
    nodeLowlink.set(v, index);
    index++;
    stack.push(v);
    onStack.add(v);

    const successors = adj.get(v) ?? [];
    for (const w of successors) {
      // Imports may reference files outside the analyzed set
      if (!nodeIds.has(w)) continue;

      if (!nodeIndex.has(w)) {
        strongConnect(w);
        nodeLowlink.set(v, Math.min(nodeLowlink.get(v)!, nodeLowlink.get(w)!));
      } else if (onStack.has(w)) {
        nodeLowlink.set(v, Math.min(nodeLowlink.get(v)!, nodeIndex.get(w)!));
      }
    }

    if (nodeLowlink.get(v) === nodeIndex.get(v)) {
      const component: string[] = [];
      let w: string;
      do {
        w = stack.pop()!;
        onStack.delete(w);
        component.push(w);
      } while (w !== v);

      if (component.length > 1) {
        sccs.push(component);
      }
    }
  }

  for (const node of nodes) {
    if (!nodeIndex.has(node.id)) {
      strongConnect(node.id);
    }
  }

  return sccs;
}
