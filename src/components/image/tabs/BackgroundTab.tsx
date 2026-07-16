import { Palette, Shuffle, Sparkles, Image as ImageIcon, Download } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useImageExport } from '@/hooks/useImageExport';
import CoverArt from '@/components/ui/CoverArt';
import { ControlSection } from '../shared/ControlSection';
import { ToggleSwitch } from '../shared/ToggleSwitch';
import { SliderRow } from '../shared/SliderRow';
import { isDarkColor } from '@/utils/extractPalette';
import type { Song } from '@/types';

interface BackgroundTabProps {
  song: Song | null;
  selectedSongIndex: number | null;
  coverPalette: string[];
  onPickBackgroundFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BackgroundTab({
  song,
  selectedSongIndex,
  coverPalette,
  onPickBackgroundFile,
}: BackgroundTabProps) {
  const imageSettings = useAppStore((s) => s.imageSettings);
  const updateImageSettings = useAppStore((s) => s.updateImageSettings);
  const presetColors = useAppStore((s) => s.presetColors);
  const shuffleColor = useAppStore((s) => s.shuffleColor);
  const isLoading = useAppStore((s) => s.isLoading);
  const { downloadImage } = useImageExport();

  return (
    <div className="space-y-2">
      {song && selectedSongIndex !== null && (
        <ControlSection icon={ImageIcon} label="Album cover">
          <div className="flex items-center gap-3">
            <CoverArt song={song} songIndex={selectedSongIndex} size="lg" showUpload />
            <div className="flex-1 space-y-2">
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Many Last.fm tracks have no artwork. Upload a cover or we will try Spotify
                and iTunes automatically.
              </p>
              <button
                type="button"
                onClick={() => void downloadImage(null, 'cover')}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-white/[0.04] text-neutral-400 hover:bg-white/[0.08] hover:text-neutral-200 transition-colors disabled:opacity-30"
              >
                <Download size={11} />
                Download cover only
              </button>
            </div>
          </div>
        </ControlSection>
      )}

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

      <ControlSection icon={Palette} label="Gradient">
        <div className="flex items-center gap-3">
          <ToggleSwitch
            label="Use gradient"
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
                        ...(imageSettings.gradient ?? {
                          from: '#1a1a1a',
                          to: '#3a3a3a',
                          angle: 135,
                        }),
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
                        ...(imageSettings.gradient ?? {
                          from: '#1a1a1a',
                          to: '#3a3a3a',
                          angle: 135,
                        }),
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
                      ...(imageSettings.gradient ?? {
                        from: '#1a1a1a',
                        to: '#3a3a3a',
                        angle: 135,
                      }),
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
              onChange={onPickBackgroundFile}
              className="sr-only"
            />
          </label>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="w-12 h-12 rounded-lg bg-cover bg-center shrink-0 border border-white/[0.06]"
                style={{
                  backgroundImage: `url(${imageSettings.backgroundImage.dataUrl})`,
                }}
              />
              <label className="flex-1 text-center py-2 rounded-lg border border-dashed border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02] transition-all cursor-pointer text-[11px] text-neutral-500">
                Replace
                <input
                  type="file"
                  accept="image/*"
                  onChange={onPickBackgroundFile}
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

      <div className="grid grid-cols-3 gap-2">
        <ControlSection label="Light text" compact>
          <ToggleSwitch
            label="Light text"
            checked={imageSettings.lightText}
            onChange={(v) => updateImageSettings({ lightText: v })}
          />
        </ControlSection>
        <ControlSection label="Platform tag" compact>
          <ToggleSwitch
            label="Platform tag"
            checked={imageSettings.showPlatformTag}
            onChange={(v) => updateImageSettings({ showPlatformTag: v })}
          />
        </ControlSection>
        <ControlSection label="Shadow" compact>
          <ToggleSwitch
            label="Shadow"
            checked={imageSettings.showBackground}
            onChange={(v) => updateImageSettings({ showBackground: v })}
          />
        </ControlSection>
      </div>
      <ControlSection label="Watermark" compact>
        <ToggleSwitch
          label="Watermark"
          checked={imageSettings.showWatermark}
          onChange={(v) => updateImageSettings({ showWatermark: v })}
        />
      </ControlSection>
    </div>
  );
}
