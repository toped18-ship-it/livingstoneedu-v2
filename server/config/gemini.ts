import { GoogleGenAI, Type } from '@google/genai';
import { ENV } from './env';

let aiClient: GoogleGenAI | null = null;

export const GEMINI_MODEL = 'gemini-3.5-flash';

export function getGeminiClient(customApiKey?: string): GoogleGenAI {
  if (aiClient && !customApiKey) {
    return aiClient;
  }

  const key = customApiKey || ENV.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please define it in process.env or settings.');
  }

  const client = new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  if (!customApiKey) {
    aiClient = client;
  }

  return client;
}

export { Type };
