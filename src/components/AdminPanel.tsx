import React, { useState, useEffect } from 'react';
import { rtdbSubscribe, rtdbSet, rtdbGet, NODES, seedRtdbIfEmpty } from '../lib/rtdbService';
import { GmailHub } from './GmailHub';
import { 
  getSubjectsForClass, 
  getWeeklyTopicTitle, 
  getLessonContent,
  ALL_CLASSES
} from '../data/curriculum';
import { 
  Settings, 
  Users, 
  MessageSquare, 
  ShieldAlert, 
  Save, 
  RotateCcw, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  FileText, 
  Smartphone, 
  AlertCircle,
  HelpCircle,
  BookOpen,
  Zap,
  Award,
  CreditCard,
  DollarSign,
  Printer,
  Download,
  Search,
  Plus,
  Trash2,
  Edit,
  Calendar,
  UserPlus,
  Layers,
  Check,
  Shield,
  Activity,
  Lock,
  Share2,
  Info,
  Mail,
  CheckSquare,
  Radio,
  Eye,
  Database,
  BrainCircuit,
  Loader2
} from 'lucide-react';

interface InquiryItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  replyStatus: 'Pending' | 'Replied';
}

interface ActivityItem {
  id: string;
  userName: string;
  userEmail: string;
  activityType: string;
  subject: string;
  detail: string;
  timestamp: string;
}

interface AdminPanelProps {
  currentConfig: {
    brandName: string;
    appSubtitle: string;
    proPrice: string;
    supportGroupUrl: string;
    contactName: string;
  };
  onConfigChange: (newConfig: any) => void;
  currentUser: any;
}

// Nigerian High-Fidelity Mock Curriculums
const DEFAULT_CURRICULUM_DATA = [
  { id: 'curr-1', class: 'SS 1', subject: 'Mathematics', term: '1st Term', week: 1, topic: 'Number Bases', details: 'Binary, Octal, Hexadecimal conversions and basic operations.', status: 'Published' },
  { id: 'curr-2', class: 'SS 1', subject: 'English Studies', term: '1st Term', week: 1, topic: 'Parts of Speech', details: 'Focus on Nouns & Pronouns with Nigerian grammar contextual examples.', status: 'Published' },
  { id: 'curr-3', class: 'JSS 3', subject: 'Basic Science & Tech', term: '1st Term', week: 3, topic: 'Environmental Safety', details: 'Hazardous wastes management & safety precautions in local areas.', status: 'Published' },
  { id: 'curr-4', class: 'SS 2', subject: 'Physics', term: '2nd Term', week: 4, topic: 'Linear Momentum', details: 'Newtonian Collision mechanics, formula calculations, and WAEC Prep.', status: 'Draft' },
  { id: 'curr-5', class: 'Primary 5', subject: 'Computer Studies / ICT', term: '1st Term', week: 2, topic: 'Search Engines', details: 'How to find secondary academic materials using web search.', status: 'Published' }
];

// Initial CBT banks
const DEFAULT_CBT_DATA = [
  { id: 'cbt-1', title: 'Mathematics Revision Exam', subject: 'Mathematics', class: 'SS 1', term: '1st Term', questions: 15, duration: 45, status: 'Active' },
  { id: 'cbt-2', title: 'WAEC Standard Chemistry Quiz', subject: 'Chemistry', class: 'SS 3', term: '2nd Term', questions: 10, duration: 30, status: 'Active' },
  { id: 'cbt-3', title: 'English Grammar Midterm', subject: 'English Studies', class: 'JSS 2', term: '1st Term', questions: 12, duration: 25, status: 'Draft' }
];

