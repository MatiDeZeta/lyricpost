export function ControlSection({
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
          <span className="text-[11px] font-medium text-neutral-500">{label}</span>
        </div>
        {action}
        {compact && children}
      </div>
      {!compact && children}
    </div>
  );
}
