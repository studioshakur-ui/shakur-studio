import { Language } from '../i18n/translations';
import { translate } from '../i18n/config';
import { AgentConsole } from './agents/AgentConsole';

interface AgentsSectionProps {
  language: Language;
}

export function AgentsSection({ language }: AgentsSectionProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  return (
    <section className="section section--agents" id="agents">
      <div className="section-heading">
        <span>{t('agents.kicker')}</span>
        <h2>{t('agents.title')}</h2>
        <p>{t('agents.copy')}</p>
      </div>
      <AgentConsole language={language} />
    </section>
  );
}
