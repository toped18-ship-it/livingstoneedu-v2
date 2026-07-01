import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

export const InstallPrompt: React.FC = () => {
  const { isInstallable, handleInstall } = useInstallPrompt();
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

  useEffect(() => {
    // Show prompt after 3 seconds if installable and not dismissed
    if (isInstallable && !hasBeenDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, hasBeenDismissed]);

  const handleClose = () => {
    setIsVisible(false);
    setHasBeenDismissed(true);
  };

  const handleInstallClick = async () => {
    await handleInstall();
    setIsVisible(false);
  };

  if (!isVisible || !isInstallable) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5" />
            <span className="font-semibold">Install App</span>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-blue-800 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          <p className="text-sm text-gray-700 mb-4">
            Install Livingstone Edu on your device for quick access and better experience.
          </p>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
            >
              Install
            </button>
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-3 rounded-lg transition-colors text-sm"
            >
              Not Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};