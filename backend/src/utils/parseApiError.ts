import { ErrorCode } from '../types/index.js';

/**
 * Maps a raw SDK / HTTP error to a structured ErrorCode.
 * The code is sent to the client; the raw error is logged by the caller.
 */
export function parseApiError(err: unknown): ErrorCode {
  const raw = err instanceof Error ? err.message : String(err);

  // GitHub errors — GithubService throws well-known messages
  if (/github user not found/i.test(raw)) return ErrorCode.GITHUB_NOT_FOUND;
  if (/github api rate limit/i.test(raw)) return ErrorCode.GITHUB_RATE_LIMITED;
  if (/github api error/i.test(raw)) return ErrorCode.GITHUB_ERROR;

  // Gemini: daily quota exhausted — won't recover until midnight, distinct from per-minute limits
  if (/per.?day|daily|PerDay/i.test(raw)) return ErrorCode.QUOTA_EXHAUSTED;
  // Gemini: transient per-minute rate limit
  if (/429|quota|rate.?limit|too many requests/i.test(raw)) return ErrorCode.RATE_LIMITED;

  // Gemini: auth
  if (/401|403|api.?key|unauthenticated|permission denied/i.test(raw)) return ErrorCode.AUTH_ERROR;

  // Gemini: overloaded
  if (/503|overloaded|service unavailable/i.test(raw)) return ErrorCode.SERVICE_OVERLOADED;

  // Gemini: server error
  if (/500|internal server error/i.test(raw)) return ErrorCode.SERVER_ERROR;

  // Gemini: model not found
  if (/404.*model|model.*not found/i.test(raw)) return ErrorCode.MODEL_NOT_FOUND;

  // Network / connectivity
  if (/ECONNREFUSED|ETIMEDOUT|ENOTFOUND|network|fetch failed/i.test(raw)) return ErrorCode.NETWORK_ERROR;

  return ErrorCode.UNKNOWN_ERROR;
}
