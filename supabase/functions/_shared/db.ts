// Lightweight observability sink. Fire-and-forget insert into public.agent_runs
// using the service-role key that Supabase Edge Functions inject automatically.
// Failures are swallowed — a logging error must never break the user response.

import { AgentLanguage } from './types.ts';

export interface AgentRunLog {
  agent: 'offer' | 'audit' | 'automation';
  language: AgentLanguage;
  mode: 'live' | 'demo';
  status: 'success' | 'error';
  errorCode?: string | null;
  latencyMs: number;
  ipHash?: string | null;
}

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

export function logAgentRun(entry: AgentRunLog): void {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return;

  const body = JSON.stringify({
    agent: entry.agent,
    language: entry.language,
    mode: entry.mode,
    status: entry.status,
    error_code: entry.errorCode ?? null,
    latency_ms: Math.max(0, Math.round(entry.latencyMs)),
    ip_hash: entry.ipHash ?? null
  });

  // Fire-and-forget. We do not await; we attach .catch so an unhandled rejection
  // can never crash the runtime.
  fetch(`${url}/rest/v1/agent_runs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'apikey': key,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body
  }).catch(() => {
    // Intentional swallow — observability failures must not impact UX.
  });
}
