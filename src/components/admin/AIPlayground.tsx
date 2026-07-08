import React, { useState } from 'react';
import { 
  Sparkles, Play, Timer, ArrowRight, BookOpen, Layers, Award, RefreshCw, 
  Settings2, FileText, CheckCircle, Flame, MessageSquare, Code, Clipboard
} from 'lucide-react';

interface AIPlaygroundProps {
  showToast: (message: string, type: 'success' | 'info' | 'error') => void;
}

const PLAYGROUND_PRESETS = [
  {
    id: 'lesson-vocab',
    name: 'Vocabulary Generator',
    category: 'Instructional',
    systemPrompt: 'You are an educational curriculum consultant in West Africa. Given a school subject and class grade level, generate 5 key vocabulary terms with detailed, age-appropriate definitions. Align your language with NERDC guidelines.',
    userPrompt: 'Subject: Basic Science\nClass: JSS 2\nTopic: Solar System and Planetary Motion'
  },
  {
    id: 'math-story',
    name: 'Mathematics Story Problem',
    category: 'Instructional',
    systemPrompt: 'You are an experienced math teacher in Nigeria. Formulate realistic math word problems using Nigerian contexts, like buying and selling in Balogun Market, transport fares in Naira, or soccer events in Lagos. Supply the model solution as well.',
    userPrompt: 'Class Level: Primary 5\nTopic: Percentage Profit and Loss\nNaira pricing parameters: ₦2,500'
  },
  {
    id: 'grading-remarks',
    name: 'Custom Teacher Remarks',
    category: 'Assessment',
    systemPrompt: 'You are a warm, constructive school principal in Nigeria. Given a student’s score and academic strengths, compose a professional, inspiring report card remark that highlights progress and gives recommendations for improvement.',
    userPrompt: 'Student Name: Chidi Obi\nCBT Quiz Score: 78/100\nStrengths: High engagement in worksheets and quick recall of key formulas.\nAreas of focus: Basic algebraic calculations.'
  }
];

