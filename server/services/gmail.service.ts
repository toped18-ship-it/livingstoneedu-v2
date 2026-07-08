import { FirebaseService } from './firebase.service';
import { Logger } from '../utils/logger';
import { ENV } from '../config/env';

export class GmailService {
  /**
   * Refreshes the Google OAuth token if refresh credentials exist.
   * Falls back to the current active accessToken.
   */
  static async refreshOAuthToken(): Promise<string | null> {
    const config = await FirebaseService.getConfig();
    const refreshToken = (config as any).gmailRefreshToken;
    const clientId = (config as any).gmailClientId;
    const clientSecret = (config as any).gmailClientSecret;
    
    if (!refreshToken || !clientId || !clientSecret) {
      Logger.info('GmailService', 'No OAuth refresh credentials found. Utilizing stored access token.');
      return config.gmailAccessToken || null;
    }
    
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Google OAuth refresh response status ${response.status}`);
      }
      
      const data: any = await response.json();
      if (data.access_token) {
        Logger.info('GmailService', 'Successfully auto-refreshed expired Gmail OAuth token.');
        await FirebaseService.updateConfig({
          gmailAccessToken: data.access_token,
          lastConnectedTime: new Date().toISOString()
        });
        return data.access_token;
      }
      return config.gmailAccessToken || null;
    } catch (error: any) {
      Logger.error('GmailService', 'Automatic Google OAuth token refresh failed', error);
      return config.gmailAccessToken || null;
    }
  }

  /**
   * Sends an email via Gmail API utilizing RFC 2822 formatting
   */
  static async sendEmail(to: string, subject: string, bodyText: string): Promise<boolean> {
    const token = await this.refreshOAuthToken();
    const config = await FirebaseService.getConfig();
    const connectedEmail = config.connectedGmailEmail;

    if (!token || !connectedEmail) {
      Logger.warn('GmailService', `Skipped automated Gmail dispatch to ${to}: No connected Gmail configuration found.`);
      return false;
    }

    try {
      const emailLines = [
        `To: ${to}`,
        `Subject: ${subject}`,
        `Content-Type: text/plain; charset="UTF-8"`,
        `MIME-Version: 1.0`,
        ``,
        bodyText
      ];
      const emailContent = emailLines.join('\r\n');
      
      // Safe base64url encoding
      const rawBase64 = Buffer.from(emailContent, 'utf-8')
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: rawBase64 })
      });

      if (!response.ok) {
        throw new Error(`Gmail Send API returned HTTP ${response.status}`);
      }

      Logger.info('GmailService', `Email dispatched successfully to ${to}`);
      return true;
    } catch (error: any) {
      Logger.error('GmailService', `Failed to send email to ${to}`, error);
      return false;
    }
  }

  /**
   * Sends a signup notification welcome email to student/teacher,
   * plus a backup notification to admin.
   */
  static async notifySignup(fullName: string, email: string, role: string, schoolName?: string, otpCode?: string): Promise<{
    success: boolean;
    message: string;
  }> {
    Logger.info('GmailService', `Processing registration welcome flow for: ${fullName} (${email})`);

    const alertEmail = ENV.DEFAULT_ALERT_EMAIL;
    const adminMailSubject = `🎓 [Firebase Alert] New User Signup: ${fullName}`;
    const adminMailBody = `Dear Support Team / Admin,

A new user has registered on the LivingstoneEdu LMS platform.

Details of New Account:
- Full Name: ${fullName}
- Registered Email: ${email}
- Profile Role: ${role === 'teacher' ? 'Teacher' : 'Student'}
- Academic School: ${schoolName || 'Livingstone Educational Academy'}
- OTP Verification Code: ${otpCode || 'N/A'}
- Timestamp: ${new Date().toUTCString()}

LMS Automated Gateway Service`;

    const userMailSubject = `Verify Your Account - Livingstone Educational Academy`;
    const userMailBody = `Dear ${fullName},

Welcome to Livingstone Educational Academy LMS! We are thrilled to partner with you on your educational journey.

To complete your registration and log in, please use the One-Time Passcode (OTP) below:

OTP CODE: ${otpCode || '123456'}

Your profile (${email}) has been successfully created and is pending activation.

If you did not make this request or need help, please contact us at ${alertEmail}.

Warm regards,
Livingstone Educational Academy Team`;

    // Send emails
    const userMailSent = await this.sendEmail(email, userMailSubject, userMailBody);
    await this.sendEmail(alertEmail, adminMailSubject, adminMailBody);

    if (userMailSent) {
      return {
        success: true,
        message: `Verification code sent to ${email}. Alert delivered to ${alertEmail}.`
      };
    } else {
      return {
        success: true,
        message: `Profile registered! (Simulation mode: OTP is ${otpCode || '123456'}). Connect Gmail in settings to send real emails.`
      };
    }
  }
}
