import React, { useState, useMemo, useEffect } from 'react';
import { ClassLevel, User, Subject, TermNumber, WeekNumber, LessonProgress, LessonContent } from '../types';
import { ALL_CLASSES, getSubjectsForClass, getWeeklyTopicTitle, getLessonContent } from '../data/curriculum';
import { SubjectIcon } from './SubjectIcon';
import { rtdbSet } from '../lib/rtdbService';
import { 
  Award, CheckCircle, RotateCcw, ThumbsUp, AlertCircle, 
  HelpCircle, ArrowRight, Play, BookOpen, GraduationCap, 
  Sparkles, Check, ChevronRight, Zap, Shield, Clock, AlertTriangle
} from 'lucide-react';

interface InteractiveQuizzesProps {
  user: User;
  progressList: LessonProgress[];
  onToggleComplete: (subjectId: string, termNum: TermNumber, weekNum: WeekNumber, score?: number) => void;
  isPro: boolean;
  onPaymentTrigger: () => void;
  demoUsageCount: number;
  onIncrementDemoUsage: () => number;
  curriculums?: any[];
  cbtExams?: any[];
  cbtQuestionsRecord?: Record<string, any>;
  proPrice?: string;
}

export function InteractiveQuizzes({ 
  user, 
  progressList, 
  onToggleComplete,
  isPro,
  onPaymentTrigger,
  demoUsageCount,
  onIncrementDemoUsage,
  curriculums = [],
  cbtExams = [],
  cbtQuestionsRecord = {},
  proPrice = '₦5,000'
}: InteractiveQuizzesProps) {
  // Local Toast notifications
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');

  const showLocalToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  // CBT control states
  const [activeQuizTab, setActiveQuizTab] = useState<'curriculum' | 'cbt'>('curriculum');
  const [activeCbtExam, setActiveCbtExam] = useState<any | null>(null);
  const [cbtQuestions, setCbtQuestions] = useState<any[]>([]);
  const [cbtTimeRemaining, setCbtTimeRemaining] = useState<number>(0);
  const [cbtTabSwitches, setCbtTabSwitches] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // CBT Countdown Timer and Anti-Cheating tab blur detection
  useEffect(() => {
    if (!isPlaying || !activeCbtExam) return;

    const timer = setInterval(() => {
      setCbtTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            handleAutoSubmitCbt();
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const handleWindowBlur = () => {
      setCbtTabSwitches((prev) => {
        const next = prev + 1;
        showLocalToast(`⚠️ PROCTOR ALERT: Window exit detected! Tab switches logged. (${next} occurrences)`, 'error');
        return next;
      });
    };

    window.addEventListener('blur', handleWindowBlur);

    return () => {
      clearInterval(timer);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isPlaying, activeCbtExam]);

  const handleStartCbtExam = (exam: any) => {
    const isPremium = exam.subject?.toLowerCase() !== 'mathematics' && exam.subject?.toLowerCase() !== 'english';
    if (isPremium && !isPro) {
      onPaymentTrigger();
      return;
    }

    let qRecord: any[] = [];
    if (cbtQuestionsRecord && cbtQuestionsRecord[exam.id]) {
      qRecord = Array.isArray(cbtQuestionsRecord[exam.id]) 
        ? cbtQuestionsRecord[exam.id] 
        : Object.values(cbtQuestionsRecord[exam.id]);
    } else if (exam.questions && Array.isArray(exam.questions)) {
      qRecord = exam.questions;
    } else {
      qRecord = [
        {
          question: `Standard Mock Question 1 for ${exam.title}: Select the correct definition context.`,
          options: ['Option A: Optimal alignment definition', 'Option B: Baseline curriculum context', 'Option C: Auxiliary standard', 'Option D: None of the above'],
          correctIndex: 0,
          explanation: 'Standard baseline alignment context represents the primary correct choice.'
        },
        {
          question: `Standard Mock Question 2 for ${exam.title}: Identify the key milestone in secondary study.`,
          options: ['Evaluation grids', 'Continuous monitoring feedback', 'Integrative mock sessions', 'All of the above'],
          correctIndex: 3,
          explanation: 'All options contribute directly to study progress and score monitoring.'
        }
      ];
    }

    setActiveCbtExam(exam);
    setCbtQuestions(qRecord);
    setCbtTimeRemaining((exam.duration || 30) * 60);
    setCbtTabSwitches(0);
    setIsPlaying(true);
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setCorrectAnswersCount(0);
    showLocalToast(`CBT exam launched! Proctor AI is monitoring tab activities.`, 'info');
  };

  const handleAutoSubmitCbt = () => {
    handleFinishCbtExam();
  };

  const handleFinishCbtExam = async () => {
    if (!activeCbtExam) return;

    const finalPercent = activeQuizQuestions.length > 0 
      ? Math.round((correctAnswersCount / activeQuizQuestions.length) * 100) 
      : 0;

    const spentSecs = (activeCbtExam.duration || 30) * 60 - cbtTimeRemaining;
    const spentMinsStr = `${Math.floor(spentSecs / 60)}m ${spentSecs % 60}s`;

    const nextLog = {
      id: 'log-' + Date.now(),
      studentName: user.fullName || 'Anonymous Student',
      examTitle: activeCbtExam.title,
      score: `${finalPercent}%`,
      timeSpent: spentMinsStr,
      tabSwitches: cbtTabSwitches,
      status: cbtTabSwitches > 1 ? `Flagged (${cbtTabSwitches} tab exits logged)` : 'Clean'
    };

    try {
      const storedLogs = JSON.parse(localStorage.getItem('system_cbt_session_logs') || '[]');
      const updatedLogs = [nextLog, ...storedLogs];
      localStorage.setItem('system_cbt_session_logs', JSON.stringify(updatedLogs));

      await rtdbSet('cbt_session_logs', updatedLogs);
      
      showLocalToast(`CBT Exam complete! Grade ${finalPercent}% synchronised with teacher dashboard.`, 'success');
    } catch (e) {
      console.error('Error saving CBT session logs:', e);
    }

    setIsPlaying(false);
    setCurrentQuestionIdx(999); // Flag for summary screen
  };

  // Navigation & Selector States
  const [targetClass, setTargetClass] = useState<ClassLevel>(user.classLevel);
  const subjects = useMemo(() => {
    const all = getSubjectsForClass(targetClass);
    if (targetClass === user.classLevel && user.selectedSubjectIds && user.selectedSubjectIds.length > 0) {
      return all.filter(s => user.selectedSubjectIds!.includes(s.id));
    }
    return all;
  }, [targetClass, user.classLevel, user.selectedSubjectIds]);
  
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  const selectedSubject = useMemo(() => {
    return subjects.find(s => s.id === selectedSubjectId) || subjects[0] || null;
  }, [subjects, selectedSubjectId]);

  const [selectedTerm, setSelectedTerm] = useState<TermNumber>(1);
  const [selectedWeek, setSelectedWeek] = useState<WeekNumber>(1);

  // Quiz Play States
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  
  // Highscore tracker for current user's selection
  const activeQuizProgress = useMemo(() => {
    if (!selectedSubject) return null;
    return progressList.find(p => 
      p.classLevel === targetClass &&
      p.subjectId === selectedSubject.id &&
      p.termNum === selectedTerm &&
      p.weekNum === selectedWeek
    );
  }, [progressList, targetClass, selectedSubject, selectedTerm, selectedWeek]);

  // Retrieve current active mock syllabus quiz dynamically
  const lessonData: LessonContent = useMemo(() => {
    if (!selectedSubject) return { title: '', objectives: [], body: [], keyPoints: [], quiz: [] };
    return getLessonContent(targetClass, selectedSubject.id, selectedTerm, selectedWeek);
  }, [targetClass, selectedSubject, selectedTerm, selectedWeek]);

  const activeQuizQuestions = useMemo(() => {
    if (activeCbtExam) return cbtQuestions;
    return lessonData.quiz;
  }, [activeCbtExam, cbtQuestions, lessonData.quiz]);

  // Points breakdown calculator
  const pointsAwarded = useMemo(() => {
    if (!activeQuizQuestions.length) return 0;
    const basePoints = 50; // Just for completing
    const passPoints = Math.round((correctAnswersCount / activeQuizQuestions.length) * 100);
    const perfectBonus = correctAnswersCount === activeQuizQuestions.length ? 150 : 0;
    return basePoints + passPoints + perfectBonus;
  }, [correctAnswersCount, activeQuizQuestions]);

  const handleStartQuiz = () => {
    const isDemoSubj = selectedSubject?.id === 'mathematics' || selectedSubject?.id === 'english';
    if (isDemoSubj && !isPro) {
      const usageKey = `${targetClass}_${selectedSubject?.id}_${selectedTerm}_${selectedWeek}`;
      const stored = JSON.parse(localStorage.getItem(`livingstone_demo_uses_${user.id}`) || '[]');
      if (!stored.includes(usageKey)) {
        stored.push(usageKey);
        localStorage.setItem(`livingstone_demo_uses_${user.id}`, JSON.stringify(stored));
        onIncrementDemoUsage();
      }
    }

    setActiveCbtExam(null); // Clear CBT mode
    setIsPlaying(true);
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setCorrectAnswersCount(0);
  };

  const handleSelectOption = (optionIdx: number) => {
    if (hasAnswered) return;
    setSelectedAnswer(optionIdx);
    setHasAnswered(true);

    const isCorrect = optionIdx === activeQuizQuestions[currentQuestionIdx].correctIndex;
    if (isCorrect) {
      setCorrectAnswersCount(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < activeQuizQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setHasAnswered(false);
    } else {
      if (activeCbtExam) {
        handleFinishCbtExam();
      } else {
        // Quiz complete! Grade and trigger complete event
        const finalScore = Math.round((correctAnswersCount / activeQuizQuestions.length) * 100);
        onToggleComplete(selectedSubject.id, selectedTerm, selectedWeek, finalScore);
        setIsPlaying(false);
        // Double check high scorecard
        setCurrentQuestionIdx(999); // Flag for summary screen
      }
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setCorrectAnswersCount(0);
    setIsPlaying(false);
  };

  // Get current topic title based on weeks
  const activeTopicTitle = useMemo(() => {
    return getWeeklyTopicTitle(targetClass, selectedSubject?.id || '', selectedTerm, selectedWeek);
  }, [targetClass, selectedSubject, selectedTerm, selectedWeek]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast Overlay Notification */}
      {toastMessage && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-2xl shadow-xl border animate-bounce-short text-xs font-bold text-white ${
          toastType === 'error' ? 'bg-red-600 border-red-500' :
          toastType === 'info' ? 'bg-slate-800 border-slate-700' :
          'bg-emerald-600 border-emerald-500'
        }`}>
          <span>{toastMessage}</span>
        </div>
      )}
      
      {/* Header Area */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-650 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute left-1/3 bottom-0 translate-y-16 w-52 h-52 bg-white/5 rounded-full blur-xl" />
        
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-bold leading-none backdrop-blur-sm">
            <Zap size={13} className="text-amber-300 fill-amber-300 animate-pulse" />
            <span>Interactive Evaluation Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3.5xl font-black tracking-tight">Exams & CBT Mock Trials</h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Challenge yourself with curriculum-specific drills or enter professional real-time CBT examination rooms monitored by Proctor AI.
          </p>
        </div>

        {/* Dynamic score summary */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-3 relative z-10 self-start md:self-auto">
          <div className="h-10 w-10 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-black shadow shadow-amber-400/20">
            🥇
          </div>
          <div>
            <span className="text-[10px] text-blue-200 uppercase font-black tracking-widest block leading-3">My Academic Status</span>
            <span className="text-sm font-bold block">
              {progressList.filter(p => p.score !== undefined).length} Drills Solved
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column Controls (Interactive Selectors) */}
        {currentQuestionIdx !== 999 && !isPlaying && (
          <div className="lg:col-span-4 space-y-6 animate-fade-in">
            
            {/* Tab Swapper */}
            <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveQuizTab('curriculum')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition text-center cursor-pointer ${
                  activeQuizTab === 'curriculum'
                    ? 'bg-white text-blue-950 shadow-sm border border-slate-200/50'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Syllabus Drills
              </button>
              <button
                type="button"
                onClick={() => setActiveQuizTab('cbt')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeQuizTab === 'cbt'
                    ? 'bg-white text-blue-950 shadow-sm border border-slate-200/50'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>CBT Exam Rooms</span>
                <span className="bg-red-500 text-white text-[8px] font-black px-1 rounded animate-pulse">LIVE</span>
              </button>
            </div>

            {activeQuizTab === 'curriculum' ? (
              <>
                {/* 1. Age Group Selector */}
                <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-455 uppercase tracking-wide flex items-center gap-1.5">
                    <GraduationCap size={15} className="text-blue-600" />
                    <span>1. Age Group / Class Level</span>
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-1.5">
                    {ALL_CLASSES.map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => {
                          setTargetClass(cls);
                          handleResetQuiz();
                        }}
                        className={`py-2 px-1 text-[11px] font-bold border rounded-xl text-center transition ${
                          targetClass === cls
                            ? 'border-blue-600 bg-blue-50 text-blue-900 font-extrabold'
                            : 'border-slate-150 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Choose Subject */}
                <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-455 uppercase tracking-wide flex items-center gap-1.5">
                    <BookOpen size={14} className="text-indigo-600" />
                    <span>2. Select Subject</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto pr-1">
                    {subjects.map((subj) => {
                      const isSelected = selectedSubject?.id === subj.id;
                      const isPremiumSubj = subj.id !== 'mathematics' && subj.id !== 'english';
                      const showLockIcon = !isPro && isPremiumSubj;
                      return (
                        <button
                          key={subj.id}
                          type="button"
                          onClick={() => {
                            setSelectedSubjectId(subj.id);
                            handleResetQuiz();
                          }}
                          className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 text-blue-950 shadow-sm'
                              : 'border-transparent bg-slate-50 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <SubjectIcon name={subj.icon} size={14} />
                            <span className="truncate">{subj.name}</span>
                          </span>
                          {showLockIcon ? (
                            <span className="text-[9px] bg-amber-50 text-amber-700 px-1 py-0.5 rounded font-black">🔒 PRO</span>
                          ) : (
                            isSelected && <Check size={12} className="text-blue-700" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Choose Topic (Term / Week selection) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-455 uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" />
                    <span>3. Term and Topic Weeks</span>
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">School Term</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {([1, 2, 3] as TermNumber[]).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              setSelectedTerm(t);
                              handleResetQuiz();
                            }}
                            className={`py-1.5 rounded-lg text-xs font-bold border text-center transition ${
                              selectedTerm === t
                                ? 'border-blue-600 bg-blue-50 text-blue-800'
                                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            Term {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Weekly Course Module</label>
                      <select
                        value={selectedWeek}
                        onChange={(e) => {
                          setSelectedWeek(Number(e.target.value) as WeekNumber);
                          handleResetQuiz();
                        }}
                        className="block w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-705 font-bold"
                      >
                        {Array.from({ length: 12 }, (_, i) => (i + 1) as WeekNumber).map((w) => {
                          const topicText = getWeeklyTopicTitle(targetClass, selectedSubject?.id || '', selectedTerm, w);
                          return (
                            <option key={w} value={w}>
                              Week {w}: {topicText}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* CBT filters matching active exams on Server */
              <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-3 animate-fade-in">
                <h3 className="text-xs font-extrabold text-slate-455 uppercase tracking-wide flex items-center gap-1.5">
                  <Shield size={14} className="text-red-500" />
                  <span>Proctor Filtering Desk</span>
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                  Select your current academic class to inspect the available exam sheets published live on our synchronized server:
                </p>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {ALL_CLASSES.map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setTargetClass(cls)}
                      className={`py-2 px-1 text-[11px] font-bold border rounded-xl text-center transition ${
                        targetClass === cls
                          ? 'border-blue-600 bg-blue-50 text-blue-900 font-extrabold'
                          : 'border-slate-150 bg-white text-slate-650 hover:bg-slate-50'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] text-slate-400 font-bold tracking-tight mt-3">
                  ⚠️ Note: Exit logs, window unfocuses, and durations are registered to the synchronized administrative panel instantly.
                </div>
              </div>
            )}

          </div>
        )}

        {/* Right Column / Primary Playing Dashboard (8 cols or 12 cols depending on layout state) */}
        <div className={`${currentQuestionIdx === 999 || isPlaying ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-6`}>
          
          {/* Welcome State for Syllabus tab */}
          {!isPlaying && currentQuestionIdx !== 999 && activeQuizTab === 'curriculum' && (() => {
            const isPremiumSubject = selectedSubject?.id !== 'mathematics' && selectedSubject?.id !== 'english';
            const isTrialExceeded = demoUsageCount >= 15;
            const isLocked = !isPro && (isPremiumSubject || isTrialExceeded);

            if (isLocked) {
              return (
                <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-150 shadow-sm flex flex-col items-center justify-center text-center space-y-6 animate-fade-in min-h-[400px]">
                  <div className="h-16 w-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 text-3xl animate-pulse shadow-sm shadow-amber-100">
                    🔒
                  </div>
                  <div className="space-y-2.5 max-w-lg">
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest rounded-full">
                      {isTrialExceeded ? 'Demo Limit Reached' : 'Pro Drill Locked'}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {isTrialExceeded ? 'Demo Limit of 15 Uses Exhausted' : `Access Premium: ${selectedSubject?.name} Quiz`}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      {isTrialExceeded 
                        ? 'You have viewed or solved 15 lessons across our demo curriculum. Subscribing to Pro unlocks full, term-long access to all subjects, testing suites, and report card generators.'
                        : `Practice exams and topic drills for ${selectedSubject?.name} are available exclusively on the pro school plan. Activate your full term subscription today.`
                      }
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-150 w-full max-w-md text-left space-y-2.5">
                    <p className="text-xs font-extrabold text-slate-750 uppercase tracking-widest text-center border-b border-slate-200 pb-1.5">
                      Subscribing to Pro unlocks:
                    </p>
                    <ul className="text-xs font-semibold text-slate-650 space-y-2">
                      <li className="flex gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>Unlimited termly practice quizzes and instant automated score grading.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>Unrestricted access for schools to download student attendance records weekly.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>Full customized WAEC / NECO mock test modules for Senior High levels.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={onPaymentTrigger}
                      className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-white font-black text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition active:scale-97 animate-pulse"
                    >
                      Subscribe to Pro ({proPrice} / term)
                    </button>
                    <a
                      href="https://wa.me/message/AJ4NILOGBTTMJ1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-655 font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Contact Support</span>
                    </a>
                  </div>
                </div>
              );
            }

            return (
              <div className="bg-white p-8 rounded-3xl border border-slate-150 shadow-sm flex flex-col items-center justify-center text-center space-y-6 animate-fade-in min-h-[400px]">
                <div className="p-4 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 animate-pulse-slow">
                  <HelpCircle size={40} className="stroke-[2.5]" />
                </div>

                <div className="space-y-2 max-w-lg">
                  <span className="px-3 py-0.5 rounded-full bg-blue-50 border border-blue-100 font-bold text-blue-800 text-[10px] uppercase tracking-wider">
                    Ready to test: {targetClass} &bull; Term {selectedTerm} &bull; Week {selectedWeek}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                    {activeTopicTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-705 leading-relaxed font-medium">
                    Test your comprehension of this Nigerian curriculum lesson. Includes <strong>multiple-choice questions</strong>, answers breakdown feedback, and awards immediate XP score!
                  </p>
                </div>

                {/* Show previous score if exists */}
                {activeQuizProgress && activeQuizProgress.score !== undefined && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 px-5 animate-pulse-slow">
                    <Award size={16} className="text-amber-600" />
                    <span className="text-xs font-bold text-amber-900">
                      Highest Recorded Drill Score on this Subject: {activeQuizProgress.score}%
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleStartQuiz}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xl shadow-blue-600/15 transition active:scale-97 cursor-pointer"
                >
                  <span>Begin Practice Attempt</span>
                  <Play size={13} fill="currentColor" />
                </button>

                <div className="pt-4 border-t border-slate-100 w-full flex items-center justify-center gap-6 text-[10px] text-slate-400 font-black tracking-wider uppercase">
                  <span>⚡ 100 XP Base points</span>
                  <span>🔥 +150 XP Perfect multiplier</span>
                  <span>💡 Infinite attempts</span>
                </div>
              </div>
            );
          })()}

          {/* Welcome/Exam List for CBT Tab */}
          {!isPlaying && currentQuestionIdx !== 999 && activeQuizTab === 'cbt' && (() => {
            const filteredExams = cbtExams.filter(e => e && e.class === targetClass);

            return (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 bg-red-50 text-red-655 flex items-center justify-center rounded-xl font-bold text-lg animate-pulse-slow">
                      🛡️
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">CBT Exam Rooms</h2>
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-1.5 font-sans tracking-wider">West African Evaluation Standard &bull; Proctor AI</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Welcome to the proctored computer-based test platform. All published school exam lists are synced in real-time. Submitting your paper pushes scores, duration, and tab integrity flags straight to the administrator's console instantly.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredExams.length > 0 ? (
                    filteredExams.map((exam) => {
                      const isMathOrEng = exam.subject?.toLowerCase() === 'mathematics' || exam.subject?.toLowerCase() === 'english';
                      const isLocked = !isPro && !isMathOrEng;

                      return (
                        <div key={exam.id} className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm hover:shadow transition flex flex-col justify-between space-y-4 relative overflow-hidden">
                          {isLocked && (
                            <div className="absolute top-2.5 right-2.5 bg-amber-100 text-amber-800 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full z-10">
                              🔒 PRO
                            </div>
                          )}
                          
                          <div className="space-y-1.5">
                            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 font-sans">
                              {exam.subject} &bull; {exam.class}
                            </span>
                            <h3 className="text-sm font-black text-slate-850 leading-snug line-clamp-1">{exam.title}</h3>
                            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 font-medium">
                              {exam.instructions || 'Standard computerized assessment with automatic timing limits and immediate proctor audits.'}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-450 uppercase">
                              <span className="flex items-center gap-0.5">⏱️ {exam.duration || 30}m</span>
                              <span>•</span>
                              <span>📝 {(cbtQuestionsRecord[exam.id] ? Object.keys(cbtQuestionsRecord[exam.id]).length : exam.questions?.length) || 10} MCQs</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleStartCbtExam(exam)}
                              className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition active:scale-95 cursor-pointer flex items-center gap-1 shadow-xs ${
                                isLocked 
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200 hover:bg-amber-150' 
                                  : 'bg-slate-900 text-white hover:bg-slate-800'
                              }`}
                            >
                              <span>Enter Room</span>
                              <ArrowRight size={10} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-1 md:col-span-2 bg-white p-8 rounded-3xl border border-slate-150 shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[250px]">
                      <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 text-lg">
                        📂
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-slate-900">No Exam Sheets Published</h4>
                        <p className="text-xs text-slate-400 max-w-sm font-medium">
                          There are currently no synchronized CBT exam papers published for {targetClass}. Switch classes in the filter desk or ask your instructor to push an active test sheet.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* B. Active Play Screen */}
          {isPlaying && activeQuizQuestions.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-150 shadow-sm space-y-6 animate-fade-in">
              
              {/* CBT Proctor Header vs Standard Drill Header */}
              {activeCbtExam ? (
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-slate-900 text-white rounded-xl">
                      <Shield size={16} className="text-red-500 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 leading-none">{activeCbtExam.title}</h4>
                      <p className="text-[10px] text-slate-400 font-extrabold font-sans tracking-wide mt-1 uppercase">Proctor Shield Enabled &bull; No cheating</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs font-extrabold ${
                      cbtTimeRemaining < 120 
                        ? 'bg-red-50 border-red-200 text-red-650 animate-pulse' 
                        : 'bg-slate-100 border-slate-200 text-slate-800'
                    }`}>
                      <Clock size={13} />
                      <span>{formatTime(cbtTimeRemaining)}</span>
                    </div>

                    <div className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl uppercase tracking-wider ${
                      cbtTabSwitches > 0 
                        ? 'bg-red-100 text-red-750 font-black' 
                        : 'bg-emerald-50 border border-emerald-150 text-emerald-850'
                    }`}>
                      {cbtTabSwitches > 0 ? `⚠️ Exits: ${cbtTabSwitches}` : '🛡️ Clean'}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Are you sure you want to submit your exam paper now?')) {
                          handleFinishCbtExam();
                        }
                      }}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-750 text-white text-[10px] font-black uppercase rounded-lg shadow-sm cursor-pointer transition active:scale-95"
                    >
                      Submit Paper
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-blue-600 tracking-widest uppercase block">
                      {targetClass} &bull; {selectedSubject?.name}
                    </span>
                    <h3 className="text-xs sm:text-sm font-black text-slate-400">
                      Drill: Question {currentQuestionIdx + 1} of {activeQuizQuestions.length}
                    </h3>
                  </div>
                  
                  {/* Visual state percent bar */}
                  <div className="w-24 sm:w-36 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300" 
                      style={{ width: `${((currentQuestionIdx + 1) / activeQuizQuestions.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Active Question Title */}
              <p className="text-base sm:text-lg font-black text-slate-905 leading-snug">
                {activeQuizQuestions[currentQuestionIdx].question}
              </p>

              {/* Interactive Multi choice Option Boxes */}
              <div className="grid grid-cols-1 gap-3">
                {activeQuizQuestions[currentQuestionIdx].options.map((opt, oIdx) => {
                  const isThisSelected = selectedAnswer === oIdx;
                  const isCorrectAnswer = activeQuizQuestions[currentQuestionIdx].correctIndex === oIdx;

                  let optClass = "border-slate-150 hover:border-slate-300 hover:bg-slate-50 text-slate-705 bg-white";

                  if (hasAnswered) {
                    if (isCorrectAnswer) {
                      optClass = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold shadow-sm shadow-emerald-50";
                    } else if (isThisSelected) {
                      optClass = "border-red-500 bg-red-50 text-red-950";
                    } else {
                      optClass = "border-slate-100 bg-white opacity-45 text-slate-400";
                    }
                  } else if (isThisSelected) {
                    optClass = "border-indigo-650 bg-indigo-50 text-indigo-900 font-bold";
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={hasAnswered}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full p-4 text-left text-xs sm:text-sm rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${optClass}`}
                    >
                      <div className="flex items-center gap-3 pr-3">
                        <span className={`h-6 w-6 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 ${
                          isThisSelected 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-slate-105 text-slate-500'
                        }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="leading-snug">{opt}</span>
                      </div>
                      
                      {/* Check or bad labels indicator */}
                      {hasAnswered && isCorrectAnswer && (
                        <span className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                          ✓
                        </span>
                      )}
                      {hasAnswered && isThisSelected && !isCorrectAnswer && (
                        <span className="h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                          ✗
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant feedback explanation panel */}
              {hasAnswered && (
                <div className={`p-4 rounded-2xl border flex gap-3 text-xs leading-relaxed animate-fade-in ${
                  selectedAnswer === activeQuizQuestions[currentQuestionIdx].correctIndex
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50/30 border-red-200 text-red-900'
                }`}>
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-sm mb-1">
                      {selectedAnswer === activeQuizQuestions[currentQuestionIdx].correctIndex 
                        ? '✨ Correct Answer' 
                        : '💡 Concept Insights'}
                    </h4>
                    <p className="text-slate-700 leading-relaxed font-semibold">
                      {activeQuizQuestions[currentQuestionIdx].explanation}
                    </p>
                  </div>
                </div>
              )}

              {/* Action buttons footer */}
              {hasAnswered && (
                <div className="pt-4 flex justify-end animate-fade-in">
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl active:scale-95 transition cursor-pointer"
                  >
                    <span>{currentQuestionIdx === activeQuizQuestions.length - 1 ? 'Finish and Submit Evaluation' : 'Next Question'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}

            </div>
          )}

          {/* C. Completion Summary Card Page */}
          {currentQuestionIdx === 999 && (
            <div className="bg-white p-7 sm:p-10 rounded-3xl border border-slate-150 shadow-md text-center space-y-8 animate-fade-in">
              {activeCbtExam ? (
                <div className="space-y-6">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-slate-900 border border-slate-800 relative text-white shadow-lg">
                      <Shield size={38} className="text-amber-400 animate-bounce-short" />
                    </div>

                    <div className="space-y-1">
                      <span className="px-3 py-1 bg-red-50 text-red-800 text-[9px] font-black uppercase tracking-widest rounded-full">
                        Proctored Exam Report Card
                      </span>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">{activeCbtExam.title} Finished!</h2>
                      <p className="text-xs text-slate-400 font-bold font-sans uppercase mt-1">
                        {activeCbtExam.subject} &bull; {activeCbtExam.class}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex flex-col items-center">
                      <span className="text-[10px] uppercase tracking-widest text-slate-455 font-black mb-1 leading-none font-sans">Exam Score</span>
                      <span className="text-2xl font-black text-blue-600 mt-1">
                        {Math.round((correctAnswersCount / activeQuizQuestions.length) * 105) > 100 
                          ? 100 
                          : Math.round((correctAnswersCount / activeQuizQuestions.length) * 100)}%
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">({correctAnswersCount} / {activeQuizQuestions.length} correct)</span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex flex-col items-center">
                      <span className="text-[10px] uppercase tracking-widest text-slate-455 font-black mb-1 leading-none font-sans">Duration Spent</span>
                      <span className="text-lg font-black text-slate-850 mt-1.5">
                        {(() => {
                          const spentSecs = (activeCbtExam.duration || 30) * 60 - cbtTimeRemaining;
                          return `${Math.floor(spentSecs / 60)}m ${spentSecs % 60}s`;
                        })()}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex flex-col items-center">
                      <span className="text-[10px] uppercase tracking-widest text-slate-455 font-black mb-1 leading-none font-sans">Proctor Status</span>
                      <span className={`text-[10px] font-black uppercase tracking-wider mt-2.5 px-2.5 py-1 rounded-md ${
                        cbtTabSwitches > 1 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-850'
                      }`}>
                        {cbtTabSwitches > 1 ? `FLAGGED (${cbtTabSwitches} exits)` : 'EXAM CLEAN'}
                      </span>
                    </div>
                  </div>

                  <div className="max-w-md mx-auto py-3 px-4 bg-slate-50 border border-slate-150 rounded-2xl text-xs sm:text-sm text-slate-750 font-bold leading-relaxed">
                    {cbtTabSwitches > 1 ? (
                      <p className="text-red-850 flex items-start gap-2.5 text-left leading-relaxed">
                        <AlertTriangle size={16} className="shrink-0 text-red-650 mt-0.5" />
                        <span>This exam session has been flagged on the server database due to {cbtTabSwitches} window unfocus events (tab changes). Please consult your school teacher to clear flags.</span>
                      </p>
                    ) : (
                      <p className="text-emerald-850 flex items-start gap-2.5 text-left leading-relaxed">
                        <CheckCircle size={16} className="shrink-0 text-emerald-650 mt-0.5" />
                        <span>Outstanding integrity record! No unauthorized window actions were reported. Your certificate has been pushed and logged.</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentQuestionIdx(0);
                        setIsPlaying(false);
                      }}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl active:scale-95 transition cursor-pointer"
                    >
                      <span>Return to Exam Hall</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-indigo-50 border border-indigo-150 relative">
                      <Award size={42} className="text-amber-500 animate-bounce-short" />
                      <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                        +{pointsAwarded} XP
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight font-sans">Interactive Drill Finished!</h2>
                      <p className="text-xs text-slate-400 font-medium">
                        Topic: {activeTopicTitle}
                      </p>
                    </div>
                  </div>

                  {/* Real metric score ring and progress columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex flex-col items-center">
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold mb-1">Score Percent</span>
                      <span className={`text-2xl font-black ${
                        correctAnswersCount === activeQuizQuestions.length ? 'text-amber-600' : 'text-blue-600'
                      }`}>
                        {Math.round((correctAnswersCount / activeQuizQuestions.length) * 100)}%
                      </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex flex-col items-center">
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold mb-1">Evaluation</span>
                      <span className="text-xs font-black text-slate-805 mt-1.5">
                        {correctAnswersCount} / {activeQuizQuestions.length} Correct
                      </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex flex-col items-center">
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold mb-1">XP Points Awarded</span>
                      <span className="text-xs font-black text-emerald-600 flex items-center gap-1 mt-1.5">
                        ⚡ +{pointsAwarded} XP
                      </span>
                    </div>
                  </div>

                  {/* Feedback messages based on scores */}
                  <div className="max-w-md mx-auto py-2 bg-slate-50/50 rounded-2xl border border-slate-100 text-xs sm:text-sm text-slate-650 leading-relaxed font-semibold">
                    {correctAnswersCount === activeQuizQuestions.length ? (
                      <p className="text-emerald-800">
                        🏆 Brilliant! A perfect performance! You have fully mastered this curriculum segment and claimed the golden XP score multiplier!
                      </p>
                    ) : correctAnswersCount >= 2 ? (
                      <p className="text-blue-800">
                        👍 Excellent attempt! You passed the syllabus drill and gained valuable study insights. Keep updating your records!
                      </p>
                    ) : (
                      <p className="text-indigo-850 font-medium">
                        📖 Strong try! Review the curriculum learning guide in the Learning Hub, then come back here to perfect your score cards!
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleStartQuiz}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl active:scale-95 transition cursor-pointer"
                    >
                      <RotateCcw size={14} />
                      <span>Retake Topic Drill</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentQuestionIdx(0);
                        setIsPlaying(false);
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-slate-205 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl active:scale-95 transition cursor-pointer"
                    >
                      <span>Select Another Topic</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
