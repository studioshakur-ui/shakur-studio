import { Sparkles } from 'lucide-react';
import { Language } from '../i18n/translations';
import { translate } from '../i18n/config';
import { isAgentApiConfigured } from '../lib/agents/client';
import { OfferAgent } from './agents/OfferAgent';
import { AuditAgent } from './agents/AuditAgent';
import { AutomationAgent } from './agents/AutomationAgent';

interface AgentsSectionProps {
  language: Language;
}

export function AgentsSection({ language }: AgentsSectionProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const configured = isAgentApiConfigured();

  return (
    <section className="section section--agents" id="agents">
      <div className="section-heading">
        <span>{t('agents.kicker')}</span>
        <h2>{t('agents.title')}</h2>
        <p>{t('agents.copy')}</p>
        {!configured && (
          <div className="agents-banner" role="status">
            <Sparkles size={14} aria-hidden="true" />
            <span>{t('agents.demoNotice')}</span>
          </div>
        )}
      </div>
      <div className="agents-grid">
        <OfferAgent language={language} />
        <AuditAgent language={language} />
        <AutomationAgent language={language} />
      </div>
    </section>
  );
}
