import { Type } from '../config/gemini';

// ------------------------------
// OBJECTIVE QUESTIONS
// ------------------------------
export const OBJECTIVE_SYSTEM_PROMPT = `You are an expert exam paper grader and syllabus director in West Africa (WAEC/NECO team).
Generate high-fidelity, NERDC-aligned Multiple-Choice (Objective) questions appropriate for the specified student level.
Every question must contain exactly 4 options. Include active local Nigerian names, names of cities, Naira prices, and everyday real-world examples where applicable.
Return a valid JSON object matches the requested schema.`;

export const OBJECTIVE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    questions: {
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
    }
  },
  required: ['questions']
};

export function getObjectiveUserPrompt(subject: string, classLevel: string, term: string, count: number, topic: string): string {
  return `Generate exactly ${count} multiple-choice (objective) questions for ${classLevel}, Subject: ${subject}, Term: ${term}, Topic: "${topic}".`;
}

// ------------------------------
// THEORY QUESTIONS
// ------------------------------
export const THEORY_SYSTEM_PROMPT = `You are a Senior pedagogy specialist in Nigeria.
Generate in-depth Essay/Theory examination questions aligned with official NERDC syllabus requirements.
Each theory question must contain a clear, descriptive problem statement, a complete, step-by-step model answer, and a strict marking scheme index.
Include local Nigerian contextual settings where applicable.
Return a valid JSON object matching the requested schema.`;

export const THEORY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    questions: {
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
    }
  },
  required: ['questions']
};

export function getTheoryUserPrompt(subject: string, classLevel: string, term: string, count: number, topic: string): string {
  return `Generate exactly ${count} detailed Essay/Theory examination questions for ${classLevel}, Subject: ${subject}, Term: ${term}, Topic: "${topic}".`;
}

// ------------------------------
// PRACTICAL QUESTIONS
// ------------------------------
export const PRACTICAL_SYSTEM_PROMPT = `You are an experienced laboratory instructor and scientific education consultant in Nigeria.
Generate hands-on Laboratory / Practical Examination Tasks based on NERDC standards.
Each task must outline the Experiment Aim, a detailed list of Apparatus / Materials needed, step-by-step Procedures, expected Observations / Calculations, a logical Conclusion, and follow-up viva questions.
Focus on safety precautions and practical real-world relevance to Nigeria.
Return a valid JSON object matching the requested schema.`;

export const PRACTICAL_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    practicals: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          aim: { type: Type.STRING },
          apparatus: { type: Type.ARRAY, items: { type: Type.STRING } },
          procedure: { type: Type.ARRAY, items: { type: Type.STRING } },
          observations: { type: Type.STRING },
          conclusion: { type: Type.STRING },
          questions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['aim', 'apparatus', 'procedure', 'observations', 'conclusion', 'questions']
      }
    }
  },
  required: ['practicals']
};

export function getPracticalUserPrompt(subject: string, classLevel: string, term: string, count: number, topic: string): string {
  return `Generate exactly ${count} Laboratory/Practical Tasks for ${classLevel}, Subject: ${subject}, Term: ${term}, Topic: "${topic}".`;
}

// ------------------------------
// ASSIGNMENT QUESTIONS
// ------------------------------
export const ASSIGNMENT_SYSTEM_PROMPT = `You are a dedicated primary and secondary school educator in Nigeria.
Generate homework and take-home Assignments aligned with NERDC standards.
Assignments should challenge the student to read ahead or consolidate learned material.
Each assignment must have a clear Task Description, detailed Instructions, recommended Submission Guidelines, and expected grading criteria.
Return a valid JSON object matching the requested schema.`;

export const ASSIGNMENT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    assignments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          task: { type: Type.STRING },
          instructions: { type: Type.STRING },
          dueDate: { type: Type.STRING },
          submissionGuidelines: { type: Type.STRING }
        },
        required: ['task', 'instructions', 'dueDate', 'submissionGuidelines']
      }
    }
  },
  required: ['assignments']
};

export function getAssignmentUserPrompt(subject: string, classLevel: string, term: string, count: number, topic: string): string {
  return `Generate exactly ${count} take-home Assignment Tasks for ${classLevel}, Subject: ${subject}, Term: ${term}, Topic: "${topic}".`;
}

// ------------------------------
// PROJECT QUESTIONS
// ------------------------------
export const PROJECT_SYSTEM_PROMPT = `You are a Senior Project-Based Learning specialist.
Generate comprehensive, student-led academic projects that align with the NERDC syllabus.
Projects should encourage teamwork, community investigation, or creative engineering/writing, with standard West African names and scenarios.
Each project must list the Project Title, a solid Background context, a list of critical Milestones, required student Deliverables, and a standard grading Rubric.
Return a valid JSON object matching the requested schema.`;

export const PROJECT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          background: { type: Type.STRING },
          milestones: { type: Type.ARRAY, items: { type: Type.STRING } },
          deliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
          rubric: { type: Type.STRING }
        },
        required: ['title', 'background', 'milestones', 'deliverables', 'rubric']
      }
    }
  },
  required: ['projects']
};

export function getProjectUserPrompt(subject: string, classLevel: string, term: string, count: number, topic: string): string {
  return `Generate exactly ${count} student-led Projects for ${classLevel}, Subject: ${subject}, Term: ${term}, Topic: "${topic}".`;
}

// ------------------------------
// WORKSHEET QUESTIONS
// ------------------------------
export const WORKSHEET_SYSTEM_PROMPT = `You are a skilled lesson planner and worksheet designer in Nigeria.
Generate modular Classroom Worksheets for student self-study, lesson revision, or homework.
Each worksheet must contain a title, complete general instructions, and multiple sections (e.g., Section A: Key Definitions, Section B: True/False, Section C: Solve the problems) containing specific questions/tasks.
Return a valid JSON object matching the requested schema.`;

export const WORKSHEET_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    worksheetTitle: { type: Type.STRING },
    instructions: { type: Type.STRING },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sectionTitle: { type: Type.STRING },
          items: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['sectionTitle', 'items']
      }
    }
  },
  required: ['worksheetTitle', 'instructions', 'sections']
};

export function getWorksheetUserPrompt(subject: string, classLevel: string, term: string, count: number, topic: string): string {
  return `Generate a comprehensive multi-section Classroom Worksheet with exactly ${count} items/tasks total for ${classLevel}, Subject: ${subject}, Term: ${term}, Topic: "${topic}".`;
}

// ------------------------------
// GRADING PROMPT
// ------------------------------
export const GRADING_SYSTEM_PROMPT = `You are an expert exam paper grader in West Africa (WAEC/NECO team).
Grade the student script below and provide a constructive grading report in strict JSON format.`;

export const GRADING_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    scoreOutOf100: { type: Type.INTEGER },
    caScore: { type: Type.INTEGER },
    examScore: { type: Type.INTEGER },
    letterGrade: { type: Type.STRING },
    teacherRemark: { type: Type.STRING },
    aiStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    aiWeaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['scoreOutOf100', 'caScore', 'examScore', 'letterGrade', 'teacherRemark', 'aiStrengths', 'aiWeaknesses']
};

export function getGradingUserPrompt(studentName: string, subject: string, classLevel: string, questions: any[], studentAnswers: number[]): string {
  return `Grade the student script below.
Student: ${studentName}
Class Level: ${classLevel}
Subject: ${subject}

Exam Questions & Student Answers:
${JSON.stringify(questions.map((q: any, idx: number) => ({
    number: idx + 1,
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    studentAnswerIndex: studentAnswers[idx]
  })), null, 2)}

Provide scoring and a constructive report.`;
}
