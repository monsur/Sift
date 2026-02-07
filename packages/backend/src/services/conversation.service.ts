import type {
  AIMessage,
  AIConversationTurnResult,
  Entry,
} from 'shared/types';
import {
  MAX_CONVERSATION_TURNS,
  CONVERSATION_TEMPERATURE,
  CONVERSATION_MAX_TOKENS,
} from 'shared/constants';
import { getAIProvider } from './ai/index.js';
import { buildConversationSystemPrompt } from '../prompts/conversation.prompt.js';

const DONE_SIGNAL = 'DONE_ASKING_QUESTIONS';

export async function startConversation(
  rawEntry: string,
  recentEntries: Entry[]
): Promise<AIConversationTurnResult> {
  const provider = getAIProvider();
  const systemPrompt = buildConversationSystemPrompt(recentEntries);

  const messages: AIMessage[] = [{ role: 'user', content: rawEntry }];

  const response = await provider.complete({
    system_prompt: systemPrompt,
    messages,
    temperature: CONVERSATION_TEMPERATURE,
    max_tokens: CONVERSATION_MAX_TOKENS,
  });

  const isDone = response.content.includes(DONE_SIGNAL);
  const message = response.content.replace(DONE_SIGNAL, '').trim();

  return {
    message,
    is_done: isDone,
    token_usage: response.token_usage,
  };
}

export async function continueConversation(
  rawEntry: string,
  history: AIMessage[],
  userReply: string,
  recentEntries: Entry[]
): Promise<AIConversationTurnResult> {
  const provider = getAIProvider();
  const systemPrompt = buildConversationSystemPrompt(recentEntries);

  // Count assistant turns in existing history
  const assistantTurns = history.filter((m) => m.role === 'assistant').length;

  if (assistantTurns >= MAX_CONVERSATION_TURNS) {
    return {
      message:
        "Thank you for sharing today's reflections. Let me put together a summary for you.",
      is_done: true,
      token_usage: { input_tokens: 0, output_tokens: 0, total_tokens: 0 },
    };
  }

  const messages: AIMessage[] = [
    { role: 'user', content: rawEntry },
    ...history,
    { role: 'user', content: userReply },
  ];

  const response = await provider.complete({
    system_prompt: systemPrompt,
    messages,
    temperature: CONVERSATION_TEMPERATURE,
    max_tokens: CONVERSATION_MAX_TOKENS,
  });

  const isDone = response.content.includes(DONE_SIGNAL);
  const message = response.content.replace(DONE_SIGNAL, '').trim();

  return {
    message,
    is_done: isDone,
    token_usage: response.token_usage,
  };
}
