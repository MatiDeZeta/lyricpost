import { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { searchSongs } from '@/services/lastfm';
import { loadFromSpotifyUrl, parseSpotifyUrl } from '@/services/spotify';

export function useSearch() {
  const {
    setSongs,
    setStep,
    setLoading,
    setError,
    setUsedDirectLink,
    selectSong,
    deselectAllLyrics,
  } = useAppStore();

  const searchByName = useCallback(
    async (query: string) => {
      const cleaned = query.replace(/[\\\/]/g, '').trim();
      if (!cleaned) {
        setError("Hold on! Haven't you forgotten about something?");
        return;
      }

      setError(null);
      setLoading(true, 'Searching for your song...');

      try {
        const results = await searchSongs(cleaned, 6);
        if (results.length === 0) {
          throw new Error('No results');
        }
        setSongs(results);
        setUsedDirectLink(false);
        deselectAllLyrics();
        setStep(2);
      } catch {
        setError(`Oops! Couldn't find any songs for "${cleaned}".`);
      } finally {
        setLoading(false);
      }
    },
    [setSongs, setStep, setLoading, setError, setUsedDirectLink, deselectAllLyrics]
  );

  const searchBySpotifyLink = useCallback(
    async (url: string) => {
      const trimmed = url.trim();
      if (!trimmed) {
        setError('Please paste a Spotify link!');
        return;
      }

      if (!parseSpotifyUrl(trimmed)) {
        setError('Invalid Spotify link. Please check and try again!');
        return;
      }

      setError(null);
      setLoading(true, 'Loading song from Spotify...');

      try {
        const song = await loadFromSpotifyUrl(trimmed);
        if (!song) {
          throw new Error('Could not load song');
        }
        setSongs([song]);
        selectSong(0);
        setUsedDirectLink(true);
        deselectAllLyrics();
        setStep(3);
      } catch {
        setError("Couldn't load that song. Check the link and try again!");
      } finally {
        setLoading(false);
      }
    },
    [setSongs, selectSong, setStep, setLoading, setError, setUsedDirectLink, deselectAllLyrics]
  );

  return { searchByName, searchBySpotifyLink };
}
