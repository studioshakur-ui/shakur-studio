export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

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
  generateResponse: (
    modelId: string,
    messages: Message[],
    webSearchEnabled: boolean,
    onProgress: (chunk: string) => void
  ) => Promise<string>;
}
