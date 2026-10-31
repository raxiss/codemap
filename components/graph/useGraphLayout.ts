// ---------------------------------------------------------------------------
// CodeMap – Hierarchical Tree Layout Engine (Dagre)
// ---------------------------------------------------------------------------

import dagre from "dagre";
import type { GraphNode, GraphEdge } from "@/types/graph";
import type { Node, Edge } from "@xyflow/react";
import type { FileNodeData } from "./FileNode";

export const NODE_WIDTH = 210;
export const NODE_HEIGHT = 72;
export const FOLDER_NODE_WIDTH = 200;
export const FOLDER_NODE_HEIGHT = 44;

/**
 * Computes a balanced, centered hierarchical tree layout for the dependency graph.
 *
 * 1. Isolates the connected dependency tree from isolated (orphan) files so orphans
 *    do not clutter the entry-point roots at Rank 0.
 * 2. Lays out connected nodes with centered parent-child hierarchy (no lopsided UL align).
 * 3. Neatly positions orphan files in a dedicated grid shelf below the main tree.
 */
export function computeDagreLayout(
  graphNodes: GraphNode[],
  graphEdges: GraphEdge[],
  rankdir: "TB" | "LR" = "TB",
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  if (!graphNodes || graphNodes.length === 0) return positions;

  // Identify connected nodes vs orphan nodes
  const connectedIds = new Set<string>();
  for (const edge of graphEdges) {
    connectedIds.add(edge.source);
    connectedIds.add(edge.target);
  }

  const connectedNodes = graphNodes.filter((n) => connectedIds.has(n.id));
  const orphanNodes = graphNodes.filter((n) => !connectedIds.has(n.id));

  let minX = 0;
  let maxX = 0;
  let minY = 0;
  let maxY = 0;

  if (connectedNodes.length > 0) {
    const g = new dagre.graphlib.Graph();
    g.setGraph({
      rankdir,
      nodesep: 60,
      ranksep: 110,
    });
    g.setDefaultEdgeLabel(() => ({}));

    for (const node of connectedNodes) {
      g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    }

    for (const edge of graphEdges) {
      g.setEdge(edge.source, edge.target);
    }

    dagre.layout(g);

    let first = true;
    for (const node of connectedNodes) {
      const dagreNode = g.node(node.id);
      if (dagreNode) {
        const x = dagreNode.x - NODE_WIDTH / 2;
        const y = dagreNode.y - NODE_HEIGHT / 2;
        positions.set(node.id, { x, y });

        if (first) {
          minX = x;
          maxX = x + NODE_WIDTH;
          minY = y;
          maxY = y + NODE_HEIGHT;
          first = false;
        } else {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x + NODE_WIDTH);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y + NODE_HEIGHT);
        }
      }
    }
  }

  // Position orphan/isolated files in an orderly shelf below or beside the tree
  if (orphanNodes.length > 0) {
    const cols = Math.max(3, Math.min(6, Math.ceil(Math.sqrt(orphanNodes.length * 2))));
    const orphanStartX = connectedNodes.length > 0 ? minX : 0;
    const orphanStartY =
      connectedNodes.length > 0
        ? rankdir === "TB"
          ? maxY + 140
          : minY
        : 0;

    orphanNodes.forEach((node, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);

      const x =
        rankdir === "TB"
          ? orphanStartX + col * (NODE_WIDTH + 30)
          : maxX + 140 + col * (NODE_WIDTH + 30);
      const y =
        rankdir === "TB"
          ? orphanStartY + row * (NODE_HEIGHT + 24)
          : orphanStartY + row * (NODE_HEIGHT + 24);

      positions.set(node.id, { x, y });
    });
  }

  return positions;
}

/**
 * Constructs an authentic Directory / File System Tree from the repository paths.
 * Visualizes: Repository Root ➔ Folder Branches ➔ File Leaves.
 */
