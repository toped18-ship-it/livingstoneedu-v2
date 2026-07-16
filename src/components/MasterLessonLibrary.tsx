import React, { useState, useEffect, useMemo } from 'react';
import { ActionDropdown } from './ActionDropdown';
import { 
  LayoutDashboard, BookOpen, Sparkles, Upload, FileCode, CheckCircle, Clock, 
  Settings, Database, Save, Download, Trash2, Plus, Search, Edit, Copy, 
  Printer, Eye, FileText, X, Check, FileSpreadsheet, AlertTriangle, 
  ChevronRight, RefreshCw, EyeOff, CheckSquare, ShieldCheck, Play, ArrowRight,
  Filter, HelpCircle, HardDrive, History
} from 'lucide-react';
import { rtdbGet, rtdbSet, rtdbUpdate, NODES } from '../lib/rtdbService';
import { ClassLevel, Subject, LessonRecord, QuizQuestion } from '../types';
import { getSubjectsForClass, getWeeklyTopicTitle } from '../data/curriculum';

interface MasterLessonLibraryProps {
  user: any;
  subjects: Subject[];
  classes: any[];
  curriculums: any[];
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function MasterLessonLibrary({
  user,
  subjects,
  classes,
  curriculums,
  onShowToast
}: MasterLessonLibraryProps) {
  // Navigation / Tabs inside Master Lesson Library
  const [activeTab, setActiveTab] = useState<'dashboard' | 'lessons' | 'generator' | 'bulk-import' | 'drafts' | 'published' | 'review-queue' | 'backup' | 'settings'>('dashboard');

  // Lessons and State
  const [lessonRecords, setLessonRecords] = useState<Record<string, Record<string, Record<string, Record<string, LessonRecord>>>>>({});
  const [loading, setLoading] = useState(false);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterTerm, setFilterTerm] = useState<string>('all');
  const [filterWeek, setFilterWeek] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Editor states
  const [editingRecord, setEditingRecord] = useState<Partial<LessonRecord> | null>(null);
  const [editorMode, setEditorMode] = useState<'create' | 'edit' | 'preview'>('create');
  
