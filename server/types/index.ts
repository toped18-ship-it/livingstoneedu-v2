export interface AppConfig {
  brandName: string;
  appSubtitle: string;
  proPrice: string;
  supportGroupUrl: string;
  contactName: string;
  logoIcon?: string;
  logoColor?: string;
  logoText?: string;
  activeGateway?: string;
  isPaymentLive?: boolean;
  paystackPublicKey?: string;
  flutterwavePublicKey?: string;
  stripePublicKey?: string;
  gmailAccessToken?: string;
  connectedGmailEmail?: string;
  lastConnectedTime?: string;
  paystackLink?: string;
  flutterwaveLink?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  tuitionPrimary?: string;
  tuitionJss?: string;
  tuitionSss?: string;
  geminiApiKey?: string;
  curriculumSystemPrompt?: string;
  lessonSystemPrompt?: string;
  objectiveSystemPrompt?: string;
  theorySystemPrompt?: string;
  practicalSystemPrompt?: string;
  assignmentSystemPrompt?: string;
  projectSystemPrompt?: string;
  worksheetSystemPrompt?: string;
  gradingSystemPrompt?: string;
}

export interface Activity {
  id: string;
  userName: string;
  userEmail: string;
  activityType: string;
  subject: string;
  detail: string;
  timestamp: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  replyStatus: 'Pending' | 'Replied';
}

export interface AppDB {
  config: AppConfig;
  activities: Activity[];
  inquiries: Inquiry[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TheoryQuestion {
  question: string;
  modelAnswer: string;
  markingSchemeName: string;
}

export interface SubjectSpecificFocus {
  title: string;
  content: string;
  safeguardsOrMoralLesson: string;
}

export interface LessonNote {
  topic: string;
  detailedLessonNote: string;
  subtopic?: string;
  duration?: string;
  objectives?: string[];
  teachingMaterials?: string[];
  keyVocabulary?: string[];
  introduction?: string;
  teacherExplanationSteps?: string[];
  studentActivities?: string[];
  classExercises?: string[];
  homeworkAssignment?: string;
  quizQuestions?: QuizQuestion[];
  theoryQuestions?: TheoryQuestion[];
  subjectSpecificFocus?: SubjectSpecificFocus;
}

export interface CurriculumWeek {
  weekNum: number;
  topic: string;
  objectives: string[];
  keywords: string[];
}

export interface GenerateExamRequest {
  subject?: string;
  classLevel?: string;
  numQuestions?: string;
  term?: string;
  topic?: string;
}

export interface GradeScriptRequest {
  studentName?: string;
  subject?: string;
  classLevel?: string;
  questions?: Array<{
    question: string;
    options: string[];
    correctIndex: number;
  }>;
  studentAnswers?: number[];
}

export interface PushSubscriptionRecord {
  token: string;
  userId?: string;
  timestamp: string;
}
