import type { Song } from '@/types';
import type { LinkLoadResult } from './types';
import { upscaleArtwork } from './parseTitle';

interface ItunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100?: string;
  artworkUrl600?: string;
  trackTimeMillis?: number;
}

export function parseAppleMusicUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes('music.apple.com')) return null;
    const iParam = u.searchParams.get('i');
    if (iParam) return iParam;
    const match = u.pathname.match(/\/(\d+)(?:\?|$)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

async function lookupItunes(id: string): Promise<ItunesTrack | null> {
  const res = await fetch(
    `https://itunes.apple.com/lookup?id=${encodeURIComponent(id)}&entity=song`
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { results?: ItunesTrack[] };
  const track = data.results?.find((r) => r.trackName && r.artistName);
  return track ?? null;
}

function itunesToSong(track: ItunesTrack, sourceUrl: string, sourceId: string): Song {
  const art = track.artworkUrl600 ?? track.artworkUrl100 ?? null;
  return {
    name: track.trackName,
    durationMs: track.trackTimeMillis ?? 0,
    artists: [{ name: track.artistName }],
    albumCoverUrl: art ? upscaleArtwork(art) : null,
    customCoverUrl: null,
    coverResolvedUrl: null,
    coverLoading: false,
    hasSyncedLyrics: false,
    lyrics: null,
    sourcePlatform: 'apple',
    sourceUrl,
    sourceId,
  };
}

export async function loadFromAppleUrl(url: string): Promise<LinkLoadResult | null> {
  const id = parseAppleMusicUrl(url);
  if (!id) return null;

  const track = await lookupItunes(id);
  if (!track) return null;

  const artwork = track.artworkUrl600 ?? track.artworkUrl100 ?? null;
  return {
    song: itunesToSong(track, url, id),
    thumbnailUrl: artwork ? upscaleArtwork(artwork) : null,
    platform: 'apple',
    sourceUrl: url,
  };
}
