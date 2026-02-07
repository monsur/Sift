import { describe, it, expect } from 'vitest';
import type { Entry } from 'shared/types';
import { buildConversationSystemPrompt } from './conversation.prompt.js';

const mockEntry: Entry = {
  id: 'entry-1',
  user_id: 'user-1',
  entry_date: '2026-01-15',
  raw_entry: 'Had a productive day at work.',
  refined_entry: null,
  tldr: 'Productive work day',
  key_moments: null,
  score: 7,
  ai_suggested_score: null,
  score_justification: null,
  input_method: 'text',
  voice_duration_seconds: null,
  conversation_transcript: null,
  token_count: null,
  estimated_cost: null,
  created_at: '2026-01-15T00:00:00Z',
  updated_at: '2026-01-15T00:00:00Z',
};

describe('buildConversationSystemPrompt', () => {
  it('includes DONE_ASKING_QUESTIONS signal instruction', () => {
    const prompt = buildConversationSystemPrompt([]);
    expect(prompt).toContain('DONE_ASKING_QUESTIONS');
  });

  it('includes reflection companion role', () => {
    const prompt = buildConversationSystemPrompt([]);
    expect(prompt).toContain('daily reflection companion');
  });

  it('shows "No recent entries" when array is empty', () => {
    const prompt = buildConversationSystemPrompt([]);
    expect(prompt).toContain('No recent entries available.');
  });

  it('formats recent entries with date and score', () => {
    const prompt = buildConversationSystemPrompt([mockEntry]);
    expect(prompt).toContain('**2026-01-15** (score: 7/10): Productive work day');
  });

  it('uses raw_entry when tldr is null', () => {
    const entryNoTldr = { ...mockEntry, tldr: null };
    const prompt = buildConversationSystemPrompt([entryNoTldr]);
    expect(prompt).toContain('Had a productive day at work.');
  });

  it('omits score when null', () => {
    const entryNoScore = { ...mockEntry, score: null };
    const prompt = buildConversationSystemPrompt([entryNoScore]);
    expect(prompt).toContain('**2026-01-15**: Productive work day');
    expect(prompt).not.toContain('score:');
  });
});
