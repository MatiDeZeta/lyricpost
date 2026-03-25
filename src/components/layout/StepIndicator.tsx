import { useAppStore } from '@/store/useAppStore';
import type { WizardStep } from '@/types';

const steps: { step: WizardStep; label: string }[] = [
  { step: 1, label: 'Search' },
  { step: 2, label: 'Select' },
  { step: 3, label: 'Lyrics' },
  { step: 4, label: 'Export' },
];

export default function StepIndicator() {
  const currentStep = useAppStore((s) => s.currentStep);

  return (
    <div className="flex items-center justify-center gap-0 px-5 pb-3">
      {steps.map(({ step, label }, i) => {
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <div key={step} className="flex items-center">
            <div className="flex items-center gap-1.5">
              <div
                className={`
                  flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold transition-all duration-300
                  ${isActive ? 'bg-white text-black' : ''}
                  ${isCompleted ? 'bg-white/20 text-white/60' : ''}
                  ${!isActive && !isCompleted ? 'bg-white/[0.06] text-neutral-600' : ''}
                `}
              >
                {isCompleted ? '✓' : step}
              </div>
              <span
                className={`
                  text-[11px] font-medium transition-colors duration-300
                  ${isActive ? 'text-white' : ''}
                  ${isCompleted ? 'text-neutral-500' : ''}
                  ${!isActive && !isCompleted ? 'text-neutral-600' : ''}
                `}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`
                  w-8 sm:w-12 h-px mx-2 transition-all duration-500
                  ${step < currentStep ? 'bg-white/20' : 'bg-white/[0.04]'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
