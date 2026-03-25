import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  Copy,
  Palette,
  Type,
  Languages,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useImageExport } from '@/hooks/useImageExport';
import SongImagePreview from '@/components/song-image/SongImagePreview';
import type { AspectRatio } from '@/types';

const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
  { value: 'free', label: 'Free' },
  { value: '1:1', label: '1:1' },
  { value: '4:5', label: '4:5' },
  { value: '9:16', label: '9:16' },
];

const FONT_FAMILIES = ['Poppins', 'Inter', 'Playfair Display'];

const LANG_OPTIONS = [
  { value: 'en', label: 'Auto' },
  { value: 'zh-TW', label: 'TW' },
  { value: 'zh-CN', label: 'CN' },
  { value: 'zh-HK', label: 'HK' },
  { value: 'ja', label: 'JP' },
  { value: 'ko', label: 'KR' },
];

export default function ImageScreen() {
  const imageRef = useRef<HTMLDivElement>(null);
  const {
    songs,
    selectedSongIndex,
    imageSettings,
    updateImageSettings,
    presetColors,
    setStep,
    isLoading,
    loadingMessage,
  } = useAppStore();
  const { downloadImage, copyToClipboard } = useImageExport();

  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const song = selectedSongIndex !== null ? songs[selectedSongIndex] : null;

  // Auto-scale preview to fit container
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth - 32;
      const imgWidth = imageSettings.width;
      if (imgWidth > containerWidth && containerWidth > 0) {
        setScale(containerWidth / imgWidth);
      } else {
        setScale(1);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [imageSettings.width]);

  const handleBack = () => {
    if (song?.lyrics && song.lyrics.length > 0) {
      setStep(3);
    } else {
      setStep(2);
    }
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
      <div className="flex items-center justify-between py-5">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={16} className="text-neutral-500" />
          </button>
          <span className="text-[13px] font-medium text-neutral-400">Customize & export</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => copyToClipboard(imageRef.current)}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors disabled:opacity-30"
            aria-label="Copy to clipboard"
            title="Copy to clipboard"
          >
            <Copy size={14} className="text-neutral-500" />
          </button>
          <button
            onClick={() => downloadImage(imageRef.current)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-black text-[12px] font-semibold hover:bg-neutral-100 active:scale-[0.97] transition-all disabled:opacity-30"
          >
            <Download size={13} />
            Save
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center gap-2 justify-center py-4 text-[12px] text-neutral-600">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          {loadingMessage}
        </div>
      )}

      {/* Image preview */}
      <div
        ref={containerRef}
        className="flex justify-center py-6 rounded-2xl bg-white/[0.02] border border-white/[0.03] mb-5"
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            marginBottom: `${(scale - 1) * (imageRef.current?.offsetHeight ?? 0)}px`,
          }}
        >
          <SongImagePreview ref={imageRef} />
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-2">
        {/* Color selection */}
        <ControlSection icon={Palette} label="Color">
          <div className="flex flex-wrap gap-1.5">
            {presetColors.map((color) => (
              <button
                key={color}
                onClick={() =>
                  updateImageSettings({
                    backgroundColor: color,
                    useGradient: false,
                  })
                }
                className={`w-7 h-7 rounded-lg transition-all duration-150 hover:scale-110 ${
                  !imageSettings.useGradient && imageSettings.backgroundColor === color
                    ? 'ring-2 ring-offset-1 ring-white/40 ring-offset-[#0a0a0a] scale-110'
                    : ''
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Color ${color}`}
              />
            ))}
            <label
              className="w-7 h-7 rounded-lg border border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform hover:border-white/20"
              title="Custom color"
            >
              <Palette size={11} className="text-neutral-500" />
              <input
                type="color"
                value={imageSettings.backgroundColor}
                onChange={(e) =>
                  updateImageSettings({
                    backgroundColor: e.target.value,
                    useGradient: false,
                  })
                }
                className="sr-only"
              />
            </label>
          </div>
        </ControlSection>

        {/* Gradient */}
        <ControlSection icon={Palette} label="Gradient">
          <div className="flex items-center gap-3">
            <ToggleSwitch
              checked={imageSettings.useGradient}
              onChange={(v) =>
                updateImageSettings({
                  useGradient: v,
                  gradient: v && !imageSettings.gradient
                    ? { from: imageSettings.backgroundColor, to: '#3a3a3a', angle: 135 }
                    : imageSettings.gradient,
                })
              }
            />
            {imageSettings.useGradient && (
              <div className="flex items-center gap-2 flex-1">
                <label className="relative">
                  <div
                    className="w-6 h-6 rounded-md cursor-pointer border border-white/10"
                    style={{ backgroundColor: imageSettings.gradient?.from }}
                  />
                  <input
                    type="color"
                    value={imageSettings.gradient?.from ?? '#1a1a1a'}
                    onChange={(e) =>
                      updateImageSettings({
                        gradient: {
                          ...(imageSettings.gradient ?? { from: '#1a1a1a', to: '#3a3a3a', angle: 135 }),
                          from: e.target.value,
                        },
                      })
                    }
                    className="sr-only"
                  />
                </label>
                <label className="relative">
                  <div
                    className="w-6 h-6 rounded-md cursor-pointer border border-white/10"
                    style={{ backgroundColor: imageSettings.gradient?.to }}
                  />
                  <input
                    type="color"
                    value={imageSettings.gradient?.to ?? '#3a3a3a'}
                    onChange={(e) =>
                      updateImageSettings({
                        gradient: {
                          ...(imageSettings.gradient ?? { from: '#1a1a1a', to: '#3a3a3a', angle: 135 }),
                          to: e.target.value,
                        },
                      })
                    }
                    className="sr-only"
                  />
                </label>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={imageSettings.gradient?.angle ?? 135}
                  onChange={(e) =>
                    updateImageSettings({
                      gradient: {
                        ...(imageSettings.gradient ?? { from: '#1a1a1a', to: '#3a3a3a', angle: 135 }),
                        angle: Number(e.target.value),
                      },
                    })
                  }
                  className="flex-1 h-1 rounded-full appearance-none bg-white/[0.06]"
                />
                <span className="text-[10px] text-neutral-600 w-7 text-right font-mono">
                  {imageSettings.gradient?.angle ?? 135}°
                </span>
              </div>
            )}
          </div>
        </ControlSection>

        {/* Toggles row */}
        <div className="grid grid-cols-3 gap-2">
          <ControlSection label="Light text" compact>
            <ToggleSwitch
              checked={imageSettings.lightText}
              onChange={(v) => updateImageSettings({ lightText: v })}
            />
          </ControlSection>
          <ControlSection label="Spotify" compact>
            <ToggleSwitch
              checked={imageSettings.showSpotifyTag}
              onChange={(v) => updateImageSettings({ showSpotifyTag: v })}
            />
          </ControlSection>
          <ControlSection label="Shadow" compact>
            <ToggleSwitch
              checked={imageSettings.showBackground}
              onChange={(v) => updateImageSettings({ showBackground: v })}
            />
          </ControlSection>
        </div>

        {/* Width + Font size sliders */}
        <div className="grid grid-cols-2 gap-2">
          <ControlSection label={`Width ${imageSettings.width}`}>
            <input
              type="range"
              min={200}
              max={600}
              step={10}
              value={imageSettings.width}
              onChange={(e) => updateImageSettings({ width: Number(e.target.value) })}
              className="w-full h-1 rounded-full appearance-none bg-white/[0.06]"
            />
          </ControlSection>
          <ControlSection label={`Size ${imageSettings.fontSize}`}>
            <input
              type="range"
              min={12}
              max={32}
              step={1}
              value={imageSettings.fontSize}
              onChange={(e) => updateImageSettings({ fontSize: Number(e.target.value) })}
              className="w-full h-1 rounded-full appearance-none bg-white/[0.06]"
            />
          </ControlSection>
        </div>

        {/* Font family */}
        <ControlSection icon={Type} label="Font">
          <div className="flex gap-1.5">
            {FONT_FAMILIES.map((ff) => (
              <button
                key={ff}
                onClick={() => updateImageSettings({ fontFamily: ff })}
                className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                  imageSettings.fontFamily === ff
                    ? 'bg-white text-black'
                    : 'bg-white/[0.04] text-neutral-500 hover:bg-white/[0.08] hover:text-neutral-300'
                }`}
                style={{ fontFamily: ff }}
              >
                {ff}
              </button>
            ))}
          </div>
        </ControlSection>

        {/* Aspect ratio */}
        <ControlSection label="Ratio">
          <div className="flex gap-1.5">
            {ASPECT_RATIOS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => updateImageSettings({ aspectRatio: value })}
                className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                  imageSettings.aspectRatio === value
                    ? 'bg-white text-black'
                    : 'bg-white/[0.04] text-neutral-500 hover:bg-white/[0.08] hover:text-neutral-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </ControlSection>

        {/* Language */}
        <ControlSection icon={Languages} label="Glyphs">
          <div className="flex gap-1.5">
            {LANG_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  updateImageSettings({ lang: opt.value });
                  document.documentElement.lang = opt.value;
                }}
                className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                  imageSettings.lang === opt.value
                    ? 'bg-white text-black'
                    : 'bg-white/[0.04] text-neutral-500 hover:bg-white/[0.08] hover:text-neutral-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </ControlSection>
      </div>
    </motion.div>
  );
}

/* ───── Reusable sub-components ───── */

function ControlSection({
  icon: Icon,
  label,
  compact,
  children,
}: {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl bg-white/[0.03] border border-white/[0.05] ${
        compact ? 'p-2.5' : 'p-3'
      }`}
    >
      <div
        className={`flex items-center ${compact ? 'justify-between' : 'gap-1.5 mb-2.5'}`}
      >
        <div className="flex items-center gap-1.5">
          {Icon && <Icon size={12} className="text-neutral-600" />}
          <span className="text-[11px] font-medium text-neutral-500">
            {label}
          </span>
        </div>
        {compact && children}
      </div>
      {!compact && children}
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
        checked ? 'bg-white' : 'bg-white/[0.08]'
      }`}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full shadow-sm transition-all duration-200 ${
          checked ? 'translate-x-4 bg-black' : 'translate-x-0 bg-neutral-500'
        }`}
      />
    </button>
  );
}
