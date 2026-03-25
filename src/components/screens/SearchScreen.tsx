import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Link, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useSearch } from '@/hooks/useSearch';

type Tab = 'search' | 'link';

export default function SearchScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('search');
  const [query, setQuery] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const { isLoading, error, loadingMessage } = useAppStore();
  const { searchByName, searchBySpotifyLink } = useSearch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchByName(query);
  };

  const handleSpotifyLoad = (e: React.FormEvent) => {
    e.preventDefault();
    searchBySpotifyLink(spotifyUrl);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-[65vh] px-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        className="mb-8 text-center"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Create something
          <br />
          <span className="text-neutral-500">beautiful.</span>
        </h2>
        <p className="text-[13px] text-neutral-500 mt-3">
          Search for a song or paste a Spotify link to get started.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex bg-white/[0.04] rounded-lg p-0.5 mb-5 w-full max-w-sm">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-[12px] font-medium transition-all duration-200
            ${activeTab === 'search'
              ? 'bg-white/[0.08] text-white'
              : 'text-neutral-500 hover:text-neutral-300'
            }`}
        >
          <Search size={13} />
          Search
        </button>
        <button
          onClick={() => setActiveTab('link')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-[12px] font-medium transition-all duration-200
            ${activeTab === 'link'
              ? 'bg-white/[0.08] text-white'
              : 'text-neutral-500 hover:text-neutral-300'
            }`}
        >
          <Link size={13} />
          Spotify Link
        </button>
      </div>

      {/* Search form */}
      {activeTab === 'search' && (
        <motion.form
          key="search-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          onSubmit={handleSearch}
          className="w-full max-w-sm flex flex-col gap-2.5"
        >
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Song name, artist..."
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white placeholder-neutral-600 text-sm outline-none focus:border-white/20 transition-all disabled:opacity-40"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="w-full py-3 rounded-lg bg-white text-black text-sm font-semibold hover:bg-neutral-200 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? 'Searching...' : (
              <>Search <ArrowRight size={14} /></>
            )}
          </button>
        </motion.form>
      )}

      {/* Spotify link form */}
      {activeTab === 'link' && (
        <motion.form
          key="link-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          onSubmit={handleSpotifyLoad}
          className="w-full max-w-sm flex flex-col gap-2.5"
        >
          <div className="relative">
            <Link size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600" />
            <input
              type="text"
              value={spotifyUrl}
              onChange={(e) => setSpotifyUrl(e.target.value)}
              placeholder="https://open.spotify.com/track/..."
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white placeholder-neutral-600 text-sm outline-none focus:border-white/20 transition-all disabled:opacity-40"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !spotifyUrl.trim()}
            className="w-full py-3 rounded-lg bg-white text-black text-sm font-semibold hover:bg-neutral-200 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? 'Loading...' : (
              <>Load song <ArrowRight size={14} /></>
            )}
          </button>
        </motion.form>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 px-4 py-2.5 rounded-lg bg-red-500/8 border border-red-500/15 text-red-400 text-[12px] text-center max-w-sm w-full"
        >
          {error}
        </motion.div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 flex items-center gap-2 text-[12px] text-neutral-500"
        >
          <div className="w-3.5 h-3.5 border-[1.5px] border-white/30 border-t-transparent rounded-full animate-spin" />
          {loadingMessage}
        </motion.div>
      )}
    </motion.div>
  );
}
