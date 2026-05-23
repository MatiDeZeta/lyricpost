import { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { searchSongs } from '@/services/lastfm';
import { loadFromSpotifyUrl, parseSpotifyUrl } from '@/services/spotify';

export function useSearch() {
  const searchByName = useCallback(async (query: string) => {
    const state = useAppStore.getState();
    const cleaned = query.replace(/[\\\/]/g, '').trim();
    if (!cleaned) {
      state.setError("Hold on! Haven't you forgotten about something?");
      return;
    }

    state.setError(null);
    state.setLoading(true, 'Searching for your song...');

    try {
      const results = await searchSongs(cleaned, 12);
      if (results.length === 0) {
        throw new Error('No results');
      }
      state.setSongs(results);
      state.setUsedDirectLink(false);
      state.deselectAllLyrics();
      state.addRecentSearch(cleaned);
      state.setStep(2);
    } catch {
      const msg = `Oops! Couldn't find any songs for "${cleaned}".`;
      state.setError(msg);
      state.pushToast('error', 'No results found');
    } finally {
      state.setLoading(false);
    }
  }, []);

  const searchBySpotifyLink = useCallback(async (url: string) => {
    const state = useAppStore.getState();
    const trimmed = url.trim();
    if (!trimmed) {
      state.setError('Please paste a Spotify link!');
      return;
    }

    if (!parseSpotifyUrl(trimmed)) {
      state.setError('Invalid Spotify link. Please check and try again!');
      return;
    }

    state.setError(null);
    state.setLoading(true, 'Loading song from Spotify...');

    try {
      const song = await loadFromSpotifyUrl(trimmed);
      if (!song) throw new Error('Could not load song');
      state.setSongs([song]);
      state.selectSong(0);
      state.setUsedDirectLink(true);
      state.deselectAllLyrics();
      state.setStep(3);
    } catch {
      const msg = "Couldn't load that song. Check the link and try again!";
      state.setError(msg);
      state.pushToast('error', msg);
    } finally {
      state.setLoading(false);
    }
  }, []);

  return { searchByName, searchBySpotifyLink };
}
