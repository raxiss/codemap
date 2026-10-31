import { extractZip } from "@/lib/ingest/extractZip";
import { analyzeFiles } from "@/lib/analyzer/analyzeDirectory";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { MAX_SOURCE_FILES, MAX_ZIP_SIZE } from "@/lib/constants";

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
        { status: 429 },
      );
    }

    const contentType = request.headers.get("content-type") || "";
    let buffer: Buffer;
    let filename = "uploaded-repo";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return Response.json({ error: "No ZIP file uploaded." }, { status: 400 });
      }
      if (file.size > MAX_ZIP_SIZE) {
        return Response.json(
          { error: `File size exceeds the limit of ${MAX_ZIP_SIZE / (1024 * 1024)} MB.` },
          { status: 413 },
        );
      }
      filename = file.name.replace(/\.zip$/i, "") || "uploaded-repo";
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      const arrayBuffer = await request.arrayBuffer();
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        return Response.json({ error: "Empty request body." }, { status: 400 });
      }
      if (arrayBuffer.byteLength > MAX_ZIP_SIZE) {
        return Response.json(
          { error: `File size exceeds the limit of ${MAX_ZIP_SIZE / (1024 * 1024)} MB.` },
          { status: 413 },
        );
      }
      buffer = Buffer.from(arrayBuffer);
    }

    let files;
    try {
      files = extractZip(buffer);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to extract ZIP";
      return Response.json({ error: `Corrupted or invalid ZIP file: ${message}` }, { status: 400 });
    }

    if (files.length === 0) {
      return Response.json(
        { error: "No JavaScript or TypeScript source files found in the ZIP archive." },
        { status: 400 },
      );
    }

    if (files.length > MAX_SOURCE_FILES) {
      return Response.json(
        {
          error: `ZIP archive contains ${files.length} source files, exceeding the limit of ${MAX_SOURCE_FILES}.`,
        },
        { status: 413 },
      );
    }

    const result = analyzeFiles(files, {
      owner: "local",
      name: filename,
      branch: "main",
    });

    return Response.json(result, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
