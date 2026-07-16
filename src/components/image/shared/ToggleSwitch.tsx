export function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
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
