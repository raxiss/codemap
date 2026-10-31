import { describe, it, expect } from "vitest";
import { resolveImport } from "@/lib/analyzer/resolveImport";

describe("resolveImport", () => {
  it("returns null for bare package specifiers", () => {
    const files = new Set(["src/app.ts"]);
    expect(resolveImport("react", "src/app.ts", files)).toBeNull();
  });

  it("returns null for scoped package specifiers", () => {
    const files = new Set(["src/app.ts"]);
    expect(resolveImport("@scope/pkg", "src/app.ts", files)).toBeNull();
  });

  it("resolves exact relative path", () => {
    const files = new Set(["src/utils.ts", "src/app.ts"]);
    expect(resolveImport("./utils.ts", "src/app.ts", files)).toBe("src/utils.ts");
  });

  it("resolves without extension by trying .ts", () => {
    const files = new Set(["src/utils.ts", "src/app.ts"]);
    expect(resolveImport("./utils", "src/app.ts", files)).toBe("src/utils.ts");
  });

  it("resolves without extension by trying .tsx", () => {
    const files = new Set(["src/Button.tsx", "src/app.ts"]);
    expect(resolveImport("./Button", "src/app.ts", files)).toBe("src/Button.tsx");
  });

  it("resolves without extension by trying .js", () => {
    const files = new Set(["src/helper.js", "src/app.ts"]);
    expect(resolveImport("./helper", "src/app.ts", files)).toBe("src/helper.js");
  });

  it("resolves directory to index.ts", () => {
    const files = new Set(["src/utils/index.ts", "src/app.ts"]);
    expect(resolveImport("./utils", "src/app.ts", files)).toBe("src/utils/index.ts");
  });

  it("resolves directory to index.tsx", () => {
    const files = new Set(["src/components/index.tsx", "src/app.ts"]);
    expect(resolveImport("./components", "src/app.ts", files)).toBe(
      "src/components/index.tsx",
    );
  });

  it("resolves directory to index.js", () => {
    const files = new Set(["lib/index.js", "app.ts"]);
    expect(resolveImport("./lib", "app.ts", files)).toBe("lib/index.js");
  });

  it("resolves .js extension to .ts file", () => {
    const files = new Set(["src/utils.ts", "src/app.ts"]);
    expect(resolveImport("./utils.js", "src/app.ts", files)).toBe("src/utils.ts");
  });

  it("resolves .jsx extension to .tsx file", () => {
    const files = new Set(["src/Button.tsx", "src/app.ts"]);
    expect(resolveImport("./Button.jsx", "src/app.ts", files)).toBe(
      "src/Button.tsx",
    );
  });

  it("resolves .mjs extension to .mts file", () => {
    const files = new Set(["src/config.mts", "src/app.ts"]);
    expect(resolveImport("./config.mjs", "src/app.ts", files)).toBe(
      "src/config.mts",
    );
  });

  it("resolves .cjs extension to .cts file", () => {
    const files = new Set(["src/legacy.cts", "src/app.ts"]);
    expect(resolveImport("./legacy.cjs", "src/app.ts", files)).toBe(
      "src/legacy.cts",
    );
  });


  it("resolves .. parent paths", () => {
    const files = new Set(["lib/shared.ts", "src/deep/module.ts"]);
    expect(
      resolveImport("../../lib/shared", "src/deep/module.ts", files),
    ).toBe("lib/shared.ts");
  });

  it("returns null when no file matches", () => {
    const files = new Set(["src/app.ts"]);
    expect(resolveImport("./nonexistent", "src/app.ts", files)).toBeNull();
  });

  it("resolves imports from root-level files", () => {
    const files = new Set(["utils.ts", "app.ts"]);
    expect(resolveImport("./utils", "app.ts", files)).toBe("utils.ts");
  });
});
