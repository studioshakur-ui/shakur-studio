interface ModelSelectorProps {
  selectedProviderId: string;
  selectedModelId: string;
  onChange: (providerId: string, modelId: string) => void;
}

const MODES = [
  {
    providerId: 'auto',
    modelId: 'auto',
    label: 'Équilibré',
    description: 'Choix optimal pour la rédaction et la discussion générale.'
  },
  {
    providerId: 'auto',
    modelId: 'fast',
    label: 'Rapide',
    description: 'Vitesse de réponse maximale pour les tâches rapides.'
  },
  {
    providerId: 'auto',
    modelId: 'premium',
    label: 'Expert',
    description: 'Modèles de pointe pour les raisonnements complexes et le code.'
  },
  {
    providerId: 'auto',
    modelId: 'economy',
    label: 'Créatif',
    description: 'Optimisé pour les images et le style rédactionnel expressif.'
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
