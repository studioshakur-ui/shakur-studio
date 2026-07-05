import { ModelProvider, ModelConfig } from './providers/providerTypes';
import { openaiProvider } from './providers/openai';
import { anthropicProvider } from './providers/anthropic';
import { geminiProvider } from './providers/gemini';
import { deepseekProvider } from './providers/deepseek';
import { groqProvider } from './providers/groq';
import { ollamaProvider } from './providers/ollama';

// List of all model providers
export const providers: ModelProvider[] = [
  openaiProvider,
  anthropicProvider,
  geminiProvider,
  deepseekProvider,
  groqProvider,
  ollamaProvider
];

// Flat list of all models
export const allModels: ModelConfig[] = providers.reduce<ModelConfig[]>((acc, provider) => {
  return [...acc, ...provider.models];
}, []);

// Get a model config by ID
export function getModelById(modelId: string): ModelConfig | undefined {
  return allModels.find(m => m.id === modelId);
}

// Get the default model config (Gemini 2.5 Flash as standard fast multimodal scale)
export const DEFAULT_MODEL_ID = 'gemini-2-5-flash';
