import type { Song } from '@/types';

function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(encoded: string): string {
  const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function buildShareUrl(song?: Song | null, fallbackQuery?: string): string {
  const origin =
    import.meta.env.VITE_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '');

  const params = new URLSearchParams();

  if (song?.sourceUrl) {
    params.set('link', base64UrlEncode(song.sourceUrl));
  } else if (fallbackQuery?.trim()) {
    params.set('q', fallbackQuery.trim());
  } else if (song) {
    params.set('q', `${song.artists.map((a) => a.name).join(', ')} ${song.name}`);
  }

  const qs = params.toString();
  return qs ? `${origin}/?${qs}` : origin;
}

export function parseShareUrl(): { link?: string; query?: string } | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const link = params.get('link');
  const query = params.get('q');

  if (link) {
    try {
      return { link: base64UrlDecode(link) };
    } catch {
      return null;
    }
  }
  if (query) return { query };
  return null;
}

export function clearShareParams(): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.delete('link');
  url.searchParams.delete('q');
  window.history.replaceState({}, '', url.pathname + url.search);
}
