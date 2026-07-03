import type { IncomingMessage, ServerResponse } from 'http';

export type VercelRequest = IncomingMessage & {
  query: Record<string, string | string[] | undefined>;
  body?: unknown;
};

export type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  send: (body: string) => void;
};

const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

export function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress ?? 'unknown';
}

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_LIMIT) return false;
  bucket.count += 1;
  return true;
}

export function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export function getQuery(
  req: VercelRequest
): Record<string, string | string[] | undefined> {
  if (req.query && Object.keys(req.query).length > 0) {
    return req.query;
  }
  try {
    const rawUrl = req.url ?? '';
    const parsed = new URL(rawUrl, 'https://localhost');
    const out: Record<string, string> = {};
    parsed.searchParams.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  } catch {
    return {};
  }
}

export function queryParam(
  req: VercelRequest,
  key: string
): string | undefined {
  const v = getQuery(req)[key];
  return Array.isArray(v) ? v[0] : v;
}

function lastfmApiKey(): string | undefined {
  return (
    process.env.LASTFM_API_KEY?.trim() ||
    process.env.VITE_LASTFM_API_KEY?.trim() ||
    undefined
  );
}

export { lastfmApiKey };
