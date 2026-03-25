import { searchSongs } from './lastfm';
import type { Song } from '@/types';

/**
 * Parses a Spotify URL and extracts the track ID.
 * Supports formats:
 * - https://open.spotify.com/track/TRACK_ID
 * - https://open.spotify.com/track/TRACK_ID?si=...
 * - spotify:track:TRACK_ID
 */
export function parseSpotifyUrl(url: string): string | null {
  const webMatch = url.match(
    /open\.spotify\.com\/track\/([a-zA-Z0-9]+)/
  );
  if (webMatch) return webMatch[1];

  const uriMatch = url.match(/spotify:track:([a-zA-Z0-9]+)/);
  if (uriMatch) return uriMatch[1];

  return null;
}

interface SpotifyOEmbedResponse {
  title: string;
  thumbnail_url: string;
}

/**
 * Uses Spotify's oEmbed endpoint to get track name + artist,
 * then searches Last.fm to get full track info.
 */
export async function loadFromSpotifyUrl(url: string): Promise<Song | null> {
  const trackId = parseSpotifyUrl(url);
  if (!trackId) return null;

  const oembedUrl = `https://open.spotify.com/oembed?url=https://open.spotify.com/track/${trackId}`;
  const response = await fetch(oembedUrl);

  if (!response.ok) return null;

  const data: SpotifyOEmbedResponse = await response.json();

  // oEmbed title format is usually "Song Name - Artist Name" or just "Song Name"
  const title = data.title || '';

  // Search Last.fm with the full title string
  const songs = await searchSongs(title, 1);
  return songs[0] ?? null;
}
