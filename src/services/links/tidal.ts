import { searchSongs } from '@/services/lastfm';
import { fetchPageMetadata } from '@/services/apiClient';
import type { Song } from '@/types';
import type { LinkLoadResult } from './types';
import { parseArtistTitle } from './parseTitle';

export function parseTidalUrl(url: string): string | null {
  const match = url.match(
    /(?:tidal\.com|listen\.tidal\.com)\/(?:browse\/)?track\/(\d+)/i
  );
  return match?.[1] ?? null;
}

function enrichSong(song: Song, sourceUrl: string, trackId: string): Song {
  return {
    ...song,
    sourcePlatform: 'tidal',
    sourceUrl,
    sourceId: trackId,
  };
}

export async function loadFromTidalUrl(url: string): Promise<LinkLoadResult | null> {
  const trackId = parseTidalUrl(url);
  if (!trackId) return null;

  let meta: { title: string | null; image: string | null };
  try {
    meta = await fetchPageMetadata(url);
  } catch {
    return null;
  }

  if (!meta.title) return null;

  const parsed = parseArtistTitle(meta.title);
  const searchQuery = parsed
    ? `${parsed.artist} ${parsed.title}`
    : meta.title;

  const songs = await searchSongs(searchQuery, 3);
  const song = songs[0];
  if (!song) return null;

  return {
    song: enrichSong(song, url, trackId),
    thumbnailUrl: meta.image,
    platform: 'tidal',
    sourceUrl: url,
  };
}
