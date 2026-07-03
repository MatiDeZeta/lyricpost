import type { MusicPlatform } from '@/types';
import type { Song } from '@/types';

export interface LinkLoadResult {
  song: Song;
  thumbnailUrl: string | null;
  platform: MusicPlatform;
  sourceUrl: string;
}

export const PLATFORM_LABELS: Record<MusicPlatform, string> = {
  spotify: 'Spotify',
  apple: 'Apple Music',
  youtube: 'YouTube Music',
  tidal: 'Tidal',
  deezer: 'Deezer',
  amazon: 'Amazon Music',
  search: 'Search',
};
