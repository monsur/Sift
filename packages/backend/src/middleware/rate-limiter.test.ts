import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  checkRateLimit,
  resetRateLimit,
  clearAllRateLimits,
  RATE_LIMITS,
} from './rate-limiter.js';
import { RateLimitError } from '../utils/errors.js';

describe('rate-limiter', () => {
  beforeEach(() => {
    clearAllRateLimits();
  });

  it('allows requests under the limit', () => {
    const config = { maxAttempts: 3, windowMs: 60_000 };
    expect(() => checkRateLimit('test', 'key1', config)).not.toThrow();
    expect(() => checkRateLimit('test', 'key1', config)).not.toThrow();
    expect(() => checkRateLimit('test', 'key1', config)).not.toThrow();
  });

  it('throws RateLimitError when limit exceeded', () => {
    const config = { maxAttempts: 2, windowMs: 60_000 };
    checkRateLimit('test', 'key1', config);
    checkRateLimit('test', 'key1', config);

    expect(() => checkRateLimit('test', 'key1', config)).toThrow(
      RateLimitError
    );
  });

  it('resets window after expiry', () => {
    const config = { maxAttempts: 1, windowMs: 1000 };
    checkRateLimit('test', 'key1', config);

    // Advance time past the window
    vi.useFakeTimers();
    vi.advanceTimersByTime(1001);

    expect(() => checkRateLimit('test', 'key1', config)).not.toThrow();
    vi.useRealTimers();
  });

  it('tracks different keys independently', () => {
    const config = { maxAttempts: 1, windowMs: 60_000 };
    checkRateLimit('test', 'key1', config);
    expect(() => checkRateLimit('test', 'key2', config)).not.toThrow();
  });

  it('tracks different stores independently', () => {
    const config = { maxAttempts: 1, windowMs: 60_000 };
    checkRateLimit('store1', 'key1', config);
    expect(() => checkRateLimit('store2', 'key1', config)).not.toThrow();
  });

  it('resetRateLimit clears a specific key', () => {
    const config = { maxAttempts: 1, windowMs: 60_000 };
    checkRateLimit('test', 'key1', config);

    // Would throw if not reset
    resetRateLimit('test', 'key1');
    expect(() => checkRateLimit('test', 'key1', config)).not.toThrow();
  });

  it('provides retry_after_seconds in error details', () => {
    const config = { maxAttempts: 1, windowMs: 60_000 };
    checkRateLimit('test', 'key1', config);

    try {
      checkRateLimit('test', 'key1', config);
      expect.fail('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(RateLimitError);
      const rateError = error as RateLimitError;
      expect(rateError.details?.retry_after_seconds).toBeGreaterThan(0);
    }
  });

  it('has pre-configured rate limits', () => {
    expect(RATE_LIMITS.login.maxAttempts).toBe(5);
    expect(RATE_LIMITS.login.windowMs).toBe(15 * 60 * 1000);
    expect(RATE_LIMITS.verification.maxAttempts).toBe(3);
    expect(RATE_LIMITS.passwordReset.maxAttempts).toBe(3);
  });
});
