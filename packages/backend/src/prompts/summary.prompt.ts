import type { Entry } from 'shared/types';
import { CONTEXT_DAYS, SCORE_MIN, SCORE_MAX } from 'shared/constants';

export function buildSummarySystemPrompt(recentEntries: Entry[]): string {
  const contextBlock = formatRecentEntries(recentEntries);

  return `You are a reflective writing assistant. Given a user's raw journal entry and their conversation transcript, produce a structured summary.

## Output Format

Respond with ONLY a JSON object (no markdown fences, no extra text) containing these exact fields:

{
  "refined_entry": "A well-written narrative version of the user's day, incorporating insights from the conversation. Write in first person. 2-4 paragraphs.",
  "key_moments": ["An array of 2-5 short phrases capturing the most significant moments or themes"],
  "tldr": "A single sentence capturing the essence of the day",
  "ai_suggested_score": <number from ${SCORE_MIN} to ${SCORE_MAX}>,
  "score_justification": "A brief explanation of why this score was suggested, based on the user's own words and feelings"
}

## Guidelines

- The refined_entry should read naturally, as if the user wrote it themselves
- Preserve the user's voice and perspective — don't add emotions they didn't express
- The score should reflect how the user seems to feel about their day, not an objective assessment
- Key moments should be specific, not generic (e.g., "resolved conflict with Alex" not "had interpersonal interaction")
- The tldr should be conversational, not clinical

${contextBlock}`;
}

function formatRecentEntries(entries: Entry[]): string {
  if (entries.length === 0) {
    return '## Recent Context\n\nNo recent entries available.';
  }

  const formatted = entries
    .map((e) => {
      const score = e.score !== null ? ` (score: ${e.score}/10)` : '';
      const text = e.tldr ?? e.raw_entry;
      return `- **${e.entry_date}**${score}: ${text}`;
    })
    .join('\n');

  return `## Recent Context (last ${CONTEXT_DAYS} days)\n\n${formatted}`;
}
