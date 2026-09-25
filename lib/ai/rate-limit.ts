import 'server-only';

/**
 * Minimal in-memory sliding-window limiter so a public docs site can't be used to burn
 * through your API credits. It is per server instance; put a shared limiter (or your
 * reverse proxy's) in front if you run several replicas.
 */
const windowMs = 60_000;
const limit = Number(process.env.AI_RATE_LIMIT_PER_MINUTE ?? 10);
const hits = new Map<string, number[]>();

export function checkRateLimit(key: string): { ok: boolean; retryAfter: number } {
  if (!Number.isFinite(limit) || limit <= 0) return { ok: true, retryAfter: 0 };

  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - recent[0])) / 1000) };
  }

  recent.push(now);
  hits.set(key, recent);

  // keep the map from growing forever
  if (hits.size > 10_000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
  }
  return { ok: true, retryAfter: 0 };
}

export function clientKey(req: Request) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'anonymous'
  );
}
