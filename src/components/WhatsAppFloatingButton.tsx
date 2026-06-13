import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Users, ArrowUpRight } from 'lucide-react';

interface WhatsAppFloatingButtonProps {
  contactName?: string;
  supportGroupUrl?: string;
}

export function WhatsAppFloatingButton({ 
  contactName = 'LIVINGSTONEEDU', 
  supportGroupUrl = 'https://wa.me/message/AJ4NILOGBTTMJ1' 
}: WhatsAppFloatingButtonProps) {
  const [showPopup, setShowPopup] = useState(false);
  const channelUrl = 'https://chat.whatsapp.com/Br0kHET2Ed77TORxkv1ip6';

  // Auto-show a friendly popup greeting after 3.5 seconds, unless dismissed before
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
        <div className="mb-3 w-80 bg-white rounded-2xl p-5 shadow-2xl border-[3px] border-black flex flex-col gap-3 animate-bounce-short pointer-events-auto relative">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 text-slate-500 hover:text-black hover:bg-slate-100 rounded-full transition cursor-pointer border border-transparent hover:border-black"
            title="Dismiss widget"
          >
            <X size={14} className="stroke-[2.5]" />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] uppercase font-black text-black tracking-wider bg-emerald-200 border border-black px-2 py-0.5 rounded shadow-[1px_1px_0px_black] font-mono">
              LIVINGSTONE ONLINE
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-black text-black uppercase tracking-tight">Stay connected with us!</h4>
            <p className="text-[11px] text-slate-800 leading-relaxed font-semibold">
              Get the latest homework reviews, academic syllabus plans, exam guides or direct portal billing support.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <a
              href={channelUrl}
              target="_blank"
              referrerPolicy="no-referrer"
              rel="noopener noreferrer"
              onClick={() => {
                setShowPopup(false);
                localStorage.setItem('whatsapp_popup_dismissed', 'true');
              }}
              className="inline-flex items-center justify-between py-2 px-3 bg-emerald-400 hover:bg-emerald-500 active:translate-x-[1px] active:translate-y-[1px] transition-all text-black border-2 border-black text-xs font-black rounded-xl shadow-[3px_3px_0px_black] cursor-pointer"
            >
              <span className="flex items-center gap-1.5 font-sans">
                <Users size={14} className="stroke-[2.5]" />
                <span>Join WhatsApp Channel</span>
              </span>
              <ArrowUpRight size={14} className="stroke-[2.5]" />
            </a>

            <a
              href={supportGroupUrl}
              target="_blank"
              referrerPolicy="no-referrer"
              rel="noopener noreferrer"
              onClick={() => {
                setShowPopup(false);
                localStorage.setItem('whatsapp_popup_dismissed', 'true');
              }}
              className="inline-flex items-center justify-between py-2 px-3 bg-[#e0f2fe] hover:bg-[#bae6fd] active:translate-x-[1px] active:translate-y-[1px] transition-all text-black border-2 border-black text-xs font-black rounded-xl shadow-[3px_3px_0px_black] cursor-pointer"
            >
              <span className="flex items-center gap-1.5 font-sans">
                <MessageSquare size={14} className="stroke-[2.5]" />
                <span>Message LIVINGSTONEEDU</span>
              </span>
              <ArrowUpRight size={14} className="stroke-[2.5]" />
            </a>
          </div>
        </div>
      )}

      {/* Primary Circular WhatsApp Floating Action Button */}
      <a
        href={supportGroupUrl}
        target="_blank"
        referrerPolicy="no-referrer"
        rel="noopener noreferrer"
        title="Message LIVINGSTONEEDU on WhatsApp"
        className="pointer-events-auto h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white flex items-center justify-center shadow-[4px_4px_0px_black] border-[3px] border-black transition-all cursor-pointer relative group"
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
        <span className="absolute right-18 scale-0 group-hover:scale-100 bg-[#FAFAFA] text-black border-2 border-black shadow-[2px_2px_0px_black] text-[10px] font-black py-1 px-2.5 rounded-lg whitespace-nowrap transition-all duration-150">
          Message us on WhatsApp 🇳🇬
        </span>

        {/* Small live pulse beacon */}
        <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-black animate-pulse" />
      </a>
    </div>
  );
}

