import { Message } from './providers/providerTypes';
import { getStoredLanguage } from '../i18n/config';

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
      'make an image',
      // Wolof equivalents (verified: nataal/natal means draw/image)
      'nataal',
      'natal',
      'defal ma nataal',
      'sosal ma nataal'
    ],
    confidence: 0.94
  },
  {
    id: 'capture',
    modeId: 'premium',
    taskType: 'document',
    requiredCapabilities: ['chat'],
    terms: [
      'pdf', 'document', 'fichier', 'capture', 'photo', 'image', 'scan', 'résume ce document', 'analyze this document',
      // Wolof equivalents (verified: kayit/keuyit means paper/document; tënk means summarize/summary)
      'kayit',
      'keuyit',
      'tënk kayit',
      'teunk kayit'
    ],
    confidence: 0.88
  },
  {
    id: 'write',
    modeId: 'premium',
    taskType: 'writing',
    requiredCapabilities: ['chat'],
    terms: [
      'rédige', 'écris', 'write', 'email', 'mail', 'post', 'message', 'lettre',
      // Wolof equivalents (verified: bind means write; bindal means write for; araf means letter/character; bataaxal/batahal means message/letter)
      'bind',
      'bindal',
      'araf',
      'bataaxal',
      'batahal'
    ],
    confidence: 0.82
  },
  {
    id: 'study',
    modeId: 'premium',
    taskType: 'education',
    requiredCapabilities: ['chat'],
    terms: [
      'explique', 'apprends', 'enseigne', 'quiz', 'lesson', 'teach', 'understand', 'compréhension',
      // Wolof equivalents (NOTE: faramfacce/faramfaye need verification by a native speaker)
      'leeral',
      'faramfacce',
      'faramfaye',
      'jang',
      'diang',
      'jangal',
      'diangal'
    ],
    confidence: 0.82
  },
  {
    id: 'work',
    modeId: 'premium',
    taskType: 'reasoning',
    requiredCapabilities: ['chat'],
    terms: [
      'plan', 'stratégie', 'decision', 'décision', 'compare', 'devis', 'brief', 'workflow', 'priorité',
      // Wolof equivalents (NOTE: dogal, natt, pessef/pëssëf need verification by a native speaker)
      'dogal',
      'natt',
      'pessef',
      'pëssëf'
    ],
    confidence: 0.8
  },
  {
    id: 'search',
    modeId: 'fast',
    taskType: 'general',
    requiredCapabilities: ['chat'],
    terms: [
      'cherche', 'recherche', 'search', 'latest', 'récent', 'news', 'web',
      // Wolof equivalents (verified: seet/wut means search/look for; xibaar/hibar means news; lu bees means what is new/latest)
      'seet',
      'wut',
      'xibaar',
      'hibar',
      'lu bees'
    ],
    confidence: 0.84
  },
  {
    id: 'voice',
    modeId: 'fast',
    taskType: 'general',
    requiredCapabilities: ['chat'],
    terms: [
      'dicte', 'dictée', 'voice', 'vocal', 'spoken', 'note vocale',
      // Wolof equivalents (NOTE: kaddoo/kaddo needs verification by a native speaker)
      'waxal',
      'baat',
      'kaddoo',
      'kaddo'
    ],
    confidence: 0.78
  },
  {
    id: 'memory',
    modeId: 'auto',
    taskType: 'reasoning',
    requiredCapabilities: ['chat'],
    terms: [
      'souviens', 'remember', 'mémoire', 'memory', 'ce que tu sais de moi',
      // Wolof equivalents (NOTE: fataliku/fattalikoo need verification by a native speaker)
      'fataliku',
      'fattalikoo',
      'lu ma waxoon',
      'luma waxon'
    ],
    confidence: 0.78
  }
];

const IMAGE_TRIGGER_WORDS = ['image', 'images', 'photo', 'photos', 'illustration', 'dessin', 'nataal', 'natal'];
const GENERATION_VERBS = [
  'genere', 'génère', 'genererais', 'generer', 'générer',
  'cree', 'crée', 'creer', 'créer',
  'dessine', 'dessiner',
  'fais', 'fait', 'faire',
  'defal', 'sosal'
];

// Cheap edit-distance check so short mobile-typo replies (e.g. "ilmage") still
// resolve to the same intent a correctly spelled reply would.
function levenshteinDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, (_, i) => [i, ...new Array(cols - 1).fill(0)]);
  for (let j = 1; j < cols; j += 1) matrix[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[rows - 1][cols - 1];
}

