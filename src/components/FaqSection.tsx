import React, { useState } from 'react';
import { FAQ_ITEMS } from '../data/faq';
import { HelpCircle, ChevronDown, ChevronUp, Star, GraduationCap } from 'lucide-react';

export function FaqSection() {
  const [activeId, setActiveId] = useState<string | null>('faq1');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'General' | 'Curriculum' | 'Technical'>('All');

  const categories: Array<'All' | 'General' | 'Curriculum' | 'Technical'> = [
    'All', 'General', 'Curriculum', 'Technical'
  ];

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    if (selectedCategory === 'All') return true;
    return item.category === selectedCategory;
  });

  const toggleFaq = (id: string) => {
    if (activeId === id) {
      setActiveId(null);
    } else {
      setActiveId(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Informative Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-full text-blue-800 text-xs font-bold uppercase tracking-widest">
          <HelpCircle size={12} />
          <span>Need Answers Fast?</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-none">Frequently Asked Questions</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Explore everything you need to know about the Nigerian educational curriculum, exam readiness, and the portal.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 justify-center overflow-x-auto p-1.5 bg-slate-100 rounded-xl max-w-md mx-auto">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                isActive
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-650 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Accordion FAQ Board */}
      <div className="space-y-3 pt-2">
        {filteredFaqs.map((faq) => {
          const isOpen = activeId === faq.id;
          return (
            <div
              key={faq.id}
              className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 ${
                isOpen ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20' : 'border-slate-150 hover:border-slate-350 shadow-sm'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFaq(faq.id)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-slate-800 text-xs sm:text-sm cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm">💡</span>
                  <span className="leading-snug">{faq.question}</span>
                </div>
                {isOpen ? (
                  <ChevronUp size={16} className="text-blue-600 shrink-0" />
                ) : (
                  <ChevronDown size={16} className="text-slate-400 shrink-0" />
                )}
              </button>

              {/* Collapsed content container */}
              <div
                className={`transition-all duration-300 ease-in-out border-slate-50 ${
                  isOpen ? 'max-h-60 opacity-100 border-t p-5 bg-slate-50/25' : 'max-h-0 opacity-0 overflow-hidden'
                }`}
              >
                <p className="text-xs sm:text-sm text-slate-650 leading-relaxed text-slate-700">
                  {faq.answer}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest bg-blue-50 text-blue-700">
                    Category: {faq.category}
                  </span>
                  {faq.category === 'Curriculum' && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 flex items-center gap-1">
                      <GraduationCap size={10} />
                      <span>Syllabus Aligned</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-xs">
            No questions matching your category filter.
          </div>
        )}
      </div>

      {/* Helpful reminder block */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-2xl p-6 shadow-lg text-center space-y-3 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 -translate-x-4 -translate-y-4 w-28 h-28 bg-white/5 rounded-full" />
        
        <p className="text-xs sm:text-sm font-semibold text-slate-200">
          Still have unanswered questions or require dynamic pedagogical guidance?
        </p>
        <p className="text-[11px] text-slate-350 max-w-sm mx-auto">
          We are here to support your learning goals. Reach out directly on our Contacts forms tab to submit an academic inquiry.
        </p>
      </div>
    </div>
  );
}
