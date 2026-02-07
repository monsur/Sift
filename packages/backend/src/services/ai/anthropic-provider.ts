import Anthropic from '@anthropic-ai/sdk';
import {
  APIError,
  RateLimitError as AnthropicRateLimitError,
  AuthenticationError,
} from '@anthropic-ai/sdk';
import type { AITokenUsage } from 'shared/types';
import { AI_MODEL } from 'shared/constants';
import { AppError } from '../../utils/errors.js';
import type {
  AIProvider,
  AICompletionRequest,
  AICompletionResponse,
} from './ai-provider.js';

// Claude Sonnet pricing per 1M tokens
const INPUT_COST_PER_MILLION = 3;
const OUTPUT_COST_PER_MILLION = 15;

export class AnthropicProvider implements AIProvider {
  readonly name = 'anthropic';
  private client: Anthropic;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new AppError(
        'ANTHROPIC_API_KEY is required',
        500,
        'AI_CONFIG_ERROR'
      );
    }
    this.client = new Anthropic({ apiKey });
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    try {
      const response = await this.client.messages.create({
        model: AI_MODEL,
        max_tokens: request.max_tokens,
        temperature: request.temperature,
        system: request.system_prompt,
        messages: request.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      const textContent = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('');

      return {
        content: textContent,
        token_usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens,
          total_tokens:
            response.usage.input_tokens + response.usage.output_tokens,
        },
        model: response.model,
      };
    } catch (error) {
      throw this.mapError(error);
    }
  }

  estimateCost(usage: AITokenUsage): number {
    const inputCost = (usage.input_tokens / 1_000_000) * INPUT_COST_PER_MILLION;
    const outputCost =
      (usage.output_tokens / 1_000_000) * OUTPUT_COST_PER_MILLION;
    return inputCost + outputCost;
  }

  private mapError(error: unknown): AppError {
    if (error instanceof AnthropicRateLimitError) {
      return new AppError(
        'AI rate limit exceeded',
        429,
        'AI_RATE_LIMIT'
      );
    }
    if (error instanceof AuthenticationError) {
      return new AppError(
        'AI authentication failed',
        500,
        'AI_AUTH_ERROR'
      );
    }
    if (error instanceof APIError) {
      return new AppError(
        `AI provider error: ${error.message}`,
        502,
        'AI_PROVIDER_ERROR'
      );
    }
    return new AppError(
      'Unexpected AI error',
      502,
      'AI_PROVIDER_ERROR'
    );
  }
}