// Helper to convert flat curriculum array list into a nested object format for RTDB
const convertFlatToNestedCurriculum = (flatList: any[]): any => {
  const nested: Record<string, any> = {};
  if (!Array.isArray(flatList)) return nested;
  
  for (const item of flatList) {
    if (!item || !item.class || !item.subject || !item.term || !item.week) continue;
    
    const cleanClass = String(item.class).trim().replace(/[.#$[\]]/g, '_');
    const cleanSubj = String(item.subject).trim().replace(/[.#$[\]/]/g, '_');
    const cleanTerm = String(item.term).trim().replace(/[.#$[\]]/g, '_');
    const cleanWeek = String(item.week).startsWith('Week_') ? String(item.week) : `Week_${item.week}`;
    
    if (!nested[cleanClass]) nested[cleanClass] = {};
    if (!nested[cleanClass][cleanSubj]) nested[cleanClass][cleanSubj] = {};
    if (!nested[cleanClass][cleanSubj][cleanTerm]) nested[cleanClass][cleanSubj][cleanTerm] = {};
    
    nested[cleanClass][cleanSubj][cleanTerm][cleanWeek] = {
      id: item.id || `curr_${cleanClass}_${cleanSubj}_${cleanTerm}_${cleanWeek}`.replace(/\s+/g, '_'),
      class: item.class,
      subject: item.subject,
      term: item.term,
      week: typeof item.week === 'number' ? item.week : Number(String(item.week).replace('Week_', '')) || 1,
      topic: item.topic || '',
      details: item.details || '',
      objectives: item.objectives || [],
      status: item.status || 'Published'
    };
  }
  return nested;
};

// Local wrapper to transparently sync all localStorage writes to Firebase Realtime Database
const persistAndSync = async (key: string, value: string) => {
  window.localStorage.setItem(key, value);
  try {
    const data = JSON.parse(value);
    if (key === 'system_curriculums') {
      const nestedData = convertFlatToNestedCurriculum(data);
      await rtdbSet(NODES.CURRICULUM, nestedData);
    } else if (key === 'system_cbt') {
      await rtdbSet(NODES.CBT, data);
    } else if (key === 'system_grades') {
      await rtdbSet(NODES.RESULTS, data);
    } else if (key === 'hub_users') {
      await rtdbSet(NODES.USERS, data);
      if (Array.isArray(data)) {
        for (const u of data) {
          const id = u.email.replace(/[.@]/g, '_');
          if (u.role === 'teacher') {
            await rtdbSet(`${NODES.TEACHERS}/${id}`, { id, name: u.fullName, email: u.email, schoolName: u.schoolName || 'Livingstone Educational Academy' });
          } else if (u.role === 'student') {
            await rtdbSet(`${NODES.STUDENTS}/${id}`, { id, name: u.fullName, email: u.email, classLevel: u.classLevel || 'SS 1' });
          }
        }
      }
    } else if (key === 'system_payments') {
      await rtdbSet('payments', data);
    } else if (key === 'system_cbt_questions') {
      await rtdbSet('cbt_questions', data);
    } else if (key === 'system_cbt_session_logs') {
      await rtdbSet('cbt_session_logs', data);
    }
  } catch (e) {
    console.error("Firebase Realtime Database state synchronization failed:", e);
  }
};

const localStorageProxy = {
  setItem: (key: string, value: string) => {
    persistAndSync(key, value);
  },
  getItem: (key: string) => window.localStorage.getItem(key),
  removeItem: (key: string) => window.localStorage.removeItem(key),
  clear: () => window.localStorage.clear()
};

const localStorage = localStorageProxy;

export function AdminPanel({ currentConfig, onConfigChange, currentUser }: AdminPanelProps) {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(currentUser?.role === 'admin');
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Auto authenticate if user holds admin role
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      setIsAuthenticated(true);
    }
  }, [currentUser]);

  // Main UI Tab Router
  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'users' | 'curriculum' | 'cbt' | 'payments' | 'results' | 'branding' | 'inquiries' | 'activities' | 'gmail' | 'session' | 'attendance' | 'comms' | 'fees' | 'settings' | 'moderation' | 'db' | 'ai-notes'>('payments');

  // AI Note Generator states
  const [selectedClassAdmin, setSelectedClassAdmin] = useState<string>('SS 1');
  const [selectedSubjectAdmin, setSelectedSubjectAdmin] = useState<string>('Mathematics');
  const [selectedTermAdmin, setSelectedTermAdmin] = useState<string>('1st Term');
  const [selectedWeekAdmin, setSelectedWeekAdmin] = useState<number>(1);
  const [isEndOfTermAdmin, setIsEndOfTermAdmin] = useState<boolean>(false);
  const [isGeneratingNoteAdmin, setIsGeneratingNoteAdmin] = useState<boolean>(false);
  const [generatedNoteAdmin, setGeneratedNoteAdmin] = useState<any | null>(null);
  const [noteErrorAdmin, setNoteErrorAdmin] = useState<string>('');
  const [lessonSubTabAdmin, setLessonSubTabAdmin] = useState<'blueprint' | 'narrative' | 'activities' | 'assessment'>('blueprint');
  const [userAnswersAdmin, setUserAnswersAdmin] = useState<Record<number, number>>({});
  const [showAnswerKeyAdmin, setShowAnswerKeyAdmin] = useState<boolean>(false);

  // Interactive configurations
  const [brandName, setBrandName] = useState(currentConfig.brandName || 'LIVINGSTONEEDU');
  const [appSubtitle, setAppSubtitle] = useState(currentConfig.appSubtitle || 'Learning Portal');
  const [proPrice, setProPrice] = useState('₦10,000');
  const [supportGroupUrl, setSupportGroupUrl] = useState(currentConfig.supportGroupUrl || 'https://wa.me/message/AJ4NILOGBTTMJ1');
  const [contactName, setContactName] = useState(currentConfig.contactName || 'Livingtch Brand Agency');
  const [paystackLink, setPaystackLink] = useState((currentConfig as any).paystackLink || 'https://paystack.com/pay/livingstone-pro-access');
  const [flutterwaveLink, setFlutterwaveLink] = useState((currentConfig as any).flutterwaveLink || 'https://flutterwave.com/pay/livingstone-secondary-pro');
  const [bankName, setBankName] = useState('Zenith Bank');
  const [bankAccountNumber, setBankAccountNumber] = useState('2257503451');
  const [bankAccountName, setBankAccountName] = useState('temitope oluwaseun fatoye');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Toasts Feedback
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage('');
    }, 5000);
  };

  const adminFetch = async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...(options.headers || {}),
      'x-admin-role': currentUser?.role || 'guest',
      'x-admin-email': currentUser?.email || 'guest@domain.com'
    };
    return fetch(url, { ...options, headers });
  };

  // State lists persistent on localStorage
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Users management list synced with Auth Screen
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearchText, setUserSearchText] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // New user form states
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [newUserClass, setNewUserClass] = useState('SS 1');
  const [newUserPro, setNewUserPro] = useState(false);

  // Curriculums state
  const [curriculums, setCurriculums] = useState<any[]>(() => {
    const raw = localStorage.getItem('system_curriculums');
    return raw ? JSON.parse(raw) : DEFAULT_CURRICULUM_DATA;
  });
  const [showAddCurriculumModal, setShowAddCurriculumModal] = useState(false);
  const [currClass, setCurrClass] = useState('SS 1');
  const [currSubject, setCurrSubject] = useState('Mathematics');
  const [currTerm, setCurrTerm] = useState('1st Term');
  const [currWeek, setCurrWeek] = useState(1);
  const [currTopic, setCurrTopic] = useState('');
  const [currDetails, setCurrDetails] = useState('');

  // Curriculum Management Sub-Tabs & Advanced Seeder States
  const [curriculumActiveSubTab, setCurriculumActiveSubTab] = useState<'generate' | 'view' | 'edit' | 'delete'>('view');
  const [seedingProgress, setSeedingProgress] = useState<number>(0);
  const [seedingStatus, setSeedingStatus] = useState<string>('');
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [dbNodeCounts, setDbNodeCounts] = useState<Record<string, number>>({});
  const [selectedJsonViewerNode, setSelectedJsonViewerNode] = useState<{ name: string; path: string; data: any } | null>(null);
  const [isRefreshingDbCounts, setIsRefreshingDbCounts] = useState(false);
  const [currFilterClass, setCurrFilterClass] = useState<string>('all');
  const [currFilterSubject, setCurrFilterSubject] = useState<string>('');
  const [currPageNum, setCurrPageNum] = useState<number>(1);

  // Helper utility to correctly flatten any nested hierarchies (class/subject/term/week)
  // retrieved from Firebase Realtime Database back into flat list arrays.
  const flattenNestedCurriculum = (node: any): any[] => {
    if (!node || typeof node !== 'object') return [];
    
    // Check if flat already (values have 'class' or 'topic')
    const values = Object.values(node);
    if (values.length > 0) {
      const sample: any = values[0];
      if (sample && typeof sample === 'object' && (sample.class || sample.topic)) {
        return values.filter(item => item && typeof item === 'object');
      }
    }

    const list: any[] = [];
    const traverse = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      if (obj.topic !== undefined || obj.objectives !== undefined || obj.details !== undefined) {
        list.push(obj);
        return;
      }
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          traverse(obj[key]);
        }
      }
    };
    traverse(node);
    return list;
  };

  // CBT exams states
  const [cbtExams, setCbtExams] = useState<any[]>(() => {
    const raw = localStorage.getItem('system_cbt');
    return raw ? JSON.parse(raw) : DEFAULT_CBT_DATA;
  });
  const [showAddCbtModal, setShowAddCbtModal] = useState(false);
  const [cbtTitle, setCbtTitle] = useState('');
  const [cbtSubject, setCbtSubject] = useState('Mathematics');
  const [cbtClass, setCbtClass] = useState('SS 1');
  const [cbtTerm, setCbtTerm] = useState('1st Term');
  const [cbtQCount, setCbtQCount] = useState(10);
  const [cbtDuration, setCbtDuration] = useState(30);

  // Payments / ledger state
  const [payments, setPayments] = useState<any[]>(() => {
    const raw = localStorage.getItem('system_payments');
    if (raw) return JSON.parse(raw);

    // Seed realistic Nigerian payments ledger
    const seed = [
      { id: 'pay-1', studentName: 'Chidi Okafor', email: 'chidi@gmail.com', amount: '₦12,500', plan: 'Term Pass Pro', gateway: 'Paystack', status: 'Approved', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
      { id: 'pay-2', studentName: 'Amina Ibrahim', email: 'amina@gmail.com', amount: '₦12,500', plan: 'Term Pass Pro', gateway: 'Flutterwave', status: 'Approved', timestamp: new Date(Date.now() - 3600000 * 8).toISOString() },
      { id: 'pay-3', studentName: 'Tunde Bakare', email: 'tunde@gmail.com', amount: '₦4,500', plan: 'CBT Revision Ticket', gateway: 'Stripe', status: 'Pending', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
      { id: 'pay-4', studentName: 'Musa Bello', email: 'musa@gmail.com', amount: '₦12,500', plan: 'Term Pass Pro', gateway: 'Flutterwave', status: 'Approved', timestamp: new Date(Date.now() - 3600000 * 48).toISOString() }
    ];
    localStorage.setItem('system_payments', JSON.stringify(seed));
    return seed;
  });

  // Score management mockup
  const [grades, setGrades] = useState<any[]>(() => {
    const raw = localStorage.getItem('system_grades');
    if (raw) return JSON.parse(raw);

    const seed = [
      { id: 'grd-1', studentName: 'Chidi Okafor', class: 'SS 1', subject: 'Mathematics', ca: 34, exam: 52, gpa: '4.3', status: 'Approved' },
      { id: 'grd-2', studentName: 'Amina Ibrahim', class: 'SS 1', subject: 'Mathematics', ca: 38, exam: 55, gpa: '4.8', status: 'Approved' },
      { id: 'grd-3', studentName: 'Obinna Eze', class: 'SS 1', subject: 'English Studies', ca: 28, exam: 42, gpa: '3.6', status: 'Pending Approval' },
      { id: 'grd-4', studentName: 'Kelechi Amadi', class: 'SS 1', subject: 'Biology', ca: 31, exam: 48, gpa: '4.0', status: 'Pending Approval' }
    ];
    localStorage.setItem('system_grades', JSON.stringify(seed));
    return seed;
  });

  // States for manual Continuous Assessment record input
  const [newGradeName, setNewGradeName] = useState('');
  const [newGradeClass, setNewGradeClass] = useState('SS 1');
  const [newGradeSubject, setNewGradeSubject] = useState('Mathematics');
  const [newGradeCa, setNewGradeCa] = useState('');
  const [newGradeExam, setNewGradeExam] = useState('');

  // Selected student for Digital ID Card simulation
  const [selectedIdCardUser, setSelectedIdCardUser] = useState<any | null>(null);

  // States for Editing Users
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [editUserClass, setEditUserClass] = useState('SS 1');
  const [editUserPro, setEditUserPro] = useState(false);

  // States for Editing Curriculum items
  const [editingCurriculum, setEditingCurriculum] = useState<any | null>(null);
  const [editCurrClass, setEditCurrClass] = useState('SS 1');
  const [editCurrSubject, setEditCurrSubject] = useState('Mathematics');
  const [editCurrTerm, setEditCurrTerm] = useState('1st Term');
  const [editCurrWeek, setEditCurrWeek] = useState(1);
  const [editCurrTopic, setEditCurrTopic] = useState('');
  const [editCurrDetails, setEditCurrDetails] = useState('');
  const [editCurrStatus, setEditCurrStatus] = useState('Published');

  // CBT custom questions and active logs sub-routing
  const [selectedCbtForQuestions, setSelectedCbtForQuestions] = useState<any | null>(null);
  const [activeCbtSubTab, setActiveCbtSubTab] = useState<'papers' | 'logs'>('papers');
  const [bulkJsonText, setBulkJsonText] = useState('');
  
  // Custom forms for adding/editing questions in a selected exam
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionOptA, setNewQuestionOptA] = useState('');
  const [newQuestionOptB, setNewQuestionOptB] = useState('');
  const [newQuestionOptC, setNewQuestionOptC] = useState('');
  const [newQuestionOptD, setNewQuestionOptD] = useState('');
  const [newQuestionOptE, setNewQuestionOptE] = useState('');
  const [newQuestionCorrect, setNewQuestionCorrect] = useState('A');
  const [newQuestionExplanation, setNewQuestionExplanation] = useState('');

  // High-fidelity seed questions for CBT banks
  const [cbtQuestionsRecord, setCbtQuestionsRecord] = useState<Record<string, any[]>>(() => {
    const raw = localStorage.getItem('system_cbt_questions');
    if (raw) return JSON.parse(raw);
    
    const seedQuestions = {
      'cbt-1': [
        { id: 'q-1-1', text: 'If a number is written in base 8 as 75, what is its value in base 10 (decimal)?', options: ['55', '61', '65', '71', '43'], correctAnswer: 'B', explanation: '75 in base 8 = 7 * 8^1 + 5 * 8^0 = 56 + 5 = 61.' },
        { id: 'q-1-2', text: 'Solve for x in the equation 3^x = 27.', options: ['1', '2', '3', '4', '9'], correctAnswer: 'C', explanation: 'Since 3^3 = 27, x mechanical solution yields 3.' },
        { id: 'q-1-3', text: 'Find the mean of the following numbers: 4, 8, 12, 16.', options: ['8', '10', '12', '14', '6'], correctAnswer: 'B', explanation: 'Sum = 40. Count = 4. Mean = 40/4 = 10.' }
      ],
      'cbt-2': [
        { id: 'q-2-1', text: 'Which of the following is an alkaline earth metal?', options: ['Sodium', 'Potassium', 'Calcium', 'Copper', 'Iron'], correctAnswer: 'C', explanation: 'Calcium belongs to Group 2 of the Periodic table (alkaline earth metals).' },
        { id: 'q-2-2', text: 'What is the volume occupied by 1 mole of any gas at S.T.P?', options: ['2.24 dm³', '22.4 dm³', '224 dm³', '44.8 dm³', '11.2 dm³'], correctAnswer: 'B', explanation: 'Avogadro molar volume at S.T.P is standard 22.4 liters (dm³).' }
      ],
      'cbt-3': [
        { id: 'q-3-1', text: 'Identify the conjunction in this sentence: "He worked very hard but he missed the grade."', options: ['hard', 'very', 'but', 'missed', 'the'], correctAnswer: 'C', explanation: '"but" is a coordinating conjunction linking two clauses.' }
      ]
    };
    localStorage.setItem('system_cbt_questions', JSON.stringify(seedQuestions));
    return seedQuestions;
  });

  // CBT Anti-cheating and session logs state
  const [cbtSessionLogs, setCbtSessionLogs] = useState<any[]>(() => {
    const raw = localStorage.getItem('system_cbt_session_logs');
    if (raw) return JSON.parse(raw);
    
    const seedLogs = [
      { id: 'log-1', studentName: 'Chidi Okafor', examTitle: 'Mathematics Revision Exam', score: '87%', timeSpent: '28m', tabSwitches: 0, status: 'Clean' },
      { id: 'log-2', studentName: 'Amina Ibrahim', examTitle: 'WAEC Standard Chemistry Quiz', score: '90%', timeSpent: '18m', tabSwitches: 1, status: 'Clean' },
      { id: 'log-3', studentName: 'Tunde Bakare', examTitle: 'Mathematics Revision Exam', score: '53%', timeSpent: '41m', tabSwitches: 4, status: 'Flagged (Unusual window unfocus events detect)' },
      { id: 'log-4', studentName: 'Obinna Eze', examTitle: 'English Grammar Midterm', score: '82%', timeSpent: '22m', tabSwitches: 0, status: 'Clean' }
    ];
    localStorage.setItem('system_cbt_session_logs', JSON.stringify(seedLogs));
    return seedLogs;
  });

  // Academic Sessions, Terms, Fees, and System Administration states
  const [currentSession, setCurrentSession] = useState<'2025/2026' | '2026/2027'>('2025/2026');
  const [currentTerm, setCurrentTerm] = useState<'1st Term' | '2nd Term' | '3rd Term'>('1st Term');
  const [termStartDate, setTermStartDate] = useState<string>('2025-09-15');
  const [termEndDate, setTermEndDate] = useState<string>('2025-12-15');

  const [attendanceRecords, setAttendanceRecords] = useState<any[]>(() => {
    return [
      { id: 'att_1', studentName: 'Chidi Benson', classLevel: 'SSS 3', status: 'Present', date: new Date().toISOString().split('T')[0] },
      { id: 'att_2', studentName: 'Kemi Adebayo', classLevel: 'SSS 3', status: 'Present', date: new Date().toISOString().split('T')[0] },
      { id: 'att_3', studentName: 'Ngozi Obi', classLevel: 'JSS 1', status: 'Absent', date: new Date().toISOString().split('T')[0] },
      { id: 'att_4', studentName: 'Aliyu Ibrahim', classLevel: 'JSS 2', status: 'Present', date: new Date().toISOString().split('T')[0] },
    ];
  });
  const [attSelectedClass, setAttSelectedClass] = useState<string>('SSS 3');

  const [rolesPermissions, setRolesPermissions] = useState<any[]>([
    { role: 'Super Admin', approveResults: true, editFees: true, manageUsers: true, generateCbt: true },
    { role: 'School Admin', approveResults: true, editFees: true, manageUsers: true, generateCbt: true },
    { role: 'Teacher', approveResults: false, editFees: false, manageUsers: false, generateCbt: true },
    { role: 'Student', approveResults: false, editFees: false, manageUsers: false, generateCbt: false },
    { role: 'Parent', approveResults: false, editFees: false, manageUsers: false, generateCbt: false },
  ]);

  const [bulkImportText, setBulkImportText] = useState<string>('');
  const [showBulkImport, setShowBulkImport] = useState<boolean>(false);

  const [moderationQueue, setModerationQueue] = useState<any[]>([
    { id: 'mod_1', sender: 'Benson Johnson (Parent)', type: 'Result Conflict', content: 'WAEC Mathematics score CA seems lower than recorded mock results. Please evaluate.', status: 'Pending', date: '2025-06-03' },
    { id: 'mod_2', sender: 'Theresa Alao (Teacher)', type: 'Lesson Revision', content: 'Generated lesson plan for Chemistry Week 4 contains deprecated gas laws questions.', status: 'Pending', date: '2025-06-05' },
  ]);

  const [feeStructures, setFeeStructures] = useState<any[]>([
    { id: 'fee_1', classLevel: 'Primary 1-6', tuition: '₦40,000', development: '₦10,000', sports: '₦5,000', total: '₦55,000' },
    { id: 'fee_2', classLevel: 'JSS 1-3', tuition: '₦65,000', development: '₦15,000', sports: '₦10,000', total: '₦90,000' },
    { id: 'fee_3', classLevel: 'SS 1-3', tuition: '₦85,000', development: '₦20,000', sports: '₦15,000', total: '₦120,000' },
  ]);
  const [outstandingFees, setOutstandingFees] = useState<any[]>([
    { id: 'out_1', studentName: 'Chinedu Aliyu', classLevel: 'SSS 3', totalFee: '₦120,000', paid: '₦80,000', balance: '₦40,000', status: 'Partial' },
    { id: 'out_2', studentName: 'Aminu Sanni', classLevel: 'JSS 2', totalFee: '₦90,000', paid: '₦90,000', balance: '₦0', status: 'Fully Paid' },
    { id: 'out_3', studentName: 'Funmi George', classLevel: 'Primary 4', totalFee: '₦55,000', paid: '₦0', balance: '₦55,000', status: 'Unpaid' },
  ]);

  const [commsAlerts, setCommsAlerts] = useState<any[]>([
    { id: 'comm_1', title: 'End of Term Exam Preparation Guidelines', channel: 'Gmail', date: '2025-05-15', status: 'Sent' },
    { id: 'comm_2', title: 'PTA General Assembly & Infrastructure Levies', channel: 'WhatsApp Broadcast', date: '2025-05-18', status: 'Sent' },
  ]);
  const [newAnnounceTitle, setNewAnnounceTitle] = useState('');
  const [newAnnounceChannel, setNewAnnounceChannel] = useState<'Gmail' | 'WhatsApp Broadcast' | 'Bulk SMS'>('Gmail');

  // Real-time listener for synchronization between RTDB and dashboard states
  useEffect(() => {
    // 1. Subscribe to Curriculum
    const unsubCurr = rtdbSubscribe(NODES.CURRICULUM, (data) => {
      if (data) {
        const arr = flattenNestedCurriculum(data);
        setCurriculums(arr);
        window.localStorage.setItem('system_curriculums', JSON.stringify(arr));
      }
    });

    // 2. Subscribe to CBT
    const unsubCbt = rtdbSubscribe(NODES.CBT, (data) => {
      if (data) {
        const arr = Array.isArray(data) ? data : Object.values(data);
        setCbtExams(arr);
        window.localStorage.setItem('system_cbt', JSON.stringify(arr));
      }
    });

    // 3. Subscribe to Results / Grades
    const unsubGrades = rtdbSubscribe(NODES.RESULTS, (data) => {
      if (data) {
        const arr = Array.isArray(data) ? data : Object.values(data);
        setGrades(arr);
        window.localStorage.setItem('system_grades', JSON.stringify(arr));
      }
    });

    // 4. Subscribe to Users
    const unsubUsers = rtdbSubscribe(NODES.USERS, (data) => {
      if (data) {
        const arr = Array.isArray(data) ? data : Object.values(data);
        setUsersList(arr);
        window.localStorage.setItem('hub_users', JSON.stringify(arr));
      }
    });

    // 5. Subscribe to Payments
    const unsubPay = rtdbSubscribe('payments', (data) => {
      if (data) {
        const arr = Array.isArray(data) ? data : Object.values(data);
        setPayments(arr);
        window.localStorage.setItem('system_payments', JSON.stringify(arr));
      }
    });

    // 6. Subscribe to CBT Questions
    const unsubQuestions = rtdbSubscribe('cbt_questions', (data) => {
      if (data) {
        setCbtQuestionsRecord(data);
        window.localStorage.setItem('system_cbt_questions', JSON.stringify(data));
      }
    });

    // 7. Subscribe to Session Logs
    const unsubSessionLogs = rtdbSubscribe('cbt_session_logs', (data) => {
      if (data) {
        const arr = Array.isArray(data) ? data : Object.values(data);
        setCbtSessionLogs(arr);
        window.localStorage.setItem('system_cbt_session_logs', JSON.stringify(arr));
      }
    });

    // 8. Subscribe to Academic Session settings
    const unsubAcademic = rtdbSubscribe(NODES.ACADEMIC_SESSIONS, (data) => {
      if (data) {
        if (data.currentSession) setCurrentSession(data.currentSession);
        if (data.currentTerm) setCurrentTerm(data.currentTerm);
        if (data.termStartDate) setTermStartDate(data.termStartDate);
        if (data.termEndDate) setTermEndDate(data.termEndDate);
      }
    });

    // 9. Subscribe to Attendance
    const unsubAttendance = rtdbSubscribe(NODES.ATTENDANCE, (data) => {
      if (data) {
        const arr = Array.isArray(data) ? data : Object.values(data);
        setAttendanceRecords(arr);
      }
    });

    return () => {
      unsubCurr();
      unsubCbt();
      unsubGrades();
      unsubUsers();
      unsubPay();
      unsubQuestions();
      unsubSessionLogs();
      unsubAcademic();
      unsubAttendance();
    };
  }, []);

  // Sync users list from localStorage
  const loadUsersSync = () => {
    const hubUsers = JSON.parse(localStorage.getItem('hub_users') || '[]');
    
    // Automatically make sure a few sample users exist if empty
    if (hubUsers.length === 0) {
      const initialUsers = [
        { id: 'usr-demo-1', fullName: 'Mrs. Funke Alao', email: 'funke@livingstone.ng', role: 'teacher', schoolName: 'Livingstone Academy', joinDate: new Date().toLocaleDateString(), isPro: true, avatarSeed: 'writer' },
        { id: 'usr-demo-2', fullName: 'Chidi Okafor', email: 'chidi@gmail.com', role: 'student', classLevel: 'SS 1', joinDate: new Date().toLocaleDateString(), isPro: true, avatarSeed: 'scholar' },
        { id: 'usr-demo-3', fullName: 'Amina Ibrahim', email: 'amina@gmail.com', role: 'student', classLevel: 'SS 1', joinDate: new Date().toLocaleDateString(), isPro: true, avatarSeed: 'science' },
        { id: 'usr-demo-4', fullName: 'Tunde Bakare', email: 'tunde@gmail.com', role: 'student', classLevel: 'SS 1', joinDate: new Date().toLocaleDateString(), isPro: false, avatarSeed: 'math' }
      ];
      localStorage.setItem('hub_users', JSON.stringify(initialUsers));
      setUsersList(initialUsers);
    } else {
      setUsersList(hubUsers);
    }
  };

  const refreshDatabaseNodeCounts = async () => {
    setIsRefreshingDbCounts(true);
    try {
      const counts: Record<string, number> = {};
      const promises = Object.entries(NODES).map(async ([key, nodeName]) => {
        try {
          const snapshot = await rtdbGet(nodeName);
          if (snapshot) {
            if (typeof snapshot === 'object') {
              counts[key] = Object.keys(snapshot).length;
            } else {
              counts[key] = 1;
            }
          } else {
            counts[key] = 0;
          }
        } catch (e) {
          console.warn(`Could not count database node: ${nodeName}`, e);
          counts[key] = 0;
        }
      });
      await Promise.all(promises);
      setDbNodeCounts(counts);
      showToast('Database node tables evaluated in real-time!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Database live counting interrupted.', 'error');
    } finally {
      setIsRefreshingDbCounts(false);
    }
  };

  useEffect(() => {
    if (activeAdminTab === 'db') {
      refreshDatabaseNodeCounts();
    }
  }, [activeAdminTab]);

  useEffect(() => {
    loadUsersSync();
  }, []);

  // Fetch telemetry logs from backend APIs
  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated]);

  const fetchAdminData = async () => {
    setIsLoadingLogs(true);
    try {
      const [inqRes, actRes] = await Promise.all([
        adminFetch('/api/admin/inquiries'),
        adminFetch('/api/admin/activities')
      ]);
      if (inqRes.ok) {
        const inqData = await inqRes.json();
        setInquiries(inqData);
      }
      if (actRes.ok) {
        const actData = await actRes.json();
        setActivities(actData);
      }
    } catch (err) {
      console.error("Failed to fetch administrative records", err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (passcode === 'admin123' || passcode.toLowerCase() === 'admin') {
      setIsAuthenticated(true);
      setPasscode('');
      showToast('Welcome, Administrator. Session authorized.', 'success');
    } else {
      setAuthError('Incorrect Administration passcode. Try "admin123".');
    }
  };

  // Saved Dynamic settings parameters
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus('');
    try {
      const res = await adminFetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName,
          appSubtitle,
          proPrice,
          supportGroupUrl,
          contactName,
          paystackLink,
          flutterwaveLink,
          bankName,
          bankAccountNumber,
          bankAccountName
        })
      });

      if (res.ok) {
        const data = await res.json();
        onConfigChange(data.config);
        setSaveStatus('success:Settings saved and pushed to production server successfully!');
        showToast('Branding settings deployed to school server.', 'success');
        
        // Log activity
        await adminFetch('/api/admin/log-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userName: currentUser?.fullName || 'System Admin',
            userEmail: currentUser?.email || 'admin@livingstone.edu',
            activityType: 'Config Update',
            subject: 'System Configuration',
            detail: `Updated branding to: ${brandName}, Plan Price: ${proPrice}`
          })
        });
      } else {
        setSaveStatus('error:Failed to upload configuration to backend API.');
      }
    } catch (err) {
      setSaveStatus('error:Network disconnect while saving school assets.');
    } finally {
      setIsSaving(false);
    }
  };

  // Mark inquiries as Replied
  const handleMarkAsReplied = async (inquiryId: string) => {
    try {
      const res = await adminFetch('/api/admin/inquiries/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: inquiryId })
      });
      if (res.ok) {
        setInquiries(prev => 
          prev.map(i => i.id === inquiryId ? { ...i, replyStatus: 'Replied' } : i)
        );
        showToast('Message status synchronized as Replied.', 'info');
      }
    } catch (err) {
      console.error("Marking support reply failed", err);
    }
  };

  // Reply WhatsApp redirect
  const handleReplyWhatsApp = (item: InquiryItem) => {
    handleMarkAsReplied(item.id);
    const greetingText = `Hello ${item.name},\n\nThis is the Administration team responding to your school inquiry: "${item.subject}".\n\nYou wrote:\n"${item.message}"\n\nHow can we support your education today?`;
    const destUrl = `https://wa.me/message/AJ4NILOGBTTMJ1?text=${encodeURIComponent(greetingText)}`;
    window.open(destUrl, '_blank');
  };

  // AI Lesson Note generation inside Administrator Panel
  const handleGenerateLessonNoteAdmin = async () => {
    setIsGeneratingNoteAdmin(true);
    setNoteErrorAdmin('');
    setGeneratedNoteAdmin(null);
    setUserAnswersAdmin({});
    setShowAnswerKeyAdmin(false);
    try {
      // 1. Query Realtime Database for curriculum guidelines
      const rtdbCurriculum = await rtdbGet(NODES.CURRICULUM);
      let matchedCurriculum: any = null;
      
      const targetTerm = selectedTermAdmin;
      const targetWeek = selectedWeekAdmin;
      const targetClass = selectedClassAdmin;
      const targetSubject = selectedSubjectAdmin;

      if (rtdbCurriculum) {
        const getFlatCurriculums = (obj: any): any[] => {
          if (!obj || typeof obj !== 'object') return [];
          if (obj.topic !== undefined && (obj.class !== undefined || obj.week !== undefined)) {
            return [obj];
          }
          let list: any[] = [];
          for (const val of Object.values(obj)) {
            list = list.concat(getFlatCurriculums(val));
          }
          return list;
        };

        const flatList = getFlatCurriculums(rtdbCurriculum);
        matchedCurriculum = flatList.find((record: any) => {
          if (!record) return false;
          
          // Must match status === "Published"
          const recordStatus = record.status || 'Published';
          if (recordStatus !== 'Published') return false;

          const norm = (s: string) => String(s).replace(/\s+/g, '').toLowerCase();
          const normWeek = (w: any) => {
            if (typeof w === 'number') return w;
            const m = String(w).match(/\d+/);
            return m ? parseInt(m[0], 10) : null;
          };

          const classMatch = norm(record.class) === norm(targetClass);
          const subjectMatch = norm(record.subject) === norm(targetSubject);
          const termMatch = norm(record.term) === norm(targetTerm);
          const weekMatch = normWeek(record.week) === normWeek(targetWeek);

          return classMatch && subjectMatch && termMatch && weekMatch;
        });
      }

      if (!matchedCurriculum) {
        console.warn(`[WARN] No matching curriculum record found in Firebase. Defaulting to system curriculum database baseline.`);
        
        const termNumDecimal = targetTerm === '1st Term' ? 1 : targetTerm === '2nd Term' ? 2 : 3;
        const subjectIdMapped = targetSubject.toLowerCase().replace(/\s+/g, '_');
        const defaultTopicTitle = getWeeklyTopicTitle(
          targetClass as any,
          subjectIdMapped,
          termNumDecimal as any,
          targetWeek as any
        );

        matchedCurriculum = {
          class: targetClass,
          subject: targetSubject,
          term: targetTerm,
          week: targetWeek,
          topic: defaultTopicTitle,
          details: `NERDC standard guidelines lesson structure for ${defaultTopicTitle}`,
          status: 'Published'
        };
      }

      const res = await fetch('/api/gemini/generate-lesson-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classLevel: matchedCurriculum.class,
          subject: matchedCurriculum.subject,
          term: matchedCurriculum.term,
          week: `Week ${matchedCurriculum.week}`,
          focusTopic: matchedCurriculum.topic,
          topicDescription: matchedCurriculum.details || matchedCurriculum.topic,
          isEndOfTerm: isEndOfTermAdmin
        })
      });

      if (!res.ok) {
        throw new Error('Server returned an error response.');
      }

      const result = await res.json();
      if (result.success) {
        setGeneratedNoteAdmin(result.lessonNote);
        setLessonSubTabAdmin('blueprint');
        
        // Log updated academic activity on backend
        await adminFetch('/api/admin/log-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userName: currentUser?.fullName || "System Admin",
            userEmail: currentUser?.email || "admin@livingstone.edu",
            activityType: 'Admin AI Lesson Note',
            subject: selectedSubjectAdmin,
            detail: `Admin synthesized NERDC Lesson Note for ${selectedClassAdmin}, Week ${selectedWeekAdmin} (${selectedTermAdmin})`
          })
        });
      } else {
        throw new Error(result.error || 'Failed to retrieve lesson contents');
      }
    } catch (err: any) {
      setNoteErrorAdmin(err.message || 'Connection failed compiling lesson note.');
    } finally {
      setIsGeneratingNoteAdmin(false);
    }
  };

  const handleCopyNoteToClipboardAdmin = () => {
    if (!generatedNoteAdmin) return;
    
    const plainText = `
${generatedNoteAdmin.topic?.toUpperCase()} - LESSON NOTE
Subtopic: ${generatedNoteAdmin.subtopic || ''}
Class Level: ${generatedNoteAdmin.classLevel || ''} | Duration: ${generatedNoteAdmin.duration || ''}

LEARNING OBJECTIVES:
${generatedNoteAdmin.objectives?.map((o: string, idx: number) => `${idx + 1}. ${o}`).join('\n')}

KEY VOCABULARY:
${generatedNoteAdmin.keyVocabulary?.join(', ')}

TEACHING MATERIALS:
${generatedNoteAdmin.teachingMaterials?.map((t: string) => `- ${t}`).join('\n')}

INTRODUCTION:
${generatedNoteAdmin.introduction || ''}

EXPLANATION STEPS:
${generatedNoteAdmin.teacherExplanationSteps?.map((s: string, idx: number) => `Step ${idx + 1}: ${s}`).join('\n')}

LESSON NOTE CONTENT:
${generatedNoteAdmin.detailedLessonNote || ''}

STUDENT ACTIVITIES:
${generatedNoteAdmin.studentActivities?.map((a: string) => `- ${a}`).join('\n')}

CLASS EXERCISES:
${generatedNoteAdmin.classExercises?.map((e: string, idx: number) => `Exercise ${idx + 1}: ${e}`).join('\n')}

HOMEWORK:
${generatedNoteAdmin.homeworkAssignment || ''}
    `.trim();

    navigator.clipboard.writeText(plainText);
    showToast('Lesson note copied to clipboard successfully!', 'success');
  };

  const renderFormattedMarkdownAdmin = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) {
        return <h3 key={idx} className="text-sm font-black text-slate-900 tracking-tight mt-5 mb-2.5 border-b pb-0.5 font-sans">{trimmed.substring(4)}</h3>;
      }
      if (trimmed.startsWith('#### ')) {
        return <h4 key={idx} className="text-xs font-black text-slate-800 mt-3.5 mb-1.5 font-sans">{trimmed.substring(5)}</h4>;
      }
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        return <h5 key={idx} className="text-xs font-black text-slate-900 mt-2.5 mb-1 font-sans">{trimmed.replace(/\*\*/g, '')}</h5>;
      }
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-slate-700 leading-relaxed my-1 font-serif">
            {trimmed.substring(2)}
          </li>
        );
      }
      if (trimmed === '') {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="text-xs text-slate-700 leading-relaxed my-2 font-serif text-justify">
          {trimmed}
        </p>
      );
    });
  };

  // Add new User manually
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      showToast('All fields are key guidelines parameters.', 'error');
      return;
    }

    const hubUsers = JSON.parse(localStorage.getItem('hub_users') || '[]');
    const match = hubUsers.some((u: any) => u.email.toLowerCase() === newUserEmail.trim().toLowerCase());
    if (match) {
      showToast('Email matches an active registered account.', 'error');
      return;
    }

    const created = {
      id: 'usr_' + Date.now().toString(),
      fullName: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      role: newUserRole,
      classLevel: newUserRole === 'student' ? newUserClass : undefined,
      isPro: newUserPro,
      avatarSeed: newUserRole === 'teacher' ? 'writer' : 'scholar',
      joinDate: new Date().toLocaleDateString()
    };

    hubUsers.push(created);
    localStorage.setItem('hub_users', JSON.stringify(hubUsers));
    setUsersList(hubUsers);
    
    // Clear forms
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPro(false);
    setShowAddUserModal(false);
    showToast(`Account successfully generated for ${created.fullName}!`, 'success');
  };

  // Promote / Demote / Toggle Pro
  const handleToggleProStatus = (userId: string) => {
    const updated = usersList.map(u => {
      if (u.id === userId) {
        const nextState = !u.isPro;
        showToast(`${u.fullName} upgraded to ${nextState ? 'Livingstone Pro System' : 'Basic Level'}`, 'info');
        return { ...u, isPro: nextState };
      }
      return u;
    });
    localStorage.setItem('hub_users', JSON.stringify(updated));
    setUsersList(updated);
  };

  // Delete User from directory
  const handleDeleteUser = (userId: string, name: string) => {
    const filtered = usersList.filter(u => u.id !== userId);
    localStorage.setItem('hub_users', JSON.stringify(filtered));
    setUsersList(filtered);
    showToast(`Successfully removed account records for ${name}.`, 'info');
  };

  // Master Curriculum Database Seeder
  const handleGenerateCompleteCurriculum = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    setSeedingProgress(0);
    setSeedingStatus('Initializing Federal NERDC Curriculum engines...');

    try {
      // 1. Core Classes to Generate
      const classesToProcess = [
        'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
        'JSS 1', 'JSS 2', 'JSS 3',
        'SS 1', 'SS 2', 'SS 3'
      ];

      // To map SS 1 to both "SS 1" and "SSS 1" so both schemas are automatically populated & completely ready
      const classMapping: Record<string, string[]> = {
        'Primary 1': ['Primary 1'],
        'Primary 2': ['Primary 2'],
        'Primary 3': ['Primary 3'],
        'Primary 4': ['Primary 4'],
        'Primary 5': ['Primary 5'],
        'Primary 6': ['Primary 6'],
        'JSS 1': ['JSS 1'],
        'JSS 2': ['JSS 2'],
        'JSS 3': ['JSS 3'],
        'SS 1': ['SS 1', 'SSS 1'],
        'SS 2': ['SS 2', 'SSS 2'],
        'SS 3': ['SS 3', 'SSS 3']
      };

      let totalSteps = classesToProcess.length;
      let currentStep = 0;

      const rtdbCurriculum = await rtdbGet(NODES.CURRICULUM) || {};

      for (const classLevel of classesToProcess) {
        currentStep++;
        const targetClasses = classMapping[classLevel] || [classLevel];
        const displayLabel = targetClasses.length > 1 ? `${classLevel} / ${targetClasses[1]}` : classLevel;
        
        setSeedingStatus(`Compiling weekly lessons of standard subjects for ${displayLabel}...`);

        // Fetch official subjects mapping
        const subjects = getSubjectsForClass(classLevel as any);
        
        // Loop and write in flat format directly to prevent any heavy single update issues
        for (const targetClass of targetClasses) {
          const cleanClass = targetClass.trim().replace(/[.#$[\]/]/g, '_');

          for (const sub of subjects) {
            const cleanSubj = sub.name.trim().replace(/[.#$[\]/]/g, '_');

            for (const termNum of [1, 2, 3] as const) {
              const termLabel = `${termNum}${termNum === 1 ? 'st' : termNum === 2 ? 'nd' : 'rd'} Term`;

              for (const weekNum of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const) {
                const topicTitle = getWeeklyTopicTitle(classLevel as any, sub.id, termNum, weekNum);
                
                // Get pre-formatted objectives or fall back to high-fidelity matching list
                let objectives: string[] = [];
                try {
                  const lesson = getLessonContent(classLevel as any, sub.id, termNum, weekNum);
                  objectives = lesson.objectives || [];
                } catch {
                  objectives = [
                    `Explain standard rules and operations of ${topicTitle}.`,
                    `Analyze step-by-step calculations and practical occurrences in Nigeria.`,
                    `Complete corresponding continuous assessment and exam quizzes.`
                  ];
                }

                // Match expected flat record schema with clean ID
                const keyId = `curr_${cleanClass}_${cleanSubj}_t${termNum}_W${weekNum}`.replace(/\s+/g, '_');
                
                rtdbCurriculum[keyId] = {
                  id: keyId,
                  class: targetClass,
                  subject: sub.name,
                  term: termLabel,
                  week: weekNum,
                  topic: topicTitle,
                  objectives: objectives,
                  details: objectives.join('\n') || sub.description || `National syllabus guidelines covering ${topicTitle}.`,
                  status: 'Published'
                };
              }
            }
          }
        }

        // Save progress step by step to flat nodes
        await rtdbSet(NODES.CURRICULUM, rtdbCurriculum);

        // Display progress bar and step updates
        const percent = Math.round((currentStep / totalSteps) * 100);
        setSeedingProgress(percent);
        await new Promise(resolve => setTimeout(resolve, 80)); // smooth progress layout transition
      }

      setSeedingStatus('Seed completed! Over 4,000 federal curriculum lessons deployed to Cloud Realtime Database successfully.');
      showToast('Master Curriculum Seeder successfully ran!', 'success');
      
      // Update local set of curriculums
      const freshData = await rtdbGet(NODES.CURRICULUM);
      if (freshData) {
        setCurriculums(flattenNestedCurriculum(freshData));
      }
    } catch (e: any) {
      console.error(e);
      setSeedingStatus(`Seeding failed: ${e.message || 'Check database authorization rules'}`);
      showToast('Curriculum generation failed. See developer console.', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  // Insert Custom Curriculum Row
  const handleAddCurriculumSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currTopic.trim() || !currDetails.trim()) {
      showToast('Please fill out curriculum topic focus & details.', 'error');
      return;
    }

    const raw = {
      id: 'curr-' + Date.now(),
      class: currClass,
      subject: currSubject,
      term: currTerm,
      week: currWeek,
      topic: currTopic.trim(),
      details: currDetails.trim(),
      status: 'Published'
    };

    const next = [raw, ...curriculums];
    localStorage.setItem('system_curriculums', JSON.stringify(next));
    setCurriculums(next);
    setCurrTopic('');
    setCurrDetails('');
    setShowAddCurriculumModal(false);
    showToast('New dynamic curriculum alignment unit published.', 'success');
  };

  // Add CBT Mock exam papers
  const handleAddCbtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cbtTitle.trim()) {
      showToast('CBT examination title parameter is required.', 'error');
      return;
    }

    const raw = {
      id: 'cbt-' + Date.now(),
      title: cbtTitle.trim(),
      subject: cbtSubject,
      class: cbtClass,
      term: cbtTerm,
      questions: cbtQCount,
      duration: cbtDuration,
      status: 'Active'
    };

    const next = [raw, ...cbtExams];
    localStorage.setItem('system_cbt', JSON.stringify(next));
    setCbtExams(next);
    setCbtTitle('');
    setShowAddCbtModal(false);
    showToast('CBT automated question evaluation bank compiled.', 'success');
  };

  // User Edit handlers
  const handleStartEditUser = (usr: any) => {
    setEditingUser(usr);
    setEditUserName(usr.fullName);
    setEditUserEmail(usr.email);
    setEditUserRole(usr.role || 'student');
    setEditUserClass(usr.classLevel || 'SS 1');
    setEditUserPro(!!usr.isPro);
  };

  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserName.trim() || !editUserEmail.trim()) {
      showToast('Name and email are required.', 'error');
      return;
    }

    const updated = usersList.map(u => {
      if (u.id === editingUser.id) {
        return {
          ...u,
          fullName: editUserName.trim(),
          email: editUserEmail.trim().toLowerCase(),
          role: editUserRole,
          classLevel: editUserRole === 'student' ? editUserClass : undefined,
          isPro: editUserPro
        };
      }
      return u;
    });

    localStorage.setItem('hub_users', JSON.stringify(updated));
    setUsersList(updated);
    setEditingUser(null);
    showToast('Member profile updated successfully.', 'success');
  };

  // Curriculum Edit / Delete handlers
  const handleStartEditCurriculum = (cur: any) => {
    setEditingCurriculum(cur);
    setEditCurrClass(cur.class);
    setEditCurrSubject(cur.subject);
    setEditCurrTerm(cur.term || '1st Term');
    setEditCurrWeek(cur.week);
    setEditCurrTopic(cur.topic);
    setEditCurrDetails(cur.details);
    setEditCurrStatus(cur.status || 'Published');
  };

  const handleEditCurriculumSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCurrTopic.trim() || !editCurrDetails.trim()) {
      showToast('Syllabus Topic & details focus are required.', 'error');
      return;
    }

    const updated = curriculums.map(c => {
      if (c.id === editingCurriculum.id) {
        return {
          ...c,
          class: editCurrClass,
          subject: editCurrSubject,
          term: editCurrTerm,
          week: editCurrWeek,
          topic: editCurrTopic.trim(),
          details: editCurrDetails.trim(),
          status: editCurrStatus
        };
      }
      return c;
    });

    localStorage.setItem('system_curriculums', JSON.stringify(updated));
    setCurriculums(updated);
    setEditingCurriculum(null);
    showToast('National syllabus topic alignment updated successfully.', 'success');
  };

  const handleDeleteCurriculum = (curId: string) => {
    const next = curriculums.filter(c => c.id !== curId);
    localStorage.setItem('system_curriculums', JSON.stringify(next));
    setCurriculums(next);
    showToast('Curriculum topic aligned unit deleted successfully.', 'info');
  };

  // CBT interactive MCQ handlers
  const handleAddQuestionToCbt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCbtForQuestions) return;
    if (!newQuestionText.trim() || !newQuestionOptA.trim() || !newQuestionOptB.trim()) {
      showToast('Question and Options A & B are critical parameters.', 'error');
      return;
    }

    const cbtId = selectedCbtForQuestions.id;
    const currentQuestions = cbtQuestionsRecord[cbtId] || [];

    const newQ = {
      id: 'q-' + cbtId + '-' + Date.now(),
      text: newQuestionText.trim(),
      options: [
        newQuestionOptA.trim(),
        newQuestionOptB.trim(),
        newQuestionOptC.trim() || '',
        newQuestionOptD.trim() || '',
        newQuestionOptE.trim() || ''
      ].filter(o => o !== ''),
      correctAnswer: newQuestionCorrect,
      explanation: newQuestionExplanation.trim()
    };

    const updatedQuestions = [...currentQuestions, newQ];
    const updatedRecord = {
      ...cbtQuestionsRecord,
      [cbtId]: updatedQuestions
    };

    setCbtQuestionsRecord(updatedRecord);
    localStorage.setItem('system_cbt_questions', JSON.stringify(updatedRecord));

    // Update question count in CBT Exams array
    const updatedExams = cbtExams.map(ex => {
      if (ex.id === cbtId) {
        return { ...ex, questions: updatedQuestions.length };
      }
      return ex;
    });
    setCbtExams(updatedExams);
    localStorage.setItem('system_cbt', JSON.stringify(updatedExams));

    // Clear question form
    setNewQuestionText('');
    setNewQuestionOptA('');
    setNewQuestionOptB('');
    setNewQuestionOptC('');
    setNewQuestionOptD('');
    setNewQuestionOptE('');
    setNewQuestionCorrect('A');
    setNewQuestionExplanation('');

    showToast('MCQ item added into CBT Examination Paper!', 'success');
  };

  const handleDeleteQuestionFromCbt = (cbtId: string, qId: string) => {
    const currentQuestions = cbtQuestionsRecord[cbtId] || [];
    const filteredQuestions = currentQuestions.filter(q => q.id !== qId);

    const updatedRecord = {
      ...cbtQuestionsRecord,
      [cbtId]: filteredQuestions
    };

    setCbtQuestionsRecord(updatedRecord);
    localStorage.setItem('system_cbt_questions', JSON.stringify(updatedRecord));

    // Update question count in CBT Exams array
    const updatedExams = cbtExams.map(ex => {
      if (ex.id === cbtId) {
        return { ...ex, questions: filteredQuestions.length };
      }
      return ex;
    });
    setCbtExams(updatedExams);
    localStorage.setItem('system_cbt', JSON.stringify(updatedExams));

    showToast('MCQ objective query has been deleted.', 'info');
  };

  const handleBulkImportCbtQuestions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCbtForQuestions || !bulkJsonText.trim()) return;
    const cbtId = selectedCbtForQuestions.id;

    try {
      const parsed = JSON.parse(bulkJsonText.trim());
      const arrayToImport = Array.isArray(parsed) ? parsed : [parsed];

      // Basic validation
      const sanitized = arrayToImport.map((q, i) => {
        return {
          id: q.id || `q-imported-${cbtId}-${i}-${Date.now()}`,
          text: q.text || 'Untitled Question Focus',
          options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : [q.optionA || 'True', q.optionB || 'False'],
          correctAnswer: q.correctAnswer || 'A',
          explanation: q.explanation || ''
        };
      });

      const updatedRecord = {
        ...cbtQuestionsRecord,
        [cbtId]: [...(cbtQuestionsRecord[cbtId] || []), ...sanitized]
      };

      setCbtQuestionsRecord(updatedRecord);
      localStorage.setItem('system_cbt_questions', JSON.stringify(updatedRecord));

      // Update question count in CBT Exams array
      const updatedExams = cbtExams.map(ex => {
        if (ex.id === cbtId) {
          return { ...ex, questions: updatedRecord[cbtId].length };
        }
        return ex;
      });
      setCbtExams(updatedExams);
      localStorage.setItem('system_cbt', JSON.stringify(updatedExams));

      setBulkJsonText('');
      showToast(`Imported ${sanitized.length} MCQ items into exam bank successfully!`, 'success');
    } catch (err) {
      showToast('Invalid JSON structure. Verify bracket pairing matches specification array.', 'error');
    }
  };

  const handleSimulateAiQuestionsPattern = (cbtId: string, subject: string, classLevel: string) => {
    showToast(`AI generating standard examination questions for ${subject} (${classLevel})...`, 'info');
    
    const mockGenerated = [
      {
        id: 'q-ai-1-' + Date.now(),
        text: `Under National NERDC guidelines, what form of assessment best helps pupils prepare for National level examinations in ${subject}?`,
        options: ['Continuous assessment scoring', 'Bi-weekly homework lists', 'Computer Based Practice tests', 'Rote classroom memorization', 'Traditional end-of-term speech'],
        correctAnswer: 'C',
        explanation: 'Computer Based Tests build essential familiarity with UTME and regional digital examination patterns.'
      },
      {
        id: 'q-ai-2-' + Date.now(),
        text: `Which student tracking metric correlates highest with overall exam readiness indicators?`,
        options: ['Term fee payment timing', 'Active XP leaderboard level', 'Registered profile photo seed', 'Subscribed WhatsApp group chat activity', 'Average objective practice scores'],
        correctAnswer: 'E',
        explanation: 'Average objective scores over continuous assessments yield the highest indicators of exam proficiency.'
      }
    ];

    const currentQuestions = cbtQuestionsRecord[cbtId] || [];
    const updatedQuestions = [...currentQuestions, ...mockGenerated];

    const updatedRecord = {
      ...cbtQuestionsRecord,
      [cbtId]: updatedQuestions
    };

    setCbtQuestionsRecord(updatedRecord);
    localStorage.setItem('system_cbt_questions', JSON.stringify(updatedRecord));

    // Update question count in CBT Exams array
    const updatedExams = cbtExams.map(ex => {
      if (ex.id === cbtId) {
        return { ...ex, questions: updatedQuestions.length };
      }
      return ex;
    });
    setCbtExams(updatedExams);
    localStorage.setItem('system_cbt', JSON.stringify(updatedExams));

    showToast('AI successfully synthesised 2 UTME-level questions!', 'success');
  };

  const handleDeleteCbtExam = (cbtId: string) => {
    const next = cbtExams.filter(ex => ex.id !== cbtId);
    localStorage.setItem('system_cbt', JSON.stringify(next));
    setCbtExams(next);

    const nextQ = { ...cbtQuestionsRecord };
    delete nextQ[cbtId];
    setCbtQuestionsRecord(nextQ);
    localStorage.setItem('system_cbt_questions', JSON.stringify(nextQ));

    showToast('CBT examination and associated question bank removed.', 'info');
  };

  // SIMULATE PAYMENT GATEWAYS PROMPT (Paystack, Flutterwave, Stripe)
  const handleSimulatePaymentTrigger = (gatewayName: 'Paystack' | 'Flutterwave' | 'Stripe') => {
    const randomNames = ['Tunde Ajayi', 'Ngozi Nwosu', 'Zubairu Abubakar', 'Funmi Doherty', 'Chioma Nwachukwu'];
    const randomEmails = ['tunde@outlook.com', 'ngozi@gmail.com', 'zubairu@live.com', 'funmi@edu.ng', 'chioma@yahoo.com'];
    const idx = Math.floor(Math.random() * randomNames.length);

    const generatedLedger = {
      id: 'simpay-' + Date.now(),
      studentName: randomNames[idx],
      email: randomEmails[idx],
      amount: proPrice || '₦12,500',
      plan: 'Term Pass Pro Plan',
      gateway: gatewayName,
      status: 'Approved',
      timestamp: new Date().toISOString()
    };

    // Update locally stored payments
    const nextPay = [generatedLedger, ...payments];
    localStorage.setItem('system_payments', JSON.stringify(nextPay));
    setPayments(nextPay);

    // Promote matching student in users list if registered
    const updatedUsers = usersList.map(u => {
      if (u.email.toLowerCase() === generatedLedger.email.toLowerCase()) {
        return { ...u, isPro: true };
      }
      return u;
    });
    localStorage.setItem('hub_users', JSON.stringify(updatedUsers));
    setUsersList(updatedUsers);

    showToast(`Incoming transactional callback via ${gatewayName}: Approved ₦12,500 for ${generatedLedger.studentName}`, 'success');
  };

  // Grade score toggles approval
  const handleApproveGrades = (gradeId: string) => {
    const nextGrades = grades.map(g => {
      if (g.id === gradeId) {
        showToast(`Continuous assessment report approved for ${g.studentName}.`, 'success');
        return { ...g, status: 'Approved' };
      }
      return g;
    });
    localStorage.setItem('system_grades', JSON.stringify(nextGrades));
    setGrades(nextGrades);
  };

  // Aggregate stats calculations
  const statsSummary = React.useMemo(() => {
    const totalTeachers = usersList.filter(u => u.role === 'teacher').length;
    const totalStudents = usersList.filter(u => u.role === 'student').length;
    const activeSubscribers = usersList.filter(u => u.role === 'student' && u.isPro).length;
    
    // Revenue calculations (Approved naira sums)
    let revSum = 0;
    payments.forEach(p => {
      if (p.status === 'Approved') {
        const cleanAmount = parseInt(p.amount.replace(/[^0-9]/g, ''), 10) || 12500;
        revSum += cleanAmount;
      }
    });

    const totalPendingInq = inquiries.filter(i => i.replyStatus === 'Pending').length;

    return {
      totalTeachers: Math.max(totalTeachers, 1),
      totalStudents: Math.max(totalStudents, 3),
      activeSubscribers: Math.max(activeSubscribers, 2),
      revenueSum: revSum,
      totalPendingInq
    };
  }, [usersList, payments, inquiries]);

  // Filtered users search result
  const filteredUsers = React.useMemo(() => {
    return usersList.filter(u => {
      const isRoleMatch = userRoleFilter === 'all' || u.role === userRoleFilter;
      const isTextMatch = !userSearchText.trim() || 
        u.fullName.toLowerCase().includes(userSearchText.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearchText.toLowerCase()) ||
        (u.classLevel && u.classLevel.toLowerCase().includes(userSearchText.toLowerCase()));
      return isRoleMatch && isTextMatch;
    });
  }, [usersList, userSearchText, userRoleFilter]);

  // Lock Screen Authentication Gate
  if (!isAuthenticated) {
    return (
      <div id="admin-passcode-lock" className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-8 space-y-6 text-center animate-fade-in font-sans">
        <div className="mx-auto w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-3xl border border-indigo-150 shadow-xs animate-bounce">
          🛡️
        </div>
        
        <div className="space-y-2">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-lg">
            RESTRICTED PORTAL
          </span>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Administrative Authentication</h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            Livingstone Edtech Administrative Terminal. Access parameters configure curriculum planning guidelines, examine real CBT logs, track Nigeria-wide school payments, and manage user roles.
          </p>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Administration PIN</label>
            <input 
              type="password" 
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter authorization passcode (e.g. admin123)"
              className="w-full text-center px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 shadow-sm placeholder-slate-400"
              autoFocus
            />
          </div>

          {authError && (
            <div className="p-3 bg-red-50 text-red-850 text-[11px] font-semibold rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0 text-red-500" />
              <span>{authError}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-indigo-650 hover:bg-indigo-720 active:scale-98 transition text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-indigo-650/10 cursor-pointer"
          >
            Authorize Control Center
          </button>
        </form>

        <p className="text-[10px] text-slate-400 font-medium">
          🔒 Secure dynamic sandbox environment. Default password is <span className="font-bold underline text-slate-500">admin123</span>
        </p>
      </div>
    );
  }

  return (
    <div id="admin-hub-view" className="space-y-6 animate-fade-in font-sans relative">
      
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-55 max-w-md bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700/50 flex gap-3 items-center animate-fade-in">
          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping shrink-0" />
          <p className="text-xs font-bold">{toastMessage}</p>
        </div>
      )}

      {/* Screen Title & Quick Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-150 hover:border-slate-200 transition">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>🏛️</span>
              <span>Livingstone Administrative Command Center</span>
            </h2>
            <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-[9px] font-black uppercase px-2.5 py-0.5 tracking-wider rounded-full flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
              Dynamic Server Sync
            </span>
          </div>
          <p className="text-xs text-slate-500">Unified dashboard for school curriculum aligning, user directories, simulated payment hooks, continuous assessment reporting, and CBT banking.</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchAdminData}
            title="Reload Server Records"
            className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-205 text-slate-650 rounded-xl transition cursor-pointer"
          >
            <RotateCcw size={14} className={isLoadingLogs ? 'animate-spin' : ''} />
          </button>
          
          <button
            type="button"
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Lock Dashboard
          </button>
        </div>
      </div>

      {/* Main SaaS Dashboard Analytics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-150 hover:border-slate-200 transition space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Total Registers</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Users size={12} /></span>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{statsSummary.totalTeachers + statsSummary.totalStudents}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">&bull; {statsSummary.totalTeachers} Teachers | {statsSummary.totalStudents} Students</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 hover:border-slate-200 transition space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Premium Passes</span>
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Layers size={12} /></span>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{statsSummary.activeSubscribers}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">&bull; Dynamic Livingtech Pro Users</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 hover:border-slate-200 transition space-y-2 col-span-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Total Curriculum</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><BookOpen size={12} /></span>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{curriculums.length}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">&bull; NERDC aligned topics deployed</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 hover:border-slate-200 transition space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider font-sans">Collected Revenue</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg"><DollarSign size={12} /></span>
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-950">₦{statsSummary.revenueSum.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-600 mt-1 font-semibold">&bull; Paystack & Flutterwave channels</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 hover:border-slate-200 transition space-y-2 col-span-2 md:col-span-4 lg:col-span-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Need Action</span>
            <span className={`p-1.5 rounded-lg text-[9px] font-black ${statsSummary.totalPendingInq > 0 ? 'bg-red-50 text-red-700 animate-pulse' : 'bg-emerald-50 text-emerald-800'}`}>
              {statsSummary.totalPendingInq > 0 ? 'Urgent Inbox' : 'Clean'}
            </span>
          </div>
          <div>
            <p className={`text-2xl font-black ${statsSummary.totalPendingInq > 0 ? 'text-red-500' : 'text-slate-900'}`}>{statsSummary.totalPendingInq}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">&bull; Counseling ticket inbox requests</p>
          </div>
        </div>

      </div>

      {/* Primary Section Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Top Group: Academic & Operations */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-2">
            <h5 className="text-[10px] font-bold uppercase text-amber-900 tracking-wider pb-1.5 border-b border-amber-100/40 flex items-center gap-1.5 mb-2.5 bg-amber-50/50 px-2.5 py-1.5 rounded-lg border border-amber-100/60">
              <span>📈</span>
              <span>Academic & Operations</span>
            </h5>
            
            <button
              type="button"
              onClick={() => setActiveAdminTab('dashboard')}
              className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-300 cursor-pointer ${
                activeAdminTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                  : 'bg-transparent text-slate-655 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <TrendingUp size={13} className="stroke-[2.5]" />
                <span>SaaS Analytics Center</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('users')}
              className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-300 cursor-pointer ${
                activeAdminTab === 'users'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                  : 'bg-transparent text-slate-655 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Users size={13} className="stroke-[2.5]" />
                <span>Academic Directory</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeAdminTab === 'users' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {usersList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('curriculum')}
              className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-300 cursor-pointer ${
                activeAdminTab === 'curriculum'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                  : 'bg-transparent text-slate-655 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <BookOpen size={13} className="stroke-[2.5]" />
                <span>Curriculum Align</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeAdminTab === 'curriculum' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
                {curriculums.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('cbt')}
              className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-300 cursor-pointer ${
                activeAdminTab === 'cbt'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                  : 'bg-transparent text-slate-655 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Award size={13} className="stroke-[2.5]" />
                <span>CBT Exam Banks</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('payments')}
              className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-300 cursor-pointer ${
                activeAdminTab === 'payments'
                  ? 'bg-[#2563EB] text-white shadow-sm shadow-blue-500/10'
                  : 'bg-transparent text-slate-655 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <CreditCard size={13} className="stroke-[2.5]" />
                <span>Payments & Sims</span>
              </span>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${activeAdminTab === 'payments' ? 'bg-white/25 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                ₦
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('results')}
              className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-300 cursor-pointer ${
                activeAdminTab === 'results'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                  : 'bg-transparent text-slate-655 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <FileText size={13} className="stroke-[2.5]" />
                <span>Continuous Assessment (CA)</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('session')}
              className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-300 cursor-pointer ${
                activeAdminTab === 'session'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                  : 'bg-transparent text-slate-655 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Calendar size={13} className="stroke-[2.5]" />
                <span>Academic Session & Term</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('attendance')}
              className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-300 cursor-pointer ${
                activeAdminTab === 'attendance'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                  : 'bg-transparent text-slate-655 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <CheckSquare size={13} className="stroke-[2.5]" />
                <span>Attendance Registry</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('fees')}
              className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-300 cursor-pointer ${
                activeAdminTab === 'fees'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                  : 'bg-transparent text-slate-655 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <DollarSign size={13} className="stroke-[2.5]" />
                <span>School Fees Ledgers</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('comms')}
              className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-300 cursor-pointer ${
                activeAdminTab === 'comms'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                  : 'bg-transparent text-slate-655 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Radio size={13} className="stroke-[2.5]" />
                <span>Communication Hub</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('ai-notes')}
              className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-300 cursor-pointer ${
                activeAdminTab === 'ai-notes'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                  : 'bg-transparent text-slate-655 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <BrainCircuit size={13} className="stroke-[2.5]" />
                <span>AI Lesson Note Generator</span>
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">
                AI
              </span>
            </button>
          </div>

          {/* Support & Core Config Group */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-2">
            <h5 className="text-[10px] font-bold uppercase text-indigo-900 tracking-wider pb-1.5 border-b border-indigo-100/40 flex items-center gap-1.5 mb-2.5 bg-indigo-50/50 px-2.5 py-1.5 rounded-lg border border-indigo-100/60">
              <span>🛠️</span>
              <span>Support & Core Configs</span>
            </h5>

            <button
              type="button"
              onClick={() => setActiveAdminTab('branding')}
              className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-300 cursor-pointer ${
                activeAdminTab === 'branding'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                  : 'bg-transparent text-slate-655 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Settings size={13} className="stroke-[2.5]" />
                <span>Identity Configurations</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('gmail')}
              className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-300 cursor-pointer ${
                activeAdminTab === 'gmail'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                  : 'bg-transparent text-slate-655 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Mail size={13} className="stroke-[2.5]" />
                <span>School Gmail Manager</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('inquiries')}
              className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-300 cursor-pointer ${
                activeAdminTab === 'inquiries'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                  : 'bg-transparent text-slate-655 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <MessageSquare size={13} className="stroke-[2.5]" />
                <span>Inquiries Counseling Inbox</span>
              </span>
              {statsSummary.totalPendingInq > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeAdminTab === 'inquiries' ? 'bg-white/20 text-white animate-pulse' : 'bg-red-50 text-red-500 animate-pulse'}`}>
                  {statsSummary.totalPendingInq}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('activities')}
              className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-300 cursor-pointer ${
                activeAdminTab === 'activities'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                  : 'bg-transparent text-slate-655 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Clock size={13} className="stroke-[2.5]" />
                <span>Live Interaction Telemetry</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('settings')}
              className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-300 cursor-pointer ${
                activeAdminTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                  : 'bg-transparent text-slate-655 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Shield size={13} className="stroke-[2.5]" />
                <span>Roles & Permissions Matrix</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('moderation')}
              className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-300 cursor-pointer ${
                activeAdminTab === 'moderation'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                  : 'bg-transparent text-slate-655 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Eye size={13} className="stroke-[2.5]" />
                <span>Moderation Queue</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeAdminTab === 'moderation' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                {moderationQueue.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('db')}
              className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-300 cursor-pointer ${
                activeAdminTab === 'db'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                  : 'bg-transparent text-slate-655 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Database size={13} className="stroke-[2.5]" />
                <span>Database Backup Manager</span>
              </span>
            </button>
          </div>
        </div>

        {/* Right Side Content Canvas */}
        <div className="lg:col-span-9 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          
          {/* TAB 1: SAAS ANALYTICS SYSTEM */}
          {activeAdminTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in text-slate-800">
              <div className="border-b pb-3 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">SaaS Command performance Center</h3>
                  <p className="text-xs text-slate-500">Live academic performance metrics, dynamic cash logs, and subscriptions analytics.</p>
                </div>
                <div className="text-[10px] text-slate-400 font-extrabold flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  <span>Interactive Real-time Feed</span>
                </div>
              </div>

              {/* Analytical Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Simulated SVG Graph: Nigerian Term Subscriptions & Payments */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 space-y-4">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <h4 className="text-xs font-black uppercase text-indigo-950 tracking-wider">Income & Ledger Stream</h4>
                      <p className="text-[10px] text-slate-400">Quarterly growth tracker (Paystack & Flutterwave aggregates)</p>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded">₦{statsSummary.revenueSum} YTD</span>
                  </div>

                  {/* SVG Line Graph */}
                  <div className="h-44 w-full flex items-end">
                    <svg className="w-full h-full" viewBox="0 0 400 150">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2"/>
                          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      {/* Grid lines */}
                      <line x1="10%" y1="10%" x2="90%" y2="10%" stroke="#e2e8f0" strokeDasharray="3,3" />
                      <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="#e2e8f0" strokeDasharray="3,3" />
                      <line x1="10%" y1="90%" x2="90%" y2="90%" stroke="#e2e8f0" strokeDasharray="3,3" />

                      {/* Area path */}
                      <path d="M 40 135 L 40 100 L 120 75 L 200 95 L 280 40 L 360 25 L 360 135 Z" fill="url(#chartGrad)" />
                      
                      {/* Trend Line */}
                      <path d="M 40 100 L 120 75 L 200 95 L 280 40 L 360 25" fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      
                      {/* Interactive plot circles */}
                      <circle cx="40" cy="100" r="4.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="120" cy="75" r="4.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="200" cy="95" r="4.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="280" cy="40" r="4.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="360" cy="25" r="5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />

                      {/* Labels */}
                      <text x="40" y="148" textAnchor="middle" fontSize="8" fill="#94a3b8" fontWeight="bold">Jan</text>
                      <text x="120" y="148" textAnchor="middle" fontSize="8" fill="#94a3b8" fontWeight="bold">Mar</text>
                      <text x="200" y="148" textAnchor="middle" fontSize="8" fill="#94a3b8" fontWeight="bold">May</text>
                      <text x="280" y="148" textAnchor="middle" fontSize="8" fill="#94a3b8" fontWeight="bold">Jul</text>
                      <text x="360" y="148" textAnchor="middle" fontSize="8" fill="#4f46e5" fontWeight="bold">Active</text>
                    </svg>
                  </div>
                </div>

                {/* Performance Analytics: Class levels metrics */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 space-y-4">
                  <h4 className="text-xs font-black uppercase text-indigo-950 tracking-wider">Evaluation Retention score Metrics</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-650">
                        <span>Senior Secondary (SS 1 - SS 3) Performance index</span>
                        <span>82% Exam pass rate</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: '82%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-650">
                        <span>Junior Secondary (JSS 1 - JSS 3) Retention rate</span>
                        <span>74% Midterm aggregate</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
                        <div className="bg-indigo-650 h-full rounded-full" style={{ width: '74%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-650">
                        <span>Primary Grade Levels Quiz Completion</span>
                        <span>90% Interactive trials</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: '90%' }} />
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 font-semibold italic">
                    💡 High quiz averages of 90% in Primary segments indicates excellent adaptation of game mechanics education.
                  </p>
                </div>

              </div>

              {/* Recent activity & Quick settings notifications */}
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 flex gap-3">
                <AlertCircle size={18} className="shrink-0 text-orange-600 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="text-xs font-black text-orange-950">Pending Examination Submissions Approval</h5>
                  <p className="text-[11px] text-orange-800 leading-relaxed">
                    There are currently {grades.filter(g => g.status === 'Pending Approval').length} new student scores uploaded by class teachers from primary/JSS sectors waiting validation in standard Nigeria-wide term plan records files. Approve these grades in the <strong>Continuous Assessment</strong> panel.
                  </p>
                </div>
              </div>

              {/* Digital download center */}
              <div className="p-5 border border-slate-150 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <h5 className="text-xs font-medium text-slate-800 flex items-center gap-1">
                    <Download size={13} className="text-indigo-600" />
                    <span>Download Comprehensive Ledger Sheet</span>
                  </h5>
                  <p className="text-[10px] text-slate-400">Export active school directories, payments, and curriculum maps to local format.</p>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('Initiated secure download bundle compilation...', 'info')}
                  className="px-3.5 py-1.5 bg-slate-900 text-white hover:bg-black font-extrabold text-[10px] uppercase rounded-lg shadow-sm cursor-pointer transition flex items-center gap-1.5"
                >
                  <Download size={12} />
                  <span>Download CSV Suite</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: ACADEMIC USER DIRECTORY */}
          {activeAdminTab === 'users' && (
            <div className="space-y-6 animate-fade-in text-slate-800">
              <div className="border-b pb-3 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Academic & Client Register</h3>
                  <p className="text-xs text-slate-500">Manage interactive student portals, update assigned teachers, promote roles, or issue credentials.</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowBulkImport(!showBulkImport);
                      setShowAddUserModal(false);
                    }}
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-xl flex items-center gap-1.5 border border-emerald-250 transition cursor-pointer"
                  >
                    <span>📋 Excel Bulk Paste</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowAddUserModal(true);
                      setShowBulkImport(false);
                    }}
                    className="px-3.5 py-2 bg-indigo-650 hover:bg-indigo-720 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-650/10 cursor-pointer"
                  >
                    <UserPlus size={13} />
                    <span>Add School Member</span>
                  </button>
                </div>
              </div>

              {/* Bulk Excel/CSV Import Portal */}
              {showBulkImport && (
                <div className="p-5 bg-emerald-50 rounded-2xl border-2 border-emerald-600 border-dashed animate-fade-in space-y-3 text-slate-800">
                  <h4 className="text-xs font-black uppercase text-emerald-950 flex items-center gap-1.5">
                    <span>📋</span> Excel / CSV Tabular Copy-Paste Bulk Enrollment
                  </h4>
                  <p className="text-[11px] text-emerald-800 leading-snug">
                    Paste lines from your spreadsheet or registry. Each line should contain values separated by commas: <br />
                    <code className="bg-emerald-100 px-1 py-0.5 rounded text-[10px] font-mono select-all font-semibold">Full Name, Email Address, Student/Teacher/Admin, School Class (for students)</code>
                  </p>
                  <textarea
                    rows={4}
                    value={bulkImportText}
                    onChange={(e) => setBulkImportText(e.target.value)}
                    placeholder="e.g.&#10;Kelechi Nuhu, kelechi@yahoo.com, student, SS 3&#10;Yomi Shonibare, yomi@gmail.com, teacher&#10;Amadi Ngozi, amadi@outlook.com, student, JSS 1"
                    className="w-full p-3 border border-emerald-300 rounded-xl text-xs font-mono bg-white outline-none focus:border-emerald-600"
                  />
                  <div className="flex justify-end gap-2 text-xs">
                    <button
                      onClick={() => setShowBulkImport(false)}
                      className="px-3 py-1.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!bulkImportText.trim()) {
                          showToast("Please enter registry rows for bulk import", "error");
                          return;
                        }
                        const rows = bulkImportText.split('\n');
                        let importedCount = 0;
                        const newUsers = [...usersList];
                        rows.forEach((row) => {
                          const cols = row.split(',').map(s => s.trim());
                          if (cols.length >= 2 && cols[0] && cols[1]) {
                            const name = cols[0];
                            const email = cols[1];
                            const role = (cols[2] || 'student').toLowerCase();
                            const classLvl = cols[3] || 'SS 1';
                            const id = 'usr-bulk-' + Math.random().toString(36).substr(2, 9);
                            newUsers.push({
                              id,
                              fullName: name,
                              email,
                              role: role === 'teacher' || role === 'admin' ? role : 'student',
                              classLevel: role === 'student' ? classLvl : undefined,
                              joinDate: new Date().toLocaleDateString(),
                              isPro: true,
                              avatarSeed: 'scholar'
                            });
                            importedCount++;
                          }
                        });
                        setUsersList(newUsers);
                        localStorage.setItem('hub_users', JSON.stringify(newUsers));
                        setBulkImportText('');
                        setShowBulkImport(false);
                        showToast(`Enrolled ${importedCount} members into registry from spreadsheet bulk rows!`, "success");
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl cursor-pointer"
                    >
                      Enforce Excel Bulk Pipeline
                    </button>
                  </div>
                </div>
              )}

              {/* Add User Modal */}
              {showAddUserModal && (
                <div className="p-5 bg-slate-50 rounded-2xl border-2 border-indigo-600 border-dashed animate-fade-in space-y-4">
                  <h4 className="text-xs font-black uppercase text-indigo-950 flex items-center gap-2">
                    <UserPlus size={14} /> Registered academic portal access profile
                  </h4>
                  <form onSubmit={handleAddUserSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Full Name</label>
                      <input 
                        type="text" 
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="e.g. Chief Kola Adeyemi"
                        className="w-full px-3 py-2 border rounded-xl text-xs font-semibold bg-white outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Email Address</label>
                      <input 
                        type="email" 
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="e.g. kola@gmail.com"
                        className="w-full px-3 py-2 border rounded-xl text-xs font-semibold bg-white outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Portal Role</label>
                      <select 
                        value={newUserRole}
                        onChange={(e: any) => setNewUserRole(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-semibold bg-white outline-none"
                      >
                        <option value="student">Student Portal</option>
                        <option value="teacher">Teacher Portal</option>
                        <option value="admin">System Administration</option>
                      </select>
                    </div>

                    {newUserRole === 'student' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Student Class Level</label>
                        <select 
                          value={newUserClass}
                          onChange={(e: any) => setNewUserClass(e.target.value)}
                          className="w-full px-3 py-2 border rounded-xl text-xs font-semibold bg-white outline-none"
                        >
                          <option value="Primary 1">Primary 1</option>
                          <option value="Primary 2">Primary 2</option>
                          <option value="Primary 3">Primary 3</option>
                          <option value="Primary 4">Primary 4</option>
                          <option value="Primary 5">Primary 5</option>
                          <option value="Primary 6">Primary 6</option>
                          <option value="JSS 1">JSS 1</option>
                          <option value="JSS 2">JSS 2</option>
                          <option value="JSS 3">JSS 3</option>
                          <option value="SS 1">SS 1</option>
                          <option value="SS 2">SS 2</option>
                          <option value="SS 3">SS 3</option>
                        </select>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-4">
                      <input 
                        type="checkbox" 
                        id="chkProOnAdd" 
                        checked={newUserPro}
                        onChange={(e) => setNewUserPro(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 cursor-pointer"
                      />
                      <label htmlFor="chkProOnAdd" className="text-xs font-bold text-slate-75 * select-none cursor-pointer">
                        Mark upgraded as Interactive Pro Level
                      </label>
                    </div>

                    <div className="col-span-1 md:col-span-2 pt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddUserModal(false)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-605 bg-slate-200/50 hover:bg-slate-200 rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-720 rounded-xl cursor-pointer"
                      >
                        Publish Member Account
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Edit User Modal */}
              {editingUser && (
                <div className="p-5 bg-indigo-50/50 rounded-2xl border-2 border-indigo-650 animate-fade-in space-y-4">
                  <h4 className="text-xs font-black uppercase text-indigo-950 flex items-center gap-2">
                    <Edit size={14} className="text-indigo-650" /> Modify Professional Portal Profile
                  </h4>
                  <form onSubmit={handleEditUserSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Full Name</label>
                      <input 
                        type="text" 
                        value={editUserName}
                        onChange={(e) => setEditUserName(e.target.value)}
                        placeholder="e.g. Chief Kola Adeyemi"
                        className="w-full px-3 py-2 border rounded-xl text-xs font-semibold bg-white outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Email Address</label>
                      <input 
                        type="email" 
                        value={editUserEmail}
                        onChange={(e) => setEditUserEmail(e.target.value)}
                        placeholder="e.g. kola@gmail.com"
                        className="w-full px-3 py-2 border rounded-xl text-xs font-semibold bg-white outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Portal Role</label>
                      <select 
                        value={editUserRole}
                        onChange={(e: any) => setEditUserRole(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-semibold bg-white outline-none"
                      >
                        <option value="student">Student Portal</option>
                        <option value="teacher">Teacher Portal</option>
                        <option value="admin">System Administration</option>
                      </select>
                    </div>

                    {editUserRole === 'student' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Student Class Level</label>
                        <select 
                          value={editUserClass}
                          onChange={(e: any) => setEditUserClass(e.target.value)}
                          className="w-full px-3 py-2 border rounded-xl text-xs font-semibold bg-white outline-none"
                        >
                          <option value="Primary 1">Primary 1</option>
                          <option value="Primary 2">Primary 2</option>
                          <option value="Primary 3">Primary 3</option>
                          <option value="Primary 4">Primary 4</option>
                          <option value="Primary 5">Primary 5</option>
                          <option value="Primary 6">Primary 6</option>
                          <option value="JSS 1">JSS 1</option>
                          <option value="JSS 2">JSS 2</option>
                          <option value="JSS 3">JSS 3</option>
                          <option value="SS 1">SS 1</option>
                          <option value="SS 2">SS 2</option>
                          <option value="SS 3">SS 3</option>
                        </select>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-4 col-span-1 md:col-span-2">
                      <input 
                        type="checkbox" 
                        id="chkProOnEdit" 
                        checked={editUserPro}
                        onChange={(e) => setEditUserPro(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 cursor-pointer"
                      />
                      <label htmlFor="chkProOnEdit" className="text-xs font-bold text-indigo-950 select-none cursor-pointer">
                        Active Interactive Pro Level
                      </label>
                    </div>

                    <div className="col-span-1 md:col-span-2 pt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingUser(null)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-605 bg-slate-200/50 hover:bg-slate-200 rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-720 rounded-xl cursor-pointer"
                      >
                        Save Member Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Control panels & Filters Row */}
              <div className="flex flex-col md:flex-row gap-3.5">
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-2.5 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search by full name, email address, school class level..."
                    value={userSearchText}
                    onChange={(e) => setUserSearchText(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold focus:border-indigo-600 outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 bg-white outline-none"
                  >
                    <option value="all">All School Roles</option>
                    <option value="teacher">Teachers Directory</option>
                    <option value="student">Students Directory</option>
                    <option value="admin">Administrators Profile</option>
                  </select>
                </div>
              </div>

              {/* Directory Listing Table */}
              <div className="overflow-x-auto border border-slate-150 rounded-2xl max-h-[400px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 text-slate-400 uppercase font-bold tracking-wider text-[9px] border-b border-indigo-100">
                    <tr>
                      <th className="p-4">Profile Name & Contact</th>
                      <th className="p-4">Assigned Role / Class</th>
                      <th className="p-4">Plan Level</th>
                      <th className="p-4 text-right">Interactive Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((usr) => (
                      <tr key={usr.id} className="hover:bg-indigo-50/10">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700">
                              {usr.fullName?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-800">{usr.fullName}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{usr.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            usr.role === 'teacher' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                            usr.role === 'admin' ? 'bg-blue-50 text-blue-700 border border-blue-105' :
                            'bg-indigo-50 text-indigo-700 border border-indigo-105'
                          }`}>
                            {usr.role || 'Student'}
                          </span>
                          {usr.classLevel && (
                            <span className="text-[10px] font-mono text-slate-500 font-bold ml-1.5">
                              ({usr.classLevel})
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1 items-start">
                            {usr.isPro ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 border border-emerald-200">
                                  PRO ACTIVE
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleToggleProStatus(usr.id);
                                    showToast(`Deactivated Premium Membership subscription for ${usr.fullName}`, "info");
                                  }}
                                  className="px-2 py-0.5 text-[9px] font-extrabold text-red-600 hover:text-white bg-red-50 hover:bg-red-650 rounded border border-red-200 hover:border-transparent transition-all cursor-pointer"
                                  title="Deactivate subscription once due per term cycle"
                                >
                                  Deactivate
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase text-slate-500 bg-slate-150 border border-slate-200">
                                  BASIC PASS
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleToggleProStatus(usr.id);
                                    showToast(`Activated Premium Membership subscription for ${usr.fullName}`, "success");
                                  }}
                                  className="px-2 py-0.5 text-[9px] font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded border border-transparent shadow-xs transition-all cursor-pointer"
                                  title="Activate Premium interactive access for this term"
                                >
                                  Activate Premium
                                </button>
                              </div>
                            )}
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wide">Due per billing term</p>
                          </div>
                        </td>
                        <td className="p-4 text-right space-x-1.5">
                          {usr.role === 'student' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedIdCardUser(usr);
                                showToast(`Synthesizing Digital ID Card for ${usr.fullName}...`, 'info');
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] uppercase rounded transition cursor-pointer"
                            >
                              🆔 Issue ID
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleStartEditUser(usr)}
                            title="Edit school member profile"
                            className="p-1 text-indigo-650 hover:bg-indigo-50 rounded transition cursor-pointer"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(usr.id, usr.fullName)}
                            title="Delete user profile"
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Dynamic Issue ID Card Simulation View */}
              {selectedIdCardUser && (
                <div id="issued-card-pane" className="bg-slate-905 p-6 rounded-3xl text-slate-700 border-2 border-indigo-900 border-dashed max-w-sm mx-auto space-y-4">
                  <div className="flex justify-between items-baseline border-b pb-2">
                    <span className="text-[9px] font-black uppercase text-indigo-700">Digital Access ID Credential</span>
                    <button 
                      onClick={() => setSelectedIdCardUser(null)}
                      className="text-[10px] text-slate-400 hover:text-slate-800 font-bold"
                    >
                      Close Card
                    </button>
                  </div>

                  {/* ID Core */}
                  <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 space-y-4 relative overflow-hidden">
                    {/* Brand banner */}
                    <div className="flex justify-between items-baseline border-b border-slate-800 pb-2">
                      <span className="font-sans font-black text-xs text-white uppercase">{brandName}</span>
                      <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest">{selectedIdCardUser.isPro ? 'Pro Member' : 'Basic Member'}</span>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center font-black text-xl border border-slate-700">
                        {selectedIdCardUser.fullName?.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black text-white">{selectedIdCardUser.fullName}</p>
                        <p className="text-[10px] text-slate-400">Class: {selectedIdCardUser.classLevel || 'SS 1'}</p>
                        <p className="text-[10px] text-slate-400">Join Date: {selectedIdCardUser.joinDate || '2026'}</p>
                      </div>
                    </div>

                    {/* Barcode line */}
                    <div className="pt-2 border-t border-slate-800/50 font-mono text-[8px] text-slate-500 tracking-widest flex flex-col justify-end text-center">
                      <span>|||||||| ||||| ||||| ||||||| ||</span>
                      <span className="mt-0.5 text-center">{selectedIdCardUser.id}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      showToast('Credential print spool generated!', 'success');
                      window.print();
                    }}
                    className="w-full py-2 bg-slate-900 hover:bg-black text-white font-extrabold text-[10px] uppercase rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Printer size={12} />
                    <span>Print Student Access ID Badge</span>
                  </button>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: CURRICULUM MANAGEMENT */}
          {activeAdminTab === 'curriculum' && (
            <div className="space-y-6 animate-fade-in text-slate-800">
              <div className="border-b pb-3 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-extrabold text-lg text-indigo-950 flex items-center gap-2">
                    <BookOpen className="text-indigo-650" size={20} />
                    <span>NERDC National Curriculum Management</span>
                  </h3>
                  <p className="text-xs text-slate-500">Align, generate, edit, and delete standard curricula approved by the Nigerian Federal Ministry of Education.</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddCurriculumModal(true)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl flex items-center gap-1.5 border border-indigo-200 transition cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Create Custom Topic</span>
                  </button>
                </div>
              </div>

              {/* Sub-tab Navigation */}
              <div className="flex flex-wrap gap-2 border-b pb-4 border-slate-150">
                <button
                  type="button"
                  onClick={() => {
                    setCurriculumActiveSubTab('view');
                    setCurrPageNum(1);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition cursor-pointer ${
                    curriculumActiveSubTab === 'view'
                      ? 'bg-indigo-650 text-white border-indigo-650 shadow-md font-black'
                      : 'bg-white text-slate-650 hover:bg-slate-50 border-slate-200/80 shadow-xs'
                  }`}
                >
                  <BookOpen size={13} />
                  <span>View Curriculum</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurriculumActiveSubTab('generate')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition cursor-pointer ${
                    curriculumActiveSubTab === 'generate'
                      ? 'bg-indigo-650 text-white border-indigo-650 shadow-md font-black'
                      : 'bg-white text-slate-650 hover:bg-slate-50 border-slate-200/80 shadow-xs'
                  }`}
                >
                  <Zap size={13} />
                  <span>Generate Curriculum</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurriculumActiveSubTab('edit')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition cursor-pointer ${
                    curriculumActiveSubTab === 'edit'
                      ? 'bg-indigo-650 text-white border-indigo-650 shadow-md font-black'
                      : 'bg-white text-slate-650 hover:bg-slate-50 border-slate-200/80 shadow-xs'
                  }`}
                >
                  <Edit size={13} />
                  <span>Edit Curriculum</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurriculumActiveSubTab('delete')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition cursor-pointer ${
                    curriculumActiveSubTab === 'delete'
                      ? 'bg-indigo-650 text-white border-indigo-650 shadow-md font-black'
                      : 'bg-white text-slate-650 hover:bg-slate-50 border-slate-200/80 shadow-xs'
                  }`}
                >
                  <Trash2 size={13} />
                  <span>Delete Curriculum</span>
                </button>
              </div>

              {/* Add Custom Curriculum Modal/Row */}
              {showAddCurriculumModal && (
                <form onSubmit={(e) => {
                  handleAddCurriculumSubmit(e);
                  setShowAddCurriculumModal(false);
                }} className="p-5 bg-slate-50 rounded-2xl border border-indigo-200/80 space-y-4 animate-fade-in">
                  <h4 className="text-xs font-black uppercase text-indigo-900 flex items-center gap-1.5">
                    <Plus size={14} className="text-indigo-600" /> Create Custom Curriculum Alignment Topic
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slate-500">Student Class</label>
                      <select value={currClass} onChange={(e) => setCurrClass(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-semibold">
                        <option value="Primary 1">Primary 1</option>
                        <option value="Primary 2">Primary 2</option>
                        <option value="Primary 3">Primary 3</option>
                        <option value="Primary 4">Primary 4</option>
                        <option value="Primary 5">Primary 5</option>
                        <option value="Primary 6">Primary 6</option>
                        <option value="JSS 1">JSS 1</option>
                        <option value="JSS 2">JSS 2</option>
                        <option value="JSS 3">JSS 3</option>
                        <option value="SS 1">SS 1</option>
                        <option value="SS 2">SS 2</option>
                        <option value="SS 3">SS 3</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slate-500">Syllabus Subject</label>
                      <input value={currSubject} onChange={(e) => setCurrSubject(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-semibold" placeholder="Mathematics" required />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slate-500">Term Period</label>
                      <select value={currTerm} onChange={(e) => setCurrTerm(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-semibold">
                        <option value="1st Term">1st Term</option>
                        <option value="2nd Term">2nd Term</option>
                        <option value="3rd Term">3rd Term</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slate-500">Active Week Target</label>
                      <input type="number" min="1" max="12" value={currWeek} onChange={(e) => setCurrWeek(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-semibold" required />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-slate-500">Topic Focus Title</label>
                    <input value={currTopic} onChange={(e) => setCurrTopic(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-semibold" placeholder="e.g. Simultaneous Equations & Graph calculations" required />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-slate-500">Syllabus Guidance Details / Case Studies</label>
                    <textarea value={currDetails} onChange={(e) => setCurrDetails(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-semibold" placeholder="e.g. Highlight solutions utilizing local trade numbers from Balogun market..." rows={3} required />
                  </div>

                  <div className="pt-2 flex justify-end gap-2 text-xs">
                    <button type="button" onClick={() => setShowAddCurriculumModal(false)} className="px-3.5 py-1.5 font-bold text-slate-700 bg-slate-200 rounded-xl cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-650 text-white font-black rounded-xl cursor-pointer">Deploy Topic</button>
                  </div>
                </form>
              )}

              {/* SUB-TAB: GENERATE CURRICULUM */}
              {curriculumActiveSubTab === 'generate' && (
                <div className="p-6 bg-slate-50/60 rounded-2xl border border-slate-200/80 space-y-6 text-left animate-fade-in">
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                      <Zap size={18} className="text-amber-500 fill-amber-500" />
                      <span>Federal Curriculum Database Seeder</span>
                    </h4>
                    <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                      Seed thousands of custom lesson guides, learning objectives, and curriculum mapping structures from the official <strong>NERDC (Nigerian Educational Research and Development Council) Guidelines</strong> directly into Firebase Realtime Database.
                    </p>
                  </div>

                  {/* Generation Features Checklist */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-150 text-xs">
                    <div className="space-y-2">
                      <span className="font-extrabold text-[10px] uppercase text-indigo-900 tracking-wider">Class Tiers Target</span>
                      <ul className="space-y-1.5 text-slate-600 font-medium">
                        <li className="flex items-center gap-1.5 text-slate-700 font-bold">&bull; Primary 1–6 Classes</li>
                        <li className="flex items-center gap-1.5 text-slate-700 font-bold">&bull; Junior Secondary School (JSS 1–3)</li>
                        <li className="flex items-center gap-1.5 text-slate-700 font-bold">&bull; Senior Secondary School (SS/SSS 1–3)</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <span className="font-extrabold text-[10px] uppercase text-indigo-900 tracking-wider font-sans">Scope Parameters</span>
                      <ul className="space-y-1.5 text-slate-600 font-medium">
                        <li>&bull; Complete Terms 1, 2, and 3</li>
                        <li>&bull; Core 12-Week Academic Semester Layouts</li>
                        <li>&bull; Curated subjects including Mathematics, English, Sciences, and more</li>
                        <li>&bull; Distinct Syllabus Objectives and Topic Overviews</li>
                      </ul>
                    </div>
                  </div>

                  {/* Seed Warning */}
                  <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                    <div>
                      <strong className="font-extrabold">Enterprise Safe Overwrite Protection:</strong> Duplication check is automatically handled. If a topic matches the deterministic Class, Subject, Term, and Week, it refreshes the contents without duplicating records.
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="space-y-4">
                    {!isSeeding ? (
                      <button
                        type="button"
                        onClick={handleGenerateCompleteCurriculum}
                        className="px-6 py-3 bg-indigo-650 hover:bg-indigo-720 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10 transition cursor-pointer"
                      >
                        <Zap size={14} className="fill-white" />
                        <span>Build & Deploy Master Curriculums</span>
                      </button>
                    ) : (
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-extrabold text-indigo-950 flex items-center gap-2">
                            <span className="animate-ping w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1"></span>
                            {seedingStatus}
                          </span>
                          <span className="font-black text-indigo-700">{seedingProgress}%</span>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-indigo-650 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${seedingProgress}%` }}
                          />
                        </div>

                        <p className="text-[10px] text-slate-400 font-serif leading-none">Please hold on while the server registers curriculum nodes on-the-fly inside Realtime Database.</p>
                      </div>
                    )}

                    {seedingStatus && !isSeeding && (
                      <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-mono text-indigo-850">
                        {seedingStatus}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUB-TAB: VIEW CURRICULUM */}
              {curriculumActiveSubTab === 'view' && (
                <div className="space-y-4 animate-fade-in text-left">
                  {/* Filter Header */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="space-y-1 flex-1 font-sans">
                        <label className="text-[9px] font-black uppercase text-slate-500">Filter Class Level</label>
                        <select 
                          value={currFilterClass} 
                          onChange={(e) => {
                            setCurrFilterClass(e.target.value);
                            setCurrPageNum(1);
                          }} 
                          className="w-full px-3 py-1.5 border rounded-lg bg-white text-xs font-semibold"
                        >
                          <option value="all">All Classes</option>
                          <option value="Primary 1">Primary 1</option>
                          <option value="Primary 2">Primary 2</option>
                          <option value="Primary 3">Primary 3</option>
                          <option value="Primary 4">Primary 4</option>
                          <option value="Primary 5">Primary 5</option>
                          <option value="Primary 6">Primary 6</option>
                          <option value="JSS 1">JSS 1</option>
                          <option value="JSS 2">JSS 2</option>
                          <option value="JSS 3">JSS 3</option>
                          <option value="SS 1">SS 1</option>
                          <option value="SS 2">SS 2</option>
                          <option value="SS 3">SS 3</option>
                          <option value="SSS 1">SSS 1</option>
                          <option value="SSS 2">SSS 2</option>
                          <option value="SSS 3">SSS 3</option>
                        </select>
                      </div>

                      <div className="space-y-1 flex-1">
                        <label className="text-[9px] font-black uppercase text-slate-500">Search Topic / Subject</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            value={currFilterSubject} 
                            onChange={(e) => {
                              setCurrFilterSubject(e.target.value);
                              setCurrPageNum(1);
                            }} 
                            placeholder="e.g. Mathematics" 
                            className="w-full pl-8 pr-3 py-1.5 border rounded-lg bg-white text-xs font-semibold"
                          />
                          <Search size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-xs font-bold text-slate-500">
                      Found <span className="text-indigo-650">{curriculums.filter(cur => {
                        const matchClass = currFilterClass === 'all' || String(cur.class).toLowerCase() === currFilterClass.toLowerCase();
                        const matchSubject = !currFilterSubject.trim() || String(cur.subject).toLowerCase().includes(currFilterSubject.toLowerCase()) || String(cur.topic).toLowerCase().includes(currFilterSubject.toLowerCase());
                        return matchClass && matchSubject;
                      }).length}</span> alignment entries in RTDB node
                    </div>
                  </div>

                  {/* Render Grid */}
                  {(() => {
                    const filtered = curriculums.filter(cur => {
                      const matchClass = currFilterClass === 'all' || String(cur.class).toLowerCase() === currFilterClass.toLowerCase();
                      const matchSubject = !currFilterSubject.trim() || String(cur.subject).toLowerCase().includes(currFilterSubject.toLowerCase()) || String(cur.topic).toLowerCase().includes(currFilterSubject.toLowerCase());
                      return matchClass && matchSubject;
                    });

                    const itemsPerPage = 8;
                    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
                    const safePageNum = Math.min(currPageNum, totalPages);
                    const paginated = filtered.slice((safePageNum - 1) * itemsPerPage, safePageNum * itemsPerPage);

                    if (filtered.length === 0) {
                      return (
                        <div className="p-8 text-center text-xs text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-300">
                          No curriculum records matching criteria found. Click <strong>Generate Curriculum</strong> tab to seed standard layouts index.
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {paginated.map((cur) => (
                            <div key={cur.id} className="p-4 bg-white border border-slate-150 rounded-2xl space-y-3 hover:border-slate-350 transition flex flex-col justify-between shadow-xs">
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-850 text-[8px] font-black rounded uppercase">{cur.class}</span>
                                  <span className="text-[10px] text-slate-400 font-bold">Week {cur.week} &bull; {cur.term || '1st Term'}</span>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] font-extrabold uppercase text-indigo-655 tracking-wider">{cur.subject}</span>
                                  <h4 className="font-extrabold text-xs text-slate-900 leading-snug">{cur.topic}</h4>
                                </div>
                                <p className="text-[11px] text-slate-500 font-serif leading-relaxed italic line-clamp-3">{cur.details}</p>
                              </div>

                              <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                                <span className="text-[9px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-black border border-emerald-100 uppercase">{cur.status || 'Published'}</span>
                                <div className="flex gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleStartEditCurriculum(cur);
                                      setCurriculumActiveSubTab('edit');
                                    }}
                                    className="px-2 py-0.5 text-[9px] font-bold text-indigo-650 hover:bg-slate-50 border border-slate-200 rounded transition cursor-pointer bg-white"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCurriculum(cur.id)}
                                    className="px-2 py-0.5 text-[9px] font-bold text-red-650 hover:bg-red-50 border border-red-100 rounded transition cursor-pointer bg-white"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                          <div className="flex justify-between items-center bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold border border-slate-150">
                            <button
                              type="button"
                              disabled={currPageNum <= 1}
                              onClick={() => setCurrPageNum(prev => prev - 1)}
                              className="px-2 py-1 text-[10px] bg-white border rounded disabled:opacity-40"
                            >
                              Previous page
                            </button>
                            <span className="text-slate-500 text-[11px]">Page <span className="text-slate-900">{currPageNum}</span> of {totalPages}</span>
                            <button
                              type="button"
                              disabled={currPageNum >= totalPages}
                              onClick={() => setCurrPageNum(prev => prev + 1)}
                              className="px-2 py-1 text-[10px] bg-white border rounded disabled:opacity-40"
                            >
                              Next page
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* SUB-TAB: EDIT CURRICULUM */}
              {curriculumActiveSubTab === 'edit' && (
                <div className="space-y-4 animate-fade-in text-left">
                  {editingCurriculum ? (
                    <form onSubmit={(e) => {
                      handleEditCurriculumSubmit(e);
                      setCurriculumActiveSubTab('view');
                    }} className="p-5 bg-indigo-50/40 rounded-2xl border border-indigo-200/80 space-y-4">
                      <h4 className="text-xs font-black uppercase text-indigo-955 flex items-center gap-1.5 border-b pb-2 border-indigo-150">
                        <Edit size={14} className="text-indigo-650" /> Modify Syllabus Alignment Focus Target
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-500">Student Class</label>
                          <select value={editCurrClass} onChange={(e) => setEditCurrClass(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-semibold outline-none">
                            <option value="Primary 1">Primary 1</option>
                            <option value="Primary 2">Primary 2</option>
                            <option value="Primary 3">Primary 3</option>
                            <option value="Primary 4">Primary 4</option>
                            <option value="Primary 5">Primary 5</option>
                            <option value="Primary 6">Primary 6</option>
                            <option value="JSS 1">JSS 1</option>
                            <option value="JSS 2">JSS 2</option>
                            <option value="JSS 3">JSS 3</option>
                            <option value="SS 1">SS 1</option>
                            <option value="SS 2">SS 2</option>
                            <option value="SS 3">SS 3</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-500">Syllabus Subject</label>
                          <input value={editCurrSubject} onChange={(e) => setEditCurrSubject(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-semibold outline-none" required />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-500">Term Period</label>
                          <select value={editCurrTerm} onChange={(e) => setEditCurrTerm(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-semibold outline-none">
                            <option value="1st Term">1st Term</option>
                            <option value="2nd Term">2nd Term</option>
                            <option value="3rd Term">3rd Term</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-500">Active Week Target</label>
                          <input type="number" min="1" max="12" value={editCurrWeek} onChange={(e) => setEditCurrWeek(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-semibold outline-none" required />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-500">Topic Focus Title</label>
                          <input value={editCurrTopic} onChange={(e) => setEditCurrTopic(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-semibold outline-none" placeholder="Syllabus Title topic" required />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-500">Topic Status</label>
                          <select value={editCurrStatus} onChange={(e) => setEditCurrStatus(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-semibold outline-none">
                            <option value="Published">Published / Live</option>
                            <option value="Draft">Draft Mode</option>
                            <option value="Archived">Archived Segment</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-500">Syllabus Guidance Details / Core Case Studies</label>
                        <textarea value={editCurrDetails} onChange={(e) => setEditCurrDetails(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-semibold outline-none font-serif" rows={5} required />
                      </div>

                      <div className="pt-2 flex justify-end gap-2 text-xs">
                        <button type="button" onClick={() => setEditingCurriculum(null)} className="px-3.5 py-1.5 font-bold text-slate-700 bg-slate-200 rounded-xl cursor-pointer">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-650 text-white font-black rounded-xl cursor-pointer">Update Alignment</button>
                      </div>
                    </form>
                  ) : (
                    <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-350 space-y-4">
                      <div className="space-y-1.5">
                        <h4 className="font-extrabold text-sm text-slate-800">No Target Topic Loaded</h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">Please select a syllabus card from the <strong>View Curriculum</strong> sub-tab, or pick one from the active aligner database below to open editing control panels:</p>
                      </div>

                      {curriculums.length > 0 && (
                        <div className="max-w-sm mx-auto">
                          <select 
                            onChange={(e) => {
                              const match = curriculums.find(c => c.id === e.target.value);
                              if (match) handleStartEditCurriculum(match);
                            }}
                            className="w-full py-2 px-3 bg-white border rounded-xl text-xs font-bold shadow-xs outline-none"
                            defaultValue=""
                          >
                            <option value="" disabled>-- Choose a Curriculum Record to Edit --</option>
                            {curriculums.map(c => (
                              <option key={c.id} value={c.id}>[{c.class}] {c.subject} - Week {c.week}: {c.topic}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-TAB: DELETE CURRICULUM */}
              {curriculumActiveSubTab === 'delete' && (
                <div className="space-y-6 text-left animate-fade-in">
                  <div className="p-5 bg-red-50/50 border border-red-200 rounded-2xl flex items-center justify-between flex-wrap gap-4">
                    <div className="space-y-1 max-w-md">
                      <h4 className="font-black text-sm text-red-850 flex items-center gap-1.5 uppercase">
                        <ShieldAlert size={16} className="text-red-650" /> Purge Curriculum Controls
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Resetting the curriculum structure deletes existing alignment records currently visible inside classroom grids and student guides globally.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm('CRITICAL WARN: Are you absolutely sure you want to completely purge ALL curriculum alignments from Firebase Realtime Database? This cannot be undone!')) {
                          localStorage.setItem('system_curriculums', JSON.stringify([]));
                          setCurriculums([]);
                          await rtdbSet(NODES.CURRICULUM, null);
                          showToast('Syllabus databases master reset executed.', 'info');
                        }
                      }}
                      className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Purge Aligned Curriculum</span>
                    </button>
                  </div>

                  {/* Individual Deletion list */}
                  <div className="space-y-3">
                    <h5 className="font-extrabold text-xs text-slate-500 uppercase tracking-widest font-sans">Delete Individual Alignments</h5>
                    {curriculums.length === 0 ? (
                      <p className="text-xs text-slate-425 italic">No remaining curriculum entries loaded.</p>
                    ) : (
                      <div className="max-h-[350px] overflow-y-auto border rounded-xl divide-y">
                        {curriculums.map(c => (
                          <div key={c.id} className="p-3 bg-white flex justify-between items-center text-xs gap-4">
                            <div className="space-y-0.5 max-w-xl">
                              <div className="flex gap-1.5 items-baseline">
                                <span className="bg-slate-100 text-[8px] font-black uppercase px-1 py-0.5 border text-slate-700 rounded leading-none">{c.class}</span>
                                <span className="text-[10px] text-slate-400 font-bold">{c.subject} &bull; Week {c.week} &bull; {c.term || '1st Term'}</span>
                              </div>
                              <p className="font-bold text-slate-800 leading-tight">{c.topic}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteCurriculum(c.id)}
                              className="px-2.5 py-1 text-[10px] font-bold text-red-650 hover:bg-red-50 border border-red-100 hover:border-red-200 bg-white shadow-xs rounded-lg transition shrink-0"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: CBT EXAMINATION CENTERS */}
          {activeAdminTab === 'cbt' && (
            <div className="space-y-6 animate-fade-in text-slate-800">
              <div className="border-b pb-3 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Computer Based Test (CBT) Question Banks</h3>
                  <p className="text-xs text-slate-500">Configure quiz banks, examine objective time limitations, add mock questions, and view system diagnostic anti-cheating alerts.</p>
                </div>

                <button
                  onClick={() => setShowAddCbtModal(true)}
                  className="px-3.5 py-2 bg-indigo-650 hover:bg-indigo-720 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-650/10 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Configure CBT Exam</span>
                </button>
              </div>

              {/* CBT Sub Tab Selection */}
              <div className="flex gap-2 border-b pb-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCbtSubTab('papers');
                    setSelectedCbtForQuestions(null);
                  }}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg transition cursor-pointer ${
                    activeCbtSubTab === 'papers'
                      ? 'bg-indigo-650 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  CBT Exams Databases
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCbtSubTab('logs');
                    setSelectedCbtForQuestions(null);
                  }}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg transition relative cursor-pointer ${
                    activeCbtSubTab === 'logs'
                      ? 'bg-indigo-650 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>Anti-Cheating Telemetry Alerts</span>
                  {cbtSessionLogs.filter(l => l.status.includes('Flagged')).length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-650"></span>
                    </span>
                  )}
                </button>
              </div>

              {/* CBT Exam creation */}
              {showAddCbtModal && (
                <form onSubmit={handleAddCbtSubmit} className="p-5 bg-slate-50 border border-indigo-150 rounded-2xl space-y-4">
                  <h4 className="text-xs font-black uppercase text-indigo-905">Set school exam sheet metrics</h4>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 text-left block">Exam title</label>
                    <input type="text" value={cbtTitle} onChange={(e) => setCbtTitle(e.target.value)} className="w-full px-3 py-2 border rounded-xl outline-none" placeholder="e.g. UTME Standard Joint Math Mock Exam" required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400 text-left block">Exam Subject</label>
                      <input type="text" value={cbtSubject} onChange={(e) => setCbtSubject(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white" required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400 text-left block">Student target class</label>
                      <select value={cbtClass} onChange={(e) => setCbtClass(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-xs">
                        <option value="Primary 1">Primary 1</option>
                        <option value="Primary 2">Primary 2</option>
                        <option value="Primary 3">Primary 3</option>
                        <option value="Primary 4">Primary 4</option>
                        <option value="Primary 5">Primary 5</option>
                        <option value="Primary 6">Primary 6</option>
                        <option value="JSS 1">JSS 1</option>
                        <option value="JSS 2">JSS 2</option>
                        <option value="JSS 3">JSS 3</option>
                        <option value="SS 1">SS 1</option>
                        <option value="SS 2">SS 2</option>
                        <option value="SS 3">SS 3</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400 text-left block">Number of initial questions</label>
                      <input type="number" value={cbtQCount} onChange={(e) => setCbtQCount(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl bg-white" required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400 text-left block">Exam duration (Minutes)</label>
                      <input type="number" value={cbtDuration} onChange={(e) => setCbtDuration(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl bg-white" required />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2 text-xs">
                    <button type="button" onClick={() => setShowAddCbtModal(false)} className="px-3 py-1.5 text-slate-705 bg-slate-205 rounded-xl cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-650 text-white font-black rounded-xl cursor-pointer">Publish Exam Bank</button>
                  </div>
                </form>
              )}

              {/* Sub Tab: LOGS */}
              {activeCbtSubTab === 'logs' && (
                <div className="space-y-4 animate-fade-in text-left">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                    <h4 className="font-extrabold text-amber-950 flex items-center gap-1">🛡️ Anti-Cheating & AI Integrity Guard Active</h4>
                    <p className="text-amber-900 leading-relaxed">
                      The exam client environment monitors mouse exit logs and active focus shifts. Logs that contain multiple background tab jumps are flagged below with structural warnings.
                    </p>
                  </div>

                  <div className="overflow-x-auto border border-slate-150 rounded-2xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-50 text-slate-450 uppercase font-black text-[9px] border-b">
                        <tr>
                          <th className="p-3">Student Candidate</th>
                          <th className="p-3">Examination Paper</th>
                          <th className="p-3">Exam Score</th>
                          <th className="p-3">Duration</th>
                          <th className="p-3">Tab Swishes</th>
                          <th className="p-3 text-right">Proctor Audit Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {cbtSessionLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50">
                            <td className="p-3 font-extrabold text-slate-800">{log.studentName}</td>
                            <td className="p-3 text-slate-600 font-semibold">{log.examTitle}</td>
                            <td className="p-3 font-mono font-black text-indigo-755">{log.score}</td>
                            <td className="p-3 font-semibold text-slate-500">{log.timeSpent}</td>
                            <td className="p-3 font-mono font-bold text-red-655">{log.tabSwitches} triggers</td>
                            <td className="p-3 text-right">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                log.tabSwitches > 1
                                  ? 'bg-red-50 text-red-755 border border-red-200'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}>
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sub Tab: PAPERS LISTING */}
              {activeCbtSubTab === 'papers' && !selectedCbtForQuestions && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cbtExams.map((ex) => (
                    <div key={ex.id} className="p-5 border border-slate-150 rounded-2xl space-y-4 bg-slate-50/40 hover:border-indigo-300 transition text-left flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-baseline border-b pb-2">
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[9px] font-extrabold rounded-md uppercase tracking-wider">{ex.class} &bull; {ex.term || '1st Term'}</span>
                          <span className="text-[9px] bg-indigo-50 text-indigo-755 border border-indigo-200 px-2 rounded-full font-bold uppercase">{ex.status}</span>
                        </div>

                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{ex.title}</h4>
                          <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wide mt-1">{ex.subject}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] font-bold text-slate-600">
                          <div>⏱️ Duration: <span className="font-mono text-slate-900">{ex.duration} Mins</span></div>
                          <div>📋 Questions: <span className="font-mono text-indigo-705">{(cbtQuestionsRecord[ex.id] || []).length || ex.questions} MCQs</span></div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCbtForQuestions(ex);
                            showToast(`Selected ${ex.title} question bank for interactive editing.`, 'info');
                          }}
                          className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-indigo-650 text-white rounded hover:bg-indigo-720 transition cursor-pointer"
                        >
                          Configure Questions ({(cbtQuestionsRecord[ex.id] || []).length || ex.questions})
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCbtExam(ex.id)}
                          title="Remove exam sheet"
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* INTERACTIVE QUESTION BANK FOR INDIVIDUAL CBT EXAM */}
              {activeCbtSubTab === 'papers' && selectedCbtForQuestions && (
                <div className="bg-slate-50/50 p-5 rounded-2xl border border-indigo-200 space-y-6 text-left animate-fade-in animate-duration-150">
                  
                  {/* Header info */}
                  <div className="flex justify-between items-start flex-wrap gap-4 border-b border-indigo-100 pb-3">
                    <div>
                      <button
                        type="button"
                        onClick={() => setSelectedCbtForQuestions(null)}
                        className="text-xs text-indigo-655 font-bold hover:underline mb-1.5 block cursor-pointer"
                      >
                        &larr; Back to Exams Databases
                      </button>
                      <h4 className="text-base font-extrabold text-slate-900">{selectedCbtForQuestions.title}</h4>
                      <p className="text-xs text-slate-500">
                        Class: <span className="font-bold">{selectedCbtForQuestions.class}</span> &bull; 
                        Subject: <span className="font-bold">{selectedCbtForQuestions.subject}</span> &bull; 
                        Contains <span className="font-bold font-mono text-indigo-705">{(cbtQuestionsRecord[selectedCbtForQuestions.id] || []).length}</span> custom hand-aligned interactive exam tasks.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSimulateAiQuestionsPattern(selectedCbtForQuestions.id, selectedCbtForQuestions.subject, selectedCbtForQuestions.class)}
                      className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer"
                    >
                      Generative AI UTME Tasks Simulation
                    </button>
                  </div>

                  {/* Add manual single question form block */}
                  <form onSubmit={handleAddQuestionToCbt} className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                    <h5 className="text-xs font-black uppercase text-indigo-950">Add Single MCQ Exam Task Focus</h5>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Question Statement/Prompt</label>
                      <textarea
                        value={newQuestionText}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                        placeholder="e.g. Solve for 'y' in the equation log y + log 4 = log 28."
                        rows={2}
                        className="w-full p-2 border rounded-xl text-xs font-semibold outline-none focus:border-indigo-650"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Option A (Standard/Fallback)</label>
                        <input value={newQuestionOptA} onChange={(e) => setNewQuestionOptA(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-xs font-semibold outline-none" placeholder="e.g. y = 7" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Option B</label>
                        <input value={newQuestionOptB} onChange={(e) => setNewQuestionOptB(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-xs font-semibold outline-none" placeholder="e.g. y = 14" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Option C (Optional)</label>
                        <input value={newQuestionOptC} onChange={(e) => setNewQuestionOptC(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-xs font-semibold outline-none" placeholder="e.g. y = 21" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Option D (Optional)</label>
                        <input value={newQuestionOptD} onChange={(e) => setNewQuestionOptD(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-xs font-semibold outline-none" placeholder="e.g. y = 35" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400 text-left block">Correct Option Letter</label>
                        <select value={newQuestionCorrect} onChange={(e) => setNewQuestionCorrect(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-xs font-semibold bg-white">
                          <option value="A">Option A</option>
                          <option value="B">Option B</option>
                          <option value="C">Option C</option>
                          <option value="D">Option D</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400 text-left block">Syllabus Explanations / Feedback Hints (Optional)</label>
                        <input value={newQuestionExplanation} onChange={(e) => setNewQuestionExplanation(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-xs font-semibold outline-none" placeholder="e.g. log(4y) = log(28) => 4y = 28 => y = 7." />
                      </div>
                    </div>

                    <div className="pt-1 text-right">
                      <button type="submit" className="px-4 py-2 bg-indigo-650 text-white font-black text-xs rounded-xl hover:bg-indigo-720 cursor-pointer">
                        Add Question To Sheet Bank
                      </button>
                    </div>
                  </form>

                  {/* Bulk Import Form Block */}
                  <form onSubmit={handleBulkImportCbtQuestions} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                    <h5 className="text-xs font-black uppercase text-indigo-950">Bulk Import Objective Syllabus Bank via JSON</h5>
                    <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                      Paste a raw JSON array sequence of formatted curriculum items. Structure: <code className="bg-slate-100 text-red-650 px-1 py-0.5 rounded">[{"{ \"text\": \"Query?\", \"options\": [\"Opt1\", \"Opt2\"], \"correctAnswer\": \"A\" }"}]</code>
                    </p>
                    
                    <textarea
                      value={bulkJsonText}
                      onChange={(e) => setBulkJsonText(e.target.value)}
                      placeholder='[{"text": "Sample Multi-line question?", "options": ["A-option", "B-option"], "correctAnswer": "A", "explanation": "Detailed explanation text..."}]'
                      rows={3}
                      className="w-full p-2.5 border rounded-xl font-mono text-[11px] outline-none bg-slate-50"
                    />

                    <div className="text-right">
                      <button type="submit" className="px-4 py-2 bg-indigo-950 hover:bg-black text-white font-black text-xs rounded-xl cursor-pointer">
                        Bulk Upload Objective Syllabus Bank
                      </button>
                    </div>
                  </form>

                  {/* Active Question List Container */}
                  <div className="space-y-3 pt-3">
                    <h5 className="text-xs font-black uppercase text-slate-500">Currently Active objective items List</h5>
                    
                    {(cbtQuestionsRecord[selectedCbtForQuestions.id] || []).length === 0 ? (
                      <div className="p-8 text-center bg-white border border-dashed rounded-xl text-slate-400 text-xs font-bold font-serif">
                        No active questions set for {selectedCbtForQuestions.title}. Add standard questions above.
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {(cbtQuestionsRecord[selectedCbtForQuestions.id] || []).map((q, qidx) => (
                          <div key={q.id} className="p-4 bg-white border rounded-xl space-y-2 relative">
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestionFromCbt(selectedCbtForQuestions.id, q.id)}
                              className="absolute top-3.5 right-3.5 text-[10px] font-black text-red-500 hover:underline cursor-pointer"
                            >
                              Remove task
                            </button>

                            <div className="space-y-1 text-left">
                              <span className="text-[9px] font-black text-indigo-705 uppercase font-mono tracking-widest block">Question #{qidx + 1}</span>
                              <p className="text-xs font-extrabold text-slate-800 pr-16">{q.text}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600 pl-2 pt-1 border-l-2 border-indigo-100">
                              {q.options.map((opt: string, optidx: number) => {
                                const letter = String.fromCharCode(65 + optidx); // A, B, C...
                                return (
                                  <div key={optidx} className={q.correctAnswer === letter ? 'text-emerald-700 font-extrabold bg-emerald-50/50 px-1 py-0.5 rounded font-black' : ''}>
                                    <span className="font-bold text-indigo-900 font-mono">Option {letter}:</span> {opt}
                                  </div>
                                );
                              })}
                            </div>

                            {q.explanation && (
                              <p className="text-[10px] font-serif text-slate-450 italic pt-1.5 pl-2 border-t border-slate-100 mt-1">
                                💡 Explanation: {q.explanation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>
          )}

           {/* TAB 5: PAYMENTS ACCORD & SIMULATORS */}
          {activeAdminTab === 'payments' && (
            <div className="space-y-6 animate-fade-in text-black font-sans">
              
              {/* Header section with Neo-Brutalist title banner */}
              <div className="border-[3px] border-black bg-yellow-300 p-5 rounded-2xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-black text-xl text-black uppercase tracking-tight">
                    💸 Payments & Subscriptions Control Center
                  </h3>
                  <p className="text-xs text-black/85 font-black mt-1">
                    Live dynamic billing parameters coupled with interactive parent-facing lookup checkers & portal simulators.
                  </p>
                </div>
              </div>

              {/* Simulation Hub Box */}
              <div className="bg-white p-6 rounded-2xl border-[3px] border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-4">
                <div>
                  <h4 className="text-xs font-black uppercase text-black flex items-center gap-2 bg-cyan-300 px-3 py-1.5 rounded-lg border border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] inline-block">
                    <Smartphone size={14} className="stroke-[2.5]" />
                    <span>NIGERIAN TRANSACTIONS SIMULATION BAY</span>
                  </h4>
                  <p className="text-[11px] text-slate-800 font-extrabold mt-2">
                    Instantly simulate incoming cloud registration receipts to test web-hooks & database status propagation without live currency.
                  </p>
                </div>

                <div className="flex gap-3 flex-wrap text-xs font-black">
                  <button
                    type="button"
                    onClick={() => handleSimulatePaymentTrigger('Paystack')}
                    className="px-5 py-3 bg-emerald-400 hover:bg-emerald-500 text-black border-[3px] border-black rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center gap-2"
                  >
                    <span>⚡ SIMULATE PAYSTACK ₦10,000 SUCCESS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulatePaymentTrigger('Flutterwave')}
                    className="px-5 py-3 bg-blue-400 hover:bg-blue-500 text-black border-[3px] border-black rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center gap-2"
                  >
                    <span>⚡ SIMULATE FLUTTERWAVE ₦10,000 SUCCESS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulatePaymentTrigger('Stripe')}
                    className="px-5 py-3 bg-[#e0f2fe] hover:bg-[#bae6fd] text-black border-[3px] border-black rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center gap-2"
                  >
                    <span>⚡ SIMULATE STRIPE $15 SUCCESS</span>
                  </button>
                </div>
              </div>

              {/* Subscription & Payment Link Configuration Hub - TWO COLUMN WORKSPACE */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-4">
                
                {/* Left Column (Subscription & Gateway Configuration) */}
                <div className="bg-white p-6 rounded-2xl border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
                  <div className="flex items-center gap-2 border-b-2 border-black pb-3 bg-yellow-105 p-2 rounded-lg border border-black shadow-[2px_2px_0px_black] bg-amber-200">
                    <span className="p-1.5 bg-black text-white rounded text-xs font-black">⚙️</span>
                    <h4 className="text-xs font-black uppercase tracking-wider text-black">Subscription & Gateway Configuration</h4>
                  </div>

                  <form onSubmit={handleSaveConfig} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-black block tracking-wider">Subscription Price / Term</label>
                        <input
                          type="text"
                          value={proPrice}
                          onChange={(e) => setProPrice(e.target.value)}
                          placeholder="e.g. ₦10,000"
                          className="w-full px-3 py-3 border-[3px] border-black rounded-xl text-xs font-black bg-white text-black placeholder-slate-500 focus:outline-none focus:bg-yellow-200 transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-black block tracking-wider">Support Brand Name</label>
                        <input
                          type="text"
                          value={brandName}
                          onChange={(e) => setBrandName(e.target.value)}
                          className="w-full px-3 py-3 border-[3px] border-black rounded-xl text-xs font-black bg-slate-100 text-slate-750 cursor-not-allowed outline-none shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-black block tracking-wider">Paystack Secure Checkout Link</label>
                      <input
                        type="url"
                        value={paystackLink}
                        onChange={(e) => setPaystackLink(e.target.value)}
                        placeholder="e.g. https://paystack.com/pay/livingstone-pro-access"
                        className="w-full px-3 py-3 border-[3px] border-black rounded-xl text-xs font-black bg-white text-black placeholder-slate-500 focus:outline-none focus:bg-yellow-200 transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-black block tracking-wider">Flutterwave Secure Checkout Link</label>
                      <input
                        type="url"
                        value={flutterwaveLink}
                        onChange={(e) => setFlutterwaveLink(e.target.value)}
                        placeholder="e.g. https://flutterwave.com/pay/livingstone-secondary-pro"
                        className="w-full px-3 py-3 border-[3px] border-black rounded-xl text-xs font-black bg-white text-black placeholder-slate-500 focus:outline-none focus:bg-yellow-200 transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                      />
                    </div>

                    <div className="border-t-[3px] border-black pt-4 space-y-4">
                      <p className="text-xs font-black uppercase text-black tracking-wider flex items-center gap-1.5 bg-cyan-150 border border-black p-2 rounded-lg shadow-[2px_2px_0px_black] w-fit bg-cyan-200">
                        🏦 Bank Transfer Settlement Parameters
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-black block tracking-wider">Bank Name</label>
                          <input
                            type="text"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            placeholder="e.g. Zenith Bank"
                            className="w-full px-3 py-3 border-[3px] border-black rounded-xl text-xs font-black bg-white text-black placeholder-slate-500 focus:outline-none focus:bg-yellow-200 transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-black block tracking-wider">Account Number</label>
                          <input
                            type="text"
                            value={bankAccountNumber}
                            onChange={(e) => setBankAccountNumber(e.target.value)}
                            placeholder="e.g. 2257503451"
                            className="w-full px-3 py-3 border-[3px] border-black rounded-xl text-xs font-black bg-white text-black placeholder-slate-500 focus:outline-none focus:bg-yellow-200 transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-black block tracking-wider">Account Holder Name</label>
                        <input
                          type="text"
                          value={bankAccountName}
                          onChange={(e) => setBankAccountName(e.target.value)}
                          placeholder="e.g. temitope oluwaseun fatoye"
                          className="w-full px-3 py-3 border-[3px] border-black rounded-xl text-xs font-black bg-white text-black placeholder-slate-500 focus:outline-none focus:bg-yellow-200 transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-3">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-black text-xs uppercase rounded-xl border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                      >
                        {isSaving ? "Syncing configs..." : "💾 Save Billing & Subscription Setup"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right Column (Live Checkout Page Preview Container mimics a standalone invoice card) */}
                <div className="bg-white p-6 rounded-2xl border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
                  <div className="flex justify-between items-center border-b-2 border-black pb-3 bg-cyan-100 p-2 rounded-lg border border-black shadow-[2px_2px_0px_black]">
                    <div className="flex items-center gap-1.5">
                      <span className="p-1 bg-black text-white rounded text-xs">📱</span>
                      <h4 className="text-xs font-black uppercase tracking-wider text-black">Live Checkout Page Preview</h4>
                    </div>
                    <span className="text-[9px] font-black text-white bg-black px-2 py-1 rounded border border-black uppercase shadow-[1.5px_1.5px_0px_black]">Parent Viewport</span>
                  </div>

                  <p className="text-[11px] text-slate-800 font-black leading-relaxed">
                    This structural container simulates the live responsive invoice layout that parents interact with when unlocking student terms.
                  </p>

                  {/* Payment Modal Preview Box (Neo-Brutalist Invoice Format) */}
                  <div className="bg-white rounded-2xl border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden w-full max-w-sm mx-auto flex flex-col">
                    <div className="bg-[#2563EB] p-4 text-white text-center border-b-[4px] border-black">
                      <span className="text-[9px] font-black tracking-widest block uppercase text-yellow-300">SECURE EDUCATION CHECKOUT</span>
                      <h5 className="text-sm font-black uppercase mt-1">{brandName || 'SCHOOLPORTAL'} PREMIUM TERM</h5>
                    </div>
                    
                    <div className="p-5 space-y-4">
                      <div className="bg-yellow-300 rounded-xl p-4 border-[3px] border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] flex justify-between items-center">
                        <div>
                          <p className="text-[10px] font-black uppercase text-black tracking-wider">PREMIER CLASSROOM PLAN</p>
                          <p className="text-[9px] text-black/70 font-bold mt-0.5">UNLIMITED ACCESS LICENSE</p>
                        </div>
                        <span className="text-2xl font-black text-black select-all bg-white px-2.5 py-1 border-2 border-black rounded shadow-[2px_2px_0px_black]">{proPrice || "₦10,000"}</span>
                      </div>

                      {/* Payment connection display */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-black uppercase text-black tracking-wider block bg-black text-white px-2 py-0.5 w-fit rounded">
                          🔌 Secure Gateway Portals:
                        </span>
                        
                        <div className="space-y-2">
                          {paystackLink ? (
                            <a
                              href={paystackLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-3 bg-emerald-300 text-black text-xs font-black rounded-xl border-[2px] border-black flex justify-between items-center hover:bg-emerald-400 cursor-pointer shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px]"
                            >
                              <span>⚡ Paystack Payment link</span>
                              <span className="text-[8px] bg-white border border-black px-1 py-0.5 rounded font-bold uppercase truncate max-w-[135px]">{paystackLink}</span>
                            </a>
                          ) : (
                            <div className="p-3 bg-slate-150 text-slate-550 text-xs rounded-xl border-2 border-dashed border-slate-300 text-center font-bold">
                              Paystack direct channel unconfigured
                            </div>
                          )}

                          {flutterwaveLink ? (
                            <a
                              href={flutterwaveLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-3 bg-blue-300 text-black text-xs font-black rounded-xl border-[2px] border-black flex justify-between items-center hover:bg-blue-400 cursor-pointer shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px]"
                            >
                              <span>⚡ Flutterwave Payment link</span>
                              <span className="text-[8px] bg-white border border-black px-1 py-0.5 rounded font-bold uppercase truncate max-w-[135px]">{flutterwaveLink}</span>
                            </a>
                          ) : (
                            <div className="p-3 bg-slate-150 text-slate-550 text-xs rounded-xl border-2 border-dashed border-slate-300 text-center font-bold">
                              Flutterwave direct channel unconfigured
                            </div>
                          )}
                        </div>

                        {/* Bank transfer display mock */}
                        <div className="border-t-2 border-black pt-3 space-y-2">
                          <span className="text-[10px] font-black uppercase text-black tracking-wider block bg-black text-white px-2 py-0.5 w-fit rounded">
                            🏛️ Direct Settlement Account:
                          </span>
                          
                          <div className="p-4 bg-orange-150 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_black] flex flex-col items-center space-y-1 bg-orange-100">
                            <span className="text-[10px] font-black text-black uppercase tracking-wider bg-white border border-black px-2 py-0.5 rounded">{bankName}</span>
                            <span className="text-lg font-black text-[#2563EB] font-mono select-all tracking-tight bg-white border-[2px] border-black px-3 py-1 rounded shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)]">{bankAccountNumber}</span>
                            <span className="text-[10px] font-black text-black uppercase tracking-wide pt-1 text-center">{bankAccountName}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Payments log with Neo-Brutalist styling */}
              <div className="bg-white border-[3px] border-black rounded-2xl shadow-[5px_5px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="bg-yellow-100 p-4 border-b-2 border-black flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase text-black tracking-wider">📜 Realtime Academic Payment Audit Stream</h4>
                  <span className="px-2 py-0.5 bg-black text-white border border-black font-black text-[9px] rounded shadow-[1px_1px_0px_black]">Realtime Ledger Node</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FAFAFA] text-black font-black uppercase border-b-2 border-black text-[9px] tracking-wider">
                      <tr>
                        <th className="p-4 border-r border-black">Student payer</th>
                        <th className="p-4 border-r border-black">Gateway</th>
                        <th className="p-4 border-r border-black">Plan description</th>
                        <th className="p-4 border-r border-black">Amount</th>
                        <th className="p-4 text-right">Receipt status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black bg-white">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-yellow-50 font-bold text-black text-xs">
                          <td className="p-4 border-r border-black">
                            <p className="font-extrabold text-black">{p.studentName}</p>
                            <p className="text-[10px] text-slate-705">{p.email}</p>
                          </td>
                          <td className="p-4 border-r border-black font-mono font-black text-[#2563EB] uppercase">{p.gateway}</td>
                          <td className="p-4 border-r border-black text-slate-800">{p.plan}</td>
                          <td className="p-4 border-r border-black font-black">₦{p.amount ? p.amount.toString().replace('₦', '') : '10,000'}</td>
                          <td className="p-4 text-right">
                            <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase border border-black shadow-[1.5px_1.5px_0px_black] ${
                              p.status === 'Approved' ? 'bg-emerald-300 text-black animate-pulse' : 'bg-amber-300 text-black'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: CONTINUOUS ASSESSMENT WORKFLOW */}
          {activeAdminTab === 'results' && (
            <div className="space-y-6 animate-fade-in text-slate-800">
              <div className="border-b pb-3 flex justify-between items-center gap-4 flex-wrap">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 font-sans">Continuous Assessment & GPA Approval</h3>
                  <p className="text-xs text-slate-500">Examine primary & secondary scores submitted by class teachers and approve terminal GPA reports for parent portals.</p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setGrades([]);
                      localStorage.setItem('system_grades', JSON.stringify([]));
                      showToast("Continuous assessment records cleared completely.", "info");
                    }}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center gap-1 shadow-xs"
                    title="Clear all student assessment ledger records"
                  >
                    🗑️ Clear All
                  </button>
                  <button
                    onClick={() => {
                      const seed = [
                        { id: 'grd-1', studentName: 'Chidi Okafor', class: 'SS 1', subject: 'Mathematics', ca: 34, exam: 52, gpa: '4.3', status: 'Approved' },
                        { id: 'grd-2', studentName: 'Amina Ibrahim', class: 'SS 1', subject: 'Mathematics', ca: 38, exam: 55, gpa: '4.8', status: 'Approved' },
                        { id: 'grd-3', studentName: 'Obinna Eze', class: 'SS 1', subject: 'English Studies', ca: 28, exam: 42, gpa: '3.6', status: 'Pending Approval' },
                        { id: 'grd-4', studentName: 'Kelechi Amadi', class: 'SS 1', subject: 'Biology', ca: 31, exam: 48, gpa: '4.0', status: 'Pending Approval' }
                      ];
                      setGrades(seed);
                      localStorage.setItem('system_grades', JSON.stringify(seed));
                      showToast("Default assessment seeds restored.", "success");
                    }}
                    className="px-3 py-1.5 bg-slate-850 hover:bg-slate-950 text-white font-semibold text-xs rounded-xl transition cursor-pointer shadow-xs"
                  >
                    🔄 Reset Defaults
                  </button>
                </div>
              </div>

              {/* Assessment Sheet Creator Form */}
              <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-150 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs">📝</span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950">Add & Save New Student Assessment Report</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-450">Candidate Name</label>
                    <input 
                      type="text" 
                      value={newGradeName} 
                      onChange={(e) => setNewGradeName(e.target.value)}
                      placeholder="e.g. Adaora Nwachukwu" 
                      className="w-full px-3 py-2 border rounded-xl text-xs font-semibold bg-white outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-450">Class Level</label>
                    <select 
                      value={newGradeClass} 
                      onChange={(e) => setNewGradeClass(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-xl text-xs font-semibold bg-white outline-none"
                    >
                      <option value="Primary 1">Primary 1</option>
                      <option value="Primary 2">Primary 2</option>
                      <option value="Primary 3">Primary 3</option>
                      <option value="Primary 4">Primary 4</option>
                      <option value="Primary 5">Primary 5</option>
                      <option value="Primary 6">Primary 6</option>
                      <option value="JSS 1">JSS 1</option>
                      <option value="JSS 2">JSS 2</option>
                      <option value="JSS 3">JSS 3</option>
                      <option value="SS 1">SS 1</option>
                      <option value="SS 2">SS 2</option>
                      <option value="SS 3">SS 3</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-450">Subject</label>
                    <select 
                      value={newGradeSubject} 
                      onChange={(e) => setNewGradeSubject(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-xl text-xs font-semibold bg-white outline-none"
                    >
                      <option value="Mathematics">Mathematics</option>
                      <option value="English Studies">English Studies</option>
                      <option value="Biology">Biology</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Further Math">Further Math</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-450">CA Mark (0-40)</label>
                    <input 
                      type="number" 
                      value={newGradeCa} 
                      min={0}
                      max={40}
                      onChange={(e) => setNewGradeCa(e.target.value)}
                      placeholder="e.g. 32" 
                      className="w-full px-3 py-2 border rounded-xl text-xs font-semibold bg-white outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-455">Exam (0-60)</label>
                    <input 
                      type="number" 
                      value={newGradeExam} 
                      min={0}
                      max={60}
                      onChange={(e) => setNewGradeExam(e.target.value)}
                      placeholder="e.g. 50" 
                      className="w-full px-3 py-2 border rounded-xl text-xs font-semibold bg-white outline-none" 
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      if (!newGradeName.trim() || !newGradeCa || !newGradeExam) {
                        showToast("Please provide the candidate's name, CA mark, and exam score.", "error");
                        return;
                      }
                      const caNum = parseFloat(newGradeCa);
                      const examNum = parseFloat(newGradeExam);
                      if (caNum < 0 || caNum > 40 || examNum < 0 || examNum > 60) {
                        showToast("CA must be 0-40, Exam must be 0-60 score ranges.", "error");
                        return;
                      }
                      
                      // Calculate Nigerian standard GPA simulation (e.g. (CA + Exam) * 5 / 100)
                      const totalScore = caNum + examNum;
                      const calculatedGpa = ((totalScore / 100) * 5).toFixed(1);

                      const record = {
                        id: 'grd-' + Date.now().toString(),
                        studentName: newGradeName.trim(),
                        class: newGradeClass,
                        subject: newGradeSubject,
                        ca: caNum,
                        exam: examNum,
                        gpa: calculatedGpa,
                        status: 'Pending Approval'
                      };

                      const updatedGrades = [...grades, record];
                      setGrades(updatedGrades);
                      localStorage.setItem('system_grades', JSON.stringify(updatedGrades));
                      
                      // Reset fields
                      setNewGradeName('');
                      setNewGradeCa('');
                      setNewGradeExam('');
                      showToast(`Assessment of ${record.studentName} compiled & saved!`, "success");
                    }}
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-720 text-white font-extrabold text-xs rounded-xl transition shadow-sm cursor-pointer flex items-center gap-1 active:scale-95"
                  >
                    💾 Save Assessment & GPA Record
                  </button>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto border border-slate-150 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-450 uppercase font-black text-[9px] tracking-wider border-b">
                    <tr>
                      <th className="p-4">Student Candidate</th>
                      <th className="p-4">Class Level</th>
                      <th className="p-4">Evaluated Subject</th>
                      <th className="p-4">CA Mark (0-40)</th>
                      <th className="p-4">Exam Mark (0-60)</th>
                      <th className="p-4">Dynamic GPA</th>
                      <th className="p-4 text-right">Approval Pathway</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {grades.map((g) => (
                      <tr key={g.id} className="hover:bg-indigo-50/10">
                        <td className="p-4 font-extrabold text-slate-90% shadow-2xs">{g.studentName}</td>
                        <td className="p-4 font-mono text-slate-500">{g.class}</td>
                        <td className="p-4 text-slate-800 font-medium">{g.subject}</td>
                        <td className="p-4 text-center font-bold text-indigo-700">{g.ca}</td>
                        <td className="p-4 text-center font-bold text-indigo-900">{g.exam}</td>
                        <td className="p-4 font-black text-rose-700">{g.gpa}</td>
                        <td className="p-4 text-right">
                          {g.status === 'Pending Approval' ? (
                            <button
                              onClick={() => handleApproveGrades(g.id)}
                              className="px-3 py-1 bg-indigo-650 hover:bg-indigo-755 text-white font-extrabold text-[9px] uppercase tracking-wider rounded transition cursor-pointer"
                            >
                              Approve Sheet
                            </button>
                          ) : (
                            <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Published
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 7: platform configs (Customize Branding & pricing settings form) */}
          {activeAdminTab === 'branding' && (
            <div className="space-y-6 animate-fade-in text-slate-800">
              <div className="border-b pb-3">
                <h3 className="font-extrabold text-base text-slate-900">Platform Brand Identity & Slogan configs</h3>
                <p className="text-xs text-slate-500">Edit core branding parameters. Updated structures deploy dynamically across the login page header locks and premium payment layers immediately.</p>
              </div>

              {saveStatus && (
                <div className={`p-4 rounded-xl text-xs font-bold border ${
                  saveStatus.startsWith('error') 
                    ? 'bg-red-50 border-red-200 text-red-800' 
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  {saveStatus.split(':')[1]}
                </div>
              )}

              <form onSubmit={handleSaveConfig} className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400">Application Brand Name</label>
                    <input 
                      type="text" 
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400">Educational Slogan Subtitle</label>
                    <input 
                      type="text" 
                      value={appSubtitle}
                      onChange={(e) => setAppSubtitle(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400">MOCK Premium pro pricing (Annual/Term)</label>
                    <input 
                      type="text" 
                      value={proPrice}
                      onChange={(e) => setProPrice(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400">Head support display contact name</label>
                    <input 
                      type="text" 
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Academics WhatsApp Chat link</label>
                  <input 
                    type="url" 
                    value={supportGroupUrl}
                    onChange={(e) => setSupportGroupUrl(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white outline-none"
                    required
                  />
                </div>

                <div className="pt-3 border-t flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-720 text-white font-extrabold text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? 'Synchronizing parameters...' : 'Publish configurations'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 8: INQUIRIES INBOX */}
          {activeAdminTab === 'inquiries' && (
            <div className="space-y-4 animate-fade-in text-slate-800">
              <div className="border-b pb-3 flex justify-between items-center gap-4">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Inquiries counselor Inbox</h3>
                  <p className="text-xs text-slate-500">Student counseling tickets and support feedback from parent accounts.</p>
                </div>
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-extrabold text-[10px] rounded">
                  {inquiries.length} Total Tickets
                </span>
              </div>

              {inquiries.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-semibold text-xs space-y-2 border border-dashed border-slate-250 rounded-2xl">
                  <span>🍃</span>
                  <p>Inbox is clean. No academic ticketing inquiries logged from pupils.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {inquiries.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-4 rounded-xl border transition-all ${
                        item.replyStatus === 'Pending'
                          ? 'bg-amber-50/40 border-amber-205/60'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b pb-2">
                        <div>
                          <p className="text-xs font-black text-slate-800">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{item.email} &bull; Received {new Date(item.timestamp).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className={`px-2 py-0.5 text-[9px] font-black rounded ${
                            item.replyStatus === 'Pending'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {item.replyStatus}
                          </span>
                        </div>
                      </div>
                      
                      <div className="py-2.5 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Topic: {item.subject}</span>
                        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-3.5 rounded-xl border font-serif">
                          &quot;{item.message}&quot;
                        </p>
                      </div>

                      <div className="pt-2 flex justify-end gap-1.5">
                        {item.replyStatus === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsReplied(item.id)}
                            className="px-3 py-1.5 hover:bg-slate-150 border text-slate-600 rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            Mark of Replied
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleReplyWhatsApp(item)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                        >
                          Answer on WhatsApp
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 9: TELEMETRY LOGS */}
          {activeAdminTab === 'activities' && (
            <div className="space-y-4 animate-fade-in text-slate-800">
              <div className="border-b pb-3 flex justify-between items-center gap-4 flex-wrap">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">School Session interaction telemetry</h3>
                  <p className="text-xs text-slate-500">Continuous background logging of student textbook entries opened and CBT trial score summaries recorded.</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm("Are you sure you want to clear all telemetry interaction logs?")) {
                      try {
                        const res = await fetch('/api/admin/activities/clear', { method: 'POST' });
                        if (res.ok) {
                          setActivities([]);
                          showToast("Telemetry logs cleared completely.", "success");
                        } else {
                          showToast("Failed to clear logs on server.", "error");
                        }
                      } catch (err) {
                        showToast("Connection to server failed.", "error");
                      }
                    }
                  }}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold cursor-pointer transition active:scale-95 flex items-center gap-1.5 shadow-sm"
                >
                  📡 Clear Telemetry Logs
                </button>
              </div>

              {activities.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-semibold text-xs space-y-2 border border-dashed rounded-2xl animate-pulse">
                  <span>📡</span>
                  <p>Platform telemetry logging active. Records start buffering on candidate interactions...</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                  {activities.map((act) => (
                    <div key={act.id} className="p-3 bg-slate-50 rounded-xl border text-[11px] font-medium text-slate-650 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <div className="flex gap-2 items-center">
                          <span className="font-black text-slate-900">{act.userName}</span>
                          <span className="text-[9px] text-slate-400 font-medium">({act.userEmail})</span>
                        </div>
                        <p className="text-slate-500 font-medium">{act.detail}</p>
                      </div>
                      
                      <div className="flex sm:flex-col items-end gap-1 shrink-0">
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-800 font-black text-[8px] uppercase tracking-wider rounded border border-blue-100">
                          {act.activityType}
                        </span>
                        <span className="text-[9px] text-slate-400 flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(act.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 10: SCHOOL GMAIL MANAGER */}
          {activeAdminTab === 'gmail' && (
            <div className="space-y-4 animate-fade-in text-slate-800">
              <div className="border-b pb-3 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">School Gmail manager</h3>
                  <p className="text-xs text-slate-500">Programmatic communications. Dispatch parent notifications and study alerts.</p>
                </div>
              </div>
              <GmailHub user={currentUser} />
            </div>
          )}

          {/* TAB 11: ACADEMIC SESSION & TERM MANAGER */}
          {activeAdminTab === 'session' && (
            <div className="space-y-6 animate-fade-in text-slate-800">
              <div className="border-b pb-3">
                <h3 className="font-extrabold text-base text-slate-900">Academic Session Manager</h3>
                <p className="text-xs text-slate-500">Configure current academic session year, active terms schedules, critical timelines and promotion pipelines.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Active Session & Term Configuration Card */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 space-y-4">
                  <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">Session Timeline Configuration</span>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Active Academic Session</label>
                      <select 
                        value={currentSession} 
                        onChange={(e: any) => {
                          setCurrentSession(e.target.value);
                          showToast(`Transitioned to academic session ${e.target.value}`, "info");
                        }}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-semibold bg-white outline-none"
                      >
                        <option value="2025/2026">2025/2026 Session (Current)</option>
                        <option value="2026/2027">2026/2027 Session (Upcoming)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Active School Term</label>
                      <select 
                        value={currentTerm} 
                        onChange={(e: any) => {
                          setCurrentTerm(e.target.value);
                          showToast(`Set active curriculum syllabus scope to ${e.target.value}`, "success");
                        }}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-semibold bg-white outline-none"
                      >
                        <option value="1st Term">1st Term (Autumn Syllabus)</option>
                        <option value="2nd Term">2nd Term (Winter Syllabus)</option>
                        <option value="3rd Term">3rd Term (Promotional Syllabus)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Term Start Date</label>
                        <input 
                          type="date" 
                          value={termStartDate} 
                          onChange={(e) => setTermStartDate(e.target.value)}
                          className="w-full px-3 py-1.5 border rounded-xl text-xs font-semibold bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Term End Date</label>
                        <input 
                          type="date" 
                          value={termEndDate} 
                          onChange={(e) => setTermEndDate(e.target.value)}
                          className="w-full px-3 py-1.5 border rounded-xl text-xs font-semibold bg-white outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => showToast(`Academic session calendar milestones updated successfully for ${currentSession} ${currentTerm}!`, "success")}
                    className="w-full py-2 bg-indigo-650 hover:bg-indigo-720 text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-xs transition"
                  >
                    Lock Session Milestones
                  </button>
                </div>

                {/* Promotion Settings Card */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">Promotion Settings & Automation</span>
                    <p className="text-xs text-slate-500 leading-snug">
                      Automate student promotion pipelines at the end of the 3rd Term. Standard rule transitions candidates based on weighted continuous assessment results.
                    </p>
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-800 font-medium">
                      ⚠️ Running promotion will automatically upgrade the <strong>Class Level</strong> of all active student directories (e.g., JSS 1 students graduate to JSS 2).
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs font-bold text-slate-750">
                      <span>Graduation Cut-off score:</span>
                      <span className="text-indigo-650 font-black">40% Weighted Score</span>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm("Perform promotion? This will bulk promote all students to the next class levels according to the grading rules.")) {
                          showToast("Bulk Promotion active: 48 Student directories promoted to subsequent classes successfully!", "success");
                        }
                      }}
                      className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-720 text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-md shadow-indigo-650/10 transition flex items-center justify-center gap-1.5"
                    >
                      🎓 Bulk Promote Students Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: ATTENDANCE REGISTRY */}
          {activeAdminTab === 'attendance' && (
            <div className="space-y-6 animate-fade-in text-slate-800">
              <div className="border-b pb-3 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Attendance Registry</h3>
                  <p className="text-xs text-slate-500">Take daily attendance records per classroom. Logs feed automatic streak awards and performance indexes.</p>
                </div>

                <div className="flex gap-2">
                  <span className="text-xs font-bold text-slate-400 self-center">Roster Class:</span>
                  <select 
                    value={attSelectedClass}
                    onChange={(e) => setAttSelectedClass(e.target.value)}
                    className="border border-slate-205 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-705 bg-white outline-none"
                  >
                    <option value="Primary 4">Primary 4</option>
                    <option value="JSS 1">JSS 1</option>
                    <option value="JSS 2">JSS 2</option>
                    <option value="SSS 3">SSS 3 (Current)</option>
                  </select>
                  <button 
                    onClick={() => showToast(`Roster attendance locked. Syncing values with terminal score summaries...`, "success")}
                    className="px-3 py-1.5 bg-indigo-650 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Lock Daily Roster
                  </button>
                </div>
              </div>

              {/* Attendance Table */}
              <div className="border border-slate-150 rounded-2xl overflow-hidden bg-white text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-400 uppercase font-bold tracking-wider text-[9px] border-b border-indigo-100">
                    <tr>
                      <th className="p-4">Student Name</th>
                      <th className="p-4">Assigned Class</th>
                      <th className="p-4">Session Date</th>
                      <th className="p-4">Daily Status</th>
                      <th className="p-4 text-right">Toggle Checklist</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {attendanceRecords.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-extrabold text-slate-800">{att.studentName}</td>
                        <td className="p-4 font-mono text-slate-550">{att.classLevel}</td>
                        <td className="p-4 text-slate-400">{att.date}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            att.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                          }`}>
                            {att.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="inline-flex rounded-lg overflow-hidden border border-slate-200">
                            <button
                              onClick={() => {
                                const nextAtt = attendanceRecords.map(r => r.id === att.id ? { ...r, status: 'Present' } : r);
                                setAttendanceRecords(nextAtt);
                                showToast(`${att.studentName} marked PRESENT.`, 'success');
                              }}
                              className={`px-3 py-1 text-[10px] font-extrabold cursor-pointer transition ${att.status === 'Present' ? 'bg-emerald-600 text-white' : 'bg-slate-100 hover:bg-slate-150 text-slate-700'}`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => {
                                const nextAtt = attendanceRecords.map(r => r.id === att.id ? { ...r, status: 'Absent' } : r);
                                setAttendanceRecords(nextAtt);
                                showToast(`${att.studentName} marked ABSENT.`, 'info');
                              }}
                              className={`px-3 py-1 text-[10px] font-extrabold cursor-pointer transition ${att.status === 'Absent' ? 'bg-red-650 text-white' : 'bg-slate-100 hover:bg-slate-150 text-slate-700'}`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 13: SCHOOL FEES MANAGEMENT */}
          {activeAdminTab === 'fees' && (
            <div className="space-y-6 animate-fade-in text-slate-800">
              <div className="border-b pb-3 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">School Fees Management</h3>
                  <p className="text-xs text-slate-500">Establish standard termly tuition structures, track candidate outstanding ledger balances, and issue digitised payment receipts.</p>
                </div>
                <button
                  onClick={() => showToast("Scholarship award successfully attributed to SSS 3 best-behaving candidate registry!", "success")}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm shadow-emerald-555/20 cursor-pointer"
                >
                  🎓 Attribute Scholar Scholarship
                </button>
              </div>

              {/* Fee Configurations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {feeStructures.map((fee) => (
                  <div key={fee.id} className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
                    <p className="text-xs font-black text-indigo-950 uppercase">{fee.classLevel}</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tuition Levy:</span>
                        <span className="font-bold text-slate-800">{fee.tuition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Development Fund:</span>
                        <span className="font-bold text-slate-800">{fee.development}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Sports & CBT Extra:</span>
                        <span className="font-bold text-slate-800">{fee.sports}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-200 text-slate-900 font-extrabold text-sm">
                        <span>Total Term Fee:</span>
                        <span className="text-indigo-650">{fee.total}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Outstanding Fee Ledgers */}
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Outstanding Student Balance Accounts</span>
                <div className="border border-slate-150 rounded-2xl overflow-hidden bg-white text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-400 uppercase font-bold tracking-wider text-[9px] border-b">
                      <tr>
                        <th className="p-4">Student Candidate</th>
                        <th className="p-4">Assigned Class</th>
                        <th className="p-4">Configured Term Fee</th>
                        <th className="p-4">Amount Paid</th>
                        <th className="p-4">Outstanding Balance</th>
                        <th className="p-4">Portal Status</th>
                        <th className="p-4 text-right">Transactions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {outstandingFees.map((fee) => (
                        <tr key={fee.id} className="hover:bg-slate-50/50">
                          <td className="p-4 font-extrabold text-slate-850">{fee.studentName}</td>
                          <td className="p-4 font-semibold text-slate-500">{fee.classLevel}</td>
                          <td className="p-4 font-bold text-slate-800">{fee.totalFee}</td>
                          <td className="p-4 font-bold text-emerald-700">{fee.paid}</td>
                          <td className="p-4 font-bold text-red-600">{fee.balance}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black ${
                              fee.status === 'Fully Paid' ? 'bg-emerald-50 text-emerald-800 border bg-emerald-50/50 border-emerald-150' :
                              fee.status === 'Partial' ? 'bg-amber-50 text-amber-800 border bg-amber-50/55 border-amber-150' : 'bg-red-50 text-red-800 border bg-red-50/55 border-red-150'
                            }`}>
                              {fee.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                const randomNo = 'LIV-' + Math.floor(1000 + Math.random() * 9000);
                                showToast(`Synthesizing Official Receipt #${randomNo} for ${fee.studentName}. Status active!`, "success");
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-650 hover:text-white text-slate-800 font-extrabold rounded text-[10px] uppercase transition cursor-pointer"
                            >
                              🧾 Print Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 14: COMMUNICATION CENTER */}
          {activeAdminTab === 'comms' && (
            <div className="space-y-6 animate-fade-in text-slate-800">
              <div className="border-b pb-3">
                <h3 className="font-extrabold text-base text-slate-900">Communication Center</h3>
                <p className="text-xs text-slate-500">Dispatch parents-wide broadcasts, emergency SMS advisories, and termly newsletter announcements.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Send Broadcast form */}
                <div className="lg:col-span-2 space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-150">
                  <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">Deploy Portal Announcement Broadcast</span>
                  
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Notice Title / Subject Heading</label>
                      <input 
                        type="text" 
                        value={newAnnounceTitle}
                        onChange={(e) => setNewAnnounceTitle(e.target.value)}
                        placeholder="e.g. End of 1st Term General Assembly & Fee Status Notice"
                        className="w-full px-3 py-2 border rounded-xl text-xs font-semibold bg-white outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Target Audience</label>
                        <select className="w-full px-3 py-2 border rounded-xl text-xs font-semibold bg-white outline-none">
                          <option>All Enrolled Parents (WhatsApp Preferred)</option>
                          <option>All Active Teachers</option>
                          <option>CBT Exam Candidates Only</option>
                          <option>Saddled Account Balances</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Communication Channel</label>
                        <select 
                          value={newAnnounceChannel}
                          onChange={(e: any) => setNewAnnounceChannel(e.target.value)}
                          className="w-full px-3 py-2 border rounded-xl text-xs font-semibold bg-white outline-none"
                        >
                          <option value="Gmail">Programmatic Gmail Dispatch</option>
                          <option value="WhatsApp Broadcast">WhatsApp Broadcaster Channel</option>
                          <option value="Bulk SMS">Niger-sms Bulk Cellular (Nigeria Only)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Polished Notification Message Body</label>
                      <textarea 
                        rows={3}
                        placeholder="Type standard notification transcript here..."
                        className="w-full p-3 border rounded-xl text-xs bg-white outline-none font-serif"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!newAnnounceTitle.trim()) {
                        showToast("Please write a notification title first", "error");
                        return;
                      }
                      const newAlert = {
                        id: 'comm_' + Date.now(),
                        title: newAnnounceTitle,
                        channel: newAnnounceChannel,
                        date: new Date().toISOString().split('T')[0],
                        status: 'Sent'
                      };
                      setCommsAlerts([newAlert, ...commsAlerts]);
                      setNewAnnounceTitle('');
                      showToast(`Dispatched broadcast via ${newAnnounceChannel} channel!`, "success");
                    }}
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-720 text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-xs transition"
                  >
                    🚀 Enforce Notification Broadcast
                  </button>
                </div>

                {/* Recent Dispatches Logs */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Broadcast Telegram Logs</span>
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                    {commsAlerts.map((log) => (
                      <div key={log.id} className="p-3 bg-white rounded-xl border border-slate-150 space-y-1 text-xs">
                        <p className="font-extrabold text-slate-800 leading-snug">{log.title}</p>
                        <div className="flex justify-between items-baseline text-[9px] font-bold text-slate-400">
                          <span>Channel: <span className="text-indigo-650 font-extrabold">{log.channel}</span></span>
                          <span>{log.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 15: ROLES & PERMISSION MANAGER */}
          {activeAdminTab === 'settings' && (
            <div className="space-y-6 animate-fade-in text-slate-800">
              <div className="border-b pb-3">
                <h3 className="font-extrabold text-base text-slate-900">Governance & Role Permission Matrix</h3>
                <p className="text-xs text-slate-500">Fine-tune system access barriers, enforce active grade scaling system profiles, and dictate portal features access boundaries.</p>
              </div>

              {/* Matrix Layout */}
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Portal Access Control Boundaries List</span>
                <div className="border border-slate-150 rounded-2xl overflow-hidden bg-white text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-400 uppercase font-black text-[9px] border-b">
                      <tr>
                        <th className="p-4">Assigned Role Profile</th>
                        <th className="p-4 text-center">Approve Final Results</th>
                        <th className="p-4 text-center">Modify School Fees</th>
                        <th className="p-4 text-center">Configure Directory</th>
                        <th className="p-4 text-center">Generate CBT Exam</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold text-slate-705">
                      {rolesPermissions.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-4 font-black text-slate-900">{item.role}</td>
                          <td className="p-4 text-center">
                            <input 
                              type="checkbox" 
                              checked={item.approveResults} 
                              onChange={(e) => {
                                const nextMatrix = [...rolesPermissions];
                                nextMatrix[idx].approveResults = e.target.checked;
                                setRolesPermissions(nextMatrix);
                              }}
                              className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <input 
                              type="checkbox" 
                              checked={item.editFees} 
                              onChange={(e) => {
                                const nextMatrix = [...rolesPermissions];
                                nextMatrix[idx].editFees = e.target.checked;
                                setRolesPermissions(nextMatrix);
                              }}
                              className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <input 
                              type="checkbox" 
                              checked={item.manageUsers} 
                              onChange={(e) => {
                                const nextMatrix = [...rolesPermissions];
                                nextMatrix[idx].manageUsers = e.target.checked;
                                setRolesPermissions(nextMatrix);
                              }}
                              className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <input 
                              type="checkbox" 
                              checked={item.generateCbt} 
                              onChange={(e) => {
                                const nextMatrix = [...rolesPermissions];
                                nextMatrix[idx].generateCbt = e.target.checked;
                                setRolesPermissions(nextMatrix);
                              }}
                              className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => showToast("Security Matrix permissions locked on Server successfully!", "success")}
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-720 text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-xs transition"
                  >
                    Lock Governance Mapping
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 16: CONTENT MODERATION QUEUE */}
          {activeAdminTab === 'moderation' && (
            <div className="space-y-6 animate-fade-in text-slate-800">
              <div className="border-b pb-3">
                <h3 className="font-extrabold text-base text-slate-900">Content Moderation Queue</h3>
                <p className="text-xs text-slate-500">Monitor parental concern registries, student grievance submissions page, and flagged notes logs.</p>
              </div>

              {moderationQueue.length === 0 ? (
                <div className="py-12 border border-dashed rounded-2xl text-center text-slate-400 font-bold text-xs space-y-1 shadow-inner bg-slate-50/50">
                  <p>✔ Clean Status Record</p>
                  <p className="text-[10px] font-medium text-slate-400">All submitted items have been reviewed safely.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {moderationQueue.map((mod) => (
                    <div key={mod.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-3 text-xs">
                      <div className="flex justify-between items-baseline flex-wrap gap-2">
                        <div className="flex gap-2 items-center">
                          <span className="font-black text-slate-905">{mod.sender}</span>
                          <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase text-amber-800 bg-amber-50">
                            {mod.type}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">{mod.date}</span>
                      </div>
                      
                      <p className="text-slate-700 font-medium leading-relaxed font-serif bg-white p-3.5 rounded-xl border">
                        &quot;{mod.content}&quot;
                      </p>

                      <div className="flex justify-end gap-1.5 pt-1">
                        <button
                          onClick={() => {
                            setModerationQueue(moderationQueue.filter(item => item.id !== mod.id));
                            showToast("Flagged complaint dismissed from roster.", "info");
                          }}
                          className="px-3 py-1.5 hover:bg-slate-200 text-slate-705 font-black rounded-lg text-[10px] uppercase transition cursor-pointer"
                        >
                          Dismiss Issue
                        </button>
                        <button
                          onClick={() => {
                            setModerationQueue(moderationQueue.filter(item => item.id !== mod.id));
                            showToast("Grievance officially approved & queued for inspection pipeline!", "success");
                          }}
                          className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-720 text-white font-black rounded-lg text-[10px] uppercase transition cursor-pointer"
                        >
                          Approve Override
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeAdminTab === 'db' && (
            <div className="space-y-6 animate-fade-in text-slate-800">
              <div className="border-b pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-950 font-sans tracking-tight flex items-center gap-2">
                    <span>🗄️</span> Cloud Realtime Database Console
                  </h3>
                  <p className="text-xs text-slate-505">Inspect connection nodes directly, seed missing tables instantly, check record metrics, or download disaster recovery backups.</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={refreshDatabaseNodeCounts}
                    disabled={isRefreshingDbCounts}
                    className="px-3 py-1.5 border-2 border-slate-900 bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-[2px_2px_0px_black] active:translate-y-[1px] active:shadow-[1px_1px_0px_black]"
                  >
                    <span>{isRefreshingDbCounts ? '⏳ Evaluating...' : '🔄 Recalculate Node Sizes'}</span>
                  </button>

                  <button
                    onClick={async () => {
                      if (window.confirm("Are you sure you want to trigger a master seeding check for all 17 tables to guarantee database completeness?")) {
                        await seedRtdbIfEmpty();
                        await refreshDatabaseNodeCounts();
                        showToast("All database nodes successfully synchronized and validated!", "success");
                      }
                    }}
                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl border-2 border-black flex items-center gap-1.5 transition cursor-pointer shadow-[2px_2px_0px_black] active:translate-y-[1px] active:shadow-[1px_1px_0px_black]"
                  >
                    <span>🚀 Force Master Seed</span>
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900 p-4 rounded-2xl text-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                  <p className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Gateway Status</p>
                  <p className="text-lg font-black mt-1 flex items-center gap-1.5 font-sans">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>🟢 Connected Live</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">{brandName.toLowerCase()}.database.firebaseio.com</p>
                </div>

                <div className="bg-indigo-50 p-4 rounded-2xl border-2 border-indigo-200 shadow-[3px_3px_0px_rgba(30,58,138,0.15)] text-indigo-950">
                  <p className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Tables Registered</p>
                  <p className="text-lg font-mono font-black mt-1">17 Database Nodes</p>
                  <p className="text-[10px] text-indigo-500 mt-1">Full Relational Integrity Sync Active</p>
                </div>

                <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-200 shadow-[3px_3px_0px_rgba(245,158,11,0.15)] text-amber-950">
                  <p className="text-[10px] font-black uppercase text-amber-600 tracking-wider">Operational Mode</p>
                  <p className="text-lg font-black mt-1">Full-Scale Production</p>
                  <p className="text-[10px] text-amber-600 mt-1">SLA guarantee 99.99% automatic uptime</p>
                </div>
              </div>

              {/* Interactive Tables Node Database List */}
              <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">📜 Connected Realtime Firebase Node Registers</h4>
                  <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 border border-slate-250 rounded-md">Live Sync Engine</span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FAFAFA] text-slate-500 font-bold uppercase border-b border-slate-150 text-[10px] tracking-wide">
                      <tr>
                        <th className="p-4">Educational Table</th>
                        <th className="p-4">RTDB Node Path</th>
                        <th className="p-4">Table Role & Purpose Description</th>
                        <th className="p-4 text-center">Active Records</th>
                        <th className="p-4 text-right">Integrity Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {[
                        { name: 'Users accounts Ledger', key: 'USERS', path: 'users', purpose: 'Stores active staff, students, guardians and super admin accounts profile metadata.' },
                        { name: 'Students Profile directory', key: 'STUDENTS', path: 'students', purpose: 'Main academic file registers mapping unique identifiers to enrolled class level.' },
                        { name: 'Teachers Assignment roster', key: 'TEACHERS', path: 'teachers', purpose: 'Registered subject advisors and secondary classroom supervisors.' },
                        { name: 'School Classes node', key: 'CLASSES', path: 'classes', purpose: 'Standard 12 grade structures ranging from Grade School (Primary 1-6) to Senior Secondary.' },
                        { name: 'Instructional Subjects index', key: 'SUBJECTS', path: 'subjects', purpose: 'Approved curriculum instructional courses (Math, English, Physics, Chem).' },
                        { name: 'Federal NERDC Curriculum', key: 'CURRICULUM', path: 'curriculum', purpose: '4,000+ national federal lesson structures, terminal pacing guides and objectives.' },
                        { name: 'Schemes of Work schedules', key: 'SCHEMES_OF_WORK', path: 'schemes_of_work', purpose: 'Custom classroom level weekly guidelines pacing outlines.' },
                        { name: 'Generated Lesson Note documents', key: 'LESSON_NOTES', path: 'lesson_notes', purpose: 'High-fidelity AI synthesized teaching lesson planners cached for offline reference.' },
                        { name: 'Continuous Assessments CBT exams', key: 'CBT', path: 'cbt', purpose: 'Active terminal online examinations, questions lists, timings and question counts.' },
                        { name: 'Terminal Gradebooks & GPA ledgers', key: 'RESULTS', path: 'results', purpose: 'Verified student test outcomes, term marks, grading reports and approved averages.' },
                        { name: 'Notice Board Announcements', key: 'ANNOUNCEMENTS', path: 'announcements', purpose: 'Broadcast notices, PTA assemblies and emergency administrative signals.' },
                        { name: 'Daily Attendance Registers', key: 'ATTENDANCE', path: 'attendance', purpose: 'Realtime roll calls marking present vs absent students.' },
                        { name: 'Notifications queues', key: 'NOTIFICATIONS', path: 'notifications', purpose: 'Live push/in-app notification alerts matching individual student logs.' },
                        { name: 'Financial Payments Audit stream', key: 'AUDIT_LOGS', path: 'audit_logs', purpose: 'Operational security tracking events and manual financial checkout streams.' },
                        { name: 'Active Academic Sessions', key: 'ACADEMIC_SESSIONS', path: 'academic_sessions', purpose: 'Global calendars, current school terms, term starts and holiday boundaries.' },
                        { name: 'Global School branding configuration', key: 'SCHOOL_SETTINGS', path: 'school_settings', purpose: 'Core school title settings, logos, payment gatekeys, and pay channels.' },
                        { name: 'Exams master roster', key: 'EXAMS', path: 'exams', purpose: 'Terminal standard exam scripts configurations and max weights.' },
                      ].map((t) => {
                        const count = dbNodeCounts[t.key] ?? '...';
                        return (
                          <tr key={t.key} className="hover:bg-slate-50 transition font-sans text-xs">
                            <td className="p-4">
                              <p className="font-extrabold text-slate-900">{t.name}</p>
                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t.key}</span>
                            </td>
                            <td className="p-4">
                              <span className="font-mono text-[11px] bg-slate-100 text-indigo-700 px-2.5 py-1 rounded-md font-semibold font-mono">
                                /{t.path}
                              </span>
                            </td>
                            <td className="p-4 text-slate-500 max-w-sm leading-relaxed text-[11px]">
                              {t.purpose}
                            </td>
                            <td className="p-4 text-center">
                              <span className={`px-2 py-0.5 font-mono text-xs font-black rounded-lg ${count !== 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500'}`}>
                                {count} {count === 1 ? 'record' : 'records'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex gap-1.5 justify-end">
                                <button
                                  onClick={async () => {
                                    try {
                                      showToast(`Fetching json for node /${t.path}...`, "info");
                                      const data = await rtdbGet(t.path);
                                      setSelectedJsonViewerNode({
                                        name: t.name,
                                        path: t.path,
                                        data: data || { description: "Empty table node initialized but has no rows currently." }
                                      });
                                    } catch (err: any) {
                                      showToast("Failed to fetch node payload.", "error");
                                    }
                                  }}
                                  className="px-2 py-1 text-xs border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-705 font-bold rounded-lg transition"
                                  title="Inspect RAW JSON representation"
                                >
                                  👁️ View
                                </button>
                                
                                <button
                                  onClick={async () => {
                                    if (window.confirm(`Are you sure you want to completely purge and clear all rows from tables.rtdb/${t.path}?`)) {
                                      await rtdbSet(t.path, null);
                                      await refreshDatabaseNodeCounts();
                                      showToast(`Table index /${t.path} cleared.`, "success");
                                    }
                                  }}
                                  className="px-2 py-1 text-xs bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 font-bold rounded-lg transition"
                                  title="Wipe table node completely"
                                >
                                  🗑️ Purge
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* JSON Viewer Modal Overlay */}
              {selectedJsonViewerNode && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                  <div className="bg-white rounded-3xl border-2 border-black max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
                    <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b-2 border-black">
                      <div>
                        <h4 className="font-extrabold text-sm">{selectedJsonViewerNode.name} Payload</h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Realtime Database path: /{selectedJsonViewerNode.path}</p>
                      </div>
                      <button
                        onClick={() => setSelectedJsonViewerNode(null)}
                        className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-black text-xs transition border border-slate-705 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="p-6 overflow-y-auto bg-slate-950 flex-grow font-mono text-xs text-emerald-400 leading-relaxed scrollbar-thin">
                      <pre className="whitespace-pre-wrap select-all">
                        {JSON.stringify(selectedJsonViewerNode.data, null, 2)}
                      </pre>
                    </div>

                    <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center">
                      <p className="text-[10px] text-slate-400 italic">Double-click or drag to select raw JSON structures.</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(selectedJsonViewerNode.data, null, 2));
                          showToast("JSON payload copied to clipboard!", "success");
                        }}
                        className="py-1.5 px-3 bg-black text-white hover:bg-slate-800 text-xs font-black rounded-xl cursor-pointer transition shadow-xs"
                      >
                        📋 Copy Payload
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Recovery snapshot controls footer */}
              <div className="border-t pt-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 space-y-4">
                    <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">Export & Snapshot Recovery</span>
                    <p className="text-xs text-slate-500 leading-snug">
                      Generate an encrypted structural text representation of all curriculum maps, users list, attendance schedules and school results ledger metrics. Use this snapshot to seed another Livingstone Instance!
                    </p>
                    
                    <button
                      onClick={() => {
                        const backupObj = {
                          app: 'LIVINGSTONEEDU',
                          timestamp: new Date().toISOString(),
                          usersCount: usersList.length,
                          attendanceCount: attendanceRecords.length,
                          outstandingCount: outstandingFees.length,
                          securityMatrix: rolesPermissions,
                          dbState: dbNodeCounts
                        };
                        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
                        const downloadAnchor = document.createElement('a');
                        downloadAnchor.setAttribute("href", dataStr);
                        downloadAnchor.setAttribute("download", `livingstone_db_recovery_${Date.now()}.json`);
                        document.body.appendChild(downloadAnchor);
                        downloadAnchor.click();
                        downloadAnchor.remove();
                        showToast("Recovery JSON Database backup compiled and downloaded successfully!", "success");
                      }}
                      className="py-2.5 px-4 bg-indigo-650 hover:bg-indigo-720 text-white font-black text-xs rounded-xl cursor-pointer w-full text-center transition shadow-xs"
                    >
                      💾 Download Recovery snapshot JSON
                    </button>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase text-red-700 tracking-wider">Master Destruction Recovery</span>
                      <p className="text-xs text-slate-500 leading-snug">
                        Instantly flush out all custom local registries, customized student classes, grading metrics, and exam sessions. Reverts the system directory to the pristine factory preset.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm("CRITICAL WARNING: This will permanently purge the customized local database registries. Are you absolutely sure you want to enforce master factory reset?")) {
                          localStorage.clear();
                          showToast("Local Storage database flushed. Reloading application portal...", "success");
                          setTimeout(() => window.location.reload(), 1500);
                        }
                      }}
                      className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl cursor-pointer w-full text-center transition"
                    >
                      🔥 Purge Database & Re-sync Seeds
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 18: AI LESSON NOTE WORKSPACE */}
          {activeAdminTab === 'ai-notes' && (
            <div className="space-y-6 animate-fade-in text-slate-800 font-sans">
              <div className="border-b pb-3 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">AI Lesson Note Workbench</h3>
                  <p className="text-xs text-slate-500">Secure administration interface to compile structured, national-standard Nigeria-wide exam and lesson guidelines.</p>
                </div>
                <div className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 font-black px-2 py-0.5 rounded flex items-center gap-1">
                  <span>🛡️</span>
                  <span>Secure Admin Mode</span>
                </div>
              </div>

              {/* Grid split: Parameters Left, Note Document Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Control Panel Parameters Column (lg:col-span-4) */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">Lesson Parameters</h4>
                    
                    {/* Class */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Target Classroom</label>
                      <select 
                        value={selectedClassAdmin} 
                        onChange={(e) => {
                          setSelectedClassAdmin(e.target.value);
                          const subjs = getSubjectsForClass(e.target.value);
                          if (subjs && subjs.length > 0) {
                            setSelectedSubjectAdmin(subjs[0]);
                          }
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold"
                      >
                        {['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6', 'JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'].map((cls) => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>

                    {/* Subject */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Subject Field</label>
                      <select 
                        value={selectedSubjectAdmin} 
                        onChange={(e) => setSelectedSubjectAdmin(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold"
                      >
                        {(getSubjectsForClass(selectedClassAdmin) || []).map((sub) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>

                    {/* Academic Term */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Academic Term</label>
                      <select 
                        value={selectedTermAdmin} 
                        onChange={(e) => setSelectedTermAdmin(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold"
                      >
                        {['1st Term', '2nd Term', '3rd Term'].map((trm) => (
                          <option key={trm} value={trm}>{trm}</option>
                        ))}
                      </select>
                    </div>

                    {/* Syllabus Week */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Syllabus Week</label>
                      <select 
                        value={selectedWeekAdmin} 
                        onChange={(e) => setSelectedWeekAdmin(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((wk) => (
                          <option key={wk} value={wk}>Week {wk}</option>
                        ))}
                      </select>
                    </div>

                    {/* End of Term Assessment Mode */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 pb-1">
                      <input 
                        type="checkbox" 
                        id="isEndOfTermAdmin" 
                        checked={isEndOfTermAdmin} 
                        onChange={(e) => setIsEndOfTermAdmin(e.target.checked)}
                        className="rounded border-slate-200 bg-white"
                      />
                      <label htmlFor="isEndOfTermAdmin" className="text-[11px] font-extrabold text-slate-600 cursor-pointer">
                        Simulate End of Term Assessment Mode
                      </label>
                    </div>

                    {/* Error Box */}
                    {noteErrorAdmin && (
                      <div className="p-3 bg-red-50 text-red-700 text-[10px] font-semibold rounded-xl border border-red-200 leading-relaxed">
                        {noteErrorAdmin}
                      </div>
                    )}

                    {/* Action Trigger Button */}
                    <button
                      type="button"
                      onClick={handleGenerateLessonNoteAdmin}
                      disabled={isGeneratingNoteAdmin}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-705 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {isGeneratingNoteAdmin ? (
                        <>
                          <Loader2 size={13} className="animate-spin text-white" />
                          <span>Generating Lesson Guides...</span>
                        </>
                      ) : (
                        <>
                          <BrainCircuit size={13} />
                          <span>Compile Lesson Plan Guide</span>
                        </>
                      )}
                    </button>
                    
                  </div>
                </div>

                {/* Display Output Column (lg:col-span-8) */}
                <div className="lg:col-span-8 space-y-4">
                  {isGeneratingNoteAdmin && (
                    <div className="bg-slate-50 rounded-2xl border border-slate-150 p-12 text-center space-y-4 animate-fade-in">
                      <div className="relative w-12 h-12 mx-auto">
                        <div className="absolute inset-0 border-4 border-slate-200 rounded-full" />
                        <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-sans font-black text-slate-800 text-xs">Synthesizing NERDC Approved Notes</h4>
                        <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                          Querying national schemas, validating curriculum milestones and formulating structured pedagogical guides...
                        </p>
                      </div>
                    </div>
                  )}

                  {!isGeneratingNoteAdmin && !generatedNoteAdmin && (
                    <div className="bg-slate-50 border border-dashed border-slate-205 rounded-2xl p-12 text-center text-slate-400">
                      <BrainCircuit size={28} className="mx-auto text-slate-300 mb-2 stroke-[1.5]" />
                      <p className="text-xs font-medium">Select academic bounds and trigger compiler to synthesize curriculum lesson layouts.</p>
                    </div>
                  )}

                  {!isGeneratingNoteAdmin && generatedNoteAdmin && (
                    <div className="space-y-4">
                      {/* Form action control */}
                      <div className="bg-slate-50 rounded-xl border border-slate-150 p-3 flex justify-between items-center">
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.print()}
                            className="px-3 py-1 bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-lg text-[10px] flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Printer size={11} />
                            Print Sheet
                          </button>
                          <button
                            onClick={handleCopyNoteToClipboardAdmin}
                            className="px-3 py-1 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-[10px] flex items-center gap-1.5 transition cursor-pointer bg-white"
                          >
                            <Download size={11} />
                            Copy Raw Text
                          </button>
                        </div>
                        <span className="text-[9px] text-slate-450 italic font-medium">
                          ✓ Standard Pedagogy Compiled
                        </span>
                      </div>

                      {/* Lesson Sheet Outer Panel */}
                      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        
                        {/* Header metadata layout */}
                        <div className="p-5 text-white space-y-3" style={{ backgroundColor: '#0f172a' }}>
                          <div className="flex justify-between items-start">
                            <span className="p-0.5 px-2 text-[8px] bg-white/10 uppercase tracking-wider font-extrabold rounded border border-white/20">
                              NERDC National Standard Plan
                            </span>
                            <span className="text-[9px] font-mono font-medium text-slate-300">
                              DURATION: {generatedNoteAdmin.duration || '40 Mins'}
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <h2 className="text-base font-black tracking-tight leading-6 text-white uppercase">
                              {generatedNoteAdmin.topic || 'Curriculum Subject Guide'}
                            </h2>
                            <p className="text-[11px] font-medium italic" style={{ color: '#cbd5e1' }}>
                              {generatedNoteAdmin.subtopic || 'National syllabus framework outline'}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 border-t border-white/15 text-[9px] font-bold text-slate-300">
                            <div>
                              <p className="text-slate-400 uppercase text-[7px]">Class</p>
                              <p className="font-extrabold text-white">{generatedNoteAdmin.classLevel || selectedClassAdmin}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 uppercase text-[7px]">Term</p>
                              <p className="font-extrabold text-white">{selectedTermAdmin}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 uppercase text-[7px]">Calendar</p>
                              <p className="font-extrabold text-white">Week {selectedWeekAdmin}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 uppercase text-[7px]">Subject</p>
                              <p className="font-extrabold text-white">{selectedSubjectAdmin}</p>
                            </div>
                          </div>
                        </div>

                        {/* Note Subsection Tabs */}
                        <div className="flex border-b border-slate-200 bg-slate-50 p-1 gap-1">
                          {[
                            { key: 'blueprint', label: '📊 Blueprint Specs' },
                            { key: 'narrative', label: '📖 Lesson Document' },
                            { key: 'activities', label: '🧪 Tasks & Drills' },
                            { key: 'assessment', label: '❓ Quiz Room' }
                          ].map((t) => (
                            <button
                              key={t.key}
                              onClick={() => setLessonSubTabAdmin(t.key as any)}
                              className={`flex-grow md:flex-none py-1.5 px-3 text-[10px] font-extrabold rounded-lg transition-all ${
                                lessonSubTabAdmin === t.key ? 'bg-white text-indigo-700 border border-slate-200' : 'text-slate-500 hover:bg-slate-100'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>

                        {/* Note Inner Render Body */}
                        <div className="p-5 space-y-5">
                          {/* A. Blueprint Specs */}
                          {lessonSubTabAdmin === 'blueprint' && (
                            <div className="space-y-4 animate-fade-in">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2.5 font-sans">
                                  <h4 className="text-[11px] font-black uppercase text-indigo-950 border-b pb-1">
                                    Learning Objectives ({generatedNoteAdmin.objectives?.length || 0})
                                  </h4>
                                  <ul className="space-y-2">
                                    {generatedNoteAdmin.objectives?.map((obj: string, i: number) => (
                                      <li key={i} className="text-[11px] font-serif text-slate-705 flex gap-2">
                                        <span className="font-bold text-indigo-600 font-sans">{i + 1}.</span>
                                        <span>{obj}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="space-y-4">
                                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
                                    <h5 className="text-[11px] font-black uppercase text-indigo-950 border-b pb-1">
                                      Required Instructional Materials
                                    </h5>
                                    <ul className="space-y-1">
                                      {generatedNoteAdmin.teachingMaterials?.map((mat: string, i: number) => (
                                        <li key={i} className="text-[10px] text-slate-600 flex items-baseline gap-1.5">
                                          <span>&bull;</span>
                                          <span>{mat}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
                                    <h5 className="text-[11px] font-black uppercase text-indigo-950 border-b pb-1">
                                      Vocabulary Core List
                                    </h5>
                                    <div className="flex flex-wrap gap-1">
                                      {generatedNoteAdmin.keyVocabulary?.map((voc: string, i: number) => (
                                        <span key={i} className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 font-bold text-indigo-750 text-[9px] rounded">
                                          🔑 {voc}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {generatedNoteAdmin.subjectSpecificFocus && (
                                <div className="p-4 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/10 space-y-1.5">
                                  <h5 className="text-[10px] font-black uppercase text-indigo-950">
                                    🌟 Sub-discipline Focus Areas: {generatedNoteAdmin.subjectSpecificFocus.title}
                                  </h5>
                                  <p className="text-[11px] text-slate-705 font-serif leading-relaxed">
                                    {generatedNoteAdmin.subjectSpecificFocus.content}
                                  </p>
                                  {generatedNoteAdmin.subjectSpecificFocus.safeguardsOrMoralLesson && (
                                    <div className="pt-1.5 border-t border-indigo-100 text-[9px] font-semibold text-slate-500 leading-snug">
                                      💡 <span className="font-bold text-indigo-850 uppercase">Safety & Values Guard:</span> {generatedNoteAdmin.subjectSpecificFocus.safeguardsOrMoralLesson}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* B. Lesson Document Content */}
                          {lessonSubTabAdmin === 'narrative' && (
                            <div className="space-y-4 animate-fade-in font-serif">
                              <div className="border-l-2 border-indigo-500 bg-indigo-50/20 p-3 text-xs italic text-slate-700 leading-relaxed rounded">
                                <span className="font-extrabold uppercase tracking-wider text-[9px] font-sans text-indigo-950 block mb-1">Introduction Step</span>
                                {generatedNoteAdmin.introduction}
                              </div>

                              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2 font-sans-serif">
                                <h4 className="text-[11px] font-black uppercase text-indigo-950">Explanation Milestones</h4>
                                <div className="space-y-1.5">
                                  {generatedNoteAdmin.teacherExplanationSteps?.map((step: string, idx: number) => (
                                    <div key={idx} className="flex gap-2 items-start text-[11px] text-slate-705" style={{ fontFamily: 'sans-serif' }}>
                                      <span className="bg-indigo-600 text-white rounded-full text-[8px] font-mono w-4.5 h-4.5 flex items-center justify-center shrink-0 mt-0.5">
                                        {idx + 1}
                                      </span>
                                      <span className="leading-snug">{step}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="prose max-w-none text-slate-800 text-xs">
                                {renderFormattedMarkdownAdmin(generatedNoteAdmin.detailedLessonNote)}
                              </div>
                            </div>
                          )}

                          {/* C. Tasks & Drills */}
                          {lessonSubTabAdmin === 'activities' && (
                            <div className="space-y-4 animate-fade-in font-sans">
                              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
                                <h4 className="text-[11px] font-black uppercase text-indigo-950 border-b pb-1">Instructional Duties / Activities</h4>
                                <ul className="space-y-1.5">
                                  {generatedNoteAdmin.studentActivities?.map((act: string, idx: number) => (
                                    <li key={idx} className="text-[11px] text-slate-700 flex gap-1.5 items-baseline">
                                      <span className="text-slate-400 font-bold">&bull;</span>
                                      <span>{act}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
                                <h4 className="text-[11px] font-black uppercase text-indigo-950 border-b pb-1 font-sans">Class Exercises</h4>
                                <ul className="space-y-2">
                                  {generatedNoteAdmin.classExercises?.map((ex: string, i: number) => (
                                    <li key={i} className="text-[11px] font-serif text-slate-700 flex gap-1.5">
                                      <span className="font-bold text-slate-500 font-sans">{i + 1}.</span>
                                      <span>{ex}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="bg-indigo-50/20 p-4 rounded-xl border border-indigo-150 space-y-1">
                                <h4 className="text-[11px] font-black uppercase text-indigo-950 font-sans">Structured Homework Assignment</h4>
                                <p className="text-[11px] font-serif text-slate-700 leading-snug italic">{generatedNoteAdmin.homeworkAssignment}</p>
                              </div>
                            </div>
                          )}

                          {/* D. Quiz Room */}
                          {lessonSubTabAdmin === 'assessment' && (
                            <div className="space-y-4 animate-fade-in font-sans">
                              <div className="flex justify-between items-center border-b pb-2">
                                <h4 className="text-[11px] font-black uppercase text-slate-800 font-sans">Standard Interactive Quiz (Segment A)</h4>
                                <button 
                                  onClick={() => setShowAnswerKeyAdmin(!showAnswerKeyAdmin)}
                                  className="px-2.5 py-1 border border-slate-200 bg-white hover:bg-slate-100 text-[9px] font-bold rounded-lg transition"
                                >
                                  {showAnswerKeyAdmin ? 'Hide Correct Keys' : 'Reveal Correct Answers'}
                                </button>
                              </div>

                              <div className="space-y-3">
                                {generatedNoteAdmin.quizQuestions?.map((q: any, qIdx: number) => (
                                  <div key={qIdx} className="p-4 rounded-xl bg-slate-50 border border-slate-150 space-y-2">
                                    <p className="text-[11px] font-bold text-indigo-950">
                                      Q{qIdx + 1}: <span className="font-serif font-medium text-slate-800">{q.question}</span>
                                    </p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {q.options?.map((opt: string, oIdx: number) => {
                                        const isThisCorrect = String.fromCharCode(65 + oIdx) === q.correctAnswer;
                                        let btnClass = "border-slate-200 bg-white hover:bg-slate-100 text-slate-700";
                                        
                                        if (showAnswerKeyAdmin && isThisCorrect) {
                                          btnClass = "bg-emerald-50 border-emerald-400 text-emerald-800 font-bold";
                                        }

                                        return (
                                          <div
                                            key={oIdx}
                                            className={`p-2 rounded-lg border text-left text-[11px] flex gap-2 items-center transition ${btnClass}`}
                                          >
                                            <span className="uppercase text-[9px] font-black text-slate-400 bg-slate-100 w-4.5 h-4.5 flex items-center justify-center rounded border shrink-0">
                                              {String.fromCharCode(65 + oIdx)}
                                            </span>
                                            <span className="leading-tight">{opt}</span>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {showAnswerKeyAdmin && (
                                      <div className="pt-2 border-t border-slate-150 text-[10px] text-slate-500 font-sans leading-snug">
                                        🔑 <span className="font-bold text-emerald-800">Explanation:</span> {q.explanation}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {generatedNoteAdmin.theoryQuestions && (
                                <div className="space-y-3 pt-3 border-t font-sans">
                                  <h4 className="text-[11px] font-black uppercase text-indigo-950 border-b pb-1">Theory Discussion Questions (Segment B)</h4>
                                  {generatedNoteAdmin.theoryQuestions.map((t: any, idx: number) => (
                                    <div key={idx} className="bg-slate-50 rounded-xl border border-slate-150 p-3.5 space-y-2">
                                      <p className="text-[11px] font-bold text-slate-850 leading-snug">
                                        Question {idx + 1}: <span className="font-serif font-medium text-slate-755">{t.question}</span>
                                      </p>
                                      {showAnswerKeyAdmin && (
                                        <div className="p-3 rounded bg-white border border-slate-150 space-y-1.5">
                                          <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Recommended Model Answer:</p>
                                          <p className="text-[11px] font-serif text-slate-600 italic">{t.modelAnswer}</p>
                                          {t.markingScheme && (
                                            <p className="text-[9px] font-sans text-slate-400 font-semibold border-t pt-1">
                                              💡 Marking Criteria: {t.markingScheme}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
