import 'dotenv/config';
import { env } from './config/env.js';
import express from 'express';
import cors from 'cors';
import { requestLogger, logger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import chatRouter from './routes/chat.routes.js';

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception — shutting down');
  process.exit(1);
});

const app = express();

app.use(
  cors({
    origin: env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()),
    credentials: true,
  }),
);
app.use(express.json({ limit: '10kb' }));
app.use(requestLogger);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', environment: env.NODE_ENV, model: env.GEMINI_MODEL });
});

app.use('/api/chat', authMiddleware, chatRouter);

// 404 — must come after all routes
app.use((_req, res) => {
  res.status(404).json({ error: { message: 'Not found', code: 404 } });
});

app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  logger.info(
    `Server running on http://localhost:${env.PORT} [${env.NODE_ENV}] model=${env.GEMINI_MODEL}`,
  );
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received — shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export default app;
