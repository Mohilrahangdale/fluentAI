import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 left-4 right-4 max-w-sm mx-auto z-40 flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl bg-slate-900/95 text-white text-xs font-medium shadow-xl border border-slate-700/60 backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200"
    >
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
        </div>
        <span className="text-[11px] leading-tight text-slate-200">
          Offline Mode — Local reviews & vocabulary are fully accessible.
        </span>
      </div>
    </div>
  );
};
