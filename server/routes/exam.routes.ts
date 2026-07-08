import { Router } from 'express';
import { ExamController } from '../controllers/exam.controller';
import { aiRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Legacy and direct mapping
router.post('/generate-exam', aiRateLimiter, ExamController.generateExam);
router.post('/grade-script', aiRateLimiter, ExamController.gradeScript);

// Individual exam types
router.post('/objective', aiRateLimiter, ExamController.generateObjective);
router.post('/theory', aiRateLimiter, ExamController.generateTheory);
router.post('/practical', aiRateLimiter, ExamController.generatePractical);
router.post('/assignment', aiRateLimiter, ExamController.generateAssignment);
router.post('/project', aiRateLimiter, ExamController.generateProject);
router.post('/worksheet', aiRateLimiter, ExamController.generateWorksheet);

export default router;
