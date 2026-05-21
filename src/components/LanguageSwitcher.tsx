import { Language } from '../i18n/translations';
import { languages, translate } from '../i18n/config';

interface LanguageSwitcherProps {
  language: Language;
  onChange: (language: Language) => void;
}

const labels: Record<Language, string> = {
  fr: 'FR',
  it: 'IT',
  en: 'EN'
};

export function LanguageSwitcher({ language, onChange }: LanguageSwitcherProps) {
  return (
    <div className="segmented-control" aria-label={translate(language, 'a11y.language')}>
      {languages.map((item) => (
        <button
          key={item}
          type="button"
          className={item === language ? 'active' : ''}
          aria-pressed={item === language}
          onClick={() => onChange(item)}
        >
          {labels[item]}
        </button>
      ))}
    </div>
  );
}
