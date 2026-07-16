import React, { useState, useMemo } from 'react';
import { ActionDropdown } from './ActionDropdown';
import { ClassLevel, User, Subject, TermNumber, WeekNumber, LessonProgress, LessonContent } from '../types';
import { getSubjectsForClass, getWeeklyTopicTitle, getLessonContent } from '../data/curriculum';
import { SubjectIcon } from './SubjectIcon';
import { rtdbGet, rtdbSet, NODES } from '../lib/rtdbService';
import { 
  BookOpen, ChevronRight, CheckCircle, Search, HelpCircle, 
  Flame, Award, ArrowLeft, RotateCcw, AlertCircle, Save, Sparkles,
  Volume2, VolumeX, Printer, Download, Edit, Check, X
} from 'lucide-react';

interface LearningHubProps {
  user: User;
  progressList: LessonProgress[];
  onToggleComplete: (subjectId: string, termNum: TermNumber, weekNum: WeekNumber, score?: number) => void;
  isPro: boolean;
  onPaymentTrigger: () => void;
  demoUsageCount: number;
  onIncrementDemoUsage: () => number;
  onCustomizeSubjects?: () => void;
  selectedSubjectId?: string;
  setSelectedSubjectId?: (id: string) => void;
  curriculums?: any[];
  proPrice?: string;
  trialTimeRemaining?: number | null;
}

export function formatLessonNote(note: any): any {
  if (!note) return note;
  const formatted = { ...note };

  const cleanText = (text: string): string => {
    if (!text) return text;
    
    let cleaned = text.trim();

    // 1. Strip surrounding quotes and markdown code blocks
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.substring(1, cleaned.length - 1).trim();
    }
    if (cleaned.startsWith('`') && cleaned.endsWith('`')) {
      cleaned = cleaned.replace(/^```[a-zA-Z]*\n/, '').replace(/```$/, '').trim();
    }

    // 2. Filter out conversational introductory/meta phrases often returned by AI
    const conversationalRegexes = [
      /^(here\s+is|certainly!|surely,|sure,|below\s+is|this\s+lesson\s+note\s+is)\s+.*?\n/i,
      /^as\s+an\s+expert\s+nigerian\s+school\s+teacher.*?\n/i,
      /^this\s+lesson\s+note\s+has\s+been\s+compiled.*?\n/i,
      /^aligned\s+with\s+the\s+official\s+nerdc.*?\n/i,
      /^here\s+is\s+a\s+complete\s+and\s+highly\s+structured\s+lesson\s+note.*?\n/i
    ];

    for (const regex of conversationalRegexes) {
      cleaned = cleaned.replace(regex, '').trim();
    }

    // 3. Strip out any meta text occurring before 'Subject' label if it's there
    const subjectIndex = cleaned.search(/Subject\s*:/i);
    if (subjectIndex !== -1) {
      cleaned = cleaned.substring(subjectIndex);
    }

    // 4. Clean specific forbidden phrases
    const forbiddenPhrases = [
      /Welcome to this week's/gi,
      /Module Learning Objectives/gi,
      /In this chapter/gi,
      /By the end of this lesson/gi,
      /Course Learning Objectives/gi,
      /Here is the complete lesson note/gi,
      /Here is a complete lesson note/gi,
      /Certainly! Here is/gi,
      /Hope this helps/gi,
      /This lesson note is fully aligned/gi,
      /Fully aligned with official NERDC/gi,
      /I hope this complete lesson note is helpful/gi
    ];

    for (const phrase of forbiddenPhrases) {
      cleaned = cleaned.replace(phrase, "");
    }

    return cleaned.trim();
  };

  if (formatted.detailedLessonNote && typeof formatted.detailedLessonNote === 'string') {
    formatted.detailedLessonNote = cleanText(formatted.detailedLessonNote);
  }

  if (formatted.introduction && typeof formatted.introduction === 'string') {
    // Introduction doesn't have "Subject:", just clean conversational phrases
    const forbiddenPhrases = [
      /Welcome to this week's/gi,
      /Module Learning Objectives/gi,
      /In this chapter/gi,
      /By the end of this lesson/gi,
      /Course Learning Objectives/gi,
      /Here is the complete lesson note/gi,
      /Here is a complete lesson note/gi,
      /Certainly! Here is/gi,
      /Hope this helps/gi,
      /This lesson note is fully aligned/gi,
      /Fully aligned with official NERDC/gi,
      /I hope this complete lesson note is helpful/gi
    ];
    let cleanedIntro = formatted.introduction;
    for (const phrase of forbiddenPhrases) {
      cleanedIntro = cleanedIntro.replace(phrase, "");
    }
    formatted.introduction = cleanedIntro.trim();
  }

  if (formatted.note_body && typeof formatted.note_body === 'string') {
    formatted.note_body = cleanText(formatted.note_body);
  }

  return formatted;
}

