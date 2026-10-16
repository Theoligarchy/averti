import React, { useState } from 'react';

/**
 * DemoPresentationBar
 * Presenter / Pitch utility dock floating discreetly at the bottom of the screen.
 * Allows 1-click state transitions during high-stakes pitch competitions.
 */
export function DemoPresentationBar({
  onSelectState,
  onToggleAdmin,
  onTriggerEmergency,
  onToggleOffline,
  currentState = '',
  isAdminActive = false
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [activePreset, setActivePreset] = useState('');

  const handleStateClick = (stateName) => {
    setActivePreset(stateName);
    if (onSelectState) {
      onSelectState(stateName);
    }
  };

  const handleOfflineToggle = () => {
    const nextOffline = !isOffline;
    setIsOffline(nextOffline);
    if (onToggleOffline) {
      onToggleOffline(nextOffline);
    }
  };

  // Minimized floating trigger pill
  if (isMinimized) {
    return (
      <aside aria-label="Pitch Controls Dock" className="fixed bottom-16 sm:bottom-4 left-4 z-[999] print:hidden">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="group flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#0B1F33]/95 backdrop-blur-md text-white border border-white/20 shadow-2xl hover:bg-[#0F766E] transition-all duration-200 cursor-pointer"
          title="Restore Pitch Demo Controls"
          aria-label="Expand Pitch Controls"
        >
          {/* Eye Icon */}
          <svg
            className="w-4 h-4 text-teal-400 group-hover:text-white transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span className="text-xs font-semibold tracking-wide pr-1">Pitch Controls</span>
          {isOffline && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Offline Mode Active" />
          )}
        </button>
      </aside>
    );
  }

  // Expanded Presenter Bar
  return (
    <aside aria-label="Pitch Controls Dock" className="fixed bottom-16 sm:bottom-4 left-4 z-[999] print:hidden max-w-[calc(100vw-2rem)]">
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 pl-3 rounded-full bg-[#0B1F33]/92 backdrop-blur-md text-white border border-white/15 shadow-2xl">
        {/* Subtle Pitch Label */}
        <div className="flex items-center gap-2 mr-1.5 select-none">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0F766E]"></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300/90 leading-tight">
              Pitch Controls
            </span>
            <span className="text-[9px] text-slate-400 font-medium leading-none hidden sm:inline">
              (Hide before demo)
            </span>
          </div>
        </div>

        <div className="h-5 w-px bg-white/20 mx-0.5" aria-hidden="true" />

        {/* 1. Demo: Odisha */}
        <button
          type="button"
          onClick={() => handleStateClick('Odisha')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
            currentState === 'Odisha' || activePreset === 'Odisha'
              ? 'bg-[#0F766E] text-white shadow-sm ring-1 ring-teal-300/40'
              : 'bg-white/10 text-slate-200 hover:bg-[#0F766E] hover:text-white'
          }`}
          title="Instantly switch view to Odisha state context"
        >
          <svg className="w-3.5 h-3.5 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Demo: Odisha</span>
        </button>

        {/* 2. Demo: Delhi */}
        <button
          type="button"
          onClick={() => handleStateClick('Delhi')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
            currentState === 'Delhi' || activePreset === 'Delhi'
              ? 'bg-[#0F766E] text-white shadow-sm ring-1 ring-teal-300/40'
              : 'bg-white/10 text-slate-200 hover:bg-[#0F766E] hover:text-white'
          }`}
          title="Instantly switch view to Delhi NCT context"
        >
          <svg className="w-3.5 h-3.5 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Demo: Delhi</span>
        </button>

        {/* 3. Demo: Admin Triage */}
        <button
          type="button"
          onClick={onToggleAdmin}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
            isAdminActive
              ? 'bg-[#0F766E] text-white shadow-sm ring-1 ring-teal-300/40'
              : 'bg-white/10 text-slate-200 hover:bg-[#0F766E] hover:text-white'
          }`}
          title="Toggle accredited Police Triage Dashboard"
        >
          <svg className="w-3.5 h-3.5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Demo: Admin Triage</span>
        </button>

        {/* 4. Trigger: Missed Check-In (Emergency escalation trigger) */}
        <button
          type="button"
          onClick={onTriggerEmergency}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#D92D20]/90 text-white hover:bg-[#D92D20] active:scale-95 shadow-sm transition-all duration-150 cursor-pointer"
          title="Simulate missed check-in timer expiration to trigger 112 escalation modal"
        >
          <svg className="w-3.5 h-3.5 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Trigger: Missed Check-In</span>
        </button>

        {/* 5. Toggle Offline Cache */}
        <button
          type="button"
          onClick={handleOfflineToggle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
            isOffline
              ? 'bg-amber-600 text-white ring-1 ring-amber-300'
              : 'bg-white/10 text-slate-200 hover:bg-slate-700 hover:text-white'
          }`}
          title="Toggle simulated offline cache mode"
        >
          <svg className="w-3.5 h-3.5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M12 18.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-4.95-4.95a7 7 0 019.9 0M1.05 6.55a15 15 0 0121.9 0" />
          </svg>
          <span>{isOffline ? 'Offline: Active' : 'Toggle Offline Cache'}</span>
        </button>

        <div className="h-5 w-px bg-white/20 mx-0.5" aria-hidden="true" />

        {/* Minimizer Button */}
        <button
          type="button"
          onClick={() => setIsMinimized(true)}
          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Collapse Pitch Controls (Hide before demo)"
          aria-label="Collapse Pitch Controls"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

export default DemoPresentationBar;
