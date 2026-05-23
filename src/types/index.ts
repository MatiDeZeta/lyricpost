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

export type AspectRatio =
  | 'free'
  | '1:1'
  | '4:5'
  | '9:16'
  | 'ig-post'
  | 'ig-portrait'
  | 'ig-story'
  | 'x-post'
  | 'tiktok';

export interface GradientColor {
  from: string;
  to: string;
  angle: number;
}

export interface BackgroundImage {
  dataUrl: string;
  opacity: number;
  blur: number;
}

export type ExportFormat = 'png' | 'jpeg' | 'svg';
export type ExportResolution = 1 | 2 | 4;

export interface ImageSettings {
  backgroundColor: string;
  gradient: GradientColor | null;
  useGradient: boolean;
  backgroundImage: BackgroundImage | null;
  lightText: boolean;
  showSpotifyTag: boolean;
  showBackground: boolean;
  showWatermark: boolean;
  width: number;
  fontSize: number;
  fontFamily: string;
  aspectRatio: AspectRatio;
  lang: string;
  format: ExportFormat;
  resolution: ExportResolution;
}

export interface HistoryEntry {
  id: string;
  songName: string;
  artistName: string;
  albumCoverUrl: string | null;
  lyrics: string;
  settings: ImageSettings;
  thumbnailDataUrl: string;
  createdAt: number;
}

export interface Template {
  id: string;
  name: string;
  settings: Partial<ImageSettings>;
  builtIn?: boolean;
}

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  kind: ToastKind;
  message: string;
}

export type WizardStep = 1 | 2 | 3 | 4;
