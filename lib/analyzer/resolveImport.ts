import { RESOLVE_EXTENSIONS } from "@/lib/constants";

function normalizePath(p: string): string {
  const parts = p.split("/");
  const resolved: string[] = [];

  for (const seg of parts) {
    if (seg === "." || seg === "") continue;
    if (seg === "..") {
      resolved.pop();
    } else {
      resolved.push(seg);
    }
  }

  return resolved.join("/");
}

/**
 * Resolves relative imports against the known file set, including
 * extensionless paths and `.js` → `.ts` mappings. Returns `null` for bare
 * specifiers or when no match is found.
 */
export function resolveImport(
  specifier: string,
  fromFile: string,
  allFiles: Set<string>,
): string | null {
  if (!specifier.startsWith(".")) {
    return null;
  }

  const lastSlash = fromFile.lastIndexOf("/");
  const dir = lastSlash >= 0 ? fromFile.slice(0, lastSlash) : "";

  const raw = dir ? `${dir}/${specifier}` : specifier;
  const base = normalizePath(raw);

  if (allFiles.has(base)) {
    return base;
  }

  for (const ext of RESOLVE_EXTENSIONS) {
    const candidate = base + ext;
    if (allFiles.has(candidate)) {
      return candidate;
    }
  }

  const jsExtMap: Record<string, string[]> = {
    ".js": [".ts", ".tsx"],
    ".jsx": [".tsx"],
    ".mjs": [".mts"],
    ".cjs": [".cts"],
  };

  for (const [jsExt, tsExts] of Object.entries(jsExtMap)) {
    if (base.endsWith(jsExt)) {
      const stem = base.slice(0, -jsExt.length);
      for (const tsExt of tsExts) {
        const candidate = stem + tsExt;
        if (allFiles.has(candidate)) {
          return candidate;
        }
      }
    }
  }

  return null;
}
