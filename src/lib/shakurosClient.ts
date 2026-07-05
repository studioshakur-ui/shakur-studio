import { Message } from './providers/providerTypes';
import { supabase } from './supabaseClient';

interface ChatResponse {
  text: string;
  conversationId: string;
  messageId: string;
  provider: string;
  model: string;
}

interface StreamEvent {
  event: string;
  data: unknown;
}

const API_URL = (import.meta.env.VITE_SHAKUROS_API_URL ?? 'http://localhost:8787').replace(/\/$/, '');

function inferMode(providerId: string, modelId: string): 'auto' | 'cheap' | 'balanced' | 'premium' | 'local' {
  if (providerId === 'auto' || modelId === 'auto') {
    return 'auto';
  }

  if (providerId === 'ollama' || modelId.includes('local')) {
    return 'local';
  }

  if (providerId === 'groq' || providerId === 'deepseek') {
    return 'cheap';
  }

  if (modelId.includes('opus') || modelId.includes('gpt-4') || modelId.includes('mistral-large')) {
    return 'premium';
  }

  return 'balanced';
}

function optionalPreference(value: string): string | undefined {
  return value === 'auto' ? undefined : value;
}

async function getAccessToken(): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase Auth is not configured for PETAW.');
  }

  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    throw new Error('Connecte-toi pour utiliser PETAW avec ShakurOS.');
  }

  return data.session.access_token;
}

async function createHeaders(): Promise<HeadersInit> {
  const accessToken = await getAccessToken();
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
}

function createPayload(
  providerId: string,
  modelId: string,
  messages: Message[],
  _webSearchEnabled: boolean,
  stream: boolean
) {
  return {
    mode: inferMode(providerId, modelId),
    preferredProviderId: optionalPreference(providerId),
    preferredModelId: optionalPreference(modelId),
    requiredCapabilities: ['chat'],
    stream,
    messages,
    metadata: {
      app: 'petaw-web'
    }
  };
}

function parseSseEvents(buffer: string): { events: StreamEvent[]; remaining: string } {
  const blocks = buffer.split(/\n\n/);
  const remaining = blocks.pop() ?? '';
  const events = blocks.flatMap((block) => {
    const eventLine = block.split('\n').find((line) => line.startsWith('event:'));
    const dataLine = block.split('\n').find((line) => line.startsWith('data:'));

    if (!eventLine || !dataLine) {
      return [];
    }

    try {
      return [{
        event: eventLine.replace('event:', '').trim(),
        data: JSON.parse(dataLine.replace('data:', '').trim()) as unknown
      }];
    } catch {
      return [];
    }
  });

  return { events, remaining };
}

export async function chatWithShakurOS(
  providerId: string,
  modelId: string,
  messages: Message[],
  webSearchEnabled: boolean,
  onProgress: (text: string) => void
): Promise<string> {
  return chatWithoutStreaming(providerId, modelId, messages, webSearchEnabled, onProgress);
}

export async function streamChatWithShakurOS(
  providerId: string,
  modelId: string,
  messages: Message[],
  webSearchEnabled: boolean,
  onProgress: (text: string) => void
): Promise<string> {
  const response = await fetch(`${API_URL}/v1/chat`, {
    method: 'POST',
    headers: await createHeaders(),
    body: JSON.stringify(createPayload(providerId, modelId, messages, webSearchEnabled, true))
  });

  if (!response.ok) {
    const fallback = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(fallback?.error ?? `ShakurOS request failed with status ${response.status}`);
  }

  if (!response.body) {
    return chatWithoutStreaming(providerId, modelId, messages, webSearchEnabled, onProgress);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const parsed = parseSseEvents(buffer);
    buffer = parsed.remaining;

    for (const event of parsed.events) {
      if (event.event === 'token') {
        const chunk = (event.data as { text?: string }).text ?? '';
        text += chunk;
        onProgress(text);
      }

      if (event.event === 'error') {
        throw new Error((event.data as { message?: string }).message ?? 'ShakurOS streaming error.');
      }
    }
  }

  return text;
}

async function chatWithoutStreaming(
  providerId: string,
  modelId: string,
  messages: Message[],
  webSearchEnabled: boolean,
  onProgress: (text: string) => void
): Promise<string> {
  const response = await fetch(`${API_URL}/v1/chat`, {
    method: 'POST',
    headers: await createHeaders(),
    body: JSON.stringify(createPayload(providerId, modelId, messages, webSearchEnabled, false))
  });

  if (!response.ok) {
    const fallback = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(fallback?.error ?? `ShakurOS request failed with status ${response.status}`);
  }

  const result = await response.json() as ChatResponse;
  onProgress(result.text);
  return result.text;
}
