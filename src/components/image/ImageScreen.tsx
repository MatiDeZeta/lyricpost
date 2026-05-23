import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Type, Layers, RotateCcw } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { canShareFiles } from '@/hooks/useImageExport';
import { getDisplayCoverUrl } from '@/services/coverArt';
import { extractPalette } from '@/utils/extractPalette';
import { readFileAsDataUrl } from '@/utils/storage';
import { TabBtn, type ImageTab } from './shared/TabBtn';
import ImageExportBar from './ImageExportBar';
import ImagePreviewPane from './ImagePreviewPane';
import ImageTemplatesRow from './ImageTemplatesRow';
import BackgroundTab from './tabs/BackgroundTab';
import TextTab from './tabs/TextTab';
import LayoutTab from './tabs/LayoutTab';

export default function ImageScreen() {
  const imageRef = useRef<HTMLDivElement>(null);

  const songs = useAppStore((s) => s.songs);
  const selectedSongIndex = useAppStore((s) => s.selectedSongIndex);
  const updateImageSettings = useAppStore((s) => s.updateImageSettings);
  const setStep = useAppStore((s) => s.setStep);
  const isLoading = useAppStore((s) => s.isLoading);
  const loadingMessage = useAppStore((s) => s.loadingMessage);
  const resetImageSettings = useAppStore((s) => s.resetImageSettings);
  const pushToast = useAppStore((s) => s.pushToast);

  const [activeTab, setActiveTab] = useState<ImageTab>('background');
  const [coverPalette, setCoverPalette] = useState<string[]>([]);
  const [shareAvailable, setShareAvailable] = useState(false);

  const song = selectedSongIndex !== null ? songs[selectedSongIndex] : null;

  useEffect(() => {
    setShareAvailable(canShareFiles());
  }, []);

  useEffect(() => {
    let cancelled = false;
    const coverUrl = song ? getDisplayCoverUrl(song) : null;
    if (coverUrl) {
      extractPalette(coverUrl, 5).then((colors) => {
        if (!cancelled) setCoverPalette(colors);
      });
    } else {
      setCoverPalette([]);
    }
    return () => {
      cancelled = true;
    };
  }, [song?.customCoverUrl, song?.coverResolvedUrl, song?.albumCoverUrl]);

  const handleBack = () => {
    if (song?.lyrics && song.lyrics.length > 0) {
      setStep(3);
    } else {
      setStep(2);
    }
  };

  const handleUploadBackground = useCallback(
    async (file: File) => {
      try {
        const dataUrl = await readFileAsDataUrl(file);
        updateImageSettings({
          backgroundImage: { dataUrl, opacity: 0.55, blur: 0 },
        });
        pushToast('success', 'Background image set');
      } catch {
        pushToast('error', "Couldn't read that image");
      }
    },
    [updateImageSettings, pushToast]
  );

  const onPickBackgroundFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void handleUploadBackground(f);
    e.target.value = '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
      className="max-w-2xl mx-auto px-5 pb-10"
    >
      <ImageExportBar
        imageRef={imageRef}
        onBack={handleBack}
        shareAvailable={shareAvailable}
      />

      {isLoading && (
        <div className="flex items-center gap-2 justify-center py-4 text-[12px] text-neutral-600">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          {loadingMessage}
        </div>
      )}

      <ImagePreviewPane imageRef={imageRef} />
      <ImageTemplatesRow />

      <div className="sticky top-12 z-10 flex items-center gap-1 mb-3 p-1 rounded-xl bg-[#0a0a0a]/90 backdrop-blur border border-white/[0.05]">
        <TabBtn id="background" active={activeTab} setActive={setActiveTab} icon={Palette} label="Background" />
        <TabBtn id="text" active={activeTab} setActive={setActiveTab} icon={Type} label="Text" />
        <TabBtn id="layout" active={activeTab} setActive={setActiveTab} icon={Layers} label="Layout" />
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'background' && (
          <motion.div
            key="background"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <BackgroundTab
              song={song}
              selectedSongIndex={selectedSongIndex}
              coverPalette={coverPalette}
              onPickBackgroundFile={onPickBackgroundFile}
            />
          </motion.div>
        )}
        {activeTab === 'text' && (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <TextTab />
          </motion.div>
        )}
        {activeTab === 'layout' && (
          <motion.div
            key="layout"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <LayoutTab />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => {
          resetImageSettings();
          pushToast('info', 'Settings reset');
        }}
        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-medium text-neutral-600 hover:text-neutral-400 hover:bg-white/[0.03] transition-all"
      >
        <RotateCcw size={11} />
        Reset all settings
      </button>
    </motion.div>
  );
}
