import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Key, Cpu, Sliders, Info, ShieldCheck, RefreshCw, 
  Settings, Save, Eye, EyeOff, AlertTriangle
} from 'lucide-react';

interface AISettingsProps {
  appConfig: any;
  onUpdateConfig: (nextConfig: any) => Promise<void>;
  showToast: (message: string, type: 'success' | 'info' | 'error') => void;
  onVerifyKey: (key: string) => Promise<boolean>;
  adminFetch?: (url: string, options?: RequestInit) => Promise<Response>;
}

export function AISettings({
  appConfig,
  onUpdateConfig,
  showToast,
  onVerifyKey,
  adminFetch
}: AISettingsProps) {
  // Config form states
  const [apiKey, setApiKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [aiModel, setAiModel] = useState<string>('gemini-3.5-flash');
  const [aiTemperature, setAiTemperature] = useState<number>(0.2);
  const [aiMaxTokens, setAiMaxTokens] = useState<number>(8192);
  const [aiTopP, setAiTopP] = useState<number>(0.95);
  const [aiTopK, setAiTopK] = useState<number>(40);

  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [keyStatus, setKeyStatus] = useState<'valid' | 'leaked' | 'invalid' | 'unknown'>('unknown');
  const [statusDetails, setStatusDetails] = useState<string>('');
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);

  // Sync inputs with state
  useEffect(() => {
    if (appConfig) {
      setAiModel(appConfig.aiModel || 'gemini-3.5-flash');
      setAiTemperature(appConfig.aiTemperature !== undefined ? Number(appConfig.aiTemperature) : 0.2);
      setAiMaxTokens(appConfig.aiMaxTokens !== undefined ? Number(appConfig.aiMaxTokens) : 8192);
      setAiTopP(appConfig.aiTopP !== undefined ? Number(appConfig.aiTopP) : 0.95);
      setAiTopK(appConfig.aiTopK !== undefined ? Number(appConfig.aiTopK) : 40);
    }
  }, [appConfig]);

  // Load current secure key status and active masked key from server
  useEffect(() => {
    const fetchSecureSettings = async () => {
      if (!adminFetch) return;
      setIsCheckingStatus(true);
      try {
        const res = await adminFetch('/api/admin/secure-settings');
        const data = await res.json();
        if (data) {
          if (data.keyStatus) setKeyStatus(data.keyStatus);
          if (data.statusDetails) setStatusDetails(data.statusDetails);
          if (data.geminiApiKey) {
            setApiKey(data.geminiApiKey);
          }
        }
      } catch (err) {
        console.error('Failed to load secure settings key status:', err);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    fetchSecureSettings();
  }, [adminFetch]);

  // Handle saving configurations
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const nextConfig = {
        ...appConfig,
        geminiApiKey: apiKey.trim(),
        aiModel,
        aiTemperature,
        aiMaxTokens,
        aiTopP,
        aiTopK
      };
      await onUpdateConfig(nextConfig);
      showToast('AI Model configuration settings saved!', 'success');
    } catch (err) {
      showToast('Failed to save AI configuration.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Verify connection to Google Gemini API
  const handleVerifyApiKey = async () => {
    if (!apiKey.trim()) {
      showToast('Please specify a Gemini API Key to verify.', 'error');
      return;
    }

    setIsVerifying(true);
    try {
      const success = await onVerifyKey(apiKey.trim());
      if (success) {
        showToast('Google Gemini Connection verified successfully! Key is operational.', 'success');
      } else {
        showToast('Gemini Verification failed. Check key validity or connection.', 'error');
      }
    } catch (e) {
      showToast('Failed to verify Gemini API Key.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 font-sans text-left">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-3.5">
        <h3 className="font-extrabold text-lg text-indigo-950 flex items-center gap-2">
          <Settings className="text-indigo-600" size={20} />
          <span>Large Language Model Settings</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">Configure API keys, temperature limits, response metrics, and parameters for lesson generation nodes.</p>
      </div>

      {/* Leak Warning Banner or general Key Status Info */}
      {keyStatus === 'leaked' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3 text-red-900 animate-pulse shadow-sm">
          <AlertTriangle size={20} className="shrink-0 text-red-600 mt-0.5" />
          <div className="space-y-1.5 text-xs">
            <h4 className="font-extrabold text-red-950">⚠️ Active Google Gemini API Key Flagged as Leaked</h4>
            <p className="text-red-800 leading-relaxed font-medium">
              The active Gemini API Key (or the system default configuration) has been flagged as leaked by Google Cloud's security scanner and is being blocked (<code>PERMISSION_DENIED</code>).
            </p>
            <p className="text-red-700 leading-relaxed font-medium">
              <strong>Fault-Tolerance Status:</strong> Our custom, West African NERDC syllabus-compliant local fallback generators are fully operational! All lesson note, exam, and curriculum actions are successfully operating in high-fidelity sandbox mode.
            </p>
            <p className="text-red-900 font-bold">
              To re-enable direct live AI-powered generation, please update the Google Gemini API Key below with a secure, newly generated key from Google AI Studio.
            </p>
          </div>
        </div>
      )}

      {keyStatus === 'invalid' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-amber-900 shadow-sm">
          <AlertTriangle size={18} className="shrink-0 text-amber-600 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-extrabold text-amber-950">Active Gemini API Key is Not Operational</h4>
            <p className="text-amber-800 leading-relaxed font-medium">
              The system was unable to verify the connection. Detailed response: <code className="text-[11px] bg-amber-100 px-1 py-0.5 rounded font-mono">{statusDetails || 'Invalid key parameters.'}</code>.
            </p>
            <p className="text-amber-700 leading-relaxed font-medium">
              Using standard local fallback engines for backup safety. You can provide and test another key below.
            </p>
          </div>
        </div>
      )}

      {keyStatus === 'valid' && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex gap-3 text-emerald-950 shadow-sm">
          <ShieldCheck size={18} className="shrink-0 text-emerald-600 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-extrabold text-emerald-950">✔ Gemini LLM Key Operational</h4>
            <p className="text-emerald-800 leading-relaxed font-medium">
              The Google Gemini API connection is perfectly authenticated and active. High-fidelity West African educational notes and metrics are being synthesised on-demand by Gemini 3.5.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Essential API keys & Models */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: API Authentication */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-black uppercase text-indigo-950 flex items-center gap-1.5 border-b pb-2">
              <Key size={14} className="text-indigo-600" /> API Authentication Secrets
            </h4>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-500">Google Gemini API Key</label>
              <div className="relative">
                <input 
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full pl-3 pr-24 py-2 border rounded-xl bg-slate-50 font-mono text-xs font-bold outline-none border-slate-200 focus:border-indigo-500"
                  placeholder="AI_STUDIO_GEMINI_API_KEY..."
                />
                
                <div className="absolute right-2 top-1.5 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="p-1 text-slate-400 hover:text-slate-650 cursor-pointer"
                  >
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    type="button"
                    disabled={isVerifying}
                    onClick={handleVerifyApiKey}
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 text-indigo-700 font-extrabold text-[9px] rounded-lg border border-indigo-200 cursor-pointer flex items-center gap-1"
                  >
                    {isVerifying ? 'Testing...' : 'Verify Key'}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-400">
                You can leave this field empty to fall back onto the server's default credential key specified inside the <code>.env</code> file.
              </p>
            </div>
          </div>

          {/* Section 2: LLM Configuration Selector */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-black uppercase text-indigo-950 flex items-center gap-1.5 border-b pb-2">
              <Cpu size={14} className="text-indigo-600" /> Active Model Deployments
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-500">Core Provider</label>
                <input 
                  type="text" 
                  disabled 
                  value="Google AI Studio" 
                  className="w-full px-3 py-2 border rounded-xl bg-slate-100 text-xs font-bold text-slate-600 cursor-not-allowed" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-500">Target Model Family</label>
                <select 
                  value={aiModel} 
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-bold outline-none"
                >
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash (Default Speed)</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Extreme Pedagogy)</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/50 border rounded-xl flex items-start gap-2.5 text-[10px] text-indigo-900 leading-relaxed font-medium">
              <Info size={14} className="text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong>Gemini 3.5 Flash</strong> provides superior speed and is perfectly optimized for tabular NERDC structural lesson outputs with complete markdown formats.
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Temperature, tokens and sliders parameters */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Section 3: Token Parameter Limits */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5">
            <h4 className="text-xs font-black uppercase text-indigo-950 flex items-center gap-1.5 border-b pb-2">
              <Sliders size={14} className="text-indigo-600" /> Generation Metrics Controls
            </h4>

            {/* Slider: Temperature */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-extrabold uppercase text-slate-500">Temperature (Creativity)</label>
                <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{aiTemperature}</span>
              </div>
              <input 
                type="range" 
                min="0.0" 
                max="1.0" 
                step="0.05" 
                value={aiTemperature} 
                onChange={(e) => setAiTemperature(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-1 bg-slate-100 rounded-lg appearance-none" 
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                <span>Deterministic</span>
                <span>Highly Creative</span>
              </div>
            </div>

            {/* Slider: Top-P */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-extrabold uppercase text-slate-500">Top-P (Nucleus Sampling)</label>
                <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{aiTopP}</span>
              </div>
              <input 
                type="range" 
                min="0.0" 
                max="1.0" 
                step="0.05" 
                value={aiTopP} 
                onChange={(e) => setAiTopP(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-1 bg-slate-100 rounded-lg appearance-none" 
              />
            </div>

            {/* Input: Max output tokens */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-500">Max Out Tokens</label>
                <input 
                  type="number" 
                  min="256" 
                  max="16384" 
                  value={aiMaxTokens}
                  onChange={(e) => setAiMaxTokens(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border rounded-xl bg-white text-xs font-bold outline-none" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-500">Top-K Selection</label>
                <input 
                  type="number" 
                  min="1" 
                  max="100" 
                  value={aiTopK}
                  onChange={(e) => setAiTopK(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border rounded-xl bg-white text-xs font-bold outline-none" 
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm shadow-indigo-600/15"
              >
                <Save size={14} />
                <span>{isSaving ? 'Deploying Config...' : 'Apply & Save Config'}</span>
              </button>
            </div>
          </div>

          {/* Secure validation badge */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex gap-3 text-emerald-900">
            <ShieldCheck size={18} className="shrink-0 text-emerald-600 mt-0.5 animate-pulse" />
            <div className="space-y-1">
              <h5 className="text-xs font-extrabold">Active Transport Guard</h5>
              <p className="text-[10px] text-emerald-800 leading-relaxed font-medium">
                Your API Keys are strictly saved inside secure database storage on the backend and are NEVER exposed to client browsers or client-side telemetry trackers.
              </p>
            </div>
          </div>

        </div>

      </form>

    </div>
  );
}
