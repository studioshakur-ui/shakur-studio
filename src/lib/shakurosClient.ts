import type { Message } from './providers/providerTypes';
import { supabase } from './supabaseClient';
import { detectConversationLanguage } from './intentRouter';
import type { ResolvedPetawIntent } from './intentRouter';
import { getStoredLanguage } from '../i18n/config';
import type { DocumentItem } from './shakurOS';

interface ChatResponse {
  text: string;
  conversationId: string;
  messageId: string;
  provider: string;
  model: string;
  orchestration?: ChatOrchestration;
}

export interface RemoteDocumentRecord {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  status: 'uploaded' | 'processing' | 'ready' | 'partial' | 'failed' | 'deleted';
  contentStatus: 'none' | 'partial' | 'full_text';
  parserType?: string;
  qualityScore?: number;
  errorCode?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

interface StreamEvent {
  event: string;
  data: unknown;
}

interface OrchestrationHints {
  clientIntent: string;
  clientIntentConfidence: number;
  requestedMode: string;
  webSearchRequested: boolean;
  locale?: string;
  country?: string;
}

interface ChatOrchestrationToolAction {
  kind: string;
  status: string;
  priority: number;
  reason: string;
}

interface ChatOrchestrationToolTrace {
  status: 'chat_only' | 'tool_augmented' | 'handoff_required';
  actions: ChatOrchestrationToolAction[];
  handoff?: {
    target: 'image_generation';
    reason: string;
  };
}

interface ChatOrchestration {
  tools?: ChatOrchestrationToolTrace;
  document?: {
    retrieval?: {
      query?: string;
      strategy?: string;
      selectedChunks?: Array<{
        documentId: string;
        chunkIndex: number;
        lexicalScore?: number;
        vectorScore?: number;
        finalScore?: number;
      }>;
    };
  };
}

export interface ChatCompletion {
  text: string;
  artifacts?: Array<{
    type: 'image';
    id: string;
    prompt: string;
    mimeType: 'image/png' | 'image/jpeg' | 'image/webp';
    dataUrl?: string;
    url?: string;
    width: number;
    height: number;
    provider?: string;
    model?: string;
    estimatedCost?: number;
      fallbackUsed?: boolean;
    }>;
  routingTrace?: {
    provider?: string;
    model?: string;
    toolStatus?: 'chat_only' | 'tool_augmented' | 'handoff_required';
    handoffTarget?: 'image_generation';
    documentRetrieval?: {
      query?: string;
      strategy?: string;
      selectedChunks?: Array<{
        documentId: string;
        documentName?: string;
        chunkIndex: number;
        lexicalScore?: number;
        vectorScore?: number;
        finalScore?: number;
      }>;
    };
    actions?: ChatOrchestrationToolAction[];
  };
}

export interface DocumentEmbeddingsBackfillResponse {
  ok?: boolean;
  summary?: {
    documentsScanned?: number;
    documentsEligible?: number;
    documentsEmbedded?: number;
    chunksEmbedded?: number;
    chunksSkipped?: number;
    chunksFailed?: number;
  };
  message?: string;
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

import { userUnderstandingService } from './userUnderstandingService';

function createPayload(
  providerId: string,
  modelId: string,
  messages: Message[],
  files: DocumentItem[],
  webSearchEnabled: boolean,
  stream: boolean,
  intent: ResolvedPetawIntent
) {
  const mode = modelId === 'auto' ? intent.modeId : modelId;

  // Find the last user message to detect the language of the conversation
  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  const detectedLang = detectConversationLanguage(lastUserMessage);

  const context = userUnderstandingService.getLocalFallback();
  const systemInstructions: string[] = [];

  // 1. PETAW Identity Prompt
  systemInstructions.push(
    `[IDENTITÉ PETAW]\n` +
    `Tu es PETAW (qui signifie "seconde pensée" ou "second esprit" en wolof/africain). ` +
    `Tu es un assistant personnel intelligent premium pensé pour l'Afrique, développé par Shakur Studios. ` +
    `Ton but est d'agir comme un "second esprit" pour assister tes utilisateurs dans le travail, l'apprentissage et la création. ` +
    `Réponds de manière claire, concise, et directe. Si l'utilisateur demande qui tu es ou pourquoi tu existes, réponds en incarnant cette identité.`
  );

  // 2. User Context Prompt (if context is filled)
  const profileFields: string[] = [];
  if (context.firstName) profileFields.push(`Prénom: ${context.firstName}`);
  if (context.lastName) profileFields.push(`Nom: ${context.lastName}`);
  if (context.country) profileFields.push(`Pays: ${context.country}`);
  if (context.profession) profileFields.push(`Profession: ${context.profession}`);
  if (context.technicalLevel) profileFields.push(`Niveau technique: ${context.technicalLevel}`);
  if (context.goals) profileFields.push(`Objectifs de l'utilisateur: ${context.goals}`);
  if (context.interests && context.interests.length > 0) profileFields.push(`Domaines d'intérêt: ${context.interests.join(', ')}`);

  if (profileFields.length > 0) {
    systemInstructions.push(
      `[PROFIL DE L'UTILISATEUR]\n` +
      `Personnalise tes réponses en fonction de ce profil (sans mentionner explicitement que tu as accès à ces données sauf si c'est naturel) :\n` +
      profileFields.join('\n')
    );
  }

  // 3. Response Language Preference
  if (context.preferredResponseLanguage === 'wolof') {
    systemInstructions.push(
      `Réponds de préférence en Wolof. Utilise un ton naturel et respectueux, sans mélanger excessivement le français sauf pour les termes techniques.`
    );
  } else if (context.preferredResponseLanguage === 'swahili') {
    systemInstructions.push(
      `Réponds de préférence en Swahili.`
    );
  } else if (detectedLang === 'wo') {
    systemInstructions.push(
      `Réponds en wolof, ton naturel et respectueux, sans mélanger excessivement le français sauf pour les termes techniques.`
    );
  }

  const injectedMessages = systemInstructions.map((content, idx) => ({
    id: `system-injected-${idx}`,
    role: 'system' as const,
    content,
    timestamp: new Date().toISOString()
  }));

  const finalMessages = [...injectedMessages, ...messages];
  const orchestration: OrchestrationHints = {
    clientIntent: intent.id,
    clientIntentConfidence: intent.confidence,
    requestedMode: mode,
    webSearchRequested: webSearchEnabled || intent.webSearchEnabled,
    locale: detectedLang,
    country: context.country
  };

  return {
    mode: inferMode(providerId, mode),
    taskType: intent.taskType,
    webSearchEnabled: webSearchEnabled || intent.webSearchEnabled,
    preferredProviderId: optionalProviderPreference(providerId),
    preferredModelId: optionalModelPreference(mode),
    requiredCapabilities: intent.requiredCapabilities,
    files: files.map((file) => ({
      id: file.id,
      name: file.name,
      mimeType: file.type,
      sizeBytes: file.sizeBytes,
      extractionStatus: file.extractionStatus
    })),
    documentIds: files.map((file) => file.id),
    stream,
    messages: finalMessages,
    orchestration,
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
  files: DocumentItem[],
  webSearchEnabled: boolean,
  onProgress: (text: string) => void,
  intent: ResolvedPetawIntent
): Promise<ChatCompletion> {
  return chatWithoutStreaming(providerId, modelId, messages, files, webSearchEnabled, onProgress, intent);
}

export async function streamChatWithShakurOS(
  providerId: string,
  modelId: string,
  messages: Message[],
  files: DocumentItem[],
  webSearchEnabled: boolean,
  onProgress: (text: string) => void,
  intent: ResolvedPetawIntent
): Promise<ChatCompletion> {
  const response = await fetch(`${API_URL}/v1/chat`, {
    method: 'POST',
    headers: await createHeaders(),
    body: JSON.stringify(createPayload(providerId, modelId, messages, files, webSearchEnabled, true, intent))
  });

  if (!response.ok) {
    const fallback = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(fallback?.error ?? `ShakurOS request failed with status ${response.status}`);
  }

  if (!response.body) {
    return chatWithoutStreaming(providerId, modelId, messages, files, webSearchEnabled, onProgress, intent);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';
  let orchestration: ChatOrchestration | undefined;
  let selectedProvider: string | undefined;
  let selectedModel: string | undefined;

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const parsed = parseSseEvents(buffer);
    buffer = parsed.remaining;

    for (const event of parsed.events) {
      if (event.event === 'metadata') {
        const metadata = event.data as { orchestration?: ChatOrchestration; provider?: string; model?: string };
        orchestration = metadata.orchestration;
        selectedProvider = metadata.provider;
        selectedModel = metadata.model;
      }

      if (event.event === 'token') {
        const chunk = (event.data as { text?: string }).text ?? '';
        text += chunk;
        onProgress(text);
      }

      if (event.event === 'done') {
        const done = event.data as { orchestration?: ChatOrchestration; provider?: string; model?: string };
        orchestration = done.orchestration ?? orchestration;
        selectedProvider = done.provider ?? selectedProvider;
        selectedModel = done.model ?? selectedModel;
      }

      if (event.event === 'error') {
        throw new Error((event.data as { message?: string }).message ?? 'ShakurOS streaming error.');
      }
    }
  }

  const handoff = orchestration?.tools?.handoff;
  if (handoff?.target === 'image_generation') {
    return handleImageGenerationHandoff(text, messages, intent, selectedProvider, selectedModel, orchestration);
  }

  return {
    text,
    routingTrace: buildRoutingTrace(selectedProvider, selectedModel, orchestration, files)
  };
}

async function chatWithoutStreaming(
  providerId: string,
  modelId: string,
  messages: Message[],
  files: DocumentItem[],
  webSearchEnabled: boolean,
  onProgress: (text: string) => void,
  intent: ResolvedPetawIntent
): Promise<ChatCompletion> {
  const response = await fetch(`${API_URL}/v1/chat`, {
    method: 'POST',
    headers: await createHeaders(),
    body: JSON.stringify(createPayload(providerId, modelId, messages, files, webSearchEnabled, false, intent))
  });

  if (!response.ok) {
    const fallback = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(fallback?.error ?? `ShakurOS request failed with status ${response.status}`);
  }

  const result = await response.json() as ChatResponse;
  const handoff = result.orchestration?.tools?.handoff;
  if (handoff?.target === 'image_generation') {
    return handleImageGenerationHandoff(result.text, messages, intent, result.provider, result.model, result.orchestration);
  }

  onProgress(result.text);
  return {
    text: result.text,
    routingTrace: buildRoutingTrace(result.provider, result.model, result.orchestration, files)
  };
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

export async function fetchDocumentsFromShakurOS(): Promise<RemoteDocumentRecord[]> {
  const response = await fetch(`${API_URL}/v1/documents`, {
    method: 'GET',
    headers: await createHeaders()
  });

  if (!response.ok) {
    const fallback = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(fallback?.error ?? `ShakurOS documents request failed with status ${response.status}`);
  }

  const result = await response.json() as { documents?: RemoteDocumentRecord[] };
  return Array.isArray(result.documents) ? result.documents : [];
}

export async function fetchDocumentStatusFromShakurOS(documentId: string): Promise<RemoteDocumentRecord> {
  const response = await fetch(`${API_URL}/v1/documents/${documentId}`, {
    method: 'GET',
    headers: await createHeaders()
  });

  if (!response.ok) {
    const fallback = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(fallback?.error ?? `ShakurOS document lookup failed with status ${response.status}`);
  }

  const result = await response.json() as { document?: RemoteDocumentRecord };
  if (!result.document) {
    throw new Error('ShakurOS document lookup did not return a document.');
  }

  return result.document;
}

export async function registerDocumentWithShakurOS(file: Pick<File, 'name' | 'size' | 'type'>): Promise<RemoteDocumentRecord> {
  const response = await fetch(`${API_URL}/v1/documents`, {
    method: 'POST',
    headers: await createHeaders(),
    body: JSON.stringify({
      filename: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size
    })
  });

  if (!response.ok) {
    const fallback = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(fallback?.error ?? `ShakurOS document registration failed with status ${response.status}`);
  }

  const result = await response.json() as { document?: RemoteDocumentRecord };
  if (!result.document) {
    throw new Error('ShakurOS document registration did not return a document.');
  }

  return result.document;
}

export async function uploadDocumentContentToShakurOS(documentId: string, file: File): Promise<RemoteDocumentRecord> {
  const accessToken = await getAccessToken();
  const response = await fetch(`${API_URL}/v1/documents/${documentId}/content`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': file.type || 'application/octet-stream'
    },
    body: file
  });

  if (!response.ok) {
    const fallback = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(fallback?.error ?? `ShakurOS document content upload failed with status ${response.status}`);
  }

  const result = await response.json() as { accepted?: boolean; document?: RemoteDocumentRecord };
  if (!result.document) {
    throw new Error('ShakurOS document content upload did not return a document.');
  }

  return result.document;
}

export async function deleteDocumentFromShakurOS(documentId: string): Promise<void> {
  const response = await fetch(`${API_URL}/v1/documents/${documentId}`, {
    method: 'DELETE',
    headers: await createHeaders()
  });

  if (!response.ok) {
    const fallback = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(fallback?.error ?? `ShakurOS document delete failed with status ${response.status}`);
  }
}

export async function backfillDocumentEmbeddingsWithShakurOS(): Promise<DocumentEmbeddingsBackfillResponse> {
  const response = await fetch(`${API_URL}/v1/documents/backfill-embeddings`, {
    method: 'POST',
    headers: await createHeaders()
  });

  if (!response.ok) {
    const fallback = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(fallback?.error ?? `ShakurOS embeddings backfill failed with status ${response.status}`);
  }

  return response.json() as Promise<DocumentEmbeddingsBackfillResponse>;
}

export async function reprocessDocumentWithShakurOS(documentId: string): Promise<RemoteDocumentRecord> {
  const response = await fetch(`${API_URL}/v1/documents/${documentId}/reprocess`, {
    method: 'POST',
    headers: await createHeaders()
  });

  if (!response.ok) {
    const fallback = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(fallback?.error ?? `ShakurOS document reprocess failed with status ${response.status}`);
  }

  const result = await response.json() as { document?: RemoteDocumentRecord };
  if (!result.document) {
    throw new Error('ShakurOS document reprocess did not return a document.');
  }

  return result.document;
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

async function handleImageGenerationHandoff(
  fallbackText: string,
  messages: Message[],
  intent: ResolvedPetawIntent,
  provider?: string,
  model?: string,
  orchestration?: ChatOrchestration
): Promise<ChatCompletion> {
  const prompt = resolveImagePrompt(messages, intent);
  if (!prompt) {
    return { text: fallbackText };
  }

  const language = getStoredLanguage();
  const imageResult = await generateImageWithShakurOS({
    prompt,
    mode: intent.modeId === 'premium' ? 'premium' : intent.modeId === 'economy' ? 'economical' : intent.modeId === 'local' ? 'local' : 'auto',
    quality: intent.modeId === 'premium' ? 'high' : 'standard',
    style: 'african-premium',
    size: '1024x1024',
    count: 1,
    locale: language
  });

  const text = language === 'fr' ? "Voici l'image." : 'Here is the image.';
  return {
    text,
    artifacts: imageResult.images.map((image) => ({
      type: 'image' as const,
      id: image.id,
      prompt: image.prompt,
      mimeType: image.mimeType,
      dataUrl: image.dataUrl,
      url: image.url,
      width: image.width,
      height: image.height,
      provider: imageResult.provider,
      model: imageResult.model,
      estimatedCost: imageResult.estimatedCost,
      fallbackUsed: imageResult.fallbackUsed
    })),
    routingTrace: buildRoutingTrace(provider, model, orchestration, [])
  };
}

function resolveImagePrompt(messages: Message[], intent: ResolvedPetawIntent): string {
  if (typeof intent.metadata.imagePrompt === 'string' && intent.metadata.imagePrompt.trim()) {
    return intent.metadata.imagePrompt.trim();
  }

  const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user')?.content.trim();
  return lastUserMessage ?? '';
}

function buildRoutingTrace(
  provider: string | undefined,
  model: string | undefined,
  orchestration?: ChatOrchestration,
  documentFiles: DocumentItem[] = []
): ChatCompletion['routingTrace'] {
  const knownDocuments = new Map<string, string>(documentFiles.map((document) => [document.id, document.name]));
  return {
    provider,
    model,
    toolStatus: orchestration?.tools?.status,
    handoffTarget: orchestration?.tools?.handoff?.target,
    documentRetrieval: orchestration?.document?.retrieval
      ? {
          ...orchestration.document.retrieval,
          selectedChunks: orchestration.document.retrieval.selectedChunks?.map((chunk) => ({
            ...chunk,
            documentName: knownDocuments.get(chunk.documentId)
          }))
      }
      : undefined,
    actions: orchestration?.tools?.actions
  };
}
