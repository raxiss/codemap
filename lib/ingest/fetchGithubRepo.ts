import type { SourceFile } from "@/types/graph";
import {
  GITHUB_API_BASE,
  GITHUB_RAW_BASE,
  FETCH_CONCURRENCY,
  SOURCE_EXTENSIONS,
  IGNORED_DIRS,
} from "@/lib/constants";

interface TreeEntry {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  url: string;
}

interface TreeResponse {
  sha: string;
  url: string;
  tree: TreeEntry[];
  truncated: boolean;
}

function isSourceFile(filePath: string): boolean {
  const hasExt = SOURCE_EXTENSIONS.some((ext) => filePath.endsWith(ext));
  if (!hasExt) return false;

  const parts = filePath.split("/");
  // Check every directory segment (not the filename itself)
  for (let i = 0; i < parts.length - 1; i++) {
    if ((IGNORED_DIRS as readonly string[]).includes(parts[i])) {
      return false;
    }
  }

  return true;
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "CodeMap/1.0",
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Fetches files with bounded concurrency; failed individual fetches are
 * skipped.
 */
async function fetchFilesWithConcurrency(
  owner: string,
  repo: string,
  branch: string,
  paths: string[],
): Promise<SourceFile[]> {
  const results: SourceFile[] = [];
  const headers = buildHeaders();

  for (let i = 0; i < paths.length; i += FETCH_CONCURRENCY) {
    const chunk = paths.slice(i, i + FETCH_CONCURRENCY);

    const chunkResults = await Promise.allSettled(
      chunk.map(async (filePath) => {
        const url = `${GITHUB_RAW_BASE}/${owner}/${repo}/${branch}/${filePath}`;
        const response = await fetch(url, { headers });

        if (!response.ok) {
          throw new Error(`Failed to fetch ${filePath}: ${response.status}`);
        }

        const content = await response.text();
        return { path: filePath, content } satisfies SourceFile;
      }),
    );

    for (const result of chunkResults) {
      if (result.status === "fulfilled") {
        results.push(result.value);
      }
    }
  }

  return results;
}

/**
 * Fetches all JS/TS source files from a GitHub repository, optionally scoped
 * to a subdirectory.
 */
export async function fetchGithubFiles(
  owner: string,
  repo: string,
  branch: string,
  subdir?: string,
): Promise<SourceFile[]> {
  const headers = buildHeaders();
  const treeUrl = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;

  const response = await fetch(treeUrl, { headers });

  if (response.status === 404) {
    throw new Error(
      `Repository "${owner}/${repo}" or branch "${branch}" not found.`,
    );
  }

  if (response.status === 403) {
    throw new Error(
      "GitHub API rate limit exceeded. Please try again later or set a GITHUB_TOKEN.",
    );
  }

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as TreeResponse;

  if (data.truncated) {
    throw new Error(
      "Repository file tree is too large (truncated by GitHub API). " +
        "Try analyzing a subdirectory instead.",
    );
  }

  let sourcePaths = data.tree
    .filter((entry) => entry.type === "blob" && isSourceFile(entry.path))
    .map((entry) => entry.path);

  if (subdir) {
    const prefix = subdir.endsWith("/") ? subdir : `${subdir}/`;
    sourcePaths = sourcePaths.filter((p) => p.startsWith(prefix));
  }

  return fetchFilesWithConcurrency(owner, repo, branch, sourcePaths);
}
