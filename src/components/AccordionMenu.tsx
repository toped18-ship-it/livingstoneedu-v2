import React from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';

interface AccordionMenuProps {
  children: React.ReactNode;
  className?: string;
}

export function AccordionMenu({ children, className = '' }: AccordionMenuProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {children}
    </div>
  );
}

interface AccordionItemProps {
  title: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export function AccordionItem({
  title,
  icon,
  isOpen,
  onToggle,
  children,
  badge,
  className = ''
}: AccordionItemProps) {
  return (
    <div className={`border border-slate-100 bg-white rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'shadow-md border-slate-200/50' : 'shadow-xs hover:border-slate-200'} ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer select-none"
      >
        <span className="flex items-center gap-2 text-left">
          {icon && <span className="text-slate-500 shrink-0">{icon}</span>}
          <span>{title}</span>
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {badge}
          <span className="text-slate-400 transition-transform duration-300 transform">
            {isOpen ? <ChevronDown size={14} className="rotate-0 text-indigo-500 stroke-[2.5]" /> : <ChevronRight size={14} className="text-slate-400" />}
          </span>
        </div>
      </button>

      {/* Accordion Content Wrapper with smooth height transition */}
      <div 
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-3 pt-0 border-t border-slate-50 space-y-1.5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SubMenuProps {
  title: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: React.ReactNode;
  key?: React.Key;
}

export function SubMenu({
  title,
  icon,
  isOpen,
  onToggle,
  children,
  badge
}: SubMenuProps) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-100/50 bg-slate-50/20">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-1.5 text-left">
          {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
          <span>{title}</span>
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {badge}
          <span className="text-slate-400 transition-transform duration-200">
            {isOpen ? <ChevronDown size={12} className="text-indigo-500" /> : <ChevronRight size={12} />}
          </span>
        </div>
      </button>

      <div 
        className={`grid transition-all duration-200 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="pl-4 pr-1.5 pb-2 pt-0.5 space-y-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

interface MenuSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MenuSearch({
  value,
  onChange,
  placeholder = 'Search features...',
  className = ''
}: MenuSearchProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search size={14} className="stroke-[2.5]" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2.5 bg-slate-100 focus:bg-white border border-transparent focus:border-slate-200 hover:bg-slate-150/50 text-slate-700 placeholder-slate-400 text-xs font-medium rounded-2xl transition shadow-xs focus:ring-1 focus:ring-slate-200 outline-hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-[10px] font-bold cursor-pointer"
        >
          Clear
        </button>
      )}
    </div>
  );
}
