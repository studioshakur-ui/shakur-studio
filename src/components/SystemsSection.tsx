import { BrainCircuit, Globe2, Workflow } from 'lucide-react';
import { Language } from '../i18n/translations';
import { translate } from '../i18n/config';

interface SystemsSectionProps {
  language: Language;
}

export function SystemsSection({ language }: SystemsSectionProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  const cards = [
    { icon: <Globe2 size={26} />, title: t('caps.web.title'), copy: t('caps.web.copy') },
    { icon: <BrainCircuit size={26} />, title: t('caps.ai.title'), copy: t('caps.ai.copy') },
    { icon: <Workflow size={26} />, title: t('caps.auto.title'), copy: t('caps.auto.copy') }
  ];

  return (
    <section className="section" id="systems">
      <div className="section-heading">
        <span>{t('caps.eyebrow')}</span>
        <h2>{t('caps.title')}</h2>
      </div>
      <div className="systems-grid">
        {cards.map((card) => (
          <article className="system-card" key={card.title}>
            <div className="system-card__icon">{card.icon}</div>
            <h3>{card.title}</h3>
            <p>{card.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
