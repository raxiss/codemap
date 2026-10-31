import { describe, it, expect } from "vitest";
import { detectCycles } from "@/lib/analyzer/detectCycles";
import type { GraphNode } from "@/types/graph";

function makeNode(id: string, imports: string[]): GraphNode {
  return { id, folder: "(root)", lines: 1, imports, importedBy: [] };
}

describe("detectCycles", () => {
  it("returns empty array when there are no cycles", () => {
    const nodes: GraphNode[] = [
      makeNode("a.ts", ["b.ts"]),
      makeNode("b.ts", ["c.ts"]),
      makeNode("c.ts", []),
    ];
    expect(detectCycles(nodes)).toEqual([]);
  });

  it("detects a simple 2-node cycle", () => {
    const nodes: GraphNode[] = [
      makeNode("a.ts", ["b.ts"]),
      makeNode("b.ts", ["a.ts"]),
    ];
    const cycles = detectCycles(nodes);
    expect(cycles).toHaveLength(1);
    expect(cycles[0]).toHaveLength(2);
    expect(cycles[0]).toContain("a.ts");
    expect(cycles[0]).toContain("b.ts");
  });

  it("detects a 3-node cycle", () => {
    const nodes: GraphNode[] = [
      makeNode("a.ts", ["b.ts"]),
      makeNode("b.ts", ["c.ts"]),
      makeNode("c.ts", ["a.ts"]),
    ];
    const cycles = detectCycles(nodes);
    expect(cycles).toHaveLength(1);
    expect(cycles[0]).toHaveLength(3);
    expect(cycles[0]).toContain("a.ts");
    expect(cycles[0]).toContain("b.ts");
    expect(cycles[0]).toContain("c.ts");
  });

  it("detects multiple independent cycles", () => {
    const nodes: GraphNode[] = [
      makeNode("a.ts", ["b.ts"]),
      makeNode("b.ts", ["a.ts"]),
      makeNode("c.ts", ["d.ts"]),
      makeNode("d.ts", ["c.ts"]),
      makeNode("e.ts", []),
    ];
    const cycles = detectCycles(nodes);
    expect(cycles).toHaveLength(2);
  });

  it("handles a complex SCC with tail nodes", () => {
    // Graph: e → a → b → c → a (cycle: a, b, c), d → b (d is not in cycle)
    const nodes: GraphNode[] = [
      makeNode("a.ts", ["b.ts"]),
      makeNode("b.ts", ["c.ts"]),
      makeNode("c.ts", ["a.ts"]),
      makeNode("d.ts", ["b.ts"]),
      makeNode("e.ts", ["a.ts"]),
    ];
    const cycles = detectCycles(nodes);
    expect(cycles).toHaveLength(1);
    expect(cycles[0]).toHaveLength(3);
    expect(cycles[0]).toContain("a.ts");
    expect(cycles[0]).toContain("b.ts");
    expect(cycles[0]).toContain("c.ts");
    expect(cycles[0]).not.toContain("d.ts");
    expect(cycles[0]).not.toContain("e.ts");
  });

  it("self-loops are not counted (single-node components)", () => {
    const nodes: GraphNode[] = [
      makeNode("a.ts", ["a.ts"]),
      makeNode("b.ts", []),
    ];
    const cycles = detectCycles(nodes);
    expect(cycles).toEqual([]);
  });

  it("returns empty array for an empty graph", () => {
    expect(detectCycles([])).toEqual([]);
  });

  it("returns empty array for disconnected nodes", () => {
    const nodes: GraphNode[] = [
      makeNode("a.ts", []),
      makeNode("b.ts", []),
      makeNode("c.ts", []),
    ];
    expect(detectCycles(nodes)).toEqual([]);
  });
});
