/**
 * Rate limit em memória para login e cadastro.
 * Suficiente para uma instância única em VPS. Se algum dia rodar em cluster,
 * trocar por Redis mantendo esta mesma assinatura.
 */
type Bucket = { count: number; resetAt: number };

const globalForLimiter = globalThis as unknown as {
  __nakatenisRateLimit?: Map<string, Bucket>;
};

const buckets =
  globalForLimiter.__nakatenisRateLimit ??
  (globalForLimiter.__nakatenisRateLimit = new Map<string, Bucket>());

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  // Limpeza oportunista para a Map não crescer sem fim.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  }

  return { ok: true, remaining: limit - bucket.count, retryAfterSeconds: 0 };
}

export const LOGIN_LIMIT = { limit: 8, windowMs: 10 * 60 * 1000 };
export const SIGNUP_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };
export const UPLOAD_LIMIT = { limit: 60, windowMs: 10 * 60 * 1000 };
