import 'server-only';
import type { LanguageModel } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

/**
 * Bring-your-own-key model configuration for the docs assistant. Everything comes from
 * environment variables on the server; keys are never sent to the browser.
 *
 *   AI_PROVIDER   anthropic | openai | google | openai-compatible
 *                 (optional: inferred from whichever key is set)
 *   AI_MODEL      model id for that provider (optional: sensible default per provider)
 *
 *   ANTHROPIC_API_KEY              for `anthropic`
 *   OPENAI_API_KEY                 for `openai`
 *   GOOGLE_GENERATIVE_AI_API_KEY   for `google`
 *   AI_BASE_URL + AI_API_KEY       for `openai-compatible` (OpenRouter, Ollama, vLLM,
 *                                  LiteLLM, a Pangolin AI Gateway resource, ...)
 */
export type Provider = 'anthropic' | 'openai' | 'google' | 'openai-compatible';

const defaultModels: Record<Provider, string | undefined> = {
  anthropic: 'claude-opus-5',
  openai: 'gpt-5.6-luna',
  google: 'gemini-2.5-pro',
  'openai-compatible': undefined,
};

function detectProvider(): Provider | undefined {
  const explicit = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (explicit) {
    if (explicit in defaultModels) return explicit as Provider;
    throw new Error(`Unknown AI_PROVIDER "${explicit}"`);
  }
  if (process.env.AI_BASE_URL) return 'openai-compatible';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) return 'google';
  return undefined;
}

export interface ModelConfig {
  provider: Provider;
  modelId: string;
  model: LanguageModel;
}

export class AIConfigError extends Error {}

export function getModel(): ModelConfig {
  const provider = detectProvider();
  if (!provider) {
    throw new AIConfigError(
      'The docs assistant is not configured. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, or AI_BASE_URL + AI_API_KEY on the server.',
    );
  }

  const modelId = process.env.AI_MODEL?.trim() || defaultModels[provider];
  if (!modelId) throw new AIConfigError(`AI_MODEL is required for provider "${provider}".`);

  switch (provider) {
    case 'anthropic':
      return { provider, modelId, model: createAnthropic()(modelId) };
    case 'openai':
      return { provider, modelId, model: createOpenAI()(modelId) };
    case 'google':
      return { provider, modelId, model: createGoogleGenerativeAI()(modelId) };
    case 'openai-compatible': {
      const baseURL = process.env.AI_BASE_URL;
      if (!baseURL) throw new AIConfigError('AI_BASE_URL is required for openai-compatible.');
      const compatible = createOpenAICompatible({
        name: 'custom',
        baseURL,
        apiKey: process.env.AI_API_KEY,
      });
      return { provider, modelId, model: compatible.chatModel(modelId) };
    }
  }
}

export function isAIConfigured() {
  try {
    getModel();
    return true;
  } catch {
    return false;
  }
}
