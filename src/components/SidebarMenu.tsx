import React, { useState, useMemo } from 'react';
import { 
  Home, 
  BookOpen, 
  Trophy, 
  Award, 
  HelpCircle, 
  MessageSquare, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Sparkles, 
  CreditCard, 
  FileText, 
  Calendar, 
  CheckSquare, 
  DollarSign, 
  Radio, 
  BrainCircuit, 
  Settings, 
  Mail, 
  Clock, 
  Shield, 
  Eye, 
  Database,
  GraduationCap,
  Sparkle
} from 'lucide-react';
import { ClassLevel, User, TermNumber } from '../types';
import { AccordionMenu, AccordionItem, SubMenu, MenuSearch } from './AccordionMenu';

interface SidebarMenuProps {
  currentUser: User | null;
  activeTab: 'home' | 'hub' | 'quizzes' | 'progress' | 'faq' | 'contact' | 'admin' | 'teacher';
  setActiveTab: (tab: any) => void;
  activeAdminTab?: string;
  setActiveAdminTab?: (tab: any) => void;
  activeSubTab?: string;
  setActiveSubTab?: (tab: any) => void;
  selectedSubjectId?: string;
  setSelectedSubjectId?: (id: string) => void;
  selectedTerm?: TermNumber;
  setSelectedTerm?: (term: TermNumber) => void;
  onClassChange?: (newClass: ClassLevel) => void;
  isPro?: boolean;
  onPaymentTrigger?: () => void;
  onCloseMobile?: () => void; // For closing drawer on click (mobile)
}

