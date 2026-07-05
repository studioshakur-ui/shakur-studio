import { ModelProvider } from './providerTypes';

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
  ]
};
