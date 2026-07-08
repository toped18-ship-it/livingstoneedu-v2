import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/response';

export function validateBody(requiredFields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing: string[] = [];
    
    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    }
    
    if (missing.length > 0) {
      return ApiResponse.error(
        res,
        `Validation Error: Missing required fields: ${missing.join(', ')}`,
        `The fields [${missing.join(', ')}] are required.`,
        400
      );
    }
    
    next();
  };
}
