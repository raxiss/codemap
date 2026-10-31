"use client";

import * as React from "react";

export type ProgressStageItem = string | { id?: string; label: string };

export interface ProgressStagesProps {
  stages: ProgressStageItem[];
  /** Index of the stage currently in progress. -1 = idle, stages.length = done. */
  current: number;
  className?: string;
}

/**
 * Horizontal stepper used to communicate analysis progress.
 */
export function ProgressStages({ stages, current, className }: ProgressStagesProps) {
  const normalized = stages.map((stage, index) => {
    if (typeof stage === "string") {
      return { id: String(index), label: stage };
    }
    return { id: stage.id ?? String(index), label: stage.label };
  });

  return (
    <ol
      aria-label="Analysis progress"
      className={["flex flex-col gap-3 sm:flex-row sm:items-center", className ?? ""].join(" ")}
    >
      {normalized.map((stage, index) => {
        const state: "done" | "active" | "pending" =
          index < current ? "done" : index === current ? "active" : "pending";
        return (
          <li key={stage.id} className="flex items-center gap-2 sm:flex-1">
            <span
              aria-current={state === "active" ? "step" : undefined}
              className={[
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                state === "done"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : state === "active"
                    ? "border-2 border-black text-black dark:border-white dark:text-white"
                    : "border border-black/15 text-zinc-400 dark:border-white/15",
              ].join(" ")}
            >
              {state === "done" ? "✓" : index + 1}
            </span>
            <span
              className={[
                "text-sm",
                state === "active"
                  ? "font-medium text-black dark:text-white"
                  : state === "done"
                    ? "text-zinc-600 dark:text-zinc-400"
                    : "text-zinc-400 dark:text-zinc-600",
              ].join(" ")}
            >
              {stage.label}
            </span>
            {index < normalized.length - 1 && (
              <span
                aria-hidden="true"
                className="hidden h-px flex-1 bg-black/10 sm:block dark:bg-white/10"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default ProgressStages;