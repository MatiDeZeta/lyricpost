import { create } from 'zustand';
import type { Song, ImageSettings, WizardStep, HistoryEntry } from '@/types';

const PRESET_COLORS = [
  '#1a1a1a',
  '#2a2a2a',
  '#3a3a3a',
  '#4a4a4a',
  '#0a0a0a',
  '#1e293b',
  '#27272a',
  '#292524',
  '#1c1917',
  '#0c0a09',
  '#18181b',
  '#111827',
];

const DEFAULT_IMAGE_SETTINGS: ImageSettings = {
  backgroundColor: PRESET_COLORS[0],
  gradient: null,
  useGradient: false,
  lightText: true,
  showSpotifyTag: false,
  showBackground: false,
  width: 320,
  fontSize: 20,
  fontFamily: 'Poppins',
  aspectRatio: 'free',
  lang: 'en',
};

const MAX_HISTORY = 10;

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem('lyricpost-history');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem('lyricpost-history', JSON.stringify(entries));
}

function loadTheme(): 'light' | 'dark' {
  const saved = localStorage.getItem('lyricpost-theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

interface AppState {
  // Wizard
  currentStep: WizardStep;
  setStep: (step: WizardStep) => void;

  // Search
  songs: Song[];
  setSongs: (songs: Song[]) => void;
  selectedSongIndex: number | null;
  selectSong: (index: number) => void;
  usedDirectLink: boolean;
  setUsedDirectLink: (v: boolean) => void;

  // Lyrics selection
  selectedLyricIndices: Set<number>;
  toggleLyricIndex: (index: number) => void;
  selectAllLyrics: () => void;
  deselectAllLyrics: () => void;

  // Image settings
  imageSettings: ImageSettings;
  updateImageSettings: (partial: Partial<ImageSettings>) => void;
  randomizeColor: () => void;

  // Loading / error
  isLoading: boolean;
  loadingMessage: string;
  setLoading: (loading: boolean, message?: string) => void;
  error: string | null;
  setError: (error: string | null) => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // History
  history: HistoryEntry[];
  addHistoryEntry: (entry: HistoryEntry) => void;
  clearHistory: () => void;

  // Presets
  presetColors: string[];
}

export const useAppStore = create<AppState>((set, get) => ({
  // Wizard
  currentStep: 1,
  setStep: (step) => set({ currentStep: step }),

  // Search
  songs: [],
  setSongs: (songs) => set({ songs }),
  selectedSongIndex: null,
  selectSong: (index) => set({ selectedSongIndex: index }),
  usedDirectLink: false,
  setUsedDirectLink: (v) => set({ usedDirectLink: v }),

  // Lyrics selection
  selectedLyricIndices: new Set(),
  toggleLyricIndex: (index) =>
    set((state) => {
      const next = new Set(state.selectedLyricIndices);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return { selectedLyricIndices: next };
    }),
  selectAllLyrics: () =>
    set((state) => {
      const song = state.songs[state.selectedSongIndex ?? -1];
      if (!song?.lyrics) return {};
      return {
        selectedLyricIndices: new Set(song.lyrics.map((_, i) => i)),
      };
    }),
  deselectAllLyrics: () => set({ selectedLyricIndices: new Set() }),

  // Image settings
  imageSettings: { ...DEFAULT_IMAGE_SETTINGS },
  updateImageSettings: (partial) =>
    set((state) => ({
      imageSettings: { ...state.imageSettings, ...partial },
    })),
  randomizeColor: () => {
    const colors = get().presetColors;
    const color = colors[Math.floor(Math.random() * colors.length)];
    set((state) => ({
      imageSettings: { ...state.imageSettings, backgroundColor: color },
    }));
  },

  // Loading / error
  isLoading: false,
  loadingMessage: '',
  setLoading: (loading, message = '') =>
    set({ isLoading: loading, loadingMessage: message }),
  error: null,
  setError: (error) => set({ error }),

  // Theme
  theme: loadTheme(),
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('lyricpost-theme', next);
      return { theme: next };
    }),

  // History
  history: loadHistory(),
  addHistoryEntry: (entry) =>
    set((state) => {
      const updated = [entry, ...state.history].slice(0, MAX_HISTORY);
      saveHistory(updated);
      return { history: updated };
    }),
  clearHistory: () => {
    saveHistory([]);
    set({ history: [] });
  },

  // Presets
  presetColors: PRESET_COLORS,
}));
