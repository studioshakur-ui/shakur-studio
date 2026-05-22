import { FormEvent, ReactNode, useState } from 'react';
import { ArrowRight, ChevronDown, Loader2, RotateCcw, ShieldAlert, Wand2 } from 'lucide-react';
import { AgentKind } from '../../lib/agents/types';
import { Language, TranslationKey } from '../../i18n/translations';
import { translate } from '../../i18n/config';

interface AgentShellProps {
  kind: AgentKind;
  language: Language;
  icon: ReactNode;
  title: string;
  description: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  mode: 'live' | 'demo' | null;
  errorMessage: string | null;
  /** The one big primary input — always visible. */
  primaryField: ReactNode;
  /** Secondary fields tucked behind "Advanced" toggle. Optional. */
  advancedFields?: ReactNode;
  result: ReactNode | null;
  canSubmit: boolean;
  submitKey: TranslationKey;
  onSubmit: () => void;
  onReset: () => void;
  onLoadExample?: () => void;
  /** Optional post-result conversion footer rendered after `result`. */
  resultFooter?: ReactNode;
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
  primaryField,
  advancedFields,
  result,
  canSubmit,
  submitKey,
  onSubmit,
  onReset,
  onLoadExample,
  resultFooter
}: AgentShellProps) {
  const t = (key: TranslationKey) => translate(language, key);
  const [showAdvanced, setShowAdvanced] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'loading' || !canSubmit) return;
    onSubmit();
  }

  const showResult = status === 'success' && result;
  const isLoading = status === 'loading';

  return (
    <div className={`agent-panel agent-panel--${kind}`}>
      <header className="agent-panel__head">
        <div className="agent-panel__icon" aria-hidden="true">{icon}</div>
        <div className="agent-panel__heading">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </header>

      {!showResult && (
        <form onSubmit={handleSubmit} className="agent-panel__form" noValidate>
          {primaryField}

          {advancedFields && (
            <div className={`agent-panel__advanced${showAdvanced ? ' is-open' : ''}`}>
              <button
                type="button"
                className="agent-panel__advanced-toggle"
                onClick={() => setShowAdvanced((v) => !v)}
                aria-expanded={showAdvanced}
              >
                <ChevronDown size={14} aria-hidden="true" />
                {showAdvanced ? t('agents.advanced.hide') : t('agents.advanced.show')}
              </button>
              {showAdvanced && (
                <div className="agent-panel__advanced-body">{advancedFields}</div>
              )}
            </div>
          )}

          <div className="agent-panel__actions">
            <button
              type="submit"
              className="agent-panel__submit"
              disabled={!canSubmit || isLoading}
              aria-busy={isLoading}
            >
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
              <button type="button" className="agent-panel__example" onClick={onLoadExample}>
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
          {resultFooter ?? (
            <a className="agent-result__cta" href="#contact">
              {t('agents.turnIntoSystem')} <ArrowRight size={15} aria-hidden="true" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
