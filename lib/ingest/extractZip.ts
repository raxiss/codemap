import AdmZip from "adm-zip";
import type { SourceFile } from "@/types/graph";
import { SOURCE_EXTENSIONS, IGNORED_DIRS } from "@/lib/constants";

function isSourceFile(filePath: string): boolean {
  const hasExt = SOURCE_EXTENSIONS.some((ext) => filePath.endsWith(ext));
  if (!hasExt) return false;

  const parts = filePath.split("/");
  for (let i = 0; i < parts.length - 1; i++) {
    if ((IGNORED_DIRS as readonly string[]).includes(parts[i])) {
      return false;
    }
  }

  return true;
}

/**
 * Extracts JS/TS source files from a ZIP, stripping the top-level directory
 * that GitHub-generated archives wrap all entries in.
 */
export function extractZip(buffer: Buffer): SourceFile[] {
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();
  const files: SourceFile[] = [];

  let topLevelPrefix = "";
  for (const entry of entries) {
    if (entry.isDirectory && entry.entryName.split("/").filter(Boolean).length === 1) {
      topLevelPrefix = entry.entryName;
      break;
    }
  }

  for (const entry of entries) {
    if (entry.isDirectory) continue;

    let relativePath = entry.entryName;

    if (topLevelPrefix && relativePath.startsWith(topLevelPrefix)) {
      relativePath = relativePath.slice(topLevelPrefix.length);
    }

    if (!relativePath) continue;
    if (!isSourceFile(relativePath)) continue;

    const content = entry.getData().toString("utf-8");
    files.push({ path: relativePath, content });
  }

  return files;
}
