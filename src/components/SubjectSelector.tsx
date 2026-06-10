import React, { useState, useMemo } from 'react';
import { User, Subject } from '../types';
import { getSubjectsForClass } from '../data/curriculum';
import { SubjectIcon } from './SubjectIcon';
import { BookOpen, Check, HelpCircle, Save, Sparkles, Star, Trophy, X } from 'lucide-react';

interface SubjectSelectorProps {
  user: User;
  onSave: (selectedIds: string[]) => void;
  onCancel?: () => void;
  isSettingsView?: boolean;
}

export function SubjectSelector({ user, onSave, onCancel, isSettingsView = false }: SubjectSelectorProps) {
  // Get all potential subjects for user's level
  const classSubjects = useMemo(() => {
    return getSubjectsForClass(user.classLevel || 'JSS 1');
  }, [user.classLevel]);

  // Track checked subjects
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    // If user has already chosen some, initialize active states
    if (user.selectedSubjectIds && user.selectedSubjectIds.length > 0) {
      // Filter to keep only those present in the current class level
      const classSubjectIds = classSubjects.map(s => s.id);
      return user.selectedSubjectIds.filter(id => classSubjectIds.includes(id));
    }
    // Default to selecting all subjects initially for high availability
    return classSubjects.map(s => s.id);
  });

  const [showNotification, setShowNotification] = useState(false);

  const toggleSubject = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        // Ensure they must select at least one subject
        if (prev.length <= 1) {
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
          return prev;
        }
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const selectAll = () => {
    setSelectedIds(classSubjects.map(s => s.id));
  };

  const selectNone = () => {
    // Keep at least the first subject selected to avoid blank states
    if (classSubjects.length > 0) {
      setSelectedIds([classSubjects[0].id]);
    }
  };

  const handleSave = () => {
    onSave(selectedIds);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-150 shadow-md p-6 max-w-2xl mx-auto animate-fade-in space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 text-[10px] bg-blue-50 text-blue-700 font-extrabold uppercase rounded-full tracking-wider">
              Step 2: Study Plan
            </span>
            <span className="flex items-center gap-1 text-[10px] text-amber-600 font-bold">
              <Sparkles size={11} className="fill-amber-400" />
              <span>Personalized for {user.classLevel}</span>
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-800 leading-tight">
            Customize Chosen Subjects
          </h2>
          <p className="text-xs text-slate-400">
            Select the subjects you want to focus on. Your Learning Hub, syllabus quizzes, and statistics tracking will customize dynamically to match your choices.
          </p>
        </div>
        
        {isSettingsView && onCancel && (
          <button 
            onClick={onCancel}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {showNotification && (
        <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded text-xs font-semibold text-amber-850 animate-pulse">
          ⚠️ Please select at least one core subject to build your customizable study schedule properly!
        </div>
      )}

      {/* Select actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-slate-500 font-bold">
          Selected: <span className="text-blue-600 font-black">{selectedIds.length}</span> of <span className="text-slate-700 font-black">{classSubjects.length}</span> Subjects
        </span>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="px-2.5 py-1 text-slate-500 hover:text-blue-600 hover:bg-slate-50 font-bold rounded-lg transition"
          >
            Select All
          </button>
          <span className="text-slate-200">|</span>
          <button
            type="button"
            onClick={selectNone}
            className="px-2.5 py-1 text-slate-500 hover:text-red-600 hover:bg-slate-50 font-bold rounded-lg transition"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Grid of Subjects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
        {classSubjects.map((subject) => {
          const isSelected = selectedIds.includes(subject.id);
          
          return (
            <button
              key={subject.id}
              type="button"
              onClick={() => toggleSubject(subject.id)}
              className={`p-4 border rounded-2xl text-left flex items-start gap-3 transition-all duration-150 relative cursor-pointer ${
                isSelected 
                  ? 'bg-blue-50/50 border-blue-400 ring-2 ring-blue-50 shadow-sm' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className={`p-2 rounded-xl shrink-0 ${
                isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-550'
              }`}>
                <SubjectIcon name={subject.icon} size={16} />
              </span>
              
              <div className="space-y-1 pr-4">
                <span className="text-xs font-black text-slate-800 leading-none block">
                  {subject.name}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight block line-clamp-2">
                  {subject.description}
                </span>
                <span className="inline-block mt-1 text-[8px] uppercase tracking-widest font-black text-blue-500 bg-blue-50 px-1 rounded">
                  {subject.category} Focus
                </span>
              </div>

              <div className="absolute right-3.5 top-3.5 flex items-center justify-center">
                <span className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center text-white transition ${
                  isSelected 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'border-slate-350 bg-white'
                }`}>
                  {isSelected && <Check size={11} className="stroke-[3]" />}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer / CTA Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-250 text-slate-655 hover:bg-slate-50 font-bold rounded-xl text-xs transition active:scale-95"
          >
            Cancel
          </button>
        )}
        
        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-750 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/10 active:scale-95 transition cursor-pointer"
        >
          <Save size={13} />
          <span>Save Selection & Start Learning</span>
        </button>
      </div>

    </div>
  );
}
