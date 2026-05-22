import { ArrowRight } from 'lucide-react';
import { Language, TranslationKey } from '../i18n/translations';
import { translate } from '../i18n/config';

interface HeroProps {
  language: Language;
}

export function Hero({ language }: HeroProps) {
  const t = (key: TranslationKey) => translate(language, key);

  const chain: TranslationKey[] = [
    'hero.chain.idea',
    'hero.chain.agent',
    'hero.chain.system',
    'hero.chain.result'
  ];

  return (
    <section className="hero" id="top">
      <div className="hero__inner">
        <span className="hero__eyebrow">{t('hero.eyebrow')}</span>
        <h1 className="hero__title">
          <span className="hero__title-line">{t('hero.titleA')}</span>
          <span className="hero__title-line hero__title-line--accent">{t('hero.titleB')}</span>
        </h1>
        <p className="hero__tagline">{t('hero.tagline')}</p>
        <p className="hero__copy">{t('hero.copy')}</p>

        <div className="hero__actions">
          <a className="button button--primary" href="#agents">
            {t('hero.testAgent')} <ArrowRight size={17} aria-hidden="true" />
          </a>
          <a className="button button--ghost" href="#contact">
            {t('hero.startProject')}
          </a>
        </div>

        <ol className="hero__chain" aria-label={`${t('hero.chain.idea')} → ${t('hero.chain.agent')} → ${t('hero.chain.system')} → ${t('hero.chain.result')}`}>
          {chain.map((key, index) => (
            <li key={key} className="hero__chain-item" data-index={index}>
              <span className="hero__chain-dot" aria-hidden="true" />
              <span className="hero__chain-label">{t(key)}</span>
              {index < chain.length - 1 && <span className="hero__chain-line" aria-hidden="true" />}
            </li>
          ))}
        </ol>

        <div className="hero__signature">
          <span className="hero__signature-dot" aria-hidden="true" />
          {t('hero.builtBy')}
        </div>
      </div>
    </section>
  );
}
