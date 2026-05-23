import { searchSongs } from './lastfm';
import type { Song } from '@/types';

/**
 * Parses a Spotify URL and extracts the track ID.
 */
export function parseSpotifyUrl(url: string): string | null {
  const webMatch = url.match(/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/);
  if (webMatch) return webMatch[1];

  const uriMatch = url.match(/spotify:track:([a-zA-Z0-9]+)/);
  if (uriMatch) return uriMatch[1];

  return null;
}

interface SpotifyOEmbedResponse {
  title: string;
  thumbnail_url: string;
}

export interface SpotifyLoadResult {
  song: Song;
  thumbnailUrl: string | null;
}

/**
 * Uses Spotify oEmbed for title + thumbnail, then Last.fm for metadata.
 */
export async function loadFromSpotifyUrl(
  url: string
): Promise<SpotifyLoadResult | null> {
  const trackId = parseSpotifyUrl(url);
  if (!trackId) return null;

  const oembedUrl = `https://open.spotify.com/oembed?url=https://open.spotify.com/track/${trackId}`;
  const response = await fetch(oembedUrl);

  if (!response.ok) return null;

  const data: SpotifyOEmbedResponse = await response.json();
  const title = data.title || '';
  const thumbnailUrl = data.thumbnail_url || null;

  const songs = await searchSongs(title, 1);
  const song = songs[0];
  if (!song) return null;

  return { song, thumbnailUrl };
}
