type Bucket = { count: number; resetAt: number };

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
// Hard ceiling across all callers combined. Closes the bypass where a caller
// rotates a spoofed X-Forwarded-For per request to dodge the per-key limit
// below, which would otherwise translate directly into unbounded billed
// provider spend.
const GLOBAL_MAX_PER_WINDOW = 200;
// Safety valve so a flood of distinct spoofed keys can't grow this map
// forever between sweeps.
const MAX_TRACKED_KEYS = 5_000;
const GLOBAL_KEY = '__global__';

const buckets = new Map<string, Bucket>();

export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    // The platform's edge proxy appends the real client IP as the last hop;
    // anything the caller sets itself is prepended before that, so the last
    // entry is the only one that isn't fully client-controlled.
    const hops = forwarded.split(',').map((hop) => hop.trim()).filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1]!;
  }
  return req.headers.get('cf-connecting-ip') ?? 'unknown';
}

export interface RateLimitDecision {
  ok: boolean;
  retryAfter: number;
}

function sweepExpired(now: number) {
  if (buckets.size <= MAX_TRACKED_KEYS) return;
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
}

function hit(key: string, max: number, now: number): RateLimitDecision {
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, retryAfter: 0 };
  }

  if (bucket.count >= max) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true, retryAfter: 0 };
}

export function checkRateLimit(key: string): RateLimitDecision {
  const now = Date.now();
  sweepExpired(now);

  const global = hit(GLOBAL_KEY, GLOBAL_MAX_PER_WINDOW, now);
  if (!global.ok) return global;

  return hit(key, MAX_PER_WINDOW, now);
}
