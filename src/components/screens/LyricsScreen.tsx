import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, FileText } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useLyrics } from '@/hooks/useLyrics';

const FALLBACK_COVER =
  'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png';

export default function LyricsScreen() {
  const {
    songs,
    selectedSongIndex,
    selectedLyricIndices,
    toggleLyricIndex,
    selectAllLyrics,
    deselectAllLyrics,
    setStep,
    usedDirectLink,
    randomizeColor,
    isLoading,
    loadingMessage,
  } = useAppStore();

  const { loadLyrics } = useLyrics();

  const song = selectedSongIndex !== null ? songs[selectedSongIndex] : null;
  const lyrics = song?.lyrics ?? [];
  const hasSelection = selectedLyricIndices.size > 0;
  const allSelected = lyrics.length > 0 && selectedLyricIndices.size === lyrics.length;

  useEffect(() => {
    if (song && !song.lyrics) {
      loadLyrics();
    }
  }, [song, loadLyrics]);

  const handleBack = () => {
    setStep(usedDirectLink ? 1 : 2);
  };

  const handleNext = () => {
    randomizeColor();
    setStep(4);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
      className="max-w-2xl mx-auto px-5 pb-24"
    >
      {/* Header */}
      <div className="flex items-center justify-between py-5">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={16} className="text-neutral-500" />
          </button>
          {song && (
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={song.albumCoverUrl || FALLBACK_COVER}
                alt="Cover"
                className="w-8 h-8 rounded-md object-cover shrink-0"
              />
              <div className="min-w-0">
                <div className="text-[12px] font-semibold text-white truncate leading-tight">
                  {song.name}
                </div>
                <div className="text-[11px] text-neutral-600 truncate">
                  {song.artists.map((a) => a.name).join(', ')}
                </div>
              </div>
            </div>
          )}
        </div>
        <AnimatePresence>
          {hasSelection && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={handleNext}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-black text-[12px] font-semibold hover:bg-neutral-100 active:scale-[0.97] transition-all shrink-0"
            >
              Next <ArrowRight size={12} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          <p className="text-[12px] text-neutral-600">{loadingMessage}</p>
        </div>
      )}

      {/* Select all / deselect all */}
      {!isLoading && lyrics.length > 0 && (
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] text-neutral-600 tabular-nums">
            {selectedLyricIndices.size} of {lyrics.length} selected
          </span>
          <button
            onClick={allSelected ? deselectAllLyrics : selectAllLyrics}
            className="text-[11px] font-medium text-neutral-500 hover:text-white transition-colors"
          >
            {allSelected ? 'Clear' : 'All'}
          </button>
        </div>
      )}

      {/* Lyrics lines */}
      {!isLoading && lyrics.length > 0 && (
        <div className="flex flex-col gap-0.5">
          {lyrics.map((line, index) => {
            const isSelected = selectedLyricIndices.has(index);
            return (
              <motion.button
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(index * 0.012, 0.4), duration: 0.15 }}
                onClick={() => toggleLyricIndex(index)}
                className={`
                  w-full flex items-center gap-2.5 text-left px-3 py-2 rounded-lg text-[13px] transition-all duration-100 cursor-pointer
                  ${isSelected
                    ? 'bg-white text-black font-medium'
                    : 'text-neutral-500 hover:bg-white/[0.03] hover:text-neutral-300'
                  }
                `}
              >
                <div className={`
                  w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 transition-all duration-100
                  ${isSelected ? 'bg-black' : 'border border-white/[0.08]'}
                `}>
                  {isSelected && <Check size={9} className="text-white" strokeWidth={3} />}
                </div>
                <span className="leading-snug">{line.text}</span>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* No lyrics */}
      {!isLoading && song && lyrics.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <FileText size={24} className="text-neutral-700" />
          <div>
            <p className="text-[13px] text-neutral-400">No lyrics found for this track</p>
            <p className="text-[11px] text-neutral-600 mt-1">You can type your own text in the editor</p>
          </div>
          <button
            onClick={handleNext}
            className="mt-2 px-5 py-2 rounded-xl bg-white text-black text-[12px] font-semibold hover:bg-neutral-100 active:scale-[0.97] transition-all"
          >
            Continue anyway
          </button>
        </div>
      )}

      {/* FAB */}
      <AnimatePresence>
        {hasSelection && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleNext}
            className="fixed bottom-6 right-6 w-12 h-12 rounded-2xl bg-white text-black shadow-2xl shadow-black/60 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-50"
            aria-label="Continue to image"
          >
            <ArrowRight size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
