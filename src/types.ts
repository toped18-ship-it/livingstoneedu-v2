/**
 * TypeScript types for the Nigerian School Learning Hub
 */

export type ClassLevel = 
  | 'Primary 1' | 'Primary 2' | 'Primary 3' | 'Primary 4' | 'Primary 5' | 'Primary 6'
  | 'JSS 1' | 'JSS 2' | 'JSS 3'
  | 'SS 1' | 'SS 2' | 'SS 3';

export interface User {
  id: string;
  fullName: string;
  email: string;
  classLevel?: ClassLevel;
  avatarSeed: string; // For generating stylish initial avatars
  joinDate: string;
  selectedSubjectIds?: string[];
  role?: 'student' | 'teacher' | 'admin';
  schoolName?: string;
  isPro?: boolean;
  trialSecondsRemaining?: number;
  lastTrialAccessDate?: string;
}

export interface TeacherStudent {
  id: string;
  name: string;
  email: string;
  termScores: {
    [subjectId: string]: {
      caScore: number; // continuous assessment index (0 to 40)
      examScore: number; // examination index (0 to 60)
      remark?: string;
    };
  };
  attendance: {
    [weekNum: number]: boolean;
  };
}

export interface TeacherClassSetup {
  teacherId: string;
  classLevel: ClassLevel;
  students: TeacherStudent[];
}

export interface AIExam {
  id: string;
  title: string;
  subjectId: string;
  classLevel: ClassLevel;
  numQuestions: number;
  questions: QuizQuestion[];
  createdAt: string;
}

export type TermNumber = 1 | 2 | 3; // 1st, 2nd, 3rd term
export type WeekNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface Subject {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  category: 'Science' | 'Arts' | 'Commercial' | 'Core' | 'Vocational';
  description: string;
}

export interface LessonProgress {
  userId: string;
  classLevel: ClassLevel;
  subjectId: string;
  termNum: TermNumber;
  weekNum: WeekNumber;
  completed: boolean;
  score?: number; // Highest quiz score if taken
  lastAccessed: string;
}

export interface SubjectProgress {
  subjectId: string;
  completedCount: number;
  totalWeeks: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonContent {
  title: string;
  objectives: string[];
  body: string[]; // List of paragraphs/sections
  keyPoints: string[];
  quiz: QuizQuestion[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  replyStatus: 'Pending' | 'Replied';
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Curriculum' | 'Billing' | 'Technical';
}
