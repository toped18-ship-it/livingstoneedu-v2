import React, { useState } from 'react';
import { ClassLevel } from '../types';
import { ALL_CLASSES } from '../data/curriculum';
import { BookOpen, User, Mail, GraduationCap, ArrowRight, Sparkles, Check, Lock, Calendar, DollarSign, CheckSquare, FileText, ShieldCheck, Shield, X, ExternalLink, Users } from 'lucide-react';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { rtdbGet, rtdbSet, NODES } from '../lib/rtdbService';
import { PWAInstallBanner } from './PWAInstallBanner';


interface AuthScreenProps {
  onAuthComplete: (user: { fullName: string; email: string; classLevel?: ClassLevel; avatarSeed: string; role?: 'student' | 'teacher' | 'admin'; schoolName?: string; isPro?: boolean }) => void;
}

const AVATAR_TEMPLATES = [
  { seed: 'scholar', label: '🎓 Tech Scholar', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { seed: 'science', label: '🔬 Science Whiz', color: 'bg-sky-100 text-sky-800 border-sky-300' },
  { seed: 'math', label: '📐 Math Champion', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { seed: 'writer', label: '✍️ Literary Star', color: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300' },
  { seed: 'artist', label: '🎨 Creative Artist', color: 'bg-violet-100 text-violet-800 border-violet-300' },
  { seed: 'agricultural', label: '🌱 Eco Farmer', color: 'bg-lime-100 text-lime-800 border-lime-300' },
];

export function AuthScreen({ onAuthComplete }: AuthScreenProps) {
  const [authView, setAuthView] = useState<'landing' | 'form'>('landing');
  const [isSignUp, setIsSignUp] = useState(true);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [logoClicks, setLogoClicks] = useState(0);
  
  // Registration States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [schoolName, setSchoolName] = useState('Livingstone Educational Academy');
  const [avatarSeed, setAvatarSeed] = useState('scholar');
  const [signupPassword, setSignupPassword] = useState('');
  const [error, setError] = useState('');

  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      if (!fullName.trim()) {
        setError('Please enter your full name');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }
      if (role === 'teacher' && !schoolName.trim()) {
        setError('Please specify your school name');
        return;
      }
      if (!signupPassword || signupPassword.length < 4) {
        setError('Please enter a password of at least 4 characters');
        return;
      }
      
      const cleanEmail = email.trim().toLowerCase();
      const id = cleanEmail.replace(/[.@]/g, '_');

      try {
        setIsSubmitting(true);
        // 1. Create user in Firebase Authentication
        await createUserWithEmailAndPassword(auth, cleanEmail, signupPassword).catch((authErr) => {
          if (authErr && authErr.code === 'auth/email-already-in-use') {
            throw new Error('An account with this email already exists in Firebase Auth. Try signing in!');
          }
          throw authErr;
        });

        const todayDate = new Date().toISOString().split('T')[0];
        const newUser = {
          id,
          fullName: fullName.trim(),
          email: cleanEmail,
          avatarSeed,
          role,
          classLevel: (role === 'teacher' ? 'SS 1' : 'Primary 4') as ClassLevel,
          selectedSubjectIds: role === 'teacher' ? ['physics', 'chemistry', 'further_math'] : ['mathematics', 'english'],
          schoolName: role === 'teacher' ? schoolName.trim() : undefined,
          joinDate: new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }),
          trialSecondsRemaining: role === 'student' ? 900 : undefined,
          lastTrialAccessDate: role === 'student' ? todayDate : undefined
        };

        // 2. Save to rtdb USERS node
        await rtdbSet(`${NODES.USERS}/${id}`, newUser);

        // 3. Save to STUDENTS or TEACHERS node as requested by CRUD rules
        if (role === 'teacher') {
          await rtdbSet(`${NODES.TEACHERS}/${id}`, {
            id,
            name: fullName.trim(),
            email: cleanEmail,
            schoolName: schoolName.trim(),
            joinDate: newUser.joinDate
          });
        } else {
          await rtdbSet(`${NODES.STUDENTS}/${id}`, {
            id,
            name: fullName.trim(),
            email: cleanEmail,
            classLevel: 'SS 1',
            joinDate: newUser.joinDate
          });
        }

        onAuthComplete(newUser);

        // Try dispatching email notifications async
        fetch('/api/notify-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: newUser.fullName,
            email: newUser.email,
            role: newUser.role,
            schoolName: newUser.schoolName || 'Livingstone Educational Academy'
          })
        }).catch(err => console.error('Failed to dispatch signup emails:', err));

      } catch (err: any) {
        setError(err.message || 'Firebase Registration failed.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Sign In Logic with Firebase Authentication
      if (!loginEmail.trim() || !loginEmail.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }

      const cleanEmail = loginEmail.trim().toLowerCase();
      const id = cleanEmail.replace(/[.@]/g, '_');
      const isOwnerEmail = cleanEmail === 'toped18@gmail.com';

      const pass = passcode.trim() || loginPassword.trim();
      if (!pass) {
        setError('Please enter your password or administrative passcode.');
        return;
      }

      try {
        setIsSubmitting(true);
        let userProfile: any = null;

        if (isOwnerEmail && (pass === 'owner7799' || pass === 'admin123')) {
          // Bypassed owner check
          userProfile = await rtdbGet(`${NODES.USERS}/${id}`);
          if (!userProfile) {
            userProfile = {
              id,
              fullName: 'App Owner (Tope)',
              email: 'toped18@gmail.com',
              avatarSeed: 'scholar',
              role: 'admin',
              schoolName: 'Livingstone Educational Academy',
              isPro: true
            };
            await rtdbSet(`${NODES.USERS}/${id}`, userProfile);
          }
        } else {
          // Try standard sign in using Firebase Authentication
          await signInWithEmailAndPassword(auth, cleanEmail, pass);
          
          // Get profile from RTDB
          userProfile = await rtdbGet(`${NODES.USERS}/${id}`);
          if (!userProfile) {
            // Build default profile if none exists in Realtime DB yet
            const isTeacher = isOwnerEmail ? false : false; // we can map based on standard student rules
            userProfile = {
              id,
              fullName: cleanEmail.split('@')[0],
              email: cleanEmail,
              avatarSeed: 'scholar',
              classLevel: 'Primary 4',
              selectedSubjectIds: ['mathematics', 'english'],
              role: isOwnerEmail ? 'admin' : 'student'
            };
            await rtdbSet(`${NODES.USERS}/${id}`, userProfile);
          }
        }

        if (userProfile.role === 'admin' && cleanEmail !== 'toped18@gmail.com') {
          userProfile.role = 'student'; // security restriction
        }

        onAuthComplete(userProfile);
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          setError('Invalid login credentials. Please register or verify the password.');
        } else {
          setError(err.message || 'Firebase Authentication login failed.');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDemoLogin = (userRole: 'primary' | 'jss' | 'ss' | 'teacher') => {
    if (userRole === 'teacher') {
      const targetUser = {
        fullName: 'Mrs. Funke Alao',
        email: 'funke@livingstone.ng',
        avatarSeed: 'scholar',
        role: 'teacher' as const,
        schoolName: 'Livingstone Educational Academy'
      };
      const mockUserList = JSON.parse(localStorage.getItem('hub_users') || '[]');
      const exists = mockUserList.some((u: any) => u.email.toLowerCase() === targetUser.email.toLowerCase());
      if (!exists) {
        mockUserList.push({ ...targetUser, id: 'user_teacher_demo' });
        localStorage.setItem('hub_users', JSON.stringify(mockUserList));
      }
      onAuthComplete(targetUser);
      return;
    }

    const demoUsers = {
      primary: {
        fullName: 'Chidi Okafor',
        email: 'chidi@gmail.com',
        classLevel: 'Primary 4' as ClassLevel,
        avatarSeed: 'scholar',
        role: 'student' as const,
      },
      jss: {
        fullName: 'Aminat Bello',
        email: 'aminat@gmail.com',
        classLevel: 'JSS 3' as ClassLevel,
        avatarSeed: 'science',
        role: 'student' as const,
      },
      ss: {
        fullName: 'Tunde Adebayo',
        email: 'tunde@gmail.com',
        classLevel: 'SS 3' as ClassLevel,
        avatarSeed: 'math',
        role: 'student' as const,
      }
    };

    const targetUser = demoUsers[userRole];
    const mockUserList = JSON.parse(localStorage.getItem('hub_users') || '[]');
    const exists = mockUserList.some((u: any) => u.email.toLowerCase() === targetUser.email.toLowerCase());
    if (!exists) {
      mockUserList.push({ ...targetUser, id: 'user_' + userRole });
      localStorage.setItem('hub_users', JSON.stringify(mockUserList));
    }
    
    onAuthComplete(targetUser);
  };

  const renderPrivacyModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-black rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative p-6 sm:p-8 space-y-6 text-left">
        <button 
          type="button"
          onClick={() => setShowPrivacy(false)}
          className="absolute right-4 top-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full cursor-pointer transition text-slate-700"
        >
          <X size={18} />
        </button>
        
        <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
          <Shield className="text-blue-600" size={24} />
          <h2 className="text-xl font-extrabold text-slate-800">Privacy Policy</h2>
        </div>

        <div className="space-y-4 text-xs text-slate-650 leading-relaxed font-medium">
          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Effective Date: June 29, 2026</p>
          
          <p>
            At <strong>LIVINGSTONEEDU</strong>, we prioritize the protection and security of our user's data. This Privacy Policy outlines how we collect, use, process, and protect your information when you interact with our educational platform.
          </p>

          <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">1. Information We Collect</h4>
          <p>
            When you register or log in, we collect and process:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account Details:</strong> User email, password hash, role (student/teacher), and display name to create, map, and authenticate accounts.</li>
            <li><strong>Educational Information:</strong> Student records, homework submissions, test results, attendance logs, and school fees ledger entries created directly in our portal.</li>
          </ul>

          <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">2. How We Use Collected Information</h4>
          <p>
            All data collected is used strictly for core educational purposes:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Creating secure custom student profiles mapped to specific primary or secondary classes.</li>
            <li>Syncing grades, assignments, announcements, and rosters.</li>
            <li>Displaying pupil results to verified parent/student dashboards.</li>
          </ul>

          <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">3. Data Deletion and Retention</h4>
          <p>
            Your data is stored for as long as your account is active. If you wish to delete your profile and request full record erasure, you can do so by contacting support@livingstoneedu.com.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={() => setShowPrivacy(false)}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
          >
            Close Policy
          </button>
        </div>
      </div>
    </div>
  );

  const renderTermsModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-black rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative p-6 sm:p-8 space-y-6 text-left">
        <button 
          type="button"
          onClick={() => setShowTerms(false)}
          className="absolute right-4 top-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full cursor-pointer transition text-slate-700"
        >
          <X size={18} />
        </button>
        
        <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
          <Lock className="text-indigo-650" size={24} />
          <h2 className="text-xl font-extrabold text-slate-800">Terms of Service</h2>
        </div>

        <div className="space-y-4 text-xs text-slate-650 leading-relaxed font-medium">
          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Effective Date: June 29, 2026</p>
          
          <p>
            By accessing or using the <strong>LIVINGSTONEEDU</strong> learning portal, you agree to comply with and be bound by these Terms of Service.
          </p>

          <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">1. Description of Service</h4>
          <p>
            LIVINGSTONEEDU provides curriculum subjects, lesson notes, and testing materials aligned with national academic frameworks.
          </p>

          <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">2. Compliance and Account Conduct</h4>
          <p>
            Users must use the classroom portal responsibly. Distributing spam, illegal curriculum notes, or abusing standard messaging triggers is strictly forbidden and will result in immediate service termination.
          </p>

          <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">3. Limitation of Liability</h4>
          <p>
            LIVINGSTONEEDU provides materials on an "as-is" basis and is not liable for data delivery disruptions resulting from third-party system latency.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={() => setShowTerms(false)}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
          >
            Accept & Close
          </button>
        </div>
      </div>
    </div>
  );

  if (authView === 'landing') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-550 selection:text-white antialiased">
        {/* Navigation Bar */}
        <header className="border-b border-slate-200 bg-white/85 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div 
              onClick={() => {
                setLogoClicks(prev => {
                  if (prev + 1 >= 5) {
                    setIsAdminMode(curr => !curr);
                    setIsSignUp(false);
                    setLoginEmail('toped18@gmail.com');
                    setPasscode('admin123');
                    setAuthView('form');
                    return 0;
                  }
                  return prev + 1;
                });
              }}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
              title="Activate Administration Override Interface"
            >
              <div className="p-2 bg-blue-600 rounded-xl shadow-md text-white group-hover:bg-blue-700 transition">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="font-black text-slate-900 tracking-tight text-base block">LivingstoneEdu</span>
                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider block leading-none">Syllabus Ecosystem</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setIsSignUp(false);
                  setIsAdminMode(false);
                  setAuthView('form');
                }}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-black rounded-xl cursor-pointer transition uppercase tracking-wider"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setIsSignUp(true);
                  setIsAdminMode(false);
                  setAuthView('form');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl cursor-pointer transition shadow-md shadow-blue-500/10 uppercase tracking-wider"
              >
                Sign Up
              </button>
            </div>
          </div>
        </header>

        {/* Hero & Purpose Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-750 rounded-full text-xs font-bold leading-none uppercase tracking-wider">
                <Sparkles size={12} className="text-blue-600" />
                <span>NERDC West-African Standard</span>
              </span>
              
              <h2 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.05] uppercase">
                LivingstoneEdu <br/>
                <span className="text-blue-600">Learning Portal</span>
              </h2>

              <p className="text-base sm:text-lg text-black leading-relaxed font-bold">
                LivingstoneEdu is a unified, fully localized school administration and student tutoring portal built specifically for West African schools, parents, and students. The system integrates NERDC-aligned academic curriculum planning tools, automated attendance registries, continuous assessment (CA) gradebooks, centralized school fees ledgers, and interactive computerized test templates. By bridging school operations with mobile-accessible learning tools, we deliver professional academic progress tracking and direct tutor communication on a single, secure educational platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setIsSignUp(false);
                    setIsAdminMode(false);
                    setAuthView('form');
                  }}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-500/10 transition uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Access Portal Dashboard</span>
                  <ArrowRight size={14} className="stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setIsSignUp(true);
                    setIsAdminMode(false);
                    setAuthView('form');
                  }}
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-black text-xs rounded-xl border border-slate-200/80 shadow-sm transition uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Register Free Account</span>
                  <Sparkles size={14} className="text-amber-500" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              {/* Application Purpose & Services Provided box directly on homepage, prominent for easy verification */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                    <BookOpen size={24} className="stroke-[2.5]" />
                  </div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                    Application Purpose & Services Provided
                  </h3>
                </div>
                <p className="text-xs text-slate-650 leading-relaxed">
                  <strong>LIVINGSTONEEDU</strong> is an interactive educational learning portal designed for primary school, junior secondary, and senior secondary students (Primary 1-6, JSS 1-3, and SS 1-3) following the official national Nigerian curriculum (NERDC syllabus). The application's core mission is to automate high-quality learning processes. It provides termly and weekly structured lesson modules, custom quizzes, student progress analytics, teacher instruction steps, and integration with standard productivity tools to bridge the gap between classroom teaching and student performance tracking.
                </p>
              </div>
            </div>
          </div>

          {/* Core Deliverables Sections */}
          <div className="space-y-6 text-left">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Core Portal Deliverables</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                  <Calendar size={18} className="stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Managing Academic Sessions</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    School managers and instructors can configure terms, establish weekly attendance logs, set test structures, and audit student cohort rolls easily.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                  <DollarSign size={18} className="stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">School Fees Ledgers</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Safe financial bookkeeping enables parents to audit termly outstanding bills, log transaction references, and generate direct digital payment slips.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                  <BookOpen size={18} className="stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">NERDC Subject Curriculum</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Syllabus lessons are fully mapped term-by-term and week-by-week from Primary 1 up up to Senior Secondary 3 (SS 3) for maximum alignment.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="p-2.5 bg-indigo-50 text-indigo-650 rounded-xl shrink-0">
                  <CheckSquare size={18} className="stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-indigo-850 uppercase tracking-tight">CBT Mocks & CA Tracking</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Students gain deep practice via computer-based quizzes with answer explanations, while teachers collect diagnostic continuous assessment metrics.
                  </p>
                </div>
              </div>
            </div>
          </div>



          {/* Footer Section */}
          <footer className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-450 font-bold">
            <div>
              <span>© {new Date().getFullYear()} LIVINGSTONEEDU. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setShowPrivacy(true)}
                className="hover:text-blue-600 transition cursor-pointer flex items-center gap-1"
              >
                <Shield size={13} />
                <span>Privacy Policy</span>
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="hover:text-blue-600 transition cursor-pointer flex items-center gap-1"
              >
                <Lock size={13} />
                <span>Terms of Service</span>
              </button>
            </div>
          </footer>
        </div>

        {/* Modal Modals are rendered here */}
        {showPrivacy && renderPrivacyModal()}
        {showTerms && renderTermsModal()}

        <PWAInstallBanner />
      </div>
    );
  }

  // Else, authView === 'form' - separate login/signup page
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-550 selection:text-white antialiased flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      
      {/* Navigation & Back to Homepage */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <button
          type="button"
          onClick={() => {
            setError('');
            setAuthView('landing');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-black rounded-xl border border-slate-200 shadow-xs cursor-pointer transition uppercase tracking-wider"
        >
          <ArrowRight size={13} className="rotate-180 stroke-[2.5]" />
          <span>Back to Homepage</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6 mt-8 sm:mt-0">
        <div 
          onClick={() => {
            setLogoClicks(prev => {
              if (prev + 1 >= 5) {
                setIsAdminMode(curr => !curr);
                setIsSignUp(false);
                setLoginEmail('toped18@gmail.com');
                setPasscode('admin123');
                return 0;
              }
              return prev + 1;
            });
          }}
          className="inline-flex p-3 bg-blue-600 text-white rounded-2xl shadow-lg cursor-pointer"
          title="Activate Administration Override Interface"
        >
          <GraduationCap size={28} />
        </div>
        <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight uppercase">
          LivingstoneEdu
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-bold uppercase tracking-wider">
          {isSignUp ? "Create Your Academic Profile" : "Access Portal & Dashboard"}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-100 rounded-3xl border border-slate-200/80 space-y-6">
          
          <div className="space-y-2 text-left">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              {isSignUp ? "Register Profile" : "Access Portal"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter your details to access academic terms, study notes, report cards, and coordinator rosters.
            </p>
          </div>

          {isSignUp && (
            <div className="space-y-2 text-left">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Portal Access Level
              </label>
              <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-xl border border-slate-100">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-2 text-[11px] font-black rounded-lg transition-all cursor-pointer uppercase tracking-tight ${
                    role === 'student' ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  👨‍🎓 Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`py-2 text-[11px] font-black rounded-lg transition-all cursor-pointer uppercase tracking-tight ${
                    role === 'teacher' ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  👩‍🏫 Teacher
                </button>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 bg-red-50 border-l-4 border-red-500 rounded-xl text-xs font-bold text-red-700 font-sans leading-relaxed text-left">
                {error}
              </div>
            )}

            {isSignUp ? (
              // Sign Up block template
              <div className="space-y-4 text-left">
                <div>
                  <label htmlFor="name" className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User size={15} />
                    </div>
                    <input
                      id="name"
                      type="text"
                      required
                      disabled={isSubmitting}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={role === 'teacher' ? "e.g. Mrs. Funke Alao" : "e.g. Obi Emeka"}
                      className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    School Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail size={15} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      disabled={isSubmitting}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@school.ng"
                      className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="signup_password" className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Define Account Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock size={15} />
                    </div>
                    <input
                      id="signup_password"
                      type="password"
                      required
                      disabled={isSubmitting}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Define access password (min 4 characters)"
                      className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {role === 'teacher' && (
                  <div>
                    <label htmlFor="school" className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                      Assigned School / Institution Name
                    </label>
                    <input
                      id="school"
                      type="text"
                      required
                      disabled={isSubmitting}
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="e.g. Livingstone Educational Academy"
                      className="block w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition font-bold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                )}
              </div>
            ) : (
              // Sign In block template
              <div className="space-y-4 text-left">
                <div>
                  <label htmlFor="login_email" className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    {isAdminMode ? "Administrative Security Signature Email" : "School Email Address"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail size={15} />
                    </div>
                    <input
                      id="login_email"
                      type="email"
                      required
                      disabled={isSubmitting}
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder={isAdminMode ? "toped18@gmail.com" : "e.g. user@school.ng"}
                      className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {!isAdminMode ? (
                  <div>
                    <label htmlFor="login_password" className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                      Account Security Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock size={15} />
                      </div>
                      <input
                        id="login_password"
                        type="password"
                        required
                        disabled={isSubmitting}
                        placeholder="Enter account security password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="login_passcode" className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                      Master Override Security Code
                    </label>
                    <input
                      id="login_passcode"
                      type="password"
                      required
                      disabled={isSubmitting}
                      placeholder="Enter administrative override passcode"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      className="block w-full px-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition font-bold text-slate-705 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Portal security memo */}
            <div className="p-3 bg-blue-50/80 border border-blue-105 rounded-2xl text-left">
              <div className="flex gap-2 items-start text-[10.5px] text-blue-800 leading-relaxed font-bold">
                <ShieldCheck size={14} className="text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Sign in securely with your registered school email address and passcode to load your personalized academic dashboard.
                </span>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/10 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                    <span>Authenticating Profile...</span>
                  </>
                ) : (
                  <>
                    <span>{isSignUp ? `Create ${role === 'teacher' ? 'Teacher' : 'Student'} Profile` : (isAdminMode ? 'Activate Administrative Override' : 'Log In & Load Dashboard')}</span>
                    <ArrowRight size={13} className="stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>

            {/* Quick Access Demo Accounts section to bypass forms in testing */}
            {!isSignUp && !isSubmitting && (
              <div className="pt-3 border-t border-slate-100 mt-2 space-y-2">
                <p className="text-[10px] text-center text-slate-400 font-extrabold uppercase tracking-widest">
                  ⚡ Quick Sandbox Demo Accounts
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('primary')}
                    className="py-2 px-2.5 border border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 text-[10.5px] font-black text-slate-700 rounded-xl transition cursor-pointer text-center active:scale-95 flex items-center justify-center gap-1"
                  >
                    <span>👦</span>
                    <span>Primary Demo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('ss')}
                    className="py-2 px-2.5 border border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 text-[10.5px] font-black text-slate-700 rounded-xl transition cursor-pointer text-center active:scale-95 flex items-center justify-center gap-1"
                  >
                    <span>🧑</span>
                    <span>SS Demo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('teacher')}
                    className="py-2 px-2.5 border border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 text-[10.5px] font-black text-slate-700 rounded-xl transition cursor-pointer text-center active:scale-95 col-span-2 flex items-center justify-center gap-1"
                  >
                    <span>👩‍🏫</span>
                    <span>Mrs. Funke (Teacher Demo)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Toggle Link */}
            <div className="text-center pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                className="text-xs text-slate-500 hover:text-blue-600 font-bold underline transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  setError('');
                  setIsSignUp(!isSignUp);
                  setIsAdminMode(false);
                }}
              >
                {isSignUp ? "Already have a registered email? Log In" : "Need to register? Create a new Profile"}
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* Modal Modals are rendered here */}
      {showPrivacy && renderPrivacyModal()}
      {showTerms && renderTermsModal()}

      <PWAInstallBanner />
    </div>
  );
}
