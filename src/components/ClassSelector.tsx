import React, { useState } from 'react';
import { ClassLevel } from '../types';
import { ALL_CLASSES } from '../data/curriculum';
import { BookOpen, GraduationCap, Check, ArrowRight, Sparkles } from 'lucide-react';

interface ClassSelectorProps {
  onSave: (classLevel: ClassLevel) => void;
  initialClassLevel?: ClassLevel;
}

export function ClassSelector({ onSave, initialClassLevel }: ClassSelectorProps) {
  const [selectedClass, setSelectedClass] = useState<ClassLevel>(initialClassLevel || 'JSS 1');

  const primaryClasses = ALL_CLASSES.filter(c => c.startsWith('Primary'));
  const jssClasses = ALL_CLASSES.filter(c => c.startsWith('JSS'));
  const ssClasses = ALL_CLASSES.filter(c => c.startsWith('SS'));

  const handleNext = () => {
    onSave(selectedClass);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-150 shadow-md p-6 max-w-2xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-100 text-center space-y-2">
        <span className="p-1 px-3 text-[10px] bg-blue-50 text-blue-700 font-extrabold uppercase rounded-full tracking-wider">
          Step 1: Choose Your Class Level
        </span>
        <h2 className="text-2xl font-black text-slate-800 leading-tight">
          Which class are you in?
        </h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          We will customize your study guidelines, subjects, exam preparation metrics (BECE, UTME/WAEC) and resources based on your class level.
        </p>
      </div>

      {/* Class Level Columns (Primary, JSS, SS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Primary Level */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Primary School</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {primaryClasses.map((cl) => {
              const isSelected = selectedClass === cl;
              return (
                <button
                  key={cl}
                  type="button"
                  onClick={() => setSelectedClass(cl)}
                  className={`p-2.5 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-amber-50/50 border-amber-500 text-amber-900 ring-2 ring-amber-50 shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cl}
                </button>
              );
            })}
          </div>
        </div>

        {/* JSS Level */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Junior High (JSS)</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {jssClasses.map((cl) => {
              const isSelected = selectedClass === cl;
              return (
                <button
                  key={cl}
                  type="button"
                  onClick={() => setSelectedClass(cl)}
                  className={`p-2.5 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-teal-50/50 border-teal-500 text-teal-900 ring-2 ring-teal-50 shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cl} (Junior Sec)
                </button>
              );
            })}
          </div>
        </div>

        {/* SS Level */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Senior High (SS)</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {ssClasses.map((cl) => {
              const isSelected = selectedClass === cl;
              return (
                <button
                  key={cl}
                  type="button"
                  onClick={() => setSelectedClass(cl)}
                  className={`p-2.5 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-50/50 border-blue-500 text-blue-900 ring-2 ring-blue-50 shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cl} (Senior Sec)
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Info card of selection details */}
      <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
        <span className="p-1.5 bg-blue-50 rounded-lg text-blue-600 shrink-0">
          <BookOpen size={16} />
        </span>
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-slate-800">
            Selected Class Status: <span className="text-blue-600">{selectedClass}</span>
          </h4>
          <p className="text-[10px] text-slate-400">
            {selectedClass.startsWith('Primary') && 'Includes modules for general math, literacy, foundations, national values, basic science & crafts.'}
            {selectedClass.startsWith('JSS') && 'Fully integrated national BECE exam preparation coverage including basic tech, business studies and home economics.'}
            {selectedClass.startsWith('SS') && 'Highly specialized science, arts, or commerce courses including Physics, Chemistry, Biology, Economics & Further Math.'}
          </p>
        </div>
      </div>

      {/* Button footer */}
      <div className="flex items-center justify-end pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={handleNext}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-750 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/10 active:scale-95 transition cursor-pointer"
        >
          <span>Confirm & Proceed to Subjects</span>
          <ArrowRight size={14} />
        </button>
      </div>

    </div>
  );
}
