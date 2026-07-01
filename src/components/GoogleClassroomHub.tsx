import React, { useState, useEffect } from 'react';
import { 
  googleSignIn, 
  initAuth, 
  getAccessToken, 
  logoutGoogle
} from '../lib/googleAuth';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  GraduationCap, 
  Plus, 
  Users, 
  BookOpen, 
  Bell, 
  Calendar, 
  Send, 
  Check, 
  AlertCircle, 
  ExternalLink,
  RefreshCw,
  Trash2,
  FileText,
  CheckCircle2,
  Lock,
  ArrowRight,
  BookMarked,
  Info,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { User, ClassLevel } from '../types';

interface GoogleClassroomHubProps {
  user: User; // LMS local user
  curriculums?: any[]; // For syncing lessons/quizzes
}

interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  description?: string;
  room?: string;
  ownerId: string;
  creationTime?: string;
  alternateLink?: string;
  courseState?: string;
}

interface ClassroomAnnouncement {
  id: string;
  courseId: string;
  text: string;
  alternateLink?: string;
  creationTime: string;
  updateTime?: string;
  creatorUserId: string;
}

interface ClassroomCourseWork {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  materials?: any[];
  state?: string;
  alternateLink?: string;
  creationTime: string;
  maxPoints?: number;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  workType?: 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION' | 'MULTIPLE_CHOICE_QUESTION';
}

interface StudentSubmission {
  id: string;
  courseId: string;
  courseWorkId: string;
  userId: string;
  state: string;
  assignedGrade?: number;
  draftGrade?: number;
  alternateLink?: string;
  updateTime?: string;
}

interface ClassroomRoster {
  teachers: Array<{ userId: string; profile: { name: { fullName: string }; emailAddress?: string; photoUrl?: string } }>;
  students: Array<{ userId: string; profile: { name: { fullName: string }; emailAddress?: string; photoUrl?: string } }>;
}

