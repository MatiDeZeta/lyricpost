import type { Song, Lyric, Artist } from '@/types';

const API_KEY = import.meta.env.VITE_LASTFM_API_KEY as string;
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

interface LastFmImage {
  '#text': string;
  size: string;
}

interface LastFmTrackInfo {
  name: string;
  duration?: string;
  artist: { name: string };
  album?: {
    image?: LastFmImage[];
  };
}

function getBestImage(images?: LastFmImage[]): string | null {
  if (!images || images.length === 0) return null;
  const preferred = ['mega', 'extralarge', 'large', 'medium', 'small'];
  for (const size of preferred) {
    const img = images.find((i) => i.size === size);
    if (img && img['#text']) return img['#text'];
  }
  return images[images.length - 1]?.['#text'] || null;
}

function parseLyricLine(line: string): Lyric {
  const timeMatch = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\]/);
  return {
    time: timeMatch
      ? parseInt(timeMatch[1], 10) * 60 * 1000 +
        parseInt(timeMatch[2], 10) * 1000 +
        parseInt(timeMatch[3], 10) * 10
      : null,
    text: timeMatch ? line.substring(timeMatch[0].length).trim() : line,
  };
}

function trackInfoToSong(track: LastFmTrackInfo): Song {
  return {
    name: track.name,
    durationMs: track.duration ? Number(track.duration) : 0,
    artists: track.artist ? [{ name: track.artist.name }] : [],
    albumCoverUrl: getBestImage(track.album?.image),
    hasSyncedLyrics: false,
    lyrics: null,
  };
}

export async function searchSongs(query: string, limit = 6): Promise<Song[]> {
  const searchUrl = `${BASE_URL}?method=track.search&track=${encodeURIComponent(query)}&api_key=${API_KEY}&format=json&limit=${limit}`;
  const response = await fetch(searchUrl);
  const result = await response.json();
  const tracks = result?.results?.trackmatches?.track || [];

  const songs = await Promise.all(
    tracks.map(async (searchTrack: { name: string; artist: string }) => {
      try {
        const infoUrl = `${BASE_URL}?method=track.getInfo&api_key=${API_KEY}&artist=${encodeURIComponent(searchTrack.artist)}&track=${encodeURIComponent(searchTrack.name)}&format=json`;
        const infoResponse = await fetch(infoUrl);
        const infoResult = await infoResponse.json();
        if (infoResult.track) {
          return trackInfoToSong(infoResult.track);
        }
      } catch (err) {
        console.error('Failed to fetch track info for', searchTrack.name, err);
      }
      return null;
    })
  );

  return songs.filter((s): s is Song => s !== null);
}

export async function getTrackByMbid(mbid: string): Promise<Song | null> {
  const url = `${BASE_URL}?method=track.getInfo&api_key=${API_KEY}&mbid=${mbid}&format=json`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const result = await response.json();
  if (result.track) return trackInfoToSong(result.track);
  return null;
}

export async function searchTrackByNameArtist(
  name: string,
  artist: string
): Promise<Song | null> {
  const url = `${BASE_URL}?method=track.getInfo&api_key=${API_KEY}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(name)}&format=json`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const result = await response.json();
  if (result.track) return trackInfoToSong(result.track);
  return null;
}

export function parseLyrics(lyricsObj: {
  syncedLyrics?: string | null;
  plainLyrics?: string | null;
}): { lyrics: Lyric[]; hasSynced: boolean } {
  const raw = lyricsObj.syncedLyrics ?? lyricsObj.plainLyrics;
  if (!raw) return { lyrics: [], hasSynced: false };

  const lines = raw
    .replace(/\n+/g, '\n')
    .split('\n')
    .map(parseLyricLine)
    .filter((l) => l.text !== '');

  return {
    lyrics: lines,
    hasSynced: !!lyricsObj.syncedLyrics,
  };
}

export function getArtistNames(artists: Artist[]): string {
  return artists.map((a) => a.name).join(', ');
}
