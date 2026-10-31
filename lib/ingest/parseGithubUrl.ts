import { GITHUB_NAME_REGEX } from "@/lib/constants";

export interface ParsedGithubUrl {
  owner: string;
  repo: string;
  branch: string;
  subdir: string;
}

/**
 * Parses a github.com repository URL, including optional
 * `/tree/<branch>/<subdir>` segments.
 */
export function parseGithubUrl(url: string): ParsedGithubUrl | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  let normalised = trimmed;
  if (!/^https?:\/\//i.test(normalised)) {
    normalised = `https://${normalised}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalised);
  } catch {
    return null;
  }

  if (parsed.hostname !== "github.com" && parsed.hostname !== "www.github.com") {
    return null;
  }

  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments.length < 2) return null;

  const owner = segments[0];
  const repo = segments[1].replace(/\.git$/, "");

  if (!GITHUB_NAME_REGEX.test(owner) || !GITHUB_NAME_REGEX.test(repo)) {
    return null;
  }

  let branch = "main";
  let subdir = "";

  if (segments.length > 2) {
    if (segments[2] !== "tree") {
      return null;
    }

    if (segments.length < 4) {
      return null;
    }

    branch = segments[3];

    if (segments.length > 4) {
      subdir = segments.slice(4).join("/");
    }
  }

  return { owner, repo, branch, subdir };
}
