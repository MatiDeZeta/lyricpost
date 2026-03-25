import { useAppStore } from '@/store/useAppStore';
import type { WizardStep } from '@/types';

const steps: { step: WizardStep; label: string }[] = [
  { step: 2, label: 'Pick' },
  { step: 3, label: 'Lyrics' },
  { step: 4, label: 'Export' },
];

export default function StepIndicator() {
  const currentStep = useAppStore((s) => s.currentStep);

  return (
    <div className="flex items-center gap-1">
      {steps.map(({ step, label }, i) => {
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <div key={step} className="flex items-center gap-1">
            <span
              className={`
                text-[11px] font-medium transition-colors duration-200
                ${isActive ? 'text-white' : ''}
                ${isCompleted ? 'text-neutral-500' : ''}
                ${!isActive && !isCompleted ? 'text-neutral-700' : ''}
              `}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <span className="text-neutral-700 text-[10px]">/</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
