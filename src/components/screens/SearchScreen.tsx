import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Link2, ArrowRight, ExternalLink } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useSearch } from '@/hooks/useSearch';

type Tab = 'search' | 'link';

export default function SearchScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('search');
  const [query, setQuery] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const { isLoading, error, loadingMessage } = useAppStore();
  const { searchByName, searchBySpotifyLink } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) searchByName(query);
  };

  const handleSpotifyLoad = (e: React.FormEvent) => {
    e.preventDefault();
    if (spotifyUrl.trim()) searchBySpotifyLink(spotifyUrl);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-5"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.35 }}
        className="mb-10 text-center"
      >
        <h2 className="text-[2rem] sm:text-[2.5rem] font-bold text-white tracking-tight leading-tight">
          Turn lyrics into art
        </h2>
        <p className="text-[13px] text-neutral-500 mt-2.5 max-w-xs mx-auto leading-relaxed">
          Find any song, pick lines you love, and export a ready-to-share image.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-4 mb-5">
        <button
          onClick={() => setActiveTab('search')}
          className={`text-[12px] font-medium pb-1 border-b transition-all duration-200
            ${activeTab === 'search'
              ? 'text-white border-white'
              : 'text-neutral-600 border-transparent hover:text-neutral-400'
            }`}
        >
          Search
        </button>
        <button
          onClick={() => setActiveTab('link')}
          className={`text-[12px] font-medium pb-1 border-b transition-all duration-200 flex items-center gap-1
            ${activeTab === 'link'
              ? 'text-white border-white'
              : 'text-neutral-600 border-transparent hover:text-neutral-400'
            }`}
        >
          <ExternalLink size={11} />
          Paste link
        </button>
      </div>

      {/* Forms */}
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {activeTab === 'search' && (
            <motion.form
              key="search-form"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              onSubmit={handleSearch}
              className="flex flex-col gap-3"
            >
              <div className="relative group">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-neutral-400 transition-colors" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Artist, song name..."
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.06] text-white placeholder-neutral-600 text-[13px] outline-none focus:border-white/15 focus:bg-white/[0.07] transition-all disabled:opacity-40"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="w-full py-3 rounded-xl bg-white text-black text-[13px] font-semibold hover:bg-neutral-100 active:scale-[0.98] transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>Search <ArrowRight size={14} /></>
                )}
              </button>
            </motion.form>
          )}

          {activeTab === 'link' && (
            <motion.form
              key="link-form"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              onSubmit={handleSpotifyLoad}
              className="flex flex-col gap-3"
            >
              <div className="relative group">
                <Link2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-neutral-400 transition-colors" />
                <input
                  ref={inputRef}
                  type="text"
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  placeholder="https://open.spotify.com/track/..."
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.06] text-white placeholder-neutral-600 text-[13px] outline-none focus:border-white/15 focus:bg-white/[0.07] transition-all disabled:opacity-40"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !spotifyUrl.trim()}
                className="w-full py-3 rounded-xl bg-white text-black text-[13px] font-semibold hover:bg-neutral-100 active:scale-[0.98] transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>Load <ArrowRight size={14} /></>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-[12px] text-red-400/80 text-center max-w-sm"
        >
          {error}
        </motion.p>
      )}

      {/* Loading message */}
      {isLoading && loadingMessage && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-[11px] text-neutral-600 text-center"
        >
          {loadingMessage}
        </motion.p>
      )}
    </motion.div>
  );
}
