import { ErrorCode, type GeminiMessage, type SSEEvent } from '@/types';

const API_URL = import.meta.env.VITE_API_URL as string;
const API_SECRET_KEY = import.meta.env.VITE_API_SECRET_KEY as string;

interface StreamCallbacks {
  onToolCall: (tool: string, args: Record<string, unknown>) => void;
  onText: (content: string) => void;
  onError: (code: ErrorCode) => void;
  onDone: () => void;
}

function httpStatusToCode(status: number): ErrorCode {
  if (status === 400) return ErrorCode.INVALID_REQUEST;
  if (status === 401 || status === 403) return ErrorCode.AUTH_ERROR;
  if (status === 429) return ErrorCode.RATE_LIMITED;
  if (status >= 500) return ErrorCode.SERVER_ERROR;
  return ErrorCode.UNKNOWN_ERROR;
}

export function streamChat(
  message: string,
  history: GeminiMessage[],
  callbacks: StreamCallbacks,
  model: string,
): AbortController {
  const abortController = new AbortController();

  (async () => {
    try {
      const response = await fetch(`${API_URL}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_SECRET_KEY },
        body: JSON.stringify({ message, history, model }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        callbacks.onError(httpStatusToCode(response.status));
        return;
      }

      if (!response.body) {
        callbacks.onError(ErrorCode.UNKNOWN_ERROR);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        console.log('harshal:buffer',buffer, lines)
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (!data) continue;

          try {
            const event = JSON.parse(data) as SSEEvent;
            switch (event.type) {
              case 'tool_call':
                callbacks.onToolCall(event.tool, event.args);
                break;
              case 'text':
                callbacks.onText(event.content);
                break;
              case 'error':
                callbacks.onError(event.code);
                break;
              case 'done':
                callbacks.onDone();
                break;
            }
          } catch (e) {
            console.log('Malformed SSE', e)
            // Malformed SSE line — skip silently
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      callbacks.onError(ErrorCode.NETWORK_ERROR);
    }
  })();

  return abortController;
}
