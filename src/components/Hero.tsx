import { ArrowRight, Cpu, MessageSquareText, Sparkles } from 'lucide-react';
import { Language } from '../i18n/translations';
import { translate } from '../i18n/config';

interface HeroProps {
  language: Language;
}

export function Hero({ language }: HeroProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  return (
    <section className="hero" id="top">
      <div className="hero__copy">
        <div className="kicker">{t('hero.kicker')}</div>
        <h1>
          <span>{t('hero.titleA')}</span>
          <span>{t('hero.titleB')}</span>
          <span className="gradient-text">{t('hero.titleC')}</span>
        </h1>
        <p>{t('hero.copy')}</p>
        <div className="hero__actions">
          <a className="button button--primary" href="#agents">
            {t('hero.explore')} <ArrowRight size={17} aria-hidden="true" />
          </a>
          <a className="button button--secondary" href="#contact">
            {t('hero.project')} <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>
        <div className="built-by"><span aria-hidden="true" />{t('hero.builtBy')}</div>
      </div>

      <aside className="system-demo" aria-label="CNCS engine schema">
        <div className="system-demo__node system-demo__node--input">
          <div className="system-demo__head">
            <MessageSquareText size={16} aria-hidden="true" />
            <span>{t('hero.demo.input')}</span>
          </div>
          <p>{t('hero.demo.inputBody')}</p>
        </div>

        <div className="system-demo__pipe" aria-hidden="true">
          <span className="system-demo__pulse" />
        </div>

        <div className="system-demo__node system-demo__node--engine">
          <div className="system-demo__head">
            <Cpu size={16} aria-hidden="true" />
            <span>{t('hero.demo.engine')}</span>
          </div>
          <p className="system-demo__chain">{t('hero.demo.engineBody')}</p>
        </div>

        <div className="system-demo__pipe" aria-hidden="true">
          <span className="system-demo__pulse system-demo__pulse--delay" />
        </div>

        <div className="system-demo__node system-demo__node--output">
          <div className="system-demo__head">
            <Sparkles size={16} aria-hidden="true" />
            <span>{t('hero.demo.output')}</span>
          </div>
          <p>{t('hero.demo.outputBody')}</p>
        </div>
      </aside>
    </section>
  );
}
