import { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { searchSongs } from '@/services/lastfm';
import { detectPlatform, loadFromUrl } from '@/services/links';
import { parseShareUrl, clearShareParams } from '@/utils/shareUrl';
import type { MusicPlatform } from '@/types';

export function useSearch() {
  const searchByName = useCallback(async (query: string) => {
    const state = useAppStore.getState();
    const cleaned = query.replace(/[\\/]/g, '').trim();
    if (!cleaned) {
      state.setError("Hold on! Haven't you forgotten about something?");
      return;
    }

    state.setError(null);
    state.setLinkThumbForResolve(null);
    state.setLoading(true, 'Searching for your song...');

    try {
      const results = await searchSongs(cleaned, 12);
      if (results.length === 0) throw new Error('No results');
      state.setSongs(results);
      state.setUsedDirectLink(false);
      state.deselectAllLyrics();
      state.addRecentSearch(cleaned);
      state.setStep(2);
      void state.resolveSongCovers();
    } catch {
      const msg = `Oops! Couldn't find any songs for "${cleaned}".`;
      state.setError(msg);
      state.pushToast('error', 'No results found');
    } finally {
      state.setLoading(false);
    }
  }, []);

  const searchByLink = useCallback(async (url: string) => {
    const state = useAppStore.getState();
    const trimmed = url.trim();
    if (!trimmed) {
      state.setError('Please paste a music link!');
      return;
    }

    const platform = detectPlatform(trimmed);
    if (!platform) {
      state.setError(
        'Unsupported link. Try Apple Music, Spotify, Deezer, or YouTube Music.'
      );
      return;
    }

    state.setError(null);
    state.setLoading(true, `Loading from ${platformLabel(platform)}...`);

    try {
      const result = await loadFromUrl(trimmed);
      if (!result) throw new Error('Could not load song');

      state.setLinkThumbForResolve(result.thumbnailUrl);
      state.setSongs([result.song]);
      state.selectSong(0);
      state.setUsedDirectLink(true);
      state.deselectAllLyrics();

      if (result.song.sourcePlatform && result.song.sourcePlatform !== 'search') {
        state.updateImageSettings({
          showPlatformTag: true,
          platformTagOverride: result.song.sourcePlatform,
        });
      }

      state.setStep(3);
      void state.resolveSongCovers([0]);
    } catch {
      const msg = "Couldn't load that song. Check the link and try again!";
      state.setError(msg);
      state.pushToast('error', msg);
    } finally {
      state.setLoading(false);
    }
  }, []);

  const initFromShareUrl = useCallback(async () => {
    const params = parseShareUrl();
    if (!params) return;
    clearShareParams();
    if (params.link) {
      await searchByLink(params.link);
    } else if (params.query) {
      await searchByName(params.query);
    }
  }, [searchByLink, searchByName]);

  return { searchByName, searchByLink, initFromShareUrl };
}

function platformLabel(platform: MusicPlatform): string {
  const labels: Record<MusicPlatform, string> = {
    spotify: 'Spotify',
    apple: 'Apple Music',
    youtube: 'YouTube Music',
    deezer: 'Deezer',
    search: 'search',
  };
  return labels[platform];
}
