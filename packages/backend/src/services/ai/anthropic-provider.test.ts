import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AICompletionRequest } from './ai-provider.js';

const { mockCreate, MockAPIError, MockRateLimitError, MockAuthError } =
  vi.hoisted(() => {
    const mockCreate = vi.fn();

    class MockAPIError extends Error {
      status: number;
      constructor(status: number, message: string) {
        super(message);
        this.status = status;
        this.name = 'APIError';
      }
    }

    class MockRateLimitError extends MockAPIError {
      constructor() {
        super(429, 'Rate limited');
        this.name = 'RateLimitError';
      }
    }

    class MockAuthError extends MockAPIError {
      constructor() {
        super(401, 'Invalid API key');
        this.name = 'AuthenticationError';
      }
    }

    return { mockCreate, MockAPIError, MockRateLimitError, MockAuthError };
  });

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages: { create: typeof mockCreate };
      constructor() {
        this.messages = { create: mockCreate };
      }
    },
    APIError: MockAPIError,
    RateLimitError: MockRateLimitError,
    AuthenticationError: MockAuthError,
  };
});

import { AnthropicProvider } from './anthropic-provider.js';

const baseRequest: AICompletionRequest = {
  system_prompt: 'You are a helpful assistant.',
  messages: [{ role: 'user', content: 'Hello' }],
  temperature: 0.7,
  max_tokens: 1024,
};

describe('AnthropicProvider', () => {
  let provider: AnthropicProvider;

  beforeEach(() => {
    mockCreate.mockReset();
    provider = new AnthropicProvider('test-api-key');
  });

  it('throws if API key is empty', () => {
    expect(() => new AnthropicProvider('')).toThrow('ANTHROPIC_API_KEY is required');
  });

  describe('complete', () => {
    it('maps request and response correctly', async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: 'Hello back!' }],
        usage: { input_tokens: 10, output_tokens: 5 },
        model: 'claude-sonnet-4-20250514',
      });

      const result = await provider.complete(baseRequest);

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        temperature: 0.7,
        system: 'You are a helpful assistant.',
        messages: [{ role: 'user', content: 'Hello' }],
      });
      expect(result.content).toBe('Hello back!');
      expect(result.token_usage).toEqual({
        input_tokens: 10,
        output_tokens: 5,
        total_tokens: 15,
      });
      expect(result.model).toBe('claude-sonnet-4-20250514');
    });

    it('concatenates multiple text blocks', async () => {
      mockCreate.mockResolvedValue({
        content: [
          { type: 'text', text: 'Part 1. ' },
          { type: 'text', text: 'Part 2.' },
        ],
        usage: { input_tokens: 10, output_tokens: 10 },
        model: 'claude-sonnet-4-20250514',
      });

      const result = await provider.complete(baseRequest);
      expect(result.content).toBe('Part 1. Part 2.');
    });

    it('maps rate limit errors to 429', async () => {
      mockCreate.mockRejectedValue(new MockRateLimitError());

      await expect(provider.complete(baseRequest)).rejects.toMatchObject({
        statusCode: 429,
        code: 'AI_RATE_LIMIT',
      });
    });

    it('maps auth errors to 500', async () => {
      mockCreate.mockRejectedValue(new MockAuthError());

      await expect(provider.complete(baseRequest)).rejects.toMatchObject({
        statusCode: 500,
        code: 'AI_AUTH_ERROR',
      });
    });

    it('maps generic API errors to 502', async () => {
      mockCreate.mockRejectedValue(new MockAPIError(500, 'Internal error'));

      await expect(provider.complete(baseRequest)).rejects.toMatchObject({
        statusCode: 502,
        code: 'AI_PROVIDER_ERROR',
      });
    });

    it('maps unknown errors to 502', async () => {
      mockCreate.mockRejectedValue(new Error('Network failure'));

      await expect(provider.complete(baseRequest)).rejects.toMatchObject({
        statusCode: 502,
        code: 'AI_PROVIDER_ERROR',
      });
    });
  });

  describe('estimateCost', () => {
    it('calculates cost based on Sonnet pricing', () => {
      const cost = provider.estimateCost({
        input_tokens: 1_000_000,
        output_tokens: 1_000_000,
        total_tokens: 2_000_000,
      });

      // $3/1M input + $15/1M output = $18
      expect(cost).toBe(18);
    });

    it('calculates cost for small usage', () => {
      const cost = provider.estimateCost({
        input_tokens: 1000,
        output_tokens: 500,
        total_tokens: 1500,
      });

      // (1000/1M * 3) + (500/1M * 15) = 0.003 + 0.0075 = 0.0105
      expect(cost).toBeCloseTo(0.0105);
    });
  });
});
