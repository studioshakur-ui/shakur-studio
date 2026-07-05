import { ModelProvider } from './providerTypes';

export const openaiProvider: ModelProvider = {
  id: 'openai',
  name: 'OpenAI',
  models: [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      description: 'Modèle phare multimodal, extrêmement rapide et créatif.'
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      description: 'Intelligence de pointe pour le raisonnement logique et complexe.'
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      description: 'Modèle léger, ultra-rapide et optimisé pour le chat simple.'
    }
  ]
};
