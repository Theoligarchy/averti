import React, { useState } from 'react';
import { Notice } from '../types';
import {
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Calendar,
  Building2,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import { WantedNoticesPanelSkeleton } from './Skeletons';

interface WantedNoticesPanelProps {
  notices: Notice[];
  selectedState: string | null;
  onSelectNotice: (notice: Notice) => void;
  onViewAllWanted?: () => void;
  isLoading?: boolean;
}

export const WantedNoticesPanel: React.FC<WantedNoticesPanelProps> = ({
  notices,
  selectedState,
  onSelectNotice,
  onViewAllWanted,
  isLoading = false
}) => {
  const [searchTerm] = useState('');

  // Filter for wanted notices only
  const wantedNotices = notices.filter(n => n.isWanted || n.category === 'wanted');

  const filteredNotices = wantedNotices.filter(notice => {
    // If state is selected: include state-specific notices and central agency notices (state === null)
    if (selectedState) {
      const isStateMatch =
        notice.state?.toLowerCase() === selectedState.toLowerCase() ||
        notice.state === null; // National agencies (CBI, NIA) apply nationwide
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

  if (isLoading) {
    return <WantedNoticesPanelSkeleton />;
  }

  return (
    <div className="flex flex-col bg-white rounded-lg border border-[#D5DCE0] shadow-xs">
      {/* Header */}
      <div className="p-4 border-b border-[#D5DCE0] space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#D92D20]/10 border border-[#D92D20]/20 flex items-center justify-center text-[#D92D20] shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif text-[#0B1F33] leading-tight">
                Police &amp; Agency Wanted Notices
              </h2>
              <p className="text-xs text-[#475569]">
                Published lookouts from State Police, CBI &amp; central investigative agencies
              </p>
            </div>
          </div>
        </div>

        {/* Mandatory Legal Caveat */}
        <div className="bg-[#FFF7E6] border border-[#B45309]/30 rounded-md p-2 flex items-start gap-2 text-[11px] text-[#0B1F33]">
          <AlertTriangle className="w-3.5 h-3.5 text-[#B45309] shrink-0 mt-0.5" />
          <div className="leading-snug">
            <strong className="text-[#B45309]">Caution: </strong>
            This is a request for information, not a finding of guilt. Do not approach.
          </div>
        </div>
      </div>

      {/* Wanted Notices Cards List */}
      <div className="p-3 space-y-3 max-h-[480px] overflow-y-auto">
        {filteredNotices.map((notice) => (
          <article
            key={notice.id}
            onClick={() => onSelectNotice(notice)}
            className="group bg-white rounded-lg border border-[#D5DCE0] hover:border-[#D92D20] p-3.5 transition-all cursor-pointer relative hover:shadow-xs space-y-2"
          >
            {/* Top row: DEMO & Reference Number */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                {notice.classification === 'example' ? (
                  <span className="text-[10px] font-semibold text-[#B45309] bg-[#FFF7E6] border border-[#B45309]/30 px-1.5 py-0.5 rounded">
                    DEMO — fictional example
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-[#15803D] bg-[#DCFCE7] border border-[#15803D]/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#15803D]" />
                    Official Notice
                  </span>
                )}
                <span className="text-xs text-[#64748B] font-mono">
                  {notice.referenceNumber}
                </span>
              </div>

              <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#D92D20] transition-transform group-hover:translate-x-0.5" />
            </div>

            {/* Title & Description */}
            <h3 className="text-sm font-semibold text-[#0B1F33] leading-snug group-hover:text-[#D92D20] transition-colors">
              {notice.title}
            </h3>
            <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed">
              {notice.description}
            </p>

            {/* Metadata row: Zero-Pill Unboxed Text */}
            <div className="pt-2 border-t border-[#D5DCE0]/60 flex flex-wrap items-center gap-y-1 gap-x-2 text-[11px] text-[#475569]">
              <span className="inline-flex items-center gap-1 truncate max-w-[160px]" title={notice.issuingAuthority}>
                <Building2 className="w-3 h-3 text-[#64748B]" />
                {notice.issuingAuthority}
              </span>
              <span aria-hidden="true" className="text-[#D5DCE0]">·</span>
              <span className="inline-flex items-center gap-1 shrink-0">
                <Calendar className="w-3 h-3 text-[#64748B]" />
                {formatDate(notice.publishedAt)}
              </span>
              <span aria-hidden="true" className="text-[#D5DCE0]">·</span>
              <span className="inline-flex items-center gap-1 truncate max-w-[140px]" title={notice.area}>
                <MapPin className="w-3 h-3 text-[#64748B]" />
                {notice.area}
              </span>
            </div>

            {/* Official Source Link */}
            {notice.sourceUrl && (
              <div className="pt-1 text-right">
                <a
                  href={notice.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-[11px] text-[#0F766E] font-medium hover:underline"
                >
                  <span>Official agency record</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            )}
          </article>
        ))}

        {/* Empty State */}
        {filteredNotices.length === 0 && (
          <div className="p-6 text-center border border-dashed border-[#D5DCE0] rounded-lg bg-[#F6F8F7]/60 space-y-3">
            <ShieldAlert className="w-6 h-6 text-[#64748B] mx-auto opacity-60" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#0B1F33]">
                No verified wanted notices in this view
              </p>
              <p className="text-[11px] text-[#475569] max-w-[280px] mx-auto leading-relaxed">
                {selectedState
                  ? `No wanted lookout notices are currently indexed for ${selectedState}. We do not fabricate criminal records or wanted persons.`
                  : 'No wanted notices to display for this selection.'}
              </p>
            </div>

            {/* Link to Official Law Enforcement Sources */}
            <div className="pt-2 flex flex-col gap-1.5 items-center">
              <a
                href="https://cbi.gov.in/wanted"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0F766E] bg-[#E8F0EE] hover:bg-[#D1E3DF] rounded-md transition-colors"
              >
                <span>Browse CBI Wanted Database</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-[10px] text-[#64748B]">
                Official Central Bureau of Investigation Wanted Portal
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#D5DCE0] bg-[#F6F8F7]/50 text-center">
        {onViewAllWanted && (
          <button
            type="button"
            onClick={onViewAllWanted}
            className="text-xs font-semibold text-[#0F766E] hover:underline cursor-pointer inline-flex items-center gap-1"
          >
            Browse all wanted notices →
          </button>
        )}
      </div>
    </div>
  );
};

export default WantedNoticesPanel;
