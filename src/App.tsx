import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { ClassLevel, User, LessonProgress, TermNumber, WeekNumber } from './types';
import { AuthScreen } from './components/AuthScreen';
import { HomeDashboard } from './components/HomeDashboard';
import { LearningHub } from './components/LearningHub';
import { FaqSection } from './components/FaqSection';
import { ContactUs } from './components/ContactUs';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { InteractiveQuizzes } from './components/InteractiveQuizzes';
import { StudentProgressPage } from './components/StudentProgressPage';
import { SubjectSelector } from './components/SubjectSelector';
import { ClassSelector } from './components/ClassSelector';
import { TeacherPortal } from './components/TeacherPortal';
import { PaymentModal } from './components/PaymentModal';
import { AdminPanel } from './components/AdminPanel';
import { GoogleClassroomHub } from './components/GoogleClassroomHub';
import { SplashLoadingScreen } from './components/SplashLoadingScreen';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { syncUserProfile, syncLessonProgress } from './lib/firebaseSync';
import { GraduationCap, LogOut, Home, BookOpen, HelpCircle, MessageSquare, ShieldCheck, Heart, Trophy, Award, Zap, Sparkles, Mail, Sun, Moon, Clock, X } from 'lucide-react';
import { seedRtdbIfEmpty, rtdbSubscribe, rtdbSet, rtdbGet, NODES } from './lib/rtdbService';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSplashLoading, setIsSplashLoading] = useState(true);
  const [progressList, setProgressList] = useState<LessonProgress[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'hub' | 'quizzes' | 'progress' | 'classroom' | 'faq' | 'contact' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');
      const validTabs = ['home', 'hub', 'quizzes', 'progress', 'classroom', 'faq', 'contact', 'admin'];
      if (validTabs.includes(path)) {
        return path as any;
      }
    }
    return 'home';
  });

  const helmetData = useMemo(() => {
    if (!currentUser) {
      return {
        title: "LIVINGSTONEEDU - West-African National Curriculum Learning Portal",
        description: "Interactive educational lesson notes, CBT mocks, continuous assessment registries, and parent-tutor communication tools fully aligned with official NERDC syllabus standards."
      };
    }
    
    switch (activeTab) {
      case 'hub':
        return {
          title: "NERDC Lessons Hub | LIVINGSTONEEDU",
          description: "Master termly subjects and weekly syllabus lessons with custom interactive guides."
        };
      case 'quizzes':
        return {
          title: "Computer-Based Tests (CBT) | LIVINGSTONEEDU",
          description: "Evaluate your subject mastery with customized mock exams and instant step-by-step scoring feedback."
        };
      case 'progress':
        return {
          title: "Academic Performance Progress | LIVINGSTONEEDU",
          description: "View your termly certificate badges, streak achievements, and completed curriculum analytics."
        };
      case 'classroom':
        return {
          title: "Google Classroom Integrator Hub | LIVINGSTONEEDU",
          description: "Import coursework profiles, sync roster enrollment databases, and update automated score gradebooks."
        };
      case 'faq':
        return {
          title: "Support FAQ Help Desk | LIVINGSTONEEDU",
          description: "Find instant answers regarding offline access, subscription plans, and secure portal configurations."
        };
      case 'contact':
        return {
          title: "Get In Touch | LIVINGSTONEEDU Support",
          description: "Connect with administrators, send curriculum development feedback, or report technical assistance requests."
        };
      case 'admin':
        return {
          title: "Administrative Console Hub | LIVINGSTONEEDU",
          description: "Configure paystack/flutterwave gateway gateways, manage school branding metadata, and inspect automated log history tables."
        };
      case 'home':
      default:
        return {
          title: "Dashboard | LIVINGSTONEEDU Learning Portal",
          description: "Access school session announcements, personal curriculum progress track lists, attendance registers, and academic metrics in real-time."
        };
    }
  }, [currentUser, activeTab]);

  const renderHelmet = () => (
    <Helmet>
      <title>{helmetData.title}</title>
      <meta name="description" content={helmetData.description} />
      <meta property="og:title" content={helmetData.title} />
      <meta property="og:description" content={helmetData.description} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={helmetData.title} />
      <meta name="twitter:description" content={helmetData.description} />
    </Helmet>
  );

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCustomizingSubjects, setIsCustomizingSubjects] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [demoUsageCount, setDemoUsageCount] = useState<number>(0);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const effectiveIsOnline = isOnline && !isSimulatedOffline;

  const [curriculums, setCurriculums] = useState<any[]>(() => {
    const raw = localStorage.getItem('system_curriculums');
    return raw ? JSON.parse(raw) : [];
  });
  const [cbtExams, setCbtExams] = useState<any[]>(() => {
    const raw = localStorage.getItem('system_cbt');
    return raw ? JSON.parse(raw) : [];
  });
  const [cbtQuestionsRecord, setCbtQuestionsRecord] = useState<Record<string, any>>(() => {
    const raw = localStorage.getItem('system_cbt_questions');
    return raw ? JSON.parse(raw) : {};
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('isDarkMode') === 'true';
  });

  const [trialTimeRemaining, setTrialTimeRemaining] = useState<number | null>(null);
  const [showTimeExpiredScreen, setShowTimeExpiredScreen] = useState<boolean>(false);
  const [premiumReminder, setPremiumReminder] = useState<{ title: string; body: string } | null>(null);

  // Synchronize trial timer state with currentUser changes
  useEffect(() => {
    if (currentUser && currentUser.role === 'student' && !currentUser.isPro) {
      const todayDate = new Date().toISOString().split('T')[0];
      if (currentUser.lastTrialAccessDate !== todayDate) {
        setTrialTimeRemaining(900);
      } else if (currentUser.trialSecondsRemaining !== undefined) {
        setTrialTimeRemaining(currentUser.trialSecondsRemaining);
      } else {
        setTrialTimeRemaining(900);
      }
    } else {
      setTrialTimeRemaining(null);
    }
  }, [currentUser?.email, currentUser?.isPro, currentUser?.trialSecondsRemaining, currentUser?.lastTrialAccessDate]);

  // 15-minute daily free trial countdown timer logic
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'student' || currentUser.isPro || trialTimeRemaining === null || trialTimeRemaining <= 0) {
      return;
    }

    // Only count down if in a learning area: hub, quizzes, progress
    const isLearningArea = ['hub', 'quizzes', 'progress'].includes(activeTab);
    if (!isLearningArea) return;

    let localSeconds = trialTimeRemaining;
    let rtdbSyncCounter = 0;

    const timer = setInterval(() => {
      localSeconds--;
      
      if (localSeconds <= 0) {
        clearInterval(timer);
        setTrialTimeRemaining(0);
        
        // Save zero state to database & state
        const id = currentUser.email.replace(/[.@]/g, '_');
        const todayDate = new Date().toISOString().split('T')[0];
        const updatedUser: User = {
          ...currentUser,
          trialSecondsRemaining: 0,
          lastTrialAccessDate: todayDate
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('hub_active_user', JSON.stringify(updatedUser));
        rtdbSet(`${NODES.USERS}/${id}`, updatedUser).catch(() => {});
        setShowTimeExpiredScreen(true);
        return;
      }

      setTrialTimeRemaining(localSeconds);

      // Save to localStorage every second so refreshes are flawless
      const todayDate = new Date().toISOString().split('T')[0];
      const partialUser = {
        ...currentUser,
        trialSecondsRemaining: localSeconds,
        lastTrialAccessDate: todayDate
      };
      localStorage.setItem('hub_active_user', JSON.stringify(partialUser));

      // Reminders at 10 minutes (600s), 5 minutes (300s), 1 minute (60s)
      if (localSeconds === 600) {
        setPremiumReminder({
          title: '⚠️ 10 Minutes Remaining',
          body: 'You have 10 minutes of free learning remaining today. Go Pro for unlimited access!'
        });
      } else if (localSeconds === 300) {
        setPremiumReminder({
          title: '⚠️ 5 Minutes Remaining',
          body: 'Only 5 minutes left! Upgrade to Premium to continue your continuous assessment.'
        });
      } else if (localSeconds === 60) {
        setPremiumReminder({
          title: '⚠️ 1 Minute Remaining',
          body: 'Hurry! Only 1 minute left. Upgrade now to avoid being locked out of your lessons.'
        });
      }

      // Sync to Realtime Database every 10 seconds (throttled)
      rtdbSyncCounter++;
      if (rtdbSyncCounter >= 10) {
        rtdbSyncCounter = 0;
        const id = currentUser.email.replace(/[.@]/g, '_');
        rtdbSet(`${NODES.USERS}/${id}/trialSecondsRemaining`, localSeconds).catch(() => {});
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentUser?.email, currentUser?.isPro, activeTab, trialTimeRemaining === null]);

  // Toggle HTML dark class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('isDarkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('isDarkMode', 'false');
    }
  }, [isDarkMode]);

  // Synchronize activeTab with URL pathname
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const targetPath = `/${activeTab}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  }, [activeTab]);

  // Listen for browser navigation (back/forward button)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');
      const validTabs = ['home', 'hub', 'quizzes', 'progress', 'faq', 'contact', 'admin'];
      if (validTabs.includes(path)) {
        setActiveTab(path as any);
      } else if (path === '') {
        setActiveTab('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 1. Splash Loading timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashLoading(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  // Dynamic branding configurations state loaded from full stack JSON DB
  const [appConfig, setAppConfig] = useState({
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
    paystackPublicKey: '',
    flutterwavePublicKey: '',
    stripePublicKey: '',
    paystackLink: 'https://paystack.com/pay/livingstone-pro-access',
    flutterwaveLink: 'https://flutterwave.com/pay/sxagj005oznw'
  });

  const renderDynamicLogo = (size: number, customClass?: string) => {
    const iconName = appConfig.logoIcon || 'GraduationCap';
    switch (iconName) {
      case 'GraduationCap': return <GraduationCap size={size} className={customClass} />;
      case 'BookOpen': return <BookOpen size={size} className={customClass} />;
      case 'Heart': return <Heart size={size} className={customClass} />;
      case 'Trophy': return <Trophy size={size} className={customClass} />;
      case 'Award': return <Award size={size} className={customClass} />;
      case 'Zap': return <Zap size={size} className={customClass} />;
      case 'Sparkles': return <Sparkles size={size} className={customClass} />;
      case 'ShieldCheck': return <ShieldCheck size={size} className={customClass} />;
      default: return <GraduationCap size={size} className={customClass} />;
    }
  };

  const logoBgColorClass = useMemo(() => {
    const c = appConfig.logoColor || 'blue';
    switch (c) {
      case 'blue': return 'bg-blue-600';
      case 'indigo': return 'bg-indigo-650';
      case 'emerald': return 'bg-emerald-600';
      case 'violet': return 'bg-violet-600';
      case 'red': return 'bg-red-650';
      case 'orange': return 'bg-orange-600';
      case 'slate': return 'bg-slate-700';
      case 'pink': return 'bg-pink-600';
      default: return 'bg-blue-600';
    }
  }, [appConfig.logoColor]);

  const logoTextColClass = useMemo(() => {
    const c = appConfig.logoColor || 'blue';
    switch (c) {
      case 'blue': return 'text-blue-600';
      case 'indigo': return 'text-indigo-650';
      case 'emerald': return 'text-emerald-600';
      case 'violet': return 'text-violet-600';
      case 'red': return 'text-red-650';
      case 'orange': return 'text-orange-600';
      case 'slate': return 'text-slate-700';
      case 'pink': return 'text-pink-600';
      default: return 'text-blue-600';
    }
  }, [appConfig.logoColor]);

  // 1. Subscribe to dynamic school branding configurations on mount (works instantly for Splash Screen & AuthScreen!)
  useEffect(() => {
    const unsubBranding = rtdbSubscribe(NODES.SCHOOL_SETTINGS, (data) => {
      if (data && data.brandName) {
        setAppConfig({
          brandName: data.brandName,
          appSubtitle: data.appSubtitle || 'Learning Portal',
          proPrice: data.proPrice || '₦5,000',
          supportGroupUrl: data.supportGroupUrl || 'https://wa.me/message/AJ4NILOGBTTMJ1',
          contactName: data.contactName || 'Livingtch Brand Agency',
          logoIcon: data.logoIcon || 'GraduationCap',
          logoColor: data.logoColor || 'blue',
          logoText: data.logoText || 'LIVINGSTONE',
          activeGateway: data.activeGateway || 'Paystack',
          isPaymentLive: !!data.isPaymentLive,
          paystackPublicKey: data.paystackPublicKey || '',
          flutterwavePublicKey: data.flutterwavePublicKey || '',
          stripePublicKey: data.stripePublicKey || '',
          paystackLink: data.paystackLink || 'https://paystack.com/pay/livingstone-pro-access',
          flutterwaveLink: data.flutterwaveLink || 'https://flutterwave.com/pay/sxagj005oznw'
        });
      }
    });
    return () => {
      unsubBranding();
    };
  }, []);

  // 1b. Real-time subscriptions for curriculum, cbt, questions, and user profile sync
  useEffect(() => {
    if (!currentUser) return;

    // 1. Subscribe to Curriculum
    const unsubCurr = rtdbSubscribe(NODES.CURRICULUM, (data) => {
      if (data) {
        const flattenNestedCurriculum = (node: any): any[] => {
          if (!node || typeof node !== 'object') return [];
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

        const arr = flattenNestedCurriculum(data);
        setCurriculums(arr);
        window.localStorage.setItem('system_curriculums', JSON.stringify(arr));
      }
    });

    // 2. Subscribe to CBT Exams List
    const unsubCbt = rtdbSubscribe(NODES.CBT, (data) => {
      if (data) {
        const arr = Array.isArray(data) ? data : Object.values(data);
        setCbtExams(arr);
        window.localStorage.setItem('system_cbt', JSON.stringify(arr));
      }
    });

    // 3. Subscribe to CBT Questions Record
    const unsubQuestions = rtdbSubscribe('cbt_questions', (data) => {
      if (data) {
        setCbtQuestionsRecord(data);
        window.localStorage.setItem('system_cbt_questions', JSON.stringify(data));
      }
    });

    // 4. Subscribe to live user updates to get pro / role / name / class level changes instantly
    const userId = currentUser.email.replace(/[.@]/g, '_');
    const unsubUser = rtdbSubscribe(`${NODES.USERS}/${userId}`, (data) => {
      if (data) {
        // Prevent infinite loops from the trial timer ticking updates
        setCurrentUser(prev => {
          if (!prev) return data;
          if (
            prev.isPro !== data.isPro ||
            prev.role !== data.role ||
            prev.classLevel !== data.classLevel ||
            JSON.stringify(prev.selectedSubjectIds) !== JSON.stringify(data.selectedSubjectIds)
          ) {
            return { ...prev, ...data };
          }
          return prev;
        });
        window.localStorage.setItem('hub_active_user', JSON.stringify(data));
      }
    });

    return () => {
      unsubCurr();
      unsubCbt();
      unsubQuestions();
      unsubUser();
    };
  }, [currentUser?.email]);

  // 2. Firebase Auth state listener and database seeding
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        const cleanEmail = firebaseUser.email.toLowerCase();
        const id = cleanEmail.replace(/[.@]/g, '_');
        
        // Seed database asynchronously in the background after a short delay so it doesn't compete with loading the user profile
        setTimeout(() => {
          seedRtdbIfEmpty();
        }, 1200);

        // Grab full loaded user profile from RTDB
        let userProfile = await rtdbGet(`${NODES.USERS}/${id}`);
        const todayDate = new Date().toISOString().split('T')[0];

        if (userProfile) {
          if (userProfile.role === 'student' && !userProfile.isPro) {
            if (userProfile.lastTrialAccessDate !== todayDate) {
              userProfile.trialSecondsRemaining = 900;
              userProfile.lastTrialAccessDate = todayDate;
              await rtdbSet(`${NODES.USERS}/${id}`, userProfile).catch(() => {});
            }
          }
          setCurrentUser(userProfile);
          localStorage.setItem('hub_active_user', JSON.stringify(userProfile));
        } else {
          // Build fallback profile if logged in but DB records aren't ready yet
          const fallbackProfile: User = {
            id,
            fullName: cleanEmail.split('@')[0],
            email: cleanEmail,
            avatarSeed: 'scholar',
            classLevel: cleanEmail === 'toped18@gmail.com' ? 'SS 1' : 'Primary 4',
            selectedSubjectIds: cleanEmail === 'toped18@gmail.com' ? ['physics'] : ['mathematics', 'english'],
            role: cleanEmail === 'toped18@gmail.com' ? 'admin' : 'student',
            joinDate: new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }),
            trialSecondsRemaining: cleanEmail === 'toped18@gmail.com' ? undefined : 900,
            lastTrialAccessDate: cleanEmail === 'toped18@gmail.com' ? undefined : todayDate
          };
          setCurrentUser(fallbackProfile);
          localStorage.setItem('hub_active_user', JSON.stringify(fallbackProfile));
        }
      } else {
        // Logout or unauthenticated
        // Double check local storage if no user logged in to ease refresh
        const loadedProfile = localStorage.getItem('hub_active_user');
        if (loadedProfile) {
          const parsed = JSON.parse(loadedProfile);
          if (parsed && parsed.role === 'student' && !parsed.isPro) {
            const todayDate = new Date().toISOString().split('T')[0];
            if (parsed.lastTrialAccessDate !== todayDate) {
              parsed.trialSecondsRemaining = 900;
              parsed.lastTrialAccessDate = todayDate;
              localStorage.setItem('hub_active_user', JSON.stringify(parsed));
            }
          }
          setCurrentUser(parsed);
        } else {
          setCurrentUser(null);
        }
      }
    });

    return () => {
      unsubAuth();
    };
  }, []);

  // Sync/Load demo usage count
  useEffect(() => {
    if (currentUser) {
      const uses = Number(localStorage.getItem(`livingstone_uses_${currentUser.id}`) || 0);
      setDemoUsageCount(uses);
    }
  }, [currentUser]);

  const handleIncrementDemoUsage = () => {
    if (!currentUser) return 0;
    const nextVal = demoUsageCount + 1;
    setDemoUsageCount(nextVal);
    localStorage.setItem(`livingstone_uses_${currentUser.id}`, String(nextVal));
    return nextVal;
  };

  // Calculate live user points
  const totalXpoints = useMemo(() => {
    if (!currentUser) return 0;
    const userProgress = progressList.filter(p => p.userId === currentUser.id);
    let pts = 0;
    userProgress.forEach(p => {
      pts += 100; // reading lesson
      if (p.score !== undefined) {
        pts += 50; // quiz attempt
        if (p.score === 100) {
          pts += 150; // perfect bonus
        } else if (p.score >= 66) {
          pts += 100; // pass bonus
        }
      }
    });
    return pts;
  }, [progressList, currentUser]);

  // 1. Load authenticated user and progress from localStorage on initial render
  useEffect(() => {
    const loadedProfile = localStorage.getItem('hub_active_user');
    if (loadedProfile) {
      setCurrentUser(JSON.parse(loadedProfile));
    }

    const loadedProgress = localStorage.getItem('hub_lesson_progress');
    if (loadedProgress) {
      setProgressList(JSON.parse(loadedProgress));
    }
  }, []);

  // 2. Event: Student logs in or creates profile
  const handleAuthComplete = (profileData: { fullName: string; email: string; classLevel?: ClassLevel; avatarSeed: string; selectedSubjectIds?: string[]; role?: 'student' | 'teacher' | 'admin'; schoolName?: string; isPro?: boolean }) => {
    const isTeacher = profileData.role === 'teacher';
    const isAdmin = profileData.role === 'admin';

    const newProfile: User = {
      ...profileData,
      role: profileData.role || 'student',
      classLevel: isTeacher ? 'SS 1' : isAdmin ? 'SS 1' : profileData.classLevel,
      selectedSubjectIds: isTeacher ? ['physics', 'chemistry', 'further_math'] : isAdmin ? ['physics'] : profileData.selectedSubjectIds,
      id: profileData.email.replace(/[.@]/g, '_'),
      joinDate: new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }),
      isPro: isAdmin ? true : profileData.isPro
    };

    setCurrentUser(newProfile);
    localStorage.setItem('hub_active_user', JSON.stringify(newProfile));
    syncUserProfile(newProfile); // Push to Firestore

    if (isAdmin) {
      setActiveTab('admin'); // Let admin login straight to admin panel to manage the whole app
    } else {
      setActiveTab('home'); // Send straight to Home Dashboard
    }
  };

  // Event: Save chosen Class Level post registration or login
  const handleSaveClassLevel = (classLevel: ClassLevel) => {
    if (!currentUser) return;

    const updatedUser: User = {
      ...currentUser,
      classLevel,
      selectedSubjectIds: undefined // Explicitly prompt subject selector right after
    };

    setCurrentUser(updatedUser);
    localStorage.setItem('hub_active_user', JSON.stringify(updatedUser));
    syncUserProfile(updatedUser); // Push to Firestore

    // Also persist directly to Realtime Database (RTDB)
    const id = currentUser.email.replace(/[.@]/g, '_');
    rtdbSet(`${NODES.USERS}/${id}`, updatedUser).catch(err => {
      console.error("Failed to sync class preference to RTDB:", err);
    });

    // Update global list as well
    const mockUserList = JSON.parse(localStorage.getItem('hub_users') || '[]');
    const idx = mockUserList.findIndex((u: any) => u.email.toLowerCase() === currentUser.email.toLowerCase());
    if (idx !== -1) {
      mockUserList[idx].classLevel = classLevel;
      mockUserList[idx].selectedSubjectIds = undefined;
      localStorage.setItem('hub_users', JSON.stringify(mockUserList));
    }
  };

  // Event: Save personalized student subject settings
  const handleSaveSubjectSelection = (selectedSubjectIds: string[]) => {
    if (!currentUser) return;

    const updatedUser: User = {
      ...currentUser,
      selectedSubjectIds
    };

    setCurrentUser(updatedUser);
    localStorage.setItem('hub_active_user', JSON.stringify(updatedUser));
    syncUserProfile(updatedUser); // Push to Firestore

    // Also persist directly to Realtime Database (RTDB)
    const id = currentUser.email.replace(/[.@]/g, '_');
    rtdbSet(`${NODES.USERS}/${id}`, updatedUser).catch(err => {
      console.error("Failed to sync subject preference to RTDB:", err);
    });

    // Update global users database in localStorage as well
    const mockUserList = JSON.parse(localStorage.getItem('hub_users') || '[]');
    const idx = mockUserList.findIndex((u: any) => u.email.toLowerCase() === currentUser.email.toLowerCase());
    if (idx !== -1) {
      mockUserList[idx].selectedSubjectIds = selectedSubjectIds;
      localStorage.setItem('hub_users', JSON.stringify(mockUserList));
    }

    // Refresh layout view
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 200);
  };

  // 3. Event: Sign Out / Reset session
  const handleSignOut = () => {
    signOut(auth).then(() => {
      setCurrentUser(null);
      localStorage.removeItem('hub_active_user');
      setActiveTab('home');
    }).catch((err) => {
      console.error("Sign out error:", err);
      setCurrentUser(null);
      localStorage.removeItem('hub_active_user');
      setActiveTab('home');
    });
  };

  // Payment Upgrade Callback Handler
  const handlePaymentSuccess = () => {
    if (!currentUser) return;
    const updated = { ...currentUser, isPro: true };
    setCurrentUser(updated);
    localStorage.setItem('hub_active_user', JSON.stringify(updated));
    
    // Push updates to Firestore and Realtime Database
    syncUserProfile(updated);
    const id = currentUser.email.replace(/[.@]/g, '_');
    rtdbSet(`${NODES.USERS}/${id}`, updated).catch(err => {
      console.error("Failed to sync premium state to RTDB:", err);
    });

    // Update local users database as well
    const mockUserList = JSON.parse(localStorage.getItem('hub_users') || '[]');
    const idx = mockUserList.findIndex((u: any) => u.email.toLowerCase() === currentUser.email.toLowerCase());
    if (idx !== -1) {
      mockUserList[idx].isPro = true;
      localStorage.setItem('hub_users', JSON.stringify(mockUserList));
    }
    
    setShowTimeExpiredScreen(false);
    setIsPaymentModalOpen(false);
  };

  // 4. Event: Switch academic class level
  const handleClassChange = (newClass: ClassLevel) => {
    if (!currentUser) return;
    
    const updatedUser = {
      ...currentUser,
      classLevel: newClass
    };
    
    // Persist profile updates
    setCurrentUser(updatedUser);
    localStorage.setItem('hub_active_user', JSON.stringify(updatedUser));

    // Update global user database list as well
    const mockUserList = JSON.parse(localStorage.getItem('hub_users') || '[]');
    const idx = mockUserList.findIndex((u: any) => u.email.toLowerCase() === currentUser.email.toLowerCase());
    if (idx !== -1) {
      mockUserList[idx].classLevel = newClass;
      localStorage.setItem('hub_users', JSON.stringify(mockUserList));
    }

    // Refresh layout views
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 200);
  };

  // 5. Event: Click checklist completion or update high test scores
  const handleToggleComplete = (
    subjectId: string, 
    termNum: TermNumber, 
    weekNum: WeekNumber, 
    score?: number
  ) => {
    if (!currentUser) return;

    const existingIdx = progressList.findIndex(
      (p) => 
        p.userId === currentUser.id &&
        p.classLevel === currentUser.classLevel &&
        p.subjectId === subjectId &&
        p.termNum === termNum &&
        p.weekNum === weekNum
    );

    let updatedList = [...progressList];

    if (existingIdx !== -1) {
      // Update record
      const record = updatedList[existingIdx];
      // Keep completed as true, update score optionally if provided is higher (or newer)
      record.completed = true;
      if (score !== undefined) {
        record.score = Math.max(record.score || 0, score);
      }
      record.lastAccessed = new Date().toISOString();
    } else {
      // Create new completion record
      const newRecord: LessonProgress = {
        userId: currentUser.id,
        classLevel: currentUser.classLevel,
        subjectId,
        termNum,
        weekNum,
        completed: true,
        score,
        lastAccessed: new Date().toISOString()
      };
      updatedList.push(newRecord);
    }

    setProgressList(updatedList);
    localStorage.setItem('hub_lesson_progress', JSON.stringify(updatedList));

    // Sync to Firestore
    const activeUpdate = updatedList.find(r => r.subjectId === subjectId && r.termNum === termNum && r.weekNum === weekNum);
    if (activeUpdate && currentUser?.email) {
      syncLessonProgress(currentUser.email, activeUpdate);
    }
  };

  // 6. If initial splash loading state is active, render the premium Splash Screen with blue background
  if (isSplashLoading) {
    return (
      <>
        {renderHelmet()}
        <SplashLoadingScreen 
          brandName={appConfig.brandName}
          appSubtitle={appConfig.appSubtitle}
          logoIcon={appConfig.logoIcon}
          logoText={appConfig.logoText}
        />
      </>
    );
  }

  // 7. If no active user profile is found, render Signup / Signin page
  if (!currentUser) {
    return (
      <>
        {renderHelmet()}
        <AuthScreen onAuthComplete={handleAuthComplete} />
      </>
    );
  }

  // Step 1: If user has not selected their academic class level yet, prompt them to choose it first!
  if (currentUser && !currentUser.classLevel && currentUser.role === 'student') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        {renderHelmet()}
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 mb-6 animate-fade-in font-sans">
          <div className="inline-flex p-3 bg-blue-600 rounded-2xl shadow-md text-white animate-bounce">
            <GraduationCap size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{appConfig.brandName.toUpperCase()}</h1>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1.5">Configure Academic Class</p>
          </div>
        </div>
        <ClassSelector 
          onSave={handleSaveClassLevel} 
        />
      </div>
    );
  }

  // Step 2: If user is logged in but has not defined their selected subjects yet, prompt them to personalize first!
  if (currentUser && !currentUser.selectedSubjectIds && currentUser.role === 'student') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        {renderHelmet()}
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 mb-6 animate-fade-in font-sans">
          <div className="inline-flex p-3 bg-blue-600 rounded-2xl shadow-md text-white animate-bounce">
            <GraduationCap size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{appConfig.brandName.toUpperCase()}</h1>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1.5">Configure Study Plan</p>
          </div>
        </div>
        <SubjectSelector 
          user={currentUser} 
          onSave={handleSaveSubjectSelection} 
        />
      </div>
    );
  }

  // If logged in as a teacher, route straight to the specialized Teacher Admin Portal
  if (currentUser && currentUser.role === 'teacher') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
        {renderHelmet()}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-205 backdrop-blur-md bg-white/95">
          <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-12">
            <div className="flex h-16 items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 ${logoBgColorClass} rounded-xl shadow-sm text-white`}>
                  {renderDynamicLogo(22)}
                </div>
                <div>
                  <h1 className="text-sm font-black font-display text-slate-900 tracking-tight leading-none">{appConfig.brandName.toUpperCase()}</h1>
                  <p className={`text-[10px] font-bold ${logoTextColClass} tracking-wider uppercase mt-0.5`}>Staff Control Center</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right text-xs">
                  <span className="font-extrabold text-slate-850 truncate max-w-40">{currentUser.fullName}</span>
                  <span className="text-[10px] text-slate-400 font-bold font-sans">Class Administrator</span>
                </div>
                <div className="w-8.5 h-8.5 rounded-full bg-slate-50 border border-slate-200 text-base flex items-center justify-center">
                  👩‍🏫
                </div>
                <button
                  type="button"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  title="Toggle Theme"
                  className="p-2 border border-slate-200 text-slate-455 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer flex items-center justify-center font-bold"
                >
                  {isDarkMode ? <Sun size={16} className="text-amber-500 fill-amber-300 animate-pulse" /> : <Moon size={16} />}
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Logout Teacher Portal"
                  className="p-2 border border-slate-200 text-slate-455 hover:text-red-655 hover:border-red-200 rounded-xl transition cursor-pointer font-bold"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow max-w-full w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 md:px-0 sm:px-0">
          <TeacherPortal 
            user={currentUser} 
            onNavigateToHome={handleSignOut}
            isPro={!!currentUser.isPro}
            onPaymentTrigger={() => setIsPaymentModalOpen(true)}
            proPrice={appConfig.proPrice}
          />
        </main>

        <footer className="bg-white border-t border-slate-150 py-8 text-center text-slate-500 text-xs">
          <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-12 flex justify-between items-center text-slate-400">
            <p>&copy; 2026 {appConfig.brandName.toUpperCase()}. Secure Teacher administration.</p>
            <p className="font-bold text-slate-600">Staff Portal Active</p>
          </div>
        </footer>

        {isPaymentModalOpen && (
          <PaymentModal 
            user={currentUser}
            onPaymentSuccess={handlePaymentSuccess}
            onClose={() => setIsPaymentModalOpen(false)}
            brandName={appConfig.brandName}
            proPrice={appConfig.proPrice}
            paystackLink={(appConfig as any).paystackLink}
            flutterwaveLink={(appConfig as any).flutterwaveLink}
            bankName={(appConfig as any).bankName}
            bankAccountNumber={(appConfig as any).bankAccountNumber}
            bankAccountName={(appConfig as any).bankAccountName}
          />
        )}
      </div>
    );
  }

  // If logged in as an administrator, route straight to the specialized standalone Admin Panel Core
  if (currentUser && currentUser.role === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans overflow-x-hidden w-full max-w-full">
        {renderHelmet()}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-205 backdrop-blur-md bg-white/95">
          <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-12">
            <div className="flex h-16 items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 bg-transparent">
                <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-650 rounded-xl shadow-sm text-white">
                  {renderDynamicLogo(18)}
                </div>
                <div>
                  <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none">{appConfig.brandName.toUpperCase()}</h1>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1 leading-none font-sans">Administration Command Console</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right text-xs">
                  <span className="font-extrabold text-slate-850 truncate max-w-40">{currentUser.fullName}</span>
                  <span className="text-[10px] text-slate-450 font-bold font-sans">System Administrator</span>
                </div>
                <div className="w-8.5 h-8.5 rounded-full bg-slate-50 border border-slate-200 text-base flex items-center justify-center">
                  🛡️
                </div>
                <button
                  type="button"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  title="Toggle Theme"
                  className="p-2 border border-slate-200 text-slate-455 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer flex items-center justify-center font-bold"
                >
                  {isDarkMode ? <Sun size={16} className="text-amber-500 fill-amber-300 animate-pulse" /> : <Moon size={16} />}
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Logout Administrative Console"
                  className="p-2 border border-slate-200 text-slate-455 hover:text-red-655 hover:border-red-200 rounded-xl transition cursor-pointer font-bold"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow max-w-full w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 md:px-0 sm:px-0">
          <AdminPanel 
            currentConfig={appConfig}
            onConfigChange={(newConfig) => setAppConfig(newConfig)}
            currentUser={currentUser}
          />
        </main>

        <footer className="bg-white border-t border-slate-150 py-8 text-center text-slate-500 text-xs">
          <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-12 flex justify-between items-center text-slate-400">
            <p>&copy; 2026 {appConfig.brandName.toUpperCase()}. Core App Administration Dashboard.</p>
            <p className="font-bold text-slate-600">Operational Security Mode Active</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col justify-between overflow-x-hidden w-full max-w-full">
      {renderHelmet()}
      
      {isPaymentModalOpen && (
        <PaymentModal 
          user={currentUser}
          onPaymentSuccess={handlePaymentSuccess}
          onClose={() => setIsPaymentModalOpen(false)}
          brandName={appConfig.brandName}
          proPrice={appConfig.proPrice}
          paystackLink={(appConfig as any).paystackLink}
          flutterwaveLink={(appConfig as any).flutterwaveLink}
          bankName={(appConfig as any).bankName}
          bankAccountNumber={(appConfig as any).bankAccountNumber}
          bankAccountName={(appConfig as any).bankAccountName}
        />
      )}
      
      {/* 2. Page Navigation Bar Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-205 backdrop-blur-md bg-white/95">
        <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex h-16 items-center justify-between gap-4">
            
            {/* Logo / Brand Header */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 bg-transparent shrink-0">
              <div className="p-1.5 sm:p-2 bg-gradient-to-tr from-blue-600 to-indigo-650 rounded-xl shadow-xs text-white">
                {renderDynamicLogo(16)}
              </div>
              <div>
                <h1 className="text-xs sm:text-sm font-extrabold tracking-wider font-sans text-slate-900 uppercase leading-none">{appConfig.brandName}</h1>
                <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 tracking-widest uppercase mt-0.5 sm:mt-1 leading-none">{appConfig.appSubtitle}</p>
              </div>
            </div>

            {/* Desktop Navigation Links Selector */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'home' 
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Home size={13} />
                <span>Home Dashboard</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('hub')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'hub' 
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen size={13} />
                <span>Learning Hub</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('quizzes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'quizzes' 
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Trophy size={13} className={activeTab === 'quizzes' ? 'text-amber-500 fill-amber-300' : ''} />
                <span>Syllabus Quizzes</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('progress')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'progress' 
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award size={13} className={activeTab === 'progress' ? 'text-indigo-600 fill-indigo-300' : ''} />
                <span>My Progress & Leaderboard</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('classroom')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'classroom' 
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap size={13} className={activeTab === 'classroom' ? 'text-emerald-600 fill-emerald-300' : ''} />
                <span>Google Classroom</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('faq')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'faq' 
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HelpCircle size={13} />
                <span>FAQs Accordion</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('contact')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'contact' 
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50' 
                    : 'text-slate-655 hover:text-slate-900'
                }`}
              >
                <MessageSquare size={13} />
                <span>Help & Contacts</span>
              </button>
              {currentUser?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'admin' 
                      ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50 font-black' 
                      : 'text-slate-655 hover:text-slate-900 bg-slate-50 hover:bg-slate-100/60'
                  }`}
                >
                  <ShieldCheck size={13} className={activeTab === 'admin' ? 'text-blue-700' : 'text-blue-650'} />
                  <span>Admin Panel</span>
                </button>
              )}
            </nav>

            {/* User Profile Summary trigger */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Network Connectivity status with simulated toggling capability */}
              {!effectiveIsOnline ? (
                <div 
                  onClick={() => setIsSimulatedOffline(false)}
                  className="flex items-center gap-1 px-1.5 py-1 bg-red-50 text-red-700 rounded-lg border border-red-200 text-[10px] font-extrabold uppercase tracking-wider animate-pulse hover:bg-red-100 transition cursor-pointer" 
                  title="Offline Mode: Progress is cached locally and will sync once you reconnect to the internet. Click to reconnect!"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                  <span className="hidden sm:inline">Offline Caching</span>
                </div>
              ) : (
                <div 
                  onClick={() => setIsSimulatedOffline(true)}
                  className="flex items-center gap-1 px-1.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-155 text-[10px] font-extrabold uppercase tracking-wider hover:bg-emerald-100/60 transition cursor-pointer" 
                  title="All systems synchronized. Click to simulate Offline mode!"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="hidden sm:inline">Connected</span>
                </div>
              )}

              {/* Countdown Timer Badge */}
              {currentUser && currentUser.role === 'student' && !currentUser.isPro && trialTimeRemaining !== null && (
                <div 
                  className={`flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-xl border font-sans text-xs font-black uppercase tracking-wider shadow-sm select-none animate-pulse ${
                    trialTimeRemaining <= 60 
                      ? 'bg-red-50 text-red-600 border-red-200' 
                      : trialTimeRemaining <= 300 
                        ? 'bg-amber-50 text-amber-600 border-amber-200' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                  title="Free Learning Time Remaining today"
                >
                  <Clock size={11} className={`${
                    trialTimeRemaining <= 60 
                      ? 'text-red-500' 
                      : trialTimeRemaining <= 300 
                        ? 'text-amber-500' 
                        : 'text-emerald-500'
                  }`} />
                  <span className="text-[9px] hidden md:inline text-slate-500 font-bold uppercase tracking-tight">Free Time:</span>
                  <span className="font-mono text-[11px] tracking-tight font-extrabold">
                    {Math.floor(trialTimeRemaining / 60)}:{(trialTimeRemaining % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}

              {currentUser?.isPro ? (
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-750 rounded-lg border border-amber-200 text-[10px] font-black uppercase tracking-wider">
                  <Sparkles size={11} className="fill-amber-400 text-amber-550" />
                  <span>Pro Active</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="flex items-center gap-1 p-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:brightness-110 transition shadow-sm cursor-pointer sm:px-3 sm:py-1 sm:gap-1.5"
                  title={`Go Pro (${appConfig.proPrice})`}
                >
                  <Zap size={11} className="fill-white" />
                  <span className="hidden sm:inline">Go Pro ({appConfig.proPrice})</span>
                </button>
              )}

              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-extrabold text-slate-850 truncate max-w-40">{currentUser.fullName}</span>
                <span className="text-[10px] text-slate-400 font-semibold">{currentUser.classLevel} &bull; <span className="text-amber-600 font-black">⚡ {totalXpoints} XP</span></span>
              </div>

              {/* Status avatar icon */}
              <div className="hidden sm:flex w-8.5 h-8.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 items-center justify-center">
                <GraduationCap size={15} className="stroke-[2.5]" />
              </div>

              {/* Theme toggle button */}
              <button
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                title="Toggle Theme"
                className="p-1.5 sm:p-2 border border-slate-200 text-slate-455 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer flex items-center justify-center font-bold"
              >
                {isDarkMode ? <Sun size={14} className="text-amber-500 fill-amber-300 animate-pulse" /> : <Moon size={14} />}
              </button>

              {/* Sign out key icon */}
              <button
                type="button"
                onClick={handleSignOut}
                title="Logout Student Profile"
                className="p-1.5 sm:p-2 border border-slate-200 text-slate-455 hover:text-red-555 hover:border-red-200 rounded-xl transition cursor-pointer"
              >
                <LogOut size={14} />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Tab Floating Rail Toolbar */}
      <div className="md:hidden sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 p-2 flex gap-1 justify-around shadow-xs overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center py-1.5 px-1 rounded-lg text-[10px] font-bold tracking-tight transition duration-200 cursor-pointer ${
            activeTab === 'home' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'
          }`}
        >
          <Home size={14} className="stroke-[2.5]" />
          <span>Home</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('hub')}
          className={`flex flex-col items-center py-1.5 px-1 rounded-lg text-[10px] font-bold tracking-tight transition duration-200 cursor-pointer ${
            activeTab === 'hub' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'
          }`}
        >
          <BookOpen size={14} className="stroke-[2.5]" />
          <span>Hub</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('quizzes')}
          className={`flex flex-col items-center py-1.5 px-1 rounded-lg text-[10px] font-bold tracking-tight transition duration-200 cursor-pointer ${
            activeTab === 'quizzes' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'
          }`}
        >
          <Trophy size={14} className={`stroke-[2.5] ${activeTab === 'quizzes' ? 'text-amber-500 fill-amber-300' : ''}`} />
          <span>Quiz</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('progress')}
          className={`flex flex-col items-center py-1.5 px-1 rounded-lg text-[10px] font-bold tracking-tight transition duration-200 cursor-pointer ${
            activeTab === 'progress' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'
          }`}
        >
          <Award size={14} className={`stroke-[2.5] ${activeTab === 'progress' ? 'text-blue-600 fill-blue-300' : ''}`} />
          <span>Stats</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('classroom')}
          className={`flex flex-col items-center py-1.5 px-1 rounded-lg text-[10px] font-bold tracking-tight transition duration-200 cursor-pointer ${
            activeTab === 'classroom' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'
          }`}
        >
          <GraduationCap size={14} className={`stroke-[2.5] ${activeTab === 'classroom' ? 'text-emerald-600 fill-emerald-300' : ''}`} />
          <span>Classroom</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('faq')}
          className={`flex flex-col items-center py-1.5 px-1 rounded-lg text-[10px] font-bold tracking-tight transition duration-200 cursor-pointer ${
            activeTab === 'faq' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'
          }`}
        >
          <HelpCircle size={14} className="stroke-[2.5]" />
          <span>FAQ</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`flex flex-col items-center py-1.5 px-1 rounded-lg text-[10px] font-bold tracking-tight transition duration-200 cursor-pointer ${
            activeTab === 'contact' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'
          }`}
        >
          <MessageSquare size={14} className="stroke-[2.5]" />
          <span>Help</span>
        </button>
        {currentUser?.role === 'admin' && (
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center py-1.5 px-1 rounded-lg text-[10px] font-bold tracking-tight transition duration-200 cursor-pointer ${
              activeTab === 'admin' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'
            }`}
          >
            <ShieldCheck size={14} className={`stroke-[2.5] ${activeTab === 'admin' ? 'text-blue-650' : 'text-slate-500'}`} />
            <span>Admin</span>
          </button>
        )}
      </div>

      {/* 3. Main content body sections with responsive boundaries */}
      <main className="flex-grow max-w-full w-full mx-auto px-4 sm:px-8 lg:px-12 py-8">
        {isRefreshing ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-2">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Re-tuning curriculum mapping...</p>
          </div>
        ) : isCustomizingSubjects ? (
          <div className="max-w-2xl mx-auto py-4 animate-fade-in">
            <SubjectSelector 
              user={currentUser}
              onSave={(ids) => {
                handleSaveSubjectSelection(ids);
                setIsCustomizingSubjects(false);
              }}
              onCancel={() => setIsCustomizingSubjects(false)}
              isSettingsView={true}
            />
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeDashboard 
                user={currentUser} 
                progressList={progressList} 
                onNavigateToHub={(subjectId) => {
                  if (subjectId) {
                    setSelectedSubjectId(subjectId);
                  }
                  setActiveTab('hub');
                }}
                onClassChange={handleClassChange}
                onCustomizeSubjects={() => setIsCustomizingSubjects(true)}
              />
            )}

            <div className={['hub', 'quizzes', 'progress'].includes(activeTab) && currentUser && currentUser.role === 'student' && !currentUser.isPro && trialTimeRemaining === 0 ? "filter blur-md pointer-events-none select-none transition-all duration-500" : ""}>
              {activeTab === 'hub' && (
                <LearningHub 
                  user={currentUser} 
                  progressList={progressList} 
                  onToggleComplete={handleToggleComplete}
                  isPro={!!currentUser.isPro}
                  onPaymentTrigger={() => setIsPaymentModalOpen(true)}
                  demoUsageCount={demoUsageCount}
                  onIncrementDemoUsage={handleIncrementDemoUsage}
                  onCustomizeSubjects={() => setIsCustomizingSubjects(true)}
                  selectedSubjectId={selectedSubjectId}
                  setSelectedSubjectId={setSelectedSubjectId}
                  curriculums={curriculums}
                  proPrice={appConfig.proPrice}
                />
              )}

              {activeTab === 'quizzes' && (
                <InteractiveQuizzes
                  user={currentUser}
                  progressList={progressList}
                  onToggleComplete={handleToggleComplete}
                  isPro={!!currentUser.isPro}
                  onPaymentTrigger={() => setIsPaymentModalOpen(true)}
                  demoUsageCount={demoUsageCount}
                  onIncrementDemoUsage={handleIncrementDemoUsage}
                  curriculums={curriculums}
                  cbtExams={cbtExams}
                  cbtQuestionsRecord={cbtQuestionsRecord}
                  proPrice={appConfig.proPrice}
                />
              )}

              {activeTab === 'progress' && (
                <StudentProgressPage
                  user={currentUser}
                  progressList={progressList}
                  onNavigateToQuizzes={() => setActiveTab('quizzes')}
                />
              )}
            </div>

            {activeTab === 'classroom' && currentUser && (
              <GoogleClassroomHub 
                user={currentUser} 
                curriculums={curriculums} 
              />
            )}

            {activeTab === 'faq' && (
              <FaqSection />
            )}

            {activeTab === 'contact' && (
              <ContactUs 
                user={currentUser} 
                brandName={appConfig.brandName}
                contactName={appConfig.contactName}
                supportGroupUrl={appConfig.supportGroupUrl}
              />
            )}

            {activeTab === 'admin' && (
              currentUser?.role === 'admin' ? (
                <AdminPanel 
                  currentConfig={appConfig}
                  onConfigChange={(newConfig) => setAppConfig(newConfig)}
                  currentUser={currentUser}
                />
              ) : (
                <div className="max-w-md mx-auto my-12 p-8 bg-white border border-red-150 rounded-2xl shadow-xl space-y-6 text-center animate-fade-in">
                  <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center border border-red-200">
                    <ShieldCheck size={32} className="stroke-[2.5]" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-slate-800">403 - Forbidden Access Denied</h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      You are not authorized to view the administrative terminal. Access to the administration core is strictly restricted to authenticated App Owner and School Administration profiles.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('home')}
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-md transition cursor-pointer"
                    >
                      Return to Safety Dashboard
                    </button>
                  </div>
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* 4. Elegant footer with credits */}
      <footer className="bg-white border-t border-slate-150 py-8 text-center text-slate-500 space-y-3">
        <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <span className="font-bold text-slate-700">Federal Government Curriculum Match</span>
          </div>

          <p className="text-slate-400">
            &copy; 2026 {appConfig.brandName.toUpperCase()}. Democratizing premium schooling for primary & secondary levels in Nigeria.
          </p>

          <p className="flex items-center justify-center gap-1 font-bold text-slate-600">
            <span>Made with</span>
            <Heart size={12} className="text-red-500 fill-red-500" />
            <span>for Nigerian Students</span>
          </p>
        </div>
      </footer>

      <WhatsAppFloatingButton contactName={appConfig.contactName} supportGroupUrl={appConfig.supportGroupUrl} />
      <PWAInstallBanner />

      {/* 15-Minute Free Daily Trial Locked Modal */}
      {currentUser && currentUser.role === 'student' && !currentUser.isPro && trialTimeRemaining === 0 && ['hub', 'quizzes', 'progress'].includes(activeTab) && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-center space-y-6 relative">
            <div className="absolute top-4 right-4">
              <button 
                type="button"
                onClick={() => setActiveTab('home')}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Go to Home Dashboard"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-amber-500 to-amber-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-4xl">🔒</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-850 dark:text-white tracking-tight leading-tight">
                Free Learning Time Ended
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                You have used your free 15-minute learning session today.
              </p>
            </div>

            <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/30 rounded-2xl p-5 text-left space-y-3">
              <p className="text-xs font-bold text-amber-850 dark:text-amber-400 uppercase tracking-wider">
                Upgrade to Premium to continue enjoying:
              </p>
              <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-2.5 font-semibold">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 text-base font-black shrink-0">✓</span>
                  <span>Unlimited interactive lesson notes & local downloads</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 text-base font-black shrink-0">✓</span>
                  <span>Full First, Second and Third Term academic curriculum</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 text-base font-black shrink-0">✓</span>
                  <span>Complete Week 1–12 lesson outlines & class notes</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 text-base font-black shrink-0">✓</span>
                  <span>Over 10,050 exam prep questions & comprehensive explanations</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 text-base font-black shrink-0">✓</span>
                  <span>Direct 1-on-1 AskAfri Chat Tutor assistant (Gemini AI powered)</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsPaymentModalOpen(true);
                }}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 text-white font-extrabold rounded-2xl shadow-lg transition duration-200 cursor-pointer text-xs uppercase tracking-wider"
              >
                Upgrade to Premium Now
              </button>
              <button
                type="button"
                onClick={() => {
                  const message = `Hello Parent! I finished my free 15 minutes study session on ${appConfig.brandName}. Please help me pay to unlock unlimited full access for my class notes and exams!`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                }}
                className="py-3 px-5 border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold rounded-2xl transition duration-200 cursor-pointer text-xs uppercase tracking-wider"
              >
                Ask Parent to Pay 📱
              </button>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold underline cursor-pointer"
            >
              Go back to Home Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Premium Reminders Slide-in Banner Toast */}
      {premiumReminder && (
        <div className="fixed bottom-6 right-6 z-[120] max-w-sm w-full bg-slate-900 text-white border border-slate-800 rounded-2xl shadow-2xl p-4 flex gap-3.5 animate-slide-in">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Clock size={20} className="animate-pulse" />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-black text-amber-400">{premiumReminder.title}</h4>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">{premiumReminder.body}</p>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setPremiumReminder(null);
                  setIsPaymentModalOpen(true);
                }}
                className="text-[10px] font-black text-amber-400 uppercase tracking-wider hover:underline"
              >
                Upgrade Now
              </button>
              <button
                type="button"
                onClick={() => setPremiumReminder(null)}
                className="text-[10px] font-black text-slate-400 uppercase tracking-wider hover:underline"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setPremiumReminder(null)} 
            className="text-slate-500 hover:text-white shrink-0 self-start"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
