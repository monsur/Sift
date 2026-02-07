import { RateLimitError } from '../utils/errors.js';

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
}

interface RateLimiterConfig {
  maxAttempts: number;
  windowMs: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

function getStore(name: string): Map<string, RateLimitEntry> {
  let store = stores.get(name);
  if (!store) {
    store = new Map();
    stores.set(name, store);
  }
  return store;
}

export function checkRateLimit(
  name: string,
  key: string,
  config: RateLimiterConfig
): void {
  const store = getStore(name);
  const now = Date.now();
  const entry = store.get(key);

  if (!entry) {
    store.set(key, { count: 1, firstAttempt: now });
    return;
  }

  // Window expired, reset
  if (now - entry.firstAttempt > config.windowMs) {
    store.set(key, { count: 1, firstAttempt: now });
    return;
  }

  if (entry.count >= config.maxAttempts) {
    const retryAfterMs = config.windowMs - (now - entry.firstAttempt);
    throw new RateLimitError(Math.ceil(retryAfterMs / 1000));
  }

  entry.count++;
}

/**
 * Reset a rate limit entry (e.g., after successful login).
 */
export function resetRateLimit(name: string, key: string): void {
  const store = stores.get(name);
  store?.delete(key);
}

/**
 * Clear all rate limit stores. Useful for testing.
 */
export function clearAllRateLimits(): void {
  stores.clear();
}

// Pre-configured rate limit configs
export const RATE_LIMITS = {
  login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 min
  verification: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  passwordReset: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
} as const;

// Periodic cleanup every 15 minutes
const CLEANUP_INTERVAL = 15 * 60 * 1000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

export function startCleanup(): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const store of stores.values()) {
      for (const [key, entry] of store) {
        // Clean entries older than 1 hour (max window)
        if (now - entry.firstAttempt > 60 * 60 * 1000) {
          store.delete(key);
        }
      }
    }
  }, CLEANUP_INTERVAL);
  cleanupTimer.unref();
}

export function stopCleanup(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
}
