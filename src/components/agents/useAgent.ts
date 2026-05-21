import { useCallback, useRef, useState } from 'react';
import { callAgent, AgentClientError } from '../../lib/agents/client';
import { AgentEnvelope, AgentInputByKind, AgentKind } from '../../lib/agents/types';
import { Language } from '../../i18n/translations';
import { translate } from '../../i18n/config';

type AgentStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseAgentResult<K extends AgentKind> {
  status: AgentStatus;
  envelope: AgentEnvelope<K> | null;
  errorMessage: string | null;
  run: (input: AgentInputByKind[K]) => Promise<void>;
  reset: () => void;
}

function mapErrorMessage(language: Language, error: AgentClientError): string {
  if (error.code === 'rate_limited') return translate(language, 'agents.errorRateLimit');
  if (error.code === 'timeout') return translate(language, 'agents.errorTimeout');
  if (error.code === 'invalid_input') return translate(language, 'agents.errorInvalid');
  if (error.code === 'network_error') return translate(language, 'agents.errorNetwork');
  if (error.code === 'api_not_configured') return translate(language, 'agents.errorNotConfigured');
  return translate(language, 'agents.errorGeneric');
}

export function useAgent<K extends AgentKind>(kind: K, language: Language): UseAgentResult<K> {
  const [status, setStatus] = useState<AgentStatus>('idle');
  const [envelope, setEnvelope] = useState<AgentEnvelope<K> | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestId = useRef(0);

  const run = useCallback(async (input: AgentInputByKind[K]) => {
    const id = ++requestId.current;
    setStatus('loading');
    setErrorMessage(null);
    setEnvelope(null);

    try {
      const result = await callAgent(kind, input);
      if (id !== requestId.current) return;
      setEnvelope(result);
      setStatus('success');
    } catch (error) {
      if (id !== requestId.current) return;
      if (error instanceof AgentClientError) {
        setErrorMessage(mapErrorMessage(language, error));
      } else {
        setErrorMessage(translate(language, 'agents.errorGeneric'));
      }
      setStatus('error');
    }
  }, [kind, language]);

  const reset = useCallback(() => {
    requestId.current += 1;
    setEnvelope(null);
    setErrorMessage(null);
    setStatus('idle');
  }, []);

  return { status, envelope, errorMessage, run, reset };
}
