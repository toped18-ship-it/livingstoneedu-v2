import React, { useState } from 'react';
import { ClassLevel } from '../types';
import { ALL_CLASSES } from '../data/curriculum';
import { BookOpen, User, Mail, GraduationCap, ArrowRight, Sparkles, Check, Lock } from 'lucide-react';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { rtdbGet, rtdbSet, NODES } from '../lib/rtdbService';

interface AuthScreenProps {
  onAuthComplete: (user: { fullName: string; email: string; classLevel?: ClassLevel; avatarSeed: string; role?: 'student' | 'teacher' | 'admin'; schoolName?: string }) => void;
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
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
          className="flex justify-center items-center gap-2 mb-4 cursor-pointer select-none"
          title="Curriculum Portal"
        >
          <div className="p-2.5 bg-blue-600 rounded-xl shadow-md shadow-blue-200">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-none">LIVINGSTONEEDU</h1>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mt-1">National Curriculum Portal</p>
          </div>
        </div>
        
        <h2 className="text-center text-3xl font-extrabold text-slate-800 leading-tight">
          {isSignUp ? "Create your profile" : "Sign in to your dashboard"}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Access terms 1-3, weeks 1-12 curriculum lessons, practice quizzes & classroom administration.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-100 sm:px-10">
          
          {/* Role Choice Selector Tab (Only during SignUp) */}
          {isSignUp && (
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
                Select Your Educational Capacity
              </label>
              <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    role === 'student' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  👨‍🎓 Student Account
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    role === 'teacher' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  👩‍🏫 Teacher / School Account
                </button>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-xs font-medium text-red-700 font-sans">
                {error}
              </div>
            )}

            {isSignUp ? (
              // Sign Up Form
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User size={16} />
                      </div>
                      <input
                        id="name"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={role === 'teacher' ? "e.g. Mrs. Funke Alao" : "e.g. Obi Emeka"}
                        className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail size={16} />
                      </div>
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. admin@school.ng"
                        className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Password input */}
                <div>
                  <label htmlFor="signup_password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Account Access Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      id="signup_password"
                      type="password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="e.g. Enter secure password (min 4 characters)"
                      className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Optional School Name (Teacher Only) */}
                {role === 'teacher' && (
                  <div>
                    <label htmlFor="school" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      School / Institution Name
                    </label>
                    <input
                      id="school"
                      type="text"
                      required
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="e.g. Livingstone Educational Academy"
                      className="block w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold text-slate-700"
                    />
                  </div>
                )}

                {/* Button */}
                <div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/10 active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer font-black uppercase tracking-wider"
                  >
                    <span>Register {role === 'teacher' ? 'Teacher' : 'Student'} Profile</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </>
            ) : (
              // Sign In Form
              <>
                <div>
                  <label htmlFor="login_email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    {isAdminMode ? "Owner Applet Secret Key Email" : "Email Address"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail size={16} />
                    </div>
                    <input
                      id="login_email"
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder={isAdminMode ? "toped18@gmail.com" : "e.g. user@school.ng"}
                      className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                {!isAdminMode ? (
                  <div>
                    <label htmlFor="login_password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock size={16} />
                      </div>
                      <input
                        id="login_password"
                        type="password"
                        required
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="login_passcode" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Owner Secret Passcode Key
                    </label>
                    <input
                      id="login_passcode"
                      type="password"
                      required
                      placeholder="Enter Owner Key"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      className="block w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold text-slate-700"
                    />
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/10 active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer font-black uppercase tracking-wider"
                  >
                    <span>{isAdminMode ? "Verify Owner Signature" : "Sign In and Load Dashboard"}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </>
            )}

            {/* Form Toggle Link */}
            <div className="text-center flex flex-col items-center gap-2 pt-2">
              <button
                type="button"
                className="text-xs text-slate-600 hover:text-blue-755 font-medium underline cursor-pointer"
                onClick={() => {
                  setError('');
                  setIsSignUp(!isSignUp);
                  setIsAdminMode(false);
                }}
              >
                {isSignUp ? "Already have a registered email? Sign In here" : "Need to register? Create a new Profile here"}
              </button>
            </div>
          </form>


        </div>
      </div>
    </div>
  );
}
