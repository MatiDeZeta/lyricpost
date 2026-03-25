export interface Artist {
  name: string;
}

export interface Lyric {
  time: number | null;
  text: string;
}

export interface Song {
  name: string;
  durationMs: number;
  artists: Artist[];
  albumCoverUrl: string | null;
  hasSyncedLyrics: boolean;
  lyrics: Lyric[] | null;
}

export type AspectRatio = 'free' | '1:1' | '4:5' | '9:16';

export interface GradientColor {
  from: string;
  to: string;
  angle: number;
}

export interface ImageSettings {
  backgroundColor: string;
  gradient: GradientColor | null;
  useGradient: boolean;
  lightText: boolean;
  showSpotifyTag: boolean;
  showBackground: boolean;
  width: number;
  fontSize: number;
  fontFamily: string;
  aspectRatio: AspectRatio;
  lang: string;
}

export interface HistoryEntry {
  id: string;
  songName: string;
  artistName: string;
  lyrics: string;
  settings: ImageSettings;
  thumbnailDataUrl: string;
  createdAt: number;
}

export type WizardStep = 1 | 2 | 3 | 4;
