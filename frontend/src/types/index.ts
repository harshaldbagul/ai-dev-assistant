// SSE event contract — mirrors backend exactly
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

// Chat display state
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  isError?: boolean;
}

// Gemini conversation history — sent to backend as-is
export interface GeminiMessage {
  role: 'user' | 'model';
  parts: [{ text: string }];
}
