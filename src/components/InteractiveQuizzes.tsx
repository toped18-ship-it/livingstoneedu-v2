import React, { useState, useMemo } from 'react';
import { ClassLevel, User, Subject, TermNumber, WeekNumber, LessonProgress, LessonContent } from '../types';
import { ALL_CLASSES, getSubjectsForClass, getWeeklyTopicTitle, getLessonContent } from '../data/curriculum';
import { SubjectIcon } from './SubjectIcon';
import { 
  Award, CheckCircle, RotateCcw, ThumbsUp, AlertCircle, 
  HelpCircle, ArrowRight, Play, BookOpen, GraduationCap, 
  Sparkles, Check, ChevronRight, Zap
} from 'lucide-react';

interface InteractiveQuizzesProps {
  user: User;
  progressList: LessonProgress[];
  onToggleComplete: (subjectId: string, termNum: TermNumber, weekNum: WeekNumber, score?: number) => void;
  isPro: boolean;
  onPaymentTrigger: () => void;
  demoUsageCount: number;
  onIncrementDemoUsage: () => number;
}

export function InteractiveQuizzes({ 
  user, 
  progressList, 
  onToggleComplete,
  isPro,
  onPaymentTrigger,
  demoUsageCount,
  onIncrementDemoUsage
}: InteractiveQuizzesProps) {
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
  const [isPlaying, setIsPlaying] = useState(false);
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

  const activeQuizQuestions = lessonData.quiz;

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
      // Quiz complete! Grade and trigger complete event
      const finalScore = Math.round((correctAnswersCount / activeQuizQuestions.length) * 100);
      onToggleComplete(selectedSubject.id, selectedTerm, selectedWeek, finalScore);
      setIsPlaying(false);
      // Double check high scorecard
      setCurrentQuestionIdx(999); // Flag for summary screen
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

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Area */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-650 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute left-1/3 bottom-0 translate-y-16 w-52 h-52 bg-white/5 rounded-full blur-xl" />
        
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-bold leading-none backdrop-blur-sm">
            <Zap size={13} className="text-amber-300 fill-amber-300 animate-pulse" />
            <span>Curriculum-Aligned Drills</span>
          </div>
          <h1 className="text-2xl sm:text-3.5xl font-black tracking-tight">Interactive Exams & Quizzes</h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Challenge yourself with curriculum-specific drills. Tailor your questions perfectly by class levels, subjects, and topics list!
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
              {progressList.filter(p => p.score !== undefined).length} Quizzes Solved
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column Controls (Interactive Selectors) */}
        {currentQuestionIdx !== 999 && !isPlaying && (
          <div className="lg:col-span-4 space-y-6 animate-fade-in">
            
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

          </div>
        )}

        {/* Right Column / Primary Playing Dashboard (8 cols or 12 cols depending on layout state) */}
        <div className={`${currentQuestionIdx === 999 || isPlaying ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-6`}>
               {/* A. Welcome state showing details before launch */}
          {!isPlaying && currentQuestionIdx !== 999 && (() => {
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
                      className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-white font-black text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition active:scale-97"
                    >
                      Subscribe to Pro (₦5,000 / term)
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
                  <p className="text-xs sm:text-sm text-slate-705 leading-relaxed">
                    Test your comprehension of this Nigerian curriculum lesson. Includes <strong>multiple-choice questions</strong>, answers breakdown feedback, and awards immediate XP score!
                  </p>
                </div>

                {/* Show previous score if exists */}
                {activeQuizProgress && activeQuizProgress.score !== undefined && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 px-5 animate-pulse-slow">
                    <Award size={16} className="text-amber-600 animate-spin-slow" />
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

          {/* B. Active Play Screen */}
          {isPlaying && activeQuizQuestions.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-150 shadow-sm space-y-6 animate-fade-in">
              
              {/* Question tracking header */}
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

              {/* Active Question Title */}
              <p className="text-base sm:text-lg font-black text-slate-905 leading-snug">
                {activeQuizQuestions[currentQuestionIdx].question}
              </p>

              {/* Interactive Multi choice Option Boxes */}
              <div className="grid grid-cols-1 gap-3">
                {activeQuizQuestions[currentQuestionIdx].options.map((opt, oIdx) => {
                  const isThisSelected = selectedAnswer === oIdx;
                  const isCorrectAnswer = activeQuizQuestions[currentQuestionIdx].correctIndex === oIdx;

                  let optClass = "border-slate-150 hover:border-slate-300 hover:bg-slate-50 text-slate-700 bg-white";

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
                        ? '✨ Correct! Excellent Mind.' 
                        : '💡 Key Concept Review'}
                    </h4>
                    <p className="text-slate-700 leading-relaxed font-medium">
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
                    <span>{currentQuestionIdx === activeQuizQuestions.length - 1 ? 'Finish and Score Drill' : 'Next Question'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}

            </div>
          )}

          {/* C. Completion Summary Card Page */}
          {currentQuestionIdx === 999 && (
            <div className="bg-white p-7 sm:p-10 rounded-3xl border border-slate-150 shadow-md text-center space-y-8 animate-fade-in">
              
              <div className="max-w-md mx-auto space-y-4">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-indigo-50 border border-indigo-150 relative">
                  <Award size={42} className="text-amber-500 animate-bounce-short" />
                  <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                    +{pointsAwarded} XP
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Interactive Drill Finished!</h2>
                  <p className="text-xs text-slate-400">
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
                  <span className="text-xs font-black text-slate-800 self-center">
                    {correctAnswersCount} / {activeQuizQuestions.length} Correct
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold mb-1">XP Points Awarded</span>
                  <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
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
                  <p className="text-indigo-850">
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

      </div>

    </div>
  );
}
