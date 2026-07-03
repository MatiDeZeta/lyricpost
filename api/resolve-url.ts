import {
  type VercelRequest,
  type VercelResponse,
  getClientIp,
  checkRateLimit,
  setCors,
  queryParam,
} from './_lib';

const ALLOWED_HOSTS = [
  'spotify.com',
  'spoti.fi',
  'youtu.be',
  'youtube.com',
  'music.youtube.com',
  'tidal.com',
  'listen.tidal.com',
  'deezer.com',
  'music.apple.com',
  'amazon.com',
  'music.amazon.com',
];

function isAllowedUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    return ALLOWED_HOSTS.some(
      (h) => u.hostname === h || u.hostname.endsWith(`.${h}`)
    );
  } catch {
    return false;
  }
}

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

  const url = queryParam(req, 'url');
  if (!url || !isAllowedUrl(url)) {
    return res.status(400).json({ error: 'Invalid or disallowed URL' });
  }

  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; LyricPost/1.0; +https://github.com/MatiDeZeta/lyricpost)',
      },
    });
    return res.status(200).json({ url: response.url });
  } catch {
    return res.status(502).json({ error: 'Failed to resolve URL' });
  }
}
