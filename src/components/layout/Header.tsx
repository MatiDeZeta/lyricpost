import StepIndicator from './StepIndicator';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/[0.04]">
      <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <span className="text-[10px] font-black text-black tracking-tighter">LP</span>
          </div>
          <h1 className="text-sm font-semibold text-white tracking-tight">
            LyricPost
          </h1>
        </div>
        <a
          href="https://github.com/palinkiewicz/lyricpost"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-medium text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          GitHub
        </a>
      </div>
      <StepIndicator />
    </header>
  );
}
