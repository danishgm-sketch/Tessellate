import React from 'react';

export type ApiKeyManagementVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ApiKeyManagementProps {
  variant?: ApiKeyManagementVariant;
}

export function ApiKeyManagement({ variant = 'quiet' }: ApiKeyManagementProps) {
  const [tokens, setTokens] = React.useState([1, 2]);
  const [nextToken, setNextToken] = React.useState(3);
  const [status, setStatus] = React.useState('');
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const addExampleToken = () => {
    const tokenNumber = nextToken;
    setTokens((current) => [...current, tokenNumber]);
    setNextToken((current) => current + 1);
    setStatus('Example token ' + tokenNumber + ' added to this preview. No credential was created.');
  };

  const removeExampleToken = (tokenNumber: number) => {
    setTokens((current) => current.filter((token) => token !== tokenNumber));
    setStatus('Example token ' + tokenNumber + ' removed from this preview. No credential was revoked.');
  };

  return (
    <div className={`w-full p-6 sm:p-8 rounded-xl border transition-colors ${bg}`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h3 className="text-base font-bold">Example API tokens</h3>
        <button type="button" onClick={addExampleToken} className="px-3 py-1.5 rounded-lg border text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
          Add example token
        </button>
      </div>

      <p className="mb-5 text-xs opacity-75">Preview only. Actions change these example rows; no credentials are created or revoked.</p>

      <div className="space-y-3 text-xs">
        {tokens.map((tokenNumber) => (
          <div key={tokenNumber} className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="font-semibold">Example token {tokenNumber}</div>
              <div className="text-[11px] opacity-70">Sample row · not a credential</div>
            </div>
            <button type="button" aria-label={'Remove example token ' + tokenNumber} onClick={() => removeExampleToken(tokenNumber)} className="inline-flex min-h-7 self-start items-center rounded px-2 text-rose-600 hover:underline text-[11px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:self-auto">
              Remove example
            </button>
          </div>
        ))}
      </div>
      {tokens.length === 0 && <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm opacity-75">No example tokens in this preview.</p>}
      <p className="sr-only" role="status" aria-live="polite">{status}</p>
    </div>
  );
}
