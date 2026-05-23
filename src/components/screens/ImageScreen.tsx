import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  Copy,
  Palette,
  Type,
  Languages,
  Shuffle,
  RotateCcw,
  Share2,
  Image as ImageIcon,
  X,
  Bookmark,
  Sparkles,
  Layers,
  AlignLeft,
  Square,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useImageExport, canShareFiles } from '@/hooks/useImageExport';
import SongImagePreview from '@/components/song-image/SongImagePreview';
import { extractPalette, isDarkColor } from '@/utils/extractPalette';
import { readFileAsDataUrl } from '@/utils/storage';
import type { AspectRatio, ExportFormat, ExportResolution } from '@/types';

const RATIO_GROUPS: {
  label: string;
  ratios: { value: AspectRatio; label: string; icon?: React.ComponentType<{ size?: number; className?: string }> }[];
}[] = [
  {
    label: 'Generic',
    ratios: [
      { value: 'free', label: 'Free' },
      { value: '1:1', label: '1:1' },
      { value: '4:5', label: '4:5' },
      { value: '9:16', label: '9:16' },
    ],
  },
  {
    label: 'Platforms',
    ratios: [
      { value: 'ig-post', label: 'IG Post', icon: Square },
      { value: 'ig-portrait', label: 'IG 4:5', icon: Square },
      { value: 'ig-story', label: 'IG Story', icon: Smartphone },
      { value: 'x-post', label: 'X', icon: Monitor },
      { value: 'tiktok', label: 'TikTok', icon: Smartphone },
    ],
  },
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

const FORMATS: { value: ExportFormat; label: string }[] = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPG' },
  { value: 'svg', label: 'SVG' },
];

const RESOLUTIONS: { value: ExportResolution; label: string }[] = [
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
  { value: 4, label: '4x' },
];

type Tab = 'background' | 'text' | 'layout';

