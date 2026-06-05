import pinoHttp from 'pino-http';
import pino from 'pino';
import { env } from '../config/env.js';

const transport =
  env.NODE_ENV === 'development'
    ? pino.transport({ target: 'pino-pretty', options: { colorize: true } })
    : undefined;

export const logger = pino({ level: 'info' }, transport);

export const requestLogger = pinoHttp({
  logger,
  customLogLevel: (_req, res) => {
    if (res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
});
