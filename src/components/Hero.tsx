import { ArrowRight } from 'lucide-react';
import { Language, TranslationKey } from '../i18n/translations';
import { translate } from '../i18n/config';
import { ShakurEngine } from './ShakurEngine';

interface HeroProps {
  language: Language;
}

export function Hero({ language }: HeroProps) {
  const t = (key: TranslationKey) => translate(language, key);

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
            {t('hero.buildSystem')}
          </a>
        </div>
      </div>

      <ShakurEngine ariaLabel={`${t('hero.titleA')} ${t('hero.titleB')}`} />

      <div className="hero__signature">
        <span className="hero__signature-dot" aria-hidden="true" />
        {t('hero.builtBy')}
      </div>
    </section>
  );
}
