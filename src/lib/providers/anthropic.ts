import { ModelProvider, Message } from './providerTypes';
import { getSimulatedResponse, simulateStream } from './helpers';

export const anthropicProvider: ModelProvider = {
  id: 'anthropic',
  name: 'Anthropic',
  models: [
    {
      id: 'claude-3-5-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'anthropic',
      description: 'Idéal pour le code, la rédaction complexe et le raisonnement nuancé.'
    },
    {
      id: 'claude-3-5-haiku',
      name: 'Claude 3.5 Haiku',
      provider: 'anthropic',
      description: 'Rapidité exceptionnelle combinée à des capacités d’analyse avancées.'
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      description: 'Raisonnement profond et contextualisé pour les tâches de recherche.'
    }
  ],
  generateResponse: async (
    modelId: string,
    messages: Message[],
    webSearchEnabled: boolean,
    onProgress: (chunk: string) => void
  ): Promise<string> => {
    const text = getSimulatedResponse('Anthropic', modelId, messages, webSearchEnabled);
    return simulateStream(text, onProgress);
  }
};
