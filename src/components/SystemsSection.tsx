import { BrainCircuit, Globe2, Workflow } from 'lucide-react';
import { Language } from '../i18n/translations';
import { translate } from '../i18n/config';

interface SystemsSectionProps {
  language: Language;
}

export function SystemsSection({ language }: SystemsSectionProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  const cards = [
    { icon: <Globe2 size={26} />, title: t('systems.web.title'), copy: t('systems.web.copy') },
    { icon: <BrainCircuit size={26} />, title: t('systems.ai.title'), copy: t('systems.ai.copy') },
    { icon: <Workflow size={26} />, title: t('systems.auto.title'), copy: t('systems.auto.copy') }
  ];

  return (
    <section className="section" id="systems">
      <div className="section-heading">
        <span>{t('systems.kicker')}</span>
        <h2>{t('systems.title')}</h2>
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
