import { Router } from 'express';
import { LessonController } from '../controllers/lesson.controller';
import { validateBody } from '../middleware/validate';
import { aiRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post(
  '/generate-lesson-note',
  aiRateLimiter,
  validateBody(['classLevel', 'subject', 'term', 'week']),
  LessonController.generateLessonNote
);

export default router;
