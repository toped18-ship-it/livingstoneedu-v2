import { getGeminiClient, GEMINI_MODEL } from '../config/gemini';
import { FirebaseService } from './firebase.service';
import { CURRICULUM_SYSTEM_PROMPT, getCurriculumUserPrompt } from '../prompts/curriculum.prompt';
import { safeParseJson } from '../utils/safeParseJson';
import { Logger } from '../utils/logger';
import { CurriculumWeek } from '../types';
import { generateLocalFallbackCurriculum } from '../utils/fallbackGenerator';

export class CurriculumService {
  /**
   * Generates a complete 12-week NERDC curriculum using Gemini 3.5 Flash
   */
  static async generateCurriculum(
    classLevel: string,
    subject: string,
    term: string
  ): Promise<CurriculumWeek[]> {
    Logger.info('CurriculumService', `Starting 12-week curriculum synthesis for Class=${classLevel}, Subject=${subject}, Term=${term}`);

    const config = await FirebaseService.getConfig();
    const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
    const ai = getGeminiClient(apiKey);

    const systemPrompt = config.curriculumSystemPrompt || CURRICULUM_SYSTEM_PROMPT;
    const userPrompt = getCurriculumUserPrompt(classLevel, subject, term);

    try {
      Logger.aiCall(GEMINI_MODEL, 'GENERATE_CURRICULUM', `Class: ${classLevel}, Subj: ${subject}`);

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [systemPrompt, userPrompt],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              weeks: {
                type: 'ARRAY',
                description: 'Must contain exactly 12 items representing Week 1 through 12 in order.',
                items: {
                  type: 'OBJECT',
                  properties: {
                    weekNum: { type: 'INTEGER' },
                    topic: { type: 'STRING' },
                    objectives: {
                      type: 'ARRAY',
                      items: { type: 'STRING' }
                    },
                    keywords: {
                      type: 'ARRAY',
                      items: { type: 'STRING' }
                    }
                  },
                  required: ['weekNum', 'topic', 'objectives', 'keywords']
                }
              }
            },
            required: ['weeks']
          }
        }
      });

      const responseText = response.text || '{"weeks": []}';
      const parsed = safeParseJson(responseText);
      const weeks: CurriculumWeek[] = parsed.weeks || [];

      if (weeks.length !== 12) {
        Logger.warn('CurriculumService', `AI returned ${weeks.length} weeks instead of 12. Adjusting list.`);
        return this.padOrTrimTo12Weeks(weeks, subject);
      }

      return weeks;
    } catch (error: any) {
      Logger.error('CurriculumService', 'Gemini curriculum generation failed. Serving high-fidelity standard fallbacks.', error);
      return generateLocalFallbackCurriculum(subject, classLevel, term);
    }
  }

  private static padOrTrimTo12Weeks(existing: CurriculumWeek[], subject: string): CurriculumWeek[] {
    const list: CurriculumWeek[] = [...existing];
    
    // Trim if greater than 12
    if (list.length > 12) {
      return list.slice(0, 12);
    }
    
    // Pad to exactly 12
    for (let i = list.length + 1; i <= 12; i++) {
      list.push({
        weekNum: i,
        topic: `${subject} Core Concepts - Series ${i}`,
        objectives: [
          `Analyze core foundational components in ${subject} for week ${i}`,
          `Solve and discuss practical theoretical evaluations`,
          `Apply learning outcomes to Nigerian domestic scenarios`
        ],
        keywords: [subject.toLowerCase(), `week ${i}`, 'nigerian education', 'concepts']
      });
    }

    // Sort to ensure weeks 1 to 12 are in order
    return list.sort((a, b) => a.weekNum - b.weekNum);
  }
}
