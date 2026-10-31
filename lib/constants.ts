export const SOURCE_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".mts",
  ".cts",
] as const;

export const IGNORED_DIRS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "coverage",
  "__tests__",
  ".turbo",
] as const;

export const MAX_SOURCE_FILES = 500;

export const FETCH_CONCURRENCY = 10;

export const GITHUB_API_BASE = "https://api.github.com";

export const GITHUB_RAW_BASE = "https://raw.githubusercontent.com";

export const RATE_LIMIT_MAX = 10;

export const RATE_LIMIT_WINDOW_MS = 60_000;

export const RESOLVE_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  "/index.ts",
  "/index.tsx",
  "/index.js",
  "/index.jsx",
] as const;

export const GITHUB_NAME_REGEX = /^[A-Za-z0-9_.-]+$/;

export const MAX_ZIP_SIZE = 50 * 1024 * 1024;
