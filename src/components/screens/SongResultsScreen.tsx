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
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto px-5 pb-8"
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
        <div>
          <h2 className="text-sm font-semibold text-white">
            Select a song
          </h2>
          <p className="text-[11px] text-neutral-600">{songs.length} results</p>
        </div>
      </div>

      {/* Song list */}
      <div className="flex flex-col gap-1">
        {songs.map((song, index) => (
          <motion.button
            key={`${song.name}-${index}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.25 }}
            onClick={() => handleSelectSong(index)}
            className="group flex items-center gap-3.5 text-left rounded-xl p-2.5 hover:bg-white/[0.04] active:bg-white/[0.06] transition-all duration-150 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/[0.04] shrink-0">
              <img
                src={song.albumCoverUrl || FALLBACK_COVER}
                alt={`${song.name} cover`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-white truncate">
                {song.name}
              </div>
              <div className="text-[11px] text-neutral-500 truncate mt-0.5">
                {song.artists.map((a) => a.name).join(', ')}
              </div>
            </div>
            <ArrowLeft size={14} className="text-neutral-700 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