export function AIPlayground({ showToast }: AIPlaygroundProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [systemPrompt, setSystemPrompt] = useState<string>(PLAYGROUND_PRESETS[0].systemPrompt);
  const [userPrompt, setUserPrompt] = useState<string>(PLAYGROUND_PRESETS[0].userPrompt);
  const [model, setModel] = useState<string>('gemini-3.5-flash');
  const [temperature, setTemperature] = useState<number>(0.2);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [outputResult, setOutputResult] = useState<string>('');
  
  // Metrics telemetry state
  const [metrics, setMetrics] = useState<{
    executionTimeMs?: number;
    charCount?: number;
    estimatedTokens?: number;
    model?: string;
  } | null>(null);

  // Apply a preset
  const handleApplyPreset = (presetId: string) => {
    const preset = PLAYGROUND_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSelectedPresetId(presetId);
      setSystemPrompt(preset.systemPrompt);
      setUserPrompt(preset.userPrompt);
      showToast(`Preset "${preset.name}" applied successfully!`, 'success');
    }
  };

  // Execute the playground run
  const handleRunPlayground = async () => {
    if (!userPrompt.trim()) {
      showToast('Please enter a user prompt to evaluate.', 'error');
      return;
    }

    setIsLoading(true);
    setMetrics(null);
    setOutputResult('');

    try {
      // Execute the request to our newly added backend playground endpoint
      const response = await fetch('/api/admin/playground', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_jwt_token') || ''}`
        },
        body: JSON.stringify({
          systemPrompt,
          userPrompt,
          model,
          temperature
        })
      });

      const resData = await response.json();
      if (resData.success) {
        setOutputResult(resData.text);
        setMetrics(resData.metrics);
        showToast('AI Generation completed successfully!', 'success');
      } else {
        throw new Error(resData.message || 'AI compilation error.');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to complete playground generation request.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy result to clipboard
  const handleCopyResult = () => {
    if (!outputResult) return;
    navigator.clipboard.writeText(outputResult);
    showToast('Result copied to clipboard!', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 font-sans text-left">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-3.5 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="font-extrabold text-lg text-indigo-950 flex items-center gap-2">
            <Sparkles className="text-amber-500 fill-amber-500 animate-pulse" size={20} />
            <span>Interactive AI Sandbox Playground</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">Direct developer sandbox. Test prompt variations, view tokens, and observe generation performance telemetry.</p>
        </div>
      </div>

      {/* Preset Pickers */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Quick Sandbox Presets</span>
        <div className="flex flex-wrap gap-2">
          {PLAYGROUND_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleApplyPreset(p.id)}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition flex items-center gap-2 cursor-pointer ${
                selectedPresetId === p.id
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-black shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FileText size={13} className="text-slate-400" />
              <span>{p.name}</span>
              <span className="text-[8px] uppercase px-1.5 py-0.5 bg-slate-100 rounded text-slate-400 font-black">{p.category}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Prompt settings and configuration inputs */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Configurations bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 border-b pb-2">
              <Settings2 size={13} /> Model Constraints
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500">Target Model</label>
                <select 
                  value={model} 
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded-xl bg-white text-xs font-bold outline-none"
                >
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500">Temperature: {temperature}</label>
                <input 
                  type="range" 
                  min="0.0" 
                  max="1.0" 
                  step="0.1" 
                  value={temperature} 
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none mt-2" 
                />
              </div>
            </div>
          </div>

          {/* System prompt input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase text-slate-500 flex items-center gap-1">
              <MessageSquare size={12} className="text-indigo-600" />
              <span>System Persona Instructions (Optional)</span>
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 text-slate-200 font-mono text-[11px] leading-relaxed rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. You are an expert West African teacher..."
              rows={5}
            />
          </div>

          {/* User Prompt Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase text-slate-500 flex items-center gap-1">
              <MessageSquare size={12} className="text-amber-500" />
              <span>Active User Prompt Target</span>
            </label>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className="w-full p-3 border rounded-xl text-xs font-medium leading-relaxed outline-none focus:border-indigo-500"
              placeholder="Provide curriculum topic or query details..."
              rows={5}
            />
          </div>

          {/* Execute Button */}
          <button
            type="button"
            disabled={isLoading}
            onClick={handleRunPlayground}
            className="w-full py-3 bg-indigo-650 hover:bg-indigo-720 disabled:opacity-60 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-indigo-650/10"
          >
            {isLoading ? (
              <>
                <RefreshCw className="animate-spin text-white" size={14} />
                <span>Generating output tokens...</span>
              </>
            ) : (
              <>
                <Play size={13} className="fill-white" />
                <span>Execute Prompt Sequence</span>
              </>
            )}
          </button>

        </div>

        {/* Right column: Results outputs and telemetry metrics */}
        <div className="lg:col-span-7 bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          
          {/* Telemetry metrics bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border rounded-xl p-3 text-center space-y-0.5 shadow-xs">
              <span className="text-[8px] font-black uppercase text-slate-400 block tracking-widest">Execution Time</span>
              <span className="text-sm font-black text-indigo-700 flex items-center justify-center gap-1">
                <Timer size={13} />
                <span>{metrics?.executionTimeMs ? `${(metrics.executionTimeMs / 1000).toFixed(2)}s` : '--'}</span>
              </span>
            </div>

            <div className="bg-white border rounded-xl p-3 text-center space-y-0.5 shadow-xs">
              <span className="text-[8px] font-black uppercase text-slate-400 block tracking-widest">Est. Token Cost</span>
              <span className="text-sm font-black text-indigo-700">
                {metrics?.estimatedTokens ? `${metrics.estimatedTokens} tkn` : '--'}
              </span>
            </div>

            <div className="bg-white border rounded-xl p-3 text-center space-y-0.5 shadow-xs">
              <span className="text-[8px] font-black uppercase text-slate-400 block tracking-widest">Model Target</span>
              <span className="text-xs font-black text-slate-600 block truncate">
                {metrics?.model ? metrics.model.replace('gemini-', '') : 'flash'}
              </span>
            </div>
          </div>

          {/* Response Output Area */}
          <div className="bg-white border rounded-2xl p-4 h-96 overflow-y-auto flex-1 flex flex-col justify-between space-y-4">
            {outputResult ? (
              <div className="space-y-4 text-xs font-medium text-slate-700">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Evaluation Results</span>
                  <button 
                    type="button"
                    onClick={handleCopyResult}
                    className="p-1.5 hover:bg-slate-50 border rounded-lg text-slate-500 cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                  >
                    <Clipboard size={12} />
                    <span>Copy</span>
                  </button>
                </div>
                
                <div className="whitespace-pre-wrap font-sans leading-relaxed text-xs">
                  {outputResult}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-6 space-y-2">
                <Code size={32} className="text-slate-300 animate-pulse" />
                <h5 className="font-bold text-slate-650 text-xs">Sandbox Awaiting Sequence Input</h5>
                <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                  Compose system instructions, define the target query, and click "Execute" to render output metrics instantly.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
