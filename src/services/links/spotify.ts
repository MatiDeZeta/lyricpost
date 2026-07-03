import { searchSongs } from '@/services/lastfm';
import { resolveUrl } from '@/services/apiClient';
import type { Song } from '@/types';
import type { LinkLoadResult } from './types';

interface SpotifyOEmbedResponse {
  title: string;
  thumbnail_url: string;
  type?: string;
}

export function parseSpotifyUrl(url: string): string | null {
  const webMatch = url.match(
    /open\.spotify\.com\/(?:intl-[a-z-]+\/)?track\/([a-zA-Z0-9]+)/
  );
  if (webMatch) return webMatch[1];

  const uriMatch = url.match(/spotify:track:([a-zA-Z0-9]+)/);
  if (uriMatch) return uriMatch[1];

  return null;
}

export function parseSpotifyAlbumUrl(url: string): string | null {
  const match = url.match(
    /open\.spotify\.com\/(?:intl-[a-z-]+\/)?album\/([a-zA-Z0-9]+)/
  );
  return match?.[1] ?? null;
}

function isSpotifyShortLink(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === 'spoti.fi' || host === 'spotify.link';
  } catch {
    return false;
  }
}

async function normalizeSpotifyUrl(url: string): Promise<string> {
  if (isSpotifyShortLink(url)) {
    return resolveUrl(url);
  }
  return url;
}

async function fetchOEmbed(spotifyUrl: string): Promise<SpotifyOEmbedResponse | null> {
  const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`;
  const response = await fetch(oembedUrl);
  if (!response.ok) return null;
  return response.json() as Promise<SpotifyOEmbedResponse>;
}

function enrichSong(song: Song, sourceUrl: string, trackId: string): Song {
  return {
    ...song,
    sourcePlatform: 'spotify',
    sourceUrl,
    sourceId: trackId,
  };
}

export async function loadFromSpotifyUrl(
  rawUrl: string
): Promise<LinkLoadResult | null> {
  const url = await normalizeSpotifyUrl(rawUrl);
  const trackId = parseSpotifyUrl(url);

  if (trackId) {
    const spotifyUrl = `https://open.spotify.com/track/${trackId}`;
    const data = await fetchOEmbed(spotifyUrl);
    if (!data?.title) return null;

    const songs = await searchSongs(data.title, 1);
    const song = songs[0];
    if (!song) return null;

    return {
      song: enrichSong(song, rawUrl, trackId),
      thumbnailUrl: data.thumbnail_url || null,
      platform: 'spotify',
      sourceUrl: rawUrl,
    };
  }

  const albumId = parseSpotifyAlbumUrl(url);
  if (albumId) {
    const albumUrl = `https://open.spotify.com/album/${albumId}`;
    const data = await fetchOEmbed(albumUrl);
    if (!data?.title) return null;

    const songs = await searchSongs(data.title, 5);
    const song = songs[0];
    if (!song) return null;

    return {
      song: enrichSong(song, rawUrl, albumId),
      thumbnailUrl: data.thumbnail_url || null,
      platform: 'spotify',
      sourceUrl: rawUrl,
    };
  }

  return null;
}
