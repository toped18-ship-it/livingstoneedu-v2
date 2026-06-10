import React, { useState, useEffect } from 'react';
import { ContactMessage, User } from '../types';
import { syncContactMessage } from '../lib/firebaseSync';
import { Mail, Send, CheckCircle2, History, MessageSquare, ShieldAlert, AlertCircle } from 'lucide-react';

interface ContactUsProps {
  user: User;
  brandName?: string;
  contactName?: string;
  supportGroupUrl?: string;
}

export function ContactUs({ 
  user, 
  brandName = 'LIVINGSTONEEDU', 
  contactName = 'Livingtch Brand Agency', 
  supportGroupUrl = 'https://wa.me/message/AJ4NILOGBTTMJ1' 
}: ContactUsProps) {
  const [name, setName] = useState(user.fullName || '');
  const [email, setEmail] = useState(user.email || '');
  const [subject, setSubject] = useState('Curriculum Question');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [whatsappDirectUrl, setWhatsappDirectUrl] = useState('');

  // Load message history from localStorage
  useEffect(() => {
    const historical = localStorage.getItem('hub_inquiries');
    if (historical) {
      setMessages(JSON.parse(historical));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');
    setWhatsappDirectUrl('');

    if (!message.trim() || !name.trim() || !email.trim()) {
      setStatus('error:Please fill in all the required form fields!');
      return;
    }

    if (!email.includes('@')) {
      setStatus('error:Please supply a valid communication email address.');
      return;
    }

    const newMessage: ContactMessage = {
      id: 'msg_' + Date.now().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject,
      message: message.trim(),
      timestamp: new Date().toLocaleDateString('en-NG', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }),
      replyStatus: 'Pending'
    };

    const updated = [newMessage, ...messages];
    setMessages(updated);
    localStorage.setItem('hub_inquiries', JSON.stringify(updated));
    syncContactMessage(newMessage); // Sync to Firestore match specifications

    // Post to backend system and activity logger in parallel (fire-and-forget for snappy feedback)
    fetch('/api/admin/add-inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject,
        message: message.trim()
      })
    }).catch(err => console.warn("Backend add-inquiry offline sync", err));

    fetch('/api/admin/log-activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName: user.fullName || name.trim(),
        userEmail: user.email || email.trim().toLowerCase(),
        activityType: 'Submit Inquiry',
        subject: subject,
        detail: `Submitted academic inquiry on theme: "${subject}"`
      })
    }).catch(err => console.warn("Backend log-activity sync", err));

    // Construct WhatsApp message text payload redirect
    const promptText = `Hello ${contactName}, I am writing from the ${brandName} portal.\n\nName: ${name.trim()}\nEmail: ${email.trim()}\nSubject: ${subject}\n\nInquiry Details: ${message.trim()}\n\nAll replies will be sent back directly through WhatsApp. Thank you.`;
    const encodedPayload = encodeURIComponent(promptText);
    
    // Extract base URL if query parameters are included in config
    let baseUrl = supportGroupUrl;
    if (baseUrl.includes('?')) {
      baseUrl = baseUrl.split('?')[0];
    }
    const destinationUrl = `${baseUrl}?text=${encodedPayload}`;
    
    setWhatsappDirectUrl(destinationUrl);

    // Prompt user redirect automatically
    try {
      window.open(destinationUrl, '_blank');
    } catch (err) {
      console.warn("Popup blocked, fallback onto manual click button.", err);
    }

    // Clear form message text
    setMessage('');
    setSubject('Curriculum Question');
    setStatus('success');
  };

  const handleDeleteMessage = (id: string) => {
    const updated = messages.filter(m => m.id !== id);
    setMessages(updated);
    localStorage.setItem('hub_inquiries', JSON.stringify(updated));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header text */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-none">Help & Contact Academic Support</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Need school syllabus assistance, general navigation guidance, or want to advise changes? Reach out to our team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Contact form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-150 shadow-sm space-y-6">
          <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest pl-1">Send a Message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {status && (
              <div className={`p-4.5 rounded-2xl text-xs font-bold leading-normal border shadow-sm ${
                status.startsWith('error') 
                  ? 'bg-red-50 border-red-200 text-red-800' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                {status.startsWith('error') ? (
                  <div className="flex gap-2 items-center">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{status.split(':')[1]}</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2.5 items-start">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-extrabold text-sm text-emerald-900">Request Sent to WhatsApp Support!</p>
                        <p className="font-medium text-[11px] text-emerald-700 mt-0.5">
                          We have pre-filled and sent your request directly to Livingtch Brand Agency WhatsApp Line. All support responses will deliver back to you directly through WhatsApp.
                        </p>
                      </div>
                    </div>
                    {whatsappDirectUrl && (
                      <div className="pt-1">
                        <a
                          href={whatsappDirectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition shadow-sm cursor-pointer"
                        >
                          <span>Open WhatsApp Conversation Now</span>
                          <Send size={11} />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:ring-1 focus:ring-blue-500 focus:bg-white outline-none"
                  placeholder="e.g. Kolawole"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Reply Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:ring-1 focus:ring-blue-500 focus:bg-white outline-none"
                  placeholder="e.g. email@gmail.com"
                />
              </div>
            </div>

            {/* Subject selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Inquiry Topic Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="block w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:ring-1 focus:ring-blue-500 focus:bg-white outline-none"
              >
                <option value="Curriculum Question">Curriculum Syllabus Questions</option>
                <option value="Math/Science Help">Mathematics / Science Specific Issue</option>
                <option value="Technical Problem">Technical Bug / Loading Problem</option>
                <option value="General feedback">General Educational Feedback</option>
              </select>
            </div>

            {/* Message payload */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Your Main Message
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Kindly type your lesson inquiries, homework helper reports, or question suggestions here..."
                className="block w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:ring-1 focus:ring-blue-500 focus:bg-white outline-none resize-none"
              />
            </div>

            {/* Send trigger */}
            <div className="pt-2 text-right">
              <button
                type="submit"
                className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/10 active:scale-98 transition cursor-pointer"
              >
                <span>Submit Inquiry</span>
                <Send size={13} />
              </button>
            </div>
          </form>
        </div>

        {/* History of messages / Inquiry Box sidebar (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between min-h-[350px]">
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
              <History size={15} className="text-blue-600" />
              <span>Your Support Inbox ({messages.length})</span>
            </h2>
            
            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {messages.map((msg) => (
                <div key={msg.id} className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl space-y-2 relative group">
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="absolute right-2 top-2 text-[10px] text-red-500 font-bold opacity-0 group-hover:opacity-100 transition hover:underline"
                  >
                    Delete
                  </button>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-md">
                      {msg.subject}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-amber-600 tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>{msg.replyStatus}</span>
                    </span>
                  </div>

                  <p className="text-[11px] sm:text-xs text-slate-750 font-medium leading-relaxed italic border-l-2 border-slate-300 pl-2">
                    &quot;{msg.message}&quot;
                  </p>

                  <p className="text-[9px] text-slate-400 font-bold text-right">
                    {msg.timestamp}
                  </p>
                </div>
              ))}

              {messages.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                  <MessageSquare className="mx-auto text-slate-200" size={36} />
                  <p>Inbox is empty. Send a message to start tracking reply status.</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-100 flex gap-2 pt-3 mt-4 text-[10px] sm:text-xs text-slate-650 leading-relaxed">
            <ShieldAlert size={16} className="text-blue-700 shrink-0" />
            <p>
              Your personal data and local inquiries are stored securely strictly within your local sandboxed browser storage. No unauthorized entities have access to your data.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