export function LearningHub({ 
  user, 
  progressList, 
  onToggleComplete,
  isPro,
  onPaymentTrigger,
  demoUsageCount,
  onIncrementDemoUsage,
  onCustomizeSubjects,
  selectedSubjectId: propsSelectedSubjectId,
  setSelectedSubjectId: propsSetSelectedSubjectId,
  curriculums = [],
  proPrice = '₦5,000',
  trialTimeRemaining = null
}: LearningHubProps) {
  // Speech synthesis states
  const [currentlySpeaking, setCurrentlySpeaking] = useState<string | null>(null);

  // Welcome Modal state (one-time for new users)
  const [showWelcomeModal, setShowWelcomeModal] = useState(() => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem(`livingstone_welcome_seen_${user.id}`);
      return !seen;
    }
    return false;
  });

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`livingstone_welcome_seen_${user.id}`, 'true');
    }
  };

  // Stop pronunciation on unmount
  React.useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (currentlySpeaking === text) {
        window.speechSynthesis.cancel();
        setCurrentlySpeaking(null);
        return;
      }
      
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#`_\-]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95; // clean pace for study
      
      utterance.onend = () => {
        setCurrentlySpeaking(null);
      };
      utterance.onerror = () => {
        setCurrentlySpeaking(null);
      };

      // Try searching for an English-speaking localized/system voice
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      
      setCurrentlySpeaking(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Curriculum Lists for selected grade (filtered by student selection if any exists)
  const subjects = useMemo(() => {
    const allClassSubjects = getSubjectsForClass(user.classLevel);
    if (user.selectedSubjectIds && user.selectedSubjectIds.length > 0) {
      if (user.selectedSubjectIds.length < allClassSubjects.length) {
        return allClassSubjects;
      }
      return allClassSubjects.filter(s => user.selectedSubjectIds!.includes(s.id));
    }
    return allClassSubjects;
  }, [user.classLevel, user.selectedSubjectIds]);

  // Selected State
  const [localSubjectId, setLocalSubjectId] = useState<string>('');
  const selectedSubjectId = propsSelectedSubjectId !== undefined && propsSelectedSubjectId !== '' ? propsSelectedSubjectId : localSubjectId;
  const setSelectedSubjectId = propsSelectedSubjectId !== undefined && propsSetSelectedSubjectId ? propsSetSelectedSubjectId : setLocalSubjectId;

  // Auto-tune subject on curriculum switch if current subject is no longer available
  React.useEffect(() => {
    if (subjects.length > 0) {
      const exists = subjects.some(s => s.id === selectedSubjectId);
      if (!exists) {
        setSelectedSubjectId(subjects[0].id);
      }
    }
  }, [subjects, selectedSubjectId, setSelectedSubjectId]);

  const selectedSubject = useMemo(() => {
    return subjects.find(s => s.id === selectedSubjectId) || subjects[0] || null;
  }, [subjects, selectedSubjectId]);

  const [selectedTerm, setSelectedTerm] = useState<TermNumber>(1);
  const [selectedWeek, setSelectedWeek] = useState<WeekNumber>(1);

  // Auto-register demo lesson usage unique to (Class, Subject, Term, Week)
  React.useEffect(() => {
    if (!user || isPro) return;
    if (!selectedSubject) return;

    const isDemoSubj = selectedSubject.id === 'mathematics' || selectedSubject.id === 'english';
    if (!isDemoSubj) return; // Premium subjects locked out separately anyway

    const usageKey = `${user.classLevel}_${selectedSubject.id}_${selectedTerm}_${selectedWeek}`;
    const stored = JSON.parse(localStorage.getItem(`livingstone_demo_uses_${user.id}`) || '[]');
    if (!stored.includes(usageKey)) {
      stored.push(usageKey);
      localStorage.setItem(`livingstone_demo_uses_${user.id}`, JSON.stringify(stored));
      onIncrementDemoUsage();
    }
  }, [user, selectedSubjectId, selectedTerm, selectedWeek, isPro]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Quiz evaluation states
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // AI-generated active lesson notes
  const [aiLessonNote, setAiLessonNote] = useState<any | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState('');

  // Editing states for custom lesson notes
  const [isEditingLocal, setIsEditingLocal] = useState(false);
  const [editTopic, setEditTopic] = useState('');
  const [editIntroduction, setEditIntroduction] = useState('');
  const [editDetailedNote, setEditDetailedNote] = useState('');
  const [editHomework, setEditHomework] = useState('');
  const [editVocab, setEditVocab] = useState('');
  const [editMaterials, setEditMaterials] = useState('');

  // Asynchronous robust fetcher from Master Lesson Library node with offline caching & automatic online sync
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineCached, setOfflineCached] = useState(false);

  const loadLessonFromRTDB = async () => {
    if (!selectedSubject) {
      setAiLessonNote(null);
      return;
    }
    const classKey = (user.classLevel || 'SS 1').replace(/\s+/g, '');
    const subjectKey = selectedSubject.name;
    const termKey = selectedTerm === 1 ? 'FirstTerm' : selectedTerm === 2 ? 'SecondTerm' : 'ThirdTerm';
    const weekKey = `Week${selectedWeek}`;

    const cacheKey = `livingstone_lesson_cache_${classKey}_${subjectKey.replace(/\s+/g, '_')}_${termKey}_${weekKey}`;

    setIsGeneratingAI(true);
    setAiError('');
    setOfflineCached(false);

    try {
      const lessonPath = `lessonNotes/${classKey}/${subjectKey}/${termKey}/${weekKey}`;
      const record = await rtdbGet(lessonPath);

      if (record && record.status === 'Published') {
        const formatted = formatLessonNote(record);
        setAiLessonNote(formatted);
        localStorage.setItem(cacheKey, JSON.stringify(formatted));
      } else {
        // Fallback check to see if we have an offline cached copy
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            setAiLessonNote(JSON.parse(cached));
            setOfflineCached(true);
            setAiError('');
          } catch {
            setAiLessonNote(null);
            setAiError('This lesson has not yet been published.');
          }
        } else {
          setAiLessonNote(null);
          setAiError('This lesson has not yet been published.');
        }
      }
    } catch (err: any) {
      console.warn("[LearningHub] Database retrieval failed, falling back to local storage cache:", err);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setAiLessonNote(JSON.parse(cached));
          setOfflineCached(true);
          setAiError('');
        } catch {
          setAiLessonNote(null);
          setAiError('This lesson has not yet been published.');
        }
      } else {
        setAiLessonNote(null);
        setAiError('This lesson has not yet been published.');
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      loadLessonFromRTDB();
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    loadLessonFromRTDB();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [selectedSubject, selectedTerm, selectedWeek, user.classLevel]);

  // Retrieve current active lesson content using master lesson library or fallback
  const lesson: LessonContent = useMemo(() => {
    if (!selectedSubject) return { title: '', objectives: [], body: [], keyPoints: [], quiz: [] };

    if (aiLessonNote) {
      const title = aiLessonNote.topic || `Week ${selectedWeek} Topic`;
      
      let body: string[] = [];
      if (typeof aiLessonNote.detailedLessonDevelopment === 'string') {
        body = aiLessonNote.detailedLessonDevelopment.split('\n\n').map((p: any) => String(p).trim()).filter(Boolean);
      } else if (typeof aiLessonNote.detailedLessonNote === 'string') {
        body = aiLessonNote.detailedLessonNote.split('\n\n').map((p: any) => String(p).trim()).filter(Boolean);
      } else if (typeof aiLessonNote.details === 'string') {
        body = aiLessonNote.details.split('\n\n').map((p: any) => String(p).trim()).filter(Boolean);
      } else if (Array.isArray(aiLessonNote.body)) {
        body = aiLessonNote.body;
      } else {
        body = [aiLessonNote.details || 'No details provided yet.'];
      }

      let objectives: string[] = [];
      if (typeof aiLessonNote.learningObjectives === 'string' && aiLessonNote.learningObjectives.trim()) {
        objectives = aiLessonNote.learningObjectives.split('\n').map((o: any) => String(o).replace(/^[*-]\s*/, '').trim()).filter(Boolean);
      } else if (Array.isArray(aiLessonNote.objectives)) {
        objectives = aiLessonNote.objectives;
      } else {
        objectives = [`Understand the core concepts of ${title}`];
      }

      let keyPoints: string[] = [];
      if (typeof aiLessonNote.keywords === 'string' && aiLessonNote.keywords.trim()) {
        keyPoints = aiLessonNote.keywords.split(',').map((k: any) => String(k).trim()).filter(Boolean);
      } else if (Array.isArray(aiLessonNote.keyPoints)) {
        keyPoints = aiLessonNote.keyPoints;
      } else {
        keyPoints = [
          `Active learning of ${title}`,
          `Review definitions, formulas, and examples.`
        ];
      }

      let quiz: any[] = [];
      if (Array.isArray(aiLessonNote.quizQuestions)) {
        quiz = aiLessonNote.quizQuestions;
      } else if (Array.isArray(aiLessonNote.quiz)) {
        quiz = aiLessonNote.quiz;
      }

      return {
        title,
        objectives,
        body,
        keyPoints,
        quiz
      };
    }

    return getLessonContent(user.classLevel, selectedSubject.id, selectedTerm, selectedWeek);
  }, [user.classLevel, selectedSubject, selectedTerm, selectedWeek, aiLessonNote]);

  // Is this specific combination of (Subject, Term, Week) marked as completed?
  const currentProgress = useMemo(() => {
    if (!selectedSubject) return null;
    return progressList.find(
      (p) =>
        p.classLevel === user.classLevel &&
        p.subjectId === selectedSubject.id &&
        p.termNum === selectedTerm &&
        p.weekNum === selectedWeek
    );
  }, [progressList, user.classLevel, selectedSubject, selectedTerm, selectedWeek]);

  const isCompleted = currentProgress?.completed || false;
  const savedScore = currentProgress?.score;

  // Search function to match terms/topics
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const results: Array<{
      subject: Subject;
      term: TermNumber;
      week: WeekNumber;
      title: string;
    }> = [];

    // Let's sweep across all available subjects in this class
    subjects.forEach((subj) => {
      // Loop terms
      ([1, 2, 3] as TermNumber[]).forEach((t) => {
        // Loop weeks
        (Array.from({ length: 12 }, (_, i) => (i + 1) as WeekNumber)).forEach((w) => {
          const title = getWeeklyTopicTitle(user.classLevel, subj.id, t, w);
          if (title.toLowerCase().includes(searchQuery.toLowerCase())) {
            results.push({ subject: subj, term: t, week: w, title });
          }
        });
      });
    });

    return results.slice(0, 8); // return top 8
  }, [searchQuery, subjects, user.classLevel]);

  // Handle option select in quiz
  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (showResults) return; // locked
    setAnswers({
      ...answers,
      [questionIdx]: optionIdx,
    });
  };

  // Grade the quiz
  const handleGradeQuiz = () => {
    if (!lesson.quiz || lesson.quiz.length === 0) return;
    
    let correctCount = 0;
    lesson.quiz.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const scorePct = Math.round((correctCount / lesson.quiz.length) * 100);
    setQuizScore(scorePct);
    setShowResults(true);

    // Auto mark as completed if score is high! (>= 60%) or just save score
    onToggleComplete(selectedSubject.id, selectedTerm, selectedWeek, scorePct);
  };

  // Reset quiz states for review
  const handleResetQuiz = () => {
    setAnswers({});
    setShowResults(false);
    setQuizScore(null);
    setAiLessonNote(null);
    setAiError('');
  };

  const handleGenerateAISyllabus = async () => {
    if (!selectedSubject) return;
    setIsGeneratingAI(true);
    setAiError('');
    try {
      // 1. Retrieve the curriculum node from Firebase Realtime Database
      const rtdbCurriculum = await rtdbGet(NODES.CURRICULUM);
      
      // Log the exact Firebase path and query result in the browser console for debugging
      console.log(`[DEBUG] Querying Firebase Realtime Database Path: /curriculum`);
      console.log(`[DEBUG] Firebase /curriculum Query Result payload:`, rtdbCurriculum);

      let matchedCurriculum: any = null;
      
      const targetTerm = selectedTerm === 1 ? '1st Term' : selectedTerm === 2 ? '2nd Term' : '3rd Term';
      const targetWeek = selectedWeek;
      const targetClass = user.classLevel || 'SS 1';
      const targetSubject = selectedSubject.name;

      if (rtdbCurriculum) {
        // Flatten any possible structure (flat or nested) to have uniform search
        const getFlatCurriculums = (obj: any): any[] => {
          if (!obj || typeof obj !== 'object') return [];
          if (obj.topic !== undefined && (obj.class !== undefined || obj.week !== undefined)) {
            return [obj];
          }
          let list: any[] = [];
          for (const val of Object.values(obj)) {
            list = list.concat(getFlatCurriculums(val));
          }
          return list;
        };

        const flatList = getFlatCurriculums(rtdbCurriculum);
        console.log(`[DEBUG] Total flattened curriculum records count: ${flatList.length}`, flatList);
        
        // Filter records precisely where:
        // class === selectedClass
        // subject === selectedSubject
        // term === selectedTerm
        // week === selectedWeek
        // status === "Published"
        matchedCurriculum = flatList.find((record: any) => {
          if (!record) return false;
          
          // Must match status === "Published"
          const recordStatus = record.status || 'Published';
          if (recordStatus !== 'Published') return false;

          // Standardize spaces and casing to prevent mismatch
          const norm = (s: string) => String(s).replace(/\s+/g, '').toLowerCase();
          const normWeek = (w: any) => {
            if (typeof w === 'number') return w;
            const m = String(w).match(/\d+/);
            return m ? parseInt(m[0], 10) : null;
          };

          const classMatch = norm(record.class) === norm(targetClass);
          const subjectMatch = norm(record.subject) === norm(targetSubject);
          const termMatch = norm(record.term) === norm(targetTerm);
          const weekMatch = normWeek(record.week) === normWeek(targetWeek);

          return classMatch && subjectMatch && termMatch && weekMatch;
        });
      }

      if (!matchedCurriculum) {
        console.warn(`[WARN] No matching curriculum record found in Firebase. Defaulting to system curriculum database baseline.`);
        
        const defaultTopicTitle = getWeeklyTopicTitle(
          targetClass as any,
          selectedSubject.id,
          selectedTerm,
          selectedWeek
        );

        matchedCurriculum = {
          class: targetClass,
          subject: selectedSubject.name,
          term: targetTerm,
          week: targetWeek,
          topic: defaultTopicTitle,
          details: `NERDC standard guidelines lesson structure for ${defaultTopicTitle}`,
          status: 'Published'
        };
      }

      console.log(`[DEBUG] Successfully located matching curriculum topic: "${matchedCurriculum.topic}"`, matchedCurriculum);

      // 2. We use the custom retrieved topic and description for generator API
      let generatedNote: any = null;
      try {
        const response = await fetch('/api/gemini/generate-lesson-note', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            classLevel: matchedCurriculum.class,
            subject: matchedCurriculum.subject,
            term: matchedCurriculum.term,
            week: `Week ${matchedCurriculum.week}`,
            focusTopic: matchedCurriculum.topic,
            topicDescription: matchedCurriculum.details || matchedCurriculum.topic,
            isEndOfTerm: selectedWeek === 12,
            studentFocus: user?.role === 'student'
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.success && data.lessonNote && data.lessonNote.topic) {
            generatedNote = data.lessonNote;
          } else if (data && data.topic) {
            generatedNote = data;
          }
        }
      } catch (errFetch) {
        console.warn("[API Fetch Exception] Falling back to client-side lesson note synthesis:", errFetch);
      }

      // If remote generation is offline or fails, we synthesize an extremely high-fidelity local lesson note
      if (!generatedNote) {
        generatedNote = {
          topic: matchedCurriculum.topic,
          objectives: [
            `Understand the core definitions and principles of "${matchedCurriculum.topic}".`,
            `Examine practical real-world applications of "${matchedCurriculum.topic}" under NERDC guidelines.`,
            `Solve foundational exercise problems and answer conceptual questions on "${matchedCurriculum.topic}".`
          ],
          teachingMaterials: [
            "Whiteboard & markers",
            "NERDC aligned textbook and reference curriculum booklet",
            "Relevant visual aids, illustrations, and local case materials"
          ],
          keyVocabulary: [
            matchedCurriculum.topic.split(' ')[0] || "Foundations",
            "NERDC Syllabus",
            "Nigerian context",
            "Core principles"
          ],
          introduction: `Welcome to this week's lesson on ${matchedCurriculum.topic} under the subject of ${matchedCurriculum.subject} for ${matchedCurriculum.class}. Today we are exploring the essential concepts of ${matchedCurriculum.topic} to build a solid foundational understanding.`,
          teacherExplanationSteps: [
            `Introduce the term '${matchedCurriculum.topic}' and write the key definitions on the board.`,
            `Explain the core rules, formulas, or grammar principles governing this topic.`,
            `Demonstrate step-by-step examples or case studies relevant to the lesson.`,
            `Allow students to ask clarifying questions and conduct a brief formative assessment.`
          ],
          detailedLessonNote: `## Lesson Note: ${matchedCurriculum.topic}\n\n### Introduction to ${matchedCurriculum.topic}\nIn this lesson, we study **${matchedCurriculum.topic}**, which is an essential part of the **${matchedCurriculum.subject}** curriculum for **${matchedCurriculum.class}**. ${matchedCurriculum.details || 'This lesson covers the core principles, definitions, and applications of this concept.'}\n\n### Key Concepts and Explanation\n1. **Core Definition**: This concept is fundamental to mastering advanced topics in this subject.\n2. **Step-by-Step Procedure**: \n   - Always start by analyzing the given terms.\n   - Apply the relevant rules or equations strictly.\n   - Verify your answers against standard guidelines.\n\n### Local Context & Nigerian Alignment\nIn Nigeria, understanding ${matchedCurriculum.topic} helps us solve local community challenges, optimize economic trades, improve agricultural yields, or articulate standard grammar points clearly, depending on the subject domain. Keeping our studies grounded in local context ensures that we build practical skills for national development.`,
          studentActivities: [
            "Take notes on the board and read the textbook introduction page.",
            "Participate in the classroom discussion and explain key terms in their own words.",
            "Solve the practice problems individually or in small study pairs."
          ],
          classExercises: [
            `Define '${matchedCurriculum.topic}' in your own words and write down its primary principles.`,
            `Give one real-world or local example where the principles of this lesson are applied.`
          ],
          homeworkAssignment: `Read the next sub-section of ${matchedCurriculum.topic} in your textbook and write a 100-word summary of how it relates to our everyday life in Nigeria.`,
          quizQuestions: [
            {
              question: `What is the primary focus of studying ${matchedCurriculum.topic}?`,
              options: [
                `To understand the key definitions, rules, and applications of ${matchedCurriculum.topic}`,
                "To learn how to draw unrelated diagrams",
                "To ignore standard NERDC guidelines",
                "To skip class assignments completely"
              ],
              correctIndex: 0,
              explanation: `The lesson is strictly focused on explaining ${matchedCurriculum.topic} thoroughly and correctly.`
            }
          ],
          theoryQuestions: [
            {
              question: `Explain the fundamental importance of ${matchedCurriculum.topic} under the ${matchedCurriculum.subject} syllabus for ${matchedCurriculum.class}.`,
              modelAnswer: `Understanding ${matchedCurriculum.topic} provides the necessary logical framework to solve more complex academic problems and apply these rules in standard everyday activities.`,
              markingSchemeName: "Award 10 marks for a clear definition and complete list of principles."
            }
          ],
          subjectSpecificFocus: {
            title: `${matchedCurriculum.subject} Pedagogy & Ethical Guidance`,
            content: `Teachers should guide students to connect ${matchedCurriculum.topic} with daily observations, ensuring active student participation and logical deductions.`,
            safeguardsOrMoralLesson: "Apply honest effort and collaborative integrity when solving class tasks."
          }
        };
      }

      if (generatedNote) {
        const formattedNote = formatLessonNote(generatedNote);
        setAiLessonNote(formattedNote);
        // Persist generated note to localStorage so user doesn't lose it!
        const storageKey = `livingstone_custom_lesson_note_${user.id}_${user.classLevel}_${selectedSubject.id}_${selectedTerm}_${selectedWeek}`;
        localStorage.setItem(storageKey, JSON.stringify(formattedNote));

        // If admin, auto-save to Firebase Realtime Database
        if (user?.role === 'admin') {
          setTimeout(() => {
            handleSaveToDatabase(formattedNote);
          }, 100);
        }
      }
    } catch (err: any) {
      setAiError(err.message || 'Failed to connect to school AI generator.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const [isSavingToDB, setIsSavingToDB] = useState(false);
  const [dbSaveSuccess, setDbSaveSuccess] = useState('');

  const handleSaveToDatabase = async (noteToSave = aiLessonNote) => {
    if (!noteToSave) return;
    setIsSavingToDB(true);
    setDbSaveSuccess('');
    try {
      const termStr = selectedTerm === 1 ? '1st Term' : selectedTerm === 2 ? '2nd Term' : '3rd Term';
      const targetClass = user.classLevel || 'SS 1';
      const targetSubject = selectedSubject.name;
      const targetTerm = termStr;
      const targetWeek = selectedWeek;

      // Find matched curriculum record
      const matched = (curriculums || []).find((c) => {
        const norm = (s: any) => String(s || '').trim().toLowerCase();
        const normWeek = (w: any) => {
          const m = String(w || '').match(/\d+/);
          return m ? parseInt(m[0], 10) : null;
        };
        return norm(c.class) === norm(targetClass) &&
               norm(c.subject) === norm(targetSubject) &&
               norm(c.term) === norm(targetTerm) &&
               normWeek(c.week) === normWeek(targetWeek);
      });

      const keyId = (matched && matched.id) || `curr_ai_${targetClass.replace(/\s+/g, '_')}_${targetSubject.replace(/\s+/g, '_')}_${targetTerm.replace(/\s+/g, '_')}_W${targetWeek}`.replace(/[.#$[\]/]/g, '_');

      const currentRecord = matched || {};
      const updatedRecord = {
        ...currentRecord,
        id: keyId,
        class: targetClass,
        subject: targetSubject,
        term: targetTerm,
        week: `Week ${targetWeek}`,
        topic: noteToSave.topic || currentRecord.topic || `Week ${targetWeek} Topic`,
        detailedLessonNote: noteToSave.detailedLessonNote,
        details: noteToSave.detailedLessonNote, // Overwrite with clean study notes
        introduction: noteToSave.introduction || "",
        keyVocabulary: noteToSave.keyVocabulary || [],
        teachingMaterials: noteToSave.teachingMaterials || [],
        homeworkAssignment: noteToSave.homeworkAssignment || "",
        classExercises: noteToSave.classExercises || [],
        quiz: noteToSave.quizQuestions || noteToSave.quiz || [],
        theoryQuestions: noteToSave.theoryQuestions || [],
        subjectSpecificFocus: noteToSave.subjectSpecificFocus || null,
        status: 'Published'
      };

      await rtdbSet(`${NODES.CURRICULUM}/${keyId}`, updatedRecord);
      setDbSaveSuccess('Success! Clean lesson notes saved and published to Realtime Database.');
      setTimeout(() => setDbSaveSuccess(''), 4000);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Failed to save lesson note to database.');
    } finally {
      setIsSavingToDB(false);
    }
  };

  const handleStartEditing = () => {
    if (!aiLessonNote) return;
    setEditTopic(aiLessonNote.topic || '');
    setEditIntroduction(aiLessonNote.introduction || '');
    setEditDetailedNote(aiLessonNote.detailedLessonNote || '');
    setEditHomework(aiLessonNote.homeworkAssignment || '');
    setEditVocab((aiLessonNote.keyVocabulary || []).join(', '));
    setEditMaterials((aiLessonNote.teachingMaterials || []).join(', '));
    setIsEditingLocal(true);
  };

  const handleSaveEdits = () => {
    if (!aiLessonNote) return;
    const updatedNote = {
      ...aiLessonNote,
      topic: editTopic,
      introduction: editIntroduction,
      detailedLessonNote: editDetailedNote,
      homeworkAssignment: editHomework,
      keyVocabulary: editVocab.split(',').map(s => s.trim()).filter(Boolean),
      teachingMaterials: editMaterials.split(',').map(s => s.trim()).filter(Boolean)
    };
    setAiLessonNote(updatedNote);
    
    // Save to localStorage
    const storageKey = `livingstone_custom_lesson_note_${user.id}_${user.classLevel}_${selectedSubject.id}_${selectedTerm}_${selectedWeek}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedNote));
    setIsEditingLocal(false);

    // If admin, auto-save to Firebase Realtime Database
    if (user?.role === 'admin') {
      handleSaveToDatabase(updatedNote);
    }
  };

  const handleCancelEditing = () => {
    setIsEditingLocal(false);
  };

  const handleExportToWord = () => {
    if (!aiLessonNote) return;
    const title = `${user.classLevel || 'Class'}_${selectedSubject?.name || 'Subject'}_Week_${selectedWeek}_Lesson_Note`;
    
    const contentHtml = `
      <h1>${selectedSubject?.name} - ${user.classLevel}</h1>
      <h2>Term ${selectedTerm}, Week ${selectedWeek} Lesson Note</h2>
      <h3>Topic: ${aiLessonNote.topic || lesson.title}</h3>
      <p><strong>Duration:</strong> ${aiLessonNote.duration || '40 Minutes'}</p>
      
      <h3>Learning Objectives</h3>
      <ul>
        ${(aiLessonNote.objectives || lesson.objectives || []).map((obj: string) => `<li>${obj}</li>`).join('')}
      </ul>
      
      <h3>Key Vocabulary Terms</h3>
      <ul>
        ${(aiLessonNote.keyVocabulary || []).map((word: string) => `<li>${word}</li>`).join('')}
      </ul>
      
      <h3>Teaching / Reference Materials</h3>
      <ul>
        ${(aiLessonNote.teachingMaterials || []).map((mat: string) => `<li>${mat}</li>`).join('')}
      </ul>
      
      <h3>Introduction</h3>
      <p>${aiLessonNote.introduction || ''}</p>
      
      <h3>Comprehensive Lesson Text</h3>
      <div style="white-space: pre-wrap;">${aiLessonNote.detailedLessonNote || ''}</div>
      
      <h3>Classroom Exercises</h3>
      <ul>
        ${(aiLessonNote.classExercises || []).map((ex: string) => `<li>${ex}</li>`).join('')}
      </ul>
      
      <h3>Weekly Assignment</h3>
      <p>${aiLessonNote.homeworkAssignment || ''}</p>
    `;
    
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
          "xmlns:w='urn:schemas-microsoft-com:office:office:word' " +
          "xmlns='http://www.w3.org/TR/REC-html40'>" +
          "<head><title>Lesson Note</title><style>body { font-family: Arial, sans-serif; line-height: 1.5; }</style></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + contentHtml + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${title.replace(/\s+/g, '_')}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  // Navigate directly to a search result
  const handleSelectSearchResult = (res: { subject: Subject; term: TermNumber; week: WeekNumber }) => {
    setSelectedSubjectId(res.subject.id);
    setSelectedTerm(res.term);
    setSelectedWeek(res.week);
    setSearchQuery('');
    handleResetQuiz();
  };

  const handleWeekClick = (wk: WeekNumber) => {
    setSelectedWeek(wk);
    handleResetQuiz();
  };

  const handleTermClick = (tm: TermNumber) => {
    setSelectedTerm(tm);
    handleResetQuiz();
  };

  const handleSubjectClick = (subj: Subject) => {
    setSelectedSubjectId(subj.id);
    handleResetQuiz();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Modal for New Users */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden flex flex-col relative max-h-[90vh]">
            {/* Header with beautiful indigo gradient */}
            <div className="bg-gradient-to-tr from-blue-700 to-indigo-800 p-6 text-white text-center relative">
              <div className="absolute top-4 right-4">
                <button
                  type="button"
                  onClick={handleCloseWelcomeModal}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer text-white"
                  title="Close welcome modal"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Sparkles size={24} className="text-amber-300 fill-amber-300 animate-pulse" />
              </div>
              <h2 className="text-xl font-black tracking-tight">Welcome to Livingstone, {user.fullName || 'Scholar'}! 🌟</h2>
              <p className="text-xs text-blue-100 mt-1">Your premium companion for NERDC curriculum-aligned learning</p>
            </div>

            {/* Content area */}
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="space-y-3.5">
                <h3 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">How to Use the Learning Hub</h3>
                
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      <strong>Select Subject & Term</strong>: Use the grade controls and subject lists to quickly find NERDC national curriculum guidelines tailored to your current class.
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      <strong>Generate Clean AI Notes</strong>: Let our smart AI assemble highly descriptive, pure academic study notes on any topic instantly without bloated templates.
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      <strong>Listen Read Aloud</strong>: Have the entire study guide narrated using clear speech synthesis to learn and retain definitions on the go.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">4</div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      <strong>Test Your Skills</strong>: Answer real-world diagnostic CBT quizzes, copy classroom assignments, and track your school progress.
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefits of 20-Minute daily free trial */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5">
                <h4 className="text-xs font-black text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <Flame size={14} className="text-amber-600 fill-amber-500" />
                  Your 20-Minute Daily Free Trial
                </h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Every day, we gift you <strong>20 minutes of completely free premium AI access</strong>. Use it to generate notes, hear narrations, and take smart quizzes. No credentials required! Upgrade to Pro for unlimited lifelong access.
                </p>
              </div>
            </div>

            {/* Footer with actions */}
            <div className="border-t border-slate-100 p-5 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={handleCloseWelcomeModal}
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-black rounded-xl transition cursor-pointer text-center shadow-md shadow-indigo-200"
              >
                Start Learning Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Navigation Bar details */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800">Syllabus Learning Hub</h1>
            <p className="text-xs text-slate-400">Class Focus: {user.classLevel}</p>
          </div>
        </div>

        {/* Live Search bar focusing on Nigerian curriculum topics */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search syllabus e.g. Osmosis..."
            className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:ring-1 focus:ring-blue-500 focus:bg-white outline-none"
          />

          {/* Search Result Dropdown menu */}
          {searchQuery && (
            <div className="absolute z-30 left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden max-h-64 overflow-y-auto">
              <div className="p-2 border-b border-slate-150 bg-slate-50 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Syllabus matches ({searchResults.length})
              </div>
              {searchResults.length > 0 ? (
                searchResults.map((res, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSearchResult(res)}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 hover:text-blue-950 transition flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-850 truncate max-w-xs">{res.title}</p>
                      <p className="text-[10px] text-slate-400">{res.subject.name} &bull; Term {res.term}, Week {res.week}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-350" />
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  No matching topics found in current class. Try searching for &quot;Math&quot;, &quot;science&quot;, etc.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Primary Layout Block */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Subject Select & Progress Checklist (1 col) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-4.5 rounded-2xl border border-slate-150 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pl-1">
              <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Choose Subject</h2>
              {onCustomizeSubjects && (
                <button
                  type="button"
                  onClick={onCustomizeSubjects}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-black transition flex items-center gap-0.5 cursor-pointer"
                  title="Customize subject choices"
                >
                  <span>Edit List</span>
                </button>
              )}
            </div>
            <div className="space-y-1">
              {subjects.map((subj) => {
                const isSelected = selectedSubject?.id === subj.id;
                const isPremiumSubj = subj.id !== 'mathematics' && subj.id !== 'english';
                const hasTrialTime = trialTimeRemaining !== null && trialTimeRemaining > 0;
                const showLockIcon = !isPro && isPremiumSubj && !hasTrialTime;
                return (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => handleSubjectClick(subj)}
                    className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900 border-l-2 border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-3 truncate">
                      <SubjectIcon name={subj.icon} size={15} />
                      <span className="truncate">{subj.name}</span>
                    </span>
                    {showLockIcon && (
                      <span className="text-[9px] bg-amber-50 text-amber-750 px-1.5 py-0.5 rounded font-black tracking-tight shrink-0 flex items-center gap-0.5">
                        <span>🔒</span>
                        <span>PRO</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Academic Term Switchers */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-150 shadow-sm space-y-3">
            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest pl-1">Select School Term</h2>
            <div className="grid grid-cols-3 gap-1.5">
              {([1, 2, 3] as TermNumber[]).map((tNum) => {
                const isActive = selectedTerm === tNum;
                return (
                  <button
                    key={tNum}
                    type="button"
                    onClick={() => handleTermClick(tNum)}
                    className={`py-1.5 rounded-lg text-xs font-bold border text-center transition-all ${
                      isActive
                        ? 'border-blue-600 bg-blue-50 text-blue-800 font-extrabold'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    Term {tNum}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed text-center">
              Each term runs for 12 weeks according to national schedule.
            </p>
          </div>
        </div>

        {/* Right Columns: Active Lesson content & Quiz view (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Week Horizontal Roadmap Scroll */}
          <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Active Term Weeks (1 - 12)</h3>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md">
                Current Term {selectedTerm} Sequence
              </span>
            </div>

            <div className="flex gap-2 items-center overflow-x-auto pb-2 scrollbar-thin">
              {(Array.from({ length: 12 }, (_, i) => (i + 1) as WeekNumber)).map((wkNum) => {
                const isSelected = selectedWeek === wkNum;
                // Check if this week's progress is complete
                const wkProgress = progressList.find(
                  (p) =>
                    p.classLevel === user.classLevel &&
                    p.subjectId === selectedSubject?.id &&
                    p.termNum === selectedTerm &&
                    p.weekNum === wkNum
                );
                const wkComplete = wkProgress?.completed || false;
                const wkScore = wkProgress?.score;

                const selectedStyle = "bg-blue-600 border-blue-600 text-white font-extrabold shadow-md scale-102";
                const unselectedStyle = "border-slate-250 bg-white text-slate-700 hover:bg-slate-50";

                return (
                  <button
                    key={wkNum}
                    type="button"
                    onClick={() => handleWeekClick(wkNum)}
                    className={`flex-shrink-0 w-11 h-11 border rounded-lg flex flex-col justify-center items-center transition relative cursor-pointer ${
                      isSelected ? selectedStyle : unselectedStyle
                    }`}
                  >
                    <span className="text-[10px] font-bold leading-none">Wk</span>
                    <span className="text-sm font-black leading-none mt-0.5">{wkNum}</span>

                    {/* Completion marker */}
                    {wkComplete && (
                      <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center border-white border text-[8px] font-bold text-white shadow-sm ${
                        wkScore !== undefined && wkScore >= 66 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}>
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Lesson Panel */}
          {selectedSubject && (() => {
            const isPremiumSubject = selectedSubject.id !== 'mathematics' && selectedSubject.id !== 'english';
            const isTrialExceeded = demoUsageCount >= 15;
            const hasTrialTime = trialTimeRemaining !== null && trialTimeRemaining > 0;
            const isLocked = !isPro && !hasTrialTime && (isPremiumSubject || isTrialExceeded);

            if (isLocked) {
              return (
                <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-150 shadow-sm flex flex-col items-center text-center space-y-6 animate-fade-in">
                  <div className="h-16 w-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 text-3xl animate-pulse shadow-sm shadow-amber-100">
                    🔒
                  </div>
                  <div className="space-y-2.5 max-w-lg">
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest rounded-full">
                      {isTrialExceeded ? 'Demo Limit Reached' : 'Pro Subject Locked'}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {isTrialExceeded ? 'Demo Limit of 15 Uses Exhausted' : `Access Premium: ${selectedSubject.name}`}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      {isTrialExceeded 
                        ? 'You have viewed or solved 15 lessons across our demo curriculum. Subscribing to Pro unlocks full, term-long access to all tools, lesson templates, and diagnostic tests.'
                        : `Syllabus and quizzes for ${selectedSubject.name} are part of our premium pro plan. Support school operations & learning outcomes in Nigeria with a single, easy subscription.`
                      }
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-150 w-full max-w-md text-left space-y-2.5">
                    <p className="text-xs font-extrabold text-slate-705 uppercase tracking-widest text-center border-b border-slate-200 pb-1.5">
                      Subscribing to Pro unlocks:
                    </p>
                    <ul className="text-xs font-semibold text-slate-650 space-y-2">
                      <li className="flex gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>Full continuous assessments worksheets download and offline print solutions.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>Termly curriculum coverage across all subjects for Senior High and Junior levels.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>Advanced teacher control panels with custom printable termly report cards.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={onPaymentTrigger}
                      className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-white font-black text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition active:scale-97"
                    >
                      Subscribe to Pro ({proPrice} / term)
                    </button>
                    <a
                      href="https://wa.me/message/AJ4NILOGBTTMJ1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-205 text-xs sm:text-sm text-slate-655 font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Contact Support</span>
                    </a>
                  </div>
                </div>
              );
            }

            if (aiError === 'This lesson has not yet been published.' || (!aiLessonNote && !isGeneratingAI)) {
              return (
                <div className="bg-white p-8 rounded-3xl border border-slate-150 shadow-sm text-center py-20 space-y-4 animate-fade-in flex flex-col items-center">
                  <div className="h-16 w-16 bg-amber-50 border border-amber-100 text-amber-550 rounded-full flex items-center justify-center">
                    <AlertCircle size={32} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">This lesson has not yet been published.</h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Please check back later or notify your teacher/administrator to publish the curriculum notes for Term {selectedTerm}, Week {selectedWeek}.
                  </p>
                </div>
              );
            }

            return (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-150 shadow-sm space-y-6 animate-fade-in text-left">
              
              {/* Heading */}
              <div className="border-b border-slate-100 pb-5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-blue-50 font-bold text-blue-850 text-[10px] uppercase tracking-wider">
                    {user.classLevel} &bull; {selectedSubject.name}
                  </span>
                  <span className="text-slate-350 text-xs">/</span>
                  <span className="text-xs text-slate-500 font-medium">Term {selectedTerm}, Week {selectedWeek} Documentation</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                    {lesson.title}
                  </h2>

                  <div className="flex gap-2">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-bold shadow-sm">
                        <CheckCircle size={14} className="stroke-[2.5]" />
                        <span>Completed {savedScore !== undefined ? `(Quiz: ${savedScore}%)` : ''}</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onToggleComplete(selectedSubject.id, selectedTerm, selectedWeek)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold text-slate-700 transition cursor-pointer"
                      >
                        <Save size={14} />
                        <span>Mark as Completed</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Course Objectives */}
              <div className="p-4 bg-blue-500/5 border-l-4 border-blue-600 rounded-r-xl space-y-1.5">
                <h4 className="text-xs font-extrabold text-blue-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={13} />
                  <span>Learning Objectives</span>
                </h4>
                <ul className="text-xs font-semibold text-slate-700 space-y-1">
                  {lesson.objectives.map((obj, oIdx) => {
                    const speakingText = `Objective: ${obj}`;
                    const isSpeaking = currentlySpeaking === speakingText;
                    return (
                      <li key={oIdx} className="flex items-center justify-between gap-2 p-1 hover:bg-black/5 rounded-lg transition group">
                        <span className="flex gap-2">
                          <span className="text-blue-700 font-bold">•</span>
                          <span>Objective: {obj}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSpeak(speakingText)}
                          className={`p-1 rounded hover:bg-blue-100 transition shrink-0 cursor-pointer ${
                            isSpeaking ? 'text-blue-700' : 'text-slate-400 opacity-0 group-hover:opacity-100 focus:opacity-100'
                          }`}
                          title="Read aloud"
                        >
                          {isSpeaking ? <VolumeX size={13} className="animate-pulse" /> : <Volume2 size={13} />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {aiError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              {/* Lesson Notes Body */}
              {isGeneratingAI ? (
                <div className="p-10 bg-indigo-50/50 border border-indigo-100 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
                  <div className="h-14 w-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center animate-spin">
                    <Sparkles size={28} />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-black text-slate-900 tracking-tight">AI is generating a detailed NERDC-aligned study note...</h4>
                    <p className="text-xs text-slate-500 max-w-sm">
                      We are assembling structured lesson outlines, vocabulary keywords, student classroom exercises, diagnostic quizzes, and exam tips. This may take 10-15 seconds.
                    </p>
                  </div>
                </div>
              ) : aiLessonNote ? (
                <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl space-y-6 animate-fade-in relative">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-slate-200 pb-3 gap-3">
                     <div className="flex items-center gap-2">
                      <Sparkles size={15} className="text-indigo-600 fill-indigo-300" />
                      <h3 className="font-extrabold text-[10px] uppercase tracking-widest text-[#1e1b4b]">Livingstone AI Smart Lesson Note</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSpeak(`${aiLessonNote.introduction || ''}. ${aiLessonNote.detailedLessonNote || ''}`)}
                        className={`text-[11px] font-bold transition flex items-center gap-1 cursor-pointer py-1 px-2.5 rounded-lg border ${
                          currentlySpeaking === `${aiLessonNote.introduction || ''}. ${aiLessonNote.detailedLessonNote || ''}`
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 animate-pulse font-extrabold'
                            : 'bg-white border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/20'
                        }`}
                      >
                        {currentlySpeaking === `${aiLessonNote.introduction || ''}. ${aiLessonNote.detailedLessonNote || ''}` ? (
                          <>
                            <VolumeX size={12} />
                            <span>Stop Speaking</span>
                          </>
                        ) : (
                          <>
                            <Volume2 size={12} />
                            <span>Listen Read Aloud</span>
                          </>
                        )}
                      </button>

                       {user?.role === 'admin' && (
                        <button
                          type="button"
                          onClick={handleGenerateAISyllabus}
                          className="bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 text-[11px] font-extrabold py-1 px-2.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                          title="Regenerate with AI"
                        >
                          <RotateCcw size={12} />
                          <span>Regenerate</span>
                        </button>
                      )}

                      {user?.role === 'admin' && (
                        <button
                          type="button"
                          disabled={isSavingToDB}
                          onClick={() => handleSaveToDatabase(aiLessonNote)}
                          className="bg-[#059669] hover:bg-[#047857] text-white text-[11px] font-extrabold py-1 px-2.5 rounded-lg flex items-center gap-1 transition cursor-pointer disabled:opacity-55"
                          title="Publish clean lesson notes to Realtime Database"
                        >
                          {isSavingToDB ? (
                            <>
                              <RotateCcw size={12} className="animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save size={12} />
                              <span>Save & Publish</span>
                            </>
                          )}
                        </button>
                      )}

                      <ActionDropdown
                        label="Export"
                        align="right"
                        items={[
                          {
                            label: 'Print / Export PDF',
                            icon: Printer,
                            onClick: () => window.print()
                          },
                          {
                            label: 'Export to Word',
                            icon: Download,
                            onClick: handleExportToWord
                          }
                        ]}
                      />
                      
                      <button
                        type="button"
                        onClick={() => setAiLessonNote(null)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold tracking-tight cursor-pointer ml-1"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {dbSaveSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex gap-2 animate-bounce">
                      <CheckCircle size={15} className="shrink-0 text-emerald-600" />
                      <span>{dbSaveSuccess}</span>
                    </div>
                  )}

                  {/* Vocabulary & Teaching Helpers */}
                  {user?.role !== 'student' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                        <h4 className="text-[10px] font-black text-[#1e1b4b] uppercase tracking-wider">Key Vocabulary Terms</h4>
                        <ul className="text-xs font-semibold text-slate-600 space-y-1.5">
                          {aiLessonNote.keyVocabulary && aiLessonNote.keyVocabulary.map((word: string, wIdx: number) => {
                            const isSpeaking = currentlySpeaking === word;
                            return (
                              <li key={wIdx} className="flex items-center justify-between p-1 hover:bg-slate-50 rounded transition group">
                                <span className="flex gap-2">
                                  <span className="text-indigo-500 font-bold">•</span>
                                  <span>{word}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleSpeak(word)}
                                  className={`p-1 rounded hover:bg-indigo-50 transition shrink-0 cursor-pointer ${
                                    isSpeaking ? 'text-[#1e1b4b]' : 'text-slate-400 opacity-0 group-hover:opacity-100 focus:opacity-100'
                                  }`}
                                  title="Hear term read aloud"
                                >
                                  {isSpeaking ? <VolumeX size={12} className="animate-pulse" /> : <Volume2 size={12} />}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                        <h4 className="text-[10px] font-black text-[#1e1b4b] uppercase tracking-wider">Teaching / Reference Materials</h4>
                        <ul className="text-xs font-semibold text-slate-600 space-y-1.5">
                          {aiLessonNote.teachingMaterials && aiLessonNote.teachingMaterials.map((mat: string, mIdx: number) => (
                            <li key={mIdx} className="flex gap-2">
                              <span className="text-indigo-500 font-bold">•</span>
                              <span>{mat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Detailed Body Output */}
                  <div className="space-y-3.5">
                    <h4 className="text-xs font-extrabold text-[#1e1b4b] uppercase tracking-wider">
                      {user?.role === 'student' ? 'AI Topic Study Notes' : 'Comprehensive Lesson Text'}
                    </h4>
                    <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                      {user?.role !== 'student' && aiLessonNote.introduction && (
                        <p className="text-xs font-extrabold text-indigo-905 italic text-slate-800">
                          Introduction: {aiLessonNote.introduction}
                        </p>
                      )}
                      <div className="text-xs sm:text-sm text-slate-705 leading-relaxed whitespace-pre-wrap font-sans text-slate-700">
                        {aiLessonNote.detailedLessonNote}
                      </div>
                    </div>
                  </div>

                  {/* Teacher's delivery steps */}
                  {user?.role !== 'student' && aiLessonNote.teacherExplanationSteps && (
                    <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                      <h4 className="text-[10px] font-black text-[#1e1b4b] uppercase tracking-wider">Curriculum Classroom Steps</h4>
                      <ol className="text-xs font-semibold text-slate-600 space-y-2">
                        {aiLessonNote.teacherExplanationSteps.map((step: string, sIdx: number) => (
                          <li key={sIdx} className="flex gap-2">
                            <span className="text-indigo-600 font-black">{sIdx + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Exercises & Homework assignments */}
                  {user?.role !== 'student' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 pt-4.5">
                      <div className="space-y-2">
                        <h4 className="text-xs font-extrabold text-[#1e1b4b] uppercase tracking-wider">Practice Activities</h4>
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                          {aiLessonNote.classExercises && aiLessonNote.classExercises.map((ex: string, exIdx: number) => (
                            <p key={exIdx} className="font-semibold text-slate-700 flex gap-2">
                              <span className="text-indigo-500 font-bold">•</span>
                              <span>{ex}</span>
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-extrabold text-[#1e1b4b] uppercase tracking-wider">Weekly Assignment</h4>
                        <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-205 text-xs font-semibold text-amber-950 leading-relaxed">
                          {aiLessonNote.homeworkAssignment}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {lesson.body.map((para, pIdx) => {
                      const isSpeaking = currentlySpeaking === para;
                      return (
                        <div key={pIdx} className="flex gap-3 group items-start p-1 hover:bg-slate-50/50 rounded-lg transition">
                          <p className="text-xs sm:text-sm text-slate-650 leading-relaxed text-slate-700 flex-1">
                            {para}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleSpeak(para)}
                            className={`p-1.5 rounded-lg border border-slate-100 hover:bg-slate-100 transition opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0 cursor-pointer ${
                              isSpeaking ? 'opacity-100 bg-blue-50 border-blue-200 text-blue-650' : 'text-slate-400 hover:text-blue-600'
                            }`}
                            title="Read paragraph aloud"
                          >
                            {isSpeaking ? <VolumeX size={13} className="animate-pulse" /> : <Volume2 size={13} />}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* AI Generation Suggestion Panel */}
                  {(user?.role === 'admin' || user?.role === 'student' || !user?.role) && (
                    <div className="p-6 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-150/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Sparkles size={16} className="text-indigo-600" />
                          <h4 className="text-xs font-extrabold text-[#1e1b4b] uppercase tracking-wider">Unleash Livingstone AI Study Assistant</h4>
                        </div>
                        <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
                          {user?.role === 'student'
                            ? "Generate an in-depth, topic-focused study note for this week's lesson dynamically using Livingstone's AI engine."
                            : "Need a fully comprehensive study note with structured academic explanations, key vocabulary terms, teaching materials, classroom exercises, and instant interactive CBT quizzes?"
                          }
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleGenerateAISyllabus}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-100 cursor-pointer transition flex items-center gap-1.5 select-none shrink-0"
                      >
                        <Sparkles size={14} />
                        <span>{user?.role === 'student' ? 'Generate Topic Notes' : 'Generate Detailed Lesson Note'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Key Revision Points Container */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame size={14} className="text-orange-500" />
                  <span>Key Exam Memory Boosters</span>
                </h4>
                
                <ul className="text-xs text-slate-650 space-y-1.5">
                  {lesson.keyPoints.map((pt, ptIdx) => {
                    const isSpeaking = currentlySpeaking === pt;
                    return (
                      <li key={ptIdx} className="flex items-center justify-between gap-2 p-1 hover:bg-slate-250/50 rounded-lg transition group">
                        <span className="flex gap-2">
                          <span className="text-amber-500 font-bold">★</span>
                          <span>{pt}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSpeak(pt)}
                          className={`p-1 rounded hover:bg-slate-200 transition shrink-0 cursor-pointer ${
                            isSpeaking ? 'text-amber-600' : 'text-slate-400 opacity-0 group-hover:opacity-100 focus:opacity-100'
                          }`}
                          title="Read memory booster aloud"
                        >
                          {isSpeaking ? <VolumeX size={12} className="animate-pulse" /> : <Volume2 size={12} />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Practice Self-Evaluation Quiz */}
              <div className="border-t border-slate-100 pt-7 space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle size={16} className="text-blue-600" />
                    <span>Practice Test (WAEC / Curriculum Drill)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Evaluate your focus level by completing this short 3-question revision exercise.
                  </p>
                </div>

                <div className="space-y-6">
                  {lesson.quiz.map((q, qIdx) => {
                    const isCorrectSelected = answers[qIdx] === q.correctIndex;
                    const hasSelected = answers[qIdx] !== undefined;

                    return (
                      <div key={qIdx} className="p-4.5 border border-slate-150 rounded-2xl flex flex-col gap-3">
                        <span className="text-xs text-blue-700 font-extrabold uppercase tracking-widest leading-none">Question {qIdx + 1}</span>
                        <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">{q.question}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                          {q.options.map((opt, oIdx) => {
                            const isThisSelected = answers[qIdx] === oIdx;
                            const isCorrectAns = q.correctIndex === oIdx;

                            let optStyle = "border-slate-200 bg-white hover:bg-slate-50 text-slate-700";
                            
                            if (showResults) {
                              if (isCorrectAns) {
                                optStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold";
                              } else if (isThisSelected) {
                                optStyle = "border-red-500 bg-red-50 text-red-950";
                              } else {
                                optStyle = "border-slate-100 bg-white opacity-55 text-slate-605";
                              }
                            } else if (isThisSelected) {
                              optStyle = "border-blue-600 bg-blue-50/50 text-blue-950 font-semibold";
                            }

                            return (
                              <button
                                key={oIdx}
                                type="button"
                                disabled={showResults}
                                onClick={() => handleSelectOption(qIdx, oIdx)}
                                className={`p-3 text-left text-xs rounded-xl border transition-all ${optStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation block when submitted */}
                        {showResults && (
                          <div className={`p-3.5 rounded-xl text-xs flex gap-2 ${
                            isCorrectSelected ? 'bg-emerald-50 border border-emerald-100 text-emerald-800' : 'bg-red-50 border border-red-100 text-red-800'
                          }`}>
                            <AlertCircle size={15} className="shrink-0" />
                            <div>
                              <p className="font-extrabold">{isCorrectSelected ? '✓ Brilliant! Correct.' : '✗ Incorrect choice.'}</p>
                              <p className="mt-1 leading-relaxed">{q.explanation}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Submit trigger button */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {!showResults ? (
                    <>
                      <p className="text-xs font-semibold text-slate-500">
                        {Object.keys(answers).length} of {lesson.quiz.length} answered.
                      </p>
                      <button
                        type="button"
                        onClick={handleGradeQuiz}
                        disabled={Object.keys(answers).length < lesson.quiz.length}
                        className="py-2.5 px-6 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed shadow transition cursor-pointer"
                      >
                        Submit Practice Test
                      </button>
                    </>
                  ) : (
                    <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                      <div>
                        {quizScore !== null && quizScore >= 66 ? (
                          <div className="flex items-center gap-2 text-blue-800">
                            <Award className="text-amber-500 fill-amber-300" size={20} />
                            <h4 className="font-black text-sm">Superb job! Passed with {quizScore}%!</h4>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-800">
                            <RotateCcw className="text-slate-500" size={18} />
                            <h4 className="font-extrabold text-sm">Completed. Your Score is {quizScore || 0}%</h4>
                          </div>
                        )}
                        <p className="text-[11px] text-blue-700 mt-1 pl-1">
                          We have recorded this to your local academic ledger progress bars.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleResetQuiz}
                        className="px-4 py-2 bg-white hover:bg-slate-50 text-xs font-bold text-slate-750 border border-slate-200 rounded-xl transition flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw size={13} />
                        <span>Try Test Again</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </div>
          );
        })()}

        </div>

      </div>
    </div>
  );
}
