import { SOURCE_EXTENSIONS, IGNORED_DIRS } from "@/lib/constants";

export function scanFiles(paths: string[]): string[] {
  const ignoredSet = new Set<string>(IGNORED_DIRS);

  return paths
    .filter((p) => {
      const hasSourceExt = SOURCE_EXTENSIONS.some((ext) => p.endsWith(ext));
      if (!hasSourceExt) return false;

      const segments = p.split("/");
      for (const seg of segments) {
        if (ignoredSet.has(seg)) return false;
      }

      return true;
    })
    .sort();
}
