import { preflight } from '../_shared/cors.ts';
import { errorResponse, jsonResponse } from '../_shared/json.ts';
import { checkRateLimit, clientIp } from '../_shared/rateLimit.ts';
import { chatJson, hasOpenAIKey, OpenAIError } from '../_shared/openai.ts';
import { buildAutomationPrompt, buildSystemPrompt } from '../_shared/prompts.ts';
import { automationSchema } from '../_shared/schemas.ts';
import { demoAutomation } from '../_shared/demo.ts';
import { AgentEnvelope, AutomationAgentInput, AutomationAgentOutput } from '../_shared/types.ts';
import {
  optionalString,
  parseJsonBody,
  requireLanguage,
  requireString,
  ValidationError
} from '../_shared/validate.ts';
import { logAgentRun, sha256Hex } from '../_shared/db.ts';

async function parseInput(req: Request): Promise<AutomationAgentInput> {
  const body = await parseJsonBody(req);
  return {
    workflow: requireString(body, 'workflow', { min: 4, max: 600 }),
    tools: optionalString(body, 'tools', { max: 240 }),
    desiredResult: optionalString(body, 'desiredResult', { max: 240 }),
    language: requireLanguage(body)
  };
}

Deno.serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;

  if (req.method !== 'POST') {
    return errorResponse(req, 'method_not_allowed', 'Only POST is supported.', 405);
  }

  const ip = clientIp(req);
  const rate = checkRateLimit(`automation:${ip}`);
  if (!rate.ok) {
    return errorResponse(req, 'rate_limited', `Too many requests. Retry in ${rate.retryAfter}s.`, 429);
  }

  let input: AutomationAgentInput;
  try {
    input = await parseInput(req);
  } catch (error) {
    const message = error instanceof ValidationError ? error.message : 'Invalid request.';
    return errorResponse(req, 'invalid_input', message, 400);
  }

  const startedAt = performance.now();
  const ipHash = ip === 'unknown' ? null : await sha256Hex(ip);

  if (!hasOpenAIKey()) {
    const envelope: AgentEnvelope<AutomationAgentOutput> = {
      agent: 'automation',
      mode: 'demo',
      language: input.language,
      result: demoAutomation(input.language, input.workflow)
    };
    logAgentRun({
      agent: 'automation',
      language: input.language,
      mode: 'demo',
      status: 'success',
      latencyMs: performance.now() - startedAt,
      ipHash
    });
    return jsonResponse(req, envelope);
  }

  try {
    const result = await chatJson<AutomationAgentOutput>({
      systemPrompt: buildSystemPrompt(input.language),
      userPrompt: buildAutomationPrompt(input),
      schema: automationSchema,
      schemaName: 'automation_agent_output'
    });
    const envelope: AgentEnvelope<AutomationAgentOutput> = {
      agent: 'automation',
      mode: 'live',
      language: input.language,
      result
    };
    logAgentRun({
      agent: 'automation',
      language: input.language,
      mode: 'live',
      status: 'success',
      latencyMs: performance.now() - startedAt,
      ipHash
    });
    return jsonResponse(req, envelope);
  } catch (error) {
    const isUpstream = error instanceof OpenAIError;
    logAgentRun({
      agent: 'automation',
      language: input.language,
      mode: 'live',
      status: 'error',
      errorCode: isUpstream ? 'upstream_error' : 'internal_error',
      latencyMs: performance.now() - startedAt,
      ipHash
    });
    if (isUpstream) {
      return errorResponse(req, 'upstream_error', error.message, error.status);
    }
    return errorResponse(req, 'internal_error', 'Unexpected server error.', 500);
  }
});
