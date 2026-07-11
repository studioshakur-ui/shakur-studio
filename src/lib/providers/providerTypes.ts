export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachments?: MessageAttachment[];
  artifacts?: MessageArtifact[];
  routingTrace?: MessageRoutingTrace;
}

export interface MessageAttachment {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  status?: 'uploaded' | 'processing' | 'ready' | 'partial' | 'failed' | 'deleted';
  parserType?: string;
  extractionStatus?: 'none' | 'partial' | 'full_text';
}

export interface MessageRoutingTrace {
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
  actions?: Array<{
    kind: string;
    status: string;
    priority: number;
    reason: string;
  }>;
}

export type MessageArtifact =
  | {
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
    };

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  description: string;
}

export interface ModelProvider {
  id: string;
  name: string;
  models: ModelConfig[];
}
