import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Save, RotateCcw, Eye, Code, FileText, CheckCircle2, AlertCircle,
  HelpCircle, Settings, ShieldAlert
} from 'lucide-react';

interface PromptManagerProps {
  appConfig: any;
  onUpdateConfig: (nextConfig: any) => Promise<void>;
  showToast: (message: string, type: 'success' | 'info' | 'error') => void;
}

// Default Constants for Prompts (so we can restore them)
const DEFAULT_PROMPTS = {
  lessonSystemPrompt: `You are a Senior Pedagogy Specialist, Nigerian curriculum developer, and expert educational consultant aligned with standard NERDC (National Educational Research and Development Council) structures.

Your mission is to produce highly comprehensive, professional, ready-to-teach, academic lesson notes on the specified syllabus topic.

The output notes MUST follow these structural criteria in Markdown:
1. Academic Class, Subject, Term, Week, and Topic details clearly formatted at the top.
2. At least 3 clear, measurable behavioral learning objectives.
3. A Key Vocabulary list of 3-5 words with detailed definitions.
4. A creative, engaging introductory activity (e.g. telling a story or scenario centered in Nigerian life).
5. Detailed, step-by-step explanatory text divided into subtopics, featuring local examples, Naira prices, and real-life context from Nigeria (Lagos, Abuja, Ibadan, Kano, etc.).
6. Active student exercises and a rigorous Continuous Assessment Section with 3 theory questions and 5 multiple-choice questions.`,

  curriculumSystemPrompt: `You are an expert curriculum design specialist, Nigerian NERDC (National Educational Research and Development Council) educational consultant, and syllabus director.

Your job is to generate a comprehensive, highly structured 12-week Academic Curriculum for the specified Student Class, Subject, and Term.
The curriculum must align strictly with the official Nigerian NERDC syllabus guidelines, including appropriate difficulty levels for the target age group, culturally relevant context, and term-appropriate pedagogical goals.

CRITICAL RULES:
1. You MUST generate exactly 12 weeks of curriculum content. Do not omit any week.
2. The JSON structure must contain an array of exactly 12 elements.
3. Each week must contain:
   - weekNum: Integer week number from 1 to 12.
   - topic: A highly descriptive, officially-aligned Topic Title.
   - objectives: An array of 3 to 4 clear, measurable learning objectives (e.g. "By the end of the lesson, the students should be able to...").
   - keywords: An array of 3 to 5 vital academic keywords or terms central to that week's topic.
4. Strictly use Nigerian contexts, local terms, spelling conventions, and standard academic nomenclature.`,

  objectiveSystemPrompt: `You are an expert exam paper grader and syllabus director in West Africa (WAEC/NECO team).
Generate high-fidelity, NERDC-aligned Multiple-Choice (Objective) questions appropriate for the specified student level.
Every question must contain exactly 4 options. Include active local Nigerian names, names of cities, Naira prices, and everyday real-world examples where applicable.
Return a valid JSON object matching the requested schema.`,

  theorySystemPrompt: `You are a Senior pedagogy specialist in Nigeria.
Generate in-depth Essay/Theory examination questions aligned with official NERDC syllabus requirements.
Each theory question must contain a clear, descriptive problem statement, a complete, step-by-step model answer, and a strict marking scheme index.
Include local Nigerian contextual settings where applicable.
Return a valid JSON object matching the requested schema.`,

  practicalSystemPrompt: `You are an experienced laboratory instructor and scientific education consultant in Nigeria.
Generate hands-on Laboratory / Practical Examination Tasks based on NERDC standards.
Each task must outline the Experiment Aim, a detailed list of Apparatus / Materials needed, step-by-step Procedures, expected Observations / Calculations, a logical Conclusion, and follow-up viva questions.
Focus on safety precautions and practical real-world relevance to Nigeria.
Return a valid JSON object matching the requested schema.`,

  assignmentSystemPrompt: `You are a dedicated primary and secondary school educator in Nigeria.
Generate homework and take-home Assignments aligned with NERDC standards.
Assignments should challenge the student to read ahead or consolidate learned material.
Each assignment must have a clear Task Description, detailed Instructions, recommended Submission Guidelines, and expected grading criteria.
Return a valid JSON object matching the requested schema.`,

  projectSystemPrompt: `You are a Senior Project-Based Learning specialist.
Generate comprehensive, student-led academic projects that align with the NERDC syllabus.
Projects should encourage teamwork, community investigation, or creative engineering/writing, with standard West African names and scenarios.
Each project must list the Project Title, a solid Background context, a list of critical Milestones, required student Deliverables, and a standard grading Rubric.
Return a valid JSON object matching the requested schema.`,

  worksheetSystemPrompt: `You are a skilled lesson planner and worksheet designer in Nigeria.
Generate modular Classroom Worksheets for student self-study, lesson revision, or homework.
Each worksheet must contain a title, complete general instructions, and multiple sections (e.g., Section A: Key Definitions, Section B: True/False, Section C: Solve the problems) containing specific questions/tasks.
Return a valid JSON object matching the requested schema.`,

  gradingSystemPrompt: `You are an expert exam paper grader in West Africa (WAEC/NECO team).
Grade the student script below and provide a constructive grading report in strict JSON format.`
};

