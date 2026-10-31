import { describe, it, expect } from "vitest";
import { parseImports } from "@/lib/analyzer/parseImports";

describe("parseImports", () => {
  it("parses named imports", () => {
    const result = parseImports(`import { foo, bar } from './utils';`);
    expect(result).toEqual([
      { specifier: "./utils", isDynamic: false },
    ]);
  });

  it("parses default imports", () => {
    const result = parseImports(`import React from 'react';`);
    expect(result).toEqual([
      { specifier: "react", isDynamic: false },
    ]);
  });

  it("parses namespace imports", () => {
    const result = parseImports(`import * as path from 'path';`);
    expect(result).toEqual([
      { specifier: "path", isDynamic: false },
    ]);
  });

  it("parses side-effect imports", () => {
    const result = parseImports(`import './polyfill';`);
    expect(result).toEqual([
      { specifier: "./polyfill", isDynamic: false },
    ]);
  });

  it("parses double-quoted imports", () => {
    const result = parseImports(`import { x } from "./module";`);
    expect(result).toEqual([
      { specifier: "./module", isDynamic: false },
    ]);
  });

  it("parses named re-exports", () => {
    const result = parseImports(`export { foo } from './foo';`);
    expect(result).toEqual([
      { specifier: "./foo", isDynamic: false },
    ]);
  });

  it("parses wildcard re-exports", () => {
    const result = parseImports(`export * from './barrel';`);
    expect(result).toEqual([
      { specifier: "./barrel", isDynamic: false },
    ]);
  });

  it("parses require() calls", () => {
    const result = parseImports(`const fs = require('fs');`);
    expect(result).toEqual([
      { specifier: "fs", isDynamic: false },
    ]);
  });

  it("parses require() with double quotes", () => {
    const result = parseImports(`const x = require("./helper");`);
    expect(result).toEqual([
      { specifier: "./helper", isDynamic: false },
    ]);
  });

  it("parses dynamic import()", () => {
    const result = parseImports(`const m = import('./lazy');`);
    expect(result).toEqual([
      { specifier: "./lazy", isDynamic: true },
    ]);
  });

  it("parses dynamic import() with await", () => {
    const result = parseImports(`const m = await import('./lazy');`);
    expect(result).toEqual([
      { specifier: "./lazy", isDynamic: true },
    ]);
  });

  it("ignores type-only imports", () => {
    const result = parseImports(`import type { Foo } from './types';`);
    expect(result).toEqual([]);
  });

  it("ignores type-only imports with default", () => {
    const result = parseImports(`import type Foo from './types';`);
    expect(result).toEqual([]);
  });

  it("ignores imports in single-line comments", () => {
    const result = parseImports(`// import { foo } from './foo';`);
    expect(result).toEqual([]);
  });

  it("ignores imports in multi-line comments", () => {
    const result = parseImports(`/* import { foo } from './foo'; */`);
    expect(result).toEqual([]);
  });

  it("ignores imports in block comments spanning multiple lines", () => {
    const code = `
/*
import { foo } from './foo';
import { bar } from './bar';
*/
import { baz } from './baz';
`;
    const result = parseImports(code);
    expect(result).toEqual([
      { specifier: "./baz", isDynamic: false },
    ]);
  });

  it("parses multiple imports from the same file", () => {
    const code = `
import { a } from './mod';
import { b } from './mod';
import { c } from './other';
`;
    const result = parseImports(code);
    expect(result).toEqual([
      { specifier: "./mod", isDynamic: false },
      { specifier: "./other", isDynamic: false },
    ]);
  });

  it("parses a mix of static and dynamic imports", () => {
    const code = `
import { a } from './static';
const b = import('./dynamic');
const c = require('./cjs');
`;
    const result = parseImports(code);
    expect(result).toHaveLength(3);
    expect(result).toContainEqual({ specifier: "./static", isDynamic: false });
    expect(result).toContainEqual({ specifier: "./dynamic", isDynamic: true });
    expect(result).toContainEqual({ specifier: "./cjs", isDynamic: false });
  });

  it("returns empty array for empty content", () => {
    expect(parseImports("")).toEqual([]);
  });

  it("returns empty array for content with no imports", () => {
    const code = `const x = 42;\nconsole.log(x);`;
    expect(parseImports(code)).toEqual([]);
  });

  it("handles imports in string literals inside comments correctly", () => {
    const code = `
// This is not an import: require('foo')
const x = require('./real');
`;
    const result = parseImports(code);
    expect(result).toEqual([
      { specifier: "./real", isDynamic: false },
    ]);
  });
});
