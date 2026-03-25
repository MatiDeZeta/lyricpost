import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
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
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
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
          <h2 className="text-sm font-semibold text-white">Select lines</h2>
        </div>
        {hasSelection && (
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-[12px] font-semibold hover:bg-neutral-200 active:scale-[0.97] transition-all"
          >
            Continue <ArrowRight size={12} />
          </button>
        )}
      </div>

      {/* Song info banner */}
      {song && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] mb-5"
        >
          <img
            src={song.albumCoverUrl || FALLBACK_COVER}
            alt="Album cover"
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-white truncate">
              {song.name}
            </div>
            <div className="text-[11px] text-neutral-500 truncate">
              {song.artists.map((a) => a.name).join(', ')}
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center gap-2 justify-center py-12 text-[12px] text-neutral-500">
          <div className="w-3.5 h-3.5 border-[1.5px] border-white/30 border-t-transparent rounded-full animate-spin" />
          {loadingMessage}
        </div>
      )}

      {/* Select all / deselect all */}
      {!isLoading && lyrics.length > 0 && (
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] text-neutral-600">
            {selectedLyricIndices.size} / {lyrics.length}
          </span>
          <button
            onClick={allSelected ? deselectAllLyrics : selectAllLyrics}
            className="text-[11px] font-medium text-neutral-500 hover:text-white transition-colors"
          >
            {allSelected ? 'Deselect all' : 'Select all'}
          </button>
        </div>
      )}

      {/* Lyrics lines */}
      {!isLoading && lyrics.length > 0 && (
        <div className="flex flex-col gap-1">
          {lyrics.map((line, index) => {
            const isSelected = selectedLyricIndices.has(index);
            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.015, 0.5), duration: 0.2 }}
                onClick={() => toggleLyricIndex(index)}
                className={`
                  group w-full flex items-center gap-3 text-left px-3.5 py-2.5 rounded-lg text-[13px] transition-all duration-150 cursor-pointer
                  ${isSelected
                    ? 'bg-white text-black font-semibold'
                    : 'text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200'
                  }
                `}
              >
                <div className={`
                  w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all duration-150
                  ${isSelected ? 'bg-black' : 'border border-white/10'}
                `}>
                  {isSelected && <Check size={10} className="text-white" />}
                </div>
                <span>{line.text}</span>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* No lyrics */}
      {!isLoading && lyrics.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[13px] text-neutral-500">No lyrics found</p>
          <p className="text-[11px] text-neutral-600 mt-1">You can type your own in the next step</p>
          <button
            onClick={handleNext}
            className="mt-4 px-4 py-2 rounded-lg bg-white text-black text-[12px] font-semibold hover:bg-neutral-200 active:scale-[0.97] transition-all"
          >
            Continue anyway
          </button>
        </div>
      )}

      {/* FAB */}
      {hasSelection && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          onClick={handleNext}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-white text-black shadow-2xl shadow-black/50 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-50"
          aria-label="Continue to image"
        >
          <ArrowRight size={18} />
        </motion.button>
      )}
    </motion.div>
  );
}
