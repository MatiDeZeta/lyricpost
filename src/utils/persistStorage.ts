import type { StateStorage } from 'zustand/middleware';

const MAX_TOASTS = 3;

let isPersisting = false;
let trimNoticePending = false;

/** Safe localStorage wrapper for zustand persist */
export function createSafeStorage(): StateStorage {
  return {
    getItem: (name) => {
      try {
        return localStorage.getItem(name);
      } catch {
        return null;
      }
    },
    setItem: (name, value) => {
      if (isPersisting) return;

      try {
        localStorage.setItem(name, value);
        trimNoticePending = false;
      } catch (e) {
        if (
          e instanceof DOMException &&
          (e.name === 'QuotaExceededError' || e.code === 22)
        ) {
          isPersisting = true;
          try {
            const light = stripHeavyPersistedState(value);
            localStorage.setItem(name, light);
          } catch {
            trimPersistedHistory(name, value);
          } finally {
            isPersisting = false;
          }

          if (!trimNoticePending) {
            trimNoticePending = true;
            queueMicrotask(() => {
              window.dispatchEvent(new CustomEvent('lyricpost-storage-trim'));
            });
          }
        }
      }
    },
    removeItem: (name) => {
      try {
        localStorage.removeItem(name);
      } catch {
        /* ignore */
      }
    },
  };
}

/** Drop session-only blobs before writing to localStorage */
export function stripHeavyPersistedState(value: string): string {
  const parsed = JSON.parse(value) as {
    state?: {
      imageSettings?: { backgroundImage?: unknown };
      history?: Array<{ settings?: { backgroundImage?: unknown } }>;
    };
  };

  if (parsed.state?.imageSettings?.backgroundImage) {
    parsed.state.imageSettings.backgroundImage = null;
  }

  if (Array.isArray(parsed.state?.history)) {
    parsed.state.history = parsed.state.history.map((entry) => {
      if (!entry.settings?.backgroundImage) return entry;
      return {
        ...entry,
        settings: { ...entry.settings, backgroundImage: null },
      };
    });
  }

  return JSON.stringify(parsed);
}

function trimPersistedHistory(name: string, value: string) {
  try {
    const parsed = JSON.parse(value) as {
      state?: { history?: unknown[]; imageSettings?: { backgroundImage?: unknown } };
    };
    if (parsed.state?.imageSettings) {
      parsed.state.imageSettings.backgroundImage = null;
    }
    const history = parsed?.state?.history;
    if (Array.isArray(history) && history.length > 10) {
      parsed.state!.history = history.slice(0, 10);
      localStorage.setItem(name, JSON.stringify(parsed));
      return;
    }
    if (parsed.state) {
      localStorage.setItem(name, JSON.stringify(parsed));
      return;
    }
  } catch {
    /* ignore */
  }
  try {
    localStorage.removeItem(name);
  } catch {
    /* ignore */
  }
}

export { MAX_TOASTS };
