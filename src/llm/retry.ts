export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 1,
  delayMs = 3000,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return withRetry(fn, retries - 1, delayMs);
  }
}
