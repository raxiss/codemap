import type { RawImport } from "@/types/graph";

/**
 * Removes comments while preserving string literals and line numbers, so
 * commented-out imports do not produce false positives.
 */
function stripComments(source: string): string {
  return source.replace(
    /\/\/[^\n]*|\/\*[\s\S]*?\*\/|`(?:\\[\s\S]|[^`\\])*`|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'/g,
    (match) => {
      if (match.startsWith("/")) {
        return match.replace(/[^\n]/g, " ");
      }
      return match;
    },
  );
}

/**
 * Extracts import, re-export, require, and dynamic import specifiers.
 * Type-only imports are ignored.
 */
export function parseImports(content: string): RawImport[] {
  const stripped = stripComments(content);
  const results: RawImport[] = [];
  const seen = new Set<string>();

  // The negative lookahead skips `import type`.
  const staticImportRe =
    /\b(?:import\s+(?!type\s)(?:[\s\S]*?\s+from\s+)?|export\s+(?:\{[^}]*\}|[\s\S]*?)\s+from\s+)['"]([^'"]+)['"]/g;

  let m: RegExpExecArray | null;
  while ((m = staticImportRe.exec(stripped)) !== null) {
    const specifier = m[1];
    const key = `static:${specifier}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push({ specifier, isDynamic: false });
    }
  }

  const requireRe = /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((m = requireRe.exec(stripped)) !== null) {
    const specifier = m[1];
    const key = `static:${specifier}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push({ specifier, isDynamic: false });
    }
  }

  const dynamicImportRe = /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((m = dynamicImportRe.exec(stripped)) !== null) {
    const specifier = m[1];
    const key = `dynamic:${specifier}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push({ specifier, isDynamic: true });
    }
  }

  return results;
}
