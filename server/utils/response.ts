import { Response } from 'express';

export class ApiResponse {
  static success(res: Response, data: any = {}, message?: string, statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      ...data,
    });
  }

  static error(res: Response, message: string, details?: any, statusCode: number = 500) {
    return res.status(statusCode).json({
      success: false,
      error: message,
      message: details || message,
    });
  }
}
