import { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { fetchLyrics } from '@/services/lrclib';
import { parseLyrics } from '@/services/lastfm';

export function useLyrics() {
  const loadLyrics = useCallback(async () => {
    // Read fresh state directly from store to avoid stale closures
    const state = useAppStore.getState();
    const { selectedSongIndex, songs } = state;

    if (selectedSongIndex === null) return;
    const song = songs[selectedSongIndex];
    if (!song) return;

    // If lyrics already loaded, skip
    if (song.lyrics && song.lyrics.length > 0) {
      return;
    }

    state.setLoading(true, "Searching for song's lyrics...");
    state.deselectAllLyrics();

    const artists = song.artists.map((a) => a.name);
    let lyricsResult = null;

    try {
      for (const artist of artists) {
        lyricsResult = await fetchLyrics(artist, song.name);
        if (lyricsResult) break;
      }

      const freshState = useAppStore.getState();
      const freshSongs = [...freshState.songs];

      if (!lyricsResult) {
        freshSongs[selectedSongIndex] = {
          ...song,
          lyrics: [],
          hasSyncedLyrics: false,
        };
        freshState.setSongs(freshSongs);
        return;
      }

      const { lyrics, hasSynced } = parseLyrics(lyricsResult);
      freshSongs[selectedSongIndex] = {
        ...song,
        lyrics,
        hasSyncedLyrics: hasSynced,
      };
      freshState.setSongs(freshSongs);
    } catch (err) {
      console.error('Failed to fetch lyrics:', err);
      const freshState = useAppStore.getState();
      const freshSongs = [...freshState.songs];
      freshSongs[selectedSongIndex] = {
        ...song,
        lyrics: [],
        hasSyncedLyrics: false,
      };
      freshState.setSongs(freshSongs);
    } finally {
      useAppStore.getState().setLoading(false);
    }
  }, []);

  return { loadLyrics };
}
