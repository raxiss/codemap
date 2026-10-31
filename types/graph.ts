export interface GraphNode {
  id: string;
  folder: string;
  lines: number;
  imports: string[];
  importedBy: string[];
}

/** Directed edge from the importing file to the imported file. */
export interface GraphEdge {
  source: string;
  target: string;
}

export interface Stats {
  files: number;
  lines: number;
  cycles: number;
  mostConnected: string;
  mostConnectedCount: number;
  orphans: string[];
}

export interface RepoInfo {
  owner: string;
  name: string;
  branch: string;
}

export interface AnalysisResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  /** File paths forming each cycle. */
  cycles: string[][];
  stats: Stats;
  repo: RepoInfo;
}

export interface RawImport {
  /** Import specifier as written, e.g. "./utils" or "react". */
  specifier: string;
  isDynamic: boolean;
}

export interface SourceFile {
  path: string;
  content: string;
}

export type AnalysisStage =
  | "idle"
  | "fetching-tree"
  | "fetching-files"
  | "parsing"
  | "building-graph"
  | "detecting-cycles"
  | "done"
  | "error";

export interface AnalysisProgress {
  stage: AnalysisStage;
  message: string;
  /** 0–100 */
  percent: number;
}
