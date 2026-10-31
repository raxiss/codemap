import type { GraphNode, GraphEdge, SourceFile } from "@/types/graph";
import { parseImports } from "@/lib/analyzer/parseImports";
import { resolveImport } from "@/lib/analyzer/resolveImport";

function countLines(content: string): number {
  if (content.length === 0) return 0;
  let count = 1;
  for (let i = 0; i < content.length; i++) {
    if (content[i] === "\n") count++;
  }
  return count;
}

function getFolder(filePath: string): string {
  const slashIdx = filePath.indexOf("/");
  return slashIdx >= 0 ? filePath.slice(0, slashIdx) : "(root)";
}

export function buildGraph(
  files: SourceFile[],
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const allPaths = new Set(files.map((f) => f.path));
  const nodeMap = new Map<string, GraphNode>();

  for (const file of files) {
    nodeMap.set(file.path, {
      id: file.path,
      folder: getFolder(file.path),
      lines: countLines(file.content),
      imports: [],
      importedBy: [],
    });
  }

  const edgeSet = new Set<string>();
  const edges: GraphEdge[] = [];

  for (const file of files) {
    const rawImports = parseImports(file.content);
    const sourceNode = nodeMap.get(file.path)!;

    for (const raw of rawImports) {
      const resolved = resolveImport(raw.specifier, file.path, allPaths);
      if (resolved === null) continue;

      const edgeKey = `${file.path}→${resolved}`;
      if (edgeSet.has(edgeKey)) continue;
      edgeSet.add(edgeKey);

      sourceNode.imports.push(resolved);

      const targetNode = nodeMap.get(resolved);
      if (targetNode) {
        targetNode.importedBy.push(file.path);
      }

      edges.push({ source: file.path, target: resolved });
    }
  }

  return { nodes: Array.from(nodeMap.values()), edges };
}
