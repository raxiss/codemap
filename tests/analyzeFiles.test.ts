import { describe, it, expect } from "vitest";
import { analyzeFiles } from "@/lib/analyzer/analyzeFiles";
import type { SourceFile, RepoInfo } from "@/types/graph";

describe("analyzeFiles", () => {
  it("analyzes source files into a complete AnalysisResult", () => {
    const files: SourceFile[] = [
      { path: "src/a.ts", content: `import { b } from './b';` },
      { path: "src/b.ts", content: `export const b = 42;` },
    ];
    const repo: RepoInfo = { owner: "test", name: "repo", branch: "main" };
    const result = analyzeFiles(files, repo);

    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toHaveLength(1);
    expect(result.stats.files).toBe(2);
    expect(result.repo.name).toBe("repo");
  });
});
