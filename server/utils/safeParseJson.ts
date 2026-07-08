import { jsonrepair } from 'jsonrepair';

export function safeParseJson(text: string): any {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch (err: any) {
    console.warn("[JSON Parse warning] Standard JSON.parse failed. Attempting jsonrepair...", err.message || err);
    try {
      const repaired = jsonrepair(trimmed);
      return JSON.parse(repaired);
    } catch (repairErr: any) {
      console.error("[JSON Parse Error] jsonrepair also failed.", repairErr.message || repairErr);
      throw err;
    }
  }
}