function containsLikelyImageMention(text: string): boolean {
  const words = stripAccents(text.toLowerCase()).split(/[^a-z]+/).filter(Boolean);
  return words.some((word) => IMAGE_TRIGGER_WORDS.some((target) => levenshteinDistance(word, target) <= 1));
}

function findEarlierGenerationRequest(messages: Message[]): Message | undefined {
  return [...messages].reverse().find((message) => {
    if (message.role !== 'user') return false;
    const normalized = stripAccents(message.content.toLowerCase());
    return GENERATION_VERBS.some((verb) => normalized.includes(verb));
  });
}

const TEMPORAL_CORRECTION_MARKERS = [
  'on est en', 'nous sommes en', 'on est le', 'nous sommes le',
  'en fait on est', 'actuellement on est', "aujourd'hui on est",
  'we are in', 'it is currently', "it's currently", 'today is'
];

function mentionsYear(text: string): boolean {
  return /\b(19|20)\d{2}\b/.test(text);
}

// A bare date correction like "on est en juillet 2026" carries no subject of
// its own — it only makes sense as a correction to an earlier real-time
// question in the same conversation (e.g. "qui est le président de
// l'assemblée"). Detecting it lets us re-run the search instead of letting
// the model answer the correction from its own (possibly stale) training
// knowledge, which can silently contradict the answer already given earlier
// in the same conversation.
function isTemporalCorrection(text: string): boolean {
  const normalized = stripAccents(text.toLowerCase());
  return mentionsYear(normalized) && TEMPORAL_CORRECTION_MARKERS.some((marker) => normalized.includes(stripAccents(marker)));
}

function findEarlierRealtimeQuery(messages: Message[]): Message | undefined {
  return [...messages].reverse().find((message) => message.role === 'user' && detectRealtimeQuery(message.content.toLowerCase()));
}

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

  if (detectRealtimeQuery(latestUserText)) {
    return {
      id: 'search',
      modeId: 'fast',
      taskType: 'general',
      requiredCapabilities: ['chat'],
      webSearchEnabled: true,
      confidence: 0.9,
      metadata: {
        source: 'realtime_detector',
        query: latestUserText
      }
    };
  }

  if (isTemporalCorrection(latestUserText)) {
    const earlierRealtimeQuery = findEarlierRealtimeQuery(options.messages);
    if (earlierRealtimeQuery) {
      return {
        id: 'search',
        modeId: 'fast',
        taskType: 'general',
        requiredCapabilities: ['chat'],
        webSearchEnabled: true,
        confidence: 0.88,
        metadata: {
          source: 'temporal_correction_followup',
          query: `${earlierRealtimeQuery.content} (${options.text.trim()})`
        }
      };
    }
  }

  // A short reply like "une ilmage" (typo of "image") answering PETAW's own
  // clarification after an earlier "génère/crée ..." request should still
  // resolve to image_generation, even though it doesn't match the exact
  // phrases in INTENT_KEYWORDS and the word itself may be misspelled.
  const earlierGenerationRequest = containsLikelyImageMention(latestUserText)
    ? findEarlierGenerationRequest(options.messages)
    : undefined;
  if (earlierGenerationRequest) {
    return {
      id: 'image_generation',
      modeId: 'premium',
      taskType: 'general',
      requiredCapabilities: ['chat'],
      webSearchEnabled: options.webSearchEnabled,
      confidence: 0.9,
      metadata: {
        source: 'context_followup',
        matchedIntent: 'image_generation',
        // The reply itself ("une ilmage") carries no subject — the actual
        // thing to draw was named in the earlier turn that prompted PETAW's
        // clarifying question, so combine both for the actual image prompt.
        imagePrompt: `${earlierGenerationRequest.content} ${options.text.trim()}`.trim()
      }
    };
  }

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

const WOLOF_HIGH_CONF: Set<string> = new Set([
  'naka', 'dama', 'damay', 'yaangi', 'yangi', 'lii', 'ndax', 'ndaxte', 'sama', 'mën',
  'waaw', 'waw', 'deedeet', 'bii', 'lan', 'kane', 'kañ', 'koy', 'ngi', 'ñeup', 'ñepp', 'ñëpp', 'nepp', 'neup',
  'loo', 'soo', 'ngeen', 'yeen', 'ñu', 'nga', 'bëgg', 'begg', 'dëgg', 'degg', 'jërëjëf', 'jerejef', 'lutax',
  'nanga', 'rekk', 'rek', 'laata', 'bala', 'jamm', 'bind', 'bindal', 'dimbali',
  'xarit', 'lolu', 'nit', 'yalla', 'ndox', 'kër', 'ker', 'ceeb', 'jën', 'baax', 'bax',
  'tuuti', 'bari', 'pëssëf', 'pessef', 'tënk', 'teunk', 'defal', 'waxal'
]);

