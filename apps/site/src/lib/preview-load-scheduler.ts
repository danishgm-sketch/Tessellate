type NetworkInformation = Navigator & {
  connection?: {
    effectiveType?: string;
    saveData?: boolean;
  };
};

type QueueEntry = {
  signal: AbortSignal;
  resolve: (release: (() => void) | null) => void;
  onAbort: () => void;
};

const previewQueue: QueueEntry[] = [];
let activePreviewCount = 0;

function previewConcurrencyLimit(): number {
  if (typeof navigator === 'undefined') return 2;

  const connection = (navigator as NetworkInformation).connection;
  if (
    connection?.saveData ||
    connection?.effectiveType === 'slow-2g' ||
    connection?.effectiveType === '2g' ||
    connection?.effectiveType === '3g'
  ) {
    return 1;
  }

  // Preserve the existing lazy-loading behavior on normal or unknown links.
  // The browser already limits native lazy iframes; add a queue only when the
  // connection explicitly reports that preview work should be serialized.
  return Number.MAX_SAFE_INTEGER;
}

function drainPreviewQueue(): void {
  const concurrencyLimit = previewConcurrencyLimit();

  while (activePreviewCount < concurrencyLimit && previewQueue.length > 0) {
    const entry = previewQueue.shift();
    if (!entry) return;

    entry.signal.removeEventListener('abort', entry.onAbort);
    if (entry.signal.aborted) {
      entry.resolve(null);
      continue;
    }

    activePreviewCount += 1;
    let released = false;
    entry.resolve(() => {
      if (released) return;
      released = true;
      activePreviewCount = Math.max(0, activePreviewCount - 1);
      drainPreviewQueue();
    });
  }
}

/** Reserve a preview slot so constrained devices do not initialize every visible sandbox at once. */
export function acquirePreviewLoadSlot(signal: AbortSignal): Promise<(() => void) | null> {
  if (signal.aborted) return Promise.resolve(null);

  return new Promise((resolve) => {
    const entry: QueueEntry = {
      signal,
      resolve,
      onAbort: () => {
        const index = previewQueue.indexOf(entry);
        if (index >= 0) previewQueue.splice(index, 1);
        resolve(null);
      },
    };

    signal.addEventListener('abort', entry.onAbort, { once: true });
    previewQueue.push(entry);
    drainPreviewQueue();
  });
}
