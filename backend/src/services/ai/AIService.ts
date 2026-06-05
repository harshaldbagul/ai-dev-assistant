import { GeminiMessage, SSEEvent } from '../../types/index.js';

export interface AIService {
  streamChat(
    userMessage: string,
    history: GeminiMessage[],
    onEvent: (event: SSEEvent) => void,
    signal: AbortSignal,
    model?: string,
  ): Promise<void>;
}
