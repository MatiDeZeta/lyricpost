import { useEffect, useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  ClipboardCopy,
  Pencil,
  Plus,
  GripVertical,
  X,
  Music2,
  Play,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useLyrics } from '@/hooks/useLyrics';
import Skeleton from '@/components/ui/Skeleton';
import CoverArt from '@/components/ui/CoverArt';
import KaraokePreview from '@/components/karaoke/KaraokePreview';

export default function LyricsScreen() {
  const songs = useAppStore((s) => s.songs);
  const selectedSongIndex = useAppStore((s) => s.selectedSongIndex);
  const selectedLyricIndices = useAppStore((s) => s.selectedLyricIndices);
  const lyricOrder = useAppStore((s) => s.lyricOrder);
  const setLyricOrder = useAppStore((s) => s.setLyricOrder);
  const toggleLyricIndex = useAppStore((s) => s.toggleLyricIndex);
  const selectAllLyrics = useAppStore((s) => s.selectAllLyrics);
  const deselectAllLyrics = useAppStore((s) => s.deselectAllLyrics);
  const setStep = useAppStore((s) => s.setStep);
  const usedDirectLink = useAppStore((s) => s.usedDirectLink);
  const randomizeColor = useAppStore((s) => s.randomizeColor);
  const isLoading = useAppStore((s) => s.isLoading);
  const loadingMessage = useAppStore((s) => s.loadingMessage);
  const updateLyricText = useAppStore((s) => s.updateLyricText);
  const addCustomLyricLine = useAppStore((s) => s.addCustomLyricLine);
  const pushToast = useAppStore((s) => s.pushToast);

  const { loadLyrics } = useLyrics();

  const song = selectedSongIndex !== null ? songs[selectedSongIndex] : null;
  const lyrics = song?.lyrics ?? [];
  const hasSelection = selectedLyricIndices.size > 0;
  const allSelected = lyrics.length > 0 && selectedLyricIndices.size === lyrics.length;

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [addingCustom, setAddingCustom] = useState(false);
  const [customText, setCustomText] = useState('');
  const [karaokeOpen, setKaraokeOpen] = useState(false);

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

  const commitEdit = () => {
    if (editingIndex !== null) {
      updateLyricText(editingIndex, editingText);
    }
    setEditingIndex(null);
    setEditingText('');
  };

  const startEdit = (index: number, text: string) => {
    setEditingIndex(index);
    setEditingText(text);
  };

  const commitCustom = () => {
    const t = customText.trim();
    if (t) {
      addCustomLyricLine(t);
      pushToast('success', 'Custom line added');
    }
    setCustomText('');
    setAddingCustom(false);
  };

  const orderedSelected = lyricOrder.length > 0
    ? lyricOrder.filter((i) => selectedLyricIndices.has(i))
    : lyrics.map((_, i) => i).filter((i) => selectedLyricIndices.has(i));

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
      className="max-w-2xl mx-auto px-5 pb-24"
    >
      <div className="flex items-center justify-between py-5">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleBack}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft size={16} className="text-neutral-500" />
          </button>
          {song && selectedSongIndex !== null && (
            <div className="flex items-center gap-2.5 min-w-0">
              <CoverArt
                song={song}
                songIndex={selectedSongIndex}
                size="sm"
                showUpload
              />
              <div className="min-w-0">
                <div className="text-[12px] font-semibold text-white truncate leading-tight">
                  {song.name}
                </div>
                <div className="text-[11px] text-neutral-600 truncate flex items-center gap-1">
                  {song.artists.map((a) => a.name).join(', ')}
                  {song.hasSyncedLyrics && (
                    <button
                      onClick={() => setKaraokeOpen(true)}
                      title="Open karaoke preview"
                      className="inline-flex items-center gap-0.5 px-1 py-px rounded-sm bg-white/[0.06] text-neutral-300 hover:bg-white/[0.12] hover:text-white text-[9px] font-semibold uppercase tracking-wider transition-colors"
                    >
                      <Music2 size={7} />
                      Synced
                      <Play size={7} className="ml-0.5" />
                    </button>
                  )}
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

      {isLoading && (
        <div className="flex flex-col gap-1.5 py-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-9 w-full"
              rounded="rounded-lg"
            />
          ))}
          <p className="text-[11px] text-neutral-700 text-center mt-3">
            {loadingMessage}
          </p>
        </div>
      )}

      {!isLoading && lyrics.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] text-neutral-600 tabular-nums">
              {selectedLyricIndices.size} of {lyrics.length} selected
            </span>
            <div className="flex items-center gap-2">
              {hasSelection && (
                <button
                  onClick={() => {
                    const text = orderedSelected
                      .map((i) => lyrics[i]?.text)
                      .filter(Boolean)
                      .join('\n');
                    navigator.clipboard.writeText(text);
                    pushToast('success', 'Lyrics copied');
                  }}
                  className="text-[11px] font-medium text-neutral-600 hover:text-neutral-300 transition-colors flex items-center gap-1"
                  title="Copy selected lyrics"
                >
                  <ClipboardCopy size={10} />
                  Copy
                </button>
              )}
              <button
                onClick={allSelected ? deselectAllLyrics : selectAllLyrics}
                className="text-[11px] font-medium text-neutral-500 hover:text-white transition-colors"
              >
                {allSelected ? 'Clear' : 'All'}
              </button>
            </div>
          </div>

          {/* Selected lyrics — drag to reorder */}
          {hasSelection && (
            <div className="mb-4 rounded-xl border border-white/[0.05] bg-white/[0.02] p-2">
              <div className="text-[10px] uppercase tracking-wider text-neutral-700 font-semibold px-1.5 pb-1.5 flex items-center justify-between">
                <span>Order ({orderedSelected.length})</span>
                <span className="text-neutral-800 normal-case tracking-normal text-[10px] font-normal">
                  Drag to reorder
                </span>
              </div>
              <Reorder.Group
                axis="y"
                values={orderedSelected}
                onReorder={setLyricOrder}
                className="flex flex-col gap-0.5"
              >
                {orderedSelected.map((index, position) => {
                  const line = lyrics[index];
                  if (!line) return null;
                  return (
                    <Reorder.Item
                      key={index}
                      value={index}
                      className="lyric-reorder-item flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] text-[12px] text-neutral-200 select-none"
                    >
                      <GripVertical size={11} className="text-neutral-600 shrink-0" />
                      <span className="text-[10px] text-neutral-700 font-mono w-4 shrink-0 tabular-nums">
                        {position + 1}
                      </span>
                      <span className="flex-1 truncate">{line.text}</span>
                      <button
                        onClick={() => toggleLyricIndex(index)}
                        className="p-0.5 rounded hover:bg-white/[0.06] text-neutral-600 hover:text-neutral-200 transition-colors"
                        aria-label="Remove from selection"
                      >
                        <X size={10} />
                      </button>
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>
            </div>
          )}

          {/* Full lyrics list */}
          <div className="flex flex-col gap-0.5">
            {lyrics.map((line, index) => {
              const isSelected = selectedLyricIndices.has(index);
              const isEditing = editingIndex === index;

              if (isEditing) {
                return (
                  <div
                    key={index}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.06]"
                  >
                    <input
                      autoFocus
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitEdit();
                        if (e.key === 'Escape') {
                          setEditingIndex(null);
                          setEditingText('');
                        }
                      }}
                      className="flex-1 bg-transparent text-[13px] text-white outline-none"
                    />
                    <button
                      onClick={commitEdit}
                      className="text-[11px] font-semibold text-white hover:text-neutral-300 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingIndex(null);
                        setEditingText('');
                      }}
                      className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                );
              }

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(index * 0.012, 0.4), duration: 0.15 }}
                  className={`group/row w-full flex items-center gap-1 rounded-lg transition-all duration-100 ${
                    isSelected
                      ? 'bg-white text-black'
                      : 'text-neutral-500 hover:bg-white/[0.03]'
                  }`}
                >
                  <button
                    onClick={() => toggleLyricIndex(index)}
                    className="flex-1 flex items-center gap-2.5 text-left px-3 py-2 text-[13px] cursor-pointer"
                  >
                    <div className={`
                      w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 transition-all duration-100
                      ${isSelected ? 'bg-black' : 'border border-white/[0.08]'}
                    `}>
                      {isSelected && <Check size={9} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className={`leading-snug ${isSelected ? 'font-medium' : ''}`}>
                      {line.text}
                    </span>
                  </button>
                  <button
                    onClick={() => startEdit(index, line.text)}
                    className={`p-1.5 mr-1 rounded opacity-0 group-hover/row:opacity-100 transition-opacity ${
                      isSelected
                        ? 'text-black/60 hover:text-black hover:bg-black/[0.06]'
                        : 'text-neutral-600 hover:text-white hover:bg-white/[0.06]'
                    }`}
                    aria-label="Edit line"
                    title="Edit line"
                  >
                    <Pencil size={10} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {!isLoading && song && lyrics.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <FileText size={24} className="text-neutral-700" />
          <div>
            <p className="text-[13px] text-neutral-400">No lyrics found for this track</p>
            <p className="text-[11px] text-neutral-600 mt-1">You can type your own lines below</p>
          </div>
          <button
            onClick={handleNext}
            className="mt-2 px-5 py-2 rounded-xl bg-white text-black text-[12px] font-semibold hover:bg-neutral-100 active:scale-[0.97] transition-all"
          >
            Continue anyway
          </button>
        </div>
      )}

      {/* Add custom line */}
      {!isLoading && song && (
        <div className="mt-3">
          {addingCustom ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.05]">
              <Plus size={12} className="text-neutral-500" />
              <input
                autoFocus
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitCustom();
                  if (e.key === 'Escape') {
                    setCustomText('');
                    setAddingCustom(false);
                  }
                }}
                placeholder="Type a custom line..."
                className="flex-1 bg-transparent text-[13px] text-white placeholder-neutral-600 outline-none"
              />
              <button
                onClick={commitCustom}
                className="text-[11px] font-semibold text-white hover:text-neutral-300 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setCustomText('');
                  setAddingCustom(false);
                }}
                className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingCustom(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium text-neutral-600 hover:text-neutral-300 hover:bg-white/[0.03] transition-all border border-dashed border-white/[0.06]"
            >
              <Plus size={11} />
              Add custom line
            </button>
          )}
        </div>
      )}

      <AnimatePresence>
        {hasSelection && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleNext}
            className="fixed bottom-6 right-6 w-12 h-12 rounded-2xl bg-white text-black shadow-2xl shadow-black/60 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-40"
            aria-label="Continue to image"
          >
            <ArrowRight size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      <KaraokePreview open={karaokeOpen} onClose={() => setKaraokeOpen(false)} />
    </motion.div>
  );
}
