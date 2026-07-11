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
  matches: (text: string) => boolean;
  confidence: number;
}> = [
  {
    id: 'image_generation',
    modeId: 'premium',
    taskType: 'general',
    requiredCapabilities: ['chat'],
    matches: hasImageGenerationIntent,
    confidence: 0.92
  },
  {
    id: 'capture',
    modeId: 'premium',
    taskType: 'document',
    requiredCapabilities: ['chat', 'document'],
    matches: hasCaptureIntent,
    confidence: 0.86
  },
  {
    id: 'write',
    modeId: 'premium',
    taskType: 'writing',
    requiredCapabilities: ['chat'],
    matches: hasWritingIntent,
    confidence: 0.8
  },
  {
    id: 'study',
    modeId: 'premium',
    taskType: 'education',
    requiredCapabilities: ['chat'],
    matches: hasStudyIntent,
    confidence: 0.8
  },
  {
    id: 'work',
    modeId: 'premium',
    taskType: 'reasoning',
    requiredCapabilities: ['chat'],
    matches: hasWorkIntent,
    confidence: 0.78
  },
  {
    id: 'search',
    modeId: 'fast',
    taskType: 'general',
    requiredCapabilities: ['chat'],
    matches: hasExplicitSearchIntent,
    confidence: 0.84
  },
  {
    id: 'voice',
    modeId: 'fast',
    taskType: 'general',
    requiredCapabilities: ['chat'],
    matches: hasVoiceIntent,
    confidence: 0.78
  },
  {
    id: 'memory',
    modeId: 'auto',
    taskType: 'reasoning',
    requiredCapabilities: ['chat'],
    matches: hasMemoryIntent,
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
    return hasImageGenerationIntent(message.content);
  });
}

const TEMPORAL_CORRECTION_MARKERS = [
  'on est en', 'nous sommes en', 'on est le', 'nous sommes le',
  'en fait on est', 'actuellement on est', "aujourd'hui on est",
  'we are in', 'it is currently', "it's currently", 'today is'
];

const FRESHNESS_CONTEST_MARKERS = [
  "c'est à jour", "c'est a jour", "cest a jour", "is this up to date", "up-to-date",
  "es-tu sûr", "es tu sur", "es-tu sure", "es tu sure", "are you sure",
  "vérifie encore", "verifie encore", "double check",
  "plus récent que ça", "plus recent que ca", "plus récent que cela", "plus recent que cela", "more recent"
];

function mentionsYear(text: string): boolean {
  return /\b(19|20)\d{2}\b/.test(text);
}

function requiresFreshData(text: string): boolean {
  const normalized = stripAccents(text.toLowerCase());
  const isTemporalCorrection = mentionsYear(normalized) &&
    TEMPORAL_CORRECTION_MARKERS.some((marker) => normalized.includes(stripAccents(marker)));
  
  if (isTemporalCorrection) {
    return true;
  }

  return FRESHNESS_CONTEST_MARKERS.some((marker) => normalized.includes(stripAccents(marker)));
}

