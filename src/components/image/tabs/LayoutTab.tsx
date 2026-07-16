import { useAppStore } from '@/store/useAppStore';
import { ControlSection } from '../shared/ControlSection';
import { RATIO_GROUPS, FORMATS, RESOLUTIONS, EXPORT_MODES } from '../imageConstants';

export default function LayoutTab() {
  const imageSettings = useAppStore((s) => s.imageSettings);
  const updateImageSettings = useAppStore((s) => s.updateImageSettings);

  return (
    <div className="space-y-2">
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

      <ControlSection label="Save as">
        <div className="space-y-1">
          {EXPORT_MODES.map((mode) => (
            <div
              key={mode.value}
              className="flex items-start gap-2 px-2 py-1.5 rounded-md bg-white/[0.02]"
            >
              <span className="text-[11px] font-medium text-neutral-400 shrink-0 w-[5.5rem]">
                {mode.label}
              </span>
              <span className="text-[10px] text-neutral-600 leading-snug">
                {mode.description}
              </span>
            </div>
          ))}
          <p className="text-[10px] text-neutral-700 pt-1">
            Use the Save menu in the toolbar. No background and Lyrics only export as PNG.
          </p>
        </div>
      </ControlSection>
    </div>
  );
}
