import { parseGithubUrl } from "@/lib/ingest/parseGithubUrl";
import { fetchGithubFiles } from "@/lib/ingest/fetchGithubRepo";
import { analyzeFiles } from "@/lib/analyzer/analyzeDirectory";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { MAX_SOURCE_FILES } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return Response.json(
        { error: "Too many requests. Please wait a minute before trying again." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
          },
        },
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body.url !== "string") {
      return Response.json(
        { error: "Missing or invalid 'url' in request body." },
        { status: 400 },
      );
    }

    const { url, branch: explicitBranch } = body;

    const parsed = parseGithubUrl(url);
    if (!parsed) {
      return Response.json(
        {
          error:
            "Invalid GitHub URL. Must be in the format 'https://github.com/owner/repo' with optional /tree/branch/subdir.",
        },
        { status: 400 },
      );
    }

    const effectiveBranch = explicitBranch?.trim() || parsed.branch;

    let files;
    try {
      files = await fetchGithubFiles(
        parsed.owner,
        parsed.repo,
        effectiveBranch,
        parsed.subdir || undefined,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("not found")) {
        return Response.json(
          { error: `Repository '${parsed.owner}/${parsed.repo}' (branch '${effectiveBranch}') not found or is private.` },
          { status: 404 },
        );
      }
      if (message.includes("rate limit exceeded")) {
        return Response.json(
          { error: "GitHub API rate limit exceeded. Try again later or provide a GITHUB_TOKEN." },
          { status: 429 },
        );
      }
      return Response.json({ error: message }, { status: 500 });
    }

    if (files.length > MAX_SOURCE_FILES) {
      return Response.json(
        {
          error: `Repository contains ${files.length} source files, exceeding the limit of ${MAX_SOURCE_FILES}. Try analyzing a subfolder instead.`,
        },
        { status: 413 },
      );
    }

    if (files.length === 0) {
      return Response.json(
        {
          error:
            "No JavaScript or TypeScript source files found in this repository or path.",
        },
        { status: 400 },
      );
    }

    const result = analyzeFiles(files, {
      owner: parsed.owner,
      name: parsed.repo,
      branch: effectiveBranch,
    });

    return Response.json(result, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
