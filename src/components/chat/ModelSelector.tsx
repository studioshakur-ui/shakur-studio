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
    description: 'ShakurOS choisit le meilleur équilibre entre qualité, vitesse et coût.'
  },
  {
    providerId: 'auto',
    modelId: 'fast',
    label: 'Rapide',
    description: 'Priorité à la vitesse pour les demandes simples.'
  },
  {
    providerId: 'auto',
    modelId: 'economy',
    label: 'Économique',
    description: 'Priorité au coût bas avec fallback si nécessaire.'
  },
  {
    providerId: 'auto',
    modelId: 'premium',
    label: 'Premium',
    description: 'Priorité à la qualité pour les tâches importantes.'
  },
  {
    providerId: 'auto',
    modelId: 'local',
    label: 'Local',
    description: 'Priorité aux modèles locaux quand ils sont disponibles.'
  }
];

export function ModelSelector({
  selectedProviderId,
  selectedModelId,
  onChange
}: ModelSelectorProps) {
  const currentMode = MODES.find((mode) => mode.providerId === selectedProviderId && mode.modelId === selectedModelId) ?? MODES[0];

  return (
    <div className="model-selector-container" aria-label="Sélectionner le mode PETAW">
      <div className="mode-rail-warm" role="radiogroup">
        {MODES.map((mode) => {
          const isActive = currentMode.modelId === mode.modelId;
          return (
            <button
              key={mode.modelId}
              type="button"
              role="radio"
              aria-checked={isActive}
              className={`mode-rail-item-warm ${isActive ? 'active' : ''}`}
              title={mode.description}
              onClick={() => onChange(mode.providerId, mode.modelId)}
            >
              {mode.label}
            </button>
          );
        })}
      </div>
      <span className="model-desc-silent">{currentMode.description}</span>
    </div>
  );
}
