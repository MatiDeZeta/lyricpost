export type ImageTab = 'background' | 'text' | 'layout';

export function TabBtn({
  id,
  active,
  setActive,
  icon: Icon,
  label,
}: {
  id: ImageTab;
  active: ImageTab;
  setActive: (t: ImageTab) => void;
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
