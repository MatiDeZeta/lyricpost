import type { StateStorage } from 'zustand/middleware';

const MAX_TOASTS = 3;

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
      try {
        localStorage.setItem(name, value);
      } catch (e) {
        if (
          e instanceof DOMException &&
          (e.name === 'QuotaExceededError' || e.code === 22)
        ) {
          trimPersistedHistory(name, value);
          window.dispatchEvent(new CustomEvent('lyricpost-storage-trim'));
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

function trimPersistedHistory(name: string, value: string) {
  try {
    const parsed = JSON.parse(value) as {
      state?: { history?: unknown[] };
    };
    const history = parsed?.state?.history;
    if (Array.isArray(history) && history.length > 10) {
      parsed.state!.history = history.slice(0, 10);
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
