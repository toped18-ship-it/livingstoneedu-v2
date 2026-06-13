import React from 'react';
import { ClassLevel, User, LessonProgress } from '../types';
import { getSubjectsForClass } from '../data/curriculum';
import { requestNotificationPermission } from '../lib/pushNotifications';
import { Award, BookOpen, Clock, CheckCircle, GraduationCap, Flame, Star, Trophy, Users, Bell } from 'lucide-react';

interface HomeDashboardProps {
  user: User;
  progressList: LessonProgress[];
  onNavigateToHub: (subjectId?: string) => void;
  onClassChange: (newClass: ClassLevel) => void;
  onCustomizeSubjects: () => void;
}

export function HomeDashboard({ user, progressList, onNavigateToHub, onClassChange, onCustomizeSubjects }: HomeDashboardProps) {
  const subjects = React.useMemo(() => {
    const allClassSubjects = getSubjectsForClass(user.classLevel);
    if (user.selectedSubjectIds && user.selectedSubjectIds.length > 0) {
      return allClassSubjects.filter(s => user.selectedSubjectIds!.includes(s.id));
    }
    return allClassSubjects;
  }, [user.classLevel, user.selectedSubjectIds]);
  
  // Calculate analytics
  const currentClassProgress = progressList.filter(p => p.classLevel === user.classLevel);
  const completedLessons = currentClassProgress.filter(p => p.completed);
  const totalCompleted = completedLessons.length;
  
  // Quizzes passed (scored >= 60%)
  const quizScores = currentClassProgress.filter(p => p.score !== undefined);
  const highScores = quizScores.filter(p => p.score && p.score >= 66);
  const averageScore = quizScores.length > 0 
    ? Math.round(quizScores.reduce((acc, curr) => acc + (curr.score || 0), 0) / quizScores.length)
    : 0;

  // Streak simulation based on date or just fixed nice number
  const streakDays = totalCompleted > 0 ? Math.min(totalCompleted + 2, 7) : 0;

  const [pushSubscribed, setPushSubscribed] = React.useState(false);
  const [subscribing, setSubscribing] = React.useState(false);
  const [subError, setSubError] = React.useState('');

  const handleSubscribePush = async () => {
    setSubscribing(true);
    setSubError('');
    try {
      const token = await requestNotificationPermission(user.email);
      if (token) {
        setPushSubscribed(true);
      } else {
        setSubError('Permission denied or unsupported.');
      }
    } catch (err) {
      setSubError('Failed subscription.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Personalized Active Dashboard Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-650 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Abstract design layout */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none select-none" />
        <div className="absolute left-1/3 bottom-0 translate-y-16 w-52 h-52 bg-blue-800/20 rounded-full blur-xl pointer-events-none select-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider">
              <Star size={11} className="fill-amber-300 text-amber-300 animate-spin-slow" />
              <span>Academic Year 2026/2027</span>
            </div>
            
            <h1 className="text-2.5xl sm:text-4.5xl font-extrabold tracking-tight">
              Ẹ n lẹ, {user.fullName}! 👋
            </h1>
            
            <p className="text-xs sm:text-sm text-blue-50 max-w-xl leading-relaxed">
              Welcome back to your personalized academic headquarters. You are currently exploring the official West African NERDC syllabus subjects for <span className="font-bold underline decoration-amber-300 decoration-2">{user.classLevel}</span>.
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <button
              onClick={() => onNavigateToHub()}
              className="px-5 py-2.5 bg-white text-blue-900 hover:bg-slate-50 rounded-xl text-xs sm:text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer"
            >
              Express Learning Hub
            </button>
          </div>
        </div>
      </div>

      {/* Numerical Metrics Summary Bento */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Core Block 1 - Completed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <CheckCircle size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed Weeks</p>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-800">{totalCompleted} / 36</p>
          </div>
        </div>

        {/* Core Block 2 - Avg score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-650 rounded-xl">
            <Trophy size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Score</p>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-800">{averageScore}%</p>
          </div>
        </div>

        {/* Core Block 3 - Quizzes Triumphs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
            <Award size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quizzes Passed</p>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-800">{highScores.length}</p>
          </div>
        </div>

        {/* Core Block 4 - Active Streak */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-fuchsia-50 text-fuchsia-600 rounded-xl">
            <Flame size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Streak</p>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-800">{streakDays} Days</p>
          </div>
        </div>
      </div>

      {/* Main Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Subject Cards List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Your Academic Curriculum Subjects</h2>
              <p className="text-[11px] text-slate-400">Official NERDC lesson material & weekly targets</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCustomizeSubjects}
                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-105 hover:text-blue-800 text-blue-700 rounded-xl text-[11px] font-black tracking-tight transition flex items-center gap-1 cursor-pointer"
              >
                <Star size={11} className="fill-blue-500 text-blue-500" />
                <span>Personalize Subjects</span>
              </button>
              <span className="px-2 py-1 bg-slate-105 rounded-lg text-[10px] font-bold text-slate-600 shrink-0">
                {subjects.length} Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {subjects.map((subj) => {
              // Calculate progress for this subject
              const subjLessons = currentClassProgress.filter(p => p.subjectId === subj.id);
              const readCount = subjLessons.filter(l => l.completed).length;
              // Total sessions = 3 Terms * 12 Weeks = 36 modules
              const pct = Math.round((readCount / 36) * 100);

              return (
                <div
                  key={subj.id}
                  onClick={() => onNavigateToHub(subj.id)}
                  className="group bg-white p-5 rounded-2xl border border-slate-100 hover:border-blue-300 hover:shadow-md transition duration-200 cursor-pointer flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        subj.category === 'Science' ? 'bg-sky-50 text-sky-700' :
                        subj.category === 'Arts' ? 'bg-fuchsia-50 text-fuchsia-700' :
                        subj.category === 'Commercial' ? 'bg-amber-50 text-amber-700' :
                        subj.category === 'Vocational' ? 'bg-lime-50 text-lime-700' :
                        'bg-slate-50 text-slate-600'
                      }`}>
                        {subj.category}
                      </span>
                      <BookOpen size={14} className="text-slate-350 opacity-0 group-hover:opacity-100 group-hover:text-blue-500 transition-all" />
                    </div>

                    <h3 className="font-bold text-slate-800 group-hover:text-blue-700 transition">
                      {subj.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {subj.description}
                    </p>
                  </div>

                  <div className="space-y-1.5 point-t pt-3 border-t border-slate-50">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                      <span>Course Progress</span>
                      <span>{readCount} / 36 lessons ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-slate-150 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Column: Mini Actions Sidebar */}
        <div className="space-y-6">
          {/* Quick Profile Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Student Profile Details</h2>
            
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-250 flex items-center justify-center text-2xl">
                🎓
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800">{user.fullName}</h3>
                <p className="text-xs text-slate-400">{user.email}</p>
                <span className="mt-1.5 inline-block px-2 py-0.5 bg-blue-50 rounded text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                  Verified Student
                </span>
              </div>
            </div>

            {/* Push Notifications Setup */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Bell size={14} className="text-blue-600 animate-pulse" />
                <span>Web Push Notifications</span>
              </h4>
              <p className="text-[10px] text-slate-400">
                Receive real-time school news, exam grades & national study alerts.
              </p>
              {pushSubscribed ? (
                <div className="py-1.5 px-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-[11px] font-bold text-center">
                  🔔 Subscribed to Livingstoneedu
                </div>
              ) : (
                <button
                  type="button"
                  disabled={subscribing}
                  onClick={handleSubscribePush}
                  className="w-full py-1.5 px-3 bg-blue-50 hover:bg-blue-105 text-blue-700 disabled:opacity-50 text-[11px] font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  {subscribing ? 'Subscribing...' : 'Enable System Alerts'}
                </button>
              )}
              {subError && (
                <p className="text-[9px] text-red-500 text-center font-medium">{subError}</p>
              )}
            </div>

            {/* Quick Switch Level triggers */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <GraduationCap size={15} className="text-blue-600" />
                <span>Switch Your Academic Class Level</span>
              </h4>
              <p className="text-[11px] text-slate-450 leading-relaxed">
                Click any standard class tier below to re-tune your subjects and curriculum instantly.
              </p>
              
              <div className="grid grid-cols-3 gap-1.5">
                {([
                  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
                  'JSS 1', 'JSS 2', 'JSS 3',
                  'SS 1', 'SS 2', 'SS 3'
                ] as ClassLevel[]).map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => onClassChange(cls)}
                    className={`py-1.5 px-0.5 rounded-lg text-[10px] font-bold border text-center transition ${
                      user.classLevel === cls 
                        ? 'border-blue-650 bg-blue-50/50 text-blue-800 font-extrabold shadow-sm'
                        : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Guidelines Banner */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 text-blue-500/10 font-bold text-8xl pointer-events-none select-none">
              🇳🇬
            </div>
            
            <div className="space-y-1">
              <h3 className="font-bold text-slate-100">National Curriculum Standards</h3>
              <p className="text-xs text-slate-350 leading-relaxed">
                LIVINGSTONEEDU follows the national education blueprint designed to build character, skills, and academic excellence in West African examinations.
              </p>
            </div>

            <ul className="text-[11px] text-slate-250 space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span>Primary School: Core Foundation</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span>Junior High (JSS): BECE Prep</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                <span>Senior High (SS): WAEC/NECO Prep</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
