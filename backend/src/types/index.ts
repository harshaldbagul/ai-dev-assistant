// GitHub API response types
export interface GitHubProfile {
  login: string;
  name: string | null;
  bio: string | null;
  followers: number;
  following: number;
  public_repos: number;
  location: string | null;
  avatar_url: string;
  html_url: string;
  company: string | null;
  blog: string | null;
  created_at: string;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  html_url: string;
  forks_count: number;
  topics: string[];
}

// SSE event types — contract shared with frontend
export interface SSEToolCallEvent {
  type: 'tool_call';
  tool: string;
  args: Record<string, unknown>;
}

export interface SSETextEvent {
  type: 'text';
  content: string;
}

export const ErrorCode = {
  RATE_LIMITED: 'RATE_LIMITED',
  QUOTA_EXHAUSTED: 'QUOTA_EXHAUSTED',
  AUTH_ERROR: 'AUTH_ERROR',
  SERVICE_OVERLOADED: 'SERVICE_OVERLOADED',
  SERVER_ERROR: 'SERVER_ERROR',
  MODEL_NOT_FOUND: 'MODEL_NOT_FOUND',
  NETWORK_ERROR: 'NETWORK_ERROR',
  GITHUB_NOT_FOUND: 'GITHUB_NOT_FOUND',
  GITHUB_RATE_LIMITED: 'GITHUB_RATE_LIMITED',
  GITHUB_ERROR: 'GITHUB_ERROR',
  INVALID_REQUEST: 'INVALID_REQUEST',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export interface SSEErrorEvent {
  type: 'error';
  code: ErrorCode;
}

export interface SSEDoneEvent {
  type: 'done';
}

export type SSEEvent = SSEToolCallEvent | SSETextEvent | SSEErrorEvent | SSEDoneEvent;

// Chat API request body
export interface ChatRequestBody {
  message: string;
  history: GeminiMessage[];
}

// Gemini conversation history shape
export interface GeminiMessage {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

// Custom error class with HTTP status
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
