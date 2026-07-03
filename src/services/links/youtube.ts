import { searchSongs } from '@/services/lastfm';
import type { Song } from '@/types';
import type { LinkLoadResult } from './types';
import { parseArtistTitle } from './parseTitle';

interface YouTubeOEmbed {
  title: string;
  thumbnail_url: string;
}

export function parseYouTubeUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1).split('/')[0] || null;
    }
    if (
      u.hostname.includes('youtube.com') ||
      u.hostname.includes('music.youtube.com')
    ) {
      return u.searchParams.get('v');
    }
  } catch {
    return null;
  }
  return null;
}

function enrichSong(song: Song, sourceUrl: string, videoId: string): Song {
  return {
    ...song,
    sourcePlatform: 'youtube',
    sourceUrl,
    sourceId: videoId,
  };
}

export async function loadFromYouTubeUrl(
  url: string
): Promise<LinkLoadResult | null> {
  const videoId = parseYouTubeUrl(url);
  if (!videoId) return null;

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`;
  const response = await fetch(oembedUrl);
  if (!response.ok) return null;

  const data = (await response.json()) as YouTubeOEmbed;
  if (!data.title) return null;

  const parsed = parseArtistTitle(data.title);
  const searchQuery = parsed
    ? `${parsed.artist} ${parsed.title}`
    : data.title;

  const songs = await searchSongs(searchQuery, 3);
  let song = songs[0];

  if (parsed && songs.length > 1) {
    const match = songs.find(
      (s) =>
        s.name.toLowerCase().includes(parsed.title.toLowerCase()) ||
        s.artists.some((a) =>
          a.name.toLowerCase().includes(parsed.artist.toLowerCase())
        )
    );
    if (match) song = match;
  }

  if (!song) return null;

  return {
    song: enrichSong(song, url, videoId),
    thumbnailUrl: data.thumbnail_url || null,
    platform: 'youtube',
    sourceUrl: url,
  };
}
