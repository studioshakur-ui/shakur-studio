import { Message } from './providers/providerTypes';
import { routeAndGenerate, getModelById, DEFAULT_MODEL_ID } from './modelRouter';

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
  type: string;
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
      defaultProviderId: 'gemini',
      defaultModelId: DEFAULT_MODEL_ID
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
        return JSON.parse(data);
      } catch {
        // Fallback
      }
    }
    const defaults: DocumentItem[] = [
      { id: '1', name: 'guide_technique_reseau_afrique.pdf', size: '2.4 MB', type: 'application/pdf', uploadedAt: new Date().toISOString() },
      { id: '2', name: 'cahier_des_charges_v1.docx', size: '412 KB', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', uploadedAt: new Date().toISOString() }
    ];
    this.saveDocuments(defaults);
    return defaults;
  }

  static saveDocuments(documents: DocumentItem[]): void {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  }

  static uploadDocument(name: string, sizeBytes: number, type: string): DocumentItem {
    const documents = this.getDocuments();
    
    // Format size
    let sizeStr = `${sizeBytes} B`;
    if (sizeBytes >= 1024 * 1024) {
      sizeStr = `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
    } else if (sizeBytes >= 1024) {
      sizeStr = `${(sizeBytes / 1024).toFixed(0)} KB`;
    }

    const newItem: DocumentItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      name,
      size: sizeStr,
      type,
      uploadedAt: new Date().toISOString()
    };
    documents.unshift(newItem);
    this.saveDocuments(documents);
    return newItem;
  }

  static deleteDocument(id: string): void {
    const documents = this.getDocuments();
    const filtered = documents.filter(d => d.id !== id);
    this.saveDocuments(filtered);
  }

  // --- Run Generations via Router ---
  static async chat(
    providerId: string,
    modelId: string,
    messages: Message[],
    webSearchEnabled: boolean,
    onProgress: (chunk: string) => void
  ): Promise<string> {
    return routeAndGenerate(providerId, modelId, messages, webSearchEnabled, onProgress);
  }
}
