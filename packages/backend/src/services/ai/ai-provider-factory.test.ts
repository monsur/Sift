import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockEnv } = vi.hoisted(() => ({
  mockEnv: {
    NODE_ENV: 'test' as const,
    PORT: 3000,
    HOST: '0.0.0.0',
    SUPABASE_URL: 'http://localhost:54321',
    SUPABASE_ANON_KEY: 'test-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
    ANTHROPIC_API_KEY: 'test-anthropic-key',
    AI_PROVIDER: undefined as 'anthropic' | 'openai' | 'gemini' | undefined,
  },
}));

vi.mock('../../config/env.js', () => ({
  env: mockEnv,
}));

// Mock the AnthropicProvider so we don't need the real SDK
vi.mock('./anthropic-provider.js', () => ({
  AnthropicProvider: class MockAnthropicProvider {
    name = 'anthropic';
    apiKey: string;
    constructor(apiKey: string) {
      if (!apiKey) throw new Error('ANTHROPIC_API_KEY is required');
      this.apiKey = apiKey;
    }
  },
}));

import { getAIProvider, resetAIProvider } from './ai-provider-factory.js';

describe('AI Provider Factory', () => {
  beforeEach(() => {
    resetAIProvider();
    mockEnv.AI_PROVIDER = undefined;
    mockEnv.ANTHROPIC_API_KEY = 'test-anthropic-key';
  });

  it('returns AnthropicProvider by default', () => {
    const provider = getAIProvider();
    expect(provider.name).toBe('anthropic');
  });

  it('returns AnthropicProvider when AI_PROVIDER is set to anthropic', () => {
    mockEnv.AI_PROVIDER = 'anthropic';
    const provider = getAIProvider();
    expect(provider.name).toBe('anthropic');
  });

  it('caches the provider instance', () => {
    const first = getAIProvider();
    const second = getAIProvider();
    expect(first).toBe(second);
  });

  it('resets cached provider', () => {
    const first = getAIProvider();
    resetAIProvider();
    const second = getAIProvider();
    expect(first).not.toBe(second);
  });

  it('throws for unimplemented providers', () => {
    mockEnv.AI_PROVIDER = 'openai';
    expect(() => getAIProvider()).toThrow("AI provider 'openai' is not yet implemented");
  });

  it('throws for gemini provider', () => {
    mockEnv.AI_PROVIDER = 'gemini';
    expect(() => getAIProvider()).toThrow("AI provider 'gemini' is not yet implemented");
  });
});
