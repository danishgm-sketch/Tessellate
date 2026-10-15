import React, { useState } from 'react';
import { SignUpForm, type SignUpFormVariant } from './index.js';
import { signUpFormFixtures } from './fixtures.js';

type PreviewState = 'ready' | 'loading' | 'error';

export function SignUpFormPreview() {
  const [variant, setVariant] = useState<SignUpFormVariant>('quiet');
  const [state, setState] = useState<PreviewState>('ready');
  const chip = (active: boolean) =>
    `rounded-ui-sm px-2.5 py-1 text-xs font-medium focus-visible:outline-2 focus-visible:outline-focus ${active ? 'bg-ink text-canvas' : 'bg-surface-raised text-ink border border-hairline'}`;
  return (
    <div className="flex w-full flex-col bg-canvas">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline bg-surface px-3 py-2 text-xs">
        <span className="font-semibold text-ink">Sign-up Form</span>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Variant">
          {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
            <button key={v} type="button" aria-pressed={variant === v} onClick={() => setVariant(v)} className={chip(variant === v)}>
              {v}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1" role="group" aria-label="State">
          {([['ready', 'Ready'], ['loading', 'Loading'], ['error', 'Error']] as Array<[PreviewState, string]>).map(([s, label]) => (
            <button key={s} type="button" aria-pressed={state === s} onClick={() => setState(s)} className={chip(state === s)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 sm:p-8">
        <SignUpForm
          {...signUpFormFixtures}
          variant={variant}
          loading={state === 'loading'}
          errorMessage={state === 'error' ? 'Something went wrong. Please try again.' : undefined}
        />
      </div>
    </div>
  );
}
