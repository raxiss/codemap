import dagre from "dagre";
import type { GraphNode, GraphEdge } from "@/types/graph";

export const NODE_WIDTH = 200;
export const NODE_HEIGHT = 68;

export function computeDagreLayout(
  graphNodes: GraphNode[],
  graphEdges: GraphEdge[],
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  if (!graphNodes || graphNodes.length === 0) return positions;

  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: "TB",
    nodesep: 40,
    ranksep: 75,
    align: "UL",
  });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of graphNodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  for (const edge of graphEdges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  for (const node of graphNodes) {
    const dagreNode = g.node(node.id);
    positions.set(node.id, {
      x: dagreNode ? dagreNode.x - NODE_WIDTH / 2 : 0,
      y: dagreNode ? dagreNode.y - NODE_HEIGHT / 2 : 0,
    });
  }

  return positions;
}