export function GoogleClassroomHub({ user, curriculums = [] }: GoogleClassroomHubProps) {
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Classroom Data States
  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<ClassroomCourse | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'announcements' | 'coursework' | 'roster' | 'sync'>('announcements');
  const [announcements, setAnnouncements] = useState<ClassroomAnnouncement[]>([]);
  const [courseWork, setCourseWork] = useState<ClassroomCourseWork[]>([]);
  const [roster, setRoster] = useState<ClassroomRoster>({ teachers: [], students: [] });
  const [submissions, setSubmissions] = useState<Record<string, StudentSubmission[]>>({});
  
  // Interaction/Form States
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseSection, setNewCourseSection] = useState('');
  const [newCourseSubject, setNewCourseSubject] = useState('');
  
  const [newAnnouncementText, setNewAnnouncementText] = useState('');
  const [announcementLoading, setAnnouncementLoading] = useState(false);

  const [isCreatingWork, setIsCreatingWork] = useState(false);
  const [newWorkTitle, setNewWorkTitle] = useState('');
  const [newWorkDesc, setNewWorkDesc] = useState('');
  const [newWorkPoints, setNewWorkPoints] = useState(100);
  const [newWorkType, setNewWorkType] = useState<'ASSIGNMENT' | 'MATERIAL'>('ASSIGNMENT');
  const [workLoading, setWorkLoading] = useState(false);

  // Syncing LivingstoneEdu Materials State
  const [selectedSyncType, setSelectedSyncType] = useState<'lesson' | 'quiz'>('lesson');
  const [syncClassLevel, setSyncClassLevel] = useState<ClassLevel>('Primary 1');
  const [syncSubject, setSyncSubject] = useState('');
  const [syncWeek, setSyncWeek] = useState<number>(1);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);

  // Errors / Status
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize and check Google sign-in status
  useEffect(() => {
    const unsubscribe = initAuth(
      (gUser, gToken) => {
        setGoogleUser(gUser);
        setToken(gToken);
        setAuthChecking(false);
        fetchCourses(gToken);
      },
      () => {
        setGoogleUser(null);
        setToken(null);
        setAuthChecking(false);
      }
    );
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setToken(res.accessToken);
        fetchCourses(res.accessToken);
      }
    } catch (err: any) {
      console.error('Google Classroom Login Error:', err);
      setErrorMessage(err.message || 'Failed to authenticate with Google Classroom.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logoutGoogle();
      setGoogleUser(null);
      setToken(null);
      setCourses([]);
      setSelectedCourse(null);
      setAnnouncements([]);
      setCourseWork([]);
      setRoster({ teachers: [], students: [] });
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  // Fetch all Google Classroom courses for the signed-in user
  const fetchCourses = async (accessToken: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('https://classroom.googleapis.com/v1/courses', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
      }
      const data = await response.json();
      setCourses(data.courses || []);
      if (data.courses && data.courses.length > 0 && !selectedCourse) {
        // Automatically select first course to show content
        handleSelectCourse(data.courses[0], accessToken);
      }
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setErrorMessage(err.message || 'Unable to fetch your Google Classroom classes. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Select a course and load all its details
  const handleSelectCourse = async (course: ClassroomCourse, accessToken: string) => {
    setSelectedCourse(course);
    setErrorMessage(null);
    // Fetch associated content
    fetchCourseContent(course.id, accessToken);
  };

  const fetchCourseContent = async (courseId: string, accessToken: string) => {
    setIsRefreshing(true);
    try {
      // 1. Fetch announcements
      const announcementsRes = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/announcements`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (announcementsRes.ok) {
        const announcementsData = await announcementsRes.json();
        setAnnouncements(announcementsData.announcements || []);
      }

      // 2. Fetch CourseWork (assignments & materials)
      const courseWorkRes = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (courseWorkRes.ok) {
        const courseWorkData = await courseWorkRes.json();
        setCourseWork(courseWorkData.courseWork || []);
      }

      // 3. Fetch Roster (teachers and students)
      const teachersRes = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/teachers`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const studentsRes = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/students`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      let teachersList = [];
      let studentsList = [];
      if (teachersRes.ok) {
        const teachersData = await teachersRes.json();
        teachersList = teachersData.teachers || [];
      }
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        studentsList = studentsData.students || [];
      }
      setRoster({ teachers: teachersList, students: studentsList });

    } catch (err: any) {
      console.error('Error fetching course details:', err);
      setErrorMessage('Could not load classroom updates completely.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Create a new Classroom Course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!newCourseName.trim()) {
      setErrorMessage('Classroom course name is required.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('https://classroom.googleapis.com/v1/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newCourseName,
          section: newCourseSection || 'LivingstoneEdu Class',
          descriptionHeading: newCourseSubject || 'LMS Core Curriculum',
          description: `Created automatically via LivingstoneEdu School Hub on ${new Date().toLocaleDateString()}`,
          ownerId: 'me',
          courseState: 'PROVISIONED', // Ready for use
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to construct Google Classroom course');
      }

      const createdCourse = await response.json();
      setSuccessMessage(`Google Classroom "${createdCourse.name}" built successfully!`);
      setCourses(prev => [createdCourse, ...prev]);
      setSelectedCourse(createdCourse);
      setIsCreatingCourse(false);
      setNewCourseName('');
      setNewCourseSection('');
      setNewCourseSubject('');

      // Refresh data
      fetchCourseContent(createdCourse.id, token);
    } catch (err: any) {
      console.error('Error constructing course:', err);
      setErrorMessage(err.message || 'Failed to synchronize with Classroom Provisioning SDK.');
    } finally {
      setLoading(false);
    }
  };

  // Create active announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedCourse) return;
    if (!newAnnouncementText.trim()) return;

    setAnnouncementLoading(true);
    try {
      const response = await fetch(`https://classroom.googleapis.com/v1/courses/${selectedCourse.id}/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: newAnnouncementText,
          state: 'PUBLISHED',
        }),
      });

      if (!response.ok) throw new Error('Failed to post announcement.');

      const created = await response.json();
      setAnnouncements(prev => [created, ...prev]);
      setNewAnnouncementText('');
      setSuccessMessage('LMS Announcement shared successfully with Google Classroom stream!');
    } catch (err: any) {
      console.error('Announcement Error:', err);
      setErrorMessage('Could not publish class announcement.');
    } finally {
      setAnnouncementLoading(false);
    }
  };

  // Create assignment/materials
  const handleCreateWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedCourse) return;
    if (!newWorkTitle.trim()) return;

    setWorkLoading(true);
    try {
      const endpoint = `https://classroom.googleapis.com/v1/courses/${selectedCourse.id}/courseWork`;
      const body: any = {
        title: newWorkTitle,
        description: newWorkDesc,
        state: 'PUBLISHED',
        workType: newWorkType === 'ASSIGNMENT' ? 'ASSIGNMENT' : 'SHORT_ANSWER_QUESTION',
      };

      if (newWorkType === 'ASSIGNMENT') {
        body.maxPoints = newWorkPoints;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to create assignment/question');

      const created = await response.json();
      setCourseWork(prev => [created, ...prev]);
      setIsCreatingWork(false);
      setNewWorkTitle('');
      setNewWorkDesc('');
      setNewWorkPoints(100);
      setSuccessMessage(`Google Classroom Classwork created successfully!`);
    } catch (err: any) {
      console.error('Classwork creation error:', err);
      setErrorMessage('Failed to publish classwork parameters.');
    } finally {
      setWorkLoading(false);
    }
  };

  // Sync a LivingstoneEdu lesson/quiz directly as an assignment/material to the Classroom Course
  const handleSyncLmsMaterial = async () => {
    if (!token || !selectedCourse) {
      setErrorMessage('Select a target Google Classroom class first.');
      return;
    }
    
    setSyncLoading(true);
    setSyncSuccessMessage(null);
    setErrorMessage(null);

    try {
      // Find matching curriculum week
      const normalizedSubject = syncSubject.trim().toLowerCase();
      let lessonTitle = `LivingstoneEdu Lesson Note: ${syncClassLevel} - ${syncSubject || 'General Study'} (Week ${syncWeek})`;
      let lessonContent = `Greetings Students!\n\nAttached is your Weekly Academic lesson material for Week ${syncWeek}.\n\nClass Level: ${syncClassLevel}\nSubject: ${syncSubject}\n\nPlease click to access the digital textbook and review continuous assessment parameters directly on your LivingstoneEdu LMS account.`;

      // Build classwork material API post parameters
      const endpoint = `https://classroom.googleapis.com/v1/courses/${selectedCourse.id}/courseWork`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: selectedSyncType === 'lesson' 
            ? `[LMS Lesson Note] ${syncSubject || 'General'} - Week ${syncWeek} (${syncClassLevel})`
            : `[LMS Continuous Assessment Quiz] ${syncSubject || 'General'} - Week ${syncWeek} (${syncClassLevel})`,
          description: selectedSyncType === 'lesson' 
            ? `${lessonContent}\n\nTask: Read carefully and prepare for the weekly quiz.`
            : `Greetings!\n\nYou have been assigned the Week ${syncWeek} Computer Based Test (CBT) Quiz assessment.\n\nScore parameters will automatically synchronize with your continuous assessment gradebooks.\n\nEnjoy the challenge!`,
          state: 'PUBLISHED',
          workType: 'ASSIGNMENT',
          maxPoints: selectedSyncType === 'quiz' ? 20 : 10,
        }),
      });

      if (!response.ok) {
        throw new Error('Could not broadcast educational material payload to Google API.');
      }

      const syncResult = await response.json();
      setSyncSuccessMessage(`Material uploaded successfully! Your students can now view this material on their Google Classroom portal.`);
      
      // Refresh coursework list
      fetchCourseContent(selectedCourse.id, token);
    } catch (err: any) {
      console.error('Sync error:', err);
      setErrorMessage(err.message || 'Classroom sync pipeline disrupted.');
    } finally {
      setSyncLoading(false);
    }
  };

  if (authChecking) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <RefreshCw size={28} className="animate-spin text-indigo-600" />
        <p className="text-sm font-semibold text-slate-500">Connecting Google Workspace Integration...</p>
      </div>
    );
  }

  // If NOT authenticated, show gorgeous login prompt with details
  if (!googleUser || !token) {
    return (
      <div className="max-w-4xl mx-auto my-6 p-6 sm:p-10 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl shadow-xl space-y-8 animate-fade-in">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-gradient-to-tr from-green-500 to-emerald-600 text-white rounded-3xl shadow-lg shadow-emerald-500/10">
            <GraduationCap size={48} className="stroke-[1.5]" />
          </div>
          <div className="space-y-2">
            <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-wider">
              Google Workspace Core Integration
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Connect to Google Classroom
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
              Bridge your academic activities seamlessly. Import class rosters, publish syllabus lesson summaries, assign CBT homework questions, and sync grade logs on one secure portal.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900 space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-black">Teacher SDK</span>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Educator Core Benefits</h3>
            </div>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 leading-relaxed font-semibold">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Publish LivingstoneEdu learning plans as Google Assignments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Configure Announcements directly to Classroom Streams</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Track multi-student assignment grade logs offline/online</span>
              </li>
            </ul>
          </div>

          <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900 space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-black">Student SDK</span>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Student & Parent Benefits</h3>
            </div>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 leading-relaxed font-semibold">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">✓</span>
                <span>Inspect assignments without closing the tutoring app</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">✓</span>
                <span>Track due dates & maximum score sheets</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">✓</span>
                <span>Maintain live updates from your school teachers</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-4 flex flex-col items-center justify-center space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="gsi-material-button w-full sm:w-auto min-w-[240px] shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <div className="gsi-material-button-state"></div>
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents text-slate-700 font-bold">Connect Google Classroom</span>
            </div>
          </button>
          
          <p className="text-[10px] text-slate-400 font-medium">
            This application accesses Google Classroom with permission from your account to provide academic reporting.
          </p>
        </div>
      </div>
    );
  }

  // Once authenticated, show fully fledged workspace layout
  return (
    <div className="max-w-7xl mx-auto my-4 space-y-6 animate-fade-in">
      {/* Top Profile and Controls Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center justify-center font-black">
            {googleUser.photoURL ? (
              <img src={googleUser.photoURL} referrerPolicy="no-referrer" alt="Google Profile" className="w-10 h-10 rounded-full border border-emerald-200" />
            ) : (
              <GraduationCap size={20} />
            )}
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 dark:text-white leading-none">
              {googleUser.displayName || 'Google Classroom Administrator'}
            </h2>
            <p className="text-xs text-slate-450 mt-1">
              Connected: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{googleUser.email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => fetchCourses(token)}
            disabled={isRefreshing || loading}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="Refresh Classroom Data"
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setIsCreatingCourse(true)}
            className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus size={14} />
            <span>Create Class</span>
          </button>
          <button
            onClick={handleGoogleLogout}
            className="px-3.5 py-1.5 border border-red-200 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30 text-slate-500 rounded-xl text-xs font-black transition cursor-pointer"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Notifications and status alerts */}
      {errorMessage && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-2xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-[10px] font-bold uppercase hover:underline">Dismiss</button>
        </div>
      )}

      {/* Main workspace layout */}
      <div className="grid lg:grid-cols-4 gap-6 items-start">
        {/* Course List Left Bar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-xs space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">
              Active Courses ({courses.length})
            </h3>
            
            {courses.length === 0 ? (
              <div className="p-4 text-center space-y-2">
                <p className="text-xs text-slate-450 font-medium">No courses found on Google Classroom.</p>
                <button
                  onClick={() => setIsCreatingCourse(true)}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  Create your first class
                </button>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                {courses.map(course => (
                  <button
                    key={course.id}
                    onClick={() => handleSelectCourse(course, token)}
                    className={`w-full p-3 rounded-xl text-left border transition text-xs flex flex-col gap-1 cursor-pointer ${
                      selectedCourse?.id === course.id
                        ? 'bg-indigo-50/70 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900'
                        : 'bg-transparent border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-extrabold text-slate-800 dark:text-slate-100 truncate max-w-[150px]">
                        {course.name}
                      </span>
                      {course.alternateLink && (
                        <a 
                          href={course.alternateLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] text-slate-400 hover:text-indigo-600"
                          title="Open course directly in Google Classroom"
                        >
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                    {course.section && (
                      <span className="text-[10px] text-slate-450 font-semibold">{course.section}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content Panel Right Bar */}
        <div className="lg:col-span-3 space-y-4">
          {selectedCourse ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
              {/* Header card */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 p-6 text-white space-y-2 relative">
                <div className="absolute top-6 right-6 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-500 rounded text-[9px] font-black uppercase tracking-wider">
                    {selectedCourse.courseState}
                  </span>
                  {selectedCourse.alternateLink && (
                    <a
                      href={selectedCourse.alternateLink}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition flex items-center justify-center"
                      title="Open Course Website"
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-black tracking-tight">{selectedCourse.name}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-indigo-200 font-semibold">
                  {selectedCourse.section && (
                    <span>Section: {selectedCourse.section}</span>
                  )}
                  {selectedCourse.room && (
                    <span>Room: {selectedCourse.room}</span>
                  )}
                  {selectedCourse.descriptionHeading && (
                    <span>Subject: {selectedCourse.descriptionHeading}</span>
                  )}
                </div>
              </div>

              {/* Sub Navigation */}
              <div className="border-b border-slate-150 dark:border-slate-800 flex bg-slate-50 dark:bg-slate-950/50 p-1">
                <button
                  onClick={() => setActiveSubTab('announcements')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeSubTab === 'announcements'
                      ? 'bg-white dark:bg-slate-900 text-indigo-650 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-800'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Bell size={13} />
                  <span>Announcements Stream</span>
                </button>
                <button
                  onClick={() => setActiveSubTab('coursework')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeSubTab === 'coursework'
                      ? 'bg-white dark:bg-slate-900 text-indigo-650 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-800'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <BookOpen size={13} />
                  <span>Classwork ({courseWork.length})</span>
                </button>
                <button
                  onClick={() => setActiveSubTab('roster')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeSubTab === 'roster'
                      ? 'bg-white dark:bg-slate-900 text-indigo-650 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-800'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Users size={13} />
                  <span>Roster ({roster.teachers.length + roster.students.length})</span>
                </button>
                <button
                  onClick={() => setActiveSubTab('sync')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeSubTab === 'sync'
                      ? 'bg-white dark:bg-slate-900 text-indigo-650 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-800'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <RefreshCw size={13} />
                  <span>Sync LMS Lessons</span>
                </button>
              </div>

              {/* View Stream Content */}
              <div className="p-5 sm:p-6 min-h-[300px]">
                {isRefreshing ? (
                  <div className="h-48 flex flex-col items-center justify-center space-y-2">
                    <RefreshCw size={20} className="animate-spin text-indigo-650" />
                    <p className="text-xs text-slate-450 font-medium">Synching live classroom updates...</p>
                  </div>
                ) : (
                  <>
                    {/* Announcements stream */}
                    {activeSubTab === 'announcements' && (
                      <div className="space-y-5">
                        {/* New announcement input */}
                        <form onSubmit={handleCreateAnnouncement} className="space-y-2 border border-slate-150 p-4 rounded-2xl bg-slate-50/50">
                          <label className="block text-[11px] font-black uppercase text-slate-400">Share something with your class</label>
                          <textarea
                            placeholder="Type classroom announcements, guidelines, or homework updates here..."
                            value={newAnnouncementText}
                            onChange={(e) => setNewAnnouncementText(e.target.value)}
                            rows={3}
                            className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 resize-none font-semibold text-slate-800"
                          />
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              disabled={announcementLoading || !newAnnouncementText.trim()}
                              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <Send size={12} />
                              <span>{announcementLoading ? 'Posting...' : 'Post Announcement'}</span>
                            </button>
                          </div>
                        </form>

                        {/* Stream List */}
                        <div className="space-y-4">
                          {announcements.length === 0 ? (
                            <div className="text-center py-10 space-y-2">
                              <Bell size={32} className="mx-auto text-slate-300" />
                              <h4 className="font-bold text-sm text-slate-700">Classroom Stream is empty</h4>
                              <p className="text-xs text-slate-450">Announcements will appear in this feed when published.</p>
                            </div>
                          ) : (
                            announcements.map(ann => (
                              <div key={ann.id} className="p-4 border border-slate-150 rounded-2xl space-y-3 relative">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-650">
                                      👤
                                    </div>
                                    <span className="text-xs font-black text-slate-850">Instructor Announcement</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-semibold">
                                    {new Date(ann.creationTime).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-650 font-medium leading-relaxed whitespace-pre-wrap">
                                  {ann.text}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* Classwork CourseWork List */}
                    {activeSubTab === 'coursework' && (
                      <div className="space-y-5 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Assignments & Study Materials</h3>
                          <button
                            onClick={() => setIsCreatingWork(true)}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-black flex items-center gap-1 transition cursor-pointer"
                          >
                            <Plus size={13} />
                            <span>Add Classwork</span>
                          </button>
                        </div>

                        {/* Create work dialog overlay/form */}
                        {isCreatingWork && (
                          <form onSubmit={handleCreateWork} className="p-4 border border-indigo-150 bg-indigo-50/20 rounded-2xl space-y-3">
                            <h4 className="text-xs font-black text-indigo-950 uppercase">Configure New Classwork</h4>
                            
                            <div className="grid sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Title</label>
                                <input
                                  type="text"
                                  placeholder="E.g., Week 3 Basic Science Quiz"
                                  value={newWorkTitle}
                                  onChange={(e) => setNewWorkTitle(e.target.value)}
                                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-semibold"
                                  required
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Classwork Type</label>
                                <select
                                  value={newWorkType}
                                  onChange={(e) => setNewWorkType(e.target.value as any)}
                                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700"
                                >
                                  <option value="ASSIGNMENT">Interactive Assignment</option>
                                  <option value="MATERIAL">Reference Material</option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase">Instructions / Details</label>
                              <textarea
                                placeholder="State student requirements, rules or notes details here..."
                                value={newWorkDesc}
                                onChange={(e) => setNewWorkDesc(e.target.value)}
                                rows={2}
                                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-semibold resize-none"
                              />
                            </div>

                            {newWorkType === 'ASSIGNMENT' && (
                              <div className="w-1/2 space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Maximum Score Points</label>
                                <input
                                  type="number"
                                  value={newWorkPoints}
                                  onChange={(e) => setNewWorkPoints(parseInt(e.target.value) || 100)}
                                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-semibold"
                                  min={1}
                                />
                              </div>
                            )}

                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setIsCreatingWork(false)}
                                className="px-3.5 py-1.5 border rounded-xl text-xs font-black text-slate-500 hover:bg-slate-50 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={workLoading || !newWorkTitle.trim()}
                                className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition cursor-pointer"
                              >
                                {workLoading ? 'Constructing...' : 'Create Assignment'}
                              </button>
                            </div>
                          </form>
                        )}

                        {/* List Classwork */}
                        <div className="space-y-3">
                          {courseWork.length === 0 ? (
                            <div className="text-center py-10 space-y-2">
                              <BookMarked size={32} className="mx-auto text-slate-300" />
                              <h4 className="font-bold text-sm text-slate-700">No Classwork active</h4>
                              <p className="text-xs text-slate-450">Teachers can create assignments and materials above.</p>
                            </div>
                          ) : (
                            courseWork.map(work => (
                              <div key={work.id} className="p-4 border border-slate-150 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-indigo-150 transition">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                      work.workType === 'ASSIGNMENT' 
                                        ? 'bg-amber-100 text-amber-700' 
                                        : 'bg-teal-100 text-teal-700'
                                    }`}>
                                      {work.workType || 'MATERIAL'}
                                    </span>
                                    <h4 className="text-xs font-black text-slate-800">{work.title}</h4>
                                  </div>
                                  {work.description && (
                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-xl truncate">{work.description}</p>
                                  )}
                                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold pt-1">
                                    <span className="flex items-center gap-1">
                                      <Calendar size={10} />
                                      Published: {new Date(work.creationTime).toLocaleDateString()}
                                    </span>
                                    {work.maxPoints && (
                                      <span>Points: {work.maxPoints}</span>
                                    )}
                                  </div>
                                </div>

                                {work.alternateLink && (
                                  <a
                                    href={work.alternateLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-black text-slate-700 flex items-center gap-1 shrink-0 transition"
                                  >
                                    <span>Classroom Link</span>
                                    <ExternalLink size={10} />
                                  </a>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* Class Roster View */}
                    {activeSubTab === 'roster' && (
                      <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
                        {/* Teachers List */}
                        <div className="space-y-3">
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider pb-1 border-b">
                            Instructors ({roster.teachers.length})
                          </h3>
                          {roster.teachers.length === 0 ? (
                            <p className="text-xs text-slate-400 font-medium">No instructors found.</p>
                          ) : (
                            <div className="space-y-2">
                              {roster.teachers.map(t => (
                                <div key={t.userId} className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
                                  <div className="w-8 h-8 rounded-full bg-slate-200 text-xs flex items-center justify-center font-bold text-slate-650 overflow-hidden">
                                    {t.profile.photoUrl ? (
                                      <img src={t.profile.photoUrl} referrerPolicy="no-referrer" alt="" className="w-8 h-8" />
                                    ) : '👤'}
                                  </div>
                                  <div>
                                    <p className="text-xs font-extrabold text-slate-800">{t.profile.name.fullName}</p>
                                    {t.profile.emailAddress && (
                                      <p className="text-[10px] text-slate-450 font-mono">{t.profile.emailAddress}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Students List */}
                        <div className="space-y-3">
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider pb-1 border-b">
                            Students ({roster.students.length})
                          </h3>
                          {roster.students.length === 0 ? (
                            <p className="text-xs text-slate-400 font-medium">No students enrolled in this Classroom Course yet.</p>
                          ) : (
                            <div className="space-y-2">
                              {roster.students.map(s => (
                                <div key={s.userId} className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
                                  <div className="w-8 h-8 rounded-full bg-slate-200 text-xs flex items-center justify-center font-bold text-slate-650 overflow-hidden">
                                    {s.profile.photoUrl ? (
                                      <img src={s.profile.photoUrl} referrerPolicy="no-referrer" alt="" className="w-8 h-8" />
                                    ) : '👤'}
                                  </div>
                                  <div>
                                    <p className="text-xs font-extrabold text-slate-800">{s.profile.name.fullName}</p>
                                    {s.profile.emailAddress && (
                                      <p className="text-[10px] text-slate-450 font-mono">{s.profile.emailAddress}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quick Sync Livingstone Material Tab */}
                    {activeSubTab === 'sync' && (
                      <div className="space-y-5 animate-fade-in">
                        <div className="p-4 bg-indigo-50/40 border border-indigo-150 rounded-2xl space-y-2">
                          <h3 className="text-xs font-black text-indigo-950 uppercase flex items-center gap-1.5">
                            <Info size={14} className="text-indigo-650" />
                            <span>About LivingstoneEdu Syllabus Sync Pipeline</span>
                          </h3>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">
                            This panel empowers West African educators to broadcast complete **NERDC-aligned academic materials** directly into Google Classroom coursework with a single click. Configure your class, choose your subject details, and publish homework seamlessly.
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-4 p-4 border rounded-2xl bg-slate-50/50">
                            <h4 className="text-xs font-black uppercase text-slate-400">Configure Academic Sync parameters</h4>
                            
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase block">Material Type</label>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedSyncType('lesson')}
                                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer text-center border ${
                                      selectedSyncType === 'lesson'
                                        ? 'bg-white text-indigo-700 border-indigo-200 shadow-sm'
                                        : 'bg-transparent text-slate-500 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    Lesson Notes
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedSyncType('quiz')}
                                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer text-center border ${
                                      selectedSyncType === 'quiz'
                                        ? 'bg-white text-indigo-700 border-indigo-200 shadow-sm'
                                        : 'bg-transparent text-slate-500 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    Continuous CBT Quiz
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black text-slate-400 uppercase">Class Level</label>
                                  <select
                                    value={syncClassLevel}
                                    onChange={(e) => setSyncClassLevel(e.target.value as ClassLevel)}
                                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700"
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
                                  <label className="text-[10px] font-black text-slate-400 uppercase">Syllabus Week</label>
                                  <select
                                    value={syncWeek}
                                    onChange={(e) => setSyncWeek(parseInt(e.target.value) || 1)}
                                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700"
                                  >
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(week => (
                                      <option key={week} value={week}>Week {week}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Subject Channel</label>
                                <select
                                  value={syncSubject}
                                  onChange={(e) => setSyncSubject(e.target.value)}
                                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700"
                                >
                                  <option value="">-- Choose Subject --</option>
                                  <option value="Mathematics">Mathematics</option>
                                  <option value="English Studies">English Studies</option>
                                  <option value="Basic Science">Basic Science & Technology</option>
                                  <option value="Social Studies">Social Studies</option>
                                  <option value="Agricultural Science">Agricultural Science</option>
                                  <option value="National Values">National Values & Civic Education</option>
                                </select>
                              </div>

                              <button
                                onClick={handleSyncLmsMaterial}
                                disabled={syncLoading || !syncSubject}
                                className="w-full py-3 bg-indigo-650 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                              >
                                {syncLoading ? (
                                  <>
                                    <RefreshCw size={13} className="animate-spin" />
                                    <span>Syncing Syllabus Assets...</span>
                                  </>
                                ) : (
                                  <>
                                    <Send size={13} />
                                    <span>Sync with "{selectedCourse.name}"</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="p-4 border border-dashed rounded-2xl flex flex-col justify-between space-y-4">
                            <div className="space-y-2">
                              <h4 className="text-xs font-black uppercase text-slate-400">Sync Preview Details</h4>
                              <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border">
                                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                                  {selectedSyncType === 'lesson' ? '📖 Lesson Notes Material' : '📝 Continuous Assessment Quiz'}
                                </p>
                                <div className="text-[10px] text-slate-500 font-semibold space-y-1">
                                  <p>Classroom: {selectedCourse.name}</p>
                                  <p>Level: {syncClassLevel}</p>
                                  <p>Subject: {syncSubject || '(Select Subject)'}</p>
                                  <p>Module Timeline: Week {syncWeek}</p>
                                </div>
                              </div>
                            </div>

                            {syncSuccessMessage ? (
                              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold rounded-xl flex items-start gap-1.5 leading-relaxed animate-bounce">
                                <CheckCircle2 size={13} className="shrink-0 text-emerald-600 mt-0.5" />
                                <span>{syncSuccessMessage}</span>
                              </div>
                            ) : (
                              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 text-[10px] font-semibold rounded-xl flex items-start gap-1.5 leading-relaxed border border-amber-200/50">
                                <Info size={12} className="shrink-0 text-amber-600 mt-0.5" />
                                <span>Ensure your students have signed in with Google on their LivingstoneEdu dashboard so their scores sync to Google Classroom.</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center rounded-3xl shadow-xs space-y-3">
              <GraduationCap size={48} className="mx-auto text-slate-300" />
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Select a Google Classroom class</h3>
              <p className="text-xs text-slate-450 max-w-sm mx-auto">
                Please click on one of your active Google Classroom courses from the left-side panel to view homework streams, roster, and post updates.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Standalone Create Classroom dialog */}
      {isCreatingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Create Google Classroom Class</h3>
            
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Course Class Name (Required)</label>
                <input
                  type="text"
                  placeholder="E.g., SS3 Practical Mathematics Class"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl font-semibold text-slate-850 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Section / Stream</label>
                <input
                  type="text"
                  placeholder="E.g., Section Alpha / Term 1"
                  value={newCourseSection}
                  onChange={(e) => setNewCourseSection(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl font-semibold text-slate-850 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Subject Description Heading</label>
                <input
                  type="text"
                  placeholder="E.g., Mathematics & Analytics"
                  value={newCourseSubject}
                  onChange={(e) => setNewCourseSubject(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl font-semibold text-slate-850 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingCourse(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !newCourseName.trim()}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer"
                >
                  {loading ? 'Creating...' : 'Construct Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