export function PromptManager({
  appConfig,
  onUpdateConfig,
  showToast
}: PromptManagerProps) {
  // Currently selected prompt to edit
  const [selectedPromptKey, setSelectedPromptKey] = useState<keyof typeof DEFAULT_PROMPTS>('lessonSystemPrompt');
  const [promptValue, setPromptValue] = useState<string>('');
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Available Prompts configuration list
  const promptList = [
    { key: 'lessonSystemPrompt', name: 'Lesson Notes Prompt', icon: FileText, category: 'Instructional' },
    { key: 'curriculumSystemPrompt', name: 'Curriculum Generator Prompt', icon: Settings, category: 'Curriculum' },
    { key: 'objectiveSystemPrompt', name: 'Exam: Objective Prompt', icon: Code, category: 'Assessment' },
    { key: 'theorySystemPrompt', name: 'Exam: Theory Prompt', icon: Code, category: 'Assessment' },
    { key: 'practicalSystemPrompt', name: 'Exam: Practical Prompt', icon: Code, category: 'Assessment' },
    { key: 'assignmentSystemPrompt', name: 'Exam: Assignment Prompt', icon: Code, category: 'Assessment' },
    { key: 'projectSystemPrompt', name: 'Exam: Project Prompt', icon: Code, category: 'Assessment' },
    { key: 'worksheetSystemPrompt', name: 'Exam: Worksheet Prompt', icon: Code, category: 'Assessment' },
    { key: 'gradingSystemPrompt', name: 'Exam: Auto-Grading Prompt', icon: ShieldAlert, category: 'Assessment' }
  ] as const;

  // Sync state with appConfig on change
  useEffect(() => {
    const activeValue = appConfig[selectedPromptKey] || DEFAULT_PROMPTS[selectedPromptKey];
    setPromptValue(activeValue);
  }, [selectedPromptKey, appConfig]);

  // Handle save
  const handleSavePrompt = async () => {
    setIsSaving(true);
    try {
      const nextConfig = {
        ...appConfig,
        [selectedPromptKey]: promptValue.trim()
      };
      await onUpdateConfig(nextConfig);
      showToast('System prompt overrides updated successfully!', 'success');
    } catch (e) {
      showToast('Failed to save prompt override.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Restore prompt to code baseline default
  const handleRestoreDefault = () => {
    if (confirm('Are you sure you want to restore this prompt to its default code baseline? Your custom changes will be discarded.')) {
      setPromptValue(DEFAULT_PROMPTS[selectedPromptKey]);
      showToast('Prompt restored to template default. Click Save to deploy.', 'info');
    }
  };

  const currentMeta = promptList.find(p => p.key === selectedPromptKey);

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 font-sans text-left">
      
      {/* Top Header info */}
      <div className="border-b border-slate-100 pb-3.5 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="font-extrabold text-lg text-indigo-950 flex items-center gap-2">
            <Sparkles className="text-amber-500 fill-amber-500" size={20} />
            <span>Master AI Prompt Governance Suite</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">Database-backed prompt controls. Directly edit instructions dispatched to Google Gemini 3.5 LLM.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Sidebar Selection of Prompts */}
        <div className="lg:col-span-4 bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3">
          <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Prompt Matrix Selector</span>
          
          <div className="space-y-1">
            {promptList.map((p) => {
              const Icon = p.icon;
              const isSelected = p.key === selectedPromptKey;
              const isOverridden = !!appConfig[p.key];

              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => {
                    setSelectedPromptKey(p.key);
                    setIsPreviewMode(false);
                  }}
                  className={`w-full text-left py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                      : 'bg-transparent text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={14} className={isSelected ? 'text-white' : 'text-slate-400'} />
                    <span>{p.name}</span>
                  </span>

                  {isOverridden && (
                    <span className={`px-1.5 py-0.5 text-[8px] font-black rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                      Custom
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-xl text-[10px] text-indigo-950 space-y-1">
            <h5 className="font-black flex items-center gap-1">
              <ShieldAlert size={12} className="text-indigo-600 animate-pulse" />
              <span>Safety Note on Prompts</span>
            </h5>
            <p className="leading-relaxed font-medium">
              These prompts guide structured JSON generation. Drastic schema edits or erasing target types may disrupt live curriculum compilation processes. Use with caution.
            </p>
          </div>
        </div>

        {/* Right Column: Code Editor Canvas */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          
          {/* Editor Header */}
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <span className="text-[9px] font-bold bg-slate-100 border px-2 py-0.5 rounded-full uppercase text-slate-500">
                {currentMeta?.category} Prompt
              </span>
              <h4 className="font-extrabold text-sm text-slate-900 mt-1">{currentMeta?.name}</h4>
            </div>

            {/* View selectors */}
            <div className="flex gap-1 bg-slate-50 border p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setIsPreviewMode(false)}
                className={`px-3 py-1 font-bold rounded-md transition ${!isPreviewMode ? 'bg-white text-indigo-700 border shadow-xs' : 'text-slate-500'}`}
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => setIsPreviewMode(true)}
                className={`px-3 py-1 font-bold rounded-md transition ${isPreviewMode ? 'bg-white text-indigo-700 border shadow-xs' : 'text-slate-500'}`}
              >
                Preview Mode
              </button>
            </div>
          </div>

          {/* Active Canvas */}
          {isPreviewMode ? (
            <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl max-h-96 overflow-y-auto font-sans leading-relaxed text-xs text-slate-700 space-y-4">
              <h5 className="font-extrabold text-slate-800 text-xs border-b pb-1">System Instructions Compiled</h5>
              <div className="whitespace-pre-wrap">{promptValue}</div>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                className="w-full h-96 p-4 bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                spellCheck="false"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>Format: Pure Text / Markdown instructions</span>
                <span>Length: {promptValue.length} characters</span>
              </div>
            </div>
          )}

          {/* Prompt Management Buttons */}
          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleRestoreDefault}
              className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Reset to Defaults</span>
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSavePrompt}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm shadow-indigo-600/10"
            >
              <Save size={13} />
              <span>{isSaving ? 'Deploying Prompt...' : 'Commit Prompt Override'}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
