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

interface NavItem {
  href: string;
  ordinal: string;
  labelKey: Parameters<typeof translate>[1];
}

const NAV: NavItem[] = [
  { href: '#agents', ordinal: '01', labelKey: 'nav.agents' },
  { href: '#method', ordinal: '02', labelKey: 'nav.method' },
  { href: '#contact', ordinal: '03', labelKey: 'nav.contact' }
];

export function Header({ language, theme, onLanguageChange, onThemeToggle }: HeaderProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label={t('a11y.brand')}>
        <span className="brand__mark">SHAKUR</span>
        <span className="brand__suffix">_</span>
      </a>

      <nav className="desktop-nav" aria-label={t('a11y.nav')}>
        {NAV.map((item) => (
          <a key={item.href} href={item.href} className="desktop-nav__link">
            <span className="desktop-nav__ordinal" aria-hidden="true">{item.ordinal}</span>
            <span className="desktop-nav__label">// {t(item.labelKey)}</span>
          </a>
        ))}
      </nav>

      <div className="header-actions">
        <LanguageSwitcher language={language} onChange={onLanguageChange} />
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
      </div>
    </header>
  );
}
