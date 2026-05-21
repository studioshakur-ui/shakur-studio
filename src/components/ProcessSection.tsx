import { Database, MessageSquareText, MonitorSmartphone, Settings2, Target } from 'lucide-react';
import { ReactNode } from 'react';
import { Language, TranslationKey } from '../i18n/translations';
import { translate } from '../i18n/config';

interface ProcessSectionProps {
  language: Language;
}

interface Step {
  icon: ReactNode;
  labelKey: TranslationKey;
  bodyKey: TranslationKey;
}

const STEPS: Step[] = [
  { icon: <MessageSquareText size={18} aria-hidden="true" />, labelKey: 'process.message', bodyKey: 'process.messageBody' },
  { icon: <MonitorSmartphone size={18} aria-hidden="true" />, labelKey: 'process.interface', bodyKey: 'process.interfaceBody' },
  { icon: <Database size={18} aria-hidden="true" />, labelKey: 'process.data', bodyKey: 'process.dataBody' },
  { icon: <Settings2 size={18} aria-hidden="true" />, labelKey: 'process.automation', bodyKey: 'process.automationBody' },
  { icon: <Target size={18} aria-hidden="true" />, labelKey: 'process.result', bodyKey: 'process.resultBody' }
];

export function ProcessSection({ language }: ProcessSectionProps) {
  const t = (key: TranslationKey) => translate(language, key);

  return (
    <section className="section process" id="process">
      <div className="section-heading">
        <span>{t('process.kicker')}</span>
        <h2>{t('process.title')}</h2>
        <p>{t('process.copy')}</p>
      </div>
      <ol className="process-chain">
        {STEPS.map((step, index) => (
          <li className="process-chain__step" key={step.labelKey}>
            <div className="process-chain__index">{String(index + 1).padStart(2, '0')}</div>
            <div className="process-chain__icon">{step.icon}</div>
            <div className="process-chain__body">
              <h3>{t(step.labelKey)}</h3>
              <p>{t(step.bodyKey)}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
