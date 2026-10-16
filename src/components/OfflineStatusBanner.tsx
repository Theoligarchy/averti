import React, { useState, useEffect } from 'react';

export interface OfflineStatusBannerProps {
  isSimulatedOffline?: boolean;
  onEmergencyCall?: () => void;
  customMessage?: string;
}

/**
 * OfflineStatusBanner
 * Averti - Indian Public-Safety Atlas
 */
export function OfflineStatusBanner({
  isSimulatedOffline = false,
  onEmergencyCall,
  customMessage
}: OfflineStatusBannerProps) {
  const [isBrowserOffline, setIsBrowserOffline] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsBrowserOffline(false);
      setIsDismissed(false);
    };

    const handleOffline = () => {
      setIsBrowserOffline(true);
      setIsDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isSimulatedOffline) {
      setIsDismissed(false);
    }
  }, [isSimulatedOffline]);

  const isActuallyOffline = isBrowserOffline || isSimulatedOffline;
  const isVisible = isActuallyOffline && !isDismissed;

  const handleCall112 = () => {
    if (onEmergencyCall) {
      onEmergencyCall();
    } else {
      window.location.href = 'tel:112';
    }
  };

  return (
    <aside
      aria-label="Offline Connectivity and Emergency Cache Status"
      aria-live="polite"
      className={`w-full bg-[#0B1F33] text-white border-b border-teal-900/60 shadow-md transition-all duration-300 overflow-hidden ${
        isVisible
          ? 'max-h-36 sm:max-h-24 opacity-100 translate-y-0 py-2 sm:py-2.5 px-3 sm:px-6'
          : 'max-h-0 opacity-0 -translate-y-full py-0 px-0 pointer-events-none'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4 font-sans text-xs sm:text-sm">
        {/* Left: Icon & Explanatory copy */}
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
          <div className="mt-0.5 sm:mt-0 p-1.5 rounded-md bg-white/10 text-[#5EEAD4] flex-shrink-0">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3l18 18M10.584 10.587a5.002 5.002 0 00-2.455.727M13.416 13.414a5.002 5.002 0 01-1.416.586M6.343 6.343A8 8 0 003.05 9.05m14.607 0a8.005 8.005 0 00-2.228-2.228M1.05 1.05l21.9 21.9M12 18.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
              />
            </svg>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white tracking-wide">
                You are offline.
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-teal-900/80 text-[#5EEAD4] border border-teal-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5EEAD4] mr-1 animate-pulse" />
                Verified Offline Cache Active
              </span>
              {isSimulatedOffline && !isBrowserOffline && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                  Demo Simulated Mode
                </span>
              )}
            </div>
            <p className="text-slate-300 text-xs sm:text-[13px] leading-tight mt-0.5">
              {customMessage ||
                'Cached notices and statistics may be out of date. 112 Emergency routing remains fully available.'}
            </p>
          </div>
        </div>

        {/* Right: Actions (112 Call button & Dismiss button) */}
        <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center flex-shrink-0">
          <button
            type="button"
            onClick={handleCall112}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#D92D20] hover:bg-[#B91C1C] text-white text-xs font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-[#0B1F33]"
            title="Immediate direct connect to 112 Emergency Dispatch"
          >
            <svg
              className="w-3.5 h-3.5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z" />
            </svg>
            <span>Call 112</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-slate-300"
            aria-label="Dismiss offline banner for this session"
            title="Dismiss notice"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
