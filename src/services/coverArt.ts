import { LASTFM_PLACEHOLDER_HASHES } from '@/constants/covers';
import type { Song } from '@/types';

export function isPlaceholderCover(url: string | null | undefined): boolean {
  if (!url || !url.trim()) return true;
  const lower = url.toLowerCase();
  if (lower.includes('noimage') || lower.includes('default_album')) return true;
  return LASTFM_PLACEHOLDER_HASHES.some((hash) => lower.includes(hash));
}

export function getArtistName(song: Song): string {
  return song.artists.map((a) => a.name).join(', ');
}

/** Best URL to show in UI / export */
export function getDisplayCoverUrl(song: Song): string | null {
  if (song.customCoverUrl) return song.customCoverUrl;
  if (song.coverResolvedUrl && !isPlaceholderCover(song.coverResolvedUrl)) {
    return song.coverResolvedUrl;
  }
  if (song.albumCoverUrl && !isPlaceholderCover(song.albumCoverUrl)) {
    return song.albumCoverUrl;
  }
  return null;
}

export function hasRealCover(song: Song): boolean {
  return getDisplayCoverUrl(song) !== null;
}

interface ItunesResult {
  results?: Array<{
    artworkUrl100?: string;
    artworkUrl600?: string;
  }>;
}

export async function fetchItunesArtwork(
  artist: string,
  track: string
): Promise<string | null> {
  const term = encodeURIComponent(`${artist} ${track}`.trim());
  if (!term) return null;
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${term}&entity=song&limit=1`
    );
    if (!res.ok) return null;
    const data: ItunesResult = await res.json();
    const item = data.results?.[0];
    const url = item?.artworkUrl600 ?? item?.artworkUrl100 ?? null;
    if (!url || isPlaceholderCover(url)) return null;
    return url.replace('100x100bb', '600x600bb');
  } catch {
    return null;
  }
}

export async function resolveCoverForSong(
  song: Song,
  spotifyThumb?: string | null
): Promise<string | null> {
  if (song.customCoverUrl) return song.customCoverUrl;

  if (song.albumCoverUrl && !isPlaceholderCover(song.albumCoverUrl)) {
    return song.albumCoverUrl;
  }

  if (spotifyThumb && !isPlaceholderCover(spotifyThumb)) {
    return spotifyThumb;
  }

  const artist = getArtistName(song);
  const itunes = await fetchItunesArtwork(artist, song.name);
  if (itunes) return itunes;

  return null;
}
