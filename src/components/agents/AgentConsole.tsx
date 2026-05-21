import { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { AgentKind } from '../../lib/agents/types';
import { Language, TranslationKey } from '../../i18n/translations';
import { translate } from '../../i18n/config';
import { isAgentApiConfigured } from '../../lib/agents/client';
import { OfferAgent } from './OfferAgent';
import { AuditAgent } from './AuditAgent';
import { AutomationAgent } from './AutomationAgent';

interface AgentConsoleProps {
  language: Language;
}

interface TabSpec {
  kind: AgentKind;
  ordinal: string;
  titleKey: TranslationKey;
}

const TABS: TabSpec[] = [
  { kind: 'offer', ordinal: '01', titleKey: 'agents.offer.title' },
  { kind: 'audit', ordinal: '02', titleKey: 'agents.audit.title' },
  { kind: 'automation', ordinal: '03', titleKey: 'agents.automation.title' }
];

export function AgentConsole({ language }: AgentConsoleProps) {
  const t = (key: TranslationKey) => translate(language, key);
  const [activeKind, setActiveKind] = useState<AgentKind>('offer');
  const tabRefs = useRef<Map<AgentKind, HTMLButtonElement | null>>(new Map());
  const configured = isAgentApiConfigured();

  // Move keyboard focus when the active tab changes via arrow keys
  const focusedByKeyboard = useRef(false);
  useEffect(() => {
    if (focusedByKeyboard.current) {
      tabRefs.current.get(activeKind)?.focus();
      focusedByKeyboard.current = false;
    }
  }, [activeKind]);

  function onTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    const currentIndex = TABS.findIndex((tab) => tab.kind === activeKind);
    if (currentIndex < 0) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      focusedByKeyboard.current = true;
      setActiveKind(TABS[(currentIndex + 1) % TABS.length]!.kind);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      focusedByKeyboard.current = true;
      setActiveKind(TABS[(currentIndex - 1 + TABS.length) % TABS.length]!.kind);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusedByKeyboard.current = true;
      setActiveKind(TABS[0]!.kind);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusedByKeyboard.current = true;
      setActiveKind(TABS[TABS.length - 1]!.kind);
    }
  }

  return (
    <article className="agent-console">
      <header className="agent-console__head">
        <span className="agent-console__eyebrow">{t('agents.console.eyebrow')}</span>
        {!configured && (
          <div className="agents-banner" role="status">
            <Sparkles size={14} aria-hidden="true" />
            <span>{t('agents.demoNotice')}</span>
          </div>
        )}
      </header>

      <div
        className="agent-console__tabs"
        role="tablist"
        aria-label={t('agents.console.tabsLabel')}
      >
        {TABS.map((tab) => {
          const isActive = tab.kind === activeKind;
          const panelId = `agent-panel-${tab.kind}`;
          const tabId = `agent-tab-${tab.kind}`;
          return (
            <button
              key={tab.kind}
              ref={(el) => { tabRefs.current.set(tab.kind, el); }}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              className={`agent-console__tab${isActive ? ' is-active' : ''}`}
              onClick={() => setActiveKind(tab.kind)}
              onKeyDown={onTabKeyDown}
            >
              <span className="agent-console__tab-ordinal">{tab.ordinal}</span>
              <span className="agent-console__tab-label">{t(tab.titleKey)}</span>
            </button>
          );
        })}
      </div>

      {/* All three panels are mounted at once so per-tab state is preserved on switch. */}
      <div className="agent-console__body">
        <div
          id="agent-panel-offer"
          role="tabpanel"
          aria-labelledby="agent-tab-offer"
          className="agent-console__panel"
          data-active={activeKind === 'offer'}
          hidden={activeKind !== 'offer'}
        >
          <OfferAgent language={language} />
        </div>
        <div
          id="agent-panel-audit"
          role="tabpanel"
          aria-labelledby="agent-tab-audit"
          className="agent-console__panel"
          data-active={activeKind === 'audit'}
          hidden={activeKind !== 'audit'}
        >
          <AuditAgent language={language} />
        </div>
        <div
          id="agent-panel-automation"
          role="tabpanel"
          aria-labelledby="agent-tab-automation"
          className="agent-console__panel"
          data-active={activeKind === 'automation'}
          hidden={activeKind !== 'automation'}
        >
          <AutomationAgent language={language} />
        </div>
      </div>
    </article>
  );
}
