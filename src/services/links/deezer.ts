import type { Song } from '@/types';
import type { LinkLoadResult } from './types';

interface DeezerTrack {
  id: number;
  title: string;
  duration: number;
  artist: { name: string };
  album?: { cover_xl?: string; cover_big?: string; cover_medium?: string };
}

export function parseDeezerUrl(url: string): string | null {
  const match = url.match(/deezer\.com\/(?:[a-z]{2}\/)?track\/(\d+)/i);
  return match?.[1] ?? null;
}

function deezerToSong(track: DeezerTrack, sourceUrl: string): Song {
  const cover =
    track.album?.cover_xl ??
    track.album?.cover_big ??
    track.album?.cover_medium ??
    null;
  return {
    name: track.title,
    durationMs: track.duration * 1000,
    artists: [{ name: track.artist.name }],
    albumCoverUrl: cover,
    customCoverUrl: null,
    coverResolvedUrl: null,
    coverLoading: false,
    hasSyncedLyrics: false,
    lyrics: null,
    sourcePlatform: 'deezer',
    sourceUrl,
    sourceId: String(track.id),
  };
}

export async function loadFromDeezerUrl(url: string): Promise<LinkLoadResult | null> {
  const id = parseDeezerUrl(url);
  if (!id) return null;

  const res = await fetch(`https://api.deezer.com/track/${id}`);
  if (!res.ok) return null;

  const track = (await res.json()) as DeezerTrack;
  if (!track.title || !track.artist?.name) return null;

  const thumb =
    track.album?.cover_xl ??
    track.album?.cover_big ??
    track.album?.cover_medium ??
    null;

  return {
    song: deezerToSong(track, url),
    thumbnailUrl: thumb,
    platform: 'deezer',
    sourceUrl: url,
  };
}
