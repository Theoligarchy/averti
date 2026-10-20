import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenAbout: () => void;
  onOpenSources: () => void;
  onOpenCorrections: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAbout,
  onOpenSources,
  onOpenCorrections
}) => {
  return (
    <footer className="mt-16 bg-white border-t border-[#D5DCE0] text-xs text-[#475569]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Top Brand & Philosophy Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#D5DCE0]/70">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-xl font-bold font-serif text-[#0B1F33]">Averti</span>
            <span className="text-[#D5DCE0]">|</span>
            <span className="text-xs text-[#475569] font-medium tracking-wide">
              See. Report. Protect.
            </span>
            <span className="text-[#D5DCE0] hidden sm:inline">·</span>
            <span className="text-xs text-[#0F766E] font-medium">
              made by Priyash Priyal Jena
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium">
            <button
              type="button"
              onClick={onOpenAbout}
              className="hover:text-[#0B1F33] transition-colors cursor-pointer"
            >
              About Averti
            </button>
            <button
              type="button"
              onClick={onOpenSources}
              className="hover:text-[#0B1F33] transition-colors cursor-pointer"
            >
              Sources & Method
            </button>
            <button
              type="button"
              onClick={onOpenCorrections}
              className="hover:text-[#0B1F33] transition-colors cursor-pointer"
            >
              Corrections & Takedowns
            </button>
            <a
              href="https://112.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0F766E] hover:underline inline-flex items-center gap-1"
            >
              ERSS 112 Portal <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Detailed Caveat & Legal Disclaimer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] leading-relaxed">
          <div className="space-y-1.5 md:col-span-2">
            <div className="flex items-center gap-1.5 font-bold text-[#0B1F33]">
              <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
              <span>Independent Civic Platform Statement</span>
            </div>
            <p>
              Averti is an independent project and is not affiliated with any police force or government body. Statistics are drawn directly from the National Crime Records Bureau (NCRB), Crime in India 2024 (Volume I, Table 1A.3). Notice cards are illustrative civic demonstrations.
            </p>
            <p className="text-[#64748B]">
              Registered cases depend entirely on reporting and recording practices; a higher registration figure can reflect improved reporting culture and police access rather than greater crime incidence. It reveals nothing about the safety of any individual person or street.
            </p>
          </div>

          <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-[#D5DCE0]/70 md:pl-6">
            <div className="font-bold text-[#0B1F33]">Official Emergency Contact</div>
            <p>
              In any immediate life-threatening emergency, call <strong>112</strong> immediately. Averti does not maintain live dispatch, intercept calls, or store criminal tip reports.
            </p>
            <div className="pt-2 text-[#64748B]">
              made by Priyash Priyal Jena · Dataset Year: 2024 (Latest Available) · Reviewed: October 2026
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
