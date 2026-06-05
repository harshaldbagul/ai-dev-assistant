import { ErrorCode } from '@/types';

const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.RATE_LIMITED]: "You've hit the API rate limit. Please wait a moment and try again.",
  [ErrorCode.QUOTA_EXHAUSTED]: 'Daily API quota exhausted. Usage resets at midnight Pacific Time.',
  [ErrorCode.AUTH_ERROR]: 'User not authenticated. Please contact the administrator.',
  [ErrorCode.SERVICE_OVERLOADED]: 'The AI service is temporarily overloaded. Please try again in a few seconds.',
  [ErrorCode.SERVER_ERROR]: 'The AI service returned an internal error. Please try again.',
  [ErrorCode.MODEL_NOT_FOUND]: 'The configured AI model was not found. Please contact the administrator.',
  [ErrorCode.NETWORK_ERROR]: 'Could not reach the server. Check your internet connection and try again.',
  [ErrorCode.GITHUB_NOT_FOUND]: 'GitHub user not found. Please check the username and try again.',
  [ErrorCode.GITHUB_RATE_LIMITED]: 'GitHub API rate limit exceeded. Try again later or add a GitHub token.',
  [ErrorCode.GITHUB_ERROR]: 'Could not fetch data from GitHub. Please try again.',
  [ErrorCode.INVALID_REQUEST]: 'Invalid request. Please try a different message.',
  [ErrorCode.UNKNOWN_ERROR]: 'Something went wrong. Please try again.',
};

export function getErrorMessage(code: ErrorCode): string {
  return ERROR_MESSAGES[code] ?? ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR];
}
