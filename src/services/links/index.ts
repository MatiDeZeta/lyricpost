import type { MusicPlatform } from '@/types';
import { loadFromAppleUrl, parseAppleMusicUrl } from './apple';
import { loadFromDeezerUrl, parseDeezerUrl } from './deezer';
import { loadFromSpotifyUrl, parseSpotifyUrl, parseSpotifyAlbumUrl } from './spotify';
import { loadFromYouTubeUrl, parseYouTubeUrl } from './youtube';
import { loadFromTidalUrl, parseTidalUrl } from './tidal';
import { loadFromAmazonUrl, parseAmazonMusicUrl } from './amazon';
import type { LinkLoadResult } from './types';
import { trackEvent } from '@/utils/analytics';

export type { LinkLoadResult } from './types';
export { PLATFORM_LABELS } from './types';

export function detectPlatform(url: string): MusicPlatform | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (
    parseSpotifyUrl(trimmed) ||
    parseSpotifyAlbumUrl(trimmed) ||
    /spoti\.fi|spotify\.link/i.test(trimmed)
  ) {
    return 'spotify';
  }
  if (parseAppleMusicUrl(trimmed)) return 'apple';
  if (parseDeezerUrl(trimmed)) return 'deezer';
  if (parseYouTubeUrl(trimmed)) return 'youtube';
  if (parseTidalUrl(trimmed)) return 'tidal';
  if (parseAmazonMusicUrl(trimmed)) return 'amazon';

  return null;
}

export async function loadFromUrl(url: string): Promise<LinkLoadResult | null> {
  const trimmed = url.trim();
  const platform = detectPlatform(trimmed);
  if (!platform) return null;

  let result: LinkLoadResult | null = null;

  switch (platform) {
    case 'spotify':
      result = await loadFromSpotifyUrl(trimmed);
      break;
    case 'apple':
      result = await loadFromAppleUrl(trimmed);
      break;
    case 'deezer':
      result = await loadFromDeezerUrl(trimmed);
      break;
    case 'youtube':
      result = await loadFromYouTubeUrl(trimmed);
      break;
    case 'tidal':
      result = await loadFromTidalUrl(trimmed);
      break;
    case 'amazon':
      result = await loadFromAmazonUrl(trimmed);
      break;
  }

  if (result) {
    trackEvent('link_paste', { platform });
  }

  return result;
}
