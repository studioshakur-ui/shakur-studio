const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini';
const REQUEST_TIMEOUT_MS = 25_000;

export class OpenAIError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = 'OpenAIError';
    this.status = status;
  }
}

export function hasOpenAIKey(): boolean {
  return Boolean(Deno.env.get('OPENAI_API_KEY'));
}

interface ChatCompletionArgs {
  systemPrompt: string;
  userPrompt: string;
  schema: Record<string, unknown>;
  schemaName: string;
}

export async function chatJson<T>({ systemPrompt, userPrompt, schema, schemaName }: ChatCompletionArgs): Promise<T> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new OpenAIError('OPENAI_API_KEY is not configured.', 503);
  }

  const model = Deno.env.get('OPENAI_MODEL') ?? DEFAULT_MODEL;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0.4,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: schemaName,
            strict: true,
            schema
          }
        },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new OpenAIError('Upstream AI request timed out.', 504);
    }
    throw new OpenAIError('Failed to reach upstream AI provider.', 502);
  }
  clearTimeout(timeout);

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    const status = response.status >= 500 ? 502 : 502;
    throw new OpenAIError(`Upstream AI error (${response.status}): ${text.slice(0, 200)}`, status);
  }

  const payload = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || content.length === 0) {
    throw new OpenAIError('Upstream AI returned an empty response.', 502);
  }

  try {
    return JSON.parse(content) as T;
  } catch {
    throw new OpenAIError('Upstream AI returned malformed JSON.', 502);
  }
}
