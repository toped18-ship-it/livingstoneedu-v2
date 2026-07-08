import { getGeminiClient, GEMINI_MODEL } from '../config/gemini';
import { FirebaseService } from './firebase.service';
import * as examPrompts from '../prompts/exam.prompt';
import { safeParseJson } from '../utils/safeParseJson';
import { Logger } from '../utils/logger';

export class ExamService {
  private static async getAIInstance() {
    const config = await FirebaseService.getConfig();
    const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
    return { ai: getGeminiClient(apiKey), config };
  }

  static async generateObjective(
    subject: string,
    classLevel: string,
    term: string,
    count: number,
    topic: string
  ): Promise<any> {
    Logger.info('ExamService', `Generating Objectives: Subject=${subject}, Class=${classLevel}, Count=${count}, Topic=${topic}`);
    try {
      const { ai, config } = await this.getAIInstance();
      const systemPrompt = config.objectiveSystemPrompt || examPrompts.OBJECTIVE_SYSTEM_PROMPT;
      const userPrompt = examPrompts.getObjectiveUserPrompt(subject, classLevel, term, count, topic);

      Logger.aiCall(GEMINI_MODEL, 'GEN_OBJECTIVE', topic);
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [systemPrompt, userPrompt],
        config: {
          responseMimeType: 'application/json',
          responseSchema: examPrompts.OBJECTIVE_SCHEMA
        }
      });

