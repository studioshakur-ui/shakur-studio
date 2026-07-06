import { Message } from './providers/providerTypes';
import { supabase } from './supabaseClient';
import { ResolvedPetawIntent, detectConversationLanguage } from './intentRouter';

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

type RoutingMode = 'auto' | 'cheap' | 'balanced' | 'premium' | 'local';
type ImageGenerationMode = 'auto' | 'economical' | 'premium' | 'local';
type ImageGenerationQuality = 'auto' | 'standard' | 'high';
type ImageGenerationStyle = 'auto' | 'realistic' | 'illustration' | 'product' | 'editorial' | 'african-premium';
type ImageGenerationSize = '1024x1024' | '1024x1536' | '1536x1024';

export interface GeneratedImageArtifact {
  id: string;
  prompt: string;
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp';
  dataUrl?: string;
  url?: string;
  width: number;
  height: number;
}

export interface ImageGenerationResponse {
  id: string;
  provider: string;
  model: string;
  mode: ImageGenerationMode;
  images: GeneratedImageArtifact[];
  latencyMs: number;
  fallbackUsed: boolean;
  attemptedProviders: string[];
  failureReasons: Array<{ provider: string; code: string; message: string }>;
  estimatedCost: number;
  createdAt: string;
}

export interface GenerateImageOptions {
  prompt: string;
  mode?: ImageGenerationMode;
  quality?: ImageGenerationQuality;
  style?: ImageGenerationStyle;
  size?: ImageGenerationSize;
  count?: number;
  locale?: string;
  country?: string;
}

export interface ProviderUsageTotals {
  requests: number;
  tokens: number;
  estimatedCost: number;
}

export interface ProviderModelInfo {
  id: string;
  displayName: string;
  costTier: string;
  speedTier: string;
  qualityTier: string;
  enabled: boolean;
}

export interface ProviderStatus {
  provider: string;
  enabled: boolean;
  configured: boolean;
  healthy: boolean;
  lastError: string | null;
  checkedAt: string;
  runtimeStatus?: string;
  cooldownUntil?: string | null;
  failureCode?: string;
  usage: ProviderUsageTotals;
  models: ProviderModelInfo[];
}

export interface ProvidersStatusResponse {
  providers: ProviderStatus[];
  summary: {
    total: number;
    configured: number;
    healthy: number;
    degraded: number;
    rateLimited: number;
    quotaExhausted: number;
  };
}

const API_URL = (import.meta.env.VITE_SHAKUROS_API_URL ?? 'http://localhost:8787').replace(/\/$/, '');
const PETAW_MODE_IDS = new Set(['auto', 'fast', 'economy', 'premium', 'local']);

function inferMode(providerId: string, modelId: string): RoutingMode {
  if (providerId === 'auto' || modelId === 'auto') {
    return 'auto';
  }

  if (modelId === 'fast') {
    return 'balanced';
  }

  if (modelId === 'economy') {
    return 'cheap';
  }

  if (modelId === 'premium') {
    return 'premium';
  }

  if (modelId === 'local') {
    return 'local';
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

function optionalProviderPreference(providerId: string): string | undefined {
  return providerId === 'auto' ? undefined : providerId;
}

function optionalModelPreference(modelId: string): string | undefined {
  return PETAW_MODE_IDS.has(modelId) ? undefined : modelId;
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
  webSearchEnabled: boolean,
  stream: boolean,
  intent: ResolvedPetawIntent
) {
  const mode = modelId === 'auto' ? intent.modeId : modelId;

  // Find the last user message to detect the language of the conversation
  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  const detectedLang = detectConversationLanguage(lastUserMessage);

  let finalMessages = messages;
  if (detectedLang === 'wo') {
    finalMessages = [
      {
        id: 'system-wo-prompt',
        role: 'system',
        content: 'Réponds en wolof, ton naturel et respectueux, sans mélanger excessivement le français sauf pour les termes techniques sans équivalent courant.',
        timestamp: new Date().toISOString()
      },
      ...messages
    ];
  }

  return {
    mode: inferMode(providerId, mode),
    taskType: intent.taskType,
    webSearchEnabled: webSearchEnabled || intent.webSearchEnabled,
    preferredProviderId: optionalProviderPreference(providerId),
    preferredModelId: optionalModelPreference(mode),
    requiredCapabilities: intent.requiredCapabilities,
    stream,
    messages: finalMessages,
    metadata: {
      app: 'petaw-web',
      petawMode: mode,
      petawIntent: intent.id,
      petawIntentConfidence: intent.confidence,
      webSearchRequested: webSearchEnabled,
      ...intent.metadata
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
  onProgress: (text: string) => void,
  intent: ResolvedPetawIntent
): Promise<string> {
  return chatWithoutStreaming(providerId, modelId, messages, webSearchEnabled, onProgress, intent);
}

export async function streamChatWithShakurOS(
  providerId: string,
  modelId: string,
  messages: Message[],
  webSearchEnabled: boolean,
  onProgress: (text: string) => void,
  intent: ResolvedPetawIntent
): Promise<string> {
  const response = await fetch(`${API_URL}/v1/chat`, {
    method: 'POST',
    headers: await createHeaders(),
    body: JSON.stringify(createPayload(providerId, modelId, messages, webSearchEnabled, true, intent))
  });

  if (!response.ok) {
    const fallback = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(fallback?.error ?? `ShakurOS request failed with status ${response.status}`);
  }

  if (!response.body) {
    return chatWithoutStreaming(providerId, modelId, messages, webSearchEnabled, onProgress, intent);
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
  onProgress: (text: string) => void,
  intent: ResolvedPetawIntent
): Promise<string> {
  const response = await fetch(`${API_URL}/v1/chat`, {
    method: 'POST',
    headers: await createHeaders(),
    body: JSON.stringify(createPayload(providerId, modelId, messages, webSearchEnabled, false, intent))
  });

  if (!response.ok) {
    const fallback = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(fallback?.error ?? `ShakurOS request failed with status ${response.status}`);
  }

  const result = await response.json() as ChatResponse;
  onProgress(result.text);
  return result.text;
}

export async function fetchProviderStatus(): Promise<ProvidersStatusResponse> {
  const response = await fetch(`${API_URL}/v1/providers`, {
    method: 'GET',
    headers: await createHeaders()
  });

  if (!response.ok) {
    const fallback = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(fallback?.error ?? `ShakurOS providers request failed with status ${response.status}`);
  }

  return response.json() as Promise<ProvidersStatusResponse>;
}

export async function generateImageWithShakurOS(options: GenerateImageOptions): Promise<ImageGenerationResponse> {
  const response = await fetch(`${API_URL}/v1/images/generate`, {
    method: 'POST',
    headers: await createHeaders(),
    body: JSON.stringify({
      prompt: options.prompt,
      mode: options.mode ?? 'auto',
      quality: options.quality ?? 'standard',
      style: options.style ?? 'african-premium',
      size: options.size ?? '1024x1024',
      count: options.count ?? 1,
      metadata: {
        app: 'petaw-web',
        locale: options.locale,
        country: options.country
      }
    })
  });

  if (!response.ok) {
    const fallback = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(fallback?.error ?? `ShakurOS image request failed with status ${response.status}`);
  }

  return response.json() as Promise<ImageGenerationResponse>;
}
