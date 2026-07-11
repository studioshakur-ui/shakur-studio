import type { Message } from './providers/providerTypes';
import {
  backfillDocumentEmbeddingsWithShakurOS,
  chatWithShakurOS,
  deleteDocumentFromShakurOS,
  fetchDocumentStatusFromShakurOS,
  fetchDocumentsFromShakurOS,
  generateImageWithShakurOS,
  reprocessDocumentWithShakurOS,
  registerDocumentWithShakurOS,
  uploadDocumentContentToShakurOS,
  type RemoteDocumentRecord
} from './shakurosClient';
import type { ChatCompletion, GenerateImageOptions, ImageGenerationResponse } from './shakurosClient';
import type { DocumentEmbeddingsBackfillResponse } from './shakurosClient';
import type { ResolvedPetawIntent } from './intentRouter';

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  modelId: string;
  providerId: string;
  createdAt: string;
}

export interface MemoryItem {
  id: string;
  content: string;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  size: string;
  sizeBytes: number;
  type: string;
  status: 'uploaded' | 'processing' | 'ready' | 'partial' | 'failed' | 'deleted';
  extractionStatus: 'none' | 'partial' | 'full_text';
  parserType?: string;
  qualityScore?: number;
  errorCode?: string;
  errorMessage?: string;
  uploadedAt: string;
}

export interface UserProfile {
  name: string;
  defaultProviderId: string;
  defaultModelId: string;
}

const STORAGE_KEYS = {
  PROFILE: 'petaw_profile',
  CONVERSATIONS: 'petaw_conversations',
  MEMORIES: 'petaw_memories',
  DOCUMENTS: 'petaw_documents',
  API_KEYS: 'petaw_api_keys'
};

