import React from 'react';
import { X, Shield, BookOpen, AlertTriangle } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSources: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onOpenSources
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F33]/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-[#D5DCE0] overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
      >
        <div className="p-6 border-b border-[#D5DCE0] flex items-start justify-between gap-4 bg-[#F6F8F7]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0F766E] uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>Independent Civic Atlas</span>
            </div>
            <h1 id="about-title" className="text-2xl font-bold font-serif text-[#0B1F33] mt-1">
              About Averti
            </h1>
            <p className="text-xs font-medium text-[#0F766E] mt-0.5">
              made by Priyash Priyal Jena
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-md border border-[#D5DCE0] flex items-center justify-center text-[#475569] hover:bg-white hover:text-[#0B1F33] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-sm text-[#0B1F33] leading-relaxed max-h-[calc(80vh-140px)] overflow-y-auto">
          {/* Statutory Disclaimer Box */}
          <div className="bg-[#FFF7E6] border border-[#B45309]/30 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <strong className="text-[#B45309] block text-sm">
                Mandatory Project Disclaimer
              </strong>
              <p>
                Averti is an independent project and is not affiliated with any police force or government body.
              </p>
              <p className="text-[#475569]">
                We are not a police service, an emergency dispatcher, a criminal investigation unit, or a surveillance system. We cannot dispatch help or accept criminal complaints.
              </p>
            </div>
          </div>

          {/* Author & Creator Profile / Credits Card */}
          <div className="bg-[#F0FDFA] border border-[#0F766E]/20 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-wider block">
                Credits & Attribution
              </span>
              <h3 className="text-sm font-bold text-[#0B1F33]">
                made by Priyash Priyal Jena
              </h3>
              <p className="text-xs text-[#475569]">
                Averti was created and made by Priyash Priyal Jena as an independent civic platform dedicated to public safety awareness, geospatial crime data accessibility, and verified citizen emergency resources across India.
              </p>
            </div>
            <div className="shrink-0 self-start sm:self-center px-3 py-1 rounded-full bg-[#0F766E] text-white text-xs font-semibold">
              Creator
            </div>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-bold font-serif text-[#0B1F33]">
              The Core Civic Purpose
            </h2>
            <p className="text-xs text-[#475569]">
              Averti is designed as a restrained, editorial public-safety information atlas for India. Its purpose is to demystify public safety data, bring official missing person notices and public advisories into clear view, and direct citizens immediately to verified emergency assistance numbers like <strong>112</strong>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold font-serif text-[#0B1F33]">
              Distinguishing Registration Volume from Danger
            </h2>
            <p className="text-xs text-[#475569]">
              A foundational ethical principle of Averti is that <strong>registered-crime statistics must never be conflated with personal danger</strong>. A state with an efficient, transparent police department that encourages free registration of FIRs and provides digital reporting portals will invariably show higher case counts than an area where victims face barriers to reporting.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold font-serif text-[#0B1F33]">
              Notice Integrity & Rights Safeguards
            </h2>
            <ul className="list-disc pl-5 text-xs text-[#475569] space-y-1.5">
              <li>Every notice cites the issuing authority, reference number, and original link.</li>
              <li>Averti does not store tips from the public. Clicking "I have information" reveals the official police station contacts directly.</li>
              <li>Wanted notices consistently feature the non-guilt declaration: "This is a request for information, not a finding of guilt."</li>
            </ul>
          </section>

          <div className="pt-3 border-t border-[#D5DCE0]/70 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-[#475569]">
              Platform made by <span className="font-semibold text-[#0B1F33]">Priyash Priyal Jena</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSources();
                }}
                className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Read Methodology →
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-[#0F766E] text-white text-xs font-semibold hover:bg-[#0D655E] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
