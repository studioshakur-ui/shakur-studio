import { useCallback, useEffect, useRef, useState } from 'react';
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

const AUTO_ADVANCE_MS = 3500;
const MANUAL_PAUSE_MS = 6500;

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function ProcessSection({ language }: ProcessSectionProps) {
  const t = (key: TranslationKey) => translate(language, key);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => prefersReducedMotion());
  const manualPauseUntilRef = useRef<number>(0);

  // Track changes to prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setReducedMotion(mql.matches);
    mql.addEventListener?.('change', handler);
    return () => mql.removeEventListener?.('change', handler);
  }, []);

  // Auto-advance loop
  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => {
      if (Date.now() < manualPauseUntilRef.current) return;
      setActiveIndex((current) => (current + 1) % STEPS.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  const focusStep = useCallback((index: number) => {
    setActiveIndex(((index % STEPS.length) + STEPS.length) % STEPS.length);
    manualPauseUntilRef.current = Date.now() + MANUAL_PAUSE_MS;
  }, []);

  const onKeyDown = useCallback((event: React.KeyboardEvent<HTMLLIElement>, index: number) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      focusStep(index + 1);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      focusStep(index - 1);
    } else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      focusStep(index);
    }
  }, [focusStep]);

  // Connector progress (0 → 100) maps to the active step position
  const progress = reducedMotion ? 100 : Math.round((activeIndex / (STEPS.length - 1)) * 100);

  return (
    <section className="section process" id="process">
      <div className="section-heading">
        <span>{t('process.kicker')}</span>
        <h2>{t('process.title')}</h2>
        <p>{t('process.copy')}</p>
      </div>
      <ol
        className="process-chain"
        style={{ ['--process-progress' as string]: `${progress}%` }}
        aria-label={t('process.title')}
      >
        <span className="process-chain__rail" aria-hidden="true" />
        {STEPS.map((step, index) => {
          const isActive = index === activeIndex || reducedMotion;
          return (
            <li
              className={`process-chain__step${isActive ? ' is-active' : ''}`}
              key={step.labelKey}
              data-index={index + 1}
              tabIndex={0}
              role="button"
              aria-pressed={isActive}
              onClick={() => focusStep(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              <div className="process-chain__index">{String(index + 1).padStart(2, '0')}</div>
              <div className="process-chain__icon">{step.icon}</div>
              <div className="process-chain__body">
                <h3>{t(step.labelKey)}</h3>
                <p>{t(step.bodyKey)}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
