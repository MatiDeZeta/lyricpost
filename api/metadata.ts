import {
  type VercelRequest,
  type VercelResponse,
  getClientIp,
  checkRateLimit,
  setCors,
  queryParam,
} from './_lib.js';

const ALLOWED_HOSTS = [
  'tidal.com',
  'listen.tidal.com',
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

function extractMeta(html: string, property: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`,
      'i'
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`,
      'i'
    ),
    new RegExp(
      `<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`,
      'i'
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`,
      'i'
    ),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return null;
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
        Accept: 'text/html',
      },
    });
    if (!response.ok) {
      return res.status(502).json({ error: 'Failed to fetch page' });
    }
    const html = await response.text();
    const title =
      extractMeta(html, 'og:title') ??
      extractMeta(html, 'twitter:title') ??
      extractMeta(html, 'title');
    const image =
      extractMeta(html, 'og:image') ?? extractMeta(html, 'twitter:image');

    return res.status(200).json({
      title,
      image,
      url: response.url,
    });
  } catch {
    return res.status(502).json({ error: 'Failed to fetch metadata' });
  }
}
