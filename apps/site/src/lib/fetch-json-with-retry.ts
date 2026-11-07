const TRANSIENT_HTTP_STATUSES = new Set([408, 429]);
const RETRY_DELAY_MS = 250;

function pauseBeforeRetry(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
}

/**
 * Retries one failed network request or transient server response. Malformed
 * payloads and permanent HTTP failures are surfaced immediately to the caller.
 */
export async function fetchJsonWithRetry<T>(url: string, init?: RequestInit): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, init);
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        if (attempt === 0 && (TRANSIENT_HTTP_STATUSES.has(response.status) || response.status >= 500)) {
          lastError = error;
          await pauseBeforeRetry();
          continue;
        }
        throw error;
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error;
      const isNetworkFailure = error instanceof TypeError;
      if (attempt === 0 && isNetworkFailure && !init?.signal?.aborted) {
        await pauseBeforeRetry();
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Request failed after one retry.');
}
