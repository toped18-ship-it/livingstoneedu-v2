import React, { useState, useEffect } from 'react';
import { GmailHub } from './GmailHub';
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
  Mail
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
  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'users' | 'curriculum' | 'cbt' | 'payments' | 'results' | 'branding' | 'inquiries' | 'activities' | 'gmail'>('dashboard');

  // Interactive configurations
  const [brandName, setBrandName] = useState(currentConfig.brandName);
  const [appSubtitle, setAppSubtitle] = useState(currentConfig.appSubtitle);
  const [proPrice, setProPrice] = useState(currentConfig.proPrice);
  const [supportGroupUrl, setSupportGroupUrl] = useState(currentConfig.supportGroupUrl);
  const [contactName, setContactName] = useState(currentConfig.contactName);
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
          contactName
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm hover:border-slate-200 transition">
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
        
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-2xs hover:border-slate-250 transition space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Total Registers</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Users size={12} /></span>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{statsSummary.totalTeachers + statsSummary.totalStudents}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">&bull; {statsSummary.totalTeachers} Teachers | {statsSummary.totalStudents} Students</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-2xs hover:border-slate-250 transition space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Premium Passes</span>
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Layers size={12} /></span>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{statsSummary.activeSubscribers}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">&bull; Dynamic Livingtech Pro Users</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-2xs hover:border-slate-250 transition space-y-2 col-span-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Total Curriculum</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><BookOpen size={12} /></span>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{curriculums.length}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">&bull; NERDC aligned topics deployed</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-2xs hover:border-slate-250 transition space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider font-sans">Collected Revenue</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg"><DollarSign size={12} /></span>
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-900">₦{statsSummary.revenueSum.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-600 mt-1 font-semibold">&bull; Paystack & Flutterwave channels</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-2xs hover:border-slate-250 transition space-y-2 col-span-2 md:col-span-4 lg:col-span-1">
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
        <div className="lg:col-span-3 space-y-1.5">
          <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 pl-2">SCHOOL CORE ROOMS</div>
          
          <button
            type="button"
            onClick={() => setActiveAdminTab('dashboard')}
            className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
              activeAdminTab === 'dashboard'
                ? 'bg-indigo-650 text-white shadow-md font-black'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-150'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <TrendingUp size={14} />
              <span>SaaS Analytics Center</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('users')}
            className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
              activeAdminTab === 'users'
                ? 'bg-indigo-650 text-white shadow-md font-black'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-150'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Users size={14} />
              <span>Academic Directory</span>
            </span>
            <span className="text-[9px] bg-slate-100 font-extrabold text-slate-600 px-1.5 py-0.5 rounded">
              {usersList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('curriculum')}
            className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
              activeAdminTab === 'curriculum'
                ? 'bg-indigo-650 text-white shadow-md font-black'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-150'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <BookOpen size={14} />
              <span>Curriculum alignment</span>
            </span>
            <span className="text-[9px] bg-indigo-50 font-extrabold text-indigo-700 px-1.5 py-0.5 rounded">
              {curriculums.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('cbt')}
            className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
              activeAdminTab === 'cbt'
                ? 'bg-indigo-650 text-white shadow-md font-black'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-150'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Award size={14} />
              <span>CBT Examination Banks</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('payments')}
            className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
              activeAdminTab === 'payments'
                ? 'bg-indigo-650 text-white shadow-md font-black'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-150'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <CreditCard size={14} />
              <span>Payments Ledgers & Sims</span>
            </span>
            <span className="text-[9px] bg-emerald-50 font-extrabold text-emerald-800 px-1.5 py-0.5 rounded">
              ₦
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('results')}
            className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
              activeAdminTab === 'results'
                ? 'bg-indigo-650 text-white shadow-md font-black'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-150'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <FileText size={14} />
              <span>Continuous Assessment (CA)</span>
            </span>
          </button>

          <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider pt-4 pb-2 pl-2">SUPPORT & CORE CONFIGS</div>

          <button
            type="button"
            onClick={() => setActiveAdminTab('branding')}
            className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition cursor-pointer ${
              activeAdminTab === 'branding'
                ? 'bg-indigo-650 text-white shadow-md font-black'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-150'
            }`}
          >
            <Settings size={14} />
            <span>Identity configurations</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('gmail')}
            className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition cursor-pointer ${
              activeAdminTab === 'gmail'
                ? 'bg-indigo-650 text-white shadow-md font-black'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-150'
            }`}
          >
            <Mail size={14} />
            <span>School Gmail manager</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('inquiries')}
            className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
              activeAdminTab === 'inquiries'
                ? 'bg-indigo-650 text-white shadow-md font-black'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-150'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <MessageSquare size={14} />
              <span>Inquiries counseling Inbox</span>
            </span>
            {statsSummary.totalPendingInq > 0 && (
              <span className="px-1.5 py-0.5 bg-red-650 text-white text-[9px] font-black rounded">
                {statsSummary.totalPendingInq}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('activities')}
            className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition cursor-pointer ${
              activeAdminTab === 'activities'
                ? 'bg-indigo-650 text-white shadow-md font-black'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-150'
            }`}
          >
            <Clock size={14} />
            <span>Live interaction telemetry</span>
          </button>
        </div>

        {/* Right Side Content Canvas */}
        <div className="lg:col-span-9 bg-white p-6 rounded-3xl border border-slate-150 shadow-xs">
          
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

                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="px-3.5 py-2 bg-indigo-650 hover:bg-indigo-720 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-650/10 cursor-pointer"
                >
                  <UserPlus size={13} />
                  <span>Add School Member</span>
                </button>
              </div>

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
                          <option value="Primary 3">Primary 3</option>
                          <option value="Primary 5">Primary 5</option>
                          <option value="JSS 1">JSS 1</option>
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
                          <option value="Primary 3">Primary 3</option>
                          <option value="Primary 5">Primary 5</option>
                          <option value="JSS 1">JSS 1</option>
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
                          <button
                            type="button"
                            onClick={() => handleToggleProStatus(usr.id)}
                            className={`px-2.5 py-1 rounded inline-flex items-center gap-1.5 text-[10px] font-bold transition cursor-pointer ${
                              usr.isPro 
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                : 'bg-slate-100 text-slate-505 border border-slate-205'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${usr.isPro ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`} />
                            <span>{usr.isPro ? 'Upgrade Pass ACTIVE' : 'Upgrade Pass Basic'}</span>
                          </button>
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
                  <h3 className="font-extrabold text-base text-slate-900">National Curriculum Aligner</h3>
                  <p className="text-xs text-slate-500">Edit core topics authorized under Nigerian Federal Ministry guidelines for primary & senior secondary classes.</p>
                </div>

                <button
                  onClick={() => setShowAddCurriculumModal(true)}
                  className="px-3.5 py-2 bg-indigo-650 hover:bg-indigo-720 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-650/10 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Build Curriculum Topic</span>
                </button>
              </div>

              {/* Add Curriculum Row */}
              {showAddCurriculumModal && (
                <form onSubmit={handleAddCurriculumSubmit} className="p-5 bg-slate-50 rounded-2xl border border-indigo-200/80 space-y-4">
                  <h4 className="text-xs font-black uppercase text-indigo-900">New Syllabus Guidance Target</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase">Student Class Class</label>
                      <select value={currClass} onChange={(e) => setCurrClass(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-semibold">
                        <option value="Primary 1">Primary 1</option>
                        <option value="JSS 1">JSS 1</option>
                        <option value="JSS 3">JSS 3</option>
                        <option value="SS 1">SS 1</option>
                        <option value="SS 2">SS 2</option>
                        <option value="SS 3">SS 3</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase">Syllabus Subject</label>
                      <input value={currSubject} onChange={(e) => setCurrSubject(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-semibold" placeholder="Mathematics" required />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase">Active Week Target</label>
                      <input type="number" min="1" max="12" value={currWeek} onChange={(e) => setCurrWeek(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-semibold" required />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase">Topic Focus Title</label>
                    <input value={currTopic} onChange={(e) => setCurrTopic(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-semibold" placeholder="e.g. Simultaneous Equations & Graph calculations" required />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase">Syllabus Guidance Details / Case Studies</label>
                    <textarea value={currDetails} onChange={(e) => setCurrDetails(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-semibold" placeholder="e.g. Highlight solutions utilizing local trade numbers from Balogun market..." rows={3} required />
                  </div>

                  <div className="pt-2 flex justify-end gap-2 text-xs">
                    <button type="button" onClick={() => setShowAddCurriculumModal(false)} className="px-3.5 py-1.5 font-bold text-slate-700 bg-slate-200 rounded-xl cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-650 text-white font-black rounded-xl cursor-pointer">Deploy Topic</button>
                  </div>
                </form>
              )}

              {/* Edit Curriculum Row */}
              {editingCurriculum && (
                <form onSubmit={handleEditCurriculumSubmit} className="p-5 bg-indigo-50/40 rounded-2xl border border-indigo-200/80 space-y-4 animate-fade-in">
                  <h4 className="text-xs font-black uppercase text-indigo-950 flex items-center gap-1.5">
                    <Edit size={14} className="text-indigo-650" /> Modify Syllabus Guidance Target Focus
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-500">Student Class</label>
                      <select value={editCurrClass} onChange={(e) => setEditCurrClass(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-semibold outline-none">
                        <option value="Primary 1">Primary 1</option>
                        <option value="Primary 3">Primary 3</option>
                        <option value="Primary 5">Primary 5</option>
                        <option value="JSS 1">JSS 1</option>
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
                    <textarea value={editCurrDetails} onChange={(e) => setEditCurrDetails(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-semibold outline-none font-serif" rows={3} required />
                  </div>

                  <div className="pt-2 flex justify-end gap-2 text-xs">
                    <button type="button" onClick={() => setEditingCurriculum(null)} className="px-3.5 py-1.5 font-bold text-slate-700 bg-slate-200 rounded-xl cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-650 text-white font-black rounded-xl cursor-pointer">Update Alignment</button>
                  </div>
                </form>
              )}

              {/* Items Listing */}
              <div className="space-y-3.5">
                {curriculums.map((cur) => (
                  <div key={cur.id} className="p-4 border border-slate-150 rounded-2xl space-y-2 hover:border-slate-350 transition bg-slate-50/20">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div className="space-y-1 text-left">
                        <div className="flex gap-2 items-baseline">
                          <span className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-755 text-[9px] font-black rounded">{cur.class}</span>
                          <span className="text-[10px] text-slate-425 font-bold">{cur.subject} &bull; Week {cur.week} &bull; {cur.term || '1st Term'}</span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900">{cur.topic}</h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-black border border-emerald-100 uppercase">{cur.status || 'Published'}</span>
                        <button
                          type="button"
                          onClick={() => handleStartEditCurriculum(cur)}
                          title="Modify syllabus target"
                          className="px-2 py-0.5 text-[10px] font-bold text-indigo-650 hover:bg-indigo-50 border border-indigo-150 bg-white rounded transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCurriculum(cur.id)}
                          title="Remove syllabus item"
                          className="px-2 py-0.5 text-[10px] font-bold text-red-650 hover:bg-red-50 border border-red-150 bg-white rounded transition cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 font-serif leading-relaxed italic text-left">{cur.details}</p>
                  </div>
                ))}
              </div>

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
                        <option value="Primary 3">Primary 3</option>
                        <option value="Primary 5">Primary 5</option>
                        <option value="JSS 1">JSS 1</option>
                        <option value="JSS 3">JSS 3</option>
                        <option value="SS 1">SS 1</option>
                        <option value="SS 3">SS 3</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
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

                        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-bold text-slate-600">
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
            <div className="space-y-6 animate-fade-in text-slate-800">
              <div className="border-b pb-3 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Payments & Subscriptions Ledger</h3>
                  <p className="text-xs text-slate-500">Live payment lists coupled with web-hooks simulation indicators for Paystack, Flutterwave, and Stripe portals.</p>
                </div>
              </div>

              {/* Simulation Hub Box */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-indigo-200/50 space-y-3.5">
                <div>
                  <h4 className="text-xs font-black uppercase text-indigo-950 flex items-center gap-1.5">
                    <Smartphone size={15} className="text-indigo-650" />
                    <span>NIGERIAN TRANSACTIONS SIMULATION BAY</span>
                  </h4>
                  <p className="text-[10px] text-slate-500">Instantly simulate successful Flutterwave, Paystack, or Stripe card checkout notifications from parents to verify portal upgrades.</p>
                </div>

                <div className="flex gap-2 flex-wrap text-xs font-black">
                  <button
                    onClick={() => handleSimulatePaymentTrigger('Paystack')}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>⚡ Sim PAYSTACK ₦12,500</span>
                  </button>
                  <button
                    onClick={() => handleSimulatePaymentTrigger('Flutterwave')}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>⚡ Sim FLUTTERWAVE ₦12,500</span>
                  </button>
                  <button
                    onClick={() => handleSimulatePaymentTrigger('Stripe')}
                    className="px-4 py-2.5 bg-indigo-950 hover:bg-black text-white rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>⚡ Sim STRIPE $10</span>
                  </button>
                </div>
              </div>

              {/* Payments log */}
              <div className="overflow-x-auto border-y border-slate-150">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                    <tr>
                      <th className="p-3">Student payer</th>
                      <th className="p-3">Gateway</th>
                      <th className="p-3">Plan description</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3 text-right">Receipt status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <p className="font-extrabold text-slate-800">{p.studentName}</p>
                          <p className="text-[10px] text-slate-400">{p.email}</p>
                        </td>
                        <td className="p-3 font-mono font-bold text-indigo-700">{p.gateway}</td>
                        <td className="p-3 text-slate-505 font-medium">{p.plan}</td>
                        <td className="p-3 font-black text-slate-900">{p.amount}</td>
                        <td className="p-3 text-right">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            p.status === 'Approved' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
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
          )}

          {/* TAB 6: CONTINUOUS ASSESSMENT WORKFLOW */}
          {activeAdminTab === 'results' && (
            <div className="space-y-6 animate-fade-in text-slate-800">
              <div className="border-b pb-3 flex justify-between items-center gap-4 flex-wrap">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Continuous Assessment & GPA Approval</h3>
                  <p className="text-xs text-slate-500">Examine primary & secondary scores submitted by class teachers and approve terminal GPA reports for parent portals.</p>
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
              <div className="border-b pb-3">
                <h3 className="font-extrabold text-base text-slate-900">School Session interaction telemetry</h3>
                <p className="text-xs text-slate-500">Continuous background logging of student textbook entries opened and CBT trial score summaries recorded.</p>
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

        </div>

      </div>

    </div>
  );
}
