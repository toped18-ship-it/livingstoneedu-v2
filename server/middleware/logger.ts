import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, originalUrl, ip } = req;
  
  Logger.request(method, originalUrl, ip);

  res.on('finish', () => {
    const duration = Date.now() - start;
    Logger.response(method, originalUrl, res.statusCode, duration);
  });

  next();
}