function findEarlierSubstantialQuery(messages: Message[]): Message | undefined {
  return [...messages].reverse().find((message) => {
    if (message.role !== 'user') return false;
    const content = message.content.toLowerCase();
    return !requiresFreshData(content);
  });
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

  if (requiresFreshData(latestUserText)) {
    const earlierSubstantialQuery = findEarlierSubstantialQuery(options.messages);
    if (earlierSubstantialQuery) {
      const cleanEarlier = earlierSubstantialQuery.content.trim();
      const cleanFollowup = options.text.trim();
      let query = '';
      if (mentionsYear(cleanFollowup)) {
        query = `${cleanEarlier} ${cleanFollowup}`;
      } else {
        const date = new Date();
        const monthsFr = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
        const currentMonth = monthsFr[date.getMonth()] || 'juillet';
        const currentYear = date.getFullYear() || 2026;
        query = `${cleanEarlier} ${currentMonth} ${currentYear}`;
      }

      return {
        id: 'search',
        modeId: 'fast',
        taskType: 'general',
        requiredCapabilities: ['chat'],
        webSearchEnabled: true,
        confidence: 0.9,
        metadata: {
          source: 'freshness_contest_followup',
          query
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

  const match = INTENT_KEYWORDS.find((candidate) => candidate.matches(latestUserText));
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

function normalizeForIntent(text: string): string {
  return stripAccents(text.toLowerCase())
    .replace(/[’']/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordsForIntent(text: string): string[] {
  return normalizeForIntent(text)
    .split(/\s+/)
    .filter(Boolean);
}

function hasWord(text: string, word: string): boolean {
  return wordsForIntent(text).includes(stripAccents(word.toLowerCase()));
}

function hasAnyWord(text: string, words: string[]): boolean {
  const tokens = new Set(wordsForIntent(text));
  return words.some((word) => tokens.has(stripAccents(word.toLowerCase())));
}

function hasPhrase(text: string, phrase: string): boolean {
  const normalized = normalizeForIntent(text);
  const normalizedPhrase = normalizeForIntent(phrase).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${normalizedPhrase}([^a-z0-9]|$)`).test(normalized);
}

function hasAnyPhrase(text: string, phrases: string[]): boolean {
  return phrases.some((phrase) => hasPhrase(text, phrase));
}

function hasImageGenerationIntent(text: string): boolean {
  const normalized = normalizeForIntent(text);
  const hasImageSubject = hasAnyWord(normalized, IMAGE_TRIGGER_WORDS) ||
    hasAnyPhrase(normalized, ['logo', 'poster', 'affiche', 'avatar', 'illustration', 'dessin']);

  if (hasAnyPhrase(normalized, [
    'genere une image',
    'genere moi une image',
    'cree une image',
    'cree moi une image',
    'photo realiste de',
    'illustration de',
    'generate an image',
    'create an image',
    'make an image',
    'defal ma nataal',
    'sosal ma nataal'
  ])) {
    return true;
  }

  if (hasAnyWord(normalized, ['dessine', 'dessiner', 'illustre', 'illustrer']) && !hasAnyPhrase(normalized, ['dessine moi une conclusion', 'draw a conclusion'])) {
    return true;
  }

  return hasImageSubject && GENERATION_VERBS.some((verb) => hasWord(normalized, verb));
}

function hasCaptureIntent(text: string): boolean {
  const hasDocumentSubject = hasAnyWord(text, ['pdf', 'document', 'fichier', 'capture', 'scan', 'screenshot', 'kayit', 'keuyit']) ||
    hasAnyPhrase(text, ['piece jointe', 'pièce jointe', 'this document', 'ce document', 'ce fichier', 'tënk kayit', 'teunk kayit']);
  const hasImageSubject = hasAnyWord(text, ['photo', 'image', 'screenshot']);
  const asksAnalysis = hasAnyWord(text, ['analyse', 'analyser', 'résume', 'resume', 'summarize', 'extract', 'extrait', 'lis', 'read']) ||
    hasAnyPhrase(text, ['explique ce document', 'analyze this document', 'analyze this image', 'what is in this image', 'que contient cette image']);

  return hasDocumentSubject || (hasImageSubject && asksAnalysis);
}

function hasWritingIntent(text: string): boolean {
  const writingAction = hasAnyWord(text, ['redige', 'ecris', 'écris', 'write', 'draft', 'compose', 'reformule', 'rewrite', 'bind', 'bindal']);
  const writingObject = hasAnyWord(text, ['email', 'mail', 'post', 'message', 'lettre', 'copy', 'bio', 'caption', 'bataaxal', 'batahal']) ||
    hasAnyPhrase(text, ['lettre de motivation', 'cover letter']);
  return writingAction || (writingObject && hasAnyPhrase(text, ['aide moi', 'help me', 'peux tu']));
}

function hasStudyIntent(text: string): boolean {
  return hasAnyWord(text, ['explique', 'apprends', 'enseigne', 'quiz', 'lesson', 'teach', 'comprehension', 'leeral', 'jangal', 'diangal']) ||
    hasAnyPhrase(text, ['aide moi a comprendre', 'help me understand', 'fais moi reviser', 'prepare un quiz']);
}

function hasWorkIntent(text: string): boolean {
  return hasAnyWord(text, ['strategie', 'stratégie', 'decision', 'décision', 'compare', 'devis', 'brief', 'workflow', 'priorite', 'priorité']) ||
    hasAnyPhrase(text, ['plan d action', 'plan de travail', 'business plan', 'roadmap', 'aide moi a choisir']);
}

function hasExplicitSearchIntent(text: string): boolean {
  return hasAnyWord(text, ['cherche', 'recherche', 'search', 'latest', 'recent', 'récent', 'recents', 'news', 'actualité', 'actualite']) ||
    hasAnyPhrase(text, ['sur le web', 'recherche web', 'look it up', 'check online', 'lu bees']);
}

function hasVoiceIntent(text: string): boolean {
  return hasAnyWord(text, ['dicte', 'dictée', 'dictee', 'voice', 'vocal', 'spoken', 'waxal']) ||
    hasAnyPhrase(text, ['note vocale', 'message vocal', 'voice note']);
}

function hasMemoryIntent(text: string): boolean {
  return hasAnyWord(text, ['souviens', 'remember', 'memoire', 'mémoire', 'memory']) ||
    hasAnyPhrase(text, ['ce que tu sais de moi', 'ce que tu sais sur moi', 'lu ma waxoon', 'luma waxon']);
}

const REALTIME_KEYWORDS = [
  // French
  'actualité', 'actualite', 'météo', 'meteo', 'score', 'match', 'élection', 'election',
  'prix de', 'bourse', 'classement',
  'dernier événement', 'derniers événements',
  // English
  'news', 'weather', 'match score',
  'election', 'stock price', 'latest events',
  // Wolof
  'kan la', 'kan lan', 'lan la', 'lan lan', 'xibaar', 'hibar', 'seyt',
  'jaww', 'lu bees', 'lu bes'
];

export function detectRealtimeQuery(text: string): boolean {
  if (!text) return false;
  const clean = normalizeForIntent(text);
  const hasRealtimeKeyword = REALTIME_KEYWORDS.some((kw) => hasPhrase(clean, kw));
  if (hasRealtimeKeyword) return true;

  const asksCurrentRole = /^(qui est|qui sont|who is|who are)\s+.*\b(president|président|presidente|ministre|ceo|dirigeant|leader|maire|gouverneur|coach|entraineur|entraîneur)\b/.test(clean);
  const asksMarketData = hasAnyPhrase(clean, ['prix actuel', 'current price', 'stock price', 'cours de', 'exchange rate', 'taux de change']);
  return asksCurrentRole || asksMarketData || hasExplicitSearchIntent(clean);
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
