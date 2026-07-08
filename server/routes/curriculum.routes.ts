import { Router } from 'express';
import { CurriculumController } from '../controllers/curriculum.controller';
import { validateBody } from '../middleware/validate';
import { aiRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post(
  '/generate-curriculum',
  aiRateLimiter,
  validateBody(['classLevel', 'subject', 'term']),
  CurriculumController.generateCurriculum
);

export default router;