export function computeFileSystemTree(
  graphNodes: GraphNode[],
  repoName: string,
  rankdir: "TB" | "LR" = "TB",
): { nodes: Node<FileNodeData>[]; edges: Edge[] } {
  if (!graphNodes || graphNodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir,
    nodesep: 45,
    ranksep: 90,
  });
  g.setDefaultEdgeLabel(() => ({}));

  const rootId = "__repo_root__";
  const folderChildrenCount = new Map<string, number>();
  const folderPaths = new Set<string>();
  const edgesList: { source: string; target: string; id: string }[] = [];

  // Register Root Node
  g.setNode(rootId, { width: FOLDER_NODE_WIDTH, height: FOLDER_NODE_HEIGHT });

  // Map directory tree
  for (const node of graphNodes) {
    const parts = node.id.split("/");
    let parentFolderId = rootId;

    for (let i = 0; i < parts.length - 1; i++) {
      const folderPath = parts.slice(0, i + 1).join("/");
      const folderId = `dir:${folderPath}`;

      if (!folderPaths.has(folderPath)) {
        folderPaths.add(folderPath);
        g.setNode(folderId, {
          width: FOLDER_NODE_WIDTH,
          height: FOLDER_NODE_HEIGHT,
        });

        const edgeId = `${parentFolderId}->${folderId}`;
        edgesList.push({ source: parentFolderId, target: folderId, id: edgeId });
        g.setEdge(parentFolderId, folderId);
      }

      folderChildrenCount.set(
        folderId,
        (folderChildrenCount.get(folderId) || 0) + 1,
      );
      parentFolderId = folderId;
    }

    // Register File leaf under its directory
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    const edgeId = `${parentFolderId}->${node.id}`;
    edgesList.push({ source: parentFolderId, target: node.id, id: edgeId });
    g.setEdge(parentFolderId, node.id);

    folderChildrenCount.set(
      parentFolderId,
      (folderChildrenCount.get(parentFolderId) || 0) + 1,
    );
  }

  folderChildrenCount.set(rootId, graphNodes.length);

  dagre.layout(g);

  // Build React Flow nodes
  const flowNodes: Node<FileNodeData>[] = [];

  // 1. Root Folder
  const rootDagre = g.node(rootId);
  flowNodes.push({
    id: rootId,
    type: "fileNode",
    position: {
      x: rootDagre ? rootDagre.x - FOLDER_NODE_WIDTH / 2 : 0,
      y: rootDagre ? rootDagre.y - FOLDER_NODE_HEIGHT / 2 : 0,
    },
    data: {
      label: `📁 ${repoName}`,
      fullPath: "/",
      folder: "(root)",
      lines: 0,
      importsCount: 0,
      importedByCount: 0,
      isFolder: true,
      itemCount: folderChildrenCount.get(rootId) || graphNodes.length,
    },
  });

  // 2. Directory Folders
  for (const folderPath of folderPaths) {
    const folderId = `dir:${folderPath}`;
    const dagreNode = g.node(folderId);
    const folderName = folderPath.split("/").pop() || folderPath;

    flowNodes.push({
      id: folderId,
      type: "fileNode",
      position: {
        x: dagreNode ? dagreNode.x - FOLDER_NODE_WIDTH / 2 : 0,
        y: dagreNode ? dagreNode.y - FOLDER_NODE_HEIGHT / 2 : 0,
      },
      data: {
        label: `${folderName}/`,
        fullPath: folderPath,
        folder: folderPath.split("/")[0] || "(root)",
        lines: 0,
        importsCount: 0,
        importedByCount: 0,
        isFolder: true,
        itemCount: folderChildrenCount.get(folderId) || 0,
      },
    });
  }

  // 3. File Nodes
  for (const node of graphNodes) {
    const dagreNode = g.node(node.id);
    const label = node.id.split("/").pop() || node.id;

    flowNodes.push({
      id: node.id,
      type: "fileNode",
      position: {
        x: dagreNode ? dagreNode.x - NODE_WIDTH / 2 : 0,
        y: dagreNode ? dagreNode.y - NODE_HEIGHT / 2 : 0,
      },
      data: {
        label,
        fullPath: node.id,
        folder: node.folder,
        lines: node.lines,
        importsCount: node.imports.length,
        importedByCount: node.importedBy.length,
        isFolder: false,
      },
    });
  }

  // 4. Tree Edges
  const flowEdges: Edge[] = edgesList.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: rankdir === "TB" ? "source-bottom" : "source-right",
    targetHandle: rankdir === "TB" ? "target-top" : "target-left",
    type: "smoothstep",
    style: {
      stroke: "#06b6d4",
      strokeWidth: 1.5,
      opacity: 0.6,
    },
  }));

  return { nodes: flowNodes, edges: flowEdges };
}
