import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const FALLBACK_COVER =
  'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png';

export default function SongResultsScreen() {
  const { songs, selectSong, setStep, deselectAllLyrics } = useAppStore();

  const handleSelectSong = (index: number) => {
    selectSong(index);
    deselectAllLyrics();
    setStep(3);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
      className="max-w-2xl mx-auto px-5 pb-10"
    >
      {/* Header */}
      <div className="flex items-center gap-3 py-5">
        <button
          onClick={() => setStep(1)}
          className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={16} className="text-neutral-500" />
        </button>
        <span className="text-[13px] font-medium text-neutral-400">
          {songs.length} results — pick one
        </span>
      </div>

      {/* Song grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {songs.map((song, index) => (
          <motion.button
            key={`${song.name}-${index}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.04, duration: 0.25 }}
            onClick={() => handleSelectSong(index)}
            className="group text-left rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.05] active:scale-[0.97] transition-all duration-200 cursor-pointer"
          >
            <div className="aspect-square overflow-hidden bg-white/[0.03]">
              <img
                src={song.albumCoverUrl || FALLBACK_COVER}
                alt={`${song.name} cover`}
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                loading="lazy"
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
      </div>
    </motion.div>
  );
}
