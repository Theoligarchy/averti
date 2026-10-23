import React, { useState } from 'react';
import { Notice, NoticeCategory } from '../types';
import {
  Search,
  User,
  Car,
  Bell,
  ChevronRight,
  MapPin,
  Calendar,
  Building2,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { NoticesPanelSkeleton } from './Skeletons';

interface NoticesPanelProps {
  notices: Notice[];
  selectedState: string | null;
  onSelectNotice: (notice: Notice) => void;
  onViewAllNotices?: () => void;
  isLoading?: boolean;
}

export const NoticesPanel: React.FC<NoticesPanelProps> = ({
  notices,
  selectedState,
  onSelectNotice,
  onViewAllNotices,
  isLoading = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<NoticeCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Exclude wanted notices (they belong in the Wanted panel)
  const missingAndOtherNotices = notices.filter(n => !n.isWanted);

  const filteredNotices = missingAndOtherNotices.filter(notice => {
    // State matching:
    if (selectedState) {
      const stateMatch =
        notice.state?.toLowerCase() === selectedState.toLowerCase() ||
        notice.state === null; // Pan-India
      if (!stateMatch) return false;
    }

    // Category matching:
    if (selectedCategory !== 'all' && notice.category !== selectedCategory) {
      return false;
    }

    // Search term matching:
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = notice.title.toLowerCase().includes(q);
      const matchRef = notice.referenceNumber.toLowerCase().includes(q);
      const matchDesc = notice.description.toLowerCase().includes(q);
      const matchArea = notice.area.toLowerCase().includes(q);
      const matchAuth = notice.issuingAuthority.toLowerCase().includes(q);
      if (!matchTitle && !matchRef && !matchDesc && !matchArea && !matchAuth) {
        return false;
      }
    }

    return true;
  });

  const getCategoryIcon = (category: NoticeCategory) => {
    switch (category) {
      case 'missing_person':
        return <User className="w-4 h-4 text-[#0F766E]" />;
      case 'vehicle':
        return <Car className="w-4 h-4 text-[#0F766E]" />;
      case 'advisory':
        return <Bell className="w-4 h-4 text-[#0F766E]" />;
      default:
        return <FileText className="w-4 h-4 text-[#0F766E]" />;
    }
  };

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
    return <NoticesPanelSkeleton />;
  }

  return (
    <div className="flex flex-col bg-white rounded-lg border border-[#D5DCE0] shadow-xs">
      {/* Header section */}
      <div className="p-4 border-b border-[#D5DCE0] space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#0F766E]/10 border border-[#0F766E]/20 flex items-center justify-center text-[#0F766E] shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif text-[#0B1F33] leading-tight">
                Missing Persons &amp; Notices
              </h2>
              <p className="text-xs text-[#475569]">
                Public notices from police forces &amp; child tracking portals
              </p>
            </div>
          </div>
        </div>

        {/* Clean Segmented Category Filters (Zero-Pill: Rectangular with Subtle Borders) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-xs font-medium no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer border ${
              selectedCategory === 'all'
                ? 'bg-[#0F766E] text-white border-[#0F766E] font-semibold shadow-xs'
                : 'bg-[#F6F8F7] text-[#475569] border-[#D5DCE0] hover:text-[#0B1F33]'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('missing_person')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer border ${
              selectedCategory === 'missing_person'
                ? 'bg-[#0F766E] text-white border-[#0F766E] font-semibold shadow-xs'
                : 'bg-[#F6F8F7] text-[#475569] border-[#D5DCE0] hover:text-[#0B1F33]'
            }`}
          >
            Missing Persons
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('vehicle')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer border ${
              selectedCategory === 'vehicle'
                ? 'bg-[#0F766E] text-white border-[#0F766E] font-semibold shadow-xs'
                : 'bg-[#F6F8F7] text-[#475569] border-[#D5DCE0] hover:text-[#0B1F33]'
            }`}
          >
            Vehicles
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('advisory')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer border ${
              selectedCategory === 'advisory'
                ? 'bg-[#0F766E] text-white border-[#0F766E] font-semibold shadow-xs'
                : 'bg-[#F6F8F7] text-[#475569] border-[#D5DCE0] hover:text-[#0B1F33]'
            }`}
          >
            Advisories
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reference ID, person, or area..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F6F8F7] border border-[#D5DCE0] rounded-md text-[#0B1F33] placeholder-[#64748B] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
          />
        </div>

        {/* State filter context indicator */}
        <div className="text-[11px] text-[#475569] flex items-center justify-between">
          <span>
            {selectedState
              ? `Filtered: ${selectedState} (${filteredNotices.length})`
              : `All India notices (${filteredNotices.length})`}
          </span>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-[#0F766E] hover:underline cursor-pointer"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {/* Notice Card List */}
      <div className="p-3 space-y-3 max-h-[640px] overflow-y-auto">
        {filteredNotices.map((notice) => (
          <article
            key={notice.id}
            onClick={() => onSelectNotice(notice)}
            className="group bg-white rounded-lg border border-[#D5DCE0] hover:border-[#0F766E] hover:shadow-xs p-3.5 transition-all cursor-pointer relative space-y-2"
          >
            {/* Top row: Explicit Fictional/Demo Label or Official Verification */}
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

              <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#0F766E] shrink-0 transition-transform group-hover:translate-x-0.5" />
            </div>

            {/* Title & Short Description */}
            <div className="flex gap-2.5 items-start">
              <div className="w-7 h-7 rounded bg-[#F6F8F7] border border-[#D5DCE0] flex items-center justify-center shrink-0 mt-0.5 text-[#0F766E]">
                {getCategoryIcon(notice.category)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-[#0B1F33] leading-snug group-hover:text-[#0F766E] transition-colors line-clamp-1">
                  {notice.title}
                </h3>
                <p className="text-xs text-[#475569] mt-1 line-clamp-2 leading-relaxed">
                  {notice.description}
                </p>
              </div>
            </div>

            {/* Unboxed Metadata row with typographic separators */}
            <div className="pt-2 border-t border-[#D5DCE0]/60 flex flex-wrap items-center gap-y-1 gap-x-2 text-[11px] text-[#475569]">
              <span className="inline-flex items-center gap-1 truncate max-w-[160px]" title={notice.issuingAuthority}>
                <Building2 className="w-3 h-3 text-[#64748B]" />
                {notice.issuingAuthority}
              </span>
              <span aria-hidden="true" className="text-[#D5DCE0]">·</span>
              <span className="inline-flex items-center gap-1 shrink-0">
                <Calendar className="w-3 h-3 text-[#64748B]" />
                Pub: {formatDate(notice.publishedAt)}
              </span>
              {notice.verifiedAt && (
                <>
                  <span aria-hidden="true" className="text-[#D5DCE0]">·</span>
                  <span className="text-[#64748B]">
                    Verified: {formatDate(notice.verifiedAt)}
                  </span>
                </>
              )}
              <span aria-hidden="true" className="text-[#D5DCE0]">·</span>
              <span className="inline-flex items-center gap-1 truncate max-w-[140px]" title={notice.area}>
                <MapPin className="w-3 h-3 text-[#64748B]" />
                {notice.area}
              </span>
            </div>

            {/* Official Source Link if present */}
            {notice.sourceUrl && (
              <div className="pt-1 text-right">
                <a
                  href={notice.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-[11px] text-[#0F766E] font-medium hover:underline"
                >
                  <span>Official notice record</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            )}
          </article>
        ))}

        {/* Designed Empty State Required by Prompt */}
        {filteredNotices.length === 0 && (
          <div className="p-6 text-center border border-dashed border-[#D5DCE0] rounded-lg bg-[#F6F8F7]/60 space-y-3">
            <ShieldAlert className="w-7 h-7 text-[#64748B] mx-auto opacity-60" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#0B1F33]">
                No verified notices are available in this view yet.
              </p>
              <p className="text-xs text-[#475569] max-w-[280px] mx-auto leading-relaxed">
                {selectedState
                  ? `There are no official missing person notices loaded for ${selectedState} in this prototype. We do not fabricate records.`
                  : 'No notices match the selected category or search filters.'}
              </p>
            </div>

            {/* Required Action Link */}
            <div className="pt-2">
              <a
                href="https://trackchild.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0F766E] bg-[#E8F0EE] hover:bg-[#D1E3DF] rounded-md transition-colors"
              >
                <span>Browse official police sources</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-[10px] text-[#64748B] pt-1">
              Official TrackChild &amp; Khoya-Paya portals managed by Ministry of Women and Child Development.
            </p>
          </div>
        )}
      </div>

      {/* Footer view all link */}
      <div className="p-3 border-t border-[#D5DCE0] bg-[#F6F8F7]/50 text-center">
        {onViewAllNotices && (
          <button
            type="button"
            onClick={onViewAllNotices}
            className="text-xs font-semibold text-[#0F766E] hover:underline cursor-pointer inline-flex items-center gap-1"
          >
            Browse all missing person records →
          </button>
        )}
      </div>
    </div>
  );
};

export default NoticesPanel;
