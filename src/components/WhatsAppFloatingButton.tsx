import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Users, ArrowUpRight } from 'lucide-react';

interface WhatsAppFloatingButtonProps {
  contactName?: string;
  supportGroupUrl?: string;
}

export function WhatsAppFloatingButton({ 
  contactName = 'Livingstone Support', 
  supportGroupUrl = 'https://wa.me/message/AJ4NILOGBTTMJ1' 
}: WhatsAppFloatingButtonProps) {
  const [showPopup, setShowPopup] = useState(false);

  // Auto-show a friendly popup greeting after 3 seconds, unless dismissed before
  useEffect(() => {
    const isDismissed = localStorage.getItem('whatsapp_popup_dismissed');
    if (!isDismissed) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowPopup(false);
    localStorage.setItem('whatsapp_popup_dismissed', 'true');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Interactive Chat Speech Popup Bubble */}
      {showPopup && (
        <div className="mb-3 w-72 bg-white rounded-2xl p-4 shadow-2xl border border-emerald-100 flex flex-col gap-2.5 animate-bounce-short pointer-events-auto relative">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-650 rounded-full hover:bg-slate-50 transition cursor-pointer"
            title="Dismiss widget"
          >
            <X size={14} />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] uppercase font-black text-emerald-600 tracking-wider font-sans">{contactName}</span>
          </div>

          <p className="text-xs text-slate-705 leading-relaxed pr-3 font-sans">
            Need help with termly subjects, teacher setup, exam compile guides or billing? Contact our support staff directly!
          </p>

          <a
            href={supportGroupUrl}
            target="_blank"
            referrerPolicy="no-referrer"
            rel="noopener noreferrer"
            onClick={() => {
              setShowPopup(false);
              localStorage.setItem('whatsapp_popup_dismissed', 'true');
            }}
            className="inline-flex items-center justify-between py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all text-white text-[11px] font-bold rounded-xl shadow-md shadow-emerald-600/10 cursor-pointer"
          >
            <span className="flex items-center gap-1.5 font-sans">
              <MessageSquare size={12} />
              <span>Chat with Support</span>
            </span>
            <ArrowUpRight size={12} />
          </a>
        </div>
      )}

      {/* Primary Circular WhatsApp Floating Action Button */}
      <a
        href={supportGroupUrl}
        target="_blank"
        referrerPolicy="no-referrer"
        rel="noopener noreferrer"
        title={`Chat with ${contactName}`}
        className="pointer-events-auto h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 hover:shadow-emerald-600/40 border-2 border-white transition-all cursor-pointer relative group"
      >
        {/* WhatsApp Icon in SVG for perfect premium representation */}
        <svg 
          viewBox="0 0 24 24" 
          width="24" 
          height="24" 
          stroke="currentColor" 
          strokeWidth="0" 
          fill="currentColor" 
          className="w-7 h-7"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 11.894 0c3.18 0 6.171 1.242 8.425 3.499c2.253 2.257 3.491 5.253 3.488 8.435c-.004 6.56-5.328 11.884-11.894 11.884-.001 0-.001 0-.002 0a11.966 11.966 0 0 1-5.717-1.464L0 24zm6.59-4.846c1.66 1.01 3.298 1.562 5.237 1.562c5.441 0 9.859-4.414 9.862-9.853c.002-2.636-1.023-5.11-2.885-6.975c-1.862-1.865-4.332-2.893-6.974-2.893c-5.432 0-9.845 4.413-9.848 9.853c0 1.97.55 3.511 1.58 5.17l-.988 3.606l3.718-.973zm11.758-5.32c-.31-.156-1.838-.908-2.12-.102c-.283.09-.942.31-.942.31s-.472.484-.564.484c-.09 0-1.879-.693-3.08-1.745c-.947-.845-1.523-1.863-1.71-2.176c-.187-.313-.02-.482.137-.638c.14-.14.31-.362.466-.543c.156-.181.208-.31.31-.518c.104-.207.052-.39-.026-.543c-.078-.155-.7-1.688-.958-2.316c-.25-.6-.547-.518-.75-.528c-.197-.01-.424-.012-.653-.012c-.228 0-.6.085-.913.43c-.313.344-1.196 1.17-1.196 2.857c0 1.685 1.226 3.315 1.397 3.548c.17.233 2.41 3.82 5.922 5.21c2.254.892 3.84 1.198 5.12 1.002c1.43-.22 2.924-1.195 3.336-2.3c.414-1.102.414-2.046.29-2.243c-.124-.197-.456-.312-.767-.47z" />
        </svg>

        {/* Floating tooltip on hover */}
        <span className="absolute right-16 scale-0 group-hover:scale-100 bg-slate-900 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg whitespace-nowrap shadow-md transition-all duration-150">
          Chat with {contactName} on WhatsApp 🇳🇬
        </span>

        {/* Small live pulse beacon */}
        <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-white animate-pulse" />
      </a>
    </div>
  );
}
