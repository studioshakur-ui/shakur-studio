import { Message } from './providers/providerTypes';

export type PetawModeId = 'auto' | 'fast' | 'economy' | 'premium' | 'local';
export type ShakurTaskType = 'general' | 'education' | 'coding' | 'writing' | 'translation' | 'summarization' | 'reasoning' | 'document';
export type ShakurCapability = 'chat' | 'vision' | 'code' | 'reasoning' | 'translation' | 'summarization' | 'document';
export type PetawIntentId =
  | 'ask'
  | 'general'
  | 'capture'
  | 'image_generation'
  | 'search'
  | 'write'
  | 'writing'
  | 'study'
  | 'education'
  | 'work'
  | 'voice'
  | 'memory';

export interface PetawIntentPreset {
  id: PetawIntentId;
  modeId: PetawModeId;
  taskType: ShakurTaskType;
  requiredCapabilities: ShakurCapability[];
  webSearchEnabled?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ResolvedPetawIntent {
  id: PetawIntentId;
  modeId: PetawModeId;
  taskType: ShakurTaskType;
  requiredCapabilities: ShakurCapability[];
  webSearchEnabled: boolean;
  confidence: number;
  metadata: Record<string, unknown>;
}

interface ResolveIntentOptions {
  text: string;
  messages: Message[];
  webSearchEnabled: boolean;
  preset?: PetawIntentPreset;
}

const INTENT_KEYWORDS: Array<{
  id: PetawIntentId;
  modeId: PetawModeId;
  taskType: ShakurTaskType;
  requiredCapabilities: ShakurCapability[];
  terms: string[];
  confidence: number;
}> = [
  {
    id: 'image_generation',
    modeId: 'premium',
    taskType: 'general',
    requiredCapabilities: ['chat'],
    terms: [
      'génère une image',
      'genere une image',
      'crée une image',
      'cree une image',
      'dessine',
      'illustration de',
      'image de',
      'photo réaliste de',
      'photo realiste de',
      'generate an image',
      'create an image',
      'draw',
      'make an image'
    ],
    confidence: 0.94
  },
  {
    id: 'capture',
    modeId: 'premium',
    taskType: 'document',
    requiredCapabilities: ['chat'],
    terms: ['pdf', 'document', 'fichier', 'capture', 'photo', 'image', 'scan', 'résume ce document', 'analyze this document'],
    confidence: 0.88
  },
  {
    id: 'write',
    modeId: 'premium',
    taskType: 'writing',
    requiredCapabilities: ['chat'],
    terms: ['rédige', 'écris', 'write', 'email', 'mail', 'post', 'message', 'lettre'],
    confidence: 0.82
  },
  {
    id: 'study',
    modeId: 'premium',
    taskType: 'education',
    requiredCapabilities: ['chat'],
    terms: ['explique', 'apprends', 'enseigne', 'quiz', 'lesson', 'teach', 'understand', 'compréhension'],
    confidence: 0.82
  },
  {
    id: 'work',
    modeId: 'premium',
    taskType: 'reasoning',
    requiredCapabilities: ['chat'],
    terms: ['plan', 'stratégie', 'decision', 'décision', 'compare', 'devis', 'brief', 'workflow', 'priorité'],
    confidence: 0.8
  },
  {
    id: 'search',
    modeId: 'fast',
    taskType: 'general',
    requiredCapabilities: ['chat'],
    terms: ['cherche', 'recherche', 'search', 'latest', 'récent', 'news', 'web'],
    confidence: 0.84
  },
  {
    id: 'voice',
    modeId: 'fast',
    taskType: 'general',
    requiredCapabilities: ['chat'],
    terms: ['dicte', 'dictée', 'voice', 'vocal', 'spoken', 'note vocale'],
    confidence: 0.78
  },
  {
    id: 'memory',
    modeId: 'auto',
    taskType: 'reasoning',
    requiredCapabilities: ['chat'],
    terms: ['souviens', 'remember', 'mémoire', 'memory', 'ce que tu sais de moi'],
    confidence: 0.78
  }
];

export function resolvePetawIntent(options: ResolveIntentOptions): ResolvedPetawIntent {
  if (options.preset) {
    return {
      id: options.preset.id,
      modeId: options.preset.modeId,
      taskType: options.preset.taskType,
      requiredCapabilities: options.preset.requiredCapabilities,
      webSearchEnabled: Boolean(options.preset.webSearchEnabled || options.webSearchEnabled),
      confidence: 1,
      metadata: {
        source: 'preset',
        ...options.preset.metadata
      }
    };
  }

  const latestUserText = options.text.trim().toLowerCase() || [...options.messages].reverse().find((message) => message.role === 'user')?.content.toLowerCase() || '';

  const match = INTENT_KEYWORDS.find((candidate) => candidate.terms.some((term) => latestUserText.includes(term)));
  if (match) {
    return {
      id: match.id,
      modeId: match.modeId,
      taskType: match.taskType,
      requiredCapabilities: match.requiredCapabilities,
      webSearchEnabled: options.webSearchEnabled || match.id === 'search',
      confidence: match.confidence,
      metadata: {
        source: 'heuristic',
        matchedIntent: match.id
      }
    };
  }

  return {
    id: 'general',
    modeId: 'auto',
    taskType: 'general',
    requiredCapabilities: ['chat'],
    webSearchEnabled: options.webSearchEnabled,
    confidence: 0.52,
    metadata: {
      source: 'default'
    }
  };
}
