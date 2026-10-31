"use client";

import * as React from "react";

export interface GithubFormProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
  className?: string;
}

const GITHUB_URL_PATTERN =
  /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+/i;

/**
 * Form for submitting a public GitHub repository URL.
 */
export function GithubForm({ onSubmit, isLoading = false, className }: GithubFormProps) {
  const [url, setUrl] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const trimmed = url.trim();
  const isValid = GITHUB_URL_PATTERN.test(trimmed);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) {
      setError("Enter a valid GitHub repository URL.");
      return;
    }
    setError(null);
    onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className={["flex flex-col gap-3", className ?? ""].join(" ")}>
      <label htmlFor="github-url" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Repository URL
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="github-url"
          type="url"
          inputMode="url"
          autoComplete="off"
          placeholder="https://github.com/owner/repo"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError(null);
          }}
          disabled={isLoading}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "github-url-error" : undefined}
          className="h-11 flex-1 rounded-lg border border-black/10 bg-white px-3 text-sm outline-none transition-colors focus:border-black/30 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:focus:border-white/30"
        />
        <button
          type="submit"
          disabled={isLoading || !isValid}
          className="h-11 rounded-lg bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {isLoading ? "Analyzing…" : "Analyze"}
        </button>
      </div>
      {error && (
        <p id="github-url-error" role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </form>
  );
}

export default GithubForm;