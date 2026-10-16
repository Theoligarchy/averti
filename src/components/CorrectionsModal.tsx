import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface CorrectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledRef?: string;
}

export const CorrectionsModal: React.FC<CorrectionsModalProps> = ({
  isOpen,
  onClose,
  prefilledRef = ''
}) => {
  const [refId, setRefId] = useState(prefilledRef);
  const [requestType, setRequestType] = useState('takedown');
  const [applicantRole, setApplicantRole] = useState('subject');
  const [details, setDetails] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F33]/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-[#D5DCE0] overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="corrections-title"
      >
        <div className="p-6 border-b border-[#D5DCE0] flex items-start justify-between gap-4 bg-[#F6F8F7]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0F766E] uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Legal, Rights & Editorial Review</span>
            </div>
            <h1 id="corrections-title" className="text-xl font-bold font-serif text-[#0B1F33] mt-1">
              Corrections & Notice Removal Request
            </h1>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-md border border-[#D5DCE0] flex items-center justify-center text-[#475569] hover:bg-white hover:text-[#0B1F33] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#15803D] mx-auto" />
              <h2 className="text-lg font-bold font-serif text-[#0B1F33]">
                Request Registered for Expedited Review
              </h2>
              <p className="text-xs text-[#475569] max-w-md mx-auto leading-relaxed">
                Your request regarding reference <strong>{refId || 'N/A'}</strong> has been logged. Under Averti's privacy guidelines, notices subject to official withdrawal, quashed proceedings, or verified resolution are depublished within 24 hours upon official verification.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-4 px-6 py-2 rounded-lg bg-[#0F766E] text-white text-xs font-semibold hover:bg-[#0D655E] cursor-pointer"
              >
                Close Dialog
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs text-[#0B1F33]">
              <p className="text-[#475569] leading-relaxed">
                If a person has been found, a notice has expired, legal status has changed, or factual error exists, submit this form for expedited review.
              </p>

              <div>
                <label className="block font-semibold mb-1">Notice Reference Number</label>
                <input
                  type="text"
                  required
                  value={refId}
                  onChange={(e) => setRefId(e.target.value)}
                  placeholder="e.g. OD-MP-2026-0842 or WNT-01"
                  className="w-full px-3 py-2 border border-[#64748B]/50 rounded-md focus:ring-1 focus:ring-[#0F766E] font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Request Nature</label>
                  <select
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value)}
                    className="w-full px-3 py-2 border border-[#64748B]/50 rounded-md bg-white focus:ring-1 focus:ring-[#0F766E]"
                  >
                    <option value="takedown">Notice Removal (Resolved / Safe)</option>
                    <option value="correction">Factual Correction</option>
                    <option value="expiry">Expired / Withdrawn Notice</option>
                    <option value="legal">Court Order / Quashed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Applicant Identity</label>
                  <select
                    value={applicantRole}
                    onChange={(e) => setApplicantRole(e.target.value)}
                    className="w-full px-3 py-2 border border-[#64748B]/50 rounded-md bg-white focus:ring-1 focus:ring-[#0F766E]"
                  >
                    <option value="subject">Named Subject / Family</option>
                    <option value="police">Investigating Police Officer</option>
                    <option value="lawyer">Authorised Legal Counsel</option>
                    <option value="public">Member of the Public</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Official Verification Link or Details</label>
                <textarea
                  required
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide supporting official link, police station diary entry, or explanation..."
                  className="w-full px-3 py-2 border border-[#64748B]/50 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Official Contact Email</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 border border-[#64748B]/50 rounded-md focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-md border border-[#D5DCE0] text-[#475569] hover:bg-[#F6F8F7] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-md bg-[#0F766E] text-white font-semibold hover:bg-[#0D655E] cursor-pointer"
                >
                  Submit Review Request
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
