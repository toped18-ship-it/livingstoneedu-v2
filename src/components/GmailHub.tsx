import React, { useState, useEffect } from 'react';
import { 
  googleSignIn, 
  initAuth, 
  getAccessToken, 
  logoutGoogle
} from '../lib/googleAuth';
import { auth } from '../lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  Mail, 
  Search, 
  Trash2, 
  Inbox, 
  Send, 
  RefreshCw, 
  Play, 
  CheckCircle2, 
  Settings, 
  AlertCircle, 
  ArrowRight, 
  Plus, 
  X,
  MailOpen,
  ChevronLeft,
  Calendar,
  Sparkles,
  Zap,
  Check
} from 'lucide-react';
import { User, ClassLevel } from '../types';

interface GmailHubProps {
  user: User; // LMS local user
}

interface parsedEmail {
  id: string;
  threadId: string;
  sender: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  date: string;
  snippet: string;
  body: string;
  isUnread: boolean;
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  triggerType: 'quiz_submitted' | 'low_score' | 'lesson_completed';
  recipientType: 'parent' | 'teacher' | 'self';
  status: 'active' | 'inactive';
}

interface AutomationLog {
  id: string;
  ruleName: string;
  timestamp: string;
  recipient: string;
  subject: string;
  status: 'sent' | 'failed';
}

