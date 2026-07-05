import { ModelProvider, Message } from './providerTypes';
import { getSimulatedResponse, simulateStream } from './helpers';

export const ollamaProvider: ModelProvider = {
  id: 'ollama',
  name: 'Ollama',
  models: [
    {
      id: 'llama-3-2-local',
      name: 'Llama 3.2 (Local)',
      provider: 'ollama',
      description: 'Exécution locale privée de Llama 3.2, sans connexion Internet requise.'
    },
    {
      id: 'mistral-local',
      name: 'Mistral 7B (Local)',
      provider: 'ollama',
      description: 'Modèle français haute performance exécuté en local.'
    },
    {
      id: 'phi-3-local',
      name: 'Phi-3 (Local)',
      provider: 'ollama',
      description: 'Petit modèle léger de Microsoft optimisé pour le CPU local.'
    }
  ],
  generateResponse: async (
    modelId: string,
    messages: Message[],
    webSearchEnabled: boolean,
    onProgress: (chunk: string) => void
  ): Promise<string> => {
    const text = getSimulatedResponse('Ollama (Local Host)', modelId, messages, webSearchEnabled);
    return simulateStream(text, onProgress);
  }
};
