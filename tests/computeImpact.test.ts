import { describe, it, expect } from "vitest";
import { computeImpact } from "@/lib/analyzer/computeImpact";
import type { GraphNode } from "@/types/graph";

describe("computeImpact", () => {
  it("returns empty array for unknown node", () => {
    const nodes: GraphNode[] = [];
    expect(computeImpact("nonexistent.ts", nodes)).toEqual([]);
  });

  it("returns empty array for node with no dependents", () => {
    const nodes: GraphNode[] = [
      { id: "app.ts", folder: "(root)", lines: 10, imports: ["utils.ts"], importedBy: [] },
      { id: "utils.ts", folder: "(root)", lines: 5, imports: [], importedBy: ["app.ts"] },
    ];
    expect(computeImpact("app.ts", nodes)).toEqual([]);
  });

  it("computes direct and transitive blast radius", () => {
    const nodes: GraphNode[] = [
      { id: "db.ts", folder: "(root)", lines: 10, imports: [], importedBy: ["user.ts"] },
      { id: "user.ts", folder: "(root)", lines: 20, imports: ["db.ts"], importedBy: ["controller.ts"] },
      { id: "controller.ts", folder: "(root)", lines: 30, imports: ["user.ts"], importedBy: ["server.ts"] },
      { id: "server.ts", folder: "(root)", lines: 40, imports: ["controller.ts"], importedBy: [] },
    ];

    const impact = computeImpact("db.ts", nodes);
    expect(impact.sort()).toEqual(["controller.ts", "server.ts", "user.ts"].sort());
  });

  it("handles circular dependents without infinite looping", () => {
    const nodes: GraphNode[] = [
      { id: "a.ts", folder: "(root)", lines: 10, imports: ["b.ts"], importedBy: ["b.ts"] },
      { id: "b.ts", folder: "(root)", lines: 10, imports: ["a.ts"], importedBy: ["a.ts"] },
    ];

    const impact = computeImpact("a.ts", nodes);
    expect(impact).toEqual(["b.ts"]);
  });
});
