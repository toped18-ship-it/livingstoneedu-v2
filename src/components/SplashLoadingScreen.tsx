import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, BookOpen, Heart, Trophy, Award, Zap, Sparkles, ShieldCheck } from 'lucide-react';

interface SplashLoadingScreenProps {
  brandName?: string;
  appSubtitle?: string;
  logoIcon?: string;
  logoText?: string;
}

const ACADEMIC_STATUSES = [
  'Initializing Livingstone Learning Portal...',
  'Syncing school curriculum and term structures...',
  'Preparing immersive subject learning hubs...',
  'Pre-caching interactive quiz questions...',
  'Securing offline-ready local study notes...',
  'Connecting database services securely...',
  'Academy gateway initialized successfully!'
];

export function SplashLoadingScreen({
  brandName = 'LIVINGSTONEEDU',
  appSubtitle = 'Learning Portal',
  logoIcon = 'GraduationCap',
  logoText = 'LIVINGSTONE'
}: SplashLoadingScreenProps) {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev < ACADEMIC_STATUSES.length - 1 ? prev + 1 : prev));
    }, 1300);
    return () => clearInterval(interval);
  }, []);

  const renderLogo = (size: number) => {
    const iconName = logoIcon || 'GraduationCap';
    switch (iconName) {
      case 'GraduationCap': return <GraduationCap size={size} className="text-blue-600" />;
      case 'BookOpen': return <BookOpen size={size} className="text-blue-600" />;
      case 'Heart': return <Heart size={size} className="text-blue-600" />;
      case 'Trophy': return <Trophy size={size} className="text-blue-600" />;
      case 'Award': return <Award size={size} className="text-blue-600" />;
      case 'Zap': return <Zap size={size} className="text-blue-600" />;
      case 'Sparkles': return <Sparkles size={size} className="text-blue-600" />;
      case 'ShieldCheck': return <ShieldCheck size={size} className="text-blue-600" />;
      default: return <GraduationCap size={size} className="text-blue-600" />;
    }
  };

  return (
    <div 
      id="splash-loading-screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between py-16 px-6 bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-950 text-white select-none overflow-hidden"
    >
      {/* Dynamic Ambient Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-4000" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-3000" />

      {/* Spacer top */}
      <div className="h-4" />

      {/* Central Branding Hub */}
      <div className="flex flex-col items-center text-center max-w-md w-full">
        {/* Glowing Logo Container */}
        <motion.div
          id="splash-logo-container"
          initial={{ scale: 0.1, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 120, 
            damping: 15,
            delay: 0.1 
          }}
          className="relative mb-8"
        >
          {/* Pulsing ring background */}
          <motion.div 
            className="absolute -inset-4 bg-white/10 rounded-3xl blur-md"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
          <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl shadow-blue-500/30 flex items-center justify-center relative border border-white/20">
            {renderLogo(44)}
          </div>
        </motion.div>

        {/* Brand Text */}
        <motion.div
          id="splash-brand-text"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="space-y-3"
        >
          <h1 className="text-3xl sm:text-4xl font-black text-white font-display tracking-wider uppercase leading-none drop-shadow-md">
            {brandName}
          </h1>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-ping" />
            <span className="text-xs font-bold text-sky-200 tracking-widest uppercase">
              {appSubtitle}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Progress & Academic Logs Footer */}
      <div className="flex flex-col items-center text-center max-w-sm w-full space-y-6">
        {/* Glow Line Loader */}
        <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
          <motion.div 
            id="splash-progress-bar"
            className="h-full bg-gradient-to-r from-sky-400 to-indigo-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 10.0, ease: 'easeInOut' }}
          />
        </div>

        {/* Micro-Interaction Status Output */}
        <motion.div
          id="splash-status-text"
          key={statusIndex}
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 0.8 }}
          exit={{ y: -5, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="text-[11px] font-mono text-slate-300 tracking-wide bg-slate-900/50 py-1.5 px-4 rounded-lg border border-white/5 shadow-inner"
        >
          {ACADEMIC_STATUSES[statusIndex]}
        </motion.div>

        {/* Subtle Copyright or Portal ID in footer */}
        <div className="text-[10px] text-slate-500 font-medium tracking-wider">
          © {new Date().getFullYear()} {logoText} • SECURE SCHOOL PORTAL
        </div>
      </div>
    </div>
  );
}