export default function ImageScreen() {
  const imageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const songs = useAppStore((s) => s.songs);
  const selectedSongIndex = useAppStore((s) => s.selectedSongIndex);
  const imageSettings = useAppStore((s) => s.imageSettings);
  const updateImageSettings = useAppStore((s) => s.updateImageSettings);
  const presetColors = useAppStore((s) => s.presetColors);
  const setStep = useAppStore((s) => s.setStep);
  const isLoading = useAppStore((s) => s.isLoading);
  const loadingMessage = useAppStore((s) => s.loadingMessage);
  const shuffleColor = useAppStore((s) => s.shuffleColor);
  const resetImageSettings = useAppStore((s) => s.resetImageSettings);
  const templates = useAppStore((s) => s.templates);
  const applyTemplate = useAppStore((s) => s.applyTemplate);
  const addTemplate = useAppStore((s) => s.addTemplate);
  const removeTemplate = useAppStore((s) => s.removeTemplate);
  const pushToast = useAppStore((s) => s.pushToast);

  const { downloadImage, copyToClipboard, shareImage } = useImageExport();

  const [scale, setScale] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>('background');
  const [coverPalette, setCoverPalette] = useState<string[]>([]);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [shareAvailable, setShareAvailable] = useState(false);

  const song = selectedSongIndex !== null ? songs[selectedSongIndex] : null;

  useEffect(() => {
    setShareAvailable(canShareFiles());
  }, []);

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

  // Extract album palette when song changes
  useEffect(() => {
    let cancelled = false;
    if (song?.albumCoverUrl) {
      extractPalette(song.albumCoverUrl, 5).then((colors) => {
        if (!cancelled) setCoverPalette(colors);
      });
    } else {
      setCoverPalette([]);
    }
    return () => {
      cancelled = true;
    };
  }, [song?.albumCoverUrl]);

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

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleUploadBackground(f);
    e.target.value = '';
  };

  const onSaveTemplate = () => {
    if (!templateName.trim()) {
      pushToast('error', 'Give your template a name');
      return;
    }
    addTemplate(templateName, imageSettings);
    pushToast('success', `Template "${templateName}" saved`);
    setTemplateName('');
    setSavingTemplate(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
      className="max-w-2xl mx-auto px-5 pb-10"
    >
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
          {shareAvailable && (
            <button
              onClick={() => shareImage(imageRef.current)}
              disabled={isLoading}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors disabled:opacity-30"
              aria-label="Share"
              title="Share"
            >
              <Share2 size={14} className="text-neutral-500" />
            </button>
          )}
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

      {isLoading && (
        <div className="flex items-center gap-2 justify-center py-4 text-[12px] text-neutral-600">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          {loadingMessage}
        </div>
      )}

      {/* Image preview */}
      <div
        ref={containerRef}
        className="flex justify-center py-6 rounded-2xl bg-white/[0.02] border border-white/[0.03] mb-4"
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

      {/* Templates row */}
      <div className="mb-3 rounded-xl bg-white/[0.03] border border-white/[0.05] p-2.5">
        <div className="flex items-center justify-between mb-2 px-0.5">
          <div className="flex items-center gap-1.5">
            <Bookmark size={11} className="text-neutral-600" />
            <span className="text-[11px] font-medium text-neutral-500">Templates</span>
          </div>
          {savingTemplate ? null : (
            <button
              onClick={() => setSavingTemplate(true)}
              className="text-[10px] text-neutral-600 hover:text-neutral-200 transition-colors"
            >
              + Save current
            </button>
          )}
        </div>

        {savingTemplate && (
          <div className="flex items-center gap-1.5 mb-2 px-0.5">
            <input
              autoFocus
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveTemplate();
                if (e.key === 'Escape') {
                  setTemplateName('');
                  setSavingTemplate(false);
                }
              }}
              className="flex-1 bg-white/[0.06] border border-white/[0.08] rounded-md px-2 py-1 text-[11px] text-white placeholder-neutral-600 outline-none focus:border-white/20"
            />
            <button
              onClick={onSaveTemplate}
              className="px-2 py-1 rounded-md bg-white text-black text-[10px] font-semibold hover:bg-neutral-100 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => {
                setTemplateName('');
                setSavingTemplate(false);
              }}
              className="px-1.5 py-1 rounded-md text-[10px] text-neutral-500 hover:text-neutral-200"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {templates.map((t) => (
            <div
              key={t.id}
              className="group flex items-center gap-1 rounded-full bg-white/[0.04] border border-white/[0.05] hover:bg-white/[0.07] hover:border-white/[0.1] transition-all overflow-hidden"
            >
              <button
                onClick={() => {
                  applyTemplate(t);
                  pushToast('success', `Applied "${t.name}"`);
                }}
                className="text-[11px] text-neutral-300 pl-2.5 py-1 pr-1 hover:text-white transition-colors"
              >
                {t.name}
              </button>
              {!t.builtIn && (
                <button
                  onClick={() => removeTemplate(t.id)}
                  className="pr-2 py-1 text-neutral-700 hover:text-neutral-300 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label={`Delete ${t.name}`}
                >
                  <X size={9} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-3 p-1 rounded-xl bg-white/[0.03] border border-white/[0.05]">
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
            className="space-y-2"
          >
            {/* Solid color */}
            <ControlSection
              icon={Palette}
              label="Color"
              action={
                <button
                  onClick={shuffleColor}
                  className="p-1 rounded-md hover:bg-white/[0.06] transition-colors"
                  title="Random color"
                >
                  <Shuffle size={11} className="text-neutral-600" />
                </button>
              }
            >
              <div className="flex flex-wrap gap-1.5">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    onClick={() =>
                      updateImageSettings({
                        backgroundColor: color,
                        useGradient: false,
                        backgroundImage: null,
                      })
                    }
                    className={`w-7 h-7 rounded-lg transition-all duration-150 hover:scale-110 ${
                      !imageSettings.useGradient &&
                      !imageSettings.backgroundImage &&
                      imageSettings.backgroundColor === color
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
                        backgroundImage: null,
                      })
                    }
                    className="sr-only"
                  />
                </label>
              </div>
            </ControlSection>

            {/* Palette from cover */}
            {coverPalette.length > 0 && (
              <ControlSection
                icon={Sparkles}
                label="From cover"
                action={
                  <button
                    onClick={() => {
                      const dark = coverPalette
                        .map((c) => ({ c, dark: isDarkColor(c) }))
                        .find((x) => x.dark);
                      const pick = dark?.c ?? coverPalette[0];
                      updateImageSettings({
                        backgroundColor: pick,
                        useGradient: false,
                        backgroundImage: null,
                      });
                    }}
                    className="text-[10px] text-neutral-600 hover:text-neutral-200 transition-colors"
                  >
                    Auto
                  </button>
                }
              >
                <div className="flex gap-1.5">
                  {coverPalette.map((c) => (
                    <button
                      key={c}
                      onClick={() =>
                        updateImageSettings({
                          backgroundColor: c,
                          useGradient: false,
                          backgroundImage: null,
                        })
                      }
                      className={`w-7 h-7 rounded-lg transition-all duration-150 hover:scale-110 ${
                        imageSettings.backgroundColor === c &&
                        !imageSettings.useGradient &&
                        !imageSettings.backgroundImage
                          ? 'ring-2 ring-offset-1 ring-white/40 ring-offset-[#0a0a0a] scale-110'
                          : ''
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </ControlSection>
            )}

            {/* Gradient */}
            <ControlSection icon={Palette} label="Gradient">
              <div className="flex items-center gap-3">
                <ToggleSwitch
                  checked={imageSettings.useGradient}
                  onChange={(v) =>
                    updateImageSettings({
                      useGradient: v,
                      backgroundImage: v ? null : imageSettings.backgroundImage,
                      gradient:
                        v && !imageSettings.gradient
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

            {/* Background image */}
            <ControlSection
              icon={ImageIcon}
              label="Background image"
              action={
                imageSettings.backgroundImage && (
                  <button
                    onClick={() => updateImageSettings({ backgroundImage: null })}
                    className="text-[10px] text-neutral-600 hover:text-neutral-200 transition-colors"
                  >
                    Remove
                  </button>
                )
              }
            >
              {!imageSettings.backgroundImage ? (
                <label className="flex items-center justify-center gap-1.5 py-3 rounded-lg border border-dashed border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02] transition-all cursor-pointer text-[11px] text-neutral-500">
                  <ImageIcon size={11} />
                  Upload image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onPickFile}
                    className="sr-only"
                  />
                </label>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-12 h-12 rounded-lg bg-cover bg-center shrink-0 border border-white/[0.06]"
                      style={{ backgroundImage: `url(${imageSettings.backgroundImage.dataUrl})` }}
                    />
                    <label className="flex-1 text-center py-2 rounded-lg border border-dashed border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02] transition-all cursor-pointer text-[11px] text-neutral-500">
                      Replace
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onPickFile}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <SliderRow
                    label="Opacity"
                    value={Math.round(imageSettings.backgroundImage.opacity * 100)}
                    suffix="%"
                    min={10}
                    max={100}
                    step={5}
                    onChange={(v) =>
                      updateImageSettings({
                        backgroundImage: imageSettings.backgroundImage
                          ? { ...imageSettings.backgroundImage, opacity: v / 100 }
                          : null,
                      })
                    }
                  />
                  <SliderRow
                    label="Blur"
                    value={imageSettings.backgroundImage.blur}
                    suffix="px"
                    min={0}
                    max={20}
                    step={1}
                    onChange={(v) =>
                      updateImageSettings({
                        backgroundImage: imageSettings.backgroundImage
                          ? { ...imageSettings.backgroundImage, blur: v }
                          : null,
                      })
                    }
                  />
                </div>
              )}
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
            <ControlSection label="Watermark" compact>
              <ToggleSwitch
                checked={imageSettings.showWatermark}
                onChange={(v) => updateImageSettings({ showWatermark: v })}
              />
            </ControlSection>
          </motion.div>
        )}

        {activeTab === 'text' && (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="space-y-2"
          >
            <ControlSection icon={Type} label="Font">
              <div className="flex gap-1.5 flex-wrap">
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

            <ControlSection icon={AlignLeft} label={`Size ${imageSettings.fontSize}px`}>
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

            <ControlSection icon={Languages} label="Glyphs">
              <div className="flex gap-1.5 flex-wrap">
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
          </motion.div>
        )}

        {activeTab === 'layout' && (
          <motion.div
            key="layout"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="space-y-2"
          >
            <ControlSection label={`Width ${imageSettings.width}px`}>
              <input
                type="range"
                min={240}
                max={600}
                step={10}
                value={imageSettings.width}
                onChange={(e) => updateImageSettings({ width: Number(e.target.value) })}
                className="w-full h-1 rounded-full appearance-none bg-white/[0.06]"
              />
            </ControlSection>

            {RATIO_GROUPS.map((group) => (
              <ControlSection key={group.label} label={group.label}>
                <div className="flex flex-wrap gap-1.5">
                  {group.ratios.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => updateImageSettings({ aspectRatio: value })}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                        imageSettings.aspectRatio === value
                          ? 'bg-white text-black'
                          : 'bg-white/[0.04] text-neutral-500 hover:bg-white/[0.08] hover:text-neutral-300'
                      }`}
                    >
                      {Icon && <Icon size={10} />}
                      {label}
                    </button>
                  ))}
                </div>
              </ControlSection>
            ))}

            <div className="grid grid-cols-2 gap-2">
              <ControlSection label="Format">
                <div className="flex gap-1.5">
                  {FORMATS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => updateImageSettings({ format: value })}
                      className={`flex-1 px-2 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                        imageSettings.format === value
                          ? 'bg-white text-black'
                          : 'bg-white/[0.04] text-neutral-500 hover:bg-white/[0.08] hover:text-neutral-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </ControlSection>
              <ControlSection label="Resolution">
                <div className="flex gap-1.5">
                  {RESOLUTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => updateImageSettings({ resolution: value })}
                      className={`flex-1 px-2 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                        imageSettings.resolution === value
                          ? 'bg-white text-black'
                          : 'bg-white/[0.04] text-neutral-500 hover:bg-white/[0.08] hover:text-neutral-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </ControlSection>
            </div>
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

/* ───── Reusable sub-components ───── */

function TabBtn({
  id,
  active,
  setActive,
  icon: Icon,
  label,
}: {
  id: Tab;
  active: Tab;
  setActive: (t: Tab) => void;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}) {
  const isActive = id === active;
  return (
    <button
      onClick={() => setActive(id)}
      className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
        isActive
          ? 'bg-white text-black'
          : 'text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-300'
      }`}
    >
      <Icon size={11} />
      {label}
    </button>
  );
}

function ControlSection({
  icon: Icon,
  label,
  compact,
  action,
  children,
}: {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  compact?: boolean;
  action?: React.ReactNode;
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
        <div className="flex items-center gap-1.5 flex-1">
          {Icon && <Icon size={12} className="text-neutral-600" />}
          <span className="text-[11px] font-medium text-neutral-500">
            {label}
          </span>
        </div>
        {action}
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

function SliderRow({
  label,
  value,
  suffix,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  suffix: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-neutral-600 w-12 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1 rounded-full appearance-none bg-white/[0.06]"
      />
      <span className="text-[10px] text-neutral-600 w-9 text-right font-mono tabular-nums">
        {value}
        {suffix}
      </span>
    </div>
  );
}
