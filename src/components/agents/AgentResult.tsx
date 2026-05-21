import { Sparkles } from 'lucide-react';
import {
  AuditAgentOutput,
  AutomationAgentOutput,
  OfferAgentOutput
} from '../../lib/agents/types';
import { Language } from '../../i18n/translations';
import { translate } from '../../i18n/config';

interface DemoBadgeProps {
  mode: 'live' | 'demo';
  language: Language;
}

function DemoBadge({ mode, language }: DemoBadgeProps) {
  if (mode === 'live') return null;
  return (
    <div className="agent-mode-badge" role="note">
      <Sparkles size={12} aria-hidden="true" />
      {translate(language, 'agents.demoNotice')}
    </div>
  );
}

interface OfferResultProps {
  output: OfferAgentOutput;
  mode: 'live' | 'demo';
  language: Language;
}

export function OfferResult({ output, mode, language }: OfferResultProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  return (
    <div className="agent-result__body">
      <DemoBadge mode={mode} language={language} />
      <h4>{output.valueProposition}</h4>

      <div className="agent-meta">
        <span><strong>{t('agents.offer.audienceLabel')}</strong> {output.targetAudience}</span>
        <span><strong>{t('agents.offer.angleLabel')}</strong> {output.offerAngle}</span>
      </div>

      <div className="agent-section">
        <span className="agent-section__label">{t('agents.offer.structureLabel')}</span>
        <ol>
          {output.landingStructure.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </div>

      <div className="agent-section">
        <span className="agent-section__label">{t('agents.offer.ctaLabel')}</span>
        <p className="agent-emphasis">{output.callToAction}</p>
      </div>

      <p className="agent-next">{output.nextStep}</p>
    </div>
  );
}

interface AuditResultProps {
  output: AuditAgentOutput;
  mode: 'live' | 'demo';
  language: Language;
}

export function AuditResult({ output, mode, language }: AuditResultProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const riskKey: 'agents.audit.riskLow' | 'agents.audit.riskMedium' | 'agents.audit.riskHigh' =
    output.conversionRisk === 'low'
      ? 'agents.audit.riskLow'
      : output.conversionRisk === 'medium'
        ? 'agents.audit.riskMedium'
        : 'agents.audit.riskHigh';

  return (
    <div className="agent-result__body">
      <DemoBadge mode={mode} language={language} />

      <div className="agent-scores">
        <div className="agent-score">
          <span className="agent-score__label">{t('agents.audit.clarityLabel')}</span>
          <strong>{output.clarityScore}</strong>
          <span className="agent-score__unit">/ 100</span>
        </div>
        <div className="agent-score">
          <span className="agent-score__label">{t('agents.audit.trustLabel')}</span>
          <strong>{output.trustScore}</strong>
          <span className="agent-score__unit">/ 100</span>
        </div>
        <div className={`agent-score agent-score--${output.conversionRisk}`}>
          <span className="agent-score__label">{t('agents.audit.riskLabel')}</span>
          <strong>{t(riskKey)}</strong>
        </div>
      </div>

      <div className="agent-section">
        <span className="agent-section__label">{t('agents.audit.frictionLabel')}</span>
        <ul>
          {output.frictionPoints.map((point) => <li key={point}>{point}</li>)}
        </ul>
      </div>

      <div className="agent-section">
        <span className="agent-section__label">{t('agents.audit.fixesLabel')}</span>
        <ul>
          {output.priorityFixes.map((fix) => <li key={fix}>{fix}</li>)}
        </ul>
      </div>

      <p className="agent-next">{output.cncsSuggestion}</p>
    </div>
  );
}

interface AutomationResultProps {
  output: AutomationAgentOutput;
  mode: 'live' | 'demo';
  language: Language;
}

export function AutomationResult({ output, mode, language }: AutomationResultProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  return (
    <div className="agent-result__body">
      <DemoBadge mode={mode} language={language} />

      <div className="agent-flow">
        <span><strong>{t('agents.auto.inputLabel')}</strong> {output.input}</span>
        <span><strong>{t('agents.auto.logicLabel')}</strong> {output.logic}</span>
        <span><strong>{t('agents.auto.outputLabel')}</strong> {output.output}</span>
      </div>

      <div className="agent-section">
        <span className="agent-section__label">{t('agents.auto.stepsLabel')}</span>
        <ol>
          {output.steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </div>

      <div className="agent-section">
        <span className="agent-section__label">{t('agents.auto.integrationsLabel')}</span>
        <ul className="agent-chips">
          {output.integrations.map((tool) => <li key={tool}>{tool}</li>)}
        </ul>
      </div>

      <div className="agent-section">
        <span className="agent-section__label">{t('agents.auto.roadmapLabel')}</span>
        <ol>
          {output.roadmap.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </div>
    </div>
  );
}
