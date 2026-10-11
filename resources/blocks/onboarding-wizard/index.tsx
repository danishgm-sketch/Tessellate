import React, { useState } from 'react';

export type OnboardingWizardVariant = 'quiet' | 'expressive' | 'nocturne';

export interface OnboardingWizardProps {
  variant?: OnboardingWizardVariant;
}

export function OnboardingWizard({ variant = 'quiet' }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);

  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <div className={`w-full p-6 sm:p-8 rounded-xl border text-center transition-colors ${bg}`}>
      <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase block mb-2">Step {step} of 3</span>
      <h3 className="text-base font-bold mb-4">
        {step === 1 && 'Name Your Project'}
        {step === 2 && 'Select Visual DNA Theme'}
        {step === 3 && 'Configure Initial Layout Shell'}
      </h3>
      <p className="text-xs opacity-75 max-w-sm mx-auto mb-8">
        {step === 1 && 'Give your project a clean identifier for local persistence.'}
        {step === 2 && 'Choose between Quiet (Editorial), Expressive (Vibrant), or Nocturne (Obsidian).'}
        {step === 3 && 'Pick a top navigation bar or two-pane application shell to start.'}
      </p>

      <div className="flex justify-center gap-3">
        {step > 1 && (
          <button type="button" onClick={() => setStep(step - 1)} className="px-4 py-2 rounded-lg border text-xs">
            Back
          </button>
        )}
        {step < 3 ? (
          <button type="button" onClick={() => setStep(step + 1)} className="px-5 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold">
            Continue →
          </button>
        ) : (
          <button type="button" onClick={() => setStep(1)} className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold">
            Finish Setup
          </button>
        )}
      </div>
    </div>
  );
}
