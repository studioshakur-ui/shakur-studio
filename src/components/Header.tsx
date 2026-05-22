import { Language } from '../i18n/translations';
import { translate } from '../i18n/config';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  language: Language;
  theme: 'dark' | 'light';
  onLanguageChange: (language: Language) => void;
  onThemeToggle: () => void;
}

export function Header({ language, theme, onLanguageChange, onThemeToggle }: HeaderProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label={t('a11y.brand')}>
        <strong>SHAKUR</strong><span>STUDIO</span>
      </a>
      <nav className="desktop-nav" aria-label={t('a11y.nav')}>
        <a href="#flow">{t('nav.flow')}</a>
        <a href="#agents">{t('nav.agents')}</a>
        <a href="#contact">{t('nav.contact')}</a>
      </nav>
      <div className="header-actions">
        <LanguageSwitcher language={language} onChange={onLanguageChange} />
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
        <a className="button button--small button--primary" href="#contact">{t('cta.startProject')}</a>
      </div>
    </header>
  );
}
