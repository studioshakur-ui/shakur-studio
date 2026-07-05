import { translate } from '../../i18n/config';
import { Language } from '../../i18n/translations';

interface QuickActionsProps {
  language: Language;
  onSelectAction: (actionKey: 'ask' | 'upload' | 'search' | 'continue') => void;
}

export function QuickActions({ language, onSelectAction }: QuickActionsProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  const actions = [
    { id: 'ask' as const, label: t('chat.action.ask.title') },
    { id: 'upload' as const, label: t('chat.action.upload.title') },
    { id: 'search' as const, label: t('chat.action.search.title') },
    { id: 'continue' as const, label: t('chat.action.continue.title') }
  ];

  return (
    <div className="quick-actions-text-row">
      {actions.map((act) => (
        <button
          key={act.id}
          onClick={() => onSelectAction(act.id)}
          className="quick-action-text-btn"
          type="button"
        >
          <span>{act.label}</span>
        </button>
      ))}
    </div>
  );
}
