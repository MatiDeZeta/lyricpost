import { useAppStore } from '@/store/useAppStore';
import { ControlSection } from '../shared/ControlSection';
import { RATIO_GROUPS, FORMATS, RESOLUTIONS } from '../imageConstants';

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
    </div>
  );
}
