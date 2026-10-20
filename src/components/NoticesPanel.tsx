import React, { useState } from 'react';
import { Notice, NoticeCategory } from '../types';
import {
  Search,
  User,
  Car,
  Dog,
  Bell,
  ChevronRight,
  MapPin,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
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

  // Filter notices:
  // 1. Exclude wanted notices (they belong in the right column)
  // 2. Filter by selectedState if selected (if notice state is null, treat as All India / Central)
  // 3. Filter by category
  // 4. Filter by text search
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
        return <User className="w-5 h-5 text-[#0F766E]" />;
      case 'vehicle':
        return <Car className="w-5 h-5 text-[#0F766E]" />;
      case 'pet':
        return <Dog className="w-5 h-5 text-[#0F766E]" />;
      case 'advisory':
        return <Bell className="w-5 h-5 text-[#0F766E]" />;
      default:
        return <FileText className="w-5 h-5 text-[#0F766E]" />;
    }
  };

  const getStatusBadge = (status: Notice['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#15803D] bg-[#DCFCE7] border border-[#15803D]/20 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3 h-3" /> Active
          </span>
        );
      case 'review':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#B45309] bg-[#FEF3C7] border border-[#B45309]/20 px-2 py-0.5 rounded">
            <Clock className="w-3 h-3" /> Under review
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#64748B] bg-[#F1F5F9] border border-[#64748B]/20 px-2 py-0.5 rounded">
            <XCircle className="w-3 h-3" /> Closed
          </span>
        );
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
    <div className="flex flex-col h-full bg-white rounded-lg border border-[#D5DCE0] shadow-xs">
      {/* Header section */}
      <div className="p-4 border-b border-[#D5DCE0] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-[#0F766E]/10 border border-[#0F766E]/20 flex items-center justify-center text-[#0F766E]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-[#0B1F33] leading-tight">
                Missing persons and notices
              </h2>
              <p className="text-xs text-[#475569]">
                Official notices from police and authorised agencies
              </p>
            </div>
          </div>
        </div>

        {/* Category Filter Pills / Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'bg-[#F6F8F7] text-[#475569] hover:bg-[#E8F0EE] border border-[#D5DCE0]'
            }`}
          >
            All notices
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('missing_person')}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'missing_person'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'bg-[#F6F8F7] text-[#475569] hover:bg-[#E8F0EE] border border-[#D5DCE0]'
            }`}
          >
            Missing persons
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('vehicle')}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'vehicle'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'bg-[#F6F8F7] text-[#475569] hover:bg-[#E8F0EE] border border-[#D5DCE0]'
            }`}
          >
            Vehicles
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('pet')}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'pet'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'bg-[#F6F8F7] text-[#475569] hover:bg-[#E8F0EE] border border-[#D5DCE0]'
            }`}
          >
            Pets
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('advisory')}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'advisory'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'bg-[#F6F8F7] text-[#475569] hover:bg-[#E8F0EE] border border-[#D5DCE0]'
            }`}
          >
            Advisories
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notices, reference ID, area..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F6F8F7] border border-[#D5DCE0] rounded-md text-[#0B1F33] placeholder-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
          />
        </div>

        {/* State filter context indicator */}
        <div className="text-[11px] text-[#475569] flex items-center justify-between">
          <span>
            {selectedState
              ? `Showing notices for ${selectedState} (${filteredNotices.length})`
              : `Showing India-wide notices (${filteredNotices.length})`}
          </span>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-[#0F766E] hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {/* Notice Card List */}
      <div className="flex-1 overflow-y-auto max-h-[580px] p-3 space-y-3">
        {filteredNotices.map((notice) => (
          <div
            key={notice.id}
            onClick={() => onSelectNotice(notice)}
            className="group bg-white rounded-lg border border-[#D5DCE0] hover:border-[#0F766E] hover:shadow-sm p-3.5 transition-all cursor-pointer relative"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold tracking-wide text-[#B45309] bg-[#FFF7E6] border border-[#B45309]/30 px-1.5 py-0.5 rounded">
                  DEMO
                </span>
                <span className="text-xs text-[#64748B] font-mono">
                  {notice.referenceNumber}
                </span>
              </div>
              {getStatusBadge(notice.status)}
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-md bg-[#F6F8F7] border border-[#D5DCE0] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#E8F0EE] transition-colors">
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

              <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#0F766E] shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
            </div>

            {/* Unboxed Metadata row with typographic separators */}
            <div className="mt-3 pt-2.5 border-t border-[#D5DCE0]/60 flex flex-wrap items-center gap-y-1 gap-x-2 text-[11px] text-[#475569]">
              <span className="inline-flex items-center gap-1 truncate max-w-[170px]" title={notice.issuingAuthority}>
                <Building2 className="w-3 h-3 text-[#64748B]" />
                {notice.issuingAuthority}
              </span>
              <span aria-hidden="true" className="text-[#D5DCE0]">·</span>
              <span className="inline-flex items-center gap-1 shrink-0">
                <Calendar className="w-3 h-3 text-[#64748B]" />
                {formatDate(notice.publishedAt)}
              </span>
              <span aria-hidden="true" className="text-[#D5DCE0]">·</span>
              <span className="inline-flex items-center gap-1 truncate max-w-[150px]" title={notice.area}>
                <MapPin className="w-3 h-3 text-[#64748B]" />
                {notice.area}
              </span>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredNotices.length === 0 && (
          <div className="p-8 text-center border border-dashed border-[#D5DCE0] rounded-lg bg-[#F6F8F7]/60">
            <FileText className="w-8 h-8 text-[#64748B] mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-[#0B1F33]">
              No notices match this selection
            </p>
            <p className="text-xs text-[#475569] mt-1 max-w-[280px] mx-auto">
              {selectedState
                ? `No official notices from ${selectedState} are loaded in this category. This does not mean there are none.`
                : 'Try adjusting your search query or category filters.'}
            </p>
          </div>
        )}
      </div>

      {/* Footer view all link */}
      <div className="p-3 border-t border-[#D5DCE0] bg-[#F6F8F7]/50 text-center">
        <button
          type="button"
          onClick={onViewAllNotices}
          className="text-xs font-semibold text-[#0F766E] hover:underline cursor-pointer inline-flex items-center gap-1"
        >
          View all missing persons and notices →
        </button>
      </div>
    </div>
  );
};
