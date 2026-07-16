import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { resolveCoverForSong } from '@/services/coverArt';
import { createSafeStorage, MAX_TOASTS } from '@/utils/persistStorage';
import type {
  Song,
  ImageSettings,
  WizardStep,
  HistoryEntry,
  Template,
  Toast,
  ToastKind,
} from '@/types';

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

export const DEFAULT_IMAGE_SETTINGS: ImageSettings = {
  backgroundColor: PRESET_COLORS[0],
  gradient: null,
  useGradient: false,
  backgroundImage: null,
  lightText: true,
  showPlatformTag: false,
  showBackground: false,
  showWatermark: false,
  showCover: true,
  showTitle: true,
  showArtist: true,
  lineHeight: 1.4,
  width: 320,
  fontSize: 20,
  fontFamily: 'Poppins',
  aspectRatio: 'free',
  lang: 'en',
  format: 'png',
  resolution: 4,
};

const BUILTIN_TEMPLATES: Template[] = [
  {
    id: 'builtin-minimal',
    name: 'Minimal',
    builtIn: true,
    settings: {
      backgroundColor: '#0a0a0a',
      useGradient: false,
      lightText: true,
      showPlatformTag: false,
      showBackground: false,
      showWatermark: false,
      fontFamily: 'Inter',
      fontSize: 18,
      aspectRatio: 'free',
      width: 320,
    },
  },
  {
    id: 'builtin-tape',
    name: 'Tape',
    builtIn: true,
    settings: {
      backgroundColor: '#1c1917',
      gradient: { from: '#1c1917', to: '#0a0a0a', angle: 180 },
      useGradient: true,
      lightText: true,
      showPlatformTag: true,
      showBackground: true,
      showWatermark: false,
      fontFamily: 'Playfair Display',
      fontSize: 22,
      aspectRatio: '4:5',
      width: 360,
    },
  },
  {
    id: 'builtin-poster',
    name: 'Poster',
    builtIn: true,
    settings: {
      backgroundColor: '#18181b',
      gradient: { from: '#18181b', to: '#3a3a3a', angle: 135 },
      useGradient: true,
      lightText: true,
      showPlatformTag: false,
      showBackground: true,
      showWatermark: true,
      fontFamily: 'Poppins',
      fontSize: 24,
      aspectRatio: '9:16',
      width: 360,
    },
  },
];

