import React, { useState, useMemo } from 'react';
import { 
  Users, CheckSquare, Plus, Trash2, BrainCircuit, Check, Loader2, 
  Printer, Clock, Sparkles, BookOpen, TrendingUp, X, Percent, 
  Star, Award, Download, CreditCard, Lock, ShieldAlert, ChevronRight, CheckCircle2, UserCheck,
  Edit, Save
} from 'lucide-react';
import { User, ClassLevel, TeacherClassSetup, TeacherStudent, AIExam, QuizQuestion } from '../types';
import { getSubjectsForClass } from '../data/curriculum';
import { rtdbGet, NODES } from '../lib/rtdbService';

interface TeacherPortalProps {
  user: User;
  onNavigateToHome: () => void;
  isPro: boolean;
  onPaymentTrigger: () => void;
}

// Initial Nigerian mock names for instant classroom bootstrapping
const DEMO_STUDENT_NAMES = [
  { name: 'Chinedu Okafor', email: 'chinedu.okafor@school.ng' },
  { name: 'Amina Yusuf', email: 'amina.yusuf@school.ng' },
  { name: 'Tunde Babalola', email: 'tunde.babalola@school.ng' },
  { name: 'Ngozi Adebayo', email: 'ngozi.adebayo@school.ng' }
];

