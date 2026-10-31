import { describe, it, expect } from "vitest";
import { buildGraph } from "@/lib/analyzer/buildGraph";
import { computeStats } from "@/lib/analyzer/computeStats";
import type { SourceFile } from "@/types/graph";

describe("buildGraph & computeStats", () => {
  it("builds correct nodes and edges from source files", () => {
    const files: SourceFile[] = [
      {
        path: "src/index.ts",
        content: `import { helper } from './utils/helper';\nconsole.log(helper());`,
      },
      {
        path: "src/utils/helper.ts",
        content: `export const helper = () => 'ok';`,
      },
    ];

    const { nodes, edges } = buildGraph(files);

    expect(nodes).toHaveLength(2);
    expect(edges).toHaveLength(1);

    const indexNode = nodes.find((n) => n.id === "src/index.ts");
    const helperNode = nodes.find((n) => n.id === "src/utils/helper.ts");

    expect(indexNode).toBeDefined();
    expect(helperNode).toBeDefined();

    expect(indexNode?.folder).toBe("src");
    expect(indexNode?.imports).toContain("src/utils/helper.ts");
    expect(helperNode?.importedBy).toContain("src/index.ts");

    expect(edges[0]).toEqual({
      source: "src/index.ts",
      target: "src/utils/helper.ts",
    });

    const stats = computeStats(nodes, []);
    expect(stats.files).toBe(2);
    expect(stats.cycles).toBe(0);
    expect(stats.mostConnected).toBe("src/index.ts");
  });
});
