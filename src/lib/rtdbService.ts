import { rtdb, auth } from './firebase';
import { 
  ref, 
  set, 
  get, 
  push, 
  remove, 
  update, 
  onValue, 
  off,
  DataSnapshot
} from 'firebase/database';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { getSubjectsForClass, getWeeklyTopicTitle, getLessonContent } from '../data/curriculum';

// Define the 17 DB nodes as constants
export const NODES = {
  USERS: 'users',
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  CLASSES: 'classes',
  SUBJECTS: 'subjects',
  CURRICULUM: 'curriculum',
  SCHEMES_OF_WORK: 'schemes_of_work',
  LESSON_NOTES: 'lesson_notes',
  ATTENDANCE: 'attendance',
  EXAMS: 'exams',
  CBT: 'cbt',
  RESULTS: 'results',
  ANNOUNCEMENTS: 'announcements',
  NOTIFICATIONS: 'notifications',
  AUDIT_LOGS: 'audit_logs',
  SCHOOL_SETTINGS: 'school_settings',
  ACADEMIC_SESSIONS: 'academic_sessions',
};

// Generic Realtime Database API Helpers
export const rtdbGet = async (nodePath: string): Promise<any> => {
  try {
    const dbRef = ref(rtdb, nodePath);
    const snapshot = await get(dbRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    if (String(error).includes('Permission denied') || String(error).includes('permission_denied')) {
      console.warn(`[RTDB Get Permission] Safe bypass for path [${nodePath}].`);
      return null;
    }
    console.error(`RTDB Get Error for path [${nodePath}]:`, error);
    throw error;
  }
};

export const rtdbSet = async (nodePath: string, data: any): Promise<void> => {
  try {
    const dbRef = ref(rtdb, nodePath);
    await set(dbRef, data);
  } catch (error) {
    if (String(error).includes('Permission denied') || String(error).includes('permission_denied')) {
      console.warn(`[RTDB Set Permission] Safe bypass for path [${nodePath}].`);
      return;
    }
    console.error(`RTDB Set Error for path [${nodePath}]:`, error);
    throw error;
  }
};

export const rtdbUpdate = async (nodePath: string, data: any): Promise<void> => {
  try {
    const dbRef = ref(rtdb, nodePath);
    await update(dbRef, data);
  } catch (error) {
    if (String(error).includes('Permission denied') || String(error).includes('permission_denied')) {
      console.warn(`[RTDB Update Permission] Safe bypass for path [${nodePath}].`);
      return;
    }
    console.error(`RTDB Update Error for path [${nodePath}]:`, error);
    throw error;
  }
};

export const rtdbPush = async (nodePath: string, data: any): Promise<string> => {
  try {
    const dbRef = ref(rtdb, nodePath);
    const newRef = push(dbRef);
    const key = newRef.key || '';
    const dataWithId = typeof data === 'object' && data !== null ? { ...data, id: key } : data;
    await set(newRef, dataWithId);
    return key;
  } catch (error) {
    if (String(error).includes('Permission denied') || String(error).includes('permission_denied')) {
      console.warn(`[RTDB Push Permission] Safe bypass for path [${nodePath}].`);
      return '';
    }
    console.error(`RTDB Push Error for path [${nodePath}]:`, error);
    throw error;
  }
};

export const rtdbRemove = async (nodePath: string): Promise<void> => {
  try {
    const dbRef = ref(rtdb, nodePath);
    await remove(dbRef);
  } catch (error) {
    if (String(error).includes('Permission denied') || String(error).includes('permission_denied')) {
      console.warn(`[RTDB Remove Permission] Safe bypass for path [${nodePath}].`);
      return;
    }
    console.error(`RTDB Remove Error for path [${nodePath}]:`, error);
    throw error;
  }
};

export const rtdbSubscribe = (nodePath: string, callback: (data: any) => void): (() => void) => {
  const dbRef = ref(rtdb, nodePath);
  const listener = onValue(dbRef, (snapshot: DataSnapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  }, (error) => {
    if (String(error).includes('Permission denied') || String(error).includes('permission_denied')) {
      console.warn(`[RTDB Subscribe Permission] Safe bypass for path [${nodePath}] (user might be unauthenticated).`);
    } else {
      console.error(`RTDB Subscription dynamic error on path [${nodePath}]:`, error);
    }
  });
  return () => off(dbRef, 'value', listener);
};

// Seeding standard high-fidelity data into the 17 nodes if they don't exist
export const seedRtdbIfEmpty = async () => {
  try {
    console.log('[RTDB Seed] Check if database requires seeding...');
    
    // Check curriculum node
    const currData = await rtdbGet(NODES.CURRICULUM) || {};
    
    const mandatoryClasses = [
      'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
      'JSS 1', 'JSS 2', 'JSS 3',
      'SS 1', 'SS 2', 'SS 3'
    ];
    
    // Check if any of these standard classes are missing in existing curriculum records
    const existingCurriculumClasses = new Set(Object.values(currData).map((cur: any) => cur?.class));
    const missingCurriculumClass = mandatoryClasses.some(mc => !existingCurriculumClasses.has(mc));

    if (Object.keys(currData).length < 500 || missingCurriculumClass) {
      console.log('[RTDB Seed] Seeding missing elements of the 12 classes curriculum node...');
      
      const classesToProcess = [
        'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
        'JSS 1', 'JSS 2', 'JSS 3',
        'SS 1', 'SS 2', 'SS 3'
      ];

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

      const seedCurriculum: Record<string, any> = {};

      for (const classLevel of classesToProcess) {
        const targetClasses = classMapping[classLevel] || [classLevel];
        const subjects = getSubjectsForClass(classLevel as any);
        
        for (const targetClass of targetClasses) {
          const cleanClass = targetClass.trim().replace(/[.#$[\]/]/g, '_');

          for (const sub of subjects) {
            const cleanSubj = sub.name.trim().replace(/[.#$[\]/]/g, '_');

            for (const termNum of [1, 2, 3] as const) {
              const termLabel = `${termNum}${termNum === 1 ? 'st' : termNum === 2 ? 'nd' : 'rd'} Term`;

              for (const weekNum of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const) {
                const topicTitle = getWeeklyTopicTitle(classLevel as any, sub.id, termNum, weekNum);
                
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

                const keyId = `curr_${cleanClass}_${cleanSubj}_t${termNum}_W${weekNum}`.replace(/\s+/g, '_');
                
                seedCurriculum[keyId] = {
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
      }
      // Merge with existing ones (currData overrides standard seedCurriculum where key matches)
      await rtdbSet(NODES.CURRICULUM, { ...seedCurriculum, ...currData });
      console.log('[RTDB Seed] Seeding complete curriculum successfully finished!');
    }

    // Check school settings
    const settingsData = await rtdbGet(NODES.SCHOOL_SETTINGS);
    if (!settingsData) {
      console.log('[RTDB Seed] Seeding school settings node...');
      await rtdbSet(NODES.SCHOOL_SETTINGS, {
        brandName: 'LIVINGSTONEEDU',
        appSubtitle: 'Learning Portal',
        proPrice: '₦5,000',
        supportGroupUrl: 'https://wa.me/message/AJ4NILOGBTTMJ1',
        contactName: 'Livingtch Brand Agency',
        logoIcon: 'GraduationCap',
        logoColor: 'blue',
        logoText: 'LIVINGSTONE',
        activeGateway: 'Paystack',
        isPaymentLive: false,
        paystackPublicKey: 'pk_test_paystack_a1b2c3d4e5f6',
        flutterwavePublicKey: 'FLWPUBK_TEST-a1b2c3d4e5',
        stripePublicKey: 'pk_test_stripe_12345',
        tuitionPrimary: '₦55,000',
        tuitionJss: '₦90,000',
        tuitionSss: '₦120,000'
      });
    }

    // Check academic sessions
    const sessionsData = await rtdbGet(NODES.ACADEMIC_SESSIONS);
    if (!sessionsData) {
      console.log('[RTDB Seed] Seeding academic sessions...');
      await rtdbSet(NODES.ACADEMIC_SESSIONS, {
        currentSession: '2025/2026',
        currentTerm: '1st Term',
        termStartDate: '2025-09-15',
        termEndDate: '2025-12-15',
        availableSessions: ['2025/2026', '2026/2027']
      });
    }

    // Check classes
    const classesData = (await rtdbGet(NODES.CLASSES)) || {};
    const fullClasses = {
      'class-1': { id: 'class-1', name: 'Primary 1', section: 'Grade School', studentCount: 0 },
      'class-2': { id: 'class-2', name: 'Primary 2', section: 'Grade School', studentCount: 0 },
      'class-3': { id: 'class-3', name: 'Primary 3', section: 'Grade School', studentCount: 0 },
      'class-4': { id: 'class-4', name: 'Primary 4', section: 'Grade School', studentCount: 0 },
      'class-5': { id: 'class-5', name: 'Primary 5', section: 'Grade School', studentCount: 0 },
      'class-6': { id: 'class-6', name: 'Primary 6', section: 'Grade School', studentCount: 0 },
      'class-7': { id: 'class-7', name: 'JSS 1', section: 'Junior Secondary', studentCount: 0 },
      'class-8': { id: 'class-8', name: 'JSS 2', section: 'Junior Secondary', studentCount: 0 },
      'class-9': { id: 'class-9', name: 'JSS 3', section: 'Junior Secondary', studentCount: 0 },
      'class-10': { id: 'class-10', name: 'SS 1', section: 'Senior Secondary', studentCount: 0 },
      'class-11': { id: 'class-11', name: 'SS 2', section: 'Senior Secondary', studentCount: 0 },
      'class-12': { id: 'class-12', name: 'SS 3', section: 'Senior Secondary', studentCount: 0 }
    };

    const existingClassNames = Object.values(classesData).map((c: any) => c?.name);
    const missingMandatoryClass = Object.values(fullClasses).some((fc: any) => !existingClassNames.includes(fc.name));

    if (Object.keys(classesData).length < 12 || missingMandatoryClass) {
      console.log('[RTDB Seed] Seeding missing or all 12 classes with non-destructive merge...');
      const mergedClasses = { ...fullClasses };
      Object.keys(classesData).forEach(key => {
        const item = classesData[key];
        const fcKey = Object.keys(fullClasses).find(fk => (fullClasses as any)[fk].name === item?.name);
        if (fcKey) {
          mergedClasses[fcKey as keyof typeof fullClasses] = {
            ...mergedClasses[fcKey as keyof typeof fullClasses],
            ...item
          };
        } else {
          (mergedClasses as any)[key] = item;
        }
      });
      await rtdbSet(NODES.CLASSES, mergedClasses);
    }

    // Check subjects
    const subjectsData = await rtdbGet(NODES.SUBJECTS);
    if (!subjectsData) {
      console.log('[RTDB Seed] Seeding subjects...');
      const seedSubjects = {
        'sub-1': { id: 'mathematics', name: 'Mathematics', icon: 'GraduationCap', category: 'Core', description: 'Core math curriculum' },
        'sub-2': { id: 'english', name: 'English Studies', icon: 'BookOpen', category: 'Core', description: 'Grammar and comprehension' },
        'sub-3': { id: 'physics', name: 'Physics', icon: 'Zap', category: 'Science', description: 'Secondary physics' }
      };
      await rtdbSet(NODES.SUBJECTS, seedSubjects);
    }

    // Check schemes_of_work
    const schemesData = await rtdbGet(NODES.SCHEMES_OF_WORK);
    if (!schemesData) {
      await rtdbSet(NODES.SCHEMES_OF_WORK, {
        'scheme-1': { id: 'scheme-1', classLevel: 'SS 1', subjectId: 'mathematics', termNum: 1, weekNum: 1, focusTopic: 'Number Bases', details: 'Cover fundamental binary and octal conversions.' }
      });
    }

    // Check lesson_notes
    const lessonNotesData = await rtdbGet(NODES.LESSON_NOTES);
    if (!lessonNotesData) {
      await rtdbSet(NODES.LESSON_NOTES, {
        'note-1': { id: 'note-1', title: 'Number Bases Foundations', content: 'Detailed lesson notes covering standard binary and hexadecimal computations.', subjectId: 'mathematics', classLevel: 'SS 1', termNum: 1, weekNum: 1 }
      });
    }

    // Check cbt
    const cbtData = await rtdbGet(NODES.CBT);
    if (!cbtData) {
      const seedCbt = {
        'cbt-1': { id: 'cbt-1', title: 'Mathematics Revision Exam', subject: 'Mathematics', class: 'SS 1', term: '1st Term', questions: 15, duration: 45, status: 'Active' },
        'cbt-2': { id: 'cbt-2', title: 'WAEC Standard Chemistry Quiz', subject: 'Chemistry', class: 'SS 3', term: '2nd Term', questions: 10, duration: 30, status: 'Active' }
      };
      await rtdbSet(NODES.CBT, seedCbt);
    }

    // Check results/grades
    const resultsData = await rtdbGet(NODES.RESULTS);
    if (!resultsData) {
      const seedGrades = {
        'grd-1': { id: 'grd-1', studentName: 'Chidi Okafor', class: 'SS 1', subject: 'Mathematics', ca: 34, exam: 52, gpa: '4.3', status: 'Approved' },
        'grd-2': { id: 'grd-2', studentName: 'Amina Ibrahim', class: 'SS 1', subject: 'Mathematics', ca: 38, exam: 55, gpa: '4.8', status: 'Approved' },
        'grd-3': { id: 'grd-3', studentName: 'Obinna Eze', class: 'SS 1', subject: 'English Studies', ca: 28, exam: 42, gpa: '3.6', status: 'Pending Approval' }
      };
      await rtdbSet(NODES.RESULTS, seedGrades);
    }

    // Check announcements
    const announceData = await rtdbGet(NODES.ANNOUNCEMENTS);
    if (!announceData) {
      await rtdbSet(NODES.ANNOUNCEMENTS, {
        'ann-1': { id: 'ann-1', title: 'PTA Assembly for All Parents', content: 'PTA Meeting on Saturday, 20th June 2026.', date: new Date().toISOString().split('T')[0] }
      });
    }

    // Check attendance
    const attendanceData = await rtdbGet(NODES.ATTENDANCE);
    if (!attendanceData) {
      const seedAttendance = {
        'att-1': { id: 'att-1', studentName: 'Chidi Benson', classLevel: 'SSS 3', status: 'Present', date: new Date().toISOString().split('T')[0] },
        'att-2': { id: 'att-2', studentName: 'Kemi Adebayo', classLevel: 'SSS 3', status: 'Present', date: new Date().toISOString().split('T')[0] }
      };
      await rtdbSet(NODES.ATTENDANCE, seedAttendance);
    }

    // Check notifications
    const notifyData = await rtdbGet(NODES.NOTIFICATIONS);
    if (!notifyData) {
      await rtdbSet(NODES.NOTIFICATIONS, {
        'not-1': { id: 'not-1', title: 'Welcome Academic Portal Active', body: 'The school learning portal is successfully connected to Realtime Database.', read: false }
      });
    }

    // Check audit_logs
    const auditData = await rtdbGet(NODES.AUDIT_LOGS);
    if (!auditData) {
      const seedLogs = {
        'act-1': { id: 'act-1', userName: 'Mrs. Funke Alao', userEmail: 'funke@livingstone.ng', activityType: 'Login', subject: 'General', detail: 'Teacher Funke Alao logged in to primary dashboard', timestamp: new Date().toISOString() }
      };
      await rtdbSet(NODES.AUDIT_LOGS, seedLogs);
    }

    // Check students and teachers collections
    const studentsData = await rtdbGet(NODES.STUDENTS);
    if (!studentsData) {
      await rtdbSet(NODES.STUDENTS, {
        'student-1': { id: 'student-1', name: 'Chidi Okafor', email: 'chidi@gmail.com', classLevel: 'SS 1', outstandingBalance: '₦40,000' }
      });
    }

    const teachersData = await rtdbGet(NODES.TEACHERS);
    if (!teachersData) {
      await rtdbSet(NODES.TEACHERS, {
        'teacher-1': { id: 'teacher-1', name: 'Mrs. Funke Alao', email: 'funke@livingstone.ng', subject: 'Mathematics' }
      });
    }

    // Check default owner account setup in users node
    const usersData = await rtdbGet(NODES.USERS);
    if (!usersData) {
      await rtdbSet(NODES.USERS, {
        'toped18_gmail_com': {
          id: 'toped18_gmail_com',
          fullName: 'App Owner (Tope)',
          email: 'toped18@gmail.com',
          avatarSeed: 'scholar',
          role: 'admin',
          schoolName: 'Livingstone Educational Academy',
          isPro: true
        }
      });
    }

    console.log('[RTDB Seed] Database check/seeding complete!');
  } catch (err) {
    console.warn('[RTDB Seed Warning] Failed to successfully seed Realtime Database:', err);
  }
};

// Roles/Authorization validation logic
export const checkPermission = (userRole: string | undefined, node: string, operation: 'create' | 'read' | 'update' | 'delete'): boolean => {
  if (userRole === 'admin') return true; // Admin has full access
  
  if (userRole === 'teacher') {
    // Teachers can manage: lesson notes, attendance, CBT questions, results
    const allowedTeacherNodes = [
      NODES.LESSON_NOTES,
      NODES.ATTENDANCE,
      NODES.CBT,
      NODES.RESULTS,
      NODES.CURRICULUM, // To view curriculum mapping
      NODES.USERS, // To view user directories
      NODES.STUDENTS // To view students
    ];
    
    if (allowedTeacherNodes.includes(node)) return true;
    
    // Read access for other items
    if (operation === 'read') return true;
  }

  if (userRole === 'student') {
    // Students can only read, and specifically they'll filter their own data on client
    if (operation === 'read') return true;
  }

  return false;
};
