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
import { SplashLoadingScreen } from './components/SplashLoadingScreen';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { InstallPrompt } from './components/InstallPrompt';
import { syncUserProfile, syncLessonProgress } from './lib/firebaseSync';
import { GraduationCap, LogOut, Home, BookOpen, HelpCircle, MessageSquare, ShieldCheck, Heart, Trophy, Award, Zap, Sparkles, Mail, Sun, Moon, Clock, X } from 'lucide-react';
import { seedRtdbIfEmpty, rtdbSubscribe, rtdbSet, rtdbGet, NODES } from './lib/rtdbService';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSplashLoading, setIsSplashLoading] = useState(true);
  const [progressList, setProgressList] = useState<LessonProgress[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'hub' | 'quizzes' | 'progress' | 'faq' | 'contact' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');
      const validTabs = ['home', 'hub', 'quizzes', 'progress', 'faq', 'contact', 'admin'];
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

  // ... Rest of the component logic remains the same ...
  
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
  const handleAuthComplete = (profileData: { fullName: string; email: string; classLevel?: ClassLevel; avatarSeed: string; selectedSubjectIds?: string[]; role?: 'student' | 'teacher' | 'admin'; s...any }) => {
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

  // Rest of component remains the same...
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col justify-between overflow-x-hidden w-full max-w-full">
      {renderHelmet()}
      <InstallPrompt />
      <PWAInstallBanner />
      <WhatsAppFloatingButton contactName={appConfig.contactName} supportGroupUrl={appConfig.supportGroupUrl} />
    </div>
  );
}
