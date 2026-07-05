import { ModelProvider, Message } from './providerTypes';
import { getSimulatedResponse, simulateStream } from './helpers';

export const deepseekProvider: ModelProvider = {
  id: 'deepseek',
  name: 'DeepSeek',
  models: [
    {
      id: 'deepseek-v3',
      name: 'DeepSeek-V3',
      provider: 'deepseek',
      description: 'Modèle de chat ultra-efficace basé sur une architecture Mixture-of-Experts (MoE).'
    },
    {
      id: 'deepseek-r1',
      name: 'DeepSeek-R1',
      provider: 'deepseek',
      description: 'Modèle de raisonnement avancé qui génère des chaînes de pensée de type o1.'
    }
  ],
  generateResponse: async (
    modelId: string,
    messages: Message[],
    webSearchEnabled: boolean,
    onProgress: (chunk: string) => void
  ): Promise<string> => {
    // For DeepSeek-R1, prepend some chain-of-thought thinking
    let text = getSimulatedResponse('DeepSeek', modelId, messages, webSearchEnabled);
    if (modelId === 'deepseek-r1') {
      const thinking = `[Chaîne de Pensée - Raisonnement DeepSeek-R1]\n> Analyse de la requête utilisateur...\n> Langue détectée et adaptée aux contextes locaux...\n> Synthèse logique et structuration de la réponse finale...\n\n`;
      text = thinking + text;
    }
    return simulateStream(text, onProgress);
  }
};
