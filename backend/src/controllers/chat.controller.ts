import { RequestHandler } from 'express';
import { z } from 'zod';
import { geminiService } from '../services/ai/GeminiService.js';
import { SSEEvent, AppError } from '../types/index.js';
import { parseApiError } from '../utils/parseApiError.js';
import { logger } from '../middleware/requestLogger.js';

const SUPPORTED_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
] as const;

const ChatBodySchema = z.object({
  message: z.string().min(1, 'message must not be empty').max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        parts: z.tuple([z.object({ text: z.string() })]),
      }),
    )
    .default([]),
  model: z.enum(SUPPORTED_MODELS).optional(),
});

export const stream: RequestHandler = (req, res) => {
  const parsed = ChatBodySchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const { message, history, model } = parsed.data;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const sendEvent = (event: SSEEvent) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  // Heartbeat keeps the connection alive through proxies and load balancers
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 15000);

  const abortController = new AbortController();

  res.on('close', () => {
    clearInterval(heartbeat);
    abortController.abort();
  });

  geminiService
    .streamChat(message, history, sendEvent, abortController.signal, model)
    .catch((err: unknown) => {
      logger.error({ err }, 'Chat stream error');
      sendEvent({ type: 'error', code: parseApiError(err) });
    })
    .finally(() => {
      clearInterval(heartbeat);
      res.end();
    });
};
