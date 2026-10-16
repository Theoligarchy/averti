import React, { useState, useEffect } from 'react';
import {
  Clock,
  Shield,
  AlertTriangle,
  Phone,
  CheckCircle,
  UserPlus,
  X,
  MapPin,
  Bell,
  Send,
  Plus,
  Trash2,
  FastForward,
  Navigation,
  Users
} from 'lucide-react';

const DURATION_PRESETS = [
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: 'Custom', minutes: 0 }
];

const INITIAL_CONTACTS = [
  { id: 'c1', name: 'Mother (Sunita)', phone: '+91 98******10', relation: 'Family' },
  { id: 'c2', name: 'Roommate (Rohan)', phone: '+91 94******22', relation: 'Friend' }
];

export function TrustedCircleModal({
  isOpen,
  onClose,
  currentLocality = 'Rasulgarh Square, Bhubaneswar',
  onTrigger112,
  initialViewState = 'setup'
}) {
  // Flow states: 'setup' | 'active' | 'escalated' | 'completed'
  const [viewState, setViewState] = useState(initialViewState || 'setup');

  // Setup configuration state
  const [destination, setDestination] = useState('Commute home from coaching class / library');
  const [selectedDurationPreset, setSelectedDurationPreset] = useState(30);
  const [customMinutes, setCustomMinutes] = useState(20);
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);

  // Active timer state
  const [secondsRemaining, setSecondsRemaining] = useState(30 * 60);
  const [tripStartTime, setTripStartTime] = useState(null);
  const [tripLocationSnapshot, setTripLocationSnapshot] = useState(currentLocality);

  // Escalation simulated log
  const [simulatedAlertsSent, setSimulatedAlertsSent] = useState(false);

  // Reset modal when opened
  useEffect(() => {
    if (isOpen) {
      if (initialViewState) {
        setViewState(initialViewState);
        if (initialViewState === 'escalated') {
          setSimulatedAlertsSent(true);
          setSecondsRemaining(0);
        }
      }
      if (initialViewState !== 'active') {
        setTripLocationSnapshot(currentLocality);
      }
    }
  }, [isOpen, initialViewState, currentLocality]);

  // Countdown timer effect
  useEffect(() => {
    let interval = null;
    if (isOpen && viewState === 'active' && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setViewState('escalated');
            setSimulatedAlertsSent(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, viewState, secondsRemaining]);

  if (!isOpen) return null;

  // Format seconds into mm:ss or hh:mm:ss
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${pad(hrs)}:${pad(remMins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const handleStartTimer = () => {
    const totalMinutes = selectedDurationPreset === 0 ? Number(customMinutes) || 15 : selectedDurationPreset;
    setSecondsRemaining(totalMinutes * 60);
    setTripStartTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    setTripLocationSnapshot(currentLocality);
    setViewState('active');
    setSimulatedAlertsSent(false);
  };

  const handleCheckInSafe = () => {
    setViewState('completed');
  };

  const handleAddMinutes = (additionalMins) => {
    setSecondsRemaining(prev => prev + additionalMins * 60);
  };

  const handleCancelTrip = () => {
    if (window.confirm('Cancel this safety check-in trip? No emergency alerts will be triggered.')) {
      setViewState('setup');
    }
  };

  const handleDemoFastForward = () => {
    setSecondsRemaining(0);
    setViewState('escalated');
    setSimulatedAlertsSent(true);
  };

  const handleAddContactSubmit = (e) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    const newEntry = {
      id: `c_${Date.now()}`,
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relation: 'Custom'
    };
    setContacts(prev => [...prev, newEntry]);
    setNewContactName('');
    setNewContactPhone('');
    setShowAddContact(false);
  };

  const handleRemoveContact = (id) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const handleDispatch112Click = () => {
    if (onTrigger112) {
      onTrigger112();
    } else {
      window.location.href = 'tel:112';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#0B1F33]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#D5DCE0] max-w-xl w-full shadow-2xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95">
        
        {/* Header Bar */}
        <div className={`px-5 py-4 border-b flex items-center justify-between transition-colors ${
          viewState === 'escalated'
            ? 'bg-[#FEF2F2] border-[#FCA5A5]'
            : 'bg-[#F6F8F7] border-[#D5DCE0]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              viewState === 'escalated'
                ? 'bg-[#D92D20] text-white shadow-xs'
                : 'bg-[#0F766E] text-white shadow-xs'
            }`}>
              {viewState === 'escalated' ? (
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              ) : (
                <Shield className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#0B1F33]">
                {viewState === 'escalated'
                  ? 'Automated Escalation Protocol'
                  : 'Trusted Circle Safety Check-In'}
              </h2>
              <p className="text-[11px] text-[#475569]">
                Privacy-first, zero-hardware check-in for commuters &amp; students
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#475569] hover:text-[#0B1F33] hover:bg-[#E8F0EE] rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: State A / B / C / Completed */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          
          {/* ================= STATE A: SETUP VIEW ================= */}
          {viewState === 'setup' && (
            <div className="space-y-5 font-sans">
              <div className="bg-[#E8F0EE]/60 border border-[#0F766E]/30 rounded-xl p-3.5 flex items-start gap-3 text-xs text-[#0B1F33]">
                <Clock className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0F766E] font-semibold">How this protects you: </strong>
                  Set a safe travel window. If you don't check in safe before the timer expires, an automated alert with your last locality is sent to your trusted circle, with immediate 112 dispatch readiness.
                </div>
              </div>

              {/* Trip Destination */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0B1F33] uppercase tracking-wider">
                  Trip Destination / Purpose
                </label>
                <div className="relative">
                  <Navigation className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g., Commute home from coaching / library / metro station"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-[#F6F8F7] border border-[#64748B]/40 rounded-lg text-[#0B1F33] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                  />
                </div>
              </div>

              {/* Current Departure Locality Snapshot */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0B1F33] uppercase tracking-wider">
                  Starting Locality Snapshot
                </label>
                <div className="flex items-center gap-2 p-2.5 bg-[#F6F8F7] border border-[#D5DCE0] rounded-lg text-xs text-[#0B1F33]">
                  <MapPin className="w-4 h-4 text-[#0F766E] shrink-0" />
                  <span className="font-semibold">{tripLocationSnapshot}</span>
                </div>
              </div>

              {/* Duration Presets */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#0B1F33] uppercase tracking-wider">
                  Expected Transit Duration
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {DURATION_PRESETS.map((preset) => {
                    const isSelected = selectedDurationPreset === preset.minutes;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setSelectedDurationPreset(preset.minutes)}
                        className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center ${
                          isSelected
                            ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-xs'
                            : 'bg-[#F6F8F7] text-[#475569] border-[#64748B]/30 hover:border-[#0F766E] hover:text-[#0B1F33]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {selectedDurationPreset === 0 && (
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-xs text-[#475569] font-medium">Custom duration:</span>
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(e.target.value)}
                      className="w-20 px-2 py-1 text-xs border border-[#64748B]/40 rounded bg-[#F6F8F7] text-[#0B1F33] font-bold"
                    />
                    <span className="text-xs text-[#475569]">minutes</span>
                  </div>
                )}
              </div>

              {/* Trusted Contacts List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0B1F33] uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#0F766E]" />
                    <span>Trusted Contacts Listening ({contacts.length})</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddContact(!showAddContact)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0F766E] hover:underline cursor-pointer"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>{showAddContact ? 'Cancel' : 'Add Contact'}</span>
                  </button>
                </div>

                {showAddContact && (
                  <form
                    onSubmit={handleAddContactSubmit}
                    className="p-3 bg-[#F6F8F7] border border-[#0F766E]/40 rounded-xl space-y-2 text-xs"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Name (e.g. Brother / Roommate)"
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                        className="p-2 border border-[#64748B]/40 rounded bg-white text-[#0B1F33]"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Mobile (+91 ...)"
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                        className="p-2 border border-[#64748B]/40 rounded bg-white text-[#0B1F33]"
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-3 py-1 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded font-bold cursor-pointer"
                      >
                        Save Contact
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {contacts.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-2.5 bg-[#F6F8F7] border border-[#D5DCE0] rounded-lg text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#E8F0EE] text-[#0F766E] font-bold flex items-center justify-center text-[10px]">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-[#0B1F33]">{c.name}</div>
                          <div className="text-[#475569] font-mono text-[11px]">{c.phone}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-white border border-[#D5DCE0] text-[#475569]">
                          {c.relation}
                        </span>
                        {contacts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveContact(c.id)}
                            className="text-[#64748B] hover:text-[#D92D20] p-1 cursor-pointer"
                            title="Remove contact"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Timer Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartTimer}
                  className="w-full py-3 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  <span>Start Safety Timer</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= STATE B: ACTIVE COUNTDOWN VIEW ================= */}
          {viewState === 'active' && (
            <div className="space-y-6 text-center font-sans">
              
              {/* Trip Context Card */}
              <div className="bg-[#F6F8F7] border border-[#D5DCE0] rounded-xl p-3 text-left space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#475569] font-semibold">Active Trip:</span>
                  <span className="font-mono text-[#0F766E] font-bold">Started at {tripStartTime}</span>
                </div>
                <div className="font-bold text-[#0B1F33] truncate">{destination}</div>
                <div className="flex items-center gap-1 text-[#475569] text-[11px]">
                  <MapPin className="w-3 h-3 text-[#0F766E] shrink-0" />
                  <span>Origin: {tripLocationSnapshot}</span>
                </div>
              </div>

              {/* Large Countdown Clock Display */}
              <div className="py-4 px-6 bg-gradient-to-b from-[#F6F8F7] to-[#E8F0EE] border-2 border-[#0F766E]/40 rounded-2xl shadow-inner">
                <div className="text-[11px] uppercase tracking-widest font-bold text-[#0F766E] mb-1">
                  Time Remaining To Check-In
                </div>
                <div className="text-5xl sm:text-6xl font-serif font-black text-[#0B1F33] tracking-tight tabular-nums">
                  {formatTime(secondsRemaining)}
                </div>
                <div className="text-xs text-[#475569] mt-2 flex items-center justify-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#15803D] animate-ping inline-block" />
                  <span>Automated monitor listening for {contacts.length} circle contacts</span>
                </div>
              </div>

              {/* Primary Check-In Action Button */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleCheckInSafe}
                  className="w-full py-3.5 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl text-base font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-5 h-5 text-[#2DD4BF]" />
                  <span>I'm Safe - Check In Now</span>
                </button>

                {/* Secondary Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddMinutes(10)}
                    className="flex-1 py-2 px-3 bg-white border border-[#64748B]/40 hover:border-[#0F766E] text-[#0B1F33] rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#0F766E]" />
                    <span>Add 10 Minutes</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelTrip}
                    className="py-2 px-4 bg-white border border-[#D5DCE0] hover:text-[#D92D20] hover:border-[#D92D20]/40 text-[#475569] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel Trip
                  </button>
                </div>
              </div>

              {/* Demo Fast Forward Shortcut */}
              <div className="pt-2 border-t border-[#D5DCE0]/80">
                <button
                  type="button"
                  onClick={handleDemoFastForward}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B45309] hover:underline cursor-pointer bg-[#FEF3C7] px-2.5 py-1 rounded-md border border-[#F59E0B]/40"
                  title="Simulates what happens if the commuter fails to respond"
                >
                  <FastForward className="w-3 h-3" />
                  <span>[Demo: Fast Forward Timer to 0]</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= STATE C: MISSED CHECK-IN / ESCALATION ================= */}
          {viewState === 'escalated' && (
            <div className="space-y-5 font-sans">
              
              {/* Emergency Alert Banner */}
              <div className="bg-[#D92D20] text-white p-4 rounded-xl shadow-md flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-white shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <h3 className="text-sm sm:text-base font-serif font-black uppercase tracking-wide">
                    CHECK-IN MISSED — Automated Safety Protocol Activated
                  </h3>
                  <p className="text-xs text-white/90 mt-1 leading-relaxed">
                    The scheduled safety timer reached 0 without confirmation. Automated location dispatch alerts have been issued to your trusted circle.
                  </p>
                </div>
              </div>

              {/* Simulated Notification Log */}
              <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#991B1B] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    <span>Automated Push &amp; SMS Transmission</span>
                  </span>
                  <span className="text-[10px] bg-[#FEE2E2] px-2 py-0.5 rounded text-[#991B1B] font-mono">
                    DISPATCHED
                  </span>
                </div>
                <p className="text-[#7F1D1D] leading-relaxed">
                  Alert sent to <strong>{contacts.length} trusted contacts</strong>:
                  <span className="block mt-1 bg-white p-2 rounded border border-[#FCA5A5]/60 font-mono text-[11px] text-[#0B1F33]">
                    "URGENT: Averti safety check-in missed by user. Last reported approximate locality: Near {tripLocationSnapshot}. Destination: {destination}. Call emergency services if unreachable."
                  </span>
                </p>
              </div>

              {/* Formatted 112 ERSS Escalation Card */}
              <div className="bg-white border-2 border-[#D92D20] rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-[#D5DCE0] pb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#D92D20]" />
                    <span className="text-xs font-serif font-bold text-[#0B1F33] uppercase tracking-wider">
                      112 ERSS Pre-Formatted Dispatch Summary
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#D92D20]/10 text-[#D92D20] rounded">
                    Ready for Operator
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[#0B1F33]">
                  <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                    <span className="text-[#475569]">Subject:</span>
                    <span className="font-semibold">Overdue Commuter (Missed Check-In)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                    <span className="text-[#475569]">Last Known Locality:</span>
                    <span className="font-bold text-[#0B1F33]">{tripLocationSnapshot}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                    <span className="text-[#475569]">Destination:</span>
                    <span className="font-semibold">{destination}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#475569]">Emergency Contacts:</span>
                    <span className="font-mono text-[11px] text-right">
                      {contacts.map(c => `${c.name} (${c.phone})`).join('; ')}
                    </span>
                  </div>
                </div>

                {/* Direct 112 Trigger Button */}
                <button
                  type="button"
                  onClick={handleDispatch112Click}
                  className="w-full py-3 bg-[#D92D20] hover:bg-[#B42318] text-white rounded-xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4 animate-bounce" />
                  <span>Call 112 Emergency Dispatch Now</span>
                </button>
              </div>

              {/* False Alarm Reset */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setViewState('completed')}
                  className="text-xs text-[#0F766E] font-bold hover:underline cursor-pointer"
                >
                  I'm safe now (Notify contacts it was a false alarm)
                </button>
              </div>
            </div>
          )}

          {/* ================= COMPLETED STATE ================= */}
          {viewState === 'completed' && (
            <div className="space-y-5 text-center font-sans py-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-[#0B1F33]">
                  Trip Safely Completed!
                </h3>
                <p className="text-xs text-[#475569] mt-1 max-w-sm mx-auto">
                  Your safe arrival has been confirmed. No emergency alerts are active and your circle has been notified.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setViewState('setup');
                  onClose();
                }}
                className="px-6 py-2.5 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close &amp; Done
              </button>
            </div>
          )}

        </div>

        {/* Modal Footer / Safeguard info */}
        <div className="px-5 py-3 bg-[#F6F8F7] border-t border-[#D5DCE0] flex items-center justify-between text-[11px] text-[#475569]">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Zero continuous tracking. Locality reported only on missed timer.</span>
          </span>
          <span className="font-semibold text-[#0B1F33]">Averti Guardian</span>
        </div>

      </div>
    </div>
  );
}
