import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from "@/lib/constants";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

const store = new Map<string, number[]>();

let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function ensureCleanup(): void {
  if (cleanupInterval !== null) return;

  cleanupInterval = setInterval(() => {
    const now = Date.now();
    const cutoff = now - RATE_LIMIT_WINDOW_MS;

    for (const [ip, timestamps] of store) {
      const valid = timestamps.filter((t) => t > cutoff);
      if (valid.length === 0) {
        store.delete(ip);
      } else {
        store.set(ip, valid);
      }
    }
  }, RATE_LIMIT_WINDOW_MS);

  // Allow the process to exit even if the interval is still active
  if (cleanupInterval && typeof cleanupInterval === "object" && "unref" in cleanupInterval) {
    cleanupInterval.unref();
  }
}

export function checkRateLimit(ip: string): RateLimitResult {
  ensureCleanup();

  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;

  const timestamps = (store.get(ip) ?? []).filter((t) => t > cutoff);

  const resetAt = timestamps.length > 0
    ? timestamps[0] + RATE_LIMIT_WINDOW_MS
    : now + RATE_LIMIT_WINDOW_MS;

  if (timestamps.length >= RATE_LIMIT_MAX) {
    // Denied requests are not recorded.
    store.set(ip, timestamps);
    return {
      allowed: false,
      remaining: 0,
      resetAt,
    };
  }

  timestamps.push(now);
  store.set(ip, timestamps);

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX - timestamps.length,
    resetAt,
  };
}