export function SidebarMenu({
  currentUser,
  activeTab,
  setActiveTab,
  activeAdminTab = 'payments',
  setActiveAdminTab,
  activeSubTab = 'roster',
  setActiveSubTab,
  selectedSubjectId = '',
  setSelectedSubjectId,
  selectedTerm = 1,
  setSelectedTerm,
  onClassChange,
  isPro = false,
  onPaymentTrigger,
  onCloseMobile
}: SidebarMenuProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(() => {
    return localStorage.getItem('livingstone_sidebar_expanded') || 'academic';
  });
  const [expandedSubClassGroup, setExpandedSubClassGroup] = useState<string | null>(null);

  const handleToggleCategory = (category: string) => {
    setExpandedCategory(prev => {
      const next = prev === category ? null : category;
      if (next) {
        localStorage.setItem('livingstone_sidebar_expanded', next);
      } else {
        localStorage.removeItem('livingstone_sidebar_expanded');
      }
      return next;
    });
  };

  const handleToggleSubClassGroup = (group: string) => {
    setExpandedSubClassGroup(prev => prev === group ? null : group);
  };

  const userRole = currentUser?.role || 'student';

  // 1. General Navigation Items
  const generalItems = [
    { id: 'home', label: 'Home Dashboard', icon: <Home size={15} /> },
    { id: 'hub', label: 'Learning Hub', icon: <BookOpen size={15} /> },
    { id: 'quizzes', label: 'Syllabus Quizzes', icon: <Trophy size={15} className="text-amber-500 fill-amber-300" /> },
    { id: 'progress', label: 'My Progress & Leaderboard', icon: <Award size={15} className="text-indigo-600 fill-indigo-300" /> },
    { id: 'faq', label: 'FAQs Accordion', icon: <HelpCircle size={15} /> },
    { id: 'contact', label: 'Help & Contacts', icon: <MessageSquare size={15} /> }
  ];

  // 2. Academic & Operations Items
  const academicItems = [
    { id: 'dashboard', label: 'SaaS Analytics Center', icon: <TrendingUp size={14} />, adminOnly: true },
    { id: 'users', label: 'Academic Directory', icon: <Users size={14} />, teacherTab: 'roster' },
    { id: 'curriculum', label: 'Curriculum Align', icon: <BookOpen size={14} />, teacherTab: 'curriculum-generator' },
    { id: 'master-library', label: 'Master Lesson Library', icon: <BookOpen size={14} className="text-indigo-500 font-bold" />, adminOnly: true },
    { id: 'ai-generator', label: 'AI Notes Generator', icon: <Sparkles size={14} className="text-amber-500 fill-amber-500" />, teacherTab: 'curriculum-generator' },
    { id: 'cbt', label: 'CBT Exam Banks', icon: <Award size={14} />, teacherTab: 'exam-maker' },
    { id: 'payments', label: 'Payments & Sims', icon: <CreditCard size={14} />, adminOnly: true },
    { id: 'results', label: 'Continuous Assessment', icon: <FileText size={14} />, teacherTab: 'grader' },
    { id: 'session', label: 'Academic Session & Term', icon: <Calendar size={14} />, adminOnly: true },
    { id: 'attendance', label: 'Attendance Register', icon: <CheckSquare size={14} />, teacherTab: 'attendance' },
    { id: 'fees', label: 'School Fees Ledger', icon: <DollarSign size={14} />, adminOnly: true },
    { id: 'comms', label: 'Communication Hub', icon: <Radio size={14} />, teacherTab: 'reports' }
  ];

  // 3. Support & Core Config Items
  const supportItems = [
    { id: 'ai-settings', label: 'AI Core Settings', icon: <BrainCircuit size={14} className="text-indigo-500" /> },
    { id: 'ai-prompts', label: 'AI Prompt Governance', icon: <FileText size={14} className="text-amber-500" /> },
    { id: 'ai-playground', label: 'AI Sandbox Playground', icon: <Sparkles size={14} className="text-emerald-500" /> },
    { id: 'branding', label: 'Identity Configurations', icon: <Settings size={14} /> },
    { id: 'gmail', label: 'School Gmail Manager', icon: <Mail size={14} /> },
    { id: 'inquiries', label: 'Inquiries Counseling Inbox', icon: <MessageSquare size={14} /> },
    { id: 'activities', label: 'Live Interaction Telemetry', icon: <Clock size={14} /> },
    { id: 'settings', label: 'Roles & Permissions Matrix', icon: <Shield size={14} /> },
    { id: 'moderation', label: 'Moderation Queue', icon: <Eye size={14} /> },
    { id: 'db', label: 'Database Backup Manager', icon: <Database size={14} /> }
  ];

  // 4. Subjects Items
  const subjectItems = [
    { id: 'mathematics', label: 'Mathematics', icon: '📐' },
    { id: 'english', label: 'English Studies', icon: '📝' },
    { id: 'basic_science', label: 'Basic Science & Technology', icon: '🔬' },
    { id: 'national_values', label: 'National Values Education', icon: '🇳🇬' },
    { id: 'agricultural_science', label: 'Agricultural Science', icon: '🌱' },
    { id: 'creative_arts', label: 'Cultural & Creative Arts', icon: '🎨' },
    { id: 'computer_studies', label: 'Computer Studies', icon: '💻' },
    { id: 'crs', label: 'CRS', icon: '✝️' },
    { id: 'irs', label: 'IRS', icon: '🌙' },
    { id: 'phe', label: 'Physical & Health Education', icon: '🏃' },
    { id: 'home_economics', label: 'Home Economics', icon: '🍳' }
  ];

  // 5. School Terms
  const termItems = [
    { id: 1, label: 'First Term', short: '1st Term' },
    { id: 2, label: 'Second Term', short: '2nd Term' },
    { id: 3, label: 'Third Term', short: '3rd Term' }
  ];

  // 6. Classes Layout
  const classGroups = [
    {
      id: 'Nursery',
      label: 'Nursery',
      classes: ['Primary 1'] // Nursery defaults maps back to standard Primary 1 in database
    },
    {
      id: 'Primary',
      label: 'Primary',
      classes: ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6']
    },
    {
      id: 'Junior Secondary',
      label: 'Junior Secondary',
      classes: ['JSS 1', 'JSS 2', 'JSS 3']
    },
    {
      id: 'Senior Secondary',
      label: 'Senior Secondary',
      classes: ['SS 1', 'SS 2', 'SS 3']
    }
  ];

  // Search filter logic
  const isSearching = searchQuery.trim().length > 0;
  const normalizedQuery = searchQuery.toLowerCase().trim();

  const filteredGeneralItems = useMemo(() => {
    return generalItems.filter(item => item.label.toLowerCase().includes(normalizedQuery));
  }, [normalizedQuery]);

  const filteredAcademicItems = useMemo(() => {
    return academicItems.filter(item => {
      if (item.adminOnly && userRole !== 'admin') return false;
      return item.label.toLowerCase().includes(normalizedQuery);
    });
  }, [normalizedQuery, userRole]);

  const filteredSupportItems = useMemo(() => {
    if (userRole !== 'admin') return [];
    return supportItems.filter(item => item.label.toLowerCase().includes(normalizedQuery));
  }, [normalizedQuery, userRole]);

  const filteredSubjectItems = useMemo(() => {
    return subjectItems.filter(item => item.label.toLowerCase().includes(normalizedQuery));
  }, [normalizedQuery]);

  const filteredTermItems = useMemo(() => {
    return termItems.filter(item => item.label.toLowerCase().includes(normalizedQuery));
  }, [normalizedQuery]);

  const filteredClassGroups = useMemo(() => {
    return classGroups.map(group => {
      const matchedClasses = group.classes.filter(cls => cls.toLowerCase().includes(normalizedQuery));
      const groupMatches = group.label.toLowerCase().includes(normalizedQuery);
      return {
        ...group,
        classes: matchedClasses,
        matchesGroup: groupMatches || matchedClasses.length > 0
      };
    }).filter(group => group.matchesGroup);
  }, [normalizedQuery]);

  // Determine which accordion items should be expanded (always open matching items if searching)
  const isAcademicOpen = isSearching ? filteredAcademicItems.length > 0 : expandedCategory === 'academic';
  const isSupportOpen = isSearching ? filteredSupportItems.length > 0 : expandedCategory === 'support';
  const isSubjectsOpen = isSearching ? filteredSubjectItems.length > 0 : expandedCategory === 'subjects';
  const isTermsOpen = isSearching ? filteredTermItems.length > 0 : expandedCategory === 'terms';
  const isClassesOpen = isSearching ? filteredClassGroups.length > 0 : expandedCategory === 'classes';

  const handleGeneralClick = (id: string) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  const handleAcademicClick = (item: typeof academicItems[0]) => {
    if (userRole === 'admin') {
      setActiveTab('admin');
      if (setActiveAdminTab) {
        setActiveAdminTab(item.id);
      }
    } else if (userRole === 'teacher' && item.teacherTab) {
      setActiveTab('teacher'); // redirects internally or sets the state
      if (setActiveSubTab) {
        setActiveSubTab(item.teacherTab);
      }
    }
    if (onCloseMobile) onCloseMobile();
  };

  const handleSupportClick = (item: typeof supportItems[0]) => {
    if (userRole === 'admin') {
      setActiveTab('admin');
      if (setActiveAdminTab) {
        setActiveAdminTab(item.id);
      }
    }
    if (onCloseMobile) onCloseMobile();
  };

  const handleSubjectClick = (subjId: string) => {
    if (setSelectedSubjectId) {
      setSelectedSubjectId(subjId);
    }
    setActiveTab('hub');
    if (onCloseMobile) onCloseMobile();
  };

  const handleTermClick = (termNum: number) => {
    if (setSelectedTerm) {
      setSelectedTerm(termNum as TermNumber);
    }
    setActiveTab('hub');
    if (onCloseMobile) onCloseMobile();
  };

  const handleClassClick = (clsName: string) => {
    if (onClassChange) {
      onClassChange(clsName as ClassLevel);
    }
    setActiveTab('home');
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <div className="w-full md:w-66 lg:w-72 bg-slate-50 border-r border-slate-200/60 p-4 flex flex-col h-full shrink-0 overflow-y-auto scrollbar-thin">
      
      {/* Brand Header */}
      <div className="flex items-center gap-2 px-1 mb-5">
        <div className="p-1.5 bg-gradient-to-tr from-blue-600 to-indigo-650 rounded-xl text-white shadow-xs">
          <GraduationCap size={16} className="stroke-[2.5]" />
        </div>
        <div>
          <h2 className="text-xs font-black tracking-wider text-slate-800 uppercase leading-none">LIVINGSTONEEDU</h2>
          <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">Console Admin</span>
        </div>
      </div>

      {/* Reusable Search Box component */}
      <MenuSearch 
        value={searchQuery} 
        onChange={setSearchQuery} 
        placeholder="Filter Console options..." 
        className="mb-4"
      />

      {/* Sidebar Main Content scroll area */}
      <div className="flex-1 space-y-3 pb-6">
        
        {/* Category: Portal Hub (General Tabs) */}
        {(!isSearching || filteredGeneralItems.length > 0) && (
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider pl-2 block mb-1">
              Portal Hub
            </span>
            <div className="space-y-0.5">
              {filteredGeneralItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleGeneralClick(item.id)}
                    className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                        : 'text-slate-650 hover:bg-slate-150/60'
                    }`}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-200/50" />

        {/* Categories Accordions Wrapper */}
        <AccordionMenu>
          
          {/* Category: Academic & Operations Accordion */}
          {(userRole === 'admin' || userRole === 'teacher') && (!isSearching || filteredAcademicItems.length > 0) && (
            <AccordionItem
              title="Academic & Operations"
              icon={<TrendingUp size={14} className="text-amber-600" />}
              isOpen={isAcademicOpen}
              onToggle={() => handleToggleCategory('academic')}
            >
              <div className="space-y-0.5 pt-1">
                {filteredAcademicItems.map((item) => {
                  const isActive = (userRole === 'admin' && activeTab === 'admin' && activeAdminTab === item.id) ||
                                  (userRole === 'teacher' && activeTab === 'teacher' && activeSubTab === item.teacherTab);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleAcademicClick(item)}
                      className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {item.icon}
                        <span>{item.label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </AccordionItem>
          )}

          {/* Category: Support & Core Configs Accordion */}
          {userRole === 'admin' && (!isSearching || filteredSupportItems.length > 0) && (
            <AccordionItem
              title="Support & Core Configs"
              icon={<Settings size={14} className="text-indigo-600" />}
              isOpen={isSupportOpen}
              onToggle={() => handleToggleCategory('support')}
            >
              <div className="space-y-0.5 pt-1">
                {filteredSupportItems.map((item) => {
                  const isActive = activeTab === 'admin' && activeAdminTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSupportClick(item)}
                      className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </AccordionItem>
          )}

          {/* Category: Subjects Accordion */}
          {(!isSearching || filteredSubjectItems.length > 0) && (
            <AccordionItem
              title="Subjects"
              icon={<BookOpen size={14} className="text-emerald-600" />}
              isOpen={isSubjectsOpen}
              onToggle={() => handleToggleCategory('subjects')}
            >
              <div className="space-y-0.5 pt-1">
                {filteredSubjectItems.map((item) => {
                  const isActive = activeTab === 'hub' && selectedSubjectId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSubjectClick(item.id)}
                      className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-bold animate-pulse'
                          : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </AccordionItem>
          )}

          {/* Category: School Term Accordion */}
          {(!isSearching || filteredTermItems.length > 0) && (
            <AccordionItem
              title="School Term"
              icon={<Calendar size={14} className="text-pink-600" />}
              isOpen={isTermsOpen}
              onToggle={() => handleToggleCategory('terms')}
            >
              <div className="space-y-0.5 pt-1">
                {filteredTermItems.map((item) => {
                  const isActive = activeTab === 'hub' && selectedTerm === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTermClick(item.id)}
                      className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-medium flex items-center transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </AccordionItem>
          )}

          {/* Category: Classes Accordion with sub-accordions */}
          {(!isSearching || filteredClassGroups.length > 0) && (
            <AccordionItem
              title="Classes"
              icon={<Users size={14} className="text-cyan-600" />}
              isOpen={isClassesOpen}
              onToggle={() => handleToggleCategory('classes')}
            >
              <div className="space-y-1 pt-1">
                {filteredClassGroups.map((group) => {
                  const isSubOpen = isSearching ? true : expandedSubClassGroup === group.id;
                  return (
                    <SubMenu
                      key={group.id}
                      title={group.label}
                      icon={<Users size={12} />}
                      isOpen={isSubOpen}
                      onToggle={() => handleToggleSubClassGroup(group.id)}
                    >
                      {group.classes.map((cls) => {
                        const isActive = currentUser?.classLevel === cls;
                        return (
                          <button
                            key={cls}
                            type="button"
                            onClick={() => handleClassClick(cls)}
                            className={`w-full text-left py-1 px-2 rounded-md text-[11px] font-medium flex items-center transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-blue-50 text-blue-700 font-bold'
                                : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-800'
                            }`}
                          >
                            {cls}
                          </button>
                        );
                      })}
                    </SubMenu>
                  );
                })}
              </div>
            </AccordionItem>
          )}

        </AccordionMenu>

      </div>

      {/* Pro Badge & User section at bottom */}
      {currentUser && (
        <div className="pt-3 border-t border-slate-200 mt-auto flex flex-col gap-2">
          {currentUser.isPro ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-[10px] font-black uppercase tracking-wider justify-center">
              <Sparkles size={11} className="fill-amber-400 text-amber-550 animate-pulse" />
              <span>PRO ACTIVE MEMBER</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onPaymentTrigger}
              className="w-full flex items-center gap-1.5 py-2 px-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:brightness-105 transition shadow-sm cursor-pointer justify-center"
            >
              <span>Go Pro (Unlimited Access)</span>
            </button>
          )}

          <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-slate-100">
            <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-slate-850 truncate leading-none">{currentUser.fullName}</p>
              <span className="text-[9px] text-slate-400 font-medium truncate mt-0.5 block">
                {currentUser.role?.toUpperCase() || 'STUDENT'}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
