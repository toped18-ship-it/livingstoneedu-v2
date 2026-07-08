import dotenv from 'dotenv';
import path from 'path';

// Ensure dotenv loads first
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  SERVICE_ACCOUNT_PATH: path.join(process.cwd(), 'firebase-service-account.json'),
  APPLET_CONFIG_PATH: path.join(process.cwd(), 'firebase-applet-config.json'),
  DB_PATH: path.join(process.cwd(), 'db.json'),
  DEFAULT_ALERT_EMAIL: 'livingtech@livingtech.name.ng',
};

export function validateEnv(): void {
  const missing: string[] = [];
  
  if (!ENV.GEMINI_API_KEY) {
    console.warn('[ENV Warning] GEMINI_API_KEY is not defined in process.env. It must be configured in settings.');
  }

  if (missing.length > 0) {
    console.error(`[ENV Error] Missing required environment variables: ${missing.join(', ')}`);
  } else {
    console.log('[ENV Info] Environment variable validation completed successfully.');
  }
}
