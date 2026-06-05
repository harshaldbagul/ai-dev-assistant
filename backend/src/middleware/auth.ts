import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../types/index.js';

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== env.API_SECRET_KEY) {
    throw new AppError('Unauthorized', 401);
  }

  next();
}
