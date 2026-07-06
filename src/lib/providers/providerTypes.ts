export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  artifacts?: MessageArtifact[];
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
