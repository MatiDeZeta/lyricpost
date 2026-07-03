import { searchSongs } from '@/services/lastfm';
import { fetchPageMetadata } from '@/services/apiClient';
import type { Song } from '@/types';
import type { LinkLoadResult } from './types';
import { parseArtistTitle } from './parseTitle';

export function parseAmazonMusicUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.hostname.includes('music.amazon.') ||
      (u.hostname.includes('amazon.') && u.pathname.includes('/music/'))
    );
  } catch {
    return false;
  }
}

function enrichSong(song: Song, sourceUrl: string): Song {
  return {
    ...song,
    sourcePlatform: 'amazon',
    sourceUrl,
  };
}

export async function loadFromAmazonUrl(url: string): Promise<LinkLoadResult | null> {
  if (!parseAmazonMusicUrl(url)) return null;

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
    : meta.title.replace(/Amazon\.com:?\s*/i, '').trim();

  const songs = await searchSongs(searchQuery, 3);
  const song = songs[0];
  if (!song) return null;

  return {
    song: enrichSong(song, url),
    thumbnailUrl: meta.image,
    platform: 'amazon',
    sourceUrl: url,
  };
}
