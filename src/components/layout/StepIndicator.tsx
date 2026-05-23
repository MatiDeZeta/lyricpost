import { useAppStore } from '@/store/useAppStore';
import type { WizardStep } from '@/types';

const steps: { step: WizardStep; label: string }[] = [
  { step: 2, label: 'Pick' },
  { step: 3, label: 'Lyrics' },
  { step: 4, label: 'Export' },
];

export default function StepIndicator() {
  const currentStep = useAppStore((s) => s.currentStep);
  const setStep = useAppStore((s) => s.setStep);

  const goTo = (target: WizardStep) => {
    if (target >= currentStep) return;
    if (target === 2 && currentStep >= 3) {
      const ok = window.confirm('Go back to song results? Your lyric selection stays saved.');
      if (!ok) return;
    }
    if (target === 3 && currentStep === 4) {
      const ok = window.confirm('Go back to lyrics? Image settings are kept.');
      if (!ok) return;
    }
    setStep(target);
  };

  return (
    <div className="flex items-center gap-1">
      {steps.map(({ step, label }, i) => {
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;
        const canClick = isCompleted;

        return (
          <div key={step} className="flex items-center gap-1">
            <button
              type="button"
              disabled={!canClick}
              onClick={() => canClick && goTo(step)}
              className={`
                text-[11px] font-medium transition-colors duration-200
                ${isActive ? 'text-white' : ''}
                ${isCompleted ? 'text-neutral-500 hover:text-neutral-300 cursor-pointer' : ''}
                ${!isActive && !isCompleted ? 'text-neutral-700 cursor-default' : ''}
              `}
            >
              {label}
            </button>
            {i < steps.length - 1 && (
              <span className="text-neutral-700 text-[10px]">/</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
