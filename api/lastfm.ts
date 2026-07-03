import {
  type VercelRequest,
  type VercelResponse,
  getClientIp,
  checkRateLimit,
  setCors,
  queryParam,
  getQuery,
  lastfmApiKey,
} from './_lib.js';

const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';
const ALLOWED_METHODS = new Set([
  'track.search',
  'track.getInfo',
]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  const apiKey = lastfmApiKey();
  if (!apiKey) {
    return res.status(500).json({
      error:
        'Last.fm API key not configured. Set LASTFM_API_KEY in Vercel environment variables.',
    });
  }

  const method = queryParam(req, 'method');
  if (!method || !ALLOWED_METHODS.has(method)) {
    return res.status(400).json({ error: 'Invalid or missing method' });
  }

  const params = new URLSearchParams();
  params.set('method', method);
  params.set('api_key', apiKey);
  params.set('format', 'json');

  for (const [key, value] of Object.entries(getQuery(req))) {
    if (key === 'method') continue;
    const v = Array.isArray(value) ? value[0] : value;
    if (v) params.set(key, v);
  }

  try {
    const upstream = await fetch(`${BASE_URL}?${params.toString()}`);
    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch {
    return res.status(502).json({ error: 'Failed to reach Last.fm' });
  }
}
