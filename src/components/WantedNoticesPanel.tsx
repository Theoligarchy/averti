import React, { useState } from 'react';
import { Notice } from '../types';
import {
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Calendar,
  Building2,
  Gift
} from 'lucide-react';

interface WantedNoticesPanelProps {
  notices: Notice[];
  selectedState: string | null;
  onSelectNotice: (notice: Notice) => void;
  onViewAllWanted?: () => void;
}

export const WantedNoticesPanel: React.FC<WantedNoticesPanelProps> = ({
  notices,
  selectedState,
  onSelectNotice,
  onViewAllWanted
}) => {
  const [searchTerm] = useState('');

  // Wanted notices only
  const wantedNotices = notices.filter(n => n.isWanted);

  const filteredNotices = wantedNotices.filter(notice => {
    // If state is selected: include state-specific notices and central / all-India agency notices (state === null)
    if (selectedState) {
      const isStateMatch =
        notice.state?.toLowerCase() === selectedState.toLowerCase() ||
        notice.state === null; // National agencies (CBI, NIA) are jurisdictionally applicable
      if (!isStateMatch) return false;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        notice.title.toLowerCase().includes(q) ||
        notice.referenceNumber.toLowerCase().includes(q) ||
        notice.description.toLowerCase().includes(q) ||
        notice.issuingAuthority.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-lg border border-[#D5DCE0] shadow-xs mt-4">
      {/* Header */}
      <div className="p-4 border-b border-[#D5DCE0] space-y-1.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-[#0F766E]/10 border border-[#0F766E]/20 flex items-center justify-center text-[#0F766E]">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold font-serif text-[#0B1F33] leading-tight">
              Police and agency wanted notices
            </h2>
            <p className="text-xs text-[#475569]">
              Official notices from police, NIA, CBI and authorised agencies
            </p>
          </div>
        </div>
      </div>

      {/* Wanted Notices Cards List */}
      <div className="p-3 space-y-3 max-h-[460px] overflow-y-auto">
        {filteredNotices.map((notice) => (
          <div
            key={notice.id}
            onClick={() => onSelectNotice(notice)}
            className="group bg-white rounded-lg border border-[#D5DCE0] hover:border-[#0F766E] p-3.5 transition-all cursor-pointer relative hover:shadow-xs"
          >
            {/* Top row: DEMO & WANTED Tags */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-[#B45309] bg-[#FFF7E6] border border-[#B45309]/30 px-1.5 py-0.5 rounded">
                  DEMO
                </span>
                <span className="text-[10px] font-bold text-white bg-[#B8613A] px-2 py-0.5 rounded tracking-wider">
                  WANTED
                </span>
                <span className="text-xs text-[#64748B] font-mono">
                  {notice.referenceNumber}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#0F766E] transition-transform group-hover:translate-x-0.5" />
            </div>

            {/* Title & Description */}
            <h3 className="text-sm font-semibold text-[#0B1F33] leading-snug group-hover:text-[#0F766E] transition-colors">
              {notice.title}
            </h3>
            <p className="text-xs text-[#475569] mt-1 line-clamp-2 leading-relaxed">
              {notice.description}
            </p>

            {/* Metadata row */}
            <div className="mt-2.5 pt-2 border-t border-[#D5DCE0]/60 space-y-1 text-[11px] text-[#475569]">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 truncate" title={notice.issuingAuthority}>
                  <Building2 className="w-3 h-3 text-[#64748B]" />
                  {notice.issuingAuthority}
                </span>
                <span className="inline-flex items-center gap-1 shrink-0">
                  <Calendar className="w-3 h-3 text-[#64748B]" />
                  {formatDate(notice.publishedAt)}
                </span>
              </div>

              {notice.reward && (
                <div className="flex items-center gap-1 text-[#B45309] font-medium pt-0.5">
                  <Gift className="w-3 h-3 text-[#B45309]" />
                  <span>Reward: {notice.reward}</span>
                </div>
              )}
            </div>

            {/* Prominent Caution Box required by specification */}
            <div className="mt-2.5 bg-[#FFF7E6] border border-[#B45309]/30 rounded-md p-2 flex items-start gap-2 text-[11px] text-[#0B1F33]">
              <AlertTriangle className="w-3.5 h-3.5 text-[#B45309] shrink-0 mt-0.5" />
              <div className="leading-snug">
                <strong className="text-[#B45309]">Do not approach.</strong> This is an official request for information, not a finding of guilt.
              </div>
            </div>

            {notice.sourceUrl && (
              <div className="mt-2 text-right">
                <span className="inline-flex items-center gap-1 text-[11px] text-[#0F766E] font-medium hover:underline">
                  Source: official notice <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </div>
            )}
          </div>
        ))}

        {filteredNotices.length === 0 && (
          <div className="p-6 text-center border border-dashed border-[#D5DCE0] rounded-lg bg-[#F6F8F7]/60">
            <ShieldAlert className="w-6 h-6 text-[#64748B] mx-auto mb-1.5 opacity-60" />
            <p className="text-xs font-semibold text-[#0B1F33]">
              No wanted notices currently listed
            </p>
            <p className="text-[11px] text-[#475569] mt-0.5">
              {selectedState
                ? `No agency notices listed under ${selectedState} jurisdiction.`
                : 'No wanted notices to display.'}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#D5DCE0] bg-[#F6F8F7]/50 text-center">
        <button
          type="button"
          onClick={onViewAllWanted}
          className="text-xs font-semibold text-[#0F766E] hover:underline cursor-pointer inline-flex items-center gap-1"
        >
          View all wanted notices →
        </button>
      </div>
    </div>
  );
};
