import { useCallback, useEffect, useRef, useState } from 'react';

async function writeClipboardText(text: string): Promise<boolean> {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const fallback = document.createElement('textarea');
    try {
      fallback.value = text;
      fallback.setAttribute('readonly', '');
      fallback.style.position = 'fixed';
      fallback.style.left = '-10000px';
      fallback.style.top = '0';
      document.body.appendChild(fallback);
      fallback.focus();
      fallback.select();
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      fallback.remove();
    }
  }
}

export function useToolClipboard() {
  const [copyFailed, setCopyFailed] = useState(false);
  const clearFailureTimer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      if (clearFailureTimer.current !== undefined) window.clearTimeout(clearFailureTimer.current);
    },
    []
  );

  const copyText = useCallback(async (text: string) => {
    if (clearFailureTimer.current !== undefined) window.clearTimeout(clearFailureTimer.current);
    const copied = await writeClipboardText(text);
    setCopyFailed(!copied);
    if (!copied) {
      clearFailureTimer.current = window.setTimeout(() => setCopyFailed(false), 8000);
    }
    return copied;
  }, []);

  return { copyText, copyFailed };
}

export function CopyFailureNotice({ failed }: { failed: boolean }) {
  if (!failed) return null;
  return (
    <p role="alert" className="mt-3 text-xs text-[#A6323B]">
      Copy failed. Allow clipboard access in your browser and try again.
    </p>
  );
}
