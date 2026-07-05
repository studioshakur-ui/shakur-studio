import { ModelProvider, Message } from './providerTypes';
import { getSimulatedResponse, simulateStream } from './helpers';

export const groqProvider: ModelProvider = {
  id: 'groq',
  name: 'Groq',
  models: [
    {
      id: 'llama-3-3-70b',
      name: 'Llama 3.3 70B',
      provider: 'groq',
      description: 'Modèle Llama 3.3 exécuté sur les LPU de Groq pour une vitesse d’inférence inégalée.'
    },
    {
      id: 'mixtral-8x7b',
      name: 'Mixtral 8x7B',
      provider: 'groq',
      description: 'Modèle de Mixture-of-Experts (MoE) ultra-rapide et performant en codage.'
    },
    {
      id: 'gemma-2-9b',
      name: 'Gemma 2 9B',
      provider: 'groq',
      description: 'Modèle léger optimisé par Google, idéal pour des retours instantanés.'
    }
  ],
  generateResponse: async (
    modelId: string,
    messages: Message[],
    webSearchEnabled: boolean,
    onProgress: (chunk: string) => void
  ): Promise<string> => {
    const text = getSimulatedResponse('Groq LPU', modelId, messages, webSearchEnabled);
    return simulateStream(text, onProgress);
  }
};
