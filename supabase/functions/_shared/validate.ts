import { AGENT_LANGUAGES, AGENT_TONES, AgentLanguage, AgentTone } from './types.ts';

const MAX_FIELD = 1200;

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function requireString(source: Record<string, unknown>, field: string, opts: { max?: number; min?: number } = {}): string {
  const value = source[field];
  if (typeof value !== 'string') {
    throw new ValidationError(`Field "${field}" must be a string.`);
  }
  const trimmed = value.trim();
  const min = opts.min ?? 1;
  const max = opts.max ?? MAX_FIELD;
  if (trimmed.length < min) {
    throw new ValidationError(`Field "${field}" must be at least ${min} character(s).`);
  }
  if (trimmed.length > max) {
    throw new ValidationError(`Field "${field}" must be at most ${max} characters.`);
  }
  return trimmed;
}

export function optionalString(source: Record<string, unknown>, field: string, opts: { max?: number } = {}): string | undefined {
  const value = source[field];
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') {
    throw new ValidationError(`Field "${field}" must be a string.`);
  }
  const trimmed = value.trim();
  const max = opts.max ?? MAX_FIELD;
  if (trimmed.length > max) {
    throw new ValidationError(`Field "${field}" must be at most ${max} characters.`);
  }
  return trimmed.length > 0 ? trimmed : undefined;
}

export function requireLanguage(source: Record<string, unknown>): AgentLanguage {
  const value = source.language;
  if (typeof value !== 'string' || !AGENT_LANGUAGES.includes(value as AgentLanguage)) {
    throw new ValidationError(`Field "language" must be one of: ${AGENT_LANGUAGES.join(', ')}.`);
  }
  return value as AgentLanguage;
}

export function optionalTone(source: Record<string, unknown>): AgentTone | undefined {
  const value = source.tone;
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || !AGENT_TONES.includes(value as AgentTone)) {
    throw new ValidationError(`Field "tone" must be one of: ${AGENT_TONES.join(', ')}.`);
  }
  return value as AgentTone;
}

export async function parseJsonBody(req: Request): Promise<Record<string, unknown>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Request body must be valid JSON.');
  }
  if (!isObject(body)) {
    throw new ValidationError('Request body must be a JSON object.');
  }
  return body;
}
