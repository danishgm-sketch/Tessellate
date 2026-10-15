import React, { useId, useState } from 'react';

export type PaymentFormVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PaymentFormProps {
  heading?: string;
  /** Formatted amount on the pay button, e.g. "£20.00". */
  amountLabel?: string;
  /**
   * Your payment provider's hosted card fields (Stripe Elements, Adyen, …) go here. Card numbers must never
   * touch your own servers; this component only lays out the surrounding form.
   */
  cardFields?: React.ReactNode;
  /** Called when the provider's fields are ready to confirm the payment. */
  onPay?: (billing: { name: string; postcode: string }) => void | Promise<void>;
  errorMessage?: string;
  loading?: boolean;
  /** Line under the button, e.g. "Payments are processed securely by Stripe." */
  securityNote?: string;
  variant?: PaymentFormVariant;
}

const control =
  'w-full rounded-ui-sm border border-hairline-strong bg-surface-raised px-3 py-2.5 text-base text-ink ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-[invalid=true]:border-danger';

/**
 * Checkout payment layout: billing name and postcode, a slot for the payment provider's secure card fields,
 * and the pay action. It deliberately has no card-number inputs of its own.
 */
export function PaymentForm({
  heading = 'Payment',
  amountLabel,
  cardFields,
  onPay,
  errorMessage,
  loading = false,
  securityNote = "Card details are entered in your payment provider's secure fields and never stored by this site.",
  variant = 'quiet',
}: PaymentFormProps) {
  const id = useId();
  const [name, setName] = useState('');
  const [postcode, setPostcode] = useState('');
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const nameInvalid = touched && !name.trim();
  const postcodeInvalid = touched && !postcode.trim();
  const isLoading = loading || busy;
  const shell = variant === 'expressive' ? 'shadow-ui-2 border border-hairline' : variant === 'nocturne' ? 'border-2 border-hairline-strong' : 'border border-hairline';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!name.trim() || !postcode.trim() || !onPay) return;
    setBusy(true);
    try {
      await onPay({ name, postcode });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`w-full max-w-md rounded-ui-lg bg-surface-raised p-6 font-body text-ink ${shell}`} aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className="font-heading text-lg font-semibold">
        {heading}
      </h2>
      <div role="alert" className="mt-3 empty:hidden">
        {errorMessage && <p className="rounded-ui-sm border border-danger bg-surface px-3 py-2 text-sm text-danger">{errorMessage}</p>}
      </div>
      <form className="mt-4 space-y-4" noValidate onSubmit={submit} aria-busy={isLoading}>
        <div className="space-y-1.5">
          <label htmlFor={`${id}-name`} className="block text-sm font-medium text-ink">Name on card</label>
          <input id={`${id}-name`} autoComplete="cc-name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={nameInvalid} aria-describedby={nameInvalid ? `${id}-name-error` : undefined} className={control} />
          {nameInvalid && <p id={`${id}-name-error`} className="text-sm text-danger">Enter the name on the card.</p>}
        </div>
        <fieldset className="space-y-1.5">
          <legend className="text-sm font-medium text-ink">Card</legend>
          {cardFields ?? (
            <div className="rounded-ui-sm border border-dashed border-hairline-strong bg-surface px-3 py-4 text-sm text-ink-secondary">
              Connect your payment provider: pass its secure card fields as <code className="font-mono">cardFields</code>.
            </div>
          )}
        </fieldset>
        <div className="space-y-1.5">
          <label htmlFor={`${id}-postcode`} className="block text-sm font-medium text-ink">Billing postcode</label>
          <input id={`${id}-postcode`} autoComplete="postal-code" value={postcode} onChange={(e) => setPostcode(e.target.value)} aria-invalid={postcodeInvalid} aria-describedby={postcodeInvalid ? `${id}-postcode-error` : undefined} className={`${control} max-w-[12rem]`} />
          {postcodeInvalid && <p id={`${id}-postcode-error`} className="text-sm text-danger">Enter your billing postcode.</p>}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-ui-sm bg-accent px-4 py-3 text-base font-semibold text-on-accent transition-colors duration-150 ease-ui hover:bg-accent-hover disabled:opacity-70 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          {isLoading ? 'Processing…' : amountLabel ? `Pay ${amountLabel}` : 'Pay now'}
        </button>
        <p className="text-xs text-ink-secondary">{securityNote}</p>
      </form>
    </section>
  );
}
