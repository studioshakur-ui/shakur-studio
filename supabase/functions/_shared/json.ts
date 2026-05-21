import { corsHeaders } from './cors.ts';

export function jsonResponse(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...corsHeaders(req.headers.get('origin'))
    }
  });
}

export function errorResponse(req: Request, code: string, message: string, status = 400): Response {
  return jsonResponse(req, { error: { code, message } }, status);
}
