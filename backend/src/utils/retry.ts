export interface RetryOptions {
  /** Total attempts, including the first one. */
  attempts: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  onRetry?: (attempt: number, error: unknown) => void;
  /**
   * Inspect the error and return a wait in ms (e.g. an API's "retry in Xs"
   * hint). Returning undefined falls back to exponential backoff.
   */
  delayForError?: (error: unknown) => number | undefined;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Retry with exponential backoff and jitter; honors server-suggested delays. */
export async function withRetry<T>(
  fn: () => Promise<T>,
  { attempts, baseDelayMs = 750, maxDelayMs = 8000, onRetry, delayForError }: RetryOptions,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      onRetry?.(attempt, error);
      const suggested = delayForError?.(error);
      const backoff =
        suggested !== undefined
          ? suggested
          : Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
      await sleep(backoff + Math.random() * 250);
    }
  }
  throw lastError;
}