export class ShakurOS {
  // --- Profile Management ---
  static getProfile(): UserProfile {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        // Fallback
      }
    }
    return {
      name: 'Utilisateur',
      defaultProviderId: 'auto',
      defaultModelId: 'auto'
    };
  }

  static saveProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }

  // --- API Keys Management ---
  static getApiKeys(): Record<string, string> {
    const data = localStorage.getItem(STORAGE_KEYS.API_KEYS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        // Fallback
      }
    }
    return {
      openai: 'sk-••••••••••••••••',
      anthropic: 'sk-ant-••••••••••••',
      gemini: 'ai-za-••••••••••••••',
      deepseek: 'sk-ds-••••••••••••••',
      groq: 'gsk-••••••••••••••••',
      ollama: 'http://localhost:11434'
    };
  }

  static saveApiKeys(keys: Record<string, string>): void {
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(keys));
  }

  // --- Conversations Management ---
  static getConversations(): Conversation[] {
    const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        // Fallback
      }
    }
    return [];
  }

  static saveConversations(conversations: Conversation[]): void {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  }

  static saveConversation(conversation: Conversation): void {
    const conversations = this.getConversations();
    const idx = conversations.findIndex(c => c.id === conversation.id);
    if (idx >= 0) {
      conversations[idx] = conversation;
    } else {
      conversations.unshift(conversation);
    }
    this.saveConversations(conversations);
  }

  static deleteConversation(id: string): void {
    const conversations = this.getConversations();
    const filtered = conversations.filter(c => c.id !== id);
    this.saveConversations(filtered);
  }

  // --- Memories Management ---
  static getMemories(): MemoryItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.MEMORIES);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        // Fallback
      }
    }
    // Set some defaults to look professional at first load
    const defaults: MemoryItem[] = [
      { id: '1', content: 'Préfère les explications de code commentées en français.', createdAt: new Date().toISOString() },
      { id: '2', content: 'Développe des solutions pour des débits internet parfois instables (Afrique de l\'Ouest).', createdAt: new Date().toISOString() }
    ];
    this.saveMemories(defaults);
    return defaults;
  }

  static saveMemories(memories: MemoryItem[]): void {
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
  }

  static addMemory(content: string): MemoryItem {
    const memories = this.getMemories();
    const newItem: MemoryItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      content,
      createdAt: new Date().toISOString()
    };
    memories.unshift(newItem);
    this.saveMemories(memories);
    return newItem;
  }

  static deleteMemory(id: string): void {
    const memories = this.getMemories();
    const filtered = memories.filter(m => m.id !== id);
    this.saveMemories(filtered);
  }

  // --- Documents Management ---
  static getDocuments(): DocumentItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (data) {
      try {
        const parsed = JSON.parse(data) as Array<Partial<DocumentItem>>;
        return parsed.map((doc) => ({
          id: doc.id ?? (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9)),
          name: doc.name ?? 'document',
          size: doc.size ?? '0 B',
          sizeBytes: typeof doc.sizeBytes === 'number' ? doc.sizeBytes : 0,
          type: doc.type ?? 'application/octet-stream',
          status: doc.status === 'processing' || doc.status === 'ready' || doc.status === 'partial' || doc.status === 'failed' || doc.status === 'deleted'
            ? doc.status
            : 'uploaded',
          extractionStatus: doc.extractionStatus === 'partial' || doc.extractionStatus === 'full_text' ? doc.extractionStatus : 'none',
          parserType: typeof doc.parserType === 'string' ? doc.parserType : undefined,
          qualityScore: typeof doc.qualityScore === 'number' ? doc.qualityScore : undefined,
          errorCode: typeof doc.errorCode === 'string' ? doc.errorCode : undefined,
          errorMessage: typeof doc.errorMessage === 'string' ? doc.errorMessage : undefined,
          uploadedAt: doc.uploadedAt ?? new Date().toISOString()
        }));
      } catch {
        // Fallback
      }
    }
    return [];
  }

  static saveDocuments(documents: DocumentItem[]): void {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  }

  static async refreshDocuments(): Promise<DocumentItem[]> {
    const remoteDocuments = await fetchDocumentsFromShakurOS();
    const mapped = remoteDocuments.map((document) => this.mapRemoteDocument(document));
    this.saveDocuments(mapped);
    return mapped;
  }

  static async refreshDocument(documentId: string): Promise<DocumentItem> {
    const remote = await fetchDocumentStatusFromShakurOS(documentId);
    const mapped = this.mapRemoteDocument(remote);
    const documents = this.getDocuments().filter((document) => document.id !== mapped.id);
    documents.unshift(mapped);
    this.saveDocuments(documents);
    return mapped;
  }

  static async uploadDocument(file: File): Promise<DocumentItem> {
    const registeredDocument = await registerDocumentWithShakurOS(file);
    try {
      const processedDocument = await uploadDocumentContentToShakurOS(registeredDocument.id, file);
      const newItem = this.mapRemoteDocument(processedDocument);
      const documents = this.getDocuments().filter((document) => document.id !== newItem.id);
      documents.unshift(newItem);
      this.saveDocuments(documents);
      return newItem;
    } catch (error) {
      await deleteDocumentFromShakurOS(registeredDocument.id).catch(() => undefined);
      throw error;
    }
  }

  static async deleteDocument(id: string): Promise<void> {
    await deleteDocumentFromShakurOS(id);
    const documents = this.getDocuments();
    const filtered = documents.filter(d => d.id !== id);
    this.saveDocuments(filtered);
  }

  static async backfillEmbeddings(): Promise<DocumentEmbeddingsBackfillResponse> {
    return backfillDocumentEmbeddingsWithShakurOS();
  }

  static async reprocessDocument(id: string): Promise<DocumentItem> {
    const remote = await reprocessDocumentWithShakurOS(id);
    const mapped = this.mapRemoteDocument(remote);
    const documents = this.getDocuments().filter((document) => document.id !== mapped.id);
    documents.unshift(mapped);
    this.saveDocuments(documents);
    return mapped;
  }

  // --- Run Generations via Router ---
  static async chat(
    providerId: string,
    modelId: string,
    messages: Message[],
    files: DocumentItem[],
    webSearchEnabled: boolean,
    onProgress: (chunk: string) => void,
    intent: ResolvedPetawIntent
  ): Promise<ChatCompletion> {
    return chatWithShakurOS(providerId, modelId, messages, files, webSearchEnabled, onProgress, intent);
  }

  static async generateImage(options: GenerateImageOptions): Promise<ImageGenerationResponse> {
    return generateImageWithShakurOS(options);
  }

  private static mapRemoteDocument(document: RemoteDocumentRecord): DocumentItem {
    return {
      id: document.id,
      name: document.filename,
      size: formatBytes(document.sizeBytes),
      sizeBytes: document.sizeBytes,
      type: document.mimeType,
      status: document.status,
      extractionStatus: document.contentStatus,
      parserType: document.parserType,
      qualityScore: document.qualityScore,
      errorCode: document.errorCode,
      errorMessage: document.errorMessage,
      uploadedAt: document.createdAt
    };
  }
}

function formatBytes(sizeBytes: number): string {
  if (sizeBytes >= 1024 * 1024) {
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (sizeBytes >= 1024) {
    return `${(sizeBytes / 1024).toFixed(0)} KB`;
  }
  return `${sizeBytes} B`;
}
