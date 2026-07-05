interface ModelSelectorProps {
  selectedProviderId: string;
  selectedModelId: string;
  onChange: (providerId: string, modelId: string) => void;
}

const MODES = [
  {
    providerId: 'auto',
    modelId: 'auto',
    label: 'Auto',
    description: 'PETAW choisit le meilleur équilibre entre qualité, vitesse et coût.'
  },
  {
    providerId: 'groq',
    modelId: 'groq-llama-fast',
    label: 'Rapide',
    description: 'Réponses courtes et immédiates pour les demandes simples.'
  },
  {
    providerId: 'deepseek',
    modelId: 'deepseek-chat',
    label: 'Économique',
    description: 'Optimisé pour réduire les coûts sans sacrifier l’essentiel.'
  },
  {
    providerId: 'gemini',
    modelId: 'gemini-flash',
    label: 'Polyvalent',
    description: 'Bon choix pour documents, analyse générale et contexte long.'
  },
  {
    providerId: 'openai',
    modelId: 'gpt-4.1-mini',
    label: 'Premium',
    description: 'À utiliser quand la précision compte plus que le coût.'
  },
  {
    providerId: 'ollama',
    modelId: 'ollama-llama-local',
    label: 'Local',
    description: 'Pour les usages privés ou hors ligne quand un modèle local est disponible.'
  }
];

export function ModelSelector({
  selectedProviderId,
  selectedModelId,
  onChange
}: ModelSelectorProps) {
  const currentMode = MODES.find((mode) => mode.providerId === selectedProviderId && mode.modelId === selectedModelId) ?? MODES[0];

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const [pId, mId] = val.split(':');
    onChange(pId, mId);
  };

  return (
    <div className="model-selector-container">
      <div className="select-wrapper">
        <select
          value={`${selectedProviderId}:${selectedModelId}`}
          onChange={handleSelectChange}
          className="model-select-warm"
          aria-label="Sélectionner le mode PETAW"
        >
          {MODES.map((mode) => (
            <option key={mode.modelId} value={`${mode.providerId}:${mode.modelId}`}>
              {mode.label}
            </option>
          ))}
        </select>
      </div>
      <span className="model-desc-silent">{currentMode.description}</span>
    </div>
  );
}
