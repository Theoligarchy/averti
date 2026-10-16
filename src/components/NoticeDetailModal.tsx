import React, { useState } from 'react';
import { Notice } from '../types';
import {
  X,
  ExternalLink,
  Phone,
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileQuestion,
  Share2,
  Info
} from 'lucide-react';

interface NoticeDetailModalProps {
  notice: Notice | null;
  onClose: () => void;
  onRequestCorrection: (noticeRef: string) => void;
  onOpenTipModal?: (notice: Notice) => void;
}

export const NoticeDetailModal: React.FC<NoticeDetailModalProps> = ({
  notice,
  onClose,
  onRequestCorrection,
  onOpenTipModal
}) => {
  const [showTipIntakeInfo, setShowTipIntakeInfo] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!notice) return null;

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Not recorded';
    try {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + `/#notice/${notice.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F33]/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-[#D5DCE0] overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-notice-title"
      >
        {/* Banner for example data */}
        <div className="bg-[#FFF7E6] text-[#0B1F33] border-b border-[#B45309]/30 px-5 py-2 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B45309]" />
            <span>EXAMPLE NOTICE — The cases and identifiers listed here are illustrative.</span>
          </div>
          <span className="font-mono text-[#475569]">{notice.referenceNumber}</span>
        </div>

        {/* Modal Top Header */}
        <div className="p-6 border-b border-[#D5DCE0] flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[#475569] font-medium">
              <span className="capitalize">{notice.kindLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{notice.jurisdiction}</span>
            </div>
            <h1
              id="modal-notice-title"
              className="text-2xl font-bold font-serif text-[#0B1F33] leading-snug"
            >
              {notice.title}
            </h1>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-md border border-[#D5DCE0] flex items-center justify-center text-[#475569] hover:bg-[#F6F8F7] hover:text-[#0B1F33] transition-colors cursor-pointer shrink-0"
            aria-label="Close notice details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-6 max-h-[calc(80vh-140px)] overflow-y-auto">
          {/* Prominent Caution for Wanted Notices */}
          {notice.isWanted && (
            <div className="bg-[#FFF7E6] border-2 border-[#B45309]/50 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#B45309] text-base block font-serif">
                  Do not approach.
                </strong>
                <p className="text-xs text-[#0B1F33] mt-1 leading-relaxed">
                  This notice is an official request for public information, not a judicial finding of guilt. Never attempt to intercept or detain any person. Notify police authorities immediately.
                </p>
                {notice.reward && (
                  <p className="text-xs font-semibold text-[#B45309] mt-2">
                    Official Reward: {notice.reward}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Published Details Section */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#475569] mb-2 font-sans">
              Published Description
            </h2>
            <div className="bg-[#F6F8F7] rounded-lg p-4 text-sm text-[#0B1F33] leading-relaxed border border-[#D5DCE0]/60">
              {notice.description}
            </div>
            <div className="mt-2 text-xs text-[#475569] flex items-center gap-1.5">
              <span><strong>Specific Locality / Area:</strong> {notice.area}</span>
            </div>
          </div>

          {/* Official Verification & Provenance Metadata */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#475569] mb-3 font-sans">
              Notice Provenance & Authority
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white rounded-lg border border-[#D5DCE0] p-4 tabular-nums">
              <div className="space-y-1">
                <span className="text-[#64748B] block">Issuing Authority</span>
                <span className="font-semibold text-[#0B1F33] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#0F766E]" />
                  {notice.issuingAuthority}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[#64748B] block">Jurisdiction</span>
                <span className="font-semibold text-[#0B1F33]">
                  {notice.jurisdiction} ({notice.state || "National / Central"})
                </span>
              </div>

              <div className="space-y-1 pt-2 border-t border-[#D5DCE0]/40">
                <span className="text-[#64748B] block">Reference Number</span>
                <span className="font-mono font-medium text-[#0B1F33]">
                  {notice.referenceNumber}
                </span>
              </div>

              <div className="space-y-1 pt-2 border-t border-[#D5DCE0]/40">
                <span className="text-[#64748B] block">Publication Date</span>
                <span className="text-[#0B1F33] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                  {formatDate(notice.publishedAt)}
                </span>
              </div>

              <div className="space-y-1 pt-2 border-t border-[#D5DCE0]/40">
                <span className="text-[#64748B] block">Averti Verification Check</span>
                <span className="text-[#0B1F33] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
                  {formatDate(notice.verifiedAt)}
                </span>
              </div>

              <div className="space-y-1 pt-2 border-t border-[#D5DCE0]/40">
                <span className="text-[#64748B] block">Notice Expiry / Review Date</span>
                <span className="text-[#0B1F33] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                  {notice.expiresAt ? formatDate(notice.expiresAt) : "Open notice / Until withdrawn"}
                </span>
              </div>
            </div>
          </div>

          {/* "I Have Information" Dialog / Drawer */}
          {showTipIntakeInfo && (
            <div className="p-4 bg-[#E8F0EE] border border-[#0F766E]/40 rounded-lg space-y-3">
              <div className="flex items-start gap-2.5">
                <Phone className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-[#0B1F33]">
                    Official Contact for this Notice
                  </h3>
                  <p className="text-xs text-[#475569] mt-0.5">
                    Averti does not receive, record, or store citizen tips. Please contact the investigating authority directly:
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-md p-3 border border-[#D5DCE0] text-xs space-y-1.5 tabular-nums">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Department:</span>
                  <span className="font-semibold text-[#0B1F33]">{notice.contactDepartment || notice.issuingAuthority}</span>
                </div>
                {notice.contactPhone && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">Official Phone:</span>
                    <a
                      href={`tel:${notice.contactPhone}`}
                      className="font-bold text-[#0F766E] hover:underline"
                    >
                      {notice.contactPhone}
                    </a>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1 border-t border-[#D5DCE0]/60">
                  <span className="text-[#64748B]">Emergency Dispatch:</span>
                  <a href="tel:112" className="font-bold text-[#D92D20]">
                    Call 112 (Police / ERSS)
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Mandatory button exact wording: "Open the official notice" */}
              <a
                href={notice.sourceUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-h-[44px] px-4 py-2.5 rounded-lg bg-[#0F766E] text-white font-semibold text-sm hover:bg-[#0D655E] flex items-center justify-center gap-2 transition-colors"
              >
                <span>Open the official notice</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => {
                  if (onOpenTipModal) {
                    onOpenTipModal(notice);
                  } else {
                    setShowTipIntakeInfo(!showTipIntakeInfo);
                  }
                }}
                className="flex-1 min-h-[44px] px-4 py-2.5 rounded-lg bg-white border border-[#64748B] text-[#0B1F33] font-semibold text-sm hover:bg-[#F6F8F7] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4 text-[#0F766E]" />
                <span>I have information</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-[#475569] pt-2">
              <button
                type="button"
                onClick={() => onRequestCorrection(notice.referenceNumber)}
                className="text-[#0F766E] hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <FileQuestion className="w-3.5 h-3.5" />
                Request correction or removal of this notice
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="text-[#475569] hover:text-[#0B1F33] cursor-pointer inline-flex items-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                {copiedLink ? "Link copied!" : "Share notice"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
