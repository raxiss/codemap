import type { SourceFile, RepoInfo, AnalysisResult } from "@/types/graph";
import { buildGraph } from "@/lib/analyzer/buildGraph";
import { detectCycles } from "@/lib/analyzer/detectCycles";
import { computeStats } from "@/lib/analyzer/computeStats";

export function analyzeFiles(
  files: SourceFile[],
  repo: RepoInfo,
): AnalysisResult {
  const { nodes, edges } = buildGraph(files);
  const cycles = detectCycles(nodes);
  const stats = computeStats(nodes, cycles);

  return {
    nodes,
    edges,
    cycles,
    stats,
    repo,
  };
}
