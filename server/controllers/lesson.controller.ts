import { Request, Response, NextFunction } from 'express';
import { LessonService } from '../services/lesson.service';
import { ApiResponse } from '../utils/response';

export class LessonController {
  static async generateLessonNote(req: Request, res: Response, next: NextFunction) {
    const { classLevel, subject, term, week, focusTopic } = req.body;
    
    try {
      const lessonNote = await LessonService.generateLessonNote(
        subject,
        classLevel,
        term,
        week,
        focusTopic
      );
      
      return ApiResponse.success(res, { lessonNote }, 'Lesson note generated successfully.');
    } catch (error: any) {
      next(error);
    }
  }
}
