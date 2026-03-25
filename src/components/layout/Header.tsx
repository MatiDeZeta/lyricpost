import { useAppStore } from '@/store/useAppStore';
import StepIndicator from './StepIndicator';

export default function Header() {
  const currentStep = useAppStore((s) => s.currentStep);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/[0.03]">
      <div className="max-w-2xl mx-auto px-5 h-12 flex items-center justify-between">
        <span className="text-[13px] font-semibold text-neutral-300 tracking-tight select-none">
          lyricpost
        </span>
        {currentStep > 1 && <StepIndicator />}
      </div>
    </header>
  );
}