const MAX_HISTORY = 30;
const MAX_RECENT_SEARCHES = 6;

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
  linkThumbForResolve: string | null;
  setLinkThumbForResolve: (url: string | null) => void;
  setSongCover: (index: number, dataUrl: string | null) => void;
  resolveSongCovers: (indices?: number[]) => Promise<void>;

  // Recent searches (persisted)
  recentSearches: string[];
  addRecentSearch: (q: string) => void;
  removeRecentSearch: (q: string) => void;
  clearRecentSearches: () => void;

  // Lyrics selection
  selectedLyricIndices: Set<number>;
  toggleLyricIndex: (index: number) => void;
  selectAllLyrics: () => void;
  deselectAllLyrics: () => void;

  // Custom ordering of selected lyrics (indices into songs[i].lyrics)
  lyricOrder: number[];
  setLyricOrder: (order: number[]) => void;

  // Inline edits to lyric text without mutating original song fetch
  updateLyricText: (index: number, text: string) => void;
  addCustomLyricLine: (text: string) => void;

  // Image settings (persisted)
  imageSettings: ImageSettings;
  updateImageSettings: (partial: Partial<ImageSettings>) => void;
  randomizeColor: () => void;
  resetImageSettings: () => void;
  shuffleColor: () => void;
  applyTemplate: (template: Template) => void;

  // Loading / error
  isLoading: boolean;
  loadingMessage: string;
  setLoading: (loading: boolean, message?: string) => void;
  error: string | null;
  setError: (error: string | null) => void;

  // History (persisted)
  history: HistoryEntry[];
  addHistoryEntry: (entry: HistoryEntry) => void;
  removeHistoryEntry: (id: string) => void;
  clearHistory: () => void;

  // Templates (persisted)
  templates: Template[];
  addTemplate: (name: string, settings: ImageSettings) => void;
  removeTemplate: (id: string) => void;

  // Toasts
  toasts: Toast[];
  pushToast: (kind: ToastKind, message: string) => void;
  dismissToast: (id: string) => void;

  // UI: drawer
  isHistoryOpen: boolean;
  openHistoryDrawer: () => void;
  closeHistoryDrawer: () => void;

  // Presets
  presetColors: string[];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Wizard
      currentStep: 1,
      setStep: (step) => set({ currentStep: step }),

      // Search
      songs: [],
      setSongs: (songs) => set({ songs }),
      selectedSongIndex: null,
      selectSong: (index) => {
        set({ selectedSongIndex: index });
        void get().resolveSongCovers([index]);
      },
      usedDirectLink: false,
      setUsedDirectLink: (v) => set({ usedDirectLink: v }),
      linkThumbForResolve: null,
      setLinkThumbForResolve: (url) => set({ linkThumbForResolve: url }),

      setSongCover: (index, dataUrl) =>
        set((state) => {
          const songs = [...state.songs];
          const song = songs[index];
          if (!song) return {};
          songs[index] = {
            ...song,
            customCoverUrl: dataUrl,
            coverResolvedUrl: dataUrl,
          };
          return { songs };
        }),

      resolveSongCovers: async (indices) => {
        const state = get();
        const targetIndices =
          indices ?? state.songs.map((_, i) => i);

        for (const i of targetIndices) {
          const song = get().songs[i];
          if (!song || song.customCoverUrl) continue;

          set((s) => {
            const songs = [...s.songs];
            if (!songs[i]) return {};
            songs[i] = { ...songs[i], coverLoading: true };
            return { songs };
          });

          const thumb =
            i === 0 ? get().linkThumbForResolve : null;
          const resolved = await resolveCoverForSong(song, thumb);

          set((s) => {
            const songs = [...s.songs];
            if (!songs[i]) return {};
            songs[i] = {
              ...songs[i],
              coverResolvedUrl: resolved,
              coverLoading: false,
            };
            return { songs };
          });
        }

        set({ linkThumbForResolve: null });
      },

      // Recent searches
      recentSearches: [],
      addRecentSearch: (q) => {
        const cleaned = q.trim();
        if (!cleaned) return;
        const next = [
          cleaned,
          ...get().recentSearches.filter(
            (r) => r.toLowerCase() !== cleaned.toLowerCase()
          ),
        ].slice(0, MAX_RECENT_SEARCHES);
        set({ recentSearches: next });
      },
      removeRecentSearch: (q) =>
        set((state) => ({
          recentSearches: state.recentSearches.filter((r) => r !== q),
        })),
      clearRecentSearches: () => set({ recentSearches: [] }),

      // Lyrics selection
      selectedLyricIndices: new Set(),
      toggleLyricIndex: (index) =>
        set((state) => {
          const next = new Set(state.selectedLyricIndices);
          let order = [...state.lyricOrder];
          if (next.has(index)) {
            next.delete(index);
            order = order.filter((i) => i !== index);
          } else {
            next.add(index);
            order.push(index);
          }
          return { selectedLyricIndices: next, lyricOrder: order };
        }),
      selectAllLyrics: () =>
        set((state) => {
          const song = state.songs[state.selectedSongIndex ?? -1];
          if (!song?.lyrics) return {};
          const all = song.lyrics.map((_, i) => i);
          return {
            selectedLyricIndices: new Set(all),
            lyricOrder: all,
          };
        }),
      deselectAllLyrics: () =>
        set({ selectedLyricIndices: new Set(), lyricOrder: [] }),

      // Custom order
      lyricOrder: [],
      setLyricOrder: (order) => set({ lyricOrder: order }),

      updateLyricText: (index, text) =>
        set((state) => {
          if (state.selectedSongIndex === null) return {};
          const songs = [...state.songs];
          const song = songs[state.selectedSongIndex];
          if (!song?.lyrics) return {};
          const lyrics = [...song.lyrics];
          if (!lyrics[index]) return {};
          lyrics[index] = { ...lyrics[index], text };
          songs[state.selectedSongIndex] = { ...song, lyrics };
          return { songs };
        }),

      addCustomLyricLine: (text) =>
        set((state) => {
          if (state.selectedSongIndex === null) return {};
          const songs = [...state.songs];
          const song = songs[state.selectedSongIndex];
          if (!song) return {};
          const lyrics = song.lyrics ? [...song.lyrics] : [];
          const newIndex = lyrics.length;
          lyrics.push({ time: null, text });
          songs[state.selectedSongIndex] = { ...song, lyrics };
          const selected = new Set(state.selectedLyricIndices);
          selected.add(newIndex);
          return {
            songs,
            selectedLyricIndices: selected,
            lyricOrder: [...state.lyricOrder, newIndex],
          };
        }),

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
      resetImageSettings: () =>
        set({ imageSettings: { ...DEFAULT_IMAGE_SETTINGS } }),
      shuffleColor: () => {
        const colors = get().presetColors;
        const current = get().imageSettings.backgroundColor;
        let color = current;
        while (color === current && colors.length > 1) {
          color = colors[Math.floor(Math.random() * colors.length)];
        }
        set((state) => ({
          imageSettings: {
            ...state.imageSettings,
            backgroundColor: color,
            useGradient: false,
            backgroundImage: null,
          },
        }));
      },
      applyTemplate: (template) =>
        set((state) => ({
          imageSettings: {
            ...DEFAULT_IMAGE_SETTINGS,
            ...state.imageSettings,
            ...template.settings,
          },
        })),

      // Loading / error
      isLoading: false,
      loadingMessage: '',
      setLoading: (loading, message = '') =>
        set({ isLoading: loading, loadingMessage: message }),
      error: null,
      setError: (error) => set({ error }),

      // History
      history: [],
      addHistoryEntry: (entry) =>
        set((state) => {
          const updated = [entry, ...state.history].slice(0, MAX_HISTORY);
          return { history: updated };
        }),
      removeHistoryEntry: (id) =>
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
        })),
      clearHistory: () => set({ history: [] }),

      // Templates
      templates: BUILTIN_TEMPLATES,
      addTemplate: (name, settings) =>
        set((state) => {
          const tpl: Template = {
            id: crypto.randomUUID(),
            name: name.trim() || 'Untitled',
            settings,
          };
          return { templates: [...state.templates, tpl] };
        }),
      removeTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id || t.builtIn),
        })),

      // Toasts
      toasts: [],
      pushToast: (kind, message) => {
        const id = crypto.randomUUID();
        set((state) => {
          const next = [...state.toasts, { id, kind, message }];
          return { toasts: next.slice(-MAX_TOASTS) };
        });
        setTimeout(() => {
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          }));
        }, 2600);
      },
      dismissToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      // UI: drawer
      isHistoryOpen: false,
      openHistoryDrawer: () => set({ isHistoryOpen: true }),
      closeHistoryDrawer: () => set({ isHistoryOpen: false }),

      // Presets
      presetColors: PRESET_COLORS,
    }),
    {
      name: 'lyricpost-store',
      version: 3,
      storage: createJSONStorage(() => createSafeStorage()),
      // Only persist user-facing prefs/history/templates, not transient state
      partialize: (state) => ({
        imageSettings: {
          ...state.imageSettings,
          // Session-only — large data URLs must not fill localStorage
          backgroundImage: null,
        },
        recentSearches: state.recentSearches,
        history: state.history,
        templates: state.templates,
      }),
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as {
          imageSettings?: Record<string, unknown>;
          recentSearches?: string[];
          history?: HistoryEntry[];
          templates?: Template[];
        };

        const imageSettings = { ...(state.imageSettings ?? {}) };
        if (
          'showSpotifyTag' in imageSettings &&
          !('showPlatformTag' in imageSettings)
        ) {
          imageSettings.showPlatformTag = imageSettings.showSpotifyTag;
          delete imageSettings.showSpotifyTag;
        }
        if ('backgroundImage' in imageSettings) {
          imageSettings.backgroundImage = null;
        }
        const tagOverride = imageSettings.platformTagOverride;
        if (tagOverride === 'amazon' || tagOverride === 'tidal') {
          delete imageSettings.platformTagOverride;
          imageSettings.showPlatformTag = false;
        }

        if (version >= 3) {
          return { ...state, imageSettings } as unknown as Partial<AppState>;
        }

        return {
          ...state,
          imageSettings,
        } as unknown as Partial<AppState>;
      },
      // Ensure built-in templates are always available even if storage
      // was written by an older version that didn't include them.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppState>;
        const persistedTemplates = p.templates ?? [];
        const builtInIds = new Set(BUILTIN_TEMPLATES.map((t) => t.id));
        const userTemplates = persistedTemplates.filter(
          (t) => !builtInIds.has(t.id)
        );
        const migratedSettings = { ...(p.imageSettings ?? {}) } as Record<
          string,
          unknown
        >;
        if (
          'showSpotifyTag' in migratedSettings &&
          !('showPlatformTag' in migratedSettings)
        ) {
          migratedSettings.showPlatformTag = migratedSettings.showSpotifyTag;
          delete migratedSettings.showSpotifyTag;
        }
        if ('backgroundImage' in migratedSettings) {
          migratedSettings.backgroundImage = null;
        }
        const tagOverride = migratedSettings.platformTagOverride;
        if (tagOverride === 'amazon' || tagOverride === 'tidal') {
          delete migratedSettings.platformTagOverride;
          migratedSettings.showPlatformTag = false;
        }
        return {
          ...current,
          ...p,
          imageSettings: {
            ...DEFAULT_IMAGE_SETTINGS,
            ...current.imageSettings,
            ...migratedSettings,
          },
          templates: [...BUILTIN_TEMPLATES, ...userTemplates],
        };
      },
    }
  )
);
