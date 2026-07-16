import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Download, RotateCcw } from 'lucide-react';
import { useAppStore, DEFAULT_IMAGE_SETTINGS } from '@/store/useAppStore';
import type { HistoryEntry, Song } from '@/types';

function formatDate(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const isSameDay = d.toDateString() === today.toDateString();
  if (isSameDay) {
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function HistoryDrawer() {
  const isOpen = useAppStore((s) => s.isHistoryOpen);
  const closeHistoryDrawer = useAppStore((s) => s.closeHistoryDrawer);
  const history = useAppStore((s) => s.history);
  const removeHistoryEntry = useAppStore((s) => s.removeHistoryEntry);
  const clearHistory = useAppStore((s) => s.clearHistory);
  const setSongs = useAppStore((s) => s.setSongs);
  const selectSong = useAppStore((s) => s.selectSong);
  const setStep = useAppStore((s) => s.setStep);
  const updateImageSettings = useAppStore((s) => s.updateImageSettings);
  const setLyricOrder = useAppStore((s) => s.setLyricOrder);
  const pushToast = useAppStore((s) => s.pushToast);

  const restore = (entry: HistoryEntry) => {
    const lines = entry.lyrics
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    const phantom: Song = {
      name: entry.songName,
      durationMs: 0,
      artists: entry.artistName
        .split(',')
        .map((a) => ({ name: a.trim() }))
        .filter((a) => a.name.length > 0),
      albumCoverUrl: entry.albumCoverUrl,
      customCoverUrl: null,
      coverResolvedUrl: entry.albumCoverUrl,
      coverLoading: false,
      hasSyncedLyrics: false,
      lyrics: lines.map((text) => ({ time: null, text })),
    };

    setSongs([phantom]);
    selectSong(0);

    const allIndices = lines.map((_, i) => i);
    useAppStore.setState({
      selectedLyricIndices: new Set(allIndices),
    });
    setLyricOrder(allIndices);
    updateImageSettings({ ...DEFAULT_IMAGE_SETTINGS, ...entry.settings });
    setStep(4);
    closeHistoryDrawer();
    pushToast('success', 'Restored from history');
    if (!entry.albumCoverUrl) {
      void useAppStore.getState().resolveSongCovers([0]);
    }
  };

  const downloadThumb = (entry: HistoryEntry) => {
    const a = document.createElement('a');
    a.href = entry.thumbnailDataUrl;
    a.download = `${entry.artistName} - ${entry.songName}.jpg`;
    a.click();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeHistoryDrawer}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', ease: [0.25, 0.1, 0.25, 1], duration: 0.28 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-[#0a0a0a] border-l border-white/[0.04] z-[61] flex flex-col"
          >
            <div className="flex items-center justify-between px-5 h-12 border-b border-white/[0.04]">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-white">History</span>
                <span className="text-[11px] text-neutral-600 tabular-nums">
                  {history.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button
                    onClick={() => {
                      clearHistory();
                      pushToast('info', 'History cleared');
                    }}
                    className="text-[11px] text-neutral-500 hover:text-red-300 transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={10} />
                    Clear all
                  </button>
                )}
                <button
                  onClick={closeHistoryDrawer}
                  className="p-1.5 -mr-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
                  aria-label="Close"
                >
                  <X size={14} className="text-neutral-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-neutral-700">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                    <RotateCcw size={16} className="text-neutral-700" />
                  </div>
                  <p className="text-[12px] text-neutral-500">No exports yet</p>
                  <p className="text-[11px] text-neutral-700 max-w-[200px]">
                    Saved images appear here so you can restore or re-download them.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {history.map((entry) => (
                    <div
                      key={entry.id}
                      className="group rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] transition-all"
                    >
                      <button
                        onClick={() => restore(entry)}
                        className="block w-full aspect-square bg-white/[0.04] overflow-hidden relative"
                        title="Restore"
                        aria-label={`Restore ${entry.songName}`}
                      >
                        <img
                          src={entry.thumbnailDataUrl}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <span className="text-[11px] font-semibold text-white px-2 py-1 rounded-md bg-white/10 backdrop-blur">
                            Restore
                          </span>
                        </div>
                      </button>
                      <div className="p-2">
                        <div className="text-[11px] font-semibold text-white truncate leading-tight">
                          {entry.songName}
                        </div>
                        <div className="text-[10px] text-neutral-600 truncate">
                          {entry.artistName}
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[9px] text-neutral-700 tabular-nums">
                            {formatDate(entry.createdAt)}
                          </span>
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={() => downloadThumb(entry)}
                              className="p-1 rounded text-neutral-600 hover:text-white hover:bg-white/[0.06] transition-colors"
                              aria-label="Download thumbnail"
                              title="Download thumb"
                            >
                              <Download size={10} />
                            </button>
                            <button
                              onClick={() => removeHistoryEntry(entry.id)}
                              className="p-1 rounded text-neutral-600 hover:text-red-300 hover:bg-white/[0.06] transition-colors"
                              aria-label="Delete entry"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
