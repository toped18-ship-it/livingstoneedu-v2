import { Request, Response, NextFunction } from 'express';
import { FirebaseService } from '../services/firebase.service';
import { NotificationService } from '../services/notification.service';
import { ApiResponse } from '../utils/response';
import { Logger } from '../utils/logger';
import { getGeminiClient } from '../config/gemini';

export class AdminController {
  static async getSecureSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const config = await FirebaseService.getConfig();
      const key = config.geminiApiKey || '';
      const maskedKey = key ? `${key.substring(0, Math.min(6, key.length))}...${key.substring(Math.max(0, key.length - 4))}` : '';
      return res.json({ geminiApiKey: maskedKey, hasKey: !!key });
    } catch (error: any) {
      next(error);
    }
  }

  static async updateSecureSettings(req: Request, res: Response, next: NextFunction) {
    const { geminiApiKey } = req.body;

    try {
      const config = await FirebaseService.getConfig();
      const incomingKey = geminiApiKey ? geminiApiKey.trim() : '';
      const isNewKey = incomingKey && !incomingKey.includes('...');

      if (isNewKey) {
        // Perform an actual lightweight request to Google Gemini API to test key validity
        try {
          const client = getGeminiClient(incomingKey);
          await client.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: 'ping',
            config: {
              maxOutputTokens: 2,
            },
          });
        } catch (error: any) {
          Logger.error('ADMIN', `Gemini API Key verification failed: ${error.message || error}`);
          return res.status(400).json({
            success: false,
            message: `Gemini Verification failed: ${error.message || 'Check key validity or connection.'}`
          });
        }
      }
      
      if (isNewKey) {
        config.geminiApiKey = incomingKey;
        await FirebaseService.updateConfig(config);
      } else if (geminiApiKey === '') {
        config.geminiApiKey = '';
        await FirebaseService.updateConfig(config);
      }
      
      return res.json({ success: true, hasKey: !!config.geminiApiKey });
    } catch (error: any) {
      next(error);
    }
  }

  static async getConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const config = await FirebaseService.getConfig();
      return res.json(config);
    } catch (error: any) {
      next(error);
    }
  }

  static async updateConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await FirebaseService.updateConfig(req.body);
      return ApiResponse.success(res, { config: updated }, 'System configurations updated successfully.');
    } catch (error: any) {
      next(error);
    }
  }

  static async getActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await FirebaseService.getActivities();
      return res.json(list);
    } catch (error: any) {
      next(error);
    }
  }

  static async clearActivities(req: Request, res: Response, next: NextFunction) {
    try {
      await FirebaseService.clearActivities();
      return ApiResponse.success(res, {}, 'System activity logs cleared.');
    } catch (error: any) {
      next(error);
    }
  }

  static async logActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const activity = await FirebaseService.logActivity(req.body);
      return ApiResponse.success(res, { activity }, 'Activity logged successfully.');
    } catch (error: any) {
      next(error);
    }
  }

  static async getInquiries(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await FirebaseService.getInquiries();
      return res.json(list);
    } catch (error: any) {
      next(error);
    }
  }

  static async addInquiry(req: Request, res: Response, next: NextFunction) {
    try {
      const inquiry = await FirebaseService.addInquiry(req.body);
      return ApiResponse.success(res, { inquiry }, 'Help inquiry submitted successfully.');
    } catch (error: any) {
      next(error);
    }
  }

  static async replyInquiry(req: Request, res: Response, next: NextFunction) {
    const { id } = req.body;

    try {
      const ok = await FirebaseService.replyInquiry(id);
      if (ok) {
        return ApiResponse.success(res, {}, 'Inquiry reply action marked resolved.');
      } else {
        return ApiResponse.error(res, 'Inquiry not found', 'The requested inquiry could not be resolved.', 404);
      }
    } catch (error: any) {
      next(error);
    }
  }

  static async playgroundRun(req: Request, res: Response, next: NextFunction) {
    const { systemPrompt, userPrompt, model, temperature } = req.body;

    if (!userPrompt) {
      return ApiResponse.error(res, 'User prompt is required.', 'Missing prompt payload.', 400);
    }

    try {
      const config = await FirebaseService.getConfig();
      const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
      const ai = getGeminiClient(apiKey);

      const targetModel = model || 'gemini-3.5-flash';
      const targetTemp = temperature !== undefined ? Number(temperature) : 0.2;

      const startTime = Date.now();
      Logger.aiCall(targetModel, 'PLAYGROUND_RUN', 'Evaluating custom playground instructions');

      const response = await ai.models.generateContent({
        model: targetModel,
        contents: [systemPrompt || '', userPrompt],
        config: {
          temperature: targetTemp,
        }
      });

      const endTime = Date.now();
      const executionTimeMs = endTime - startTime;
      const textResult = response.text || '';
      
      const charCount = textResult.length;
      const estimatedTokens = Math.round(charCount / 4) + Math.round((systemPrompt || '').length / 4) + Math.round(userPrompt.length / 4);

      return res.json({
        success: true,
        text: textResult,
        metrics: {
          executionTimeMs,
          charCount,
          estimatedTokens,
          model: targetModel
        }
      });
    } catch (error: any) {
      next(error);
    }
  }

  static async sendPushNotification(req: Request, res: Response, next: NextFunction) {
    const { title, body } = req.body;

    if (!title || !body) {
      return ApiResponse.error(res, 'Title and body are required.', 'Missing request payloads.', 400);
    }

    try {
      const result = await NotificationService.sendMulticastPush(title, body);
      return res.json(result);
    } catch (error: any) {
      next(error);
    }
  }
}
