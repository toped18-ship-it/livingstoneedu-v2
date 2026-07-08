import { Request, Response, NextFunction } from 'express';
import { CurriculumService } from '../services/curriculum.service';
import { ApiResponse } from '../utils/response';

export class CurriculumController {
  static async generateCurriculum(req: Request, res: Response, next: NextFunction) {
    const { classLevel, subject, term } = req.body;

    try {
      const curriculum = await CurriculumService.generateCurriculum(classLevel, subject, term);
      return ApiResponse.success(res, { curriculum }, 'Curriculum plan synthesized successfully.');
    } catch (error: any) {
      next(error);
    }
  }
}
