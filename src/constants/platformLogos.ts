import type { MusicPlatform } from '@/types';

export interface PlatformLogo {
  url: string;
  alt: string;
  /** CSS filter for light-on-dark vs dark-on-light export */
  lightTextFilter: string;
  darkTextFilter: string;
}

/** Monochrome wordmarks served from /public/logos */
export const PLATFORM_LOGOS: Record<
  Exclude<MusicPlatform, 'search'>,
  PlatformLogo
> = {
  spotify: {
    url: '/logos/spotify.svg',
    alt: 'Spotify',
    lightTextFilter: 'brightness(0) invert(1) opacity(0.7)',
    darkTextFilter: 'brightness(0) opacity(0.5)',
  },
  apple: {
    url: '/logos/apple-music.svg',
    alt: 'Apple Music',
    lightTextFilter: 'brightness(0) invert(1) opacity(0.75)',
    darkTextFilter: 'brightness(0) opacity(0.55)',
  },
  youtube: {
    url: '/logos/youtube-music.svg',
    alt: 'YouTube Music',
    lightTextFilter: 'brightness(0) invert(1) opacity(0.75)',
    darkTextFilter: 'brightness(0) opacity(0.55)',
  },
  deezer: {
    url: '/logos/deezer.svg',
    alt: 'Deezer',
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
