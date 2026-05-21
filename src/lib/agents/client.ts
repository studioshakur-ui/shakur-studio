import {
  AgentEnvelope,
  AgentErrorPayload,
  AgentInputByKind,
  AgentKind
} from './types';

const FUNCTION_PATH: Record<AgentKind, string> = {
  offer: 'agent-offer',
  audit: 'agent-audit',
  automation: 'agent-automation'
};

const REQUEST_TIMEOUT_MS = 28_000;

export class AgentClientError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'AgentClientError';
    this.code = code;
    this.status = status;
  }
}

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

function readConfig(): SupabaseConfig | null {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url: url.replace(/\/$/, ''), anonKey };
}

export function isAgentApiConfigured(): boolean {
  return readConfig() !== null;
}

export async function callAgent<K extends AgentKind>(kind: K, input: AgentInputByKind[K]): Promise<AgentEnvelope<K>> {
  const config = readConfig();
  if (!config) {
    throw new AgentClientError(
      'api_not_configured',
      'Agent API is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      0
    );
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${config.url}/functions/v1/${FUNCTION_PATH[kind]}`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${config.anonKey}`,
        'apikey': config.anonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input)
    });
  } catch (error) {
    window.clearTimeout(timeout);
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new AgentClientError('timeout', 'The agent took too long to respond.', 504);
    }
    throw new AgentClientError('network_error', 'Unable to reach the agent API.', 0);
  }
  window.clearTimeout(timeout);

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new AgentClientError('invalid_response', 'The agent returned an invalid response.', response.status);
  }

  if (!response.ok) {
    const err = (payload as { error?: AgentErrorPayload })?.error;
    throw new AgentClientError(err?.code ?? 'request_failed', err?.message ?? 'Request failed.', response.status);
  }

  return payload as AgentEnvelope<K>;
}