const FRENCH_STOPWORDS: Set<string> = new Set([
  'le', 'la', 'les', 'de', 'des', 'un', 'une', 'et', 'en', 'du', 'au', 'aux', 'pour',
  'dans', 'sur', 'ce', 'cet', 'cette', 'ces', 'mon', 'ton', 'son', 'ma', 'ta', 'sa',
  'mes', 'tes', 'ses', 'nous', 'vous', 'ils', 'elles', 'je', 'tu', 'il', 'elle', 'on',
  'mais', 'ou', 'donc', 'or', 'ni', 'car', 'qui', 'que', 'quoi', 'dont', 'avec', 'sans',
  'sous', 'par', 'est', 'sont', 'suis', 'es', 'avez', 'ont', 'fait', 'faire', 'comment',
  'pourquoi', 'ecris', 'redige', 'explique'
]);

const ENGLISH_STOPWORDS: Set<string> = new Set([
  'the', 'and', 'of', 'to', 'in', 'is', 'it', 'you', 'that', 'he', 'was', 'for',
  'on', 'are', 'as', 'with', 'his', 'they', 'at', 'be', 'this', 'have', 'from', 'or',
  'one', 'had', 'by', 'but', 'not', 'what', 'all', 'were', 'we', 'when', 'your', 'can',
  'said', 'there', 'use', 'each', 'which', 'she', 'do', 'how', 'their', 'if', 'write',
  'explain'
]);

function stripAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const REALTIME_KEYWORDS = [
  // French
  'qui est', 'qui sont', 'quel est', 'quelle est', 'quels sont', 'quelles sont',
  'actualité', 'actualite', 'météo', 'meteo', 'score', 'match', 'élection', 'election',
  'prix de', 'aujourd\'hui', 'cette semaine', 'en ce moment', 'bourse', 'classement',
  'dernier événement', 'derniers événements',
  // English
  'who is', 'who are', 'what is', 'what are', 'news', 'weather', 'match score',
  'election', 'stock price', 'today', 'this week', 'currently', 'latest events',
  // Wolof
  'kan la', 'kan lan', 'lan la', 'lan lan', 'xibaar', 'hibar', 'tey', 'seyt',
  'jaww', 'lu bees', 'lu bes'
];

export function detectRealtimeQuery(text: string): boolean {
  if (!text) return false;
  const clean = stripAccents(text.toLowerCase().trim());
  return REALTIME_KEYWORDS.some((kw) => {
    const cleanKw = stripAccents(kw);
    return clean.includes(cleanKw);
  });
}

export function detectConversationLanguage(text: string): 'fr' | 'en' | 'wo' {
  const cleanText = text.trim().toLowerCase();
  if (!cleanText) {
    const uiLang = typeof window !== 'undefined' ? getStoredLanguage() : 'fr';
    return uiLang;
  }

  // Tokenize replacing punctuation and apostrophes with space to keep words with diacritics intact
  const words = cleanText
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    const uiLang = typeof window !== 'undefined' ? getStoredLanguage() : 'fr';
    return uiLang;
  }

  let wolofScore = 0;
  let frenchScore = 0;
  let englishScore = 0;

  for (const word of words) {
    const cleanWord = stripAccents(word);
    
    if (WOLOF_HIGH_CONF.has(cleanWord) || WOLOF_HIGH_CONF.has(word)) {
      wolofScore += 1;
    }
    if (FRENCH_STOPWORDS.has(cleanWord) || FRENCH_STOPWORDS.has(word)) {
      frenchScore += 1;
    }
    if (ENGLISH_STOPWORDS.has(cleanWord) || ENGLISH_STOPWORDS.has(word)) {
      englishScore += 1;
    }
  }

  // Check Wolof dominance. We require wolofScore > 0, and it must be greater than or equal to the FR and EN scores.
  if (wolofScore > 0 && wolofScore >= frenchScore && wolofScore >= englishScore) {
    return 'wo';
  }

  // Fallback / standard detection
  if (frenchScore > englishScore) {
    return 'fr';
  }
  if (englishScore > frenchScore) {
    return 'en';
  }

  // If ambiguous or no score, fallback to the UI language
  const uiLang = typeof window !== 'undefined' ? getStoredLanguage() : 'fr';
  return uiLang;
}
