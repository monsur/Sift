import { describe, it, expect } from 'vitest';
import type { Entry } from 'shared/types';
import { buildSummarySystemPrompt } from './summary.prompt.js';

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

describe('buildSummarySystemPrompt', () => {
  it('specifies JSON output format', () => {
    const prompt = buildSummarySystemPrompt([]);
    expect(prompt).toContain('JSON object');
    expect(prompt).toContain('"refined_entry"');
    expect(prompt).toContain('"key_moments"');
    expect(prompt).toContain('"tldr"');
    expect(prompt).toContain('"ai_suggested_score"');
    expect(prompt).toContain('"score_justification"');
  });

  it('includes score range', () => {
    const prompt = buildSummarySystemPrompt([]);
    expect(prompt).toContain('1 to 10');
  });

  it('shows "No recent entries" when array is empty', () => {
    const prompt = buildSummarySystemPrompt([]);
    expect(prompt).toContain('No recent entries available.');
  });

  it('formats recent entries with context', () => {
    const prompt = buildSummarySystemPrompt([mockEntry]);
    expect(prompt).toContain('**2026-01-15** (score: 7/10): Productive work day');
  });

  it('instructs first-person writing', () => {
    const prompt = buildSummarySystemPrompt([]);
    expect(prompt).toContain('first person');
  });
});
