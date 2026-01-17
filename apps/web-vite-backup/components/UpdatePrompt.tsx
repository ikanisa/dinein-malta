import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { checkServiceWorkerUpdate, reloadForUpdate } from '../utils/pwa';
import { hapticButton } from '../utils/haptics';

/**
 * UpdatePrompt Component
 * Shows a prompt when a new version of the PWA is available
 */
export const UpdatePrompt: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check for updates every 5 minutes
    const checkForUpdates = async () => {
      const hasUpdate = await checkServiceWorkerUpdate();
      if (hasUpdate && !localStorage.getItem('update-dismissed')) {
        setShow(true);
      }
    };

    // Listen for service worker update events from SW or HTML script
    const handleSWUpdate = () => {
      if (!localStorage.getItem('update-dismissed')) {
        setShow(true);
      }
    };

    window.addEventListener('sw-update-available', handleSWUpdate);

    // Initial check after 10 seconds (to avoid showing immediately)
    const initialTimeout = setTimeout(checkForUpdates, 10000);

    // Then check every 5 minutes
    const interval = setInterval(checkForUpdates, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('sw-update-available', handleSWUpdate);
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  const handleUpdate = () => {
    hapticButton();
    reloadForUpdate();
  };

  const handleDismiss = () => {
    hapticButton();
    setShow(false);
    localStorage.setItem('update-dismissed', Date.now().toString());
    // Re-enable prompt after 1 hour
    setTimeout(() => {
      localStorage.removeItem('update-dismissed');
    }, 60 * 60 * 1000);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pb-safe-bottom pointer-events-none">
      <GlassCard className="bg-gradient-to-r from-primary-500/90 to-secondary-500/90 backdrop-blur-md border-white/20 shadow-xl pointer-events-auto">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-bold text-white text-sm mb-1">Update Available</h3>
            <p className="text-white/90 text-xs">
              A new version of the app is available. Update now for the latest features.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white transition-colors"
            >
              Later
            </button>
            <button
              onClick={handleUpdate}
              className="px-4 py-1.5 text-xs font-bold bg-white text-ink rounded-lg hover:bg-white/90 transition-colors touch-target"
            >
              Update
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
