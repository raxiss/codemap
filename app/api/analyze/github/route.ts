import { NextResponse } from "next/server";

interface Body {
  url?: string;
}

const GITHUB_URL_PATTERN =
  /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+/i;

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const url = body.url?.trim();
  if (!url || !GITHUB_URL_PATTERN.test(url)) {
    return NextResponse.json(
      { error: "A valid GitHub repository URL is required." },
      { status: 400 },
    );
  }

  // Analysis pipeline is wired up on the client for now; this endpoint validates input.
  return NextResponse.json({ ok: true, url });
}