import type { AIMessage, AITokenUsage } from 'shared/types';

export interface AICompletionRequest {
  system_prompt: string;
  messages: AIMessage[];
  temperature: number;
  max_tokens: number;
}

export interface AICompletionResponse {
  content: string;
  token_usage: AITokenUsage;
  model: string;
}

export interface AIProvider {
  readonly name: string;
  complete(request: AICompletionRequest): Promise<AICompletionResponse>;
  estimateCost(usage: AITokenUsage): number;
}
