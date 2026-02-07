import { DEFAULT_AI_PROVIDER } from 'shared/constants';
import type { AIProviderName } from 'shared/constants';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/errors.js';
import type { AIProvider } from './ai-provider.js';
import { AnthropicProvider } from './anthropic-provider.js';

let cachedProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const providerName: AIProviderName =
    env.AI_PROVIDER ?? DEFAULT_AI_PROVIDER;

  switch (providerName) {
    case 'anthropic':
      cachedProvider = new AnthropicProvider(env.ANTHROPIC_API_KEY ?? '');
      break;
    case 'openai':
    case 'gemini':
      throw new AppError(
        `AI provider '${providerName}' is not yet implemented`,
        500,
        'AI_CONFIG_ERROR'
      );
    default:
      throw new AppError(
        `Unknown AI provider: '${providerName as string}'`,
        500,
        'AI_CONFIG_ERROR'
      );
  }

  return cachedProvider;
}

export function resetAIProvider(): void {
  cachedProvider = null;
}
