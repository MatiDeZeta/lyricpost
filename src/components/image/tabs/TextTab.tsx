import { Type, Languages, AlignLeft, Rows3 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { ControlSection } from '../shared/ControlSection';
import { ToggleSwitch } from '../shared/ToggleSwitch';
import { FONT_FAMILIES, LANG_OPTIONS } from '../imageConstants';

export default function TextTab() {
  const imageSettings = useAppStore((s) => s.imageSettings);
  const updateImageSettings = useAppStore((s) => s.updateImageSettings);

  return (
    <div className="space-y-2">
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

      <ControlSection
        icon={Rows3}
        label={`Line spacing ${Number(imageSettings.lineHeight ?? 1.4).toFixed(1)}`}
      >
        <input
          type="range"
          min={1.1}
          max={2.8}
          step={0.1}
          value={imageSettings.lineHeight ?? 1.4}
          onChange={(e) =>
            updateImageSettings({ lineHeight: Number(e.target.value) })
          }
          className="w-full h-1 rounded-full appearance-none bg-white/[0.06]"
        />
      </ControlSection>

      <div className="grid grid-cols-3 gap-2">
        <ControlSection label="Cover" compact>
          <ToggleSwitch
            label="Cover"
            checked={imageSettings.showCover ?? true}
            onChange={(v) => updateImageSettings({ showCover: v })}
          />
        </ControlSection>
        <ControlSection label="Title" compact>
          <ToggleSwitch
            label="Title"
            checked={imageSettings.showTitle ?? true}
            onChange={(v) => updateImageSettings({ showTitle: v })}
          />
        </ControlSection>
        <ControlSection label="Artist" compact>
          <ToggleSwitch
            label="Artist"
            checked={imageSettings.showArtist ?? true}
            onChange={(v) => updateImageSettings({ showArtist: v })}
          />
        </ControlSection>
      </div>

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
    </div>
  );
}
