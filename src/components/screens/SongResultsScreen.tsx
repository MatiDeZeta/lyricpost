import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import Skeleton from '@/components/ui/Skeleton';
import CoverArt from '@/components/ui/CoverArt';

export default function SongResultsScreen() {
  const songs = useAppStore((s) => s.songs);
  const selectSong = useAppStore((s) => s.selectSong);
  const setStep = useAppStore((s) => s.setStep);
  const deselectAllLyrics = useAppStore((s) => s.deselectAllLyrics);
  const isLoading = useAppStore((s) => s.isLoading);

  const gridRef = useRef<HTMLDivElement>(null);

  const handleSelectSong = (index: number) => {
    selectSong(index);
    deselectAllLyrics();
    setStep(3);
  };

  // Keyboard nav across grid (arrow keys + Enter)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!gridRef.current) return;
      const buttons = Array.from(
        gridRef.current.querySelectorAll<HTMLButtonElement>('[data-result-card]')
      );
      if (buttons.length === 0) return;
      const active = document.activeElement as HTMLElement | null;
      let idx = buttons.findIndex((b) => b === active);
      if (idx === -1) idx = 0;

      const cols = window.matchMedia('(min-width: 640px)').matches ? 3 : 2;
      let next = idx;
      if (e.key === 'ArrowRight') next = Math.min(buttons.length - 1, idx + 1);
      else if (e.key === 'ArrowLeft') next = Math.max(0, idx - 1);
      else if (e.key === 'ArrowDown') next = Math.min(buttons.length - 1, idx + cols);
      else if (e.key === 'ArrowUp') next = Math.max(0, idx - cols);
      else if (e.key === 'Enter' && active?.dataset.resultCard) {
        e.preventDefault();
        active.click();
        return;
      } else return;

      e.preventDefault();
      buttons[next]?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
      className="max-w-2xl mx-auto px-5 pb-10"
    >
      <div className="flex items-center gap-3 py-5">
        <button
          onClick={() => setStep(1)}
          className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={16} className="text-neutral-500" />
        </button>
        <span className="text-[13px] font-medium text-neutral-400">
          {isLoading
            ? 'Finding songs...'
            : `${songs.length} results — pick one`}
        </span>
      </div>

      {isLoading && songs.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.04]"
            >
              <Skeleton className="aspect-square" rounded="rounded-none" />
              <div className="p-2.5 space-y-1.5">
                <Skeleton className="h-3 w-3/4" rounded="rounded-sm" />
                <Skeleton className="h-2.5 w-1/2" rounded="rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          ref={gridRef}
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.035 } },
          }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        >
          {songs.map((song, index) => (
            <motion.button
              key={`${song.name}-${index}`}
              data-result-card
              variants={{
                hidden: { opacity: 0, scale: 0.96 },
                show: { opacity: 1, scale: 1 },
              }}
              transition={{ duration: 0.22 }}
              onClick={() => handleSelectSong(index)}
              className="group text-left rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.05] focus:outline-none focus:ring-1 focus:ring-white/30 active:scale-[0.97] transition-all duration-200 cursor-pointer"
            >
              <div className="aspect-square overflow-hidden bg-white/[0.03] group-hover:scale-[1.02] transition-transform duration-500">
                <CoverArt
                  song={song}
                  songIndex={index}
                  size="md"
                  showUpload={false}
                  className="rounded-none"
                />
              </div>
              <div className="p-2.5">
                <div className="text-[12px] font-semibold text-white truncate leading-tight">
                  {song.name}
                </div>
                <div className="text-[11px] text-neutral-500 truncate mt-0.5">
                  {song.artists.map((a) => a.name).join(', ')}
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
