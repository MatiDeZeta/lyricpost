import { Clock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import StepIndicator from './StepIndicator';

export default function Header() {
  const currentStep = useAppStore((s) => s.currentStep);
  const historyCount = useAppStore((s) => s.history.length);
  const openHistory = useAppStore((s) => s.openHistoryDrawer);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/[0.03]">
      <div className="max-w-2xl mx-auto px-5 h-12 flex items-center justify-between">
        <span className="text-[13px] font-semibold text-neutral-300 tracking-tight select-none">
          lyricpost
        </span>
        <div className="flex items-center gap-3">
          {currentStep > 1 && <StepIndicator />}
          <button
            onClick={openHistory}
            className="relative p-1.5 -mr-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
            aria-label="Open history"
            title="History"
          >
            <Clock size={14} className="text-neutral-500" />
            {historyCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-1 rounded-full bg-white text-black text-[9px] font-bold flex items-center justify-center leading-none">
                {historyCount > 99 ? '99+' : historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
