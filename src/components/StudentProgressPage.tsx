import React, { useMemo } from 'react';
import { User, LessonProgress, ClassLevel, Subject, TermNumber } from '../types';
import { SUBJECTS, getSubjectsForClass, getWeeklyTopicTitle } from '../data/curriculum';
import { SubjectIcon } from './SubjectIcon';
import { 
  Trophy, Award, Calendar, CheckCircle2, Star, Shield, 
  TrendingUp, Users, Lock, ChevronUp, Clock, Target, Zap
} from 'lucide-react';

interface StudentProgressPageProps {
  user: User;
  progressList: LessonProgress[];
  onNavigateToQuizzes: () => void;
}

export function StudentProgressPage({ user, progressList, onNavigateToQuizzes }: StudentProgressPageProps) {
  const handleDownloadCSV = () => {
    const userProgress = progressList.filter(p => p.userId === user.id);
    
    // Header strings
    let csvContent = "\uFEFFstudent_name,class_level,subject_id,term,week,completion_status,score_percent\r\n";
    
    userProgress.forEach(p => {
      csvContent += `"${user.fullName}","${p.classLevel}","${p.subjectId}",Term ${p.termNum},Week ${p.weekNum},"${p.completed ? 'Completed' : 'Started'}",${p.score !== undefined ? p.score : 'N/A'}\n`;
    });
    
    if (userProgress.length === 0) {
      csvContent += `"${user.fullName}","${user.classLevel}","General Syllabus",N/A,N/A,"No tracked credits saved in active session",0\r\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${user.fullName.replace(/\s+/g, '_')}_Academic_Results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. Calculate Active User's XP Points
  const stats = useMemo(() => {
    let completedLessons = 0;
    let quizCount = 0;
    let perfectQuizzes = 0;
    let totalPoints = 0;

    // Filter progresses matching this specific user
    const userProgress = progressList.filter(p => p.userId === user.id);

    userProgress.forEach(p => {
      completedLessons++;
      totalPoints += 100; // 100 Points for active reading/lesson complete

      if (p.score !== undefined) {
        quizCount++;
        totalPoints += 50; // 50 Points for active quiz attempt
        
        if (p.score === 100) {
          perfectQuizzes++;
          totalPoints += 150; // Plus 150 XP bonus for perfect scoring
        } else if (p.score >= 66) {
          totalPoints += 100; // Plus 100 XP bonus for pass
        }
      }
    });

    return {
      completedLessons,
      quizCount,
      perfectQuizzes,
      totalPoints,
      userProgress
    };
  }, [progressList, user.id]);

  // 2. Mapped subjects lists for progress bars
  const activeClassSubjects = useMemo(() => {
    const all = getSubjectsForClass(user.classLevel);
    if (user.selectedSubjectIds && user.selectedSubjectIds.length > 0) {
      return all.filter(s => user.selectedSubjectIds!.includes(s.id));
    }
    return all;
  }, [user.classLevel, user.selectedSubjectIds]);

  // Subject-specific completion details
  const subjectBreakdowns = useMemo(() => {
    return activeClassSubjects.map(subj => {
      // Find matching items for this subject
      const matching = stats.userProgress.filter(p => p.subjectId === subj.id && p.classLevel === user.classLevel);
      // Total potential slots: 3 terms * 12 weeks = 36 modules
      const completed = matching.length;
      const pct = Math.min(Math.round((completed / 36) * 100), 100);
      
      // Calculate average score
      const quizScores = matching.filter(p => p.score !== undefined).map(p => p.score as number);
      const avgScore = quizScores.length > 0 ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : null;

      return {
        subject: subj,
        completed,
        pct,
        avgScore
      };
    });
  }, [activeClassSubjects, stats.userProgress, user.classLevel]);

  // Term-specific completion details
  const termBreakdowns = useMemo(() => {
    return ([1, 2, 3] as TermNumber[]).map(termNum => {
      const matchTerm = stats.userProgress.filter(p => p.termNum === termNum && p.classLevel === user.classLevel);
      const completedCount = matchTerm.length;
      // Max topics in a term is (subjects active in class * 12 weeks)
      const totalPossible = activeClassSubjects.length * 12;
      const pct = totalPossible > 0 ? Math.min(Math.round((completedCount / totalPossible) * 100), 100) : 0;

      return {
        termNumber: termNum,
        completedCount,
        totalPossible,
        pct
      };
    });
  }, [stats.userProgress, user.classLevel, activeClassSubjects]);

  // 3. Dynamic Badge System Definitions
  const badges = useMemo(() => {
    // Requirements checks
    const hasStarted = stats.completedLessons >= 1 || !!user.joinDate;
    const hasAttemptedQuiz = stats.quizCount >= 1;
    const hasPerfectQuiz = stats.perfectQuizzes >= 1;
    const hasTermTitan = termBreakdowns.some(t => t.completedCount >= 5);
    const hasMathMaster = stats.userProgress.filter(p => p.subjectId === 'mathematics').length >= 3;
    const hasCenturyGamer = stats.totalPoints >= 1000;

    return [
      {
        id: 'new_recruit',
        label: 'Naija Scholar',
        description: 'Successfully register your academic student profile.',
        icon: '🎓',
        isUnlocked: hasStarted,
        rewardMsg: 'Unlocked automatically!'
      },
      {
        id: 'first_quiz',
        label: 'Quiz Blazer',
        description: 'Take and submit your first syllabus drill quiz.',
        icon: '⚡',
        isUnlocked: hasAttemptedQuiz,
        rewardMsg: 'Requires 1 quiz completion'
      },
      {
        id: 'perfect_100',
        label: 'Century Prodigy',
        description: 'Achieve a flawless 100% score on any curriculum test.',
        icon: '💯',
        isUnlocked: hasPerfectQuiz,
        rewardMsg: 'Earn 100% on any practice quiz'
      },
      {
        id: 'term_titan',
        label: 'Term Titan',
        description: 'Complete at least 5 different syllabus topics in a single term.',
        icon: '🚀',
        isUnlocked: hasTermTitan,
        rewardMsg: 'Settle 5+ distinct weekly lessons in a single term'
      },
      {
        id: 'math_champion',
        label: 'Math Overlord',
        description: 'Demonstrate math excellence by completing 3 mathematics weeks.',
        icon: '📐',
        isUnlocked: hasMathMaster,
        rewardMsg: 'Requires 3 Mathematics lesson checklist credits'
      },
      {
        id: 'points_heavy',
        label: 'Elite Academician',
        description: 'Climb high by acquiring over 1,000 total XP points.',
        icon: '👑',
        isUnlocked: hasCenturyGamer,
        rewardMsg: 'Earn a total of 1,000+ XP points'
      }
    ];
  }, [stats, termBreakdowns, user.joinDate]);

  // 4. Simulated National Leaderboard containing current user dynamically inserted!
  const leaderboard = useMemo(() => {
    const peers = [
      { id: 'mus1', name: 'Ibrahim Musa', state: 'Kano State', score: 2800, ClassLevel: 'SS 3' as ClassLevel, isCurrentUser: false },
      { id: 'chi2', name: 'Chioma Nwachukwu', state: 'Enugu State', score: 2100, ClassLevel: 'JSS 3' as ClassLevel, isCurrentUser: false },
      { id: 'bay3', name: 'Tobiloba Balogun', state: 'Lagos State', score: 1450, ClassLevel: 'Primary 5' as ClassLevel, isCurrentUser: false },
      { id: 'act4', name: `${user.fullName} (You)`, state: 'Syllabus Companion', score: stats.totalPoints, ClassLevel: user.classLevel, isCurrentUser: true },
      { id: 'ngo5', name: 'Ngozi Okonjo', state: 'Anambra State', score: 900, ClassLevel: 'SS 1' as ClassLevel, isCurrentUser: false },
      { id: 'fat6', name: 'Fatimah Yusuf', state: 'Kaduna State', score: 550, ClassLevel: 'JSS 1' as ClassLevel, isCurrentUser: false },
    ];

    // Sort descending by score
    return peers.sort((a, b) => b.score - a.score);
  }, [stats.totalPoints, user.fullName, user.classLevel]);

  return (
    <div className="space-y-6 animate-fade-in font-sans">

      {/* Dynamic Student Transcript Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-150 shadow-xs">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>🎓</span>
            <span>{user.fullName}&apos;s Academic Transcript</span>
          </h2>
          <p className="text-xs text-slate-500">Official syllabus compliance index & points ledger for {user.classLevel}</p>
        </div>

        <button
          type="button"
          onClick={handleDownloadCSV}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-750 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm shadow-blue-500/10 cursor-pointer text-center"
        >
          <span>Download Results (CSV)</span>
        </button>
      </div>

      {/* Dynamic Summary Stats Widget */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Points */}
        <div className="bg-gradient-to-br from-indigo-700 to-blue-600 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10">
            <Zap size={130} />
          </div>
          <div className="space-y-2 relative z-10">
            <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider">Total Accumulated XP</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black">{stats.totalPoints.toLocaleString()}</span>
              <span className="text-xs font-bold text-indigo-200">XP</span>
            </div>
            <p className="text-[11px] text-indigo-100">
              Increase points by reading core chapters and solving quiz drills.
            </p>
          </div>
        </div>

        {/* Metric 2: Lessons Complete */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4 relative">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <CheckCircle2 size={24} className="stroke-[2]" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Lessons Completed</span>
            <span className="text-2xl font-black text-slate-850 block">{stats.completedLessons}</span>
            <span className="text-[10px] text-slate-450 block font-semibold">Checks Saved</span>
          </div>
        </div>

        {/* Metric 3: Quizzes Solved */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Target size={24} className="stroke-[2]" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Quizzes Solved</span>
            <span className="text-2xl font-black text-slate-850 block">{stats.quizCount}</span>
            <span className="text-[10px] text-emerald-600 block font-bold">
              {stats.perfectQuizzes} Perfect Scores 💯
            </span>
          </div>
        </div>

        {/* Metric 4: Academic Class */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
            <Trophy size={24} className="stroke-[2]" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Current Rank</span>
            <span className="text-xl font-black text-slate-850 block truncate max-w-[155px]">
              Rank #{leaderboard.findIndex(p => p.isCurrentUser) + 1} nationally
            </span>
            <span className="text-[10px] text-blue-600 block font-bold">
              {user.classLevel} Candidate
            </span>
          </div>
        </div>

      </div>

      {/* Main Grid: Performance over Time and Subjects vs Badges/Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 8 Columns - Performance breakdowns */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Performance by School Term */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" />
              <div>
                <h3 className="font-extrabold text-slate-850 text-sm">Performance over Time (Academic Terms 1 - 3)</h3>
                <p className="text-xs text-slate-400">Completion mapping of subjects across the official government schedule.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {termBreakdowns.map(term => (
                <div key={term.termNumber} className="border border-slate-100 p-4 rounded-2xl bg-slate-50/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-slate-800">Term {term.termNumber} Topics</span>
                    <span className="text-xs bg-blue-50 text-blue-700 font-black px-2 pb-0.5 pt-1 rounded-md">{term.pct}%</span>
                  </div>
                  
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-550" 
                      style={{ width: `${term.pct}%` }}
                    />
                  </div>
                  
                  <p className="text-[10px] text-slate-400 font-semibold leading-none">
                    {term.completedCount} of {term.totalPossible} topics completed
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Performance breakdown by Subjects detailed meters */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-indigo-600" />
                <div>
                  <h3 className="font-extrabold text-slate-850 text-sm">Competency & Completion by Subject</h3>
                  <p className="text-xs text-slate-400">Trace your subject mastery loops and average test score levels.</p>
                </div>
              </div>
              <button
                onClick={onNavigateToQuizzes}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold underline transition"
              >
                Launch Quiz Lobby
              </button>
            </div>

            <div className="space-y-4">
              {subjectBreakdowns.map(({ subject, completed, pct, avgScore }) => (
                <div key={subject.id} className="p-4 border border-slate-100 bg-white hover:bg-slate-50 rounded-2xl space-y-2 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 rounded-lg bg-slate-100 text-slate-705">
                        <SubjectIcon name={subject.icon} size={14} />
                      </span>
                      <div>
                        <span className="text-xs font-black text-slate-800 block leading-tight">{subject.name}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{subject.category} field</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-black block leading-none">Modules completed</span>
                        <span className="text-xs font-black text-slate-700 mt-1 block">{completed} / 36</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-black block leading-none">Avg quiz score</span>
                        <span className={`text-xs font-black mt-1 block ${
                          avgScore ? 'text-blue-700' : 'text-slate-350'
                        }`}>
                          {avgScore ? `${avgScore}%` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Syllabus progress percentage timeline */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                      <span>Syllabus covered</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all" 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log Chronological tracker */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-850 text-sm flex items-center gap-2">
              <Clock size={16} className="text-slate-400" />
              <span>Academic Ledger Activity Timeline ({stats.userProgress.length} entries)</span>
            </h3>

            {stats.userProgress.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {stats.userProgress.map((item, idx) => {
                  const subContent = SUBJECTS[item.subjectId];
                  const topicTitle = getWeeklyTopicTitle(item.classLevel, item.subjectId, item.termNum, item.weekNum);
                  
                  return (
                    <div key={idx} className="p-3 border-l-2 border-blue-500 bg-slate-50 rounded-r-xl text-xs flex justify-between items-center gap-3 animate-fade-in">
                      <div className="space-y-0.5 truncate pr-3">
                        <p className="font-bold text-slate-800 truncate">{topicTitle}</p>
                        <p className="text-[10px] text-slate-450 truncate">
                          {subContent ? subContent.name : item.subjectId} &bull; Term {item.termNum}, Week {item.weekNum}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        {item.score !== undefined ? (
                          <span className="inline-block px-1.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-black rounded border border-emerald-100">
                            Quiz: {item.score}%
                          </span>
                        ) : (
                          <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">
                            Approved
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                No completion logs stored in history database yet. Browse the Learning Hub and mark weeks complete!
              </div>
            )}
          </div>

        </div>

        {/* Right 4 Columns - Badges Room & Leaderboard */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Badge Achievements Room cabinet */}
          <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-amber-500" />
              <div>
                <h3 className="font-extrabold text-slate-850 text-sm">Achievement Badges</h3>
                <p className="text-[11px] text-slate-400 leading-tight">Milestones unlocked based on curriculum drills.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {badges.map(badge => (
                <div 
                  key={badge.id}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-between text-center gap-2 transition duration-200 ${
                    badge.isUnlocked 
                      ? 'bg-amber-500/5 border-amber-200 ring-2 ring-amber-100 shadow-sm' 
                      : 'bg-slate-50 border-slate-150 grayscale text-slate-400 opacity-70'
                  }`}
                >
                  <span className="text-2xl pt-1 block">{badge.icon}</span>
                  
                  <div>
                    <h4 className="text-[11px] font-black leading-tight text-slate-800">{badge.label}</h4>
                    <p className="text-[9px] text-slate-500 leading-tight mt-0.5 h-10 overflow-hidden line-clamp-3">
                      {badge.description}
                    </p>
                  </div>

                  {badge.isUnlocked ? (
                    <span className="text-[8px] bg-amber-400 text-amber-900 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
                      Unlocked
                    </span>
                  ) : (
                    <span className="text-[8px] bg-slate-200 text-slate-500 font-bold px-1.5 py-0.5 rounded leading-none flex items-center gap-0.5">
                      <Lock size={8} />
                      <span>Locked</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* National Leaderboard for Friendly Competition */}
          <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-indigo-600" />
              <div>
                <h3 className="font-extrabold text-slate-850 text-sm">National Leaderboard</h3>
                <p className="text-[11px] text-slate-400 leading-tight">See how you match against peer scholars in Nigeria.</p>
              </div>
            </div>

            <div className="space-y-2">
              {leaderboard.map((player, pIdx) => {
                const medalBg = 
                  pIdx === 0 ? 'bg-amber-100 text-amber-800 font-black' :
                  pIdx === 1 ? 'bg-slate-100 text-slate-700 font-bold' :
                  pIdx === 2 ? 'bg-orange-50 text-orange-850 font-semibold' : 'text-slate-405 text-xs';

                return (
                  <div 
                    key={player.id} 
                    className={`p-2.5 rounded-xl flex items-center justify-between border text-xs transition duration-200 ${
                      player.isCurrentUser 
                        ? 'bg-blue-600 text-white border-blue-600 shadow font-extrabold shadow-blue-500/20' 
                        : 'bg-slate-50/50 border-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {/* Ranking place */}
                      <span className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] shrink-0 ${medalBg}`}>
                        {pIdx + 1}
                      </span>
                      
                      <div className="truncate pr-1">
                        <p className={`truncate leading-none block font-bold ${
                          player.isCurrentUser ? 'text-white' : 'text-slate-800 font-bold'
                        }`}>
                          {player.name}
                        </p>
                        <span className={`text-[9px] block mt-0.5 leading-none ${
                          player.isCurrentUser ? 'text-blue-105' : 'text-slate-400'
                        }`}>
                          {player.state} &bull; {player.ClassLevel}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[11px] font-black shrink-0 ${
                      player.isCurrentUser ? 'text-amber-300' : 'text-indigo-700'
                    }`}>
                      {player.score} XP
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-[9px] text-slate-400 text-center leading-relaxed font-semibold pt-1">
              Leaderboard rankings update instantly as points are gained. Solve quiz drills to climb ranking tabs!
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
