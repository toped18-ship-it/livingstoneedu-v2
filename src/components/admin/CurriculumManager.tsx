import React, { useState, useMemo } from 'react';
import { ActionDropdown } from '../ActionDropdown';
import { 
  BookOpen, Plus, Search, Edit, Trash2, Download, Upload, Copy, 
  ChevronLeft, ChevronRight, Check, AlertCircle, FileText, CheckCircle2, RotateCcw
} from 'lucide-react';
import { rtdbSet, rtdbUpdate, rtdbGet, NODES } from '../../lib/rtdbService';

interface CurriculumItem {
  id: string;
  class: string;
  subject: string;
  term: string;
  week: number;
  topic: string;
  details?: string;
  objectives?: string[];
  status?: string;
}

interface CurriculumManagerProps {
  curriculums: CurriculumItem[];
  onCurriculumsChange: (next: CurriculumItem[]) => void;
  showToast: (message: string, type: 'success' | 'info' | 'error') => void;
  isSeeding: boolean;
  seedingProgress: number;
  seedingStatus: string;
  onGenerateCompleteCurriculum: () => Promise<void>;
}

export function CurriculumManager({
  curriculums,
  onCurriculumsChange,
  showToast,
  isSeeding,
  seedingProgress,
  seedingStatus,
  onGenerateCompleteCurriculum
}: CurriculumManagerProps) {
  // Navigation & Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'view' | 'duplicate' | 'import-export'>('view');

  // Search & Filters
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterTerm, setFilterTerm] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Modals / Form States
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<CurriculumItem | null>(null);

  // Form Fields
  const [formClass, setFormClass] = useState<string>('SS 1');
  const [formSubject, setFormSubject] = useState<string>('Mathematics');
  const [formTerm, setFormTerm] = useState<string>('1st Term');
  const [formWeek, setFormWeek] = useState<number>(1);
  const [formTopic, setFormTopic] = useState<string>('');
  const [formDetails, setFormDetails] = useState<string>('');
  const [formObjectives, setFormObjectives] = useState<string>('');

  // Duplication Form State
  const [dupSourceClass, setDupSourceClass] = useState<string>('SS 1');
  const [dupSourceTerm, setDupSourceTerm] = useState<string>('1st Term');
  const [dupTargetClass, setDupTargetClass] = useState<string>('SS 2');
  const [dupTargetTerm, setDupTargetTerm] = useState<string>('1st Term');

  // Import State
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [isImporting, setIsImporting] = useState<boolean>(false);

  // Available unique fields for filters
  const classesList = ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6', 'JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'];
  const termsList = ['1st Term', '2nd Term', '3rd Term'];

  const uniqueSubjects = useMemo(() => {
    const subs = new Set<string>();
    curriculums.forEach(c => {
      if (c.subject) subs.add(c.subject);
    });
    return Array.from(subs).sort();
  }, [curriculums]);

  // Handle adding new item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTopic.trim()) {
      showToast('Please specify a curriculum topic.', 'error');
      return;
    }

    const cleanClass = formClass.trim().replace(/[.#$[\]/]/g, '_');
    const cleanSubj = formSubject.trim().replace(/[.#$[\]/]/g, '_');
    const cleanTerm = formTerm.trim().replace(/[.#$[\]/]/g, '_');
    const keyId = `curr_${cleanClass}_${cleanSubj}_t${formTerm.charAt(0)}_W${formWeek}`.replace(/\s+/g, '_');

    const objectivesArray = formObjectives.split('\n').map(o => o.trim()).filter(Boolean);

    const newItem: CurriculumItem = {
      id: keyId,
      class: formClass,
      subject: formSubject,
      term: formTerm,
      week: formWeek,
      topic: formTopic.trim(),
      details: formDetails.trim() || objectivesArray.join('\n'),
      objectives: objectivesArray.length > 0 ? objectivesArray : [
        `Understand the fundamental principles of ${formTopic.trim()}.`,
        `Solve contextual calculations and apply the learning to real life.`
      ],
      status: 'Published'
    };

    const nextList = [newItem, ...curriculums.filter(c => c.id !== keyId)];
    onCurriculumsChange(nextList);
    setShowAddForm(false);
    resetForm();
    showToast('New curriculum topic successfully published!', 'success');
  };

  // Handle editing item
  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const objectivesArray = formObjectives.split('\n').map(o => o.trim()).filter(Boolean);

    const updatedItem: CurriculumItem = {
      ...editingItem,
      class: formClass,
      subject: formSubject,
      term: formTerm,
      week: formWeek,
      topic: formTopic.trim(),
      details: formDetails.trim() || objectivesArray.join('\n'),
      objectives: objectivesArray.length > 0 ? objectivesArray : [
        `Understand the fundamental principles of ${formTopic.trim()}.`
      ]
    };

    const nextList = curriculums.map(c => c.id === editingItem.id ? updatedItem : c);
    onCurriculumsChange(nextList);
    setEditingItem(null);
    resetForm();
    showToast('Curriculum topic successfully updated!', 'success');
  };

  // Trigger editing mode
  const startEdit = (item: CurriculumItem) => {
    setEditingItem(item);
    setFormClass(item.class);
    setFormSubject(item.subject);
    setFormTerm(item.term);
    setFormWeek(item.week);
    setFormTopic(item.topic);
    setFormDetails(item.details || '');
    setFormObjectives(item.objectives ? item.objectives.join('\n') : '');
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormTopic('');
    setFormDetails('');
    setFormObjectives('');
    setFormWeek(1);
  };

  // Delete curriculum
  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this curriculum record? This will instantly synchronize online.')) {
      const nextList = curriculums.filter(c => c.id !== id);
      onCurriculumsChange(nextList);
      showToast('Curriculum record successfully deleted.', 'success');
    }
  };

  // Duplicate class/term curriculum to duplicate setups
  const handleDuplicateCurriculum = () => {
    const sourceItems = curriculums.filter(c => c.class === dupSourceClass && c.term === dupSourceTerm);
    if (sourceItems.length === 0) {
      showToast(`No curriculum items found for ${dupSourceClass} (${dupSourceTerm}).`, 'error');
      return;
    }

    if (dupSourceClass === dupTargetClass && dupSourceTerm === dupTargetTerm) {
      showToast('Source and target cannot be identical.', 'error');
      return;
    }

    const duplicatedItems = sourceItems.map(item => {
      const cleanClass = dupTargetClass.trim().replace(/[.#$[\]/]/g, '_');
      const cleanSubj = item.subject.trim().replace(/[.#$[\]/]/g, '_');
      const keyId = `curr_${cleanClass}_${cleanSubj}_t${dupTargetTerm.charAt(0)}_W${item.week}`.replace(/\s+/g, '_');

      return {
        ...item,
        id: keyId,
        class: dupTargetClass,
        term: dupTargetTerm
      };
    });

    // Merge into curriculums, replacing any existing items on target Class/Term/Week
    const targetIds = new Set(duplicatedItems.map(d => d.id));
    const nextList = [...duplicatedItems, ...curriculums.filter(c => !targetIds.has(c.id))];

    onCurriculumsChange(nextList);
    showToast(`Successfully duplicated ${sourceItems.length} syllabus topics to ${dupTargetClass}!`, 'success');
  };

  // Export as JSON file
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(curriculums, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `LIVINGSTONEEDU_Curriculum_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Curriculum JSON schema exported successfully.', 'success');
  };

  // Export as CSV file
  const handleExportCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Class,Subject,Term,Week,Topic,Details\n";

    curriculums.forEach(c => {
      const row = [
        c.id,
        `"${c.class.replace(/"/g, '""')}"`,
        `"${c.subject.replace(/"/g, '""')}"`,
        `"${c.term.replace(/"/g, '""')}"`,
        c.week,
        `"${c.topic.replace(/"/g, '""')}"`,
        `"${(c.details || '').replace(/\n/g, ' ').replace(/"/g, '""')}"`
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", encodedUri);
    downloadAnchor.setAttribute("download", `LIVINGSTONEEDU_Curriculum_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Curriculum CSV exported successfully.', 'success');
  };

  // Import JSON items
  const handleImportJson = () => {
    if (!importJsonText.trim()) {
      showToast('Please paste a valid curriculum JSON text.', 'error');
      return;
    }

    try {
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed)) {
        showToast('JSON must be an array of curriculum topics.', 'error');
        return;
      }

      // Basic schema check
      const validItems: CurriculumItem[] = [];
      parsed.forEach((item, i) => {
        if (item.class && item.subject && item.term && item.week && item.topic) {
          const cleanClass = item.class.trim().replace(/[.#$[\]/]/g, '_');
          const cleanSubj = item.subject.trim().replace(/[.#$[\]/]/g, '_');
          const keyId = item.id || `curr_${cleanClass}_${cleanSubj}_t${item.term.charAt(0)}_W${item.week}`.replace(/\s+/g, '_');

          validItems.push({
            id: keyId,
            class: item.class,
            subject: item.subject,
            term: item.term,
            week: Number(item.week) || 1,
            topic: item.topic,
            details: item.details || '',
            objectives: item.objectives || [`Understand the fundamental concepts of ${item.topic}.`],
            status: item.status || 'Published'
          });
        }
      });

      if (validItems.length === 0) {
        showToast('No valid curriculum objects detected in the pasted array.', 'error');
        return;
      }

      const mergedList = [...validItems, ...curriculums.filter(c => !validItems.some(v => v.id === c.id))];
      onCurriculumsChange(mergedList);
      setImportJsonText('');
      showToast(`Successfully imported ${validItems.length} curriculum items!`, 'success');
    } catch (e) {
      showToast('Invalid JSON structure. Please check your text.', 'error');
    }
  };

  // Filtered List calculation
  const filteredList = useMemo(() => {
    return curriculums.filter(c => {
      const classMatch = filterClass === 'all' || c.class === filterClass;
      const termMatch = filterTerm === 'all' || c.term === filterTerm;
      const subjectMatch = filterSubject === 'all' || c.subject === filterSubject;
      
      const searchLower = searchText.toLowerCase();
      const textMatch = !searchText.trim() || 
        c.topic.toLowerCase().includes(searchLower) ||
        (c.details || '').toLowerCase().includes(searchLower) ||
        c.subject.toLowerCase().includes(searchLower);

      return classMatch && termMatch && subjectMatch && textMatch;
    }).sort((a, b) => {
      // Sort: Class -> Subject -> Term -> Week
      if (a.class !== b.class) return a.class.localeCompare(b.class);
      if (a.subject !== b.subject) return a.subject.localeCompare(b.subject);
      if (a.term !== b.term) return a.term.localeCompare(b.term);
      return a.week - b.week;
    });
  }, [curriculums, filterClass, filterTerm, filterSubject, searchText]);

  // Paginated List
  const paginatedList = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredList, currentPage]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 font-sans">
      
      {/* Header section */}
      <div className="border-b border-slate-100 pb-3.5 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="font-extrabold text-lg text-indigo-950 flex items-center gap-2">
            <BookOpen className="text-indigo-600" size={20} />
            <span>NERDC National Curriculum Manager</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">Configure Class &rarr; Term &rarr; Week &rarr; Topic schema for automated lesson notes synthesis.</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              resetForm();
              setShowAddForm(!showAddForm);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm shadow-indigo-600/10"
          >
            <Plus size={14} />
            <span>{showAddForm ? 'Close Form' : 'Create Custom Topic'}</span>
          </button>
        </div>
      </div>

      {/* Sub tabs navigation */}
      <div className="flex flex-wrap gap-1.5 border-b pb-4 border-slate-100">
        <button
          type="button"
          onClick={() => setActiveSubTab('view')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'view' ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' : 'bg-transparent text-slate-500 hover:bg-slate-50'
          }`}
        >
          <BookOpen size={13} />
          <span>View Curriculum List ({filteredList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('duplicate')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'duplicate' ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' : 'bg-transparent text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Copy size={13} />
          <span>Duplicate Class Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('import-export')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'import-export' ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' : 'bg-transparent text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Upload size={13} />
          <span>Import & Export Schema</span>
        </button>
      </div>

      {/* Add / Edit Form Drawer */}
      {showAddForm && (
        <form onSubmit={editingItem ? handleEditItem : handleAddItem} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-fade-in">
          <h4 className="text-xs font-black uppercase text-indigo-950 flex items-center gap-1.5 border-b pb-2">
            <Plus size={14} className="text-indigo-600" />
            <span>{editingItem ? 'Edit Curriculum Topic' : 'Create Custom Curriculum Topic'}</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-500">Academic Class</label>
              <select value={formClass} onChange={(e) => setFormClass(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-bold">
                {classesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-500">Syllabus Subject</label>
              <input value={formSubject} onChange={(e) => setFormSubject(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-bold" placeholder="e.g. Mathematics" required />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-500">Term Period</label>
              <select value={formTerm} onChange={(e) => setFormTerm(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-bold">
                {termsList.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-500">Active Week (1-12)</label>
              <input type="number" min="1" max="12" value={formWeek} onChange={(e) => setFormWeek(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-bold" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase text-slate-500">Topic Focus Title</label>
            <input value={formTopic} onChange={(e) => setFormTopic(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-bold" placeholder="e.g. Algebraic Fractions & Simultaneous Calculations" required />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase text-slate-500">Learning Objectives (One per line)</label>
            <textarea value={formObjectives} onChange={(e) => setFormObjectives(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-medium font-mono" placeholder="e.g. Identify standard fractions&#10;Solve conversion arithmetic&#10;Simplify complex WAEC questions" rows={3} />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase text-slate-500">Syllabus Guidance Details (Optional)</label>
            <textarea value={formDetails} onChange={(e) => setFormDetails(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-medium" placeholder="Additional pedagogical guidance..." rows={2} />
          </div>

          <div className="flex justify-end gap-2 text-xs pt-2">
            <button type="button" onClick={() => { setShowAddForm(false); setEditingItem(null); resetForm(); }} className="px-4 py-2 font-bold text-slate-600 bg-slate-200 rounded-xl cursor-pointer">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl cursor-pointer shadow-xs">
              {editingItem ? 'Save Updates' : 'Publish Topic'}
            </button>
          </div>
        </form>
      )}

      {/* VIEW SUB-TAB */}
      {activeSubTab === 'view' && (
        <div className="space-y-4 animate-fade-in text-left">
          
          {/* Seeder Banner for Empty lists */}
          {curriculums.length < 10 && (
            <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-150 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase text-indigo-950 tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-ping inline-block" />
                  <span>Curriculum Empty or Needs Alignment?</span>
                </h4>
                <p className="text-[11px] text-slate-500">Generate full NERDC-aligned curricula maps (4,000+ topics) for primary & secondary levels instantly.</p>
              </div>
              <button
                type="button"
                disabled={isSeeding}
                onClick={onGenerateCompleteCurriculum}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-extrabold text-[10px] uppercase rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                {isSeeding ? 'Compiling Syllabi...' : 'Seed NERDC Syllabus'}
              </button>
            </div>
          )}

          {/* Filtering Header */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 border border-slate-150 p-4 rounded-2xl">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Class Grade</span>
              <select value={filterClass} onChange={(e) => { setFilterClass(e.target.value); setCurrentPage(1); }} className="w-full px-3 py-1.5 border rounded-xl bg-white text-xs font-semibold">
                <option value="all">All Classes</option>
                {classesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Subject</span>
              <select value={filterSubject} onChange={(e) => { setFilterSubject(e.target.value); setCurrentPage(1); }} className="w-full px-3 py-1.5 border rounded-xl bg-white text-xs font-semibold">
                <option value="all">All Subjects</option>
                {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Term Period</span>
              <select value={filterTerm} onChange={(e) => { setFilterTerm(e.target.value); setCurrentPage(1); }} className="w-full px-3 py-1.5 border rounded-xl bg-white text-xs font-semibold">
                <option value="all">All Terms</option>
                {termsList.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Search Topic</span>
              <div className="relative">
                <input value={searchText} onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }} className="w-full pl-8 pr-3 py-1.5 border rounded-xl bg-white text-xs font-semibold" placeholder="Search..." />
                <Search size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Curriculum List Display Table */}
          <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs">
            {paginatedList.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <AlertCircle className="mx-auto text-slate-300" size={36} />
                <h5 className="font-bold text-slate-700 text-sm">No Curriculum Records Found</h5>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">Adjust filters or run the Master NERDC Seeder above to deploy national syllabus guides.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-150 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    <tr>
                      <th className="p-3">Class/Subject</th>
                      <th className="p-3">Term & Week</th>
                      <th className="p-3">Syllabus Topic Title</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {paginatedList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-3">
                          <span className="font-black text-slate-900 block">{item.class}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{item.subject}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-slate-700 block">{item.term}</span>
                          <span className="text-[10px] text-indigo-600 font-black">Week {item.week}</span>
                        </td>
                        <td className="p-3">
                          <p className="font-extrabold text-slate-800 line-clamp-1">{item.topic}</p>
                          {item.objectives && item.objectives.length > 0 ? (
                            <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1 italic">
                              Objectives: {item.objectives.slice(0, 2).join(' &bull; ')}
                            </p>
                          ) : (
                            <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1 italic">No objectives defined.</p>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <ActionDropdown
                            label="Actions"
                            align="right"
                            items={[
                              {
                                label: 'Edit Topic',
                                icon: Edit,
                                onClick: () => startEdit(item)
                              },
                              {
                                label: 'Delete Topic',
                                icon: Trash2,
                                isDanger: true,
                                confirmMessage: `Are you sure you want to delete this topic: "${item.topic}"?`,
                                onClick: () => handleDeleteItem(item.id)
                              }
                            ]}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center text-xs pt-2">
              <span className="text-slate-400 font-bold">Showing {(currentPage-1)*itemsPerPage + 1}-{Math.min(currentPage*itemsPerPage, filteredList.length)} of {filteredList.length} items</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-1.5 border rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="p-1.5 border rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* DUPLICATE SUB-TAB */}
      {activeSubTab === 'duplicate' && (
        <div className="p-6 bg-slate-50 border border-slate-150 rounded-2xl space-y-6 text-left animate-fade-in">
          <div className="space-y-1">
            <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-1.5">
              <Copy size={16} className="text-indigo-600" />
              <span>Duplicate Year/Class Curriculum Setup</span>
            </h4>
            <p className="text-xs text-slate-500">Duplicate an entire term's curriculum from one Class Level to another Class Level to speed up deployment.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 rounded-xl border border-slate-150">
            {/* Source */}
            <div className="space-y-3 border-r border-slate-200/60 pr-6">
              <h5 className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Source Template</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500">Source Class</label>
                  <select value={dupSourceClass} onChange={(e) => setDupSourceClass(e.target.value)} className="w-full px-3 py-1.5 border rounded-xl bg-slate-50 text-xs font-semibold">
                    {classesList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500">Source Term</label>
                  <select value={dupSourceTerm} onChange={(e) => setDupSourceTerm(e.target.value)} className="w-full px-3 py-1.5 border rounded-xl bg-slate-50 text-xs font-semibold">
                    {termsList.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                Will extract {curriculums.filter(c => c.class === dupSourceClass && c.term === dupSourceTerm).length} weeks of syllabus topic definitions.
              </p>
            </div>

            {/* Target */}
            <div className="space-y-3">
              <h5 className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Target Destination</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500">Target Class</label>
                  <select value={dupTargetClass} onChange={(e) => setDupTargetClass(e.target.value)} className="w-full px-3 py-1.5 border rounded-xl bg-slate-50 text-xs font-semibold">
                    {classesList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500">Target Term</label>
                  <select value={dupTargetTerm} onChange={(e) => setDupTargetTerm(e.target.value)} className="w-full px-3 py-1.5 border rounded-xl bg-slate-50 text-xs font-semibold">
                    {termsList.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <p className="text-[10px] text-amber-600 leading-relaxed italic">
                ⚠️ Warning: Duplicating will overwrite existing target Class/Term records.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleDuplicateCurriculum}
              className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-720 text-white font-black text-xs rounded-xl cursor-pointer transition shadow-sm"
            >
              Execute Cloned Deployment
            </button>
          </div>
        </div>
      )}

      {/* IMPORT & EXPORT SUB-TAB */}
      {activeSubTab === 'import-export' && (
        <div className="p-6 bg-slate-50 border border-slate-150 rounded-2xl space-y-6 text-left animate-fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Export Panel */}
            <div className="bg-white p-5 rounded-2xl border border-slate-150 space-y-4">
              <h4 className="text-xs font-black uppercase text-indigo-950 tracking-wider flex items-center gap-1.5">
                <Download size={14} className="text-indigo-600" /> Export Curriculum Database
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Backup or migrate all curriculum mapping schemas currently compiled in this school environment. Supported formats include raw JSON schemas or CSV templates.
              </p>
              
              <div className="flex gap-2 text-xs pt-2">
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl cursor-pointer flex items-center gap-2"
                >
                  <FileText size={13} className="text-orange-500" />
                  <span>Download JSON Schema</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl cursor-pointer flex items-center gap-2"
                >
                  <FileText size={13} className="text-blue-500" />
                  <span>Download CSV Template</span>
                </button>
              </div>
            </div>

            {/* Import Panel */}
            <div className="bg-white p-5 rounded-2xl border border-slate-150 space-y-4">
              <h4 className="text-xs font-black uppercase text-indigo-950 tracking-wider flex items-center gap-1.5">
                <Upload size={14} className="text-indigo-600" /> Import Curriculum Array
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Paste a structured JSON array of curriculum objects below to bulk ingest syllabus topics immediately. Must include class, subject, term, week, and topic fields.
              </p>

              <div className="space-y-3 pt-1">
                <textarea
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono text-[10px] leading-relaxed"
                  placeholder='[{"class": "SS 1", "subject": "Mathematics", "term": "1st Term", "week": 1, "topic": "Logarithms", "objectives": ["Identify logarithms", "Perform calculations"]}]'
                  rows={4}
                />
                <button
                  type="button"
                  onClick={handleImportJson}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl cursor-pointer transition shadow-xs"
                >
                  Bulk Import Syllabus Topics
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
