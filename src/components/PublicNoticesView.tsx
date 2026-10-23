import React, { useState } from 'react';
import { Notice } from '../types';
import { NoticesPanel } from './NoticesPanel';
import { WantedNoticesPanel } from './WantedNoticesPanel';
import {
  FileText,
  ShieldAlert,
  ArrowLeft,
  RotateCcw,
  AlertTriangle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface PublicNoticesViewProps {
  notices: Notice[];
  selectedState: string | null;
  onSelectState: (state: string | null) => void;
  onSelectNotice: (notice: Notice) => void;
  onReturnToAtlas: () => void;
  isLoading?: boolean;
}

export const PublicNoticesView: React.FC<PublicNoticesViewProps> = ({
  notices,
  selectedState,
  onSelectState,
  onSelectNotice,
  onReturnToAtlas,
  isLoading = false
}) => {
  const [subTab, setSubTab] = useState<'missing' | 'wanted'>('missing');

  const missingCount = notices.filter(n => !n.isWanted && (!selectedState || n.state?.toLowerCase() === selectedState.toLowerCase() || n.state === null)).length;
  const wantedCount = notices.filter(n => (n.isWanted || n.category === 'wanted') && (!selectedState || n.state?.toLowerCase() === selectedState.toLowerCase() || n.state === null)).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Editorial Header */}
      <header className="bg-white border border-[#D5DCE0] rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D5DCE0]/70 pb-4">
          <div className="space-y-1">
            <button
              type="button"
              onClick={onReturnToAtlas}
              className="text-xs font-semibold text-[#0F766E] hover:underline cursor-pointer inline-flex items-center gap-1 mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Crime Statistics Map</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#0B1F33]">
              Public Notices Registry
            </h1>
            <p className="text-sm text-[#475569] max-w-2xl leading-relaxed">
              Official missing-person circulars and law enforcement wanted lookouts published by state police commissionerates and central investigative agencies.
            </p>
          </div>

          {selectedState && (
            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <span className="text-xs text-[#475569]">
                Jurisdiction: <strong className="text-[#0B1F33]">{selectedState}</strong>
              </span>
              <button
                type="button"
                onClick={() => onSelectState(null)}
                className="inline-flex items-center gap-1 text-xs text-[#0F766E] hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Show all India</span>
              </button>
            </div>
          )}
        </div>

        {/* Responsible Notice Publication Protocol */}
        <div className="bg-[#FFF7E6] border border-[#B45309]/30 rounded-lg p-3.5 flex items-start gap-3 text-xs text-[#0B1F33]">
          <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-[#B45309] block">Notice Integrity &amp; Due Process:</strong>
            <p className="text-[#475569] leading-relaxed">
              A wanted notice is a formal request for information issued by an authorized agency, not a judicial finding of guilt. Never approach wanted individuals. If you have verified information, contact the official authority directly or dial 112. In compliance with the Juvenile Justice Act, identifying details of minors are published strictly via official TrackChild protocols.
            </p>
          </div>
        </div>

        {/* Sub-tab Navigation (Zero-Pill: Clean Segmented Rectangular Control) */}
        <div className="flex items-center gap-2 pt-1 border-t border-[#D5DCE0]/60">
          <button
            type="button"
            onClick={() => setSubTab('missing')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer border flex items-center gap-2 ${
              subTab === 'missing'
                ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-xs'
                : 'bg-[#F6F8F7] text-[#475569] border-[#D5DCE0] hover:text-[#0B1F33]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Missing Persons</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] ${subTab === 'missing' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {missingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('wanted')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer border flex items-center gap-2 ${
              subTab === 'wanted'
                ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-xs'
                : 'bg-[#F6F8F7] text-[#475569] border-[#D5DCE0] hover:text-[#0B1F33]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Wanted Lookouts</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] ${subTab === 'wanted' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {wantedCount}
            </span>
          </button>
        </div>
      </header>

      {/* Active Tab Panel */}
      <section className="space-y-4">
        {subTab === 'missing' ? (
          <NoticesPanel
            notices={notices}
            selectedState={selectedState}
            onSelectNotice={onSelectNotice}
            onViewAllNotices={() => onSelectState(null)}
            isLoading={isLoading}
          />
        ) : (
          <WantedNoticesPanel
            notices={notices}
            selectedState={selectedState}
            onSelectNotice={onSelectNotice}
            onViewAllWanted={() => onSelectState(null)}
            isLoading={isLoading}
          />
        )}
      </section>

      {/* Authoritative National Portals Footer */}
      <footer className="bg-white border border-[#D5DCE0] rounded-xl p-5 text-xs text-[#475569] space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-[#0B1F33]">
          <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
          <span>Official Law Enforcement Portals</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          For real, live inquiries, consult the authorized national public records portals maintained by the Government of India:
        </p>
        <div className="flex flex-wrap items-center gap-4 text-[#0F766E] font-medium pt-1">
          <a href="https://trackchild.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
            <span>TrackChild Portal (MWCD)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span aria-hidden="true" className="text-[#D5DCE0]">·</span>
          <a href="https://cbi.gov.in/wanted" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
            <span>CBI Wanted List</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span aria-hidden="true" className="text-[#D5DCE0]">·</span>
          <a href="https://digitalpolice.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
            <span>Digital Police Portal (CCTNS)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default PublicNoticesView;
