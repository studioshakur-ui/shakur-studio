import { FormEvent, ReactNode } from 'react';
import { ArrowRight, Loader2, RotateCcw, ShieldAlert, Wand2 } from 'lucide-react';
import { AgentKind } from '../../lib/agents/types';
import { Language, TranslationKey } from '../../i18n/translations';
import { translate } from '../../i18n/config';

const INDEX_BY_KIND: Record<AgentKind, string> = {
  offer: '01',
  audit: '02',
  automation: '03'
};

interface AgentShellProps {
  kind: AgentKind;
  language: Language;
  icon: ReactNode;
  title: string;
  description: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  mode: 'live' | 'demo' | null;
  errorMessage: string | null;
  form: ReactNode;
  result: ReactNode | null;
  canSubmit: boolean;
  submitKey: TranslationKey;
  onSubmit: () => void;
  onReset: () => void;
  onLoadExample?: () => void;
}

export function AgentShell({
  kind,
  language,
  icon,
  title,
  description,
  status,
  mode,
  errorMessage,
  form,
  result,
  canSubmit,
  submitKey,
  onSubmit,
  onReset,
  onLoadExample
}: AgentShellProps) {
  const t = (key: TranslationKey) => translate(language, key);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'loading' || !canSubmit) return;
    onSubmit();
  }

  const showResult = status === 'success' && result;
  const isLoading = status === 'loading';

  return (
    <article className={`agent-card agent-card--${kind}`} data-index={INDEX_BY_KIND[kind]}>
      <div className="agent-card__top">
        <div className="agent-card__icon">{icon}</div>
        <div className="agent-card__heading">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      {!showResult && (
        <form onSubmit={handleSubmit} className="agent-card__form" noValidate>
          {form}

          <div className="agent-card__actions">
            <button type="submit" className="agent-card__submit" disabled={!canSubmit || isLoading} aria-busy={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={16} className="agent-spinner" aria-hidden="true" />
                  {t('agents.loading')}
                </>
              ) : (
                <>
                  {t(submitKey)} <ArrowRight size={16} aria-hidden="true" />
                </>
              )}
            </button>
            {onLoadExample && !isLoading && (
              <button type="button" className="agent-card__example" onClick={onLoadExample}>
                <Wand2 size={14} aria-hidden="true" /> {t('agents.tryExample')}
              </button>
            )}
          </div>

          {status === 'error' && errorMessage && (
            <div className="agent-error" role="alert">
              <ShieldAlert size={14} aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}
        </form>
      )}

      {showResult && (
        <div className="agent-result">
          <div className="agent-result__header">
            <span>
              {mode === 'demo' ? t('agents.resultDemo') : t('agents.result')}
            </span>
            <button type="button" className="agent-result__reset" onClick={onReset}>
              <RotateCcw size={14} aria-hidden="true" /> {t('agents.runAgain')}
            </button>
          </div>
          {result}
          <a className="agent-result__cta" href="#contact">
            {t('agents.turnIntoSystem')} <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
      )}
    </article>
  );
}