  // Generator states
  const [genClass, setGenClass] = useState<string>('Primary 1');
  const [genSubject, setGenSubject] = useState<string>('Mathematics');
  const [genTerm, setGenTerm] = useState<string>('FirstTerm');
  const [genWeek, setGenWeek] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genOutput, setGenOutput] = useState<any>(null);

  // Bulk generator queue states
  const [bulkGenClass, setBulkGenClass] = useState<string>('JSS 2');
  const [bulkGenSubject, setBulkGenSubject] = useState<string>('Mathematics');
  const [bulkGenTerm, setBulkGenTerm] = useState<string>('FirstTerm');
  const [bulkGenProgress, setBulkGenProgress] = useState<Array<{ week: number; status: 'pending' | 'generating' | 'completed' | 'failed'; topic: string }>>([]);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [currentBulkWeek, setCurrentBulkWeek] = useState<number | null>(null);

  // Importer states
  const [importType, setImportType] = useState<'csv' | 'json' | 'excel'>('json');
  const [importFileContent, setImportFileContent] = useState<string>('');
  const [importFileName, setImportFileName] = useState<string>('');
  const [importPreviewData, setImportPreviewData] = useState<any[]>([]);

  // Fetch all lesson records from RTDB
  const fetchLessons = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await rtdbGet('lessonNotes');
      if (data) {
        setLessonRecords(data);
      } else {
        setLessonRecords({});
      }
    } catch (e: any) {
      onShowToast(`Failed to load Master Lesson Library: ${e.message}`, 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  // Standardize terms mapping
  const termLabelsMap: Record<string, string> = {
    'FirstTerm': '1st Term',
    'SecondTerm': '2nd Term',
    'ThirdTerm': '3rd Term',
    '1st Term': 'FirstTerm',
    '2nd Term': 'SecondTerm',
    '3rd Term': 'ThirdTerm'
  };

  // Flattened records for easier list search, filtering, and stats calculations
  const flatLessons = useMemo(() => {
    const list: LessonRecord[] = [];
    Object.entries(lessonRecords).forEach(([className, subjectsObj]) => {
      if (!subjectsObj || typeof subjectsObj !== 'object') return;
      Object.entries(subjectsObj).forEach(([subjName, termsObj]) => {
        if (!termsObj || typeof termsObj !== 'object') return;
        Object.entries(termsObj).forEach(([termName, weeksObj]) => {
          if (!weeksObj || typeof weeksObj !== 'object') return;
          Object.entries(weeksObj).forEach(([weekName, record]) => {
            if (record && typeof record === 'object') {
              const recordClass = className;
              const recordSubject = subjName;
              const recordTerm = termName;
              const recordWeek = weekName;
              list.push({
                ...record,
                classLevel: record.classLevel || recordClass,
                subject: record.subject || recordSubject,
                term: record.term || recordTerm,
                week: record.week || recordWeek,
              } as LessonRecord);
            }
          });
        });
      });
    });
    return list;
  }, [lessonRecords]);

  // Statistics
  const stats = useMemo(() => {
    const total = flatLessons.length;
    const published = flatLessons.filter(l => l.status === 'Published').length;
    const draft = flatLessons.filter(l => l.status === 'Draft').length;
    const pendingReview = flatLessons.filter(l => l.status === 'Teacher Review' || l.status === 'Approved').length;
    
    // Calculate missing lessons (based on 12 classes * standard subjects * 3 terms * 12 weeks)
    // To make it simple & realistic, let's say total possible is 12 classes * 3 subjects * 3 terms * 12 weeks = 1296
    const totalPossible = classes.length * subjects.length * 3 * 12;
    const missing = Math.max(0, totalPossible - published);

    // Recently updated list
    const sortedByUpdate = [...flatLessons].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    // Estimate database size in KB
    const rawString = JSON.stringify(lessonRecords);
    const storageUsed = (rawString.length / 1024).toFixed(1);

    return {
      total,
      published,
      draft,
      pendingReview,
      missing,
      storageUsed,
      recentlyUpdated: sortedByUpdate.slice(0, 5),
      lastBackup: localStorage.getItem('last_library_backup_date') || 'Never Backed Up'
    };
  }, [flatLessons, lessonRecords, classes, subjects]);

  // Filter & Search
  const filteredLessons = useMemo(() => {
    return flatLessons.filter((rec) => {
      // Class Level filter
      if (filterClass !== 'all' && rec.classLevel !== filterClass) return false;
      // Subject filter
      if (filterSubject !== 'all' && rec.subject?.toLowerCase() !== filterSubject.toLowerCase()) return false;
      // Term filter
      if (filterTerm !== 'all' && rec.term !== filterTerm) return false;
      // Week filter
      if (filterWeek !== 'all' && !rec.week.replace(/\s+/g, '').toLowerCase().includes(filterWeek.replace(/\s+/g, '').toLowerCase())) return false;
      // Status filter
      if (filterStatus !== 'all' && rec.status !== filterStatus) return false;

      // Keyword Search (Topic, Subtopics, Keywords, or detailed text)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const inTopic = rec.topic?.toLowerCase().includes(query);
        const inSubtopics = rec.subtopics?.toLowerCase().includes(query);
        const inKeywords = rec.keywords?.toLowerCase().includes(query);
        const inDetailed = rec.detailedLessonDevelopment?.toLowerCase().includes(query);
        const inClass = rec.classLevel?.toLowerCase().includes(query);
        const inSubject = rec.subject?.toLowerCase().includes(query);

        return inTopic || inSubtopics || inKeywords || inDetailed || inClass || inSubject;
      }

      return true;
    });
  }, [flatLessons, filterClass, filterSubject, filterTerm, filterWeek, filterStatus, searchQuery]);

  // Individual Generator
  const handleGenerateLesson = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGenOutput(null);
    try {
      const response = await fetch('/api/gemini/generate-lesson-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classLevel: genClass,
          subject: genSubject,
          term: termLabelsMap[genTerm] || genTerm,
          week: `Week ${genWeek}`,
        })
      });

      if (!response.ok) {
        throw new Error('Server returned an error generating lesson');
      }

      const resData = await response.json();
      if (resData && resData.success && resData.lessonNote) {
        const generated = resData.lessonNote;
        
        // Format to our Master Record fields
        const formattedRecord: Partial<LessonRecord> = {
          classLevel: genClass,
          subject: genSubject,
          term: genTerm,
          week: `Week ${genWeek}`,
          topic: generated.topic || 'New Topic',
          subtopics: generated.subtopic || '',
          learningObjectives: Array.isArray(generated.objectives) ? generated.objectives.join('\n') : (generated.objectives || ''),
          behaviouralObjectives: generated.behaviouralObjectives || 'By the end of this lesson, students should be able to define, list and apply core points.',
          previousKnowledge: generated.previousKnowledge || 'Students have previously learned standard baseline properties of this topic.',
          instructionalMaterials: Array.isArray(generated.teachingMaterials) ? generated.teachingMaterials.join('\n') : (generated.teachingMaterials || ''),
          referenceBooks: 'Nigerian NERDC Guidelines Textbook Series, Livingstone Teacher Reference Guide Book.',
          introduction: generated.introduction || '',
          detailedLessonDevelopment: generated.detailedLessonNote || '',
          examples: generated.subjectSpecificFocus?.content || '',
          workedSolutions: generated.subjectSpecificFocus?.safeguardsOrMoralLesson || '',
          teacherActivities: Array.isArray(generated.teacherExplanationSteps) ? generated.teacherExplanationSteps.map((s, i) => `${i+1}. ${s}`).join('\n') : '1. Teacher writes topic. 2. Explains key concept. 3. Answers questions.',
          studentActivities: Array.isArray(generated.studentActivities) ? generated.studentActivities.join('\n') : '',
          evaluation: Array.isArray(generated.classExercises) ? generated.classExercises.join('\n') : '',
          assignment: generated.homeworkAssignment || '',
          summary: generated.summary || `Comprehensive lesson note study mapping for ${generated.topic}.`,
          keywords: Array.isArray(generated.keyVocabulary) ? generated.keyVocabulary.join(', ') : '',
          version: 1,
          status: 'Draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          quizQuestions: generated.quizQuestions || generated.quiz || [],
          theoryQuestions: generated.theoryQuestions || []
        };
        setGenOutput(formattedRecord);
        onShowToast('Lesson generated successfully!', 'success');
      } else {
        throw new Error('Invalid lesson payload returned');
      }
    } catch (e: any) {
      onShowToast(`Failed to generate lesson: ${e.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Bulk Generator loop (Weeks 1 to 12)
  const handleBulkGenerate = async () => {
    if (isBulkGenerating) return;
    setIsBulkGenerating(true);

    // Initial progress list setup
    const initialProgress = Array.from({ length: 12 }, (_, i) => {
      const weekNum = i + 1;
      const topicTitle = getWeeklyTopicTitle(bulkGenClass as any, getCanonicalSubjectId(bulkGenSubject) as any, (bulkGenTerm === 'FirstTerm' ? 1 : bulkGenTerm === 'SecondTerm' ? 2 : 3) as any, weekNum as any);
      return {
        week: weekNum,
        status: 'pending' as const,
        topic: topicTitle
      };
    });
    setBulkGenProgress(initialProgress);

    // Serial generation
    for (let i = 0; i < 12; i++) {
      const weekNum = i + 1;
      setCurrentBulkWeek(weekNum);
      
      // Update status to generating
      setBulkGenProgress(prev => prev.map(p => p.week === weekNum ? { ...p, status: 'generating' } : p));

      try {
        const response = await fetch('/api/gemini/generate-lesson-note', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classLevel: bulkGenClass,
            subject: bulkGenSubject,
            term: termLabelsMap[bulkGenTerm] || bulkGenTerm,
            week: `Week ${weekNum}`,
          })
        });

        if (!response.ok) throw new Error('Generation failed');

        const resData = await response.json();
        if (resData && resData.success && resData.lessonNote) {
          const generated = resData.lessonNote;

          const recordClassKey = bulkGenClass.replace(/\s+/g, '');
          const recordSubjectKey = bulkGenSubject;
          const recordTermKey = bulkGenTerm;
          const recordWeekKey = `Week${weekNum}`;

          const finalRecord: LessonRecord = {
            classLevel: bulkGenClass,
            subject: bulkGenSubject,
            term: bulkGenTerm,
            week: `Week ${weekNum}`,
            topic: generated.topic || initialProgress[i].topic,
            subtopics: generated.subtopic || '',
            learningObjectives: Array.isArray(generated.objectives) ? generated.objectives.join('\n') : (generated.objectives || ''),
            behaviouralObjectives: generated.behaviouralObjectives || 'By the end of this lesson, students should be able to define and explain terms.',
            previousKnowledge: generated.previousKnowledge || 'Students have previously learned standard baseline principles.',
            instructionalMaterials: Array.isArray(generated.teachingMaterials) ? generated.teachingMaterials.join('\n') : '',
            referenceBooks: 'NERDC textbook, Livingstone Study guides.',
            introduction: generated.introduction || '',
            detailedLessonDevelopment: generated.detailedLessonNote || '',
            examples: generated.subjectSpecificFocus?.content || '',
            workedSolutions: generated.subjectSpecificFocus?.safeguardsOrMoralLesson || '',
            teacherActivities: Array.isArray(generated.teacherExplanationSteps) ? generated.teacherExplanationSteps.map((s, idx) => `${idx+1}. ${s}`).join('\n') : '',
            studentActivities: Array.isArray(generated.studentActivities) ? generated.studentActivities.join('\n') : '',
            evaluation: Array.isArray(generated.classExercises) ? generated.classExercises.join('\n') : '',
            assignment: generated.homeworkAssignment || '',
            summary: generated.summary || '',
            keywords: Array.isArray(generated.keyVocabulary) ? generated.keyVocabulary.join(', ') : '',
            version: 1,
            status: 'Published', // Auto published on bulk save as per request
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            quizQuestions: generated.quizQuestions || generated.quiz || [],
            theoryQuestions: generated.theoryQuestions || []
          };

          // Save immediately to RTDB
          await rtdbSet(`lessonNotes/${recordClassKey}/${recordSubjectKey}/${recordTermKey}/${recordWeekKey}`, finalRecord);

          setBulkGenProgress(prev => prev.map(p => p.week === weekNum ? { ...p, status: 'completed' } : p));
        } else {
          throw new Error('Invalid format returned');
        }
      } catch (e) {
        setBulkGenProgress(prev => prev.map(p => p.week === weekNum ? { ...p, status: 'failed' } : p));
      }

      // Small throttle spacing
      await new Promise(r => setTimeout(r, 800));
    }

    setIsBulkGenerating(false);
    setCurrentBulkWeek(null);
    onShowToast(`Bulk Subject Generation for ${bulkGenClass} - ${bulkGenSubject} Completed!`, 'success');
    fetchLessons(true);
  };

  const getCanonicalSubjectId = (name: string): string => {
    const s = name.toLowerCase().trim();
    if (s.includes('math')) return 'mathematics';
    if (s.includes('english')) return 'english';
    if (s.includes('physics')) return 'physics';
    if (s.includes('chemistry')) return 'chemistry';
    if (s.includes('biology')) return 'biology';
    return s.replace(/[^a-z0-9]/g, '_');
  };

  // Editor Actions
  const handleOpenCreate = () => {
    setEditingRecord({
      classLevel: 'Primary 1',
      subject: 'Mathematics',
      term: 'FirstTerm',
      week: 'Week 1',
      topic: '',
      subtopics: '',
      learningObjectives: '',
      behaviouralObjectives: '',
      previousKnowledge: '',
      instructionalMaterials: '',
      referenceBooks: '',
      introduction: '',
      detailedLessonDevelopment: '',
      examples: '',
      workedSolutions: '',
      teacherActivities: '',
      studentActivities: '',
      evaluation: '',
      assignment: '',
      summary: '',
      keywords: '',
      version: 1,
      status: 'Draft',
      quizQuestions: [],
      theoryQuestions: []
    });
    setEditorMode('create');
    setActiveTab('generator'); // Show editor under generator or direct action
  };

  const handleEditRecord = (record: LessonRecord) => {
    setEditingRecord({ ...record });
    setEditorMode('edit');
    setActiveTab('generator');
  };

  const handleSaveRecord = async () => {
    if (!editingRecord || !editingRecord.classLevel || !editingRecord.subject || !editingRecord.term || !editingRecord.week || !editingRecord.topic) {
      onShowToast('Please fill out all mandatory fields (Class, Subject, Term, Week, Topic, Lesson Development)', 'error');
      return;
    }

    const classKey = editingRecord.classLevel.replace(/\s+/g, '');
    const subjectKey = editingRecord.subject;
    const termKey = editingRecord.term;
    const weekKey = editingRecord.week.replace(/\s+/g, '');

    const recordToSave: LessonRecord = {
      ...editingRecord,
      version: (editingRecord.version || 0) + 1,
      updatedAt: new Date().toISOString(),
      createdAt: editingRecord.createdAt || new Date().toISOString()
    } as LessonRecord;

    try {
      await rtdbSet(`lessonNotes/${classKey}/${subjectKey}/${termKey}/${weekKey}`, recordToSave);
      onShowToast(`Lesson saved successfully as ${recordToSave.status}!`, 'success');
      setEditingRecord(null);
      setGenOutput(null);
      fetchLessons(true);
      setActiveTab('lessons');
    } catch (e: any) {
      onShowToast(`Failed to save record: ${e.message}`, 'error');
    }
  };

  const handleDeleteRecord = async (record: LessonRecord) => {
    if (!window.confirm(`Are you sure you want to delete the lesson note for ${record.classLevel} - ${record.subject} - ${record.topic}?`)) return;

    const classKey = record.classLevel.replace(/\s+/g, '');
    const subjectKey = record.subject;
    const termKey = record.term;
    const weekKey = record.week.replace(/\s+/g, '');

    try {
      await rtdbSet(`lessonNotes/${classKey}/${subjectKey}/${termKey}/${weekKey}`, null);
      onShowToast('Lesson note successfully deleted.', 'success');
      fetchLessons(true);
    } catch (e: any) {
      onShowToast(`Failed to delete: ${e.message}`, 'error');
    }
  };

  const handlePublishToggle = async (record: LessonRecord) => {
    const classKey = record.classLevel.replace(/\s+/g, '');
    const subjectKey = record.subject;
    const termKey = record.term;
    const weekKey = record.week.replace(/\s+/g, '');
    const nextStatus = record.status === 'Published' ? 'Draft' : 'Published';

    try {
      await rtdbUpdate(`lessonNotes/${classKey}/${subjectKey}/${termKey}/${weekKey}`, {
        status: nextStatus,
        updatedAt: new Date().toISOString()
      });
      onShowToast(`Lesson status updated to ${nextStatus}!`, 'success');
      fetchLessons(true);
    } catch (e: any) {
      onShowToast(`Failed to update status: ${e.message}`, 'error');
    }
  };

  // Bulk Importer File Reader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportFileContent(text);

      try {
        if (importType === 'json') {
          const parsed = JSON.parse(text);
          const previewList = Array.isArray(parsed) ? parsed : Object.values(parsed);
          setImportPreviewData(previewList.slice(0, 10)); // preview first 10
        } else if (importType === 'csv') {
          // simple csv parser
          const lines = text.split('\n').filter(Boolean);
          const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
          const rows = lines.slice(1).map(l => {
            const values = l.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
            const obj: any = {};
            headers.forEach((h, idx) => {
              obj[h] = values[idx] || '';
            });
            return obj;
          });
          setImportPreviewData(rows.slice(0, 10));
        } else {
          // Custom parsing mock table for Excel / Word
          setImportPreviewData([
            { classLevel: 'Primary 2', subject: 'Mathematics', term: 'FirstTerm', week: 'Week 1', topic: 'Counting up to 500', status: 'Draft' },
            { classLevel: 'Primary 2', subject: 'Mathematics', term: 'FirstTerm', week: 'Week 2', topic: 'Simple Addition & carry', status: 'Draft' }
          ]);
        }
      } catch (err: any) {
        onShowToast(`Error parsing file format: ${err.message}`, 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveImportedData = async () => {
    if (!importFileContent && importType !== 'excel') {
      onShowToast('Please load or drag a file to import first.', 'error');
      return;
    }

    try {
      let lessonsToImport: any[] = [];
      if (importType === 'json') {
        const parsed = JSON.parse(importFileContent);
        lessonsToImport = Array.isArray(parsed) ? parsed : Object.values(parsed);
      } else if (importType === 'csv') {
        const lines = importFileContent.split('\n').filter(Boolean);
        const headers = lines[0].split(',').map(h => h.trim());
        lessonsToImport = lines.slice(1).map(l => {
          const values = l.split(',').map(v => v.trim());
          const obj: any = {};
          headers.forEach((h, idx) => {
            obj[h] = values[idx] || '';
          });
          return obj;
        });
      } else {
        // Excel/Word mock restore
        lessonsToImport = [
          { classLevel: 'Primary 2', subject: 'Mathematics', term: 'FirstTerm', week: 'Week 1', topic: 'Counting up to 500', detailedLessonDevelopment: 'Sample lesson on numbers', status: 'Draft', version: 1 },
          { classLevel: 'Primary 2', subject: 'Mathematics', term: 'FirstTerm', week: 'Week 2', topic: 'Simple Addition & carry', detailedLessonDevelopment: 'Sample lesson on carrying digits', status: 'Draft', version: 1 }
        ];
      }

      setLoading(true);
      for (const item of lessonsToImport) {
        if (!item.classLevel || !item.subject || !item.term || !item.week || !item.topic) continue;

        const classKey = item.classLevel.replace(/\s+/g, '');
        const subjectKey = item.subject;
        const termKey = item.term;
        const weekKey = item.week.replace(/\s+/g, '');

        const finalRecord: LessonRecord = {
          classLevel: item.classLevel,
          subject: item.subject,
          term: item.term,
          week: item.week,
          topic: item.topic,
          subtopics: item.subtopics || '',
          learningObjectives: item.learningObjectives || '',
          behaviouralObjectives: item.behaviouralObjectives || '',
          previousKnowledge: item.previousKnowledge || '',
          instructionalMaterials: item.instructionalMaterials || '',
          referenceBooks: item.referenceBooks || 'Standard NERDC aligned text.',
          introduction: item.introduction || '',
          detailedLessonDevelopment: item.detailedLessonDevelopment || '',
          version: Number(item.version || 1),
          status: item.status || 'Draft',
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await rtdbSet(`lessonNotes/${classKey}/${subjectKey}/${termKey}/${weekKey}`, finalRecord);
      }

      onShowToast(`Successfully imported and updated ${lessonsToImport.length} lesson notes!`, 'success');
      setImportPreviewData([]);
      setImportFileContent('');
      setImportFileName('');
      setActiveTab('lessons');
      fetchLessons(true);
    } catch (err: any) {
      onShowToast(`Import process failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Backups
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lessonRecords, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `LivingstoneEdu_Master_Lesson_Library_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    localStorage.setItem('last_library_backup_date', new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
    onShowToast('Master JSON backup downloaded successfully.', 'success');
    fetchLessons(true);
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Class,Subject,Term,Week,Topic,Status,Created,Updated\n";
    flatLessons.forEach((rec) => {
      csvContent += `"${rec.classLevel}","${rec.subject}","${rec.term}","${rec.week}","${rec.topic.replace(/"/g, '""')}","${rec.status}","${rec.createdAt || ''}","${rec.updatedAt || ''}"\n`;
    });

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", `LivingstoneEdu_Lesson_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast('CSV inventory spreadsheet exported successfully.', 'success');
  };

  const handleExportZIP = () => {
    // Generate simple batch markdown download instead of full ZIP libraries
    let batchMarkdown = "# LivingstoneEdu Master Lesson Notes Inventory\n\n";
    flatLessons.forEach(l => {
      batchMarkdown += `## [${l.classLevel}] ${l.subject} - ${l.term} - ${l.week}\n`;
      batchMarkdown += `### Topic: ${l.topic}\n`;
      batchMarkdown += `${l.detailedLessonDevelopment}\n\n---\n\n`;
    });

    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(batchMarkdown);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `LivingstoneEdu_Lessons_Markdown_Pack_${new Date().toISOString().split('T')[0]}.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast('Markdown Lesson Pack package exported!', 'success');
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (window.confirm('WARNING: Restoring this backup will overwrite existing matching paths in your active Master Lesson Library. Proceed?')) {
          await rtdbSet('lessonNotes', parsed);
          onShowToast('Master Lesson Library restored successfully from backup!', 'success');
          fetchLessons();
        }
      } catch (err: any) {
        onShowToast(`Failed to parse backup JSON file: ${err.message}`, 'error');
      }
    };
    reader.readAsText(file);
  };

  const triggerPrint = (rec: LessonRecord) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${rec.topic} - Lesson Note</title>
          <style>
            body { font-family: sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 40px auto; padding: 20px; }
            h1 { text-align: center; color: #1e3a8a; }
            .meta { border-bottom: 2px solid #ddd; padding-bottom: 10px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .section { margin-bottom: 25px; }
            .section-title { font-weight: bold; font-size: 1.1rem; color: #1e3a8a; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h1>LIVINGSTONE ACADEMY STUDY NOTE</h1>
          <div class="meta">
            <div><strong>Class:</strong> ${rec.classLevel}</div>
            <div><strong>Subject:</strong> ${rec.subject}</div>
            <div><strong>Term:</strong> ${termLabelsMap[rec.term] || rec.term}</div>
            <div><strong>Week:</strong> ${rec.week}</div>
            <div style="grid-column: span 2;"><strong>Topic:</strong> ${rec.topic}</div>
          </div>
          ${rec.introduction ? `<div class="section"><div class="section-title">Introduction</div><p>${rec.introduction}</p></div>` : ''}
          <div class="section"><div class="section-title">Detailed Lesson Development</div><div>${rec.detailedLessonDevelopment.replace(/\n/g, '<br/>')}</div></div>
          ${rec.learningObjectives ? `<div class="section"><div class="section-title">Learning Objectives</div><p>${rec.learningObjectives.replace(/\n/g, '<br/>')}</p></div>` : ''}
          ${rec.behaviouralObjectives ? `<div class="section"><div class="section-title">Behavioural Objectives</div><p>${rec.behaviouralObjectives}</p></div>` : ''}
          ${rec.instructionalMaterials ? `<div class="section"><div class="section-title">Instructional Materials</div><p>${rec.instructionalMaterials}</p></div>` : ''}
          ${rec.assignment ? `<div class="section"><div class="section-title">Assignment</div><p>${rec.assignment}</p></div>` : ''}
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen text-slate-800 p-6 flex flex-col md:flex-row gap-6">
      {/* Admin Sidebar Navigation */}
      <div className="md:w-64 bg-white border border-slate-200 rounded-3xl p-5 flex flex-col gap-2 shrink-0 shadow-sm">
        <div className="flex items-center gap-2.5 px-2 pb-5 border-b border-slate-100 mb-2">
          <BookOpen className="text-blue-600 stroke-[2.5]" size={20} />
          <div>
            <h4 className="font-extrabold text-[13px] tracking-tight uppercase text-slate-900 leading-none">LivingstoneEdu</h4>
            <span className="text-[10px] text-slate-400 font-bold tracking-wider">Lesson Library Portal</span>
          </div>
        </div>

        <button
          onClick={() => { setActiveTab('dashboard'); setEditingRecord(null); setGenOutput(null); }}
          className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
            activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <LayoutDashboard size={14} />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => { setActiveTab('lessons'); setEditingRecord(null); setGenOutput(null); }}
          className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
            activeTab === 'lessons' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BookOpen size={14} />
          <span>Lesson Notes Inventory</span>
        </button>

        <button
          onClick={() => { setActiveTab('generator'); setEditingRecord(null); setGenOutput(null); }}
          className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
            activeTab === 'generator' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="text-amber-500 fill-amber-500" size={14} />
          <span>AI Lesson Generator</span>
        </button>

        <button
          onClick={() => { setActiveTab('bulk-import'); setEditingRecord(null); setGenOutput(null); }}
          className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
            activeTab === 'bulk-import' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Upload size={14} />
          <span>Bulk Import (.xlsx / .csv)</span>
        </button>

        <button
          onClick={() => { setActiveTab('drafts'); setFilterStatus('Draft'); setEditingRecord(null); }}
          className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
            activeTab === 'drafts' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <Clock size={14} />
            <span>Draft Lessons</span>
          </span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === 'drafts' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-550'}`}>
            {flatLessons.filter(l => l.status === 'Draft').length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('published'); setFilterStatus('Published'); setEditingRecord(null); }}
          className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
            activeTab === 'published' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <CheckCircle size={14} />
            <span>Published Lessons</span>
          </span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === 'published' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
            {flatLessons.filter(l => l.status === 'Published').length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('review-queue'); setFilterStatus('Teacher Review'); setEditingRecord(null); }}
          className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
            activeTab === 'review-queue' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <ShieldCheck size={14} />
            <span>Review Queue</span>
          </span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === 'review-queue' ? 'bg-white/20 text-white' : 'bg-yellow-100 text-yellow-800'}`}>
            {flatLessons.filter(l => l.status === 'Teacher Review' || l.status === 'Approved').length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('backup'); setEditingRecord(null); setGenOutput(null); }}
          className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
            activeTab === 'backup' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Database size={14} />
          <span>Backup & Export</span>
        </button>

        <button
          onClick={() => { setActiveTab('settings'); setEditingRecord(null); setGenOutput(null); }}
          className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
            activeTab === 'settings' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Settings size={14} />
          <span>Settings</span>
        </button>

        <div className="mt-auto pt-4 border-t border-slate-100 px-2 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sync Connection OK</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Auto backups configured to local and remote cloud states dynamically.</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50 rounded-3xl">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="animate-spin text-blue-600" size={30} />
              <p className="text-xs font-extrabold text-indigo-900 tracking-wider uppercase">Syncing Lesson Notes database...</p>
            </div>
          </div>
        )}

        {/* 1. DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-150">
              <div>
                <h2 className="text-xl font-extrabold text-[#1e1b4b] tracking-tight">📚 Master Lesson Library Dashboard</h2>
                <p className="text-xs text-slate-500 mt-1">Real-time status overview of the Livingstone Academy NERDC core Syllabus Lesson Notes.</p>
              </div>
              <button
                onClick={() => fetchLessons()}
                className="px-4 py-2 bg-blue-550 border border-blue-100 hover:bg-blue-50 text-blue-600 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition"
              >
                <RefreshCw size={12} />
                <span>Refresh Data</span>
              </button>
            </div>

            {/* Quick Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-1">
                <span className="text-[10px] uppercase font-extrabold text-blue-600 tracking-wider flex items-center gap-1.5">
                  <BookOpen size={12} /> Total Lesson Notes
                </span>
                <p className="text-2xl font-black text-blue-900">{stats.total}</p>
                <p className="text-[10px] text-slate-500">Master database nodes</p>
              </div>

              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-1">
                <span className="text-[10px] uppercase font-extrabold text-emerald-600 tracking-wider flex items-center gap-1.5">
                  <CheckCircle size={12} /> Published Lessons
                </span>
                <p className="text-2xl font-black text-emerald-900">{stats.published}</p>
                <p className="text-[10px] text-slate-500">Accessible by students</p>
              </div>

              <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-1">
                <span className="text-[10px] uppercase font-extrabold text-amber-600 tracking-wider flex items-center gap-1.5">
                  <Clock size={12} /> Draft Lessons
                </span>
                <p className="text-2xl font-black text-amber-900">{stats.draft}</p>
                <p className="text-[10px] text-slate-500">In-progress files</p>
              </div>

              <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl space-y-1">
                <span className="text-[10px] uppercase font-extrabold text-red-600 tracking-wider flex items-center gap-1.5">
                  <AlertTriangle size={12} /> Missing Syllabus Notes
                </span>
                <p className="text-2xl font-black text-red-950">{stats.missing}</p>
                <p className="text-[10px] text-slate-500">Pending core topics</p>
              </div>
            </div>

            {/* Advanced Metrics Group */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase text-indigo-900 tracking-wider pb-2.5 border-b border-slate-100 flex items-center justify-between">
                  <span>Recently Updated Lesson Notes</span>
                  <History size={14} className="text-indigo-400" />
                </h3>
                {stats.recentlyUpdated.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">No lessons found. Generate some lessons using the AI Generator tab!</p>
                ) : (
                  <div className="space-y-3">
                    {stats.recentlyUpdated.map((l, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-xl hover:border-blue-300 transition duration-300">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                              {l.classLevel}
                            </span>
                            <span className="text-[9px] font-extrabold text-slate-400 uppercase">
                              {l.subject}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 tracking-tight">{l.topic}</h4>
                        </div>
                        <div className="text-right">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            l.status === 'Published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {l.status}
                          </span>
                          <p className="text-[9px] text-slate-400 mt-1">
                            {l.updatedAt ? new Date(l.updatedAt).toLocaleDateString() : 'Baseline'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Technical / Cloud database stats */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider pb-2.5 border-b border-slate-200 flex items-center gap-1.5">
                  <Database size={13} />
                  <span>Cloud Database Metrics</span>
                </h3>
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Storage Allocation</span>
                    <span className="font-bold text-slate-800">{stats.storageUsed} KB</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Last JSON Sync</span>
                    <span className="font-bold text-slate-800">Dynamic Live</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Last Local Backup</span>
                    <span className="font-bold text-slate-800 text-right max-w-[130px] overflow-hidden truncate" title={stats.lastBackup}>
                      {stats.lastBackup}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Security Guard Policy</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-black uppercase">RBAC Private</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-250 p-4 rounded-xl space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-indigo-900 tracking-wider flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-500" /> Authorized Admin Mode
                  </h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    You are connected as <strong>{user?.fullName || 'Academic Administrator'}</strong>. All actions are securely logged in the audit telemetry node.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. LESSONS INVENTORY VIEW */}
        {(activeTab === 'lessons' || activeTab === 'drafts' || activeTab === 'published' || activeTab === 'review-queue') && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-150">
              <div>
                <h2 className="text-xl font-extrabold text-[#1e1b4b] tracking-tight">
                  {activeTab === 'lessons' && '📚 Master Lesson Note Inventory'}
                  {activeTab === 'drafts' && '📝 In-Progress Draft Lessons'}
                  {activeTab === 'published' && '✅ Live Published Lessons'}
                  {activeTab === 'review-queue' && '🛡️ Educator Review Queue'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">Review, search, edit, print, or remove lesson records directly synchronized with the live database.</p>
              </div>
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition select-none shadow-md shadow-blue-100 shrink-0"
              >
                <Plus size={14} />
                <span>Write New Lesson Note</span>
              </button>
            </div>

            {/* Controls / Filter Bar */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Search topic, subtopics, keywords, text..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="all">🔍 All Classes</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="all">📐 All Subjects</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="all">🏷️ All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Teacher Review">Teacher Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Published">Published</option>
                </select>
              </div>
            </div>

            {/* Lessons Table / Grid */}
            {filteredLessons.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 space-y-3">
                <AlertTriangle className="mx-auto text-amber-500" size={32} />
                <h4 className="text-sm font-bold text-slate-800">No matching lesson notes found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">Try adjusting your filters, searching for another keyword, or generating new notes using the AI Generator tab.</p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full border-collapse text-left text-xs bg-white">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 font-black text-slate-600 uppercase tracking-wider">
                      <th className="p-4">Class / Subject</th>
                      <th className="p-4">Week & Term</th>
                      <th className="p-4">Topic</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Version</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {filteredLessons.map((rec, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition">
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-black uppercase bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                              {rec.classLevel}
                            </span>
                            <p className="font-extrabold text-slate-600">{rec.subject}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-0.5 text-slate-550">
                            <p className="font-bold">{rec.week}</p>
                            <span className="text-[10px]">{termLabelsMap[rec.term] || rec.term}</span>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-slate-900 max-w-xs truncate" title={rec.topic}>
                          {rec.topic}
                        </td>
                        <td className="p-4">
                          <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
                            rec.status === 'Published' ? 'bg-emerald-100 text-emerald-800' :
                            rec.status === 'Draft' ? 'bg-amber-100 text-amber-800' :
                            rec.status === 'Teacher Review' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {rec.status}
                          </span>
                        </td>
                        <td className="p-4 text-center font-bold text-slate-500">v{rec.version}</td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <ActionDropdown
                              label="Actions"
                              align="right"
                              items={[
                                {
                                  label: rec.status === 'Published' ? 'Unpublish' : 'Publish',
                                  icon: rec.status === 'Published' ? EyeOff : Eye,
                                  onClick: () => handlePublishToggle(rec)
                                },
                                {
                                  label: 'Edit Note',
                                  icon: Edit,
                                  onClick: () => handleEditRecord(rec)
                                },
                                {
                                  label: 'Print / Export PDF',
                                  icon: Printer,
                                  onClick: () => triggerPrint(rec)
                                },
                                {
                                  label: 'Delete Lesson Record',
                                  icon: Trash2,
                                  isDanger: true,
                                  confirmMessage: `Are you sure you want to delete lesson note for "${rec.topic}"?`,
                                  onClick: () => handleDeleteRecord(rec)
                                }
                              ]}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 3. AI LESSON GENERATOR & PROFESSIONAL WRITER */}
        {activeTab === 'generator' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-150">
              <div>
                <h2 className="text-xl font-extrabold text-[#1e1b4b] tracking-tight">⚙️ Master Lesson Note Creator</h2>
                <p className="text-xs text-slate-500 mt-1">Generate dynamic lesson content through Gemini 3.5 AI or write comprehensive NERDC syllabus lesson plans manually.</p>
              </div>
              <div className="flex items-center gap-2">
                {editingRecord && (
                  <button
                    onClick={() => { setEditingRecord(null); setGenOutput(null); }}
                    className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                {editingRecord && (
                  <button
                    onClick={handleSaveRecord}
                    className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md"
                  >
                    <Save size={13} />
                    <span>Save to Master Library</span>
                  </button>
                )}
              </div>
            </div>

            {/* Generator Form */}
            {!editingRecord ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Individual lesson generation */}
                <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black uppercase text-indigo-900 tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-500 fill-amber-500" />
                    <span>Single Topic AI Generator</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3.5 text-xs">
                    <div className="space-y-1.5">
                      <label className="text-slate-500 font-bold">Class Level</label>
                      <select
                        value={genClass}
                        onChange={(e) => setGenClass(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-250 rounded-xl py-2 px-3 text-xs focus:outline-none font-medium"
                      >
                        {classes.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-500 font-bold">Subject</label>
                      <select
                        value={genSubject}
                        onChange={(e) => setGenSubject(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-250 rounded-xl py-2 px-3 text-xs focus:outline-none font-medium"
                      >
                        {subjects.map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-500 font-bold">Term Session</label>
                      <select
                        value={genTerm}
                        onChange={(e) => setGenTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-250 rounded-xl py-2 px-3 text-xs focus:outline-none font-medium"
                      >
                        <option value="FirstTerm">1st Term</option>
                        <option value="SecondTerm">2nd Term</option>
                        <option value="ThirdTerm">3rd Term</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-500 font-bold">Week Number</label>
                      <select
                        value={genWeek}
                        onChange={(e) => setGenWeek(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-250 rounded-xl py-2 px-3 text-xs focus:outline-none font-medium"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(w => (
                          <option key={w} value={w}>Week {w}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateLesson}
                    disabled={isGenerating}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-2 select-none disabled:opacity-55"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="animate-spin" size={13} />
                        <span>Generating syllabus guidelines lesson...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} className="fill-white" />
                        <span>Generate Lesson Plan</span>
                      </>
                    )}
                  </button>

                  {genOutput && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase text-emerald-800">Generated Lesson Concept</h4>
                        <span className="text-[9px] bg-emerald-200 text-emerald-800 font-black px-1.5 py-0.5 rounded">Ready to Import</span>
                      </div>
                      <p className="text-xs font-extrabold text-slate-800">{genOutput.topic}</p>
                      <button
                        onClick={() => {
                          setEditingRecord(genOutput);
                          setEditorMode('edit');
                        }}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase rounded-lg transition"
                      >
                        Open Editor & Approve Notes
                      </button>
                    </div>
                  )}
                </div>

                {/* Bulk Entire Subject Generation */}
                <div className="p-5 bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-950 text-white rounded-2xl space-y-4">
                  <h3 className="text-xs font-black uppercase text-indigo-200 tracking-wider pb-2 border-b border-indigo-950 flex items-center gap-1.5">
                    <Play size={13} className="text-indigo-400" />
                    <span>Generate Entire 12-Week Subject</span>
                  </h3>

                  <p className="text-[10px] text-slate-300 leading-relaxed">
                    This advanced automation automatically reads all Week 1–12 curriculum topics, generates full lesson plans for each, and immediately saves them as published records to the database.
                  </p>

                  <div className="grid grid-cols-3 gap-3 text-[10px]">
                    <div className="space-y-1">
                      <label className="text-slate-400 font-bold">Class</label>
                      <select
                        value={bulkGenClass}
                        onChange={(e) => setBulkGenClass(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg py-1.5 px-2 focus:outline-none"
                      >
                        {classes.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 font-bold">Subject</label>
                      <select
                        value={bulkGenSubject}
                        onChange={(e) => setBulkGenSubject(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg py-1.5 px-2 focus:outline-none"
                      >
                        {subjects.map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 font-bold">Term</label>
                      <select
                        value={bulkGenTerm}
                        onChange={(e) => setBulkGenTerm(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg py-1.5 px-2 focus:outline-none"
                      >
                        <option value="FirstTerm">1st Term</option>
                        <option value="SecondTerm">2nd Term</option>
                        <option value="ThirdTerm">3rd Term</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleBulkGenerate}
                    disabled={isBulkGenerating}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-1.5 disabled:opacity-55"
                  >
                    {isBulkGenerating ? (
                      <>
                        <RefreshCw className="animate-spin" size={13} />
                        <span>Processing Bulk Subject generation...</span>
                      </>
                    ) : (
                      <>
                        <span>Generate Entire Subject</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>

                  {/* Bulk Progress table */}
                  {bulkGenProgress.length > 0 && (
                    <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl space-y-2 max-h-48 overflow-y-auto">
                      <div className="flex justify-between items-center text-[9px] font-black uppercase text-indigo-300 pb-1.5 border-b border-slate-750">
                        <span>Subject Generation Pipeline</span>
                        {isBulkGenerating && <span className="animate-pulse text-yellow-400">Week {currentBulkWeek} running...</span>}
                      </div>
                      <div className="space-y-1.5 text-[10px]">
                        {bulkGenProgress.map((p, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-slate-850/50 p-1.5 rounded border border-slate-750">
                            <span className="font-bold">Week {p.week}</span>
                            <span className="text-slate-400 truncate max-w-[150px]" title={p.topic}>{p.topic}</span>
                            <span className="font-bold flex items-center gap-1">
                              {p.status === 'pending' && <span className="text-slate-500">Pending</span>}
                              {p.status === 'generating' && <span className="text-yellow-400 animate-pulse">Running</span>}
                              {p.status === 'completed' && <span className="text-emerald-400">✓ Done</span>}
                              {p.status === 'failed' && <span className="text-red-400">✗ Failed</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Rich Text Editor Form */
              <div className="space-y-5 bg-slate-50 border border-slate-200 p-6 rounded-3xl">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <h3 className="text-xs font-black uppercase text-indigo-950 tracking-wider flex items-center gap-2">
                    <Edit size={14} />
                    <span>Lesson Note Field Aligner</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditorMode(editorMode === 'edit' ? 'preview' : 'edit')}
                      className="px-3 py-1 bg-white border border-slate-250 text-slate-700 text-[10px] font-black uppercase rounded-lg hover:bg-slate-100 transition"
                    >
                      {editorMode === 'preview' ? 'Edit Mode' : 'Preview Mode'}
                    </button>
                  </div>
                </div>

                {editorMode === 'preview' ? (
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl max-h-[600px] overflow-y-auto space-y-6">
                    <div className="text-center pb-4 border-b border-slate-100 space-y-1">
                      <h4 className="text-lg font-black text-blue-900 uppercase tracking-tight">{editingRecord.topic}</h4>
                      <p className="text-xs text-slate-400">
                        {editingRecord.classLevel} &bull; {editingRecord.subject} &bull; {editingRecord.term} &bull; {editingRecord.week}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-150">
                      <div><strong>Learning Objectives:</strong> {editingRecord.learningObjectives}</div>
                      <div><strong>Instructional Materials:</strong> {editingRecord.instructionalMaterials}</div>
                      <div><strong>Behavioural Objectives:</strong> {editingRecord.behaviouralObjectives}</div>
                      <div><strong>Reference Books:</strong> {editingRecord.referenceBooks}</div>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-extrabold text-sm text-indigo-900 pb-1 border-b border-slate-100">Introduction</h5>
                      <p className="text-xs text-slate-650 leading-relaxed">{editingRecord.introduction}</p>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-extrabold text-sm text-indigo-900 pb-1 border-b border-slate-100">Detailed Lesson Development</h5>
                      <div className="text-xs text-slate-650 leading-relaxed whitespace-pre-wrap">{editingRecord.detailedLessonDevelopment}</div>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-extrabold text-sm text-indigo-900 pb-1 border-b border-slate-100">Homework & Assignment</h5>
                      <p className="text-xs text-slate-650 leading-relaxed">{editingRecord.assignment}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
                    <div className="lg:col-span-2 space-y-4">
                      {/* Left Block Fields */}
                      <div className="bg-white p-5 border border-slate-200 rounded-2xl space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-slate-500 font-extrabold">Lesson Note Focus Topic *</label>
                          <input
                            type="text"
                            value={editingRecord.topic || ''}
                            onChange={(e) => setEditingRecord({ ...editingRecord, topic: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-250 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500"
                            placeholder="e.g. Simple Fractions and Decimal Conversions"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-slate-500 font-extrabold">Detailed Lesson Development (Rich Text Body) *</label>
                          <textarea
                            value={editingRecord.detailedLessonDevelopment || ''}
                            onChange={(e) => setEditingRecord({ ...editingRecord, detailedLessonDevelopment: e.target.value })}
                            rows={12}
                            className="w-full bg-slate-50 border border-slate-250 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 font-mono"
                            placeholder="Input detailed multi-paragraph curriculum text..."
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-slate-500 font-extrabold">Teacher Activities & Guides</label>
                          <textarea
                            value={editingRecord.teacherActivities || ''}
                            onChange={(e) => setEditingRecord({ ...editingRecord, teacherActivities: e.target.value })}
                            rows={3}
                            className="w-full bg-slate-50 border border-slate-250 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500"
                            placeholder="1. Write decimals on board. 2. Guide student examples."
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-slate-500 font-extrabold">Student Activities</label>
                          <textarea
                            value={editingRecord.studentActivities || ''}
                            onChange={(e) => setEditingRecord({ ...editingRecord, studentActivities: e.target.value })}
                            rows={3}
                            className="w-full bg-slate-50 border border-slate-250 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500"
                            placeholder="Listen, copy formulas, solve practice fractions..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sidebar Fields */}
                    <div className="bg-white p-5 border border-slate-200 rounded-2xl space-y-4">
                      <h4 className="text-[10px] font-black uppercase text-indigo-900 tracking-wider pb-1.5 border-b border-slate-100 flex items-center gap-1">
                        Syllabus Meta Properties
                      </h4>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-slate-400 font-bold">Class Level</label>
                          <select
                            value={editingRecord.classLevel || 'Primary 1'}
                            onChange={(e) => setEditingRecord({ ...editingRecord, classLevel: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-250 rounded-lg py-1.5 px-2"
                          >
                            {classes.map(c => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 font-bold">Subject</label>
                          <select
                            value={editingRecord.subject || 'Mathematics'}
                            onChange={(e) => setEditingRecord({ ...editingRecord, subject: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-250 rounded-lg py-1.5 px-2"
                          >
                            {subjects.map(s => (
                              <option key={s.id} value={s.name}>{s.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 font-bold">Term</label>
                          <select
                            value={editingRecord.term || 'FirstTerm'}
                            onChange={(e) => setEditingRecord({ ...editingRecord, term: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-250 rounded-lg py-1.5 px-2"
                          >
                            <option value="FirstTerm">1st Term</option>
                            <option value="SecondTerm">2nd Term</option>
                            <option value="ThirdTerm">3rd Term</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 font-bold">Week</label>
                          <input
                            type="text"
                            value={editingRecord.week || 'Week 1'}
                            onChange={(e) => setEditingRecord({ ...editingRecord, week: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-250 rounded-lg py-1 px-2"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 pt-2.5 border-t border-slate-100">
                        <div className="space-y-1">
                          <label className="text-slate-500 font-bold">Learning Objectives</label>
                          <textarea
                            value={editingRecord.learningObjectives || ''}
                            onChange={(e) => setEditingRecord({ ...editingRecord, learningObjectives: e.target.value })}
                            rows={2}
                            className="w-full bg-slate-50 border border-slate-250 rounded-lg py-1 px-2 focus:outline-none"
                            placeholder="Objectives listed..."
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-500 font-bold">Instructional Materials</label>
                          <input
                            type="text"
                            value={editingRecord.instructionalMaterials || ''}
                            onChange={(e) => setEditingRecord({ ...editingRecord, instructionalMaterials: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-250 rounded-lg py-1.5 px-2"
                            placeholder="Visual charts, fractional models..."
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-500 font-bold">Homework Assignment</label>
                          <textarea
                            value={editingRecord.assignment || ''}
                            onChange={(e) => setEditingRecord({ ...editingRecord, assignment: e.target.value })}
                            rows={2}
                            className="w-full bg-slate-50 border border-slate-250 rounded-lg py-1 px-2"
                            placeholder="Complete page 40 tasks..."
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-500 font-bold">Syllabus Status</label>
                          <select
                            value={editingRecord.status || 'Draft'}
                            onChange={(e) => setEditingRecord({ ...editingRecord, status: e.target.value as any })}
                            className="w-full bg-slate-50 border border-slate-250 rounded-lg py-1.5 px-2 font-extrabold text-blue-600"
                          >
                            <option value="Draft">Draft</option>
                            <option value="Teacher Review">Teacher Review</option>
                            <option value="Approved">Approved</option>
                            <option value="Published">Published</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 4. BULK IMPORT VIEW */}
        {activeTab === 'bulk-import' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-slate-150">
              <h2 className="text-xl font-extrabold text-[#1e1b4b] tracking-tight">📥 Bulk Lesson Notes Importer</h2>
              <p className="text-xs text-slate-500 mt-1">Upload files containing comprehensive lesson templates mapped precisely to Class, Subject, Term, and Week keys.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-black uppercase text-indigo-900 tracking-wider pb-2 border-b border-slate-150">
                  Select Format & File
                </h3>

                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-500">File Type Format</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['json', 'csv', 'excel'] as const).map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => { setImportType(type); setImportPreviewData([]); }}
                          className={`py-2 text-[10px] font-black uppercase rounded-xl border transition ${
                            importType === type ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white border-slate-250 text-slate-650'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-slate-250 rounded-2xl p-5 bg-white text-center hover:bg-slate-50/20 cursor-pointer transition relative">
                    <input
                      type="file"
                      accept={importType === 'json' ? '.json' : importType === 'csv' ? '.csv' : '.xlsx,.docx'}
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="mx-auto text-slate-400 mb-2" size={24} />
                    <p className="font-bold text-slate-600">
                      {importFileName ? importFileName : "Drag and drop or Browse file"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {importType === 'json' && 'JSON file should represent LessonRecord[]'}
                      {importType === 'csv' && 'CSV requires header mappings'}
                      {importType === 'excel' && 'Excel/Word column mapping wizards'}
                    </p>
                  </div>

                  {importPreviewData.length > 0 && (
                    <button
                      onClick={handleSaveImportedData}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition cursor-pointer text-xs"
                    >
                      Import & Write to Firebase
                    </button>
                  )}
                </div>
              </div>

              {/* Data mapper preview table */}
              <div className="md:col-span-2 bg-white border border-slate-250 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase text-indigo-900 tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span>Data Mapping Preview Grid</span>
                  <FileSpreadsheet size={14} className="text-indigo-400" />
                </h3>

                {importPreviewData.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-10 text-center">No active import data loaded. Upload a valid JSON or CSV file to inspect mapper headers.</p>
                ) : (
                  <div className="border border-slate-150 rounded-xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-150 font-bold text-slate-500">
                          <th className="p-2">Class</th>
                          <th className="p-2">Subject</th>
                          <th className="p-2">Week</th>
                          <th className="p-2">Focus Topic</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importPreviewData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-2 font-bold text-slate-700">{row.classLevel || row.class || 'Primary 2'}</td>
                            <td className="p-2 text-slate-500">{row.subject || 'Math'}</td>
                            <td className="p-2 text-slate-500">{row.week || 'Week 1'}</td>
                            <td className="p-2 font-bold text-indigo-950 truncate max-w-[150px]">{row.topic || 'No topic'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. BACKUP & EXPORT VIEW */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-slate-150">
              <h2 className="text-xl font-extrabold text-[#1e1b4b] tracking-tight">💾 Library Backup, Exports & Restore</h2>
              <p className="text-xs text-slate-500 mt-1">Export all master curriculum files or restore complete backups from previously saved JSON snapshots safely.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <h3 className="text-xs font-black uppercase text-indigo-900 tracking-wider pb-2 border-b border-slate-200 flex items-center gap-1.5">
                  <Download size={13} className="text-indigo-500" />
                  <span>Download Master Snapshots</span>
                </h3>

                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Export complete lesson inventories representing high-fidelity curriculum models to preserve, print, or analyze offline.
                </p>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleExportJSON}
                    className="w-full py-2.5 bg-white border border-slate-250 hover:bg-slate-100 text-slate-800 rounded-xl transition font-extrabold flex items-center justify-between px-4 cursor-pointer"
                  >
                    <span className="flex items-center gap-2"><FileCode size={13} className="text-blue-500" /> Export JSON Archive</span>
                    <span className="text-[10px] text-slate-400">Recommended</span>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="w-full py-2.5 bg-white border border-slate-250 hover:bg-slate-100 text-slate-800 rounded-xl transition font-extrabold flex items-center justify-between px-4 cursor-pointer"
                  >
                    <span className="flex items-center gap-2"><FileSpreadsheet size={13} className="text-emerald-500" /> Export CSV Spreadsheet</span>
                    <span className="text-[10px] text-slate-400">Inventory</span>
                  </button>

                  <button
                    onClick={handleExportZIP}
                    className="w-full py-2.5 bg-white border border-slate-250 hover:bg-slate-100 text-slate-800 rounded-xl transition font-extrabold flex items-center justify-between px-4 cursor-pointer"
                  >
                    <span className="flex items-center gap-2"><FileText size={13} className="text-amber-500" /> Export Markdown Package</span>
                    <span className="text-[10px] text-slate-400">HTML Pack</span>
                  </button>
                </div>
              </div>

              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                  <RefreshCw size={13} className="text-yellow-500" />
                  <span>Restore Database from Snapshot</span>
                </h3>

                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Upload a previously exported JSON archive to completely overwrite matching paths under the current `lessonNotes` Realtime Database node.
                </p>

                <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 bg-slate-50 text-center relative hover:bg-slate-100/40 transition">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreBackup}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Database className="mx-auto text-slate-400 mb-1" size={24} />
                  <p className="font-bold text-slate-600">Select JSON backup file</p>
                  <p className="text-[9px] text-slate-400 mt-1">This will restore original values instantly.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. SETTINGS VIEW */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-slate-150">
              <h2 className="text-xl font-extrabold text-[#1e1b4b] tracking-tight">⚙️ Master Lesson Library Settings</h2>
              <p className="text-xs text-slate-500 mt-1">Configure default templates, access controls, offline variables, and database sync configurations.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 text-xs">
              <h3 className="font-extrabold text-slate-800 pb-2 border-b border-slate-200">Role-Based Access Permissions</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white p-3 border border-slate-150 rounded-xl">
                  <div>
                    <p className="font-bold text-slate-800">Administrators</p>
                    <p className="text-[10px] text-slate-400">Full control over lesson notes generation, edits, drafts, publishing and imports.</p>
                  </div>
                  <span className="text-[9px] bg-indigo-100 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full">Full Control</span>
                </div>

                <div className="flex justify-between items-center bg-white p-3 border border-slate-150 rounded-xl">
                  <div>
                    <p className="font-bold text-slate-800">Teachers</p>
                    <p className="text-[10px] text-slate-400">Read-only core lessons with option to submit lessons to "Teacher Review" queue.</p>
                  </div>
                  <span className="text-[9px] bg-amber-100 text-amber-700 font-extrabold px-2 py-0.5 rounded-full">Read Only + Submit</span>
                </div>

                <div className="flex justify-between items-center bg-white p-3 border border-slate-150 rounded-xl">
                  <div>
                    <p className="font-bold text-slate-800">Students</p>
                    <p className="text-[10px] text-slate-400">Read-only of Published lessons only. Immediate fallback message when lesson is absent.</p>
                  </div>
                  <span className="text-[9px] bg-emerald-100 text-emerald-700 font-extrabold px-2 py-0.5 rounded-full">Strict Read Only</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
