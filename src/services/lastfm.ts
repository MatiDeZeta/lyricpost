import type { Song, Lyric, Artist } from '@/types';
import { isPlaceholderCover } from '@/services/coverArt';
import { lastfmApi } from '@/services/apiClient';

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
    const url = img?.['#text'];
    if (url && url.trim() && !isPlaceholderCover(url)) return url;
  }
  const last = images[images.length - 1]?.['#text'];
  if (last && last.trim() && !isPlaceholderCover(last)) return last;
  return null;
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
    customCoverUrl: null,
    coverResolvedUrl: null,
    coverLoading: false,
    hasSyncedLyrics: false,
    lyrics: null,
  };
}

export async function searchSongs(query: string, limit = 6): Promise<Song[]> {
  const result = (await lastfmApi({
    method: 'track.search',
    track: query,
    limit: String(limit),
  })) as {
    results?: { trackmatches?: { track?: Array<{ name: string; artist: string }> } };
  };
  const tracks = result?.results?.trackmatches?.track || [];

  const songs = await Promise.all(
    tracks.map(async (searchTrack) => {
      try {
        const infoResult = (await lastfmApi({
          method: 'track.getInfo',
          artist: searchTrack.artist,
          track: searchTrack.name,
        })) as { track?: LastFmTrackInfo };
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
  try {
    const result = (await lastfmApi({
      method: 'track.getInfo',
      mbid,
    })) as { track?: LastFmTrackInfo };
    if (result.track) return trackInfoToSong(result.track);
  } catch {
    return null;
  }
  return null;
}

export async function searchTrackByNameArtist(
  name: string,
  artist: string
): Promise<Song | null> {
  try {
    const result = (await lastfmApi({
      method: 'track.getInfo',
      artist,
      track: name,
    })) as { track?: LastFmTrackInfo };
    if (result.track) return trackInfoToSong(result.track);
  } catch {
    return null;
  }
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
