import { ErrorRequestHandler } from 'express';
import { AppError } from '../types/index.js';
import { logger } from './requestLogger.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message =
    err instanceof AppError ? err.message : 'An unexpected error occurred';

  logger.error({ err, statusCode }, message);

  res.status(statusCode).json({
    error: {
      message,
      code: statusCode,
    },
  });
};
