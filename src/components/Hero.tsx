import { ArrowRight } from 'lucide-react';
import { Language, TranslationKey } from '../i18n/translations';
import { translate } from '../i18n/config';

interface HeroProps {
  language: Language;
}

export function Hero({ language }: HeroProps) {
  const t = (key: TranslationKey) => translate(language, key);

  return (
    <section className="hero" id="top">
      {/* Background — single ice-blue focal glow + a faintly tilted metallic plate */}
      <div className="hero__bg" aria-hidden="true">
        <span className="hero__glow" />
        <span className="hero__prism" />
      </div>

      <div className="hero__inner">
        <span className="hero__eyebrow">// {t('hero.eyebrow')}</span>

        <h1 className="hero__wordmark" aria-label="SHAKUR STUDIO">
          <span>SHAKUR</span>
          <span>STUDIO</span>
        </h1>

        <p className="hero__subhead">
          <span>{t('hero.titleA')}</span>
          <span>{t('hero.titleB')}</span>
        </p>

        <div className="hero__actions">
          <a className="button button--primary" href="#agents">
            {t('hero.testAgent')} <ArrowRight size={16} aria-hidden="true" />
          </a>
          <a className="button button--ghost" href="#contact">
            {t('hero.buildSystem')}
          </a>
        </div>

        <div className="hero__signature">
          <span className="hero__signature-dot" aria-hidden="true" />
          {t('hero.builtBy')}
        </div>
      </div>
    </section>
  );
}