      return safeParseJson(response.text || '{}');
    } catch (error: any) {
      Logger.error('ExamService', 'AI Objective question generation failed. Invoking standard fallback.', error);
      
      const fallbackQuestions = [];
      for (let i = 0; i < count; i++) {
        fallbackQuestions.push({
          question: `Regarding ${topic || subject}, which of the following is a fundamental NERDC-aligned concept? (Question ${i + 1})`,
          options: [
            "Primary concept definition aligned with West African syllabus rules",
            "Alternative practical choice often tested in school examinations",
            "Syllabus-aligned answer containing helpful everyday examples",
            "Scientific or vocational illustration related to local communities"
          ],
          correctIndex: i % 4,
          explanation: `This is a high-fidelity local fallback question explaining ${subject} principles.`
        });
      }
      return { questions: fallbackQuestions, isFallback: true };
    }
  }

  static async generateTheory(
    subject: string,
    classLevel: string,
    term: string,
    count: number,
    topic: string
  ): Promise<any> {
    Logger.info('ExamService', `Generating Theory Questions: Subject=${subject}, Class=${classLevel}, Count=${count}, Topic=${topic}`);
    try {
      const { ai, config } = await this.getAIInstance();
      const systemPrompt = config.theorySystemPrompt || examPrompts.THEORY_SYSTEM_PROMPT;
      const userPrompt = examPrompts.getTheoryUserPrompt(subject, classLevel, term, count, topic);

      Logger.aiCall(GEMINI_MODEL, 'GEN_THEORY', topic);
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [systemPrompt, userPrompt],
        config: {
          responseMimeType: 'application/json',
          responseSchema: examPrompts.THEORY_SCHEMA
        }
      });

      return safeParseJson(response.text || '{}');
    } catch (error: any) {
      Logger.error('ExamService', 'AI Theory question generation failed. Invoking standard fallback.', error);
      
      const fallbackQuestions = [];
      for (let i = 0; i < count; i++) {
        fallbackQuestions.push({
          question: `Critically explain the primary concept of ${topic || subject} and its direct applications under West African educational frameworks. (Question ${i + 1})`,
          modelAnswer: `The topic of ${topic || subject} is a vital element of ${subject}. Students must define the terms accurately, identify at least three primary elements, and outline their application in local Nigerian contexts (e.g. agricultural tools, market trade, or community infrastructure).`,
          markingSchemeName: "Award 5 marks for correct definition and 5 marks for detailed examples."
        });
      }
      return { questions: fallbackQuestions, isFallback: true };
    }
  }

  static async generatePractical(
    subject: string,
    classLevel: string,
    term: string,
    count: number,
    topic: string
  ): Promise<any> {
    Logger.info('ExamService', `Generating Practicals: Subject=${subject}, Class=${classLevel}, Count=${count}, Topic=${topic}`);
    try {
      const { ai, config } = await this.getAIInstance();
      const systemPrompt = config.practicalSystemPrompt || examPrompts.PRACTICAL_SYSTEM_PROMPT;
      const userPrompt = examPrompts.getPracticalUserPrompt(subject, classLevel, term, count, topic);

      Logger.aiCall(GEMINI_MODEL, 'GEN_PRACTICAL', topic);
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [systemPrompt, userPrompt],
        config: {
          responseMimeType: 'application/json',
          responseSchema: examPrompts.PRACTICAL_SCHEMA
        }
      });

      return safeParseJson(response.text || '{}');
    } catch (error: any) {
      Logger.error('ExamService', 'AI Practical generation failed. Invoking standard fallback.', error);
      
      return {
        practicals: [{
          aim: `To investigate and observe the practical applications of ${topic || subject} in a classroom setting.`,
          apparatus: ["NERDC handbook", "Measuring tools", "Writing materials", "Whiteboard illustrations"],
          procedure: [
            "Gather all materials and prepare the workstation safely.",
            `Formulate a basic model or calculation related to ${topic}.`,
            "Document the results step-by-step and compare them with standard syllabus definitions."
          ],
          observations: "Students should observe standard outcomes and record logical deductions.",
          conclusion: `The practical exercise confirms the fundamental theoretical rules of ${topic || subject}.`,
          questions: [
            "What safety precaution is critical during this experiment?",
            `State one way the results of this experiment can be applied in everyday life in Nigeria.`
          ]
        }],
        isFallback: true
      };
    }
  }

  static async generateAssignment(
    subject: string,
    classLevel: string,
    term: string,
    count: number,
    topic: string
  ): Promise<any> {
    Logger.info('ExamService', `Generating Assignments: Subject=${subject}, Class=${classLevel}, Count=${count}, Topic=${topic}`);
    try {
      const { ai, config } = await this.getAIInstance();
      const systemPrompt = config.assignmentSystemPrompt || examPrompts.ASSIGNMENT_SYSTEM_PROMPT;
      const userPrompt = examPrompts.getAssignmentUserPrompt(subject, classLevel, term, count, topic);

      Logger.aiCall(GEMINI_MODEL, 'GEN_ASSIGNMENT', topic);
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [systemPrompt, userPrompt],
        config: {
          responseMimeType: 'application/json',
          responseSchema: examPrompts.ASSIGNMENT_SCHEMA
        }
      });

      return safeParseJson(response.text || '{}');
    } catch (error: any) {
      Logger.error('ExamService', 'AI Assignment generation failed. Invoking standard fallback.', error);
      
      const fallbackAssignments = [];
      for (let i = 0; i < count; i++) {
        fallbackAssignments.push({
          task: `Consolidation study and exercises on ${topic || subject} (Assignment ${i + 1})`,
          instructions: `Read chapter 4 of your ${subject} textbook. Answer all practice problems on ${topic} individually. Submit a 150-word report explaining the key rules.`,
          dueDate: "Next academic lecture session (one week duration)",
          submissionGuidelines: "Write your answers neatly in your homework exercise book. Submit to the class teacher before 8:00 AM."
        });
      }
      return { assignments: fallbackAssignments, isFallback: true };
    }
  }

  static async generateProject(
    subject: string,
    classLevel: string,
    term: string,
    count: number,
    topic: string
  ): Promise<any> {
    Logger.info('ExamService', `Generating Projects: Subject=${subject}, Class=${classLevel}, Count=${count}, Topic=${topic}`);
    try {
      const { ai, config } = await this.getAIInstance();
      const systemPrompt = config.projectSystemPrompt || examPrompts.PROJECT_SYSTEM_PROMPT;
      const userPrompt = examPrompts.getProjectUserPrompt(subject, classLevel, term, count, topic);

      Logger.aiCall(GEMINI_MODEL, 'GEN_PROJECT', topic);
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [systemPrompt, userPrompt],
        config: {
          responseMimeType: 'application/json',
          responseSchema: examPrompts.PROJECT_SCHEMA
        }
      });

      return safeParseJson(response.text || '{}');
    } catch (error: any) {
      Logger.error('ExamService', 'AI Project generation failed. Invoking standard fallback.', error);
      
      const fallbackProjects = [];
      for (let i = 0; i < count; i++) {
        fallbackProjects.push({
          title: `Community Survey and Model of ${topic || subject} (Project ${i + 1})`,
          background: `This project is designed to help students connect theoretical principles of ${topic} with actual observations in their local community or household.`,
          milestones: [
            "Form groups of 3 to 5 students and allocate roles.",
            "Conduct a simple study or gather local examples of the topic.",
            "Compile the findings into a small illustrative poster or written workbook."
          ],
          deliverables: [
            "A structured group project poster",
            "A 5-minute oral class presentation on their practical observations"
          ],
          rubric: "Graded out of 20 marks: 5 marks for Collaboration, 5 marks for Research Accuracy, 5 marks for Presentation Quality, and 5 marks for local relevance."
        });
      }
      return { projects: fallbackProjects, isFallback: true };
    }
  }

  static async generateWorksheet(
    subject: string,
    classLevel: string,
    term: string,
    count: number,
    topic: string
  ): Promise<any> {
    Logger.info('ExamService', `Generating Worksheet: Subject=${subject}, Class=${classLevel}, Count=${count}, Topic=${topic}`);
    try {
      const { ai, config } = await this.getAIInstance();
      const systemPrompt = config.worksheetSystemPrompt || examPrompts.WORKSHEET_SYSTEM_PROMPT;
      const userPrompt = examPrompts.getWorksheetUserPrompt(subject, classLevel, term, count, topic);

      Logger.aiCall(GEMINI_MODEL, 'GEN_WORKSHEET', topic);
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [systemPrompt, userPrompt],
        config: {
          responseMimeType: 'application/json',
          responseSchema: examPrompts.WORKSHEET_SCHEMA
        }
      });

      return safeParseJson(response.text || '{}');
    } catch (error: any) {
      Logger.error('ExamService', 'AI Worksheet generation failed. Invoking standard fallback.', error);
      
      return {
        worksheetTitle: `${subject} Classroom Activity Worksheet: ${topic}`,
        instructions: `Please read each question carefully and fill in the spaces provided below. Write legibly and show all working steps where mathematical computations are required.`,
        sections: [
          {
            sectionTitle: "Section A: Concept Recall and Definition",
            items: [
              `State the complete definition of '${topic}' and list two main features.`,
              `Why is the study of ${topic} important under the standard curriculum guidelines?`
            ]
          },
          {
            sectionTitle: "Section B: True or False Statements",
            items: [
              `True or False: The principles of ${topic} are only applicable in science subjects.`,
              `True or False: Standard NERDC guidelines recommend studying this topic before end of terms.`
            ]
          }
        ],
        isFallback: true
      };
    }
  }

  static async gradeScript(
    studentName: string,
    subject: string,
    classLevel: string,
    questions: any[],
    studentAnswers: number[]
  ): Promise<any> {
    Logger.info('ExamService', `Grading exam script for Student=${studentName}, Subject=${subject}, Class=${classLevel}`);
    try {
      const { ai, config } = await this.getAIInstance();
      const systemPrompt = config.gradingSystemPrompt || examPrompts.GRADING_SYSTEM_PROMPT;
      const userPrompt = examPrompts.getGradingUserPrompt(studentName, subject, classLevel, questions, studentAnswers);

      Logger.aiCall(GEMINI_MODEL, 'GRADE_SCRIPT', studentName);
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [systemPrompt, userPrompt],
        config: {
          responseMimeType: 'application/json',
          responseSchema: examPrompts.GRADING_SCHEMA
        }
      });

      return safeParseJson(response.text || '{}');
    } catch (error: any) {
      Logger.error('ExamService', 'AI grading failed, running local algorithmic grading rules', error);
      
      let correctCount = 0;
      questions.forEach((q: any, idx: number) => {
        if (Number(studentAnswers[idx]) === Number(q.correctIndex)) {
          correctCount++;
        }
      });

      const pct = Math.round((correctCount / Math.max(1, questions.length)) * 100);
      const caScore = Math.round((pct / 100) * 40);
      const examScore = Math.round((pct / 100) * 60);

      let letterGrade = 'F9';
      let teacherRemark = 'A poor attempt. Major improvement and continuous revision recommended.';
      if (pct >= 85) {
        letterGrade = 'A1';
        teacherRemark = 'Outstanding performance! Keep maintaining this clean academic standard.';
      } else if (pct >= 75) {
        letterGrade = 'B2';
        teacherRemark = 'Very good work. Proud of your continuous attention to detail.';
      } else if (pct >= 65) {
        letterGrade = 'C4';
        teacherRemark = 'A good effort. Continue revising your chapters to score higher.';
      } else if (pct >= 50) {
        letterGrade = 'C6';
        teacherRemark = 'Pass. Focus more on scientific and analytical principles.';
      } else if (pct >= 40) {
        letterGrade = 'E8';
        teacherRemark = 'Weak credit pass. Extensive revision of homework chapters recommended.';
      }

      return {
        scoreOutOf100: pct,
        caScore,
        examScore,
        letterGrade,
        teacherRemark,
        aiStrengths: [`Demonstrated general knowledge in ${subject} topics`, 'Attempted all multiple-choice units completely'],
        aiWeaknesses: ['Needs to pay continuous attention to fundamental formulas', 'Revise weekly practical test exercises'],
        isFallback: true
      };
    }
  }
}
