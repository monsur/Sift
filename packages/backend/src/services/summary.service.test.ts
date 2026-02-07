import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AIMessage, Entry } from 'shared/types';
import type { AIProvider } from './ai/index.js';

const { mockGetAIProvider, mockProvider } = vi.hoisted(() => {
  const mockProvider: AIProvider = {
    name: 'mock',
    complete: vi.fn(),
    estimateCost: vi.fn().mockReturnValue(0.01),
  };
  const mockGetAIProvider = vi.fn().mockReturnValue(mockProvider);
  return { mockGetAIProvider, mockProvider };
});

vi.mock('./ai/index.js', () => ({
  getAIProvider: mockGetAIProvider,
}));

vi.mock('../prompts/summary.prompt.js', () => ({
  buildSummarySystemPrompt: vi.fn().mockReturnValue('summary system prompt'),
}));

import { generateSummary, estimateTotalCost } from './summary.service.js';

const validSummaryJson = JSON.stringify({
  refined_entry: 'Today was a wonderful day.',
  key_moments: ['morning walk', 'lunch with friend'],
  tldr: 'A great day overall',
  ai_suggested_score: 8,
  score_justification: 'Positive outlook throughout the day',
});

const recentEntries: Entry[] = [];

const transcript: AIMessage[] = [
  { role: 'assistant', content: 'How was your day?' },
  { role: 'user', content: 'It was great!' },
];

describe('Summary Service', () => {
  beforeEach(() => {
    vi.mocked(mockProvider.complete).mockReset();
    vi.mocked(mockProvider.estimateCost).mockReset().mockReturnValue(0.01);
  });

  describe('generateSummary', () => {
    it('sends raw entry and transcript to provider', async () => {
      vi.mocked(mockProvider.complete).mockResolvedValue({
        content: validSummaryJson,
        token_usage: {
          input_tokens: 200,
          output_tokens: 100,
          total_tokens: 300,
        },
        model: 'test-model',
      });

      const result = await generateSummary(
        'Had a great day',
        transcript,
        recentEntries
      );

      expect(mockProvider.complete).toHaveBeenCalledWith({
        system_prompt: 'summary system prompt',
        messages: [
          {
            role: 'user',
            content: expect.stringContaining('Had a great day'),
          },
        ],
        temperature: 1.0,
        max_tokens: 2048,
      });

      // Check message includes transcript
      const callArgs = vi.mocked(mockProvider.complete).mock.calls[0]?.[0];
      expect(callArgs?.messages[0]?.content).toContain(
        'assistant: How was your day?'
      );
      expect(callArgs?.messages[0]?.content).toContain(
        'user: It was great!'
      );

      expect(result.summary.refined_entry).toBe(
        'Today was a wonderful day.'
      );
      expect(result.summary.key_moments).toEqual([
        'morning walk',
        'lunch with friend',
      ]);
      expect(result.summary.tldr).toBe('A great day overall');
      expect(result.summary.ai_suggested_score).toBe(8);
      expect(result.token_usage.total_tokens).toBe(300);
    });

    it('clamps score above maximum to 10', async () => {
      const json = JSON.stringify({
        refined_entry: 'Great day.',
        key_moments: ['thing'],
        tldr: 'Good',
        ai_suggested_score: 15,
        score_justification: 'Very positive',
      });

      vi.mocked(mockProvider.complete).mockResolvedValue({
        content: json,
        token_usage: {
          input_tokens: 100,
          output_tokens: 50,
          total_tokens: 150,
        },
        model: 'test-model',
      });

      const result = await generateSummary('Entry', [], []);
      expect(result.summary.ai_suggested_score).toBe(10);
    });

    it('clamps score below minimum to 1', async () => {
      const json = JSON.stringify({
        refined_entry: 'Bad day.',
        key_moments: ['thing'],
        tldr: 'Rough',
        ai_suggested_score: -3,
        score_justification: 'Very negative',
      });

      vi.mocked(mockProvider.complete).mockResolvedValue({
        content: json,
        token_usage: {
          input_tokens: 100,
          output_tokens: 50,
          total_tokens: 150,
        },
        model: 'test-model',
      });

      const result = await generateSummary('Entry', [], []);
      expect(result.summary.ai_suggested_score).toBe(1);
    });

    it('rounds fractional scores', async () => {
      const json = JSON.stringify({
        refined_entry: 'Okay day.',
        key_moments: ['thing'],
        tldr: 'Fine',
        ai_suggested_score: 7.6,
        score_justification: 'Pretty good',
      });

      vi.mocked(mockProvider.complete).mockResolvedValue({
        content: json,
        token_usage: {
          input_tokens: 100,
          output_tokens: 50,
          total_tokens: 150,
        },
        model: 'test-model',
      });

      const result = await generateSummary('Entry', [], []);
      expect(result.summary.ai_suggested_score).toBe(8);
    });

    it('throws on invalid JSON response', async () => {
      vi.mocked(mockProvider.complete).mockResolvedValue({
        content: 'not valid json',
        token_usage: {
          input_tokens: 100,
          output_tokens: 50,
          total_tokens: 150,
        },
        model: 'test-model',
      });

      await expect(
        generateSummary('Entry', [], [])
      ).rejects.toMatchObject({
        code: 'AI_PARSE_ERROR',
      });
    });

    it('throws when required fields are missing', async () => {
      const json = JSON.stringify({
        refined_entry: 'Text',
        // missing key_moments, tldr, etc.
      });

      vi.mocked(mockProvider.complete).mockResolvedValue({
        content: json,
        token_usage: {
          input_tokens: 100,
          output_tokens: 50,
          total_tokens: 150,
        },
        model: 'test-model',
      });

      await expect(
        generateSummary('Entry', [], [])
      ).rejects.toMatchObject({
        code: 'AI_PARSE_ERROR',
      });
    });
  });

  describe('estimateTotalCost', () => {
    it('sums conversation and summary costs', () => {
      vi.mocked(mockProvider.estimateCost)
        .mockReturnValueOnce(0.005)
        .mockReturnValueOnce(0.01);

      const cost = estimateTotalCost(
        { input_tokens: 100, output_tokens: 50, total_tokens: 150 },
        { input_tokens: 200, output_tokens: 100, total_tokens: 300 }
      );

      expect(cost).toBeCloseTo(0.015);
      expect(mockProvider.estimateCost).toHaveBeenCalledTimes(2);
    });
  });
});
