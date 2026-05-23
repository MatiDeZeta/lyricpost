import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X, RotateCcw, Check, Plus } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface KaraokePreviewProps {
  open: boolean;
  onClose: () => void;
}

function formatTime(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '0:00';
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const TICK_MS = 60;

export default function KaraokePreview({ open, onClose }: KaraokePreviewProps) {
  const songs = useAppStore((s) => s.songs);
  const selectedSongIndex = useAppStore((s) => s.selectedSongIndex);
  const selectedLyricIndices = useAppStore((s) => s.selectedLyricIndices);
  const toggleLyricIndex = useAppStore((s) => s.toggleLyricIndex);

  const song = selectedSongIndex !== null ? songs[selectedSongIndex] : null;

  const timedLyrics = useMemo(
    () =>
      (song?.lyrics ?? []).filter(
        (l): l is { time: number; text: string } => l.time !== null
      ),
    [song]
  );

  const totalMs = useMemo(() => {
    const last = timedLyrics[timedLyrics.length - 1];
    return last ? last.time + 4000 : 0;
  }, [timedLyrics]);

  const [playing, setPlaying] = useState(false);
  const [now, setNow] = useState(0);
  const tickRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setPlaying(false);
      setNow(0);
    }
  }, [open]);

  useEffect(() => {
    if (!playing) {
      if (tickRef.current !== null) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return;
    }
    lastTickRef.current = performance.now();
    tickRef.current = window.setInterval(() => {
      const t = performance.now();
      const dt = t - lastTickRef.current;
      lastTickRef.current = t;
      setNow((prev) => {
        const next = prev + dt;
        if (next >= totalMs) {
          setPlaying(false);
          return totalMs;
        }
        return next;
      });
    }, TICK_MS);
    return () => {
      if (tickRef.current !== null) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [playing, totalMs]);

  const currentLineIdx = useMemo(() => {
    let idx = -1;
    for (let i = 0; i < timedLyrics.length; i++) {
      const t = timedLyrics[i].time;
      if (t <= now) idx = i;
      else break;
    }
    return idx;
  }, [now, timedLyrics]);

  // Auto-scroll active line into view
  useEffect(() => {
    if (currentLineIdx < 0 || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-line-idx="${currentLineIdx}"]`
    );
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentLineIdx]);

  // Map timed-lyric index back to original song.lyrics index
  const originalIndexOf = (timedIdx: number): number => {
    const target = timedLyrics[timedIdx];
    if (!target || !song?.lyrics) return -1;
    return song.lyrics.findIndex(
      (l) => l.time === target.time && l.text === target.text
    );
  };

  if (!song) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70]"
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed inset-x-3 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[440px] max-h-[80vh] z-[71] rounded-2xl bg-[#0a0a0a] border border-white/[0.06] shadow-2xl shadow-black/80 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 h-11 border-b border-white/[0.04]">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[12px] font-semibold text-white">Karaoke preview</span>
                <span className="text-[10px] text-neutral-600 truncate">
                  {song.name}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 -mr-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
                aria-label="Close"
              >
                <X size={13} className="text-neutral-500" />
              </button>
            </div>

            <div
              ref={listRef}
              className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5"
            >
              {timedLyrics.length === 0 && (
                <div className="text-center text-[12px] text-neutral-600 py-10">
                  No timing info available for this song.
                </div>
              )}
              {timedLyrics.map((line, i) => {
                const origIdx = originalIndexOf(i);
                const isSelected =
                  origIdx >= 0 && selectedLyricIndices.has(origIdx);
                const isCurrent = i === currentLineIdx;
                return (
                  <div
                    key={i}
                    data-line-idx={i}
                    className={`flex items-start gap-2 px-2 py-1.5 rounded-lg transition-all duration-200 ${
                      isCurrent
                        ? 'bg-white/[0.08] text-white scale-[1.02]'
                        : isSelected
                          ? 'text-neutral-300'
                          : 'text-neutral-600'
                    }`}
                  >
                    <span className="text-[9px] font-mono tabular-nums text-neutral-700 w-9 shrink-0 mt-0.5">
                      {formatTime(line.time)}
                    </span>
                    <span
                      className={`flex-1 text-[13px] leading-snug ${
                        isCurrent ? 'font-semibold' : ''
                      }`}
                    >
                      {line.text}
                    </span>
                    <button
                      onClick={() => {
                        if (origIdx >= 0) toggleLyricIndex(origIdx);
                      }}
                      className={`p-1 rounded transition-colors shrink-0 ${
                        isSelected
                          ? 'text-white hover:bg-white/[0.1]'
                          : 'text-neutral-600 hover:text-neutral-200 hover:bg-white/[0.06]'
                      }`}
                      title={isSelected ? 'Deselect' : 'Add to selection'}
                    >
                      {isSelected ? <Check size={11} /> : <Plus size={11} />}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-white/[0.04] p-3 space-y-2.5">
              <input
                type="range"
                min={0}
                max={totalMs || 1}
                step={100}
                value={now}
                onChange={(e) => setNow(Number(e.target.value))}
                className="w-full h-1 rounded-full appearance-none bg-white/[0.06]"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-neutral-600 font-mono tabular-nums">
                  {formatTime(now)} / {formatTime(totalMs)}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setNow(0);
                      setPlaying(false);
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/[0.06] text-neutral-500 hover:text-neutral-200 transition-colors"
                    aria-label="Restart"
                  >
                    <RotateCcw size={12} />
                  </button>
                  <button
                    onClick={() => setPlaying((p) => !p)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-black text-[11px] font-semibold hover:bg-neutral-100 transition-colors"
                  >
                    {playing ? <Pause size={11} /> : <Play size={11} />}
                    {playing ? 'Pause' : 'Play'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
