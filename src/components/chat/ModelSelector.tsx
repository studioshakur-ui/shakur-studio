import { providers, getModelById } from '../../lib/modelRouter';

interface ModelSelectorProps {
  selectedProviderId: string;
  selectedModelId: string;
  onChange: (providerId: string, modelId: string) => void;
}

const HUMAN_LABELS: Record<string, string> = {
  // Gemini
  'gemini-2-5-flash': 'Gemini (Recommandé)',
  'gemini-2-5-pro': 'Gemini Pro (Grand Contexte)',
  'gemini-1-5-flash': 'Gemini Light',
  // OpenAI
  'gpt-4o': 'GPT-4o (Flagship)',
  'gpt-4-turbo': 'GPT-4 (Logique)',
  'gpt-3.5-turbo': 'GPT-3.5 (Vitesse)',
  // Anthropic
  'claude-3-5-sonnet': 'Claude (Code & Analyse)',
  'claude-3-5-haiku': 'Claude Haiku',
  'claude-3-opus': 'Claude Opus (Recherche)',
  // DeepSeek
  'deepseek-v3': 'DeepSeek V3',
  'deepseek-r1': 'DeepSeek R1 (Raisonnement)',
  // Groq
  'llama-3-3-70b': 'Llama 3.3 (LPU Rapide)',
  'mixtral-8x7b': 'Mixtral (LPU)',
  'gemma-2-9b': 'Gemma 2 (LPU)',
  // Local
  'llama-3-2-local': 'Llama Local (Privé)',
  'mistral-local': 'Mistral Local (Privé)',
  'phi-3-local': 'Phi-3 Local'
};

export function ModelSelector({
  selectedProviderId,
  selectedModelId,
  onChange
}: ModelSelectorProps) {
  const currentModel = getModelById(selectedModelId);

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
          aria-label="Sélectionner le modèle d'IA"
        >
          {providers.map((provider) => (
            <optgroup key={provider.id} label={provider.name}>
              {provider.models.map((model) => (
                <option key={model.id} value={`${provider.id}:${model.id}`}>
                  {HUMAN_LABELS[model.id] || model.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      {currentModel && (
        <span className="model-desc-silent">
          {currentModel.description}
        </span>
      )}
    </div>
  );
}
