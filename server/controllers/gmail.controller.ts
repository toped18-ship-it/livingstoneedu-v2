import { Request, Response, NextFunction } from 'express';
import { GmailService } from '../services/gmail.service';
import { FirebaseService } from '../services/firebase.service';
import { ApiResponse } from '../utils/response';
import { Logger } from '../utils/logger';

export class GmailController {
  static async saveConnection(req: Request, res: Response, next: NextFunction) {
    const { accessToken, email } = req.body;

    try {
      Logger.info('GmailController', `Saving connection for ${email}`);
      await FirebaseService.updateConfig({
        gmailAccessToken: accessToken || '',
        connectedGmailEmail: email || '',
        lastConnectedTime: accessToken ? new Date().toISOString() : '',
      });

      return ApiResponse.success(res, { connectedGmailEmail: email || '' }, 'Gmail connection credentials saved successfully.');
    } catch (error: any) {
      next(error);
    }
  }

  static async notifySignup(req: Request, res: Response, next: NextFunction) {
    const { fullName, email, role, schoolName, otpCode } = req.body;

    if (!fullName || !email) {
      return ApiResponse.error(res, 'Full name and email are required.', 'Missing name or email parameters.', 400);
    }

    try {
      // 1. Log activity in Firebase
      await FirebaseService.logActivity({
        userName: fullName,
        userEmail: email,
        activityType: 'Registration',
        subject: 'Academic Portal',
        detail: `${role === 'teacher' ? 'Teacher' : 'Student'} registration completed. Email: ${email}. OTP: ${otpCode || 'N/A'}`,
      });

      // 2. Dispatch email alerts via Gmail service
      const result = await GmailService.notifySignup(
        fullName,
        email,
        role,
        schoolName,
        otpCode
      );

      return ApiResponse.success(res, result);
    } catch (error: any) {
      next(error);
    }
  }
}