export function TeacherPortal({ user, onNavigateToHome, isPro, onPaymentTrigger }: TeacherPortalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'attendance' | 'exam-maker' | 'grader' | 'reports' | 'lesson-notes'>('roster');
  
  // Roster Class Level State
  const [classLevel, setClassLevel] = useState<ClassLevel>('SS 1');

  // Lesson Notes States
  const [selectedClass, setSelectedClass] = useState<string>('SS 1');
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [selectedTerm, setSelectedTerm] = useState<string>('1st Term');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [customTopic, setCustomTopic] = useState<string>('');
  const [isEndOfTerm, setIsEndOfTerm] = useState<boolean>(false);
  const [isGeneratingNote, setIsGeneratingNote] = useState<boolean>(false);
  const [generatedNote, setGeneratedNote] = useState<any | null>(null);
  const [noteError, setNoteError] = useState<string>('');
  const [lessonSubTab, setLessonSubTab] = useState<'blueprint' | 'narrative' | 'activities' | 'assessment'>('blueprint');

  // Interactive Quiz State
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showAnswerKey, setShowAnswerKey] = useState<boolean>(false);

  const CLASSES_LIST = [
    'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
    'JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'
  ];

  const SUBJECTS_LIST = [
    'Mathematics', 'English Studies', 'Basic Science & Tech', 'National Values (Civic/Social)',
    'Computer Studies / ICT', 'Agricultural Science', 'Biology', 'Chemistry', 'Physics',
    'Economics', 'Financial Accounting', 'Commerce', 'Government', 'Civic Education',
    'Christian Religious Studies', 'Islamic Religious Studies', 'Cultural and Creative Arts',
    'Home Economics', 'Physical & Health Education', 'French Language'
  ];

  const handleGenerateLessonNote = async () => {
    setIsGeneratingNote(true);
    setNoteError('');
    setGeneratedNote(null);
    setUserAnswers({});
    setShowAnswerKey(false);
    try {
      // 1. Retrieve curriculum topic from Firebase Realtime Database curriculum node
      const rtdbCurriculum = await rtdbGet(NODES.CURRICULUM);
      let matchedCurriculum: any = null;
      
      const targetTerm = selectedTerm; // e.g. "1st Term"
      const targetWeek = selectedWeek; // number
      const targetClass = selectedClass; // e.g. "SS 1"
      const targetSubject = selectedSubject; // e.g. "Mathematics"

      if (rtdbCurriculum) {
        const keys = Object.keys(rtdbCurriculum);
        for (const k of keys) {
          const item = rtdbCurriculum[k];
          if (
            item &&
            String(item.class).toLowerCase() === targetClass.toLowerCase() &&
            String(item.subject).toLowerCase() === targetSubject.toLowerCase() &&
            String(item.term).toLowerCase() === targetTerm.toLowerCase() &&
            Number(item.week) === Number(targetWeek)
          ) {
            matchedCurriculum = item;
            break;
          }
        }
      }

      if (!matchedCurriculum) {
        throw new Error(`Could not locate an official registered school curriculum in database for Class: ${targetClass}, Subject: ${targetSubject}, Term: ${targetTerm}, Week: ${targetWeek}. Please check the Admin Panel curriculum tab!`);
      }

      const res = await fetch('/api/gemini/generate-lesson-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classLevel: matchedCurriculum.class,
          subject: matchedCurriculum.subject,
          term: matchedCurriculum.term,
          week: `Week ${matchedCurriculum.week}`,
          focusTopic: matchedCurriculum.topic,
          topicDescription: matchedCurriculum.details,
          isEndOfTerm: isEndOfTerm
        })
      });

      if (!res.ok) {
        throw new Error('Server returned error response');
      }

      const result = await res.json();
      if (result.success) {
        setGeneratedNote(result.lessonNote);
        setLessonSubTab('blueprint');
        
        // Log updated academic activity
        fetch('/api/admin/log-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userName: user.fullName,
            userEmail: user.email,
            activityType: 'Lesson Generated',
            subject: selectedSubject,
            detail: `Synthesized NERDC Term Plan for ${selectedClass}, Week ${selectedWeek} (${selectedTerm})`
          })
        }).catch(() => {});
      } else {
        throw new Error(result.error || 'Failed to retrieve lesson contents');
      }
    } catch (err: any) {
      setNoteError(err.message || 'Network connection timeout generating school assets.');
    } finally {
      setIsGeneratingNote(false);
    }
  };

  const handleCopyNoteToClipboard = () => {
    if (!generatedNote) return;
    
    const plainText = `
${generatedNote.topic?.toUpperCase()} - LESSON NOTE
Subtopic: ${generatedNote.subtopic || ''}
Class Level: ${generatedNote.classLevel || ''} | Duration: ${generatedNote.duration || ''}

LEARNING OBJECTIVES:
${generatedNote.objectives?.map((o: string, idx: number) => `${idx + 1}. ${o}`).join('\n')}

KEY VOCABULARY:
${generatedNote.keyVocabulary?.join(', ')}

TEACHING MATERIALS:
${generatedNote.teachingMaterials?.map((t: string) => `- ${t}`).join('\n')}

INTRODUCTION:
${generatedNote.introduction || ''}

EXPLANATION STEPS:
${generatedNote.teacherExplanationSteps?.map((s: string, idx: number) => `Step ${idx + 1}: ${s}`).join('\n')}

LESSON NOTE CONTENT:
${generatedNote.detailedLessonNote || ''}

STUDENT ACTIVITIES:
${generatedNote.studentActivities?.map((a: string) => `- ${a}`).join('\n')}

CLASS EXERCISES:
${generatedNote.classExercises?.map((e: string, idx: number) => `Exercise ${idx + 1}: ${e}`).join('\n')}

HOMEWORK:
${generatedNote.homeworkAssignment || ''}
    `.trim();

    navigator.clipboard.writeText(plainText);
    alert('Lesson note copied to clipboard successfully!');
  };

  const renderFormattedMarkdown = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) {
        return <h3 key={idx} className="text-lg font-black text-slate-900 tracking-tight mt-6 mb-3 border-b pb-1 font-sans">{trimmed.substring(4)}</h3>;
      }
      if (trimmed.startsWith('#### ')) {
        return <h4 key={idx} className="text-base font-black text-slate-800 mt-4 mb-2 font-sans">{trimmed.substring(5)}</h4>;
      }
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        return <h5 key={idx} className="text-sm font-black text-slate-900 mt-3 mb-1 font-sans">{trimmed.replace(/\*\*/g, '')}</h5>;
      }
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        return (
          <li key={idx} className="ml-5 list-disc text-xs text-slate-700 leading-relaxed my-1 font-serif">
            {trimmed.substring(2)}
          </li>
        );
      }
      if (trimmed === '') {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-xs text-slate-700 leading-relaxed my-2.5 font-serif text-justify">
          {trimmed}
        </p>
      );
    });
  };
  
  // Local storage management for classrooms
  const [classSetup, setClassSetup] = useState<TeacherClassSetup>(() => {
    const cached = localStorage.getItem(`livingstone_class_${user.id}`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // ignore
      }
    }
    return {
      teacherId: user.id,
      classLevel: 'SS 1',
      students: []
    };
  });

  const saveClassSetup = (updated: TeacherClassSetup) => {
    setClassSetup(updated);
    localStorage.setItem(`livingstone_class_${user.id}`, JSON.stringify(updated));
  };

  // Student list methods
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  const handleEditStudentSelect = (student: TeacherStudent) => {
    setEditingStudentId(student.id);
    setNewStudentName(student.name);
    setNewStudentEmail(student.email);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const email = newStudentEmail.trim() || `${newStudentName.trim().toLowerCase().replace(/\s+/g, '_')}@school.ng`;
    
    if (editingStudentId) {
      // Check duplication excluding the edited student
      if (classSetup.students.some(s => s.id !== editingStudentId && s.email.toLowerCase() === email.toLowerCase())) {
        alert('A student with this email address is already added.');
        return;
      }
      const updatedStudents = classSetup.students.map(s => {
        if (s.id === editingStudentId) {
          return {
            ...s,
            name: newStudentName.trim(),
            email
          };
        }
        return s;
      });
      saveClassSetup({
        ...classSetup,
        students: updatedStudents
      });
      setEditingStudentId(null);
    } else {
      // Check duplication
      if (classSetup.students.some(s => s.email.toLowerCase() === email.toLowerCase())) {
        alert('A student with this email address is already added.');
        return;
      }

      const newStudent: TeacherStudent = {
        id: 'student_' + Date.now().toString() + '_' + Math.floor(Math.random() * 1000),
        name: newStudentName.trim(),
        email,
        termScores: {},
        attendance: {}
      };

      const updated = {
        ...classSetup,
        students: [...classSetup.students, newStudent]
      };
      saveClassSetup(updated);
    }
    setNewStudentName('');
    setNewStudentEmail('');
  };

  const handleRemoveStudent = (id: string) => {
    if (editingStudentId === id) {
      setEditingStudentId(null);
      setNewStudentName('');
      setNewStudentEmail('');
    }
    const updated = {
      ...classSetup,
      students: classSetup.students.filter(s => s.id !== id)
    };
    saveClassSetup(updated);
  };

  // Bootstrap Demo Class helper
  const handleBootstrapDemo = () => {
    const defaultStudents: TeacherStudent[] = DEMO_STUDENT_NAMES.map((demo, idx) => ({
      id: `student_demo_${idx}_${Date.now()}`,
      name: demo.name,
      email: demo.email,
      termScores: {
        physics: { caScore: 32 + idx, examScore: 48 + idx, remark: 'Showing highly technical competence inside calculations.' },
        chemistry: { caScore: 28 + (idx * 2), examScore: 45 + (idx * 2), remark: 'Brilliant comprehension of reaction kinetics.' },
        further_math: { caScore: 30 + idx, examScore: 42 + (idx * 3), remark: 'Methodical in algebraic formulas. Well done.' },
        mathematics: { caScore: 34, examScore: 52, remark: 'Consistently exceptional performances in exam grids.' }
      },
      attendance: {
        1: true, 2: true, 3: true, 4: idx % 2 === 0, 
        5: true, 6: true, 7: true, 8: true, 
        9: true, 10: idx !== 3, 11: true, 12: true
      }
    }));

    const updated = {
      ...classSetup,
      students: defaultStudents
    };
    saveClassSetup(updated);
  };

  // Subject Selector List based on selected class
  const classSubjects = useMemo(() => {
    return getSubjectsForClass(classLevel);
  }, [classLevel]);

  // Attendance management toggles
  const [selectedAttendanceWeek, setSelectedAttendanceWeek] = useState<number>(1);

  const handleToggleAttendance = (studentId: string, week: number) => {
    const updatedStudents = classSetup.students.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          attendance: {
            ...s.attendance,
            [week]: !s.attendance[week]
          }
        };
      }
      return s;
    });

    saveClassSetup({
      ...classSetup,
      students: updatedStudents
    });
  };

  // AI Exam Architect States
  const [selectedSubjectId, setSelectedSubjectId] = useState(classSubjects[0]?.id || 'physics');
  const [examQuestionsCount, setExamQuestionsCount] = useState(5);
  const [examTopicConstraint, setExamTopicConstraint] = useState('');
  const [examTermConstraint, setExamTermConstraint] = useState<'1st Term' | '2nd Term' | '3rd Term'>('1st Term');
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);
  const [previewExam, setPreviewExam] = useState<AIExam | null>(null);
  
  // Saved Exams
  const [savedExams, setSavedExams] = useState<AIExam[]>(() => {
    const cached = localStorage.getItem(`livingstone_exams_${user.id}`);
    return cached ? JSON.parse(cached) : [];
  });

  const handleGenerateExamAI = async () => {
    setIsGeneratingExam(true);
    setPreviewExam(null);
    try {
      const activeSubjectObj = classSubjects.find(s => s.id === selectedSubjectId) || classSubjects[0];
      const subjectName = activeSubjectObj ? activeSubjectObj.name : selectedSubjectId;

      const response = await fetch('/api/gemini/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subjectName,
          classLevel,
          numQuestions: examQuestionsCount,
          term: examTermConstraint,
          topic: examTopicConstraint || 'General Syllabus Core'
        })
      });

      const res = await response.json();
      if (res.success && res.questions) {
        setPreviewExam({
          id: 'exam_' + Date.now().toString(),
          title: `AI National Exam: ${subjectName} (${examTermConstraint})`,
          subjectId: selectedSubjectId,
          classLevel,
          numQuestions: examQuestionsCount,
          questions: res.questions,
          createdAt: new Date().toLocaleDateString()
        });
      } else {
        alert('Could not compile appropriate curriculum questions. Kindly check network status and retry.');
      }
    } catch (e) {
      console.error(e);
      alert('AI connection experienced a bottleneck. Invoking local database generators.');
    } finally {
      setIsGeneratingExam(false);
    }
  };

  const handleSaveExam = () => {
    if (!previewExam) return;
    const updated = [previewExam, ...savedExams];
    setSavedExams(updated);
    localStorage.setItem(`livingstone_exams_${user.id}`, JSON.stringify(updated));
    setPreviewExam(null);
    alert('Congratulations! Your exam script has been successfully compiled and saved to the portal.');
  };

  const handleDeleteExam = (examId: string) => {
    const updated = savedExams.filter(e => e.id !== examId);
    setSavedExams(updated);
    localStorage.setItem(`livingstone_exams_${user.id}`, JSON.stringify(updated));
  };


  // AI Autograder state variables
  const [graderStudentId, setGraderStudentId] = useState('');
  const [graderExamId, setGraderExamId] = useState('');
  const [studentChoiceVector, setStudentChoiceVector] = useState<Record<number, number>>({});
  const [isGradingScript, setIsGradingScript] = useState(false);
  const [gradingReport, setGradingReport] = useState<any>(null);

  const activeGraderStudent = useMemo(() => {
    return classSetup.students.find(s => s.id === graderStudentId);
  }, [classSetup, graderStudentId]);

  const activeGraderExam = useMemo(() => {
    return savedExams.find(e => e.id === graderExamId);
  }, [savedExams, graderExamId]);

  // Handle auto randomizing student choice vector for testing
  const handleRandomizeStudentResp = () => {
    if (!activeGraderExam) return;
    const vector: Record<number, number> = {};
    activeGraderExam.questions.forEach((_, idx) => {
      // 70% chance of picking correct answer, mimicking standard student
      const pickCorrect = Math.random() < 0.75;
      vector[idx] = pickCorrect ? _.correctIndex : Math.floor(Math.random() * 4);
    });
    setStudentChoiceVector(vector);
  };

  const handleGradeWithAI = async () => {
    if (!activeGraderStudent || !activeGraderExam) return;
    setIsGradingScript(true);
    setGradingReport(null);

    try {
      const response = await fetch('/api/gemini/grade-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: activeGraderStudent.name,
          subject: activeGraderExam.title,
          classLevel,
          questions: activeGraderExam.questions,
          studentAnswers: studentChoiceVector
        })
      });

      const res = await response.json();
      if (res.success) {
        setGradingReport(res);
      } else {
        alert('Could not resolve AI script grading.');
      }
    } catch (e) {
      console.error(e);
      alert('Internal connection block. Reverted response feedback locally.');
    } finally {
      setIsGradingScript(false);
    }
  };

  const handleApplyGradeToReport = () => {
    if (!gradingReport || !activeGraderStudent || !activeGraderExam) return;

    const updatedStudents = classSetup.students.map(s => {
      if (s.id === graderStudentId) {
        return {
          ...s,
          termScores: {
            ...s.termScores,
            [activeGraderExam.subjectId]: {
              caScore: gradingReport.caScore,
              examScore: gradingReport.examScore,
              remark: gradingReport.teacherRemark
            }
          }
        };
      }
      return s;
    });

    saveClassSetup({
      ...classSetup,
      students: updatedStudents
    });

    alert(`Successfully compiled grades for ${activeGraderStudent.name}. Saved into report ledger!`);
    setGradingReport(null);
    setStudentChoiceVector({});
    setGraderStudentId('');
    setGraderExamId('');
  };

  // Report Card tab states
  const [selectedReportStudentId, setSelectedReportStudentId] = useState('');
  
  const activeReportStudent = useMemo(() => {
    return classSetup.students.find(s => s.id === selectedReportStudentId);
  }, [classSetup, selectedReportStudentId]);

  // Printing trigger
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans print:bg-white print:p-0">
      
      {/* Upper Brand Section (Hide during printing) */}
      <div className="bg-white rounded-3xl border border-slate-150 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs print:hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2 text-[9px] bg-indigo-50 text-indigo-700 font-extrabold rounded-md uppercase tracking-wider">
              Staff Portal Mode
            </span>
            {isPro && (
              <span className="p-1 px-2.5 text-[9px] bg-amber-500 text-white font-extrabold rounded-md uppercase tracking-wider flex items-center gap-0.5 animate-pulse">
                <Sparkles size={10} /> Pro School
              </span>
            )}
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">
            Teacher Classroom Administrator
          </h2>
          <p className="text-xs text-slate-400">
            School: <strong className="text-slate-658">{user.schoolName || 'Livingstone Educational Academy'}</strong> | Active Class: <strong className="text-indigo-600">{classLevel}</strong>
          </p>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToHome}
            className="px-4 py-2 border border-slate-205 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Back to Dashboard
          </button>
          {!isPro && (
            <button
              onClick={onPaymentTrigger}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1 shadow-md shadow-amber-500/10 cursor-pointer text-center"
            >
              <Sparkles size={11} className="shrink-0" />
              <span>Upgrade to Pro (₦5,000)</span>
            </button>
          )}
        </div>
      </div>

      {/* Classroom Setup Selector Header (Hide during printing) */}
      <div className="bg-slate-100/50 p-1.5 rounded-2xl flex flex-wrap gap-1.5 border border-slate-200/50 print:hidden">
        <button
          onClick={() => setActiveSubTab('roster')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'roster' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:bg-slate-200/50'
          }`}
        >
          <Users size={14} />
          Student Roster ({classSetup.students.length})
        </button>
        <button
          onClick={() => setActiveSubTab('attendance')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'attendance' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:bg-slate-200/50'
          }`}
        >
          <CheckSquare size={14} />
          Attendance Ledger
        </button>
        <button
          onClick={() => setActiveSubTab('exam-maker')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'exam-maker' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:bg-slate-200/50'
          }`}
        >
          <BrainCircuit size={14} />
          AI Exam Architect
        </button>
        <button
          onClick={() => setActiveSubTab('grader')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'grader' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:bg-slate-200/50'
          }`}
        >
          <Award size={14} />
          AI Script Grader & Mark Entry
        </button>
        <button
          onClick={() => setActiveSubTab('reports')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'reports' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:bg-slate-200/50'
          }`}
        >
          <Printer size={14} />
          Report Card Section
        </button>
        <button
          onClick={() => setActiveSubTab('lesson-notes')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'lesson-notes' ? 'bg-white text-slate-900 shadow-xs border border-indigo-200 bg-indigo-50/10' : 'text-indigo-650 hover:bg-indigo-50 bg-indigo-50/20 border border-indigo-200/30'
          }`}
        >
          <BookOpen size={14} className="text-indigo-600 animate-pulse" />
          NERDC Lesson Note Writer
        </button>
      </div>

      {/* Subtab Content Panels */}

      {/* 1. ROSTER MANAGER */}
      {activeSubTab === 'roster' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
          
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-150 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                  <UserCheck size={16} className="text-indigo-600" />
                  Roster of Students - {classLevel}
                </h3>
                <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded-lg">
                  {classSetup.students.length} Students Total
                </span>
              </div>

              {classSetup.students.length === 0 ? (
                <div className="py-12 text-center space-y-4 max-w-sm mx-auto">
                  <div className="p-3 bg-indigo-50 text-indigo-650 inline-flex rounded-full">
                    <Users size={28} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Your student roster is currently empty</h4>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Add students below manually or select "Bootstrap Demo Class" to load active preset test students quickly.
                    </p>
                  </div>
                  <button
                    onClick={handleBootstrapDemo}
                    className="p-2 w-full text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold rounded-xl transition shrink-0 cursor-pointer"
                  >
                    🚀 Auto Bootstrap Demo Class Setup
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">
                        <th className="py-3 px-2">Student Name</th>
                        <th className="py-3 px-2">School Email Address</th>
                        <th className="py-3 px-2 text-center">Attendance %</th>
                        <th className="py-3 px-2 text-center">Subjects Graded</th>
                        <th className="py-3 px-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
                      {classSetup.students.map((student) => {
                        // Calculate attendance %
                        const totalDays = 12;
                        const presentCount = Object.values(student.attendance).filter(Boolean).length;
                        const attPct = Math.round((presentCount / totalDays) * 100);

                        return (
                          <tr key={student.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3 px-2 font-bold text-slate-850 flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex items-center justify-center text-[7px] text-white"></span>
                              {student.name}
                            </td>
                            <td className="py-3 px-2 font-mono text-[10.5px] text-slate-450">{student.email}</td>
                            <td className="py-3 px-2 text-center">
                              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                attPct >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {attPct}%
                              </span>
                            </td>
                            <td className="py-3 px-2 text-center font-bold">
                              {Object.keys(student.termScores).length}
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditStudentSelect(student)}
                                  className={`p-1.5 rounded-lg transition-all ${
                                    editingStudentId === student.id
                                      ? 'bg-blue-105 text-blue-700 font-bold border border-blue-200'
                                      : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100'
                                  }`}
                                  title="Edit Student Profile"
                                >
                                  <Edit size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStudent(student.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition hover:bg-slate-100"
                                  title="Delete Student"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Add Student Control Panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-xs space-y-4">
              <h3 className="font-black text-slate-800 text-sm">
                {editingStudentId ? 'Edit Student Profile' : 'Add New Student'}
              </h3>
              
              <form onSubmit={handleAddStudent} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Student Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amina Musa"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-600 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="Auto-generated if left blank"
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-600 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-2">
                  <button
                    type="submit"
                    className={`w-full py-2.5 text-white font-black rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      editingStudentId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-650 hover:bg-indigo-700'
                    }`}
                  >
                    <Save size={14} />
                    <span>{editingStudentId ? 'Save Changes' : 'Save Student'}</span>
                  </button>

                  {editingStudentId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingStudentId(null);
                        setNewStudentName('');
                        setNewStudentEmail('');
                      }}
                      className="w-full py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold rounded-xl text-xs transition cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>

              {classSetup.students.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => saveClassSetup({ ...classSetup, students: [] })}
                    className="w-full py-2 border border-rose-250 hover:bg-rose-50 text-rose-600 font-extrabold rounded-xl text-xs transition cursor-pointer"
                  >
                    Clear Student List
                  </button>
                </div>
              )}
            </div>

            {/* Select class level admin */}
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-2">
              <span className="text-[9px] text-indigo-750 uppercase font-black tracking-widest block">Class Configuration</span>
              <p className="text-[10px] text-slate-405">
                Set the active grade level for your teaching plan. This shifts what subjects are available of setting.
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {['SS 1', 'SS 2', 'SS 3'].map((item) => (
                  <button
                    key={item}
                    onClick={() => { setClassLevel(item as ClassLevel); saveClassSetup({ ...classSetup, classLevel: item as ClassLevel }); }}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-bold transition ${
                      classLevel === item ? 'bg-indigo-600 border-indigo-650 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 2. ATTENDANCE Matrix Ledger */}
      {activeSubTab === 'attendance' && (
        <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-xs space-y-4 print:hidden">
          <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-black text-slate-800 text-sm">Attendance Monitoring Spreadsheet</h3>
              <p className="text-[10px] text-slate-400">Class: {classLevel} | Track individual weeks 1 through 12 attendance rates</p>
            </div>
            
            {/* Week Selector Tab Slider */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
              <span className="text-[10px] font-black uppercase text-slate-400 shrink-0">Select Week:</span>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((wk) => (
                <button
                  key={wk}
                  onClick={() => setSelectedAttendanceWeek(wk)}
                  className={`px-2 py-1 rounded-lg text-xs font-extrabold ${
                    selectedAttendanceWeek === wk ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-205'
                  }`}
                >
                  W{wk}
                </button>
              ))}
            </div>
          </div>

          {classSetup.students.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Configure your Student Roster tab first before logging attendance entries.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100 flex items-center justify-between">
                <span className="text-[11px] text-indigo-900 font-bold">
                  Marking Attendance sheet: <strong className="text-indigo-705">Week {selectedAttendanceWeek}</strong>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Total Present: {classSetup.students.filter(s => s.attendance[selectedAttendanceWeek]).length} / {classSetup.students.length} students
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase">
                      <th className="py-2.5 px-2">Student Name</th>
                      <th className="py-2.5 px-2 text-center">W{selectedAttendanceWeek} Status</th>
                      <th className="py-2.5 px-2 text-center">Historical Attendance Ledgers (Weeks 1 - 12)</th>
                      <th className="py-2.5 px-2 text-right">Aggregate %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {classSetup.students.map((student) => {
                      const isPresent = !!student.attendance[selectedAttendanceWeek];
                      const presentCount = Object.values(student.attendance).filter(Boolean).length;
                      const aggregatePct = Math.round((presentCount / 12) * 100);

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/50 transition duration-75">
                          <td className="py-3 px-2 font-bold text-slate-800">{student.name}</td>
                          <td className="py-3 px-2 text-center">
                            <button
                              onClick={() => handleToggleAttendance(student.id, selectedAttendanceWeek)}
                              className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center border cursor-pointer transition ${
                                isPresent 
                                  ? 'bg-emerald-500 border-emerald-600 text-white shadow-xs' 
                                  : 'bg-white border-slate-200 text-slate-300 hover:border-rose-400 hover:bg-rose-50'
                              }`}
                            >
                              <Check size={14} className={isPresent ? 'block' : 'hidden'} />
                            </button>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <div className="flex gap-1 items-center justify-center">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((wk) => {
                                const activeWeekCheck = !!student.attendance[wk];
                                return (
                                  <div
                                    key={wk}
                                    title={`Week ${wk}: ${activeWeekCheck ? 'Present' : 'Absent'}`}
                                    className={`w-2.5 h-4.5 rounded-xs transition ${
                                      activeWeekCheck ? 'bg-emerald-500' : 'bg-slate-200'
                                    }`}
                                  ></div>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right font-black">
                            <span className={aggregatePct >= 80 ? 'text-emerald-600' : aggregatePct >= 50 ? 'text-amber-653' : 'text-rose-600'}>
                              {aggregatePct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. AI EXAM ARCHITECT */}
      {activeSubTab === 'exam-maker' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
          
          {/* Controls form */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <BrainCircuit className="text-indigo-600 h-5 w-5" />
                <h3 className="font-extrabold text-slate-800 text-sm">AI Blueprint Generator</h3>
              </div>
              <p className="text-[11px] text-slate-450 leading-relaxed">
                Provide custom parameters. The Livingstone AI Engine will formulate high-quality curriculum exam papers directly matching NERDC standards.
              </p>

              {/* Subject config */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Course Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-600 bg-white"
                  >
                    {classSubjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Syllabus Term</label>
                  <select
                    value={examTermConstraint}
                    onChange={(e: any) => setExamTermConstraint(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="1st Term">1st Term Examination</option>
                    <option value="2nd Term">2nd Term Examination</option>
                    <option value="3rd Term">3rd Term Examination</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Number of Questions</label>
                  <input
                    type="number"
                    min={3}
                    max={20}
                    value={examQuestionsCount}
                    onChange={(e) => setExamQuestionsCount(parseInt(e.target.value) || 5)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-600 bg-white"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">Recommended: 5 to 10 for continuous assessments</p>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Focus Topics / Chapters (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Wave motion, Surds, organic hydrocarbons, demand mechanics..."
                    value={examTopicConstraint}
                    onChange={(e) => setExamTopicConstraint(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-600 bg-white text-left placeholder:text-slate-350"
                  />
                </div>

                {isGeneratingExam ? (
                  <div className="p-3 bg-indigo-50 border border-indigo-110 rounded-xl flex items-center justify-center gap-2">
                    <Loader2 size={16} className="text-indigo-650 animate-spin shrink-0" />
                    <span className="text-[11px] font-black text-indigo-805 animate-pulse">Consulting AI Curriculum Database ...</span>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateExamAI}
                    className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-705 hover:to-blue-705 text-white font-black rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10"
                  >
                    <BrainCircuit size={14} />
                    Generate Exam via AI
                  </button>
                )}
              </div>
            </div>

            {/* List of generated papers */}
            <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-xs space-y-3">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center justify-between">
                <span>Active Exam Bank</span>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">{savedExams.length} Saved</span>
              </h3>

              {savedExams.length === 0 ? (
                <p className="text-[10px] text-slate-400">Generate and save exam blueprints to load student response vectors or use them instantly.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {savedExams.map((ex) => (
                    <div key={ex.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 relative group">
                      <button
                        onClick={() => handleDeleteExam(ex.id)}
                        className="absolute right-2 top-2 text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 size={12} />
                      </button>
                      <h4 className="text-[11px] font-black text-slate-800 pr-5 truncate">{ex.title}</h4>
                      <p className="text-[9px] text-slate-400 mt-1">Class: {ex.classLevel} | {ex.questions.length} Items</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Core Display preview area */}
          <div className="lg:col-span-2">
            {previewExam ? (
              <div className="bg-white rounded-3xl border border-blue-200 p-6 shadow-md space-y-6 animate-scale-in">
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-slate-800 text-sm">{previewExam.title}</h3>
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">AI Generated Document Preview & Validations</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPreviewExam(null)}
                      className="px-3 py-1.5 border border-slate-200 text-slate-500 font-bold rounded-lg text-[11px] hover:bg-slate-50 transition cursor-pointer"
                    >
                      Regenerate
                    </button>
                    <button
                      onClick={handleSaveExam}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-750 text-white font-black rounded-lg text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Check size={12} />
                      Save Exam to Portal
                    </button>
                  </div>
                </div>

                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                  {previewExam.questions.map((q, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2 text-xs">
                      <p className="font-black text-slate-800">
                        Question {idx + 1}: {q.question}
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pl-2">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect = oIdx === q.correctIndex;
                          return (
                            <div 
                              key={oIdx} 
                              className={`p-2 rounded-xl border flex items-center gap-2 ${
                                isCorrect 
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' 
                                  : 'bg-white border-slate-100 text-slate-600'
                              }`}
                            >
                              <span className="w-5 h-5 rounded-full bg-slate-100 text-[10px] font-black flex items-center justify-center border shrink-0">
                                {oIdx === 0 && 'A'}
                                {oIdx === 1 && 'B'}
                                {oIdx === 2 && 'C'}
                                {oIdx === 3 && 'D'}
                              </span>
                              <span className="truncate">{opt}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-blue-50/40 p-2.5 rounded-xl border border-blue-50 text-[10px] text-blue-800 leading-relaxed pl-3 font-semibold mt-2.5">
                        <strong className="text-blue-900">Teaching Rationale:</strong> {q.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-150 p-12 text-center text-slate-400 space-y-3 shadow-xs">
                <BrainCircuit className="mx-auto h-12 w-12 text-indigo-100" />
                <h3 className="font-black text-slate-700 text-sm">Portals Exam Viewport Ready</h3>
                <p className="text-xs max-w-sm mx-auto text-slate-400">
                  Select parameters or focus chapters to draft specialized test grids using Gemini's NERDC curriculum models.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 4. AI GRADER AND SCRIPTS COMPILING */}
      {activeSubTab === 'grader' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
          
          {/* Roster & Script Selector forms */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-xs space-y-4">
              <h3 className="font-black text-slate-800 text-sm">Select Student & Exam script</h3>
              
              <div className="space-y-3 pt-2 text-xs">
                {/* Select student */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Student</label>
                  <select
                    value={graderStudentId}
                    onChange={(e) => { setGraderStudentId(e.target.value); setGradingReport(null); }}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="">-- Choose Student --</option>
                    {classSetup.students.map((st) => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                </div>

                {/* Select exam */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Exam Paper</label>
                  <select
                    value={graderExamId}
                    onChange={(e) => { setGraderExamId(e.target.value); setGradingReport(null); }}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="">-- Choose Exam Script --</option>
                    {savedExams.map((ex) => (
                      <option key={ex.id} value={ex.id}>{ex.title}</option>
                    ))}
                  </select>
                </div>

                {activeGraderExam && (
                  <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-110 text-[10px] space-y-2">
                    <p className="font-bold text-indigo-900 uppercase">Input Response Sheet Vector</p>
                    <p className="text-slate-500 leading-none">Complete or Mock the student's selected answer choice for every item:</p>
                    
                    <button
                      type="button"
                      onClick={handleRandomizeStudentResp}
                      className="w-full py-1.5 bg-white border border-indigo-200 hover:bg-slate-50 text-indigo-750 font-bold rounded-lg text-[10px] transition cursor-pointer"
                    >
                      ⚡ Mock / Randomize Response Options
                    </button>
                  </div>
                )}

                {activeGraderExam && (
                  <button
                    onClick={handleGradeWithAI}
                    disabled={isGradingScript || !graderStudentId || !graderExamId}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-750 text-white font-black rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isGradingScript ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Grading Script via AI ...</span>
                      </>
                    ) : (
                      <>
                        <BrainCircuit size={14} />
                        Grade Student Answers
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Grading Output Display Panel */}
          <div className="lg:col-span-2">
            {gradingReport ? (
              <div className="bg-white rounded-3xl border border-emerald-500/30 p-6 shadow-md space-y-6 animate-scale-in">
                
                {/* Grading header summary card */}
                <div className="bg-gradient-to-r from-emerald-600 to-indigo-700 p-6 rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="p-0.5 px-2 bg-white/20 text-[9px] font-extrabold uppercase rounded-lg tracking-wider">
                      Grade Report Compiled
                    </span>
                    <h3 className="font-black text-lg leading-tight">{activeGraderStudent?.name}</h3>
                    <p className="text-xs text-indigo-100 pr-2">Paper: {activeGraderExam?.title} ({activeGraderExam?.classLevel})</p>
                  </div>

                  {/* Visual grade bubble */}
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white text-indigo-900 flex items-center justify-center text-2xl font-black shadow-inner">
                        {gradingReport.letterGrade}
                      </div>
                      <p className="text-[10px] font-extrabold text-indigo-50 mt-1 uppercase">WASSCE Code</p>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-300" />
                        Continuous Assessment: <span className="font-black">{gradingReport.caScore} / 40</span>
                      </p>
                      <p className="font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-300" />
                        Exam Component: <span className="font-black">{gradingReport.examScore} / 60</span>
                      </p>
                      <p className="font-black text-[13px] border-t border-white/20 pt-1 text-emerald-300">
                        Aggregate Average: {gradingReport.scoreOutOf100}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cognitive remarks & AI Feedback */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                    <h4 className="font-extrabold text-slate-800 uppercase text-[10px] text-indigo-730">Curriculum Strengths</h4>
                    <ul className="space-y-1 text-slate-600 pl-3 list-disc">
                      {gradingReport.aiStrengths?.map((str: string, index: number) => (
                        <li key={index}>{str}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                    <h4 className="font-extrabold text-slate-800 uppercase text-[10px] text-rose-700">Developmental Areas</h4>
                    <ul className="space-y-1 text-slate-600 pl-3 list-disc">
                      {gradingReport.aiWeaknesses?.map((weak: string, index: number) => (
                        <li key={index}>{weak}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Teachers feedback review */}
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-105 space-y-1.5 text-xs">
                  <h4 className="font-extrabold text-blue-900 uppercase text-[10px]">Academic Teacher's Remark</h4>
                  <p className="text-blue-950 font-bold leading-relaxed">
                    "{gradingReport.teacherRemark}"
                  </p>
                </div>

                {/* Confirm Apply controls */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setGradingReport(null)}
                    className="p-2 px-4 border border-slate-205 text-slate-500 font-extrabold rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Reset Grader
                  </button>
                  <button
                    onClick={handleApplyGradeToReport}
                    className="p-2.5 px-5 bg-indigo-650 hover:bg-indigo-750 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/10 cursor-pointer"
                  >
                    <CheckCircle2 size={13} />
                    Apply Grade to Report Card
                  </button>
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-150 p-12 text-center text-slate-400 space-y-3 shadow-xs">
                <BrainCircuit className="mx-auto h-12 w-12 text-indigo-50" />
                <h3 className="font-black text-slate-705 text-sm">Awaiting Script Entry Log</h3>
                <p className="text-xs max-w-sm mx-auto text-slate-400">
                  Select a student profile and an exam from your Saved Exams database. Feed student answers to generate automated reports.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 5. PRINT REPORTS SECTION (REPORT CARD DESIGN) */}
      {activeSubTab === 'reports' && (
        <div className="space-y-6">
          
          {/* Header controls (Hidden during print) */}
          <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
            <div className="space-y-1">
              <h3 className="font-black text-slate-800 text-sm">Official Livingstone Report Master</h3>
              <p className="text-[10px] text-slate-400">Preview any student's composite grade sheet, continuous assessment index, and trigger PDF printout</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedReportStudentId}
                onChange={(e) => setSelectedReportStudentId(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-600 bg-white"
              >
                <option value="">-- Select Student to view Report --</option>
                {classSetup.students.map((st) => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </select>

              {activeReportStudent && (
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-indigo-500/10 cursor-pointer"
                >
                  <Printer size={13} />
                  Print Report Card
                </button>
              )}
            </div>
          </div>

          {/* Active Printable Report block */}
          {activeReportStudent ? (
            <div className="bg-white border-2 border-slate-900 rounded-2xl max-w-3xl mx-auto p-8 shadow-2xl relative space-y-6 font-serif print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-full">
              
              {/* Official Nigeria Ministry Header block */}
              <div className="text-center space-y-1 pb-4 border-b-2 border-dashed border-slate-900 relative">
                <span className="absolute left-4 top-4 text-slate-200 font-sans font-black text-2xl print:hidden">OFFICIAL COPY</span>
                <span className="p-1 px-3 text-[10px] text-emerald-800 bg-emerald-50 rounded-full font-sans font-black uppercase tracking-widest border border-emerald-500/50">
                  Livingston Educational Academy Lagos
                </span>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none mt-1">LIVINGSTONEEDU TERM REPORT CARD</h1>
                <p className="text-[11px] font-sans font-extrabold text-slate-600 uppercase tracking-widest">MINISTRY OF EDUCATION NATIONAL INTEGRAL SYLLABUS RECORD</p>
                <p className="text-[10px] font-sans text-slate-450">Lagos State District Authority, Federal Republic of Nigeria</p>
              </div>

              {/* Bio Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-sans text-[11px] font-bold text-slate-600 border-b pb-4">
                <div>
                  <p className="text-slate-400 uppercase text-[9px] font-extrabold">Student Name</p>
                  <p className="text-slate-900 font-extrabold text-[12px]">{activeReportStudent.name}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase text-[9px] font-extrabold">Class Assigned</p>
                  <p className="text-slate-900 font-extrabold text-[12px]">{classLevel}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase text-[9px] font-extrabold">Academic Term</p>
                  <p className="text-slate-900 font-extrabold text-[12px]">3rd Term Comprehensive</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase text-[9px] font-extrabold">Attendance Ratio</p>
                  <p className="text-slate-900 font-extrabold text-[12px]">
                    {Object.values(activeReportStudent.attendance).filter(Boolean).length} of 12 classes Present
                  </p>
                </div>
              </div>

              {/* Cognitive Academic Records Table */}
              <div className="space-y-2">
                <h3 className="font-sans font-black uppercase text-slate-900 text-xs tracking-wider">I. Cognitive Academic Records Table</h3>
                <div className="border border-slate-900 rounded-lg overflow-hidden">
                  <table className="w-full text-left font-sans text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 font-black border-b border-slate-900">
                        <th className="py-2.5 px-3 border-r border-slate-900">Subject Name</th>
                        <th className="py-2.5 px-3 text-center border-r border-slate-900">CA Score (40)</th>
                        <th className="py-2.5 px-3 text-center border-r border-slate-900">Exam Mark (60)</th>
                        <th className="py-2.5 px-3 text-center border-r border-slate-900">Total (100)</th>
                        <th className="py-2.5 px-3 text-center border-r border-slate-900">Grade Letter</th>
                        <th className="py-2.5 px-3">Weekly Teacher's Comments / Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-350 font-semibold text-slate-700">
                      {classSubjects.map((subject) => {
                        const scoreData = activeReportStudent.termScores[subject.id] || {
                          caScore: 0,
                          examScore: 0,
                          remark: 'No examination record logged in the active portal term.'
                        };

                        const total = scoreData.caScore + scoreData.examScore;
                        let letterGrade = 'F9';
                        if (total >= 85) letterGrade = 'A1';
                        else if (total >= 75) letterGrade = 'B2';
                        else if (total >= 65) letterGrade = 'C4';
                        else if (total >= 50) letterGrade = 'C6';
                        else if (total >= 40) letterGrade = 'D7';
                        else if (total > 0) letterGrade = 'E8';

                        return (
                          <tr key={subject.id} className="hover:bg-slate-50/40">
                            <td className="py-2.5 px-3 font-extrabold text-slate-920 border-r border-slate-900">{subject.name}</td>
                            <td className="py-2.5 px-3 text-center border-r border-slate-900 font-mono">{scoreData.caScore || '-'}</td>
                            <td className="py-2.5 px-3 text-center border-r border-slate-900 font-mono">{scoreData.examScore || '-'}</td>
                            <td className="py-2.5 px-3 text-center border-r border-slate-900 font-black text-slate-900 font-mono">
                              {total || '-'}
                            </td>
                            <td className="py-2.5 px-3 text-center border-r border-slate-900 font-black font-sans text-indigo-700 bg-slate-50">
                              {total > 0 ? letterGrade : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-550 leading-tight italic max-w-xs truncate" title={scoreData.remark}>
                              {scoreData.remark}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Behavior & Psychomotor / Affective Domain */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 font-sans text-[11px] font-semibold text-slate-700">
                
                {/* Behavioral Grades */}
                <div className="space-y-2 border border-slate-400 p-4 rounded-xl">
                  <h4 className="font-black uppercase text-slate-900 text-[10px] tracking-wide">II. Affective Domain Traits</h4>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span>Punctuality / Attendance</span>
                      <strong className="text-emerald-700 font-bold bg-emerald-50 px-2 rounded">Excellent (A)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Neatness / Personal Hygiene</span>
                      <strong className="text-emerald-700 font-bold bg-emerald-50 px-2 rounded">Excellent (A)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Politeness & Social Cooperation</span>
                      <strong className="text-emerald-700 font-bold bg-emerald-50 px-2 rounded">Very Good (B)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Leadership Potential & Integrity</span>
                      <strong className="text-emerald-700 font-bold bg-emerald-50 px-2 rounded">Very Good (B)</strong>
                    </div>
                  </div>
                </div>

                {/* Cognitive Summary metrics */}
                <div className="space-y-2 border border-slate-400 p-4 rounded-xl flex flex-col justify-between">
                  <div>
                    <h4 className="font-black uppercase text-slate-900 text-[10px] tracking-wide">III. Academic Term Conclusion</h4>
                    <p className="text-[10px] text-slate-405 leading-relaxed mt-1">
                      Grading aligns perfectly with national BECE/WAEC/NECO directives. Minimum continuous credit points require total CA average score &gt; 50% across math and language core elements.
                    </p>
                  </div>

                  <div className="pt-2 border-t flex justify-between font-bold items-baseline">
                    <span className="text-[10px] text-slate-400 uppercase">Term Class Position</span>
                    <span className="text-slate-900 font-extrabold text-[14px]">Promotion Recommended</span>
                  </div>
                </div>

              </div>

              {/* Custom Signature lines */}
              <div className="grid grid-cols-2 gap-6 pt-10 border-t border-dashed border-slate-900 font-sans text-[10px] font-extrabold uppercase text-slate-600 text-center">
                <div className="space-y-6">
                  <div className="mx-auto w-40 border-b border-indigo-900/60 h-8 font-serif italic text-indigo-700 flex items-center justify-center text-xs">
                    {user.fullName}
                  </div>
                  <p>CLASS TEACHER SIGNATURE</p>
                </div>
                <div className="space-y-6">
                  <div className="mx-auto w-40 border-b border-indigo-900/60 h-8 font-serif italic text-emerald-700 flex items-center justify-center text-xs">
                    Dr. J. A. Livingstone
                  </div>
                  <p>PRINCIPAL SEAL & SIGNATURE</p>
                </div>
              </div>

              {/* Print Only Styles block inside the component */}
              <style dangerouslySetInnerHTML={{__html: `
                @media print {
                  body {
                    background: white !important;
                    color: black !important;
                  }
                  .print\\:hidden {
                    display: none !important;
                  }
                  .print\\:border-none {
                    border: none !important;
                  }
                  .print\\:shadow-none {
                    box-shadow: none !important;
                  }
                  .print\\:p-0 {
                    padding: 0 !important;
                  }
                  .print\\:m-0 {
                    margin: 0 !important;
                  }
                  .print\\:max-w-full {
                    max-width: 100% !important;
                  }
                }
              `}} />

            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-150 p-12 text-center text-slate-400 space-y-3 shadow-xs">
              <Printer className="mx-auto h-12 w-12 text-slate-100" />
              <h3 className="font-black text-slate-708 text-sm">Awaiting Report Query</h3>
              <p className="text-xs max-w-sm mx-auto text-slate-400">
                Please select any student profile from the drop-down menu above to compile their official NERDC 3rd Term report list.
              </p>
            </div>
          )}

        </div>
      )}

      {/* 6. NERDC LESSON NOTES GENERATOR */}
      {activeSubTab === 'lesson-notes' && (
        <div className="space-y-6">
          {/* Main Container Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Options Panel Sidebar */}
            <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm space-y-4 h-fit print:hidden">
              <div className="border-b pb-3">
                <span className="text-[9px] bg-indigo-100 text-indigo-700 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  NERDC Educational Planner
                </span>
                <h3 className="font-sans font-black text-slate-800 text-sm mt-1">Lesson Parameters</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Customize your curriculum alignment term planning</p>
              </div>

              {/* Class Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-600 uppercase tracking-tight">Academic Student Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:border-indigo-600 outline-none bg-slate-50/50"
                >
                  {CLASSES_LIST.map((cl) => (
                    <option key={cl} value={cl}>{cl}</option>
                  ))}
                </select>
              </div>

              {/* Subject Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-600 uppercase tracking-tight">Syllabus Subject Field</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:border-indigo-600 outline-none bg-slate-50/50"
                >
                  {SUBJECTS_LIST.map((subj) => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>

              {/* Term Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-600 uppercase tracking-tight">Active Academic Term</label>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:border-indigo-600 outline-none bg-slate-50/50"
                >
                  <option value="1st Term">1st Term (Autumn Session)</option>
                  <option value="2nd Term">2nd Term (Winter Session)</option>
                  <option value="3rd Term">3rd Term (Promotional Session)</option>
                </select>
              </div>

              {/* Week Selector */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-tight">Syllabus Week</label>
                  <span className="text-[10px] text-indigo-650 font-bold">Week {selectedWeek} of 12</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                  <span>W1</span>
                  <span>W3</span>
                  <span>W6</span>
                  <span>W9</span>
                  <span>W12</span>
                </div>
              </div>

              {/* Custom Guidance Subject Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-600 uppercase tracking-tight flex items-center justify-between">
                  <span>Specific Topic / Focus Area</span>
                  <span className="text-[8px] text-slate-400 uppercase">Optional</span>
                </label>
                <textarea
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. Simultaneous Equations, Letter Writing structure, Crop Rotation benefits, Civic Duties..."
                  rows={3}
                  className="w-full border border-slate-205 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:border-indigo-600 focus:bg-white outline-none bg-slate-50/50"
                />
              </div>

              {/* End of Term toggle switch */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="chkEndOfTerm"
                  checked={isEndOfTerm}
                  onChange={(e) => setIsEndOfTerm(e.target.checked)}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-amber-300 rounded cursor-pointer"
                />
                <label htmlFor="chkEndOfTerm" className="flex-grow select-none cursor-pointer">
                  <p className="text-[11px] font-black text-amber-900 leading-tight">Generate End-of-Term Suite</p>
                  <p className="text-[9px] text-amber-700 leading-snug">Includes 15 MCQs, 5 Theory questions, practical exams & full syllabus outline.</p>
                </label>
              </div>

              {/* Error Status Indicator */}
              {noteError && (
                <div className="p-3 bg-red-50 text-red-700 text-[10px] font-semibold rounded-xl border border-red-200 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-650 rounded-full shrink-0" />
                  <span>{noteError}</span>
                </div>
              )}

              {/* Trigger Button */}
              <button
                type="button"
                onClick={handleGenerateLessonNote}
                disabled={isGeneratingNote}
                className="w-full py-3 bg-indigo-650 hover:bg-indigo-755 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isGeneratingNote ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-white" />
                    <span>Planning Curriculum & Notes...</span>
                  </>
                ) : (
                  <>
                    <BrainCircuit size={14} />
                    <span>Generate Complete Lesson Note</span>
                  </>
                )}
              </button>
            </div>

            {/* Rendered Lesson Card Section */}
            <div className="col-span-1 lg:col-span-2 space-y-6">
              
              {isGeneratingNote && (
                <div className="bg-white rounded-3xl border border-slate-150 p-20 text-center space-y-4 shadow-sm animate-fade-in">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 border-4 border-indigo-200 rounded-full" />
                    <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-sans font-black text-slate-800 text-sm">Drafting National Lesson Scheme</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Formulating lesson guides aligned with standard **Federal Ministry of Education (NERDC) Guidelines**, curriculum benchmarks, and grading criteria...
                    </p>
                  </div>
                  <div className="pt-2 flex justify-center gap-2 text-[9px] text-indigo-650 font-black tracking-widest uppercase">
                    <span>Objectives</span>
                    <span>&bull;</span>
                    <span>Explanation steps</span>
                    <span>&bull;</span>
                    <span>Interactive Grading Key</span>
                  </div>
                </div>
              )}

              {generatedNote ? (
                <div className="space-y-4">
                  {/* Action row */}
                  <div className="bg-white rounded-2xl border border-slate-150 p-4 shadow-sm flex justify-between items-center print:hidden">
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.print()}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                      >
                        <Printer size={13} />
                        Print Note Sheet
                      </button>
                      <button
                        onClick={handleCopyNoteToClipboard}
                        className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Download size={13} />
                        Copy Raw Text
                      </button>
                    </div>

                    <div className="text-[10px] text-slate-400 font-semibold italic flex items-center gap-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                      <span>Syllabus Aligned Copy Ready</span>
                    </div>
                  </div>

                  {/* Document Card */}
                  <div className="bg-white rounded-3xl border border-slate-155 shadow-sm overflow-hidden print:border-none print:shadow-none">
                    
                    {/* Visual Stamp Card Header */}
                    <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-6 text-white space-y-4 print:bg-white print:text-black print:border-b-2 print:border-slate-800">
                      <div className="flex justify-between items-start">
                        <span className="p-1 px-3 text-[9px] bg-indigo-500/20 uppercase tracking-widest font-black rounded-full border border-indigo-500/30 print:border-slate-400 print:text-black">
                          NERDC Curriculum lesson guide
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-300 print:text-black">
                          DURATION: {generatedNote.duration || '40 Mins'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h2 className="text-xl font-black tracking-tight leading-none text-white font-sans uppercase print:text-black">
                          {generatedNote.topic || 'Subject Foundation Elements'}
                        </h2>
                        <p className="text-xs text-indigo-200 font-bold print:text-slate-800">
                          {generatedNote.subtopic || 'General Outline'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-indigo-800/50 text-[10px] font-bold text-indigo-150 print:border-slate-700 print:text-slate-800">
                        <div>
                          <p className="text-slate-400 uppercase text-[8px]">Class Level</p>
                          <p className="font-extrabold text-white print:text-black">{generatedNote.classLevel || selectedClass}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase text-[8px]">Academic Term</p>
                          <p className="font-extrabold text-white print:text-black">{selectedTerm}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase text-[8px]">Syllabus Week</p>
                          <p className="font-extrabold text-white print:text-black">Week {selectedWeek}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase text-[8px]">Subject Field</p>
                          <p className="font-extrabold text-white print:text-black">{selectedSubject}</p>
                        </div>
                      </div>
                    </div>

                    {/* Lesson Navigation Header Tabs Inside Note */}
                    <div className="flex border-b border-slate-100 bg-slate-50/50 p-1.5 gap-1 print:hidden">
                      <button
                        onClick={() => setLessonSubTab('blueprint')}
                        className={`flex-grow md:flex-none px-4 py-2 text-[11px] font-extrabold rounded-xl transition ${
                          lessonSubTab === 'blueprint' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:bg-slate-200/40'
                        }`}
                      >
                        📊 Blueprint Design
                      </button>
                      <button
                        onClick={() => setLessonSubTab('narrative')}
                        className={`flex-grow md:flex-none px-4 py-2 text-[11px] font-extrabold rounded-xl transition ${
                          lessonSubTab === 'narrative' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:bg-slate-200/40'
                        }`}
                      >
                        📖 Narrative Lesson Note
                      </button>
                      <button
                        onClick={() => setLessonSubTab('activities')}
                        className={`flex-grow md:flex-none px-4 py-2 text-[11px] font-extrabold rounded-xl transition ${
                          lessonSubTab === 'activities' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:bg-slate-200/40'
                        }`}
                      >
                        🧪 Activities & Duties
                      </button>
                      <button
                        onClick={() => setLessonSubTab('assessment')}
                        className={`flex-grow md:flex-none px-4 py-2 text-[11px] font-extrabold rounded-xl transition ${
                          lessonSubTab === 'assessment' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:bg-slate-200/40'
                        }`}
                      >
                        ❓ Interactive Exam Room
                      </button>
                    </div>

                    {/* Inner rendering content grids */}
                    <div className="p-6 md:p-8 space-y-6">

                      {/* 1. BLUEPRINT SECTION */}
                      {(lessonSubTab === 'blueprint' || window.matchMedia('print').matches) && (
                        <div className={`space-y-6 ${lessonSubTab !== 'blueprint' ? 'hidden print:block' : ''}`}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Objectives Card */}
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3 print:bg-white print:border-none print:p-0">
                              <h4 className="text-xs font-black uppercase text-indigo-950 tracking-wider flex items-center gap-1.5 border-b pb-2">
                                <span className="w-1.5 h-1.5 bg-indigo-650 rounded-full" />
                                Interactive Objectives ({generatedNote.objectives?.length || 0})
                              </h4>
                              <ul className="space-y-2.5">
                                {generatedNote.objectives?.map((obj: string, i: number) => (
                                  <li key={i} className="text-xs font-serif text-slate-705 leading-relaxed flex gap-2">
                                    <span className="font-bold text-indigo-600 font-sans">{i + 1}.</span>
                                    <span>{obj}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Teaching Aids & Vocabs */}
                            <div className="space-y-4">
                              
                              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3 print:bg-white print:border-none print:p-0">
                                <h4 className="text-xs font-black uppercase text-indigo-950 tracking-wider flex items-center gap-1.5 border-b pb-2">
                                  <span className="w-1.5 h-1.5 bg-indigo-650 rounded-full" />
                                  Essential teaching resources
                                </h4>
                                <ul className="space-y-1.5">
                                  {generatedNote.teachingMaterials?.map((mat: string, i: number) => (
                                    <li key={i} className="text-[11px] text-slate-658 flex items-baseline gap-1.5">
                                      <span className="text-emerald-555 font-bold">&bull;</span>
                                      <span>{mat}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3 print:bg-white print:border-none print:p-0">
                                <h4 className="text-xs font-black uppercase text-indigo-950 tracking-wider flex items-center gap-1.5 border-b pb-2">
                                  <span className="w-1.5 h-1.5 bg-indigo-650 rounded-full" />
                                  Core Key Term Vocabularies
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {generatedNote.keyVocabulary?.map((voc: string, i: number) => (
                                    <span key={i} className="px-2.5 py-1 bg-indigo-50/70 border border-indigo-100 font-black text-indigo-750 text-[10px] rounded-lg tracking-wide">
                                      🔑 {voc}
                                    </span>
                                  ))}
                                </div>
                              </div>

                            </div>

                          </div>
                          
                          {/* Subject Specific Focus block */}
                          {generatedNote.subjectSpecificFocus && (
                            <div className="p-5 rounded-2xl border-2 border-indigo-900 border-dashed bg-indigo-50/20 space-y-2">
                              <h4 className="text-xs font-black uppercase text-indigo-950 tracking-widest flex items-center gap-2">
                                🌟 Subject Specific Pedagogy Focus: {generatedNote.subjectSpecificFocus.title}
                              </h4>
                              <p className="text-xs text-slate-700 leading-relaxed font-serif">
                                {generatedNote.subjectSpecificFocus.content}
                              </p>
                              {generatedNote.subjectSpecificFocus.safeguardsOrMoralLesson && (
                                <div className="pt-2 border-t border-indigo-100 text-[10px] font-black text-indigo-800 flex items-center gap-1">
                                  <span>⚠️ ETHICAL SAFEGUARD / MORAL VALUE INSTRUCTION: </span>
                                  <span className="italic">{generatedNote.subjectSpecificFocus.safeguardsOrMoralLesson}</span>
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      )}

                      {/* 2. NARRATIVE TEXT SECTION */}
                      {(lessonSubTab === 'narrative' || window.matchMedia('print').matches) && (
                        <div className={`space-y-6 ${lessonSubTab !== 'narrative' ? 'hidden print:block' : ''}`}>
                          
                          {/* Intro Box */}
                          <div className="border-l-4 border-indigo-600 bg-indigo-50/20 p-4 font-serif text-xs italic text-indigo-900 rounded-r-xl">
                            <span className="font-extrabold uppercase text-[10px] font-sans tracking-widest text-indigo-950 block not-italic mb-1">Introduction Step</span>
                            {generatedNote.introduction}
                          </div>

                          {/* Explanation checklist steps */}
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3 print:bg-white print:border-none print:p-0">
                            <h4 className="text-xs font-black uppercase text-indigo-950 tracking-wide">Teacher explanation steps & sequence</h4>
                            <div className="space-y-2">
                              {generatedNote.teacherExplanationSteps?.map((step: string, idx: number) => (
                                <div key={idx} className="flex gap-2.5 items-start text-xs font-semibold text-slate-700 leading-relaxed">
                                  <span className="bg-indigo-650 text-white rounded-full text-[9px] font-bold w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                                    {idx + 1}
                                  </span>
                                  <span>{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Massive explanatory body */}
                          <div className="bg-white rounded-2xl border border-slate-150 p-6 md:p-8 shadow-xs border-dashed space-y-1 print:border-none print:shadow-none print:p-0">
                            <div className="flex justify-between items-center border-b pb-3 mb-4">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-800">📘 COMPLETE PEDAGOGICAL LESSON SHEET</span>
                              <span className="text-[10px] text-slate-400 font-medium">Nigerian Ministry standards</span>
                            </div>
                            <div className="prose max-w-none text-slate-800">
                              {renderFormattedMarkdown(generatedNote.detailedLessonNote)}
                            </div>
                          </div>

                        </div>
                      )}

                      {/* 3. ACTIVITIES SECTION */}
                      {(lessonSubTab === 'activities' || window.matchMedia('print').matches) && (
                        <div className={`space-y-6 ${lessonSubTab !== 'activities' ? 'hidden print:block' : ''}`}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Student Activities */}
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3 print:bg-white print:border-none print:p-0">
                              <h4 className="text-xs font-black uppercase text-indigo-950 tracking-wider border-b pb-2">Student Classroom Activities</h4>
                              <ul className="space-y-2 text-xs font-serif text-slate-700 leading-relaxed">
                                {generatedNote.studentActivities?.map((act: string, i: number) => (
                                  <li key={i} className="flex items-baseline gap-2">
                                    <span className="text-indigo-600 font-bold font-sans">&bull;</span>
                                    <span>{act}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Class exercises */}
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3  print:bg-white print:border-none print:p-0">
                              <h4 className="text-xs font-black uppercase text-indigo-950 tracking-wider border-b pb-2">Formative Class Exercises</h4>
                              <ul className="space-y-3 text-xs font-serif text-slate-700 leading-relaxed">
                                {generatedNote.classExercises?.map((ex: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="bg-emerald-650 text-white rounded-full font-sans font-bold text-[9px] w-4.5 h-4.5 flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                                    <span>{ex}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                          </div>

                          {/* Homework Box */}
                          <div className="p-5 rounded-3xl bg-amber-50/55 border border-amber-200/60 space-y-2">
                            <span className="px-2.5 py-0.5 bg-amber-200 text-amber-900 border border-amber-300 font-black text-[9px] rounded uppercase tracking-wider">
                              📚 Take-Home Homework Assignment
                            </span>
                            <p className="text-xs font-serif text-slate-755 leading-relaxed pt-1">
                              {generatedNote.homeworkAssignment}
                            </p>
                          </div>

                        </div>
                      )}

                      {/* 4. ASSESSMENT ROOM SECTION */}
                      {lessonSubTab === 'assessment' && (
                        <div className="space-y-6 print:hidden">
                          
                          {/* Instructions Header banner */}
                          <div className="bg-indigo-900 text-white p-5 rounded-2xl flex justify-between items-center">
                            <div className="space-y-1">
                              <h4 className="font-sans font-black uppercase tracking-wider text-xs">interactive class exam and evaluation room</h4>
                              <p className="text-[10px] text-indigo-200">Evaluate content retention using the instant grading keys built directly into the school portal.</p>
                            </div>
                            <button
                              onClick={() => setShowAnswerKey(!showAnswerKey)}
                              className="px-3 py-1.5 bg-white text-indigo-950 hover:bg-slate-100 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                            >
                              {showAnswerKey ? 'Hide Answer Keys' : 'Reveal Model Answers'}
                            </button>
                          </div>

                          {/* 4.1 Multiple Choice Interactive block */}
                          <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase text-indigo-950 tracking-widest border-l-2 border-indigo-650 pl-2">Segment A: Objective Questions</h4>
                            
                            <div className="space-y-4">
                              {generatedNote.quizQuestions?.map((q: any, qIdx: number) => {
                                const selectedOpt = userAnswers[qIdx];
                                const isAnswered = selectedOpt !== undefined;
                                const isCorrect = Number(selectedOpt) === Number(q.correctIndex);

                                return (
                                  <div key={qIdx} className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200 space-y-3">
                                    <p className="text-xs font-black text-slate-800">
                                      Question {qIdx + 1}: <span className="font-serif font-medium">{q.question}</span>
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {q.options?.map((opt: string, oIdx: number) => {
                                        const isThisSelected = Number(selectedOpt) === oIdx;
                                        const isThisCorrect = oIdx === Number(q.correctIndex);
                                        
                                        let btnClass = "bg-white border-slate-200 hover:bg-slate-100 text-slate-700";
                                        if (isThisSelected) {
                                          btnClass = isThisCorrect 
                                            ? "bg-emerald-100 border-emerald-500 text-emerald-990 font-black shadow-xs" 
                                            : "bg-red-100 border-red-500 text-red-990 font-black shadow-xs";
                                        } else if (showAnswerKey && isThisCorrect) {
                                          btnClass = "bg-emerald-50 border-emerald-300 border-dashed text-emerald-950 font-black";
                                        }

                                        return (
                                          <button
                                            key={oIdx}
                                            onClick={() => {
                                              if (isGeneratingNote) return;
                                              setUserAnswers({ ...userAnswers, [qIdx]: oIdx });
                                            }}
                                            className={`w-full py-2.5 px-3 rounded-xl border text-left text-xs transition flex gap-2 items-center cursor-pointer ${btnClass}`}
                                          >
                                            <span className="uppercase text-[9px] font-black text-slate-400 bg-slate-100 w-5 h-5 flex items-center justify-center rounded-md border shrink-0">
                                              {String.fromCharCode(65 + oIdx)}
                                            </span>
                                            <span className="leading-tight">{opt}</span>
                                          </button>
                                        );
                                      })}
                                    </div>

                                    {/* Action Response Feedback */}
                                    {isAnswered && (
                                      <div className={`p-3 rounded-xl text-[10px] leading-relaxed flex items-baseline gap-1.5 ${
                                        isCorrect ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'
                                      }`}>
                                        <span className="font-bold shrink-0">{isCorrect ? '✅ Correct Answer!' : '❌ Incorrect choice.'}</span>
                                        <span>{q.explanation}</span>
                                      </div>
                                    )}

                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* 4.2 Theory Segment block */}
                          <div className="space-y-4 pt-4">
                            <h4 className="text-xs font-black uppercase text-indigo-950 tracking-widest border-l-2 border-indigo-650 pl-2">Segment B: Theory Discussion Questions</h4>
                            
                            <div className="space-y-4">
                              {generatedNote.theoryQuestions?.map((t: any, idx: number) => (
                                <div key={idx} className="bg-white rounded-2xl border border-slate-205 p-5 space-y-2.5">
                                  <p className="text-xs font-bold text-indigo-950">
                                    Theory Question {idx + 1}: <span className="font-serif font-medium text-slate-800">{t.question}</span>
                                  </p>

                                  {(showAnswerKey || isGeneratingNote) && (
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 space-y-2">
                                      <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-1">Recommended Model Answer:</p>
                                      <p className="text-[11px] font-serif text-slate-700 leading-relaxed font-semibold italic">{t.modelAnswer}</p>
                                      
                                      {t.markingScheme && (
                                        <div className="pt-2 border-t border-slate-200 text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                          <span>💡 Evaluation Marking Guide: </span>
                                          <span className="text-indigo-650">{t.markingScheme}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      )}

                    </div>

                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-150 p-16 text-center text-slate-400 space-y-3 shadow-xs print:hidden">
                  <BookOpen className="mx-auto h-12 w-12 text-slate-100" />
                  <h3 className="font-black text-slate-708 text-sm">Classroom Lesson Note Workbench</h3>
                  <p className="text-xs max-w-sm mx-auto text-slate-400">
                    Input your required student class, week, and academic subject guidelines in the sidebar form and trigger the generator to compile massive official NERDC complete lesson notes instantly.
                  </p>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
