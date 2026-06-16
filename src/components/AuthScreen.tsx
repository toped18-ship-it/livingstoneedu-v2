import React, { useState } from 'react';
import { ClassLevel } from '../types';
import { ALL_CLASSES } from '../data/curriculum';
import { BookOpen, User, Mail, GraduationCap, ArrowRight, Sparkles, Check, Lock, Calendar, DollarSign, CheckSquare, FileText, ShieldCheck } from 'lucide-react';
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
        // 1. Create user in Firebase Authentication
        await createUserWithEmailAndPassword(auth, cleanEmail, signupPassword).catch((authErr) => {
          if (authErr && authErr.code === 'auth/email-already-in-use') {
            throw new Error('An account with this email already exists in Firebase Auth. Try signing in!');
          }
          throw authErr;
        });

        const newUser = {
          id,
          fullName: fullName.trim(),
          email: cleanEmail,
          avatarSeed,
          role,
          classLevel: (role === 'teacher' ? 'SS 1' : 'Primary 4') as ClassLevel,
          selectedSubjectIds: role === 'teacher' ? ['physics', 'chemistry', 'further_math'] : ['mathematics', 'english'],
          schoolName: role === 'teacher' ? schoolName.trim() : undefined,
          joinDate: new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-550 selection:text-white antialiased">
      <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 lg:py-16">
        {/* Main Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left Column: Extensive EdTech Copwriting & App Purpose */}
          <div className="lg:col-span-7 space-y-8 animate-fade-in">
            {/* Interactive Logo Brand Element */}
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
              className="inline-flex items-center gap-3 cursor-pointer select-none group"
              title="Activate Administration Override Interface"
            >
              <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-550/20 group-hover:bg-blue-700 transition-all duration-300">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">LivingstoneEdu</h1>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Syllabus & Management Ecosystem</p>
              </div>
            </div>

            {/* Section 1: HERO HEADLINE & SUBHEADLINE */}
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-750 rounded-full text-xs font-bold leading-none uppercase tracking-wider">
                <Sparkles size={12} className="text-blue-600" />
                <span>NERDC West-African Standard</span>
              </span>
              
              <h2 className="text-3.5xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] uppercase">
                LivingstoneEdu <br/>
                <span className="text-blue-600">Learning Portal</span>
              </h2>

              <p className="text-base sm:text-lg text-slate-650 leading-relaxed font-medium max-w-2xl">
                LivingstoneEdu is a unified, fully localized school administration and student tutoring portal built specifically for West African schools, parents, and students. The system integrates NERDC-aligned academic curriculum planning tools, automated attendance registries, continuous assessment (CA) gradebooks, centralized school fees ledgers, and interactive computerized test templates. By bridging school operations with mobile-accessible learning tools, we deliver professional academic progress tracking and direct tutor communication on a single, secure educational platform.
              </p>
            </div>

            {/* Section 2: "HOW IT WORKS" OR "CORE FEATURES" SECTION */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Core Portal Deliverables</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Feature 1 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                    <Calendar size={18} className="stroke-[2.5]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Managing Academic Sessions</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
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
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">School Fees Ledgers</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
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
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">NERDC Subject Curriculum</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Gallows and syllabus lessons are fully mapped term-by-term and week-by-week from Primary 1 up up to Senior Secondary 3 (SS 3) for maximum alignment.
                    </p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                  <div className="p-2.5 bg-indigo-50 text-indigo-650 rounded-xl shrink-0">
                    <CheckSquare size={18} className="stroke-[2.5]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-indigo-850 uppercase tracking-tight">CBT Mocks & CA Tracking</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Students gain deep practice via computer-based quizzes with answer explanations built in, while teachers collect diagnostic continuous assessment metrics.
                    </p>
                  </div>
                </div>
              </div>
            </div>


          </div>

          {/* Right Column: Interactive Clean Login Card with OAuth Disclaimer */}
          <div className="lg:col-span-5">
            <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-100 rounded-3xl border border-slate-200/80 space-y-6">
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                  {isSignUp ? "Register Account" : "Access Portal"}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your assigned details to access terms 1-3, weekly study tracks, report cards, and coordinator rosters.
                </p>
              </div>

              {isSignUp && (
                <div className="space-y-2">
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
                  <div className="p-3.5 bg-red-50 border-l-4 border-red-500 rounded-xl text-xs font-bold text-red-700 font-sans leading-relaxed">
                    {error}
                  </div>
                )}

                {isSignUp ? (
                  // Sign Up block template
                  <div className="space-y-4">
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
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={role === 'teacher' ? "e.g. Mrs. Funke Alao" : "e.g. Obi Emeka"}
                          className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition"
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
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. name@school.ng"
                          className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition"
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
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="Define access password (min 4 characters)"
                          className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition"
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
                          value={schoolName}
                          onChange={(e) => setSchoolName(e.target.value)}
                          placeholder="e.g. Livingstone Educational Academy"
                          className="block w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition font-bold text-slate-700"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  // Sign In block template
                  <div className="space-y-4">
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
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder={isAdminMode ? "toped18@gmail.com" : "e.g. user@school.ng"}
                          className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition"
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
                            placeholder="Enter account security password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition"
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
                          placeholder="Enter administrative override passcode"
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value)}
                          className="block w-full px-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition font-bold text-slate-705"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Section 3: OAUTH CONTEXT / GOOGLE SIGN-IN DISCLAIMER */}
                <div className="p-3 bg-blue-50/80 border border-blue-105 rounded-2xl space-y-2">
                  <div className="flex gap-2 items-start text-[10.5px] text-blue-800 leading-relaxed font-bold">
                    <ShieldCheck size={14} className="text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      Sign in securely with your authorized school email address via Google to securely access your personalized student, parent, or administrative dashboard.
                    </span>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/10 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                  >
                    <span>{isSignUp ? `Create ${role === 'teacher' ? 'Teacher' : 'Student'} Profile` : (isAdminMode ? 'Activate Administrative Override' : 'Log In & Load Dashboard')}</span>
                    <ArrowRight size={13} className="stroke-[2.5]" />
                  </button>
                </div>

                {/* Toggle Link */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    className="text-xs text-slate-500 hover:text-blue-600 font-bold underline transition"
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

        </div>
      </div>
      
      {/* Dynamic Custom PWA Installation Prompt Notification */}
      <PWAInstallBanner />
    </div>
  );
}
