import type { MusicPlatform } from '@/types';

export interface PlatformLogo {
  url: string;
  alt: string;
  /** CSS filter for light-on-dark vs dark-on-light export */
  lightTextFilter: string;
  darkTextFilter: string;
}

export const PLATFORM_LOGOS: Record<
  Exclude<MusicPlatform, 'search'>,
  PlatformLogo
> = {
  spotify: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg',
    alt: 'Spotify',
    lightTextFilter: 'brightness(0) invert(1) opacity(0.7)',
    darkTextFilter: 'brightness(0) opacity(0.5)',
  },
  apple: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Apple_Music_logo.svg',
    alt: 'Apple Music',
    lightTextFilter: 'brightness(0) invert(1) opacity(0.75)',
    darkTextFilter: 'brightness(0) opacity(0.55)',
  },
  youtube: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Music_Logo.svg',
    alt: 'YouTube Music',
    lightTextFilter: 'brightness(0) invert(1) opacity(0.75)',
    darkTextFilter: 'brightness(0) opacity(0.55)',
  },
  tidal: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Tidal_logo.svg',
    alt: 'Tidal',
    lightTextFilter: 'brightness(0) invert(1) opacity(0.75)',
    darkTextFilter: 'brightness(0) opacity(0.55)',
  },
  deezer: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Deezer_logo%2C_2019.svg',
    alt: 'Deezer',
    lightTextFilter: 'brightness(0) invert(1) opacity(0.75)',
    darkTextFilter: 'brightness(0) opacity(0.55)',
  },
  amazon: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Amazon_Music_logo.svg',
    alt: 'Amazon Music',
    lightTextFilter: 'brightness(0) invert(1) opacity(0.75)',
    darkTextFilter: 'brightness(0) opacity(0.55)',
  },
};

export function getPlatformForTag(
  override: MusicPlatform | undefined,
  songPlatform: MusicPlatform | undefined
): Exclude<MusicPlatform, 'search'> | null {
  const platform = override ?? songPlatform;
  if (!platform || platform === 'search') return null;
  return platform;
}
