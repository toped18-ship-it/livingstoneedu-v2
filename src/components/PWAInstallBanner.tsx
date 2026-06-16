import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Smartphone, CheckCircle, DownloadCloud, HelpCircle } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showiOSGuideline, setShowiOSGuideline] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [appIsAlreadyInstalled, setAppIsAlreadyInstalled] = useState(false);

  // Helper utility checks
  const isIOS = () => {
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as any).MSStream
    );
  };

  const isStandaloneMode = () => {
    return (
      (window.navigator as any).standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches
    );
  };

  useEffect(() => {
    // 1. Check if already installed
    if (isStandaloneMode()) {
      setAppIsAlreadyInstalled(true);
      return;
    }

    // 2. Listen to browser installation support trigger
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent original browser overlay
      e.preventDefault();
      // Store event promise
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // If the user hasn't explicitly dismissed the installation bar in the current session, show it
      const isDismissed = sessionStorage.getItem("pwa-installation-dismissed") === "true";
      if (!isDismissed) {
        setIsVisible(true);
      }
    };

    // 3. Listen to successful installation event
    const handleAppInstalled = () => {
      console.log("[PWA] App successfully provisioned & installed locally!");
      setInstallSuccess(true);
      setIsVisible(true);
      setDeferredPrompt(null);
      // Clean up after 4.5 seconds
      setTimeout(() => {
        setIsVisible(false);
        setInstallSuccess(false);
      }, 4500);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // 4. Special onboarding display parameters for iOS students (custom hint pop-up since iOS doesn't trigger beforeinstallprompt)
    if (isIOS() && !isStandaloneMode()) {
      const isDismissed = sessionStorage.getItem("pwa-installation-dismissed") === "true";
      if (!isDismissed) {
        // Show after a brief delay
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS()) {
      // Toggle custom safari browser instruction tips
      setShowiOSGuideline(true);
      return;
    }

    if (!deferredPrompt) {
      console.warn("[PWA] Native browser installation event is absent.");
      return;
    }

    try {
      // Trigger browser prompt
      await deferredPrompt.prompt();
      
      // Look up consensus
      const choiceResult = await deferredPrompt.userChoice;
      console.log(`[PWA] Installation prompt answered with verdict: ${choiceResult.outcome}`);
      
      if (choiceResult.outcome === "accepted") {
        setInstallSuccess(true);
        setTimeout(() => {
          setIsVisible(false);
          setInstallSuccess(false);
        }, 4500);
      }
      
      // Flush prompt state either way
      setDeferredPrompt(null);
    } catch (err) {
      console.error("[PWA] Prompt dispatch failed:", err);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setShowiOSGuideline(false);
    // Silent dismiss logic cached inside SessionStorage so as other pages on navigation don't bother
    sessionStorage.setItem("pwa-installation-dismissed", "true");
  };

  if (appIsAlreadyInstalled || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <div 
        id="pwa-install-container"
        className="fixed bottom-6 right-6 left-6 md:left-auto z-50 md:max-w-md font-sans"
      >
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className="relative bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden p-5 space-y-4"
        >
          {/* Close Action */}
          <button
            type="button"
            id="pwa-close-btn"
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 p-1 rounded-lg transition duration-200 cursor-pointer"
            aria-label="Dismiss Alert"
          >
            <X size={16} />
          </button>

          {installSuccess ? (
            /* Success State Render */
            <div id="pwa-success-state" className="flex flex-col items-center text-center py-4 space-y-3 animate-fade-in">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                <CheckCircle size={32} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">LIVINGSTONEEDU App Ready!</h3>
                <p className="text-xs text-slate-350 mt-1 max-w-xs leading-relaxed">
                  The educational academy portal was added to your home screen. Click the icon on your device to launch!
                </p>
              </div>
            </div>
          ) : showiOSGuideline ? (
            /* iOS Safari Guideline instructions */
            <div id="pwa-ios-guidelines" className="space-y-3.5 animate-fade-in text-slate-100">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Smartphone size={18} className="text-blue-400" />
                <h3 className="text-sm font-black uppercase text-blue-400">Install via Safari (iOS)</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect your iPad/iPhone home screen directly with standard West African tutoring guidelines in two steps:
              </p>
              <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside pl-1 font-medium">
                <li>
                  Tap the <span className="text-blue-400 font-bold font-mono">Share button</span> (square with upward arrow) at Safari's navigation layout.
                </li>
                <li>
                  Scroll down the lists of tools and tap <span className="bg-slate-800 px-2 py-0.5 rounded text-white font-bold inline-block border border-slate-700">Add to Home Screen</span>.
                </li>
              </ol>
              <div className="pt-2 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  id="pwa-ios-done-btn"
                  onClick={handleDismiss}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-[11px] uppercase transition cursor-pointer"
                >
                  I Understood, Done!
                </button>
              </div>
            </div>
          ) : (
            /* General Web Install Render card */
            <div id="pwa-normal-prompt" className="space-y-3.5">
              {/* Header Badge */}
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-wider border border-blue-500/30 inline-flex items-center gap-1">
                  <Sparkles size={10} className="text-blue-400 animate-pulse" />
                  <span>PWA Desktop & Mobile App</span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5 pr-6">
                <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <DownloadCloud size={20} className="text-blue-500 shrink-0" />
                  <span>Install LivingstoneEdu Portal</span>
                </h3>
                <p className="text-xs text-slate-350 leading-relaxed">
                  Pin our platform on your home screen for quick continuous assessment (CA) checks, syllabus drills, and instant offline-ready computerized examinations!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  id="pwa-trigger-install-btn"
                  onClick={handleInstallClick}
                  className="px-4.5 py-2.5 bg-blue-650 hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
                >
                  <Smartphone size={14} />
                  <span>Install App Now</span>
                </button>
                <button
                  type="button"
                  id="pwa-later-btn"
                  onClick={handleDismiss}
                  className="px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800/80 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
