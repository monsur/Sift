import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AIMessage, Entry } from 'shared/types';
import type { AIProvider } from './ai/index.js';

const { mockGetAIProvider, mockProvider } = vi.hoisted(() => {
  const mockProvider: AIProvider = {
    name: 'mock',
    complete: vi.fn(),
    estimateCost: vi.fn().mockReturnValue(0),
  };
  const mockGetAIProvider = vi.fn().mockReturnValue(mockProvider);
  return { mockGetAIProvider, mockProvider };
});

vi.mock('./ai/index.js', () => ({
  getAIProvider: mockGetAIProvider,
}));

vi.mock('../prompts/conversation.prompt.js', () => ({
  buildConversationSystemPrompt: vi.fn().mockReturnValue('system prompt'),
}));

import {
  startConversation,
  continueConversation,
} from './conversation.service.js';

const recentEntries: Entry[] = [];

describe('Conversation Service', () => {
  beforeEach(() => {
    vi.mocked(mockProvider.complete).mockReset();
  });

  describe('startConversation', () => {
    it('sends raw entry as first user message', async () => {
      vi.mocked(mockProvider.complete).mockResolvedValue({
        content: 'How did that make you feel?',
        token_usage: { input_tokens: 50, output_tokens: 20, total_tokens: 70 },
        model: 'test-model',
      });

      const result = await startConversation('Had a great day', recentEntries);

      expect(mockProvider.complete).toHaveBeenCalledWith({
        system_prompt: 'system prompt',
        messages: [{ role: 'user', content: 'Had a great day' }],
        temperature: 0.7,
        max_tokens: 1024,
      });
      expect(result.message).toBe('How did that make you feel?');
      expect(result.is_done).toBe(false);
      expect(result.token_usage.total_tokens).toBe(70);
    });

    it('detects DONE_ASKING_QUESTIONS signal', async () => {
      vi.mocked(mockProvider.complete).mockResolvedValue({
        content:
          "That sounds like a wonderful day!\nDONE_ASKING_QUESTIONS",
        token_usage: { input_tokens: 50, output_tokens: 20, total_tokens: 70 },
        model: 'test-model',
      });

      const result = await startConversation('Had a great day', recentEntries);

      expect(result.is_done).toBe(true);
      expect(result.message).toBe('That sounds like a wonderful day!');
      expect(result.message).not.toContain('DONE_ASKING_QUESTIONS');
    });
  });

  describe('continueConversation', () => {
    it('appends user reply to conversation history', async () => {
      vi.mocked(mockProvider.complete).mockResolvedValue({
        content: 'Tell me more.',
        token_usage: { input_tokens: 80, output_tokens: 10, total_tokens: 90 },
        model: 'test-model',
      });

      const history: AIMessage[] = [
        { role: 'assistant', content: 'How was your day?' },
      ];

      const result = await continueConversation(
        'Had a great day',
        history,
        'It was really good',
        recentEntries
      );

      expect(mockProvider.complete).toHaveBeenCalledWith({
        system_prompt: 'system prompt',
        messages: [
          { role: 'user', content: 'Had a great day' },
          { role: 'assistant', content: 'How was your day?' },
          { role: 'user', content: 'It was really good' },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      });
      expect(result.message).toBe('Tell me more.');
      expect(result.is_done).toBe(false);
    });

    it('enforces max conversation turns', async () => {
      const history: AIMessage[] = [];
      for (let i = 0; i < 5; i++) {
        history.push({ role: 'assistant', content: `Question ${i + 1}` });
        history.push({ role: 'user', content: `Answer ${i + 1}` });
      }

      const result = await continueConversation(
        'Had a great day',
        history,
        'Another reply',
        recentEntries
      );

      expect(mockProvider.complete).not.toHaveBeenCalled();
      expect(result.is_done).toBe(true);
      expect(result.token_usage.total_tokens).toBe(0);
    });

    it('detects done signal in continued conversation', async () => {
      vi.mocked(mockProvider.complete).mockResolvedValue({
        content: 'Great reflection! DONE_ASKING_QUESTIONS',
        token_usage: { input_tokens: 100, output_tokens: 15, total_tokens: 115 },
        model: 'test-model',
      });

      const history: AIMessage[] = [
        { role: 'assistant', content: 'How was your day?' },
      ];

      const result = await continueConversation(
        'Had a great day',
        history,
        'It was good',
        recentEntries
      );

      expect(result.is_done).toBe(true);
      expect(result.message).toBe('Great reflection!');
    });
  });
});
