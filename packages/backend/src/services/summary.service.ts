import type {
  AIMessage,
  AISummaryResult,
  AISummaryGenerationResult,
  Entry,
} from 'shared/types';
import {
  SUMMARY_TEMPERATURE,
  SUMMARY_MAX_TOKENS,
  SCORE_MIN,
  SCORE_MAX,
} from 'shared/constants';
import { getAIProvider } from './ai/index.js';
import { buildSummarySystemPrompt } from '../prompts/summary.prompt.js';
import { AppError } from '../utils/errors.js';

export async function generateSummary(
  rawEntry: string,
  transcript: AIMessage[],
  recentEntries: Entry[]
): Promise<AISummaryGenerationResult> {
  const provider = getAIProvider();
  const systemPrompt = buildSummarySystemPrompt(recentEntries);

  const transcriptText = transcript
    .map((m) => `${m.role}: ${m.content}`)
    .join('\n');

  const userMessage = `## Raw Entry\n\n${rawEntry}\n\n## Conversation Transcript\n\n${transcriptText}`;

  const response = await provider.complete({
    system_prompt: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
    temperature: SUMMARY_TEMPERATURE,
    max_tokens: SUMMARY_MAX_TOKENS,
  });

  const summary = parseSummaryResponse(response.content);

  return {
    summary,
    token_usage: response.token_usage,
  };
}

export function estimateTotalCost(
  conversationTokens: { input_tokens: number; output_tokens: number; total_tokens: number },
  summaryTokens: { input_tokens: number; output_tokens: number; total_tokens: number }
): number {
  const provider = getAIProvider();
  return (
    provider.estimateCost(conversationTokens) +
    provider.estimateCost(summaryTokens)
  );
}

function parseSummaryResponse(content: string): AISummaryResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new AppError(
      'Failed to parse AI summary response as JSON',
      502,
      'AI_PARSE_ERROR'
    );
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new AppError(
      'AI summary response is not a valid object',
      502,
      'AI_PARSE_ERROR'
    );
  }

  const obj = parsed as Record<string, unknown>;

  if (typeof obj.refined_entry !== 'string') {
    throw new AppError(
      'AI summary missing refined_entry',
      502,
      'AI_PARSE_ERROR'
    );
  }

  if (!Array.isArray(obj.key_moments)) {
    throw new AppError(
      'AI summary missing key_moments array',
      502,
      'AI_PARSE_ERROR'
    );
  }

  if (typeof obj.tldr !== 'string') {
    throw new AppError('AI summary missing tldr', 502, 'AI_PARSE_ERROR');
  }

  if (typeof obj.ai_suggested_score !== 'number') {
    throw new AppError(
      'AI summary missing ai_suggested_score',
      502,
      'AI_PARSE_ERROR'
    );
  }

  if (typeof obj.score_justification !== 'string') {
    throw new AppError(
      'AI summary missing score_justification',
      502,
      'AI_PARSE_ERROR'
    );
  }

  // Clamp score to valid range
  const clampedScore = Math.min(
    SCORE_MAX,
    Math.max(SCORE_MIN, Math.round(obj.ai_suggested_score))
  );

  return {
    refined_entry: obj.refined_entry,
    key_moments: obj.key_moments as string[],
    tldr: obj.tldr,
    ai_suggested_score: clampedScore,
    score_justification: obj.score_justification,
  };
}
