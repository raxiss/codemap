"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ExploreContent() {
  const searchParams = useSearchParams();
  const source = searchParams.get("source");
  const target = searchParams.get("url") ?? searchParams.get("file");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Explore</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {source ? `Source: ${source}` : "No source selected."}
        {target ? ` (${target})` : ""}
      </p>
      <p className="text-sm text-zinc-500">
        Graph visualization will appear here.
      </p>
    </main>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<main className="mx-auto w-full max-w-3xl px-6 py-16">Loading…</main>}>
      <ExploreContent />
    </Suspense>
  );
}