import { Request, Response, NextFunction } from 'express';
import { ExamService } from '../services/exam.service';
import { ApiResponse } from '../utils/response';

export class ExamController {
  // Legacy / Direct Objective mapping to preserve existing frontend
  static async generateExam(req: Request, res: Response, next: NextFunction) {
    const { subject, classLevel, numQuestions, term, topic } = req.body || {};
    const count = parseInt(numQuestions) || 5;

    try {
      const result = await ExamService.generateObjective(
        subject || "General Study",
        classLevel || "Primary 1",
        term || "First Term",
        count,
        topic || "General Topic"
      );
      return ApiResponse.success(res, { questions: result.questions, isFallback: result.isFallback });
    } catch (error: any) {
      next(error);
    }
  }

  static async generateObjective(req: Request, res: Response, next: NextFunction) {
    const { subject, classLevel, numQuestions, term, topic } = req.body || {};
    const count = parseInt(numQuestions) || 5;

    try {
      const result = await ExamService.generateObjective(subject, classLevel, term, count, topic);
      return ApiResponse.success(res, result);
    } catch (error: any) {
      next(error);
    }
  }

  static async generateTheory(req: Request, res: Response, next: NextFunction) {
    const { subject, classLevel, numQuestions, term, topic } = req.body || {};
    const count = parseInt(numQuestions) || 5;

    try {
      const result = await ExamService.generateTheory(subject, classLevel, term, count, topic);
      return ApiResponse.success(res, result);
    } catch (error: any) {
      next(error);
    }
  }

  static async generatePractical(req: Request, res: Response, next: NextFunction) {
    const { subject, classLevel, numQuestions, term, topic } = req.body || {};
    const count = parseInt(numQuestions) || 1;

    try {
      const result = await ExamService.generatePractical(subject, classLevel, term, count, topic);
      return ApiResponse.success(res, result);
    } catch (error: any) {
      next(error);
    }
  }

  static async generateAssignment(req: Request, res: Response, next: NextFunction) {
    const { subject, classLevel, numQuestions, term, topic } = req.body || {};
    const count = parseInt(numQuestions) || 1;

    try {
      const result = await ExamService.generateAssignment(subject, classLevel, term, count, topic);
      return ApiResponse.success(res, result);
    } catch (error: any) {
      next(error);
    }
  }

  static async generateProject(req: Request, res: Response, next: NextFunction) {
    const { subject, classLevel, numQuestions, term, topic } = req.body || {};
    const count = parseInt(numQuestions) || 1;

    try {
      const result = await ExamService.generateProject(subject, classLevel, term, count, topic);
      return ApiResponse.success(res, result);
    } catch (error: any) {
      next(error);
    }
  }

  static async generateWorksheet(req: Request, res: Response, next: NextFunction) {
    const { subject, classLevel, numQuestions, term, topic } = req.body || {};
    const count = parseInt(numQuestions) || 5;

    try {
      const result = await ExamService.generateWorksheet(subject, classLevel, term, count, topic);
      return ApiResponse.success(res, result);
    } catch (error: any) {
      next(error);
    }
  }

  static async gradeScript(req: Request, res: Response, next: NextFunction) {
    const { studentName, subject, classLevel, questions, studentAnswers } = req.body || {};

    try {
      const result = await ExamService.gradeScript(
        studentName || "Student",
        subject || "General Study",
        classLevel || "Primary 1",
        questions || [],
        studentAnswers || []
      );
      return ApiResponse.success(res, result);
    } catch (error: any) {
      next(error);
    }
  }
}
