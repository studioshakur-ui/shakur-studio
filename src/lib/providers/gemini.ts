import { ModelProvider } from './providerTypes';

export const geminiProvider: ModelProvider = {
  id: 'gemini',
  name: 'Gemini',
  models: [
    {
      id: 'gemini-2-5-pro',
      name: 'Gemini 2.5 Pro',
      provider: 'gemini',
      description: 'Grand modèle multimodal avec une fenêtre de contexte de 2 millions de tokens.'
    },
    {
      id: 'gemini-2-5-flash',
      name: 'Gemini 2.5 Flash',
      provider: 'gemini',
      description: 'Vitesse fulgurante, optimisée pour le traitement multimodal à grande échelle.'
    },
    {
      id: 'gemini-1-5-flash',
      name: 'Gemini 1.5 Flash',
      provider: 'gemini',
      description: 'Modèle léger et très économique pour des réponses instantanées.'
    }
  ]
};
