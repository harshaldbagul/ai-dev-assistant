import { GoogleGenerativeAI, Content, Part, FunctionResponsePart } from '@google/generative-ai';
import { env } from '../../config/env.js';
import { GeminiMessage, SSEEvent } from '../../types/index.js';
import { toolDefinitions, executeToolCall } from '../../tools/index.js';
import { AIService } from './AIService.js';
import { logger } from '../../middleware/requestLogger.js';

const MAX_RETRY_DELAY_MS = 30_000;

// Gemini error message contains "Please retry in 19.087s." — parse the float seconds value.
function parseRetryDelay(err: unknown): number {
  const msg = err instanceof Error ? err.message : String(err);
  const match = msg.match(/retry in ([\d.]+)s/i);
  return match ? Math.min(Math.ceil(parseFloat(match[1]) * 1000), MAX_RETRY_DELAY_MS) : 5_000;
}

// Daily quota exhaustion (limit: 0 in the violation) won't recover within a retry window.
// Only retry transient per-minute rate limits, not daily limits.
function isDailyQuotaExhausted(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /per.?day|daily|PerDay/i.test(msg);
}

async function withRetry<T>(
  fn: () => Promise<T>,
  signal: AbortSignal,
  MAX_RETRIES = 1,
): Promise<T> {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (err) {
      if (signal.aborted) throw err;
      const msg = err instanceof Error ? err.message : String(err);
      const isRateLimit = /429|quota|rate.?limit|too many requests/i.test(msg);
      if (!isRateLimit || attempt >= MAX_RETRIES || isDailyQuotaExhausted(err)) throw err;

      const delayMs = parseRetryDelay(err);
      logger.warn({ attempt: attempt + 1, delayMs }, 'Rate limited — retrying after delay');
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      attempt++;
    }
  }
}

const SYSTEM_PROMPT = `You are an expert GitHub analyst. When asked about GitHub users or repositories, \
use the available tools to fetch real data before responding. Never make up or guess GitHub data.

Provide insightful, structured analysis of developers' profiles, activity, and repositories. \
When comparing users, fetch data for all of them. Format responses using Markdown: \
use **bold** for emphasis, bullet points for lists, and clear headings where helpful.`;

class GeminiService implements AIService {
  private readonly genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }

  async streamChat(
    userMessage: string,
    history: GeminiMessage[],
    onEvent: (event: SSEEvent) => void,
    signal: AbortSignal,
    model = env.GEMINI_MODEL,
  ): Promise<void> {
    const geminiModel = this.genAI.getGenerativeModel({
      model,
      systemInstruction: SYSTEM_PROMPT,
      tools: toolDefinitions,
    });
    try {
      const contents: Content[] = [
        ...history.map((msg) => ({
          role: msg.role,
          parts: msg.parts as Part[],
        })),
        { role: 'user', parts: [{ text: userMessage }] },
      ];

      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (signal.aborted) return;

        const streamResult = await withRetry(
          () => geminiModel.generateContentStream({ contents }),
          signal,
        );

        // Stream text chunks in real-time (empty for tool-requesting turns)
        for await (const chunk of streamResult.stream) {
          if (signal.aborted) return;
          // Thinking models (e.g. gemini-2.5-flash) emit thought parts alongside text parts.
          // chunk.text() returns empty for thought chunks — iterate parts and skip them.
          const parts = chunk.candidates?.[0]?.content?.parts ?? [];
          const text = parts
            .filter((p) => !(p as { thought?: boolean }).thought && 'text' in p)
            .map((p) => (p as { text: string }).text)
            .join('');
          if (text) {
            logger.info({ name: 'harshal:onEvent', text });
            onEvent({ type: 'text', content: text });
          }
        }

        // streamResult.response resolves after the stream is fully consumed
        const response = await streamResult.response;
        const functionCalls = response.functionCalls();

        if (!functionCalls || functionCalls.length === 0) break;

        // Emit tool call events and execute tools
        const functionResponseParts: FunctionResponsePart[] = [];
        for (const call of functionCalls) {
          if (signal.aborted) return;

          logger.info({ tool: call.name, args: call.args }, 'Executing tool call');
          onEvent({
            type: 'tool_call',
            tool: call.name,
            args: call.args as Record<string, unknown>,
          });

          try {
            const toolResult = await executeToolCall(
              call.name,
              call.args as Record<string, unknown>,
            );
            functionResponseParts.push({
              functionResponse: { name: call.name, response: { result: toolResult } },
            });
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Tool execution failed';
            functionResponseParts.push({
              functionResponse: { name: call.name, response: { error: message } },
            });
          }
        }

        // Add model turn + tool results to conversation
        contents.push({
          role: 'model',
          parts: response.candidates?.[0]?.content?.parts ?? [],
        });
        contents.push({ role: 'user', parts: functionResponseParts });
      }

      onEvent({ type: 'done' });
    } catch (err) {
      logger.error({ err }, 'GeminiService error');
      throw err;
    }
  }
}

export const geminiService = new GeminiService();