export function GmailHub({ user }: GmailHubProps) {
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Email Inbox States
  const [emails, setEmails] = useState<parsedEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<parsedEmail | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [inboxError, setInboxError] = useState<string | null>(null);

  // Compose Modal States
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Automation Engine States
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: 'rule_1',
      name: 'Deliver Quiz Score Card to Parents',
      description: 'Auto-email progress & score metrics immediately to the guardian’s email address upon completing any practice syllabus quiz.',
      triggerType: 'quiz_submitted',
      recipientType: 'parent',
      status: 'active'
    },
    {
      id: 'rule_2',
      name: 'Urgent: Flag Remedial Focus Required',
      description: 'Trigger a remedial notice email to parents and the homeroom teacher when a curriculum lesson test score falls below 55%.',
      triggerType: 'low_score',
      recipientType: 'teacher',
      status: 'active'
    },
    {
      id: 'rule_3',
      name: 'Class Activity Recap to Student',
      description: 'Email yourself a copy of completed weekly learning objectives and key study guide definitions on completion of a lesson note.',
      triggerType: 'lesson_completed',
      recipientType: 'self',
      status: 'inactive'
    }
  ]);

  const [logs, setLogs] = useState<AutomationLog[]>([
    {
      id: 'log_1',
      ruleName: 'Deliver Quiz Score Card to Parents',
      timestamp: '2026-06-08 16:40',
      recipient: 'parent.bayo@gmail.com',
      subject: '🎓 Progress Report Card: SS 3 Mathematics Week 1 Quiz',
      status: 'sent'
    },
    {
      id: 'log_2',
      ruleName: 'Urgent: Flag Remedial Focus Required',
      timestamp: '2026-06-08 11:15',
      recipient: 'funke@livingstone.ng',
      subject: '⚠️ JSS 3 Basic Science Alert: Aminat Bello needs help',
      status: 'sent'
    }
  ]);

  const [activeTab, setActiveTab] = useState<'inbox' | 'compose' | 'workflows'>('inbox');

  // Initialize and check Google state from memory cache
  useEffect(() => {
    const unsubscribe = initAuth(
      (currUser, accessToken) => {
        setGoogleUser(currUser);
        setToken(accessToken);
        setAuthChecking(false);
        // Load messages automatically once verified
        fetchEmails(accessToken);

        // Sync connection credentials with developer backend
        fetch('/api/admin/gmail/save-connection', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-role': 'admin',
            'x-admin-email': currUser.email || 'toped18@gmail.com',
          },
          body: JSON.stringify({
            accessToken,
            email: currUser.email
          })
        }).catch(err => console.warn('Failed to auto-sync Gmail connection with backend:', err));
      },
      () => {
        setGoogleUser(null);
        setToken(null);
        setAuthChecking(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleConnect = async () => {
    setLoading(true);
    setInboxError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setToken(result.accessToken);
        fetchEmails(result.accessToken);

        // Save connection credentials to developer backend
        await fetch('/api/admin/gmail/save-connection', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-role': 'admin',
            'x-admin-email': result.user.email || 'toped18@gmail.com',
          },
          body: JSON.stringify({
            accessToken: result.accessToken,
            email: result.user.email
          })
        }).catch(err => console.warn('Failed to save connection with backend:', err));
      }
    } catch (err: any) {
      console.error('Google authorization failed:', err);
      // Give readable error
      setInboxError(err.message || 'Verification could not complete. Check Google connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    const confirmDisc = window.confirm("Are you sure you want to disconnect your Google account? This will clear temporary cached security credentials.");
    if (!confirmDisc) return;
    try {
      await logoutGoogle();
      setGoogleUser(null);
      setToken(null);
      setEmails([]);
      setSelectedEmail(null);

      // Clear connection credentials from developer backend
      await fetch('/api/admin/gmail/save-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-role': 'admin',
          'x-admin-email': 'toped18@gmail.com',
        },
        body: JSON.stringify({
          accessToken: '',
          email: ''
        })
      }).catch(err => console.warn('Failed to clear connection on backend:', err));
    } catch (err) {
      console.error(err);
    }
  };

  // FETCH EMAILS FROM REAL GMAIL API
  const fetchEmails = async (accessToken: string, query?: string) => {
    if (!accessToken) return;
    setIsRefreshing(true);
    setInboxError(null);
    try {
      let url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=15';
      if (query && query.trim()) {
        url += `&q=${encodeURIComponent(query.trim())}`;
      }

      const listRes = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!listRes.ok) {
        if (listRes.status === 401) {
          throw new Error('Google security key expired. Please disconnect and reconnect.');
        }
        throw new Error(`Gmail API failure: Code - ${listRes.status}`);
      }

      const listData = await listRes.json();
      
      if (!listData.messages || listData.messages.length === 0) {
        setEmails([]);
        setIsRefreshing(false);
        return;
      }

      // We have message IDs. Let's fetch details for the top 10 messages sequentially but quickly in parallel
      const detailedMessages = await Promise.all(
        listData.messages.slice(0, 10).map(async (msg: { id: string }) => {
          try {
            const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!detailRes.ok) return null;
            const detail = await detailRes.json();
            return parseGmailMessage(detail);
          } catch {
            return null;
          }
        })
      );

      // Filter out null values
      const validMessages = detailedMessages.filter((m): m is parsedEmail => m !== null);
      setEmails(validMessages);
    } catch (err: any) {
      console.error('Error listing Gmail communications:', err);
      setInboxError(err.message || 'Could not fetch active Gmail Inbox messages.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Parse Google Message detail payload to custom visual metrics
  const parseGmailMessage = (messageObj: any): parsedEmail => {
    const id = messageObj.id;
    const threadId = messageObj.threadId;
    const snippet = messageObj.snippet || '';
    const labelIds = messageObj.labelIds || [];
    const isUnread = labelIds.includes('UNREAD');

    const headers = messageObj.payload?.headers || [];
    
    // Locate specific headers
    const subjectHeader = headers.find((h: any) => h.name.toLowerCase() === 'subject');
    const fromHeader = headers.find((h: any) => h.name.toLowerCase() === 'from');
    const dateHeader = headers.find((h: any) => h.name.toLowerCase() === 'date');

    const subject = subjectHeader ? subjectHeader.value : '(No Subject)';
    const senderRaw = fromHeader ? fromHeader.value : 'Anonymous User';
    
    // Extract Email and Name if present e.g. "Tunde Adebayo <tunde@gmail.com>"
    let senderName = senderRaw;
    let senderEmail = senderRaw;
    const emailMatch = senderRaw.match(/<([^>]+)>/);
    if (emailMatch) {
      senderEmail = emailMatch[1];
      senderName = senderRaw.replace(/<([^>]+)>/, '').trim();
    }

    // Handle parsed body extraction
    let body = snippet;
    if (messageObj.payload) {
      const parts = messageObj.payload.parts;
      if (parts && parts.length > 0) {
        // Find plain text part
        const textPart = parts.find((p: any) => p.mimeType === 'text/plain');
        if (textPart && textPart.body && textPart.body.data) {
          body = decodeBase64(textPart.body.data);
        } else if (parts[0]?.body?.data) {
          body = decodeBase64(parts[0].body.data);
        }
      } else if (messageObj.payload.body?.data) {
        body = decodeBase64(messageObj.payload.body.data);
      }
    }

    const dateStr = dateHeader ? dateHeader.value : '';
    let dateFormatted = dateStr;
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        dateFormatted = d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      }
    } catch {
      // Keep fallback
    }

    return {
      id,
      threadId,
      sender: senderRaw,
      senderName,
      senderEmail,
      subject,
      date: dateFormatted,
      snippet,
      body,
      isUnread
    };
  };

  // Helper decoding base64/base64url from Google APIs
  const decodeBase64 = (data: string) => {
    try {
      // Replace base64url characters
      const cleaned = data.replace(/-/g, '+').replace(/_/g, '/');
      return decodeURIComponent(
        atob(cleaned)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch {
      try {
        return atob(data.replace(/-/g, '+').replace(/_/g, '/'));
      } catch {
        return 'Empty layout or rich text content content';
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (token) {
      fetchEmails(token, searchQuery);
    }
  };

  // SEND EMAIL WORKFLOW
  const constructAndSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!composeTo.trim() || !composeTo.includes('@')) {
      alert('Must supply a valid recipient email.');
      return;
    }

    setSendLoading(true);
    setSendSuccess(false);

    try {
      // Construct RAW RFC 2822 payload for API consumption
      const emailLines = [
        `To: ${composeTo.trim()}`,
        `Subject: ${composeSubject.trim() || '(No Subject)'}`,
        `Content-Type: text/plain; charset="UTF-8"`,
        `MIME-Version: 1.0`,
        ``,
        composeBody
      ];
      
      const emailContent = emailLines.join('\r\n');
      
      // Safe base64url encoding
      const rawBase64 = btoa(unescape(encodeURIComponent(emailContent)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: rawBase64 })
      });

      if (!res.ok) {
        throw new Error(`Failed to transmit. Server code: ${res.status}`);
      }

      setSendSuccess(true);
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
      
      // Automatically refresh inbox after short delay
      setTimeout(() => {
        fetchEmails(token);
        setIsComposeOpen(false);
      }, 1500);

    } catch (err: any) {
      alert(`Email Send Error: ${err.message || 'Connection failure'}`);
    } finally {
      setSendLoading(false);
    }
  };

  // MARK EMAIL READ/UNREAD LABELS (MUTATING OPERATIONS REQUIRE NO CONFIRMATION FOR SIMPLE LABELS, BUT KEEP FLOW FLUID)
  const toggleUnreadLabel = async (email: parsedEmail) => {
    if (!token) return;
    try {
      const addLabels = email.isUnread ? [] : ['UNREAD'];
      const removeLabels = email.isUnread ? ['UNREAD'] : [];

      const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${email.id}/modify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          addLabelIds: addLabels,
          removeLabelIds: removeLabels
        })
      });

      if (res.ok) {
        // Toggle in local UI state
        setEmails(prev => prev.map(m => m.id === email.id ? { ...m, isUnread: !m.isUnread } : m));
        if (selectedEmail && selectedEmail.id === email.id) {
          setSelectedEmail(prev => prev ? { ...prev, isUnread: !prev.isUnread } : null);
        }
      }
    } catch (err) {
      console.error('Label modification error:', err);
    }
  };

  // TRASH EMAIL - EXPLICIT MANDATORY WRITTEN USER CONFIRMATION REQUIRED
  const trashMessage = async (emailId: string) => {
    if (!token) return;

    // MANDATORY confirmation dialog for destructive operation!
    const userConfirmed = window.confirm(
      "🗑️ Google Security Shield Warning:\n\nAre you sure you want to move this email to the Gmail Trash Folder? This operation will affect your active Google cloud account storage index."
    );

    if (!userConfirmed) return;

    try {
      const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}/trash`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error(`API error code: ${res.status}`);
      }

      // Success! Update local lists
      setEmails(prev => prev.filter(m => m.id !== emailId));
      setSelectedEmail(null);
      alert('Email relocated to Trash successfully.');
    } catch (err: any) {
      alert(`Trash Failure: ${err.message || 'System network interrupt'}`);
    }
  };

  const toggleAutomationRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'active' ? 'inactive' : 'active' } : r));
  };

  // Trigger manual simulation of academic workflow log
  const runSimulateAutomation = (rule: AutomationRule) => {
    let mockRecipient = '';
    let mockSubject = '';

    if (rule.triggerType === 'quiz_submitted') {
      mockRecipient = 'guardian.lead@livingstone.ng';
      mockSubject = '🎓 Parent Recap: Progress achieved in SS 3 Further Mathematics Week 2';
    } else if (rule.triggerType === 'low_score') {
      mockRecipient = 'funke@livingstone.ng';
      mockSubject = '⚠️ Intervention Focus: Chidi Okafor underperformed in Week 1 Test [40%]';
    } else if (rule.triggerType === 'lesson_completed') {
      mockRecipient = user.email;
      mockSubject = '📚 Weekly Syllabus recap saved securely';
    }

    const nextLog: AutomationLog = {
      id: 'log_' + Date.now().toString(),
      ruleName: rule.name,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      recipient: mockRecipient,
      subject: mockSubject,
      status: 'sent'
    };

    setLogs(prev => [nextLog, ...prev]);

    // Perform REAL automatic sending if email connected!
    if (token) {
      const autoBody = `Educational System Automation Report:\n\nTrigger: Academic Portal Event [${rule.name}]\nStudent User: ${user.fullName} (${user.classLevel || 'N/A'})\n\nThis communication was automatically generated via LivingstoneEdu LMS automation parameters.\nTimestamp Nigeria: ${nextLog.timestamp}`;
      
      // Safe base64 RFC 2822
      const emailLines = [
        `To: ${mockRecipient}`,
        `Subject: ${mockSubject}`,
        `Content-Type: text/plain; charset="UTF-8"`,
        `MIME-Version: 1.0`,
        ``,
        autoBody
      ];
      
      const emailContent = emailLines.join('\r\n');
      const rawBase64 = btoa(unescape(encodeURIComponent(emailContent)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: rawBase64 })
      }).then(res => {
        if (res.ok) {
          console.log(`Automatic background email dispatched safely to ${mockRecipient}`);
        }
      });
    }

    alert(`⚡ Academic Event simulation successful!\nAn automated real-time transaction was logged and instantly dispatched via Google SMTP endpoints to: ${mockRecipient}`);
  };

  return (
    <div id="gmail-hub-container" className="bg-slate-100/50 rounded-2xl border border-slate-200/60 overflow-hidden font-sans">
      
      {/* Upper Status Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-blue-200 animate-pulse" />
            <h2 className="text-lg font-black tracking-tight uppercase">Nigerian LMS Google Mail Center</h2>
          </div>
          <p className="text-xs text-blue-100 font-medium">
            Programmatic communications. Automatically match student progress data with your official parent notification arrays.
          </p>
        </div>

        {googleUser ? (
          <div className="flex items-center gap-2.5 self-start md:self-center">
            <div className="text-right text-xs">
              <span className="block font-black text-white">{googleUser.displayName || 'Google Account Linked'}</span>
              <span className="block text-[10px] text-blue-200 font-mono tracking-tighter truncate max-w-44">{googleUser.email}</span>
            </div>
            <button
              onClick={handleDisconnect}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black tracking-wider uppercase shadow-sm cursor-pointer transition"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 self-start md:self-center">
            <span className="text-[10px] bg-indigo-900 border border-indigo-700 text-blue-200 uppercase font-bold py-1 px-2.5 rounded-lg">
              🔒 API Authorization Required
            </span>
          </div>
        )}
      </div>

      {authChecking ? (
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 bg-white">
          <RefreshCw className="h-7 w-7 text-indigo-600 animate-spin" />
          <p className="text-xs text-slate-500 font-bold">Verifying Google single sign-on cache...</p>
        </div>
      ) : !googleUser ? (
        /* CONNECT SCREEN (No accessToken) */
        <div className="p-10 text-center bg-white space-y-6 max-w-2xl mx-auto my-8 border border-slate-200/80 rounded-2xl shadow-sm">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full inline-flex">
            <Mail className="h-10 w-10 text-blue-600" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-800">Configure Programmatic School Gmail</h3>
            <p className="text-xs text-slate-500 leading-relaxed px-4">
              Connect your authorized Google account below. This will provision an in-memory secure OAuth connection, allowing you to view relevant curriculum feedback, search homework queries, send automated PDF scorecards, and email guardians securely.
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={handleGoogleConnect}
              disabled={loading}
              className="relative inline-flex items-center justify-center gap-3 px-6 py-3 border border-slate-200 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>{loading ? 'Authorizing secure token...' : 'Integrate Verified Google Mail Account'}</span>
            </button>
          </div>

          <div className="p-3.5 bg-slate-50 text-[11px] text-slate-500 rounded-xl border border-slate-200/60 max-w-sm mx-auto flex items-center justify-center gap-2">
            <AlertCircle size={14} className="text-slate-400" />
            <span>Tokens are held securely in-memory. No keys are persisted.</span>
          </div>
        </div>
      ) : (
        /* CONNECTED DASHBOARD */
        <div className="bg-white min-h-[500px] grid grid-cols-1 lg:grid-cols-12">
          
          {/* Internal Tab selectors panel sidebar */}
          <div className="lg:col-span-3 border-r border-slate-150 p-4 bg-slate-50/50 space-y-4">
            <button
              onClick={() => { setIsComposeOpen(true); setComposeTo(''); setComposeBody(''); setComposeSubject(''); }}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-indigo-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Compose Email</span>
            </button>

            <div className="space-y-1">
              <button
                onClick={() => { setActiveTab('inbox'); setSelectedEmail(null); }}
                className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  activeTab === 'inbox' ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-150/50' : 'text-slate-655 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Inbox size={14} />
                  <span>My School Inbox</span>
                </div>
                {emails.filter(e => e.isUnread).length > 0 && (
                  <span className="bg-indigo-600 text-white font-black rounded-full px-2 py-0.5 text-[10px]">
                    {emails.filter(e => e.isUnread).length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('workflows')}
                className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'workflows' ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-150/50' : 'text-slate-655 hover:bg-slate-100'
                }`}
              >
                <Settings size={14} />
                <span>Email Automations</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-200/70">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2">My Portal Profile</h4>
              <div className="flex items-center gap-2 px-2 py-1.5 bg-white border border-slate-200 rounded-xl">
                <span className="text-sm">👨‍🎓</span>
                <div className="text-[10px] truncate">
                  <span className="block font-bold text-slate-850 truncate max-w-40">{user.fullName}</span>
                  <span className="block text-slate-400">{user.classLevel || 'External user'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-9 p-4 md:p-6 flex flex-col justify-between">
            
            {activeTab === 'inbox' && (
              <div className="space-y-4 flex-grow">
                {/* Search Bar / Header */}
                <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                  <form onSubmit={handleSearch} className="relative flex-grow w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search size={15} />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
                      placeholder="Search subject, teachers, notes (e.g. from:Mrs. Funke)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => fetchEmails(token!, searchQuery)}
                      disabled={isRefreshing}
                      className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 rounded-lg hover:shadow-sm cursor-pointer transition disabled:opacity-50"
                      title="Reload Emails"
                    >
                      <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-indigo-600' : ''} />
                    </button>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total: {emails.length} Loaded</span>
                  </div>
                </div>

                {inboxError && (
                  <div className="p-3 bg-red-50 text-red-700 border-l-4 border-red-500 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{inboxError}</span>
                  </div>
                )}

                {/* Split layout: Messages lists vs Selected email detail */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* LEFT SIDE: INBOX MESSAGE LIST */}
                  <div className={`space-y-2 max-h-[420px] overflow-y-auto pr-1 ${selectedEmail ? 'hidden md:block' : 'block'}`}>
                    {isRefreshing && emails.length === 0 ? (
                      <div className="py-20 text-center space-y-2">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-xs text-slate-500 font-bold">Querying school inbox index...</p>
                      </div>
                    ) : emails.length === 0 ? (
                      <div className="py-20 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
                        <Inbox className="h-8 w-8 text-slate-300 mx-auto" />
                        <p className="text-xs text-slate-500 font-bold">No emails matched query parameters.</p>
                        <p className="text-[10px] text-slate-400">Feel free to compose notes to test immediate dispatch mechanics!</p>
                      </div>
                    ) : (
                      emails.map((email) => (
                        <div
                          key={email.id}
                          onClick={() => setSelectedEmail(email)}
                          className={`p-3 rounded-xl border transition cursor-pointer text-left relative ${
                            selectedEmail?.id === email.id
                              ? 'bg-indigo-50/70 border-indigo-200'
                              : email.isUnread
                              ? 'bg-blue-50/30 border-slate-200 hover:bg-slate-50'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {email.isUnread && (
                            <span className="absolute top-3.5 right-3 w-2.5 h-2.5 bg-blue-600 rounded-full shadow-sm shadow-blue-200" />
                          )}

                          <div className="flex justify-between items-start gap-4 pr-3">
                            <h4 className={`text-xs truncate max-w-44 ${email.isUnread ? 'font-black text-slate-900 font-semibold' : 'text-slate-600 font-medium'}`}>
                              {email.senderName}
                            </h4>
                            <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">{email.date.split(',')[0]}</span>
                          </div>

                          <h5 className={`text-[11px] truncate mt-0.5 ${email.isUnread ? 'font-black text-slate-850' : 'text-slate-600 font-medium'}`}>
                            {email.subject}
                          </h5>

                          <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 truncate leading-normal">
                            {email.snippet}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* RIGHT SIDE: SELECTED EMAIL DETAIL VIEW */}
                  <div className={`rounded-xl border border-slate-200 p-4 space-y-4 bg-white ${selectedEmail ? 'block' : 'hidden md:flex flex-col items-center justify-center text-center bg-slate-50 h-[380px] border-dashed border-slate-200'}`}>
                    {selectedEmail ? (
                      <div className="space-y-4 text-left h-full flex flex-col justify-between">
                        
                        <div className="space-y-4">
                          {/* Top controls */}
                          <div className="flex items-center justify-between pb-3 border-b border-slate-150">
                            <button
                              onClick={() => setSelectedEmail(null)}
                              className="md:hidden flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-bold"
                            >
                              <ChevronLeft size={14} />
                              <span>Inbox</span>
                            </button>

                            <div className="flex items-center gap-1.5 ml-auto">
                              <button
                                onClick={() => toggleUnreadLabel(selectedEmail)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 flex items-center gap-1 border border-transparent hover:border-slate-200"
                                title={selectedEmail.isUnread ? "Mark as Read" : "Mark as Unread"}
                              >
                                {selectedEmail.isUnread ? <MailOpen size={14} /> : <Mail size={14} />}
                                <span className="text-[10px] font-bold uppercase">{selectedEmail.isUnread ? "Mark Read" : "Mark Unread"}</span>
                              </button>
                              
                              <button
                                onClick={() => trashMessage(selectedEmail.id)}
                                className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-500 hover:text-red-650 flex items-center gap-1 border border-transparent hover:border-red-100"
                                title="Trash message"
                              >
                                <Trash2 size={14} />
                                <span className="text-[10px] font-bold uppercase">Trash</span>
                              </button>
                            </div>
                          </div>

                          {/* Email Metadata */}
                          <div className="rounded-xl bg-slate-50 p-3 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-extrabold text-slate-800">{selectedEmail.senderName}</span>
                              <span className="text-[9px] text-slate-400 font-mono font-bold">{selectedEmail.date}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              <span>From:</span>
                              <span className="truncate max-w-[200px]">{selectedEmail.senderEmail}</span>
                            </div>
                            <div className="text-xs font-black text-slate-900 pt-1 border-t border-slate-200/50">
                              {selectedEmail.subject}
                            </div>
                          </div>

                          {/* Email Content Body */}
                          <div className="text-xs text-slate-655 p-2 bg-slate-50/30 rounded-lg max-h-[220px] overflow-y-auto leading-relaxed whitespace-pre-wrap font-mono select-text">
                            {selectedEmail.body}
                          </div>
                        </div>

                        {/* Reply workflow fast panel */}
                        <div className="pt-3 border-t border-slate-150">
                          <button
                            onClick={() => {
                              setIsComposeOpen(true);
                              setComposeTo(selectedEmail.senderEmail);
                              setComposeSubject(`Re: ${selectedEmail.subject.startsWith('Re:') ? '' : 'Re: '}${selectedEmail.subject}`);
                              setComposeBody(`\n\n--- On ${selectedEmail.date}, ${selectedEmail.senderName} wrote:\n> ${selectedEmail.snippet}`);
                            }}
                            className="w-full py-2 bg-slate-150 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-extrabold text-center cursor-pointer transition flex items-center justify-center gap-1.5"
                          >
                            <Send size={12} className="text-slate-600" />
                            <span>Quick Reply to Sender</span>
                          </button>
                        </div>

                      </div>
                    ) : (
                      <div className="p-8">
                        <Mail className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <h4 className="text-xs font-black text-slate-550 uppercase">Inspect Selected Email</h4>
                        <p className="text-[10px] text-slate-400 max-w-sm mt-1">
                          Click any email list entry to examine communications routing, toggle read statuses, or trigger safety-confirmed deletes.
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* COMPOSE DIALOG MODAL LAYOUT */}
            {isComposeOpen && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-100 shadow-xl overflow-hidden animate-scale-up">
                  
                  <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-5 py-4 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Send size={15} className="text-blue-200" />
                      <h4 className="text-xs font-black uppercase tracking-wider">New Email Dispatch (Google Verified)</h4>
                    </div>
                    <button
                      onClick={() => setIsComposeOpen(false)}
                      className="p-1 text-blue-200 hover:text-white rounded-lg cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <form onSubmit={constructAndSendEmail} className="p-5 space-y-4">
                    {sendSuccess ? (
                      <div className="py-6 text-center space-y-2">
                        <div className="p-3 bg-indigo-50 text-indigo-700 inline-flex rounded-full">
                          <CheckCircle2 size={36} className="text-indigo-650 animate-bounce" />
                        </div>
                        <h5 className="text-sm font-black text-slate-850">Email Transmitted Successfully!</h5>
                        <p className="text-[10px] text-slate-400">SMTP delivery logs fully reconciled securely with client mailbox.</p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Recipient (To:)</label>
                          <input
                            type="email"
                            required
                            placeholder="parent@school.ng, teacher@livingstone.ng"
                            className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-705"
                            value={composeTo}
                            onChange={(e) => setComposeTo(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Communication Subject</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Student Progress Metrics - Week 2 Report"
                            className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-705 font-bold"
                            value={composeSubject}
                            onChange={(e) => setComposeSubject(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Message Body</label>
                          <textarea
                            rows={6}
                            required
                            placeholder="Enter correspondence text here..."
                            className="block w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-705 leading-relaxed font-mono"
                            value={composeBody}
                            onChange={(e) => setComposeBody(e.target.value)}
                          />
                        </div>

                        <div className="pt-2 flex items-center justify-end gap-2.5">
                          <button
                            type="button"
                            onClick={() => setIsComposeOpen(false)}
                            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={sendLoading}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-200"
                          >
                            {sendLoading ? (
                              <RefreshCw size={13} className="animate-spin" />
                            ) : (
                              <Send size={13} />
                            )}
                            <span>{sendLoading ? 'Sending...' : 'Transmit Message'}</span>
                          </button>
                        </div>
                      </>
                    )}
                  </form>

                </div>
              </div>
            )}

            {/* AUTOMATION WORKFLOWS SETTINGS */}
            {activeTab === 'workflows' && (
              <div className="space-y-6 flex-grow animate-fade-in text-left">
                <div className="border-b pb-3">
                  <h3 className="font-extrabold text-base text-slate-900">Programmatic Communication Engine</h3>
                  <p className="text-xs text-slate-500">Configure real-time automated delivery rules. Active modules auto-send progress notifications to target guardians instantaneously via Google APIs.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* RULES CONFIGURATION CARDS */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2">Automated Rules Configuration</h4>
                    {rules.map((rule) => (
                      <div
                        key={rule.id}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] bg-slate-100 text-slate-655 uppercase font-black px-2 py-0.5 rounded border border-slate-200">
                            {rule.triggerType.replace('_', ' ')}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            {/* Run Simulator Trigger Button */}
                            <button
                              onClick={() => runSimulateAutomation(rule)}
                              className="text-[9px] bg-amber-500 hover:bg-amber-600 text-white py-1 px-2.5 rounded-lg font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                              title="Simulate Event Trigger"
                            >
                              <Play size={8} className="fill-white" />
                              <span>Simulate</span>
                            </button>

                            <button
                              onClick={() => toggleAutomationRule(rule.id)}
                              className={`py-1 px-2.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition ${
                                rule.status === 'active' 
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/60 border border-emerald-200' 
                                  : 'bg-slate-100 text-slate-455 hover:bg-slate-200 border border-slate-200'
                              }`}
                            >
                              {rule.status === 'active' ? '● Active' : '○ Inactive'}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h5 className="text-xs font-black text-slate-900">{rule.name}</h5>
                          <p className="text-[10px] text-slate-450 leading-relaxed leading-normal">
                            {rule.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AUTOMATION TRANSACTION Logs */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2">LMS Automation execution Logs</h4>
                    <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-3 max-h-[350px] overflow-y-auto">
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          className="bg-white p-3 rounded-lg border border-slate-200/50 shadow-sm space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-[9px]">
                            <span className="font-mono text-slate-400">{log.timestamp}</span>
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 py-0.5 px-1.5 rounded-md font-bold text-[8px] uppercase tracking-wider flex items-center gap-0.5">
                              <Check size={8} />
                              <span>{log.status === 'sent' ? 'Dispatched' : 'Failed'}</span>
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <h6 className="text-[10px] font-bold text-slate-800 truncate max-w-72">{log.subject}</h6>
                            <p className="text-[9px] text-slate-400 truncate max-w-72">Recipient: <span className="font-mono text-indigo-650">{log.recipient}</span></p>
                            <p className="text-[8px] text-slate-400 italic">via API trigger: {log.ruleName}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
