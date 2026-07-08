import rateLimit from 'express-rate-limit';
import { ApiResponse } from '../utils/response';

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ApiResponse.error(
      res,
      'Too Many Requests',
      'You have exceeded the rate limit for this endpoint. Please try again in 15 minutes.',
      429
    );
  }
});

export const aiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 AI generation requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ApiResponse.error(
      res,
      'Rate Limit Exceeded',
      'AI resource quota exceeded for your session. Please wait 1 minute before generating content again.',
      429
    );
  }
});
