import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';
import { ApiResponse } from '../utils/response';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  Logger.error('ErrorHandler', `Uncaught Express Error in ${req.method} ${req.originalUrl}`, err);
  
  return ApiResponse.error(
    res,
    statusCode === 500 ? 'An unexpected error occurred.' : message,
    message,
    statusCode
  );
}
