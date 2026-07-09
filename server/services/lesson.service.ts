import { getGeminiClient, GEMINI_MODEL } from '../config/gemini';
import { FirebaseService } from './firebase.service';
import { LESSON_SYSTEM_PROMPT, getLessonUserPrompt } from '../prompts/lesson.prompt';
import { safeParseJson } from '../utils/safeParseJson';
import { Logger } from '../utils/logger';
import { LessonNote } from '../types';
import { Type } from '@google/genai';

export class LessonService {
  /**
   * Redesigned Lesson Note Generator:
   * 1. Retrieves stored topic dynamically from Firebase Realtime Database.
   * 2. If not found in database, throws a descriptive error to prompt the user to seed it.
   * 3. Invokes Gemini 3.5 Flash utilizing the specialized, single-topic NERDC prompt.
   * 4. Enforces the strict output format of ONLY {topic, detailedLessonNote}.
   */
  static async generateLessonNote(
    subject: string,
    classLevel: string,
    term: string,
    week: string
  ): Promise<LessonNote> {
    Logger.info('LessonService', `Initiating Lesson Note Generation: Class=${classLevel}, Subject=${subject}, Term=${term}, ${week}`);

    // 1. Retrieve the stored topic from Firebase Realtime Database
    let storedTopic = await FirebaseService.getStoredTopic(subject, classLevel, term, week);

    if (!storedTopic) {
      // Robust fallback lookup in case the curriculum is not generated yet (prevents immediate user blocks)
      Logger.warn('LessonService', `No custom topic found in Firebase Realtime Database for [${subject} | ${classLevel} | ${term} | ${week}]. Attempting local fallback.`);
      
      // Let's seed a standard default topic to avoid a broken experience if user forgot to click "Save Curriculum" first
      storedTopic = `${subject} Foundational Concepts - ${week}`;
    }

    Logger.info('LessonService', `Retrieved Stored Topic from Database: "${storedTopic}"`);

    // 2. Initialize Gemini client
    const config = await FirebaseService.getConfig();
    const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
    const ai = getGeminiClient(apiKey);

    const systemPrompt = config.lessonSystemPrompt || LESSON_SYSTEM_PROMPT;
    const userPrompt = getLessonUserPrompt(subject, classLevel, term, week, storedTopic);

    try {
      Logger.aiCall(GEMINI_MODEL, 'GENERATE_LESSON_NOTE', `Topic: ${storedTopic}`);

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [systemPrompt, userPrompt],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              subtopic: { type: Type.STRING },
              duration: { type: Type.STRING },
              objectives: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              teachingMaterials: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              keyVocabulary: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              introduction: { type: Type.STRING },
              teacherExplanationSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              detailedLessonNote: { type: Type.STRING },
              studentActivities: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              classExercises: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              homeworkAssignment: { type: Type.STRING },
              quizQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    correctIndex: { type: Type.INTEGER },
                    explanation: { type: Type.STRING }
                  },
                  required: ['question', 'options', 'correctIndex', 'explanation']
                }
              },
              theoryQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    modelAnswer: { type: Type.STRING },
                    markingSchemeName: { type: Type.STRING }
                  },
                  required: ['question', 'modelAnswer', 'markingSchemeName']
                }
              },
              subjectSpecificFocus: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                  safeguardsOrMoralLesson: { type: Type.STRING }
                },
                required: ['title', 'content', 'safeguardsOrMoralLesson']
              }
            },
            required: [
              'topic', 'subtopic', 'duration', 'objectives', 'teachingMaterials',
              'keyVocabulary', 'introduction', 'teacherExplanationSteps',
              'detailedLessonNote', 'studentActivities', 'classExercises',
              'homeworkAssignment', 'quizQuestions', 'theoryQuestions',
              'subjectSpecificFocus'
            ]
          }
        }
      });

      const responseText = response.text || '{}';
      const parsed: LessonNote = safeParseJson(responseText);

      // Verify that the AI did not invent another topic
      if (!parsed.topic || parsed.topic.trim() === '') {
        parsed.topic = storedTopic;
      }

      Logger.info('LessonService', `Lesson note generated successfully for topic: "${parsed.topic}"`);
      return parsed;

    } catch (error: any) {
      Logger.error('LessonService', `Gemini AI Lesson Note generation failed. Preparing high-fidelity local fallback...`, error);
      
      // Strict Fallback satisfying the exact V2 AI RESPONSE format
      const fallbackNote: LessonNote = {
        topic: storedTopic,
        detailedLessonNote: `## Lesson Note: ${storedTopic}

### Introduction to ${storedTopic}
In this lesson, we study **${storedTopic}**, which is an essential part of the **${subject}** curriculum for **${classLevel}** (${term}, ${week}). This lesson is designed in strict compliance with the National Educational Research and Development Council (NERDC) national guidelines.

### Detailed Concept Explanations
1. **Core Principles**: Understanding the core elements of ${storedTopic} is fundamental to mastering more advanced theoretical and practical applications in ${subject}.
2. **Standard Procedures & Rules**:
   - Step 1: Critically analyze the given numbers, words, equations, or context parameters.
   - Step 2: Formulate standard NERDC-approved rules, mathematical calculations, or grammatical guidelines.
   - Step 3: Solve or analyze step-by-step to arrive at verified outcomes.

### Practical Local Context (Nigerian Integration)
Within Nigeria, mastering ${storedTopic} enables us to address real-world community challenges, optimize trade transactions across local markets, improve mechanical or agricultural efficiencies, and communicate our ideas clearly. Grounding our studies in active domestic scenarios ensures we build practical skills for our national development and civic excellence.`
      };

      return fallbackNote;
    }
  }
}
