import React, { useState, useMemo } from 'react';
import {
  ExternalLink,
  Search,
  RotateCcw,
  Newspaper,
  BookOpen,
  Building2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  getCrimeArticles,
  CrimeReportTopic,
  CrimeArticle
} from '../data/crimeReportsData';

interface CrimeReportsViewProps {
  selectedState: string | null;
  onSelectState?: (state: string | null) => void;
  onNavigateToAtlas?: () => void;
}

const TOPICS: { id: CrimeReportTopic | 'all'; label: string }[] = [
  { id: 'all', label: 'All Topics' },
  { id: 'cybercrime', label: 'Cybercrime & Digital Fraud' },
  { id: 'legal_reforms', label: 'BNS & Legal Reforms' },
  { id: 'financial_fraud', label: 'Financial Fraud Advisories' },
  { id: 'child_women_safety', label: 'Child & Women Safety' },
  { id: 'public_safety', label: 'Public Safety & Policing' },
  { id: 'investigation', label: 'Investigations' }
];

export const CrimeReportsView: React.FC<CrimeReportsViewProps> = ({
  selectedState,
  onSelectState,
  onNavigateToAtlas
}) => {
  const [selectedTopic, setSelectedTopic] = useState<CrimeReportTopic | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const articles = useMemo(() => {
    return getCrimeArticles({
      state: selectedState,
      topic: selectedTopic,
      searchQuery
    });
  }, [selectedState, selectedTopic, searchQuery]);

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
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Editorial Header */}
      <header className="bg-white border border-[#D5DCE0] rounded-lg p-6 sm:p-8 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D5DCE0]/70 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0F766E] uppercase tracking-wider mb-1">
              <Newspaper className="w-4 h-4" />
              <span>Independent Public Safety Journalism</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#0B1F33]">
              Crime Reports &amp; Analysis
            </h1>
            <p className="text-sm text-[#475569] mt-1 max-w-2xl leading-relaxed">
              Curated, source-attributed journalistic coverage of public safety, cybercrime advisories, criminal justice reforms, and investigations across India.
            </p>
          </div>

          {selectedState && (
            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <span className="text-xs text-[#475569]">
                Filtered for: <strong className="text-[#0B1F33]">{selectedState}</strong>
              </span>
              {onSelectState && (
                <button
                  type="button"
                  onClick={() => onSelectState(null)}
                  className="inline-flex items-center gap-1 text-xs text-[#0F766E] hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Show all India</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mandatory Editorial Distinction Disclaimer */}
        <div className="bg-[#F6F8F7] border border-[#D5DCE0] rounded-md p-3.5 flex items-start gap-3 text-xs text-[#475569] leading-relaxed">
          <AlertCircle className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#0B1F33]">Journalistic Reporting Disclaimer: </strong>
            Articles indexed below are authored and published by accredited news organizations and official government press bureaus. They provide investigative context and are legally distinct from official police First Information Reports (FIRs), chargesheets, or court findings. Readers are linked directly to original publishers.
          </div>
        </div>
      </header>

      {/* Filter and Search Controls */}
      <section className="bg-white border border-[#D5DCE0] rounded-lg p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by keyword, topic, or publisher..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F6F8F7] border border-[#D5DCE0] rounded-md text-[#0B1F33] placeholder-[#64748B] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
            />
          </div>

          <div className="text-xs text-[#475569]">
            Showing <strong className="text-[#0B1F33]">{articles.length}</strong> verified reports
          </div>
        </div>

        {/* Topic Filters (Zero-Pill: Clean Segmented Rectangular Tabs) */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#D5DCE0]/60">
          {TOPICS.map((topic) => {
            const isActive = selectedTopic === topic.id;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => setSelectedTopic(topic.id)}
                className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer border ${
                  isActive
                    ? 'bg-[#0F766E] text-white border-[#0F766E] font-medium'
                    : 'bg-[#F6F8F7] text-[#475569] border-[#D5DCE0] hover:text-[#0B1F33] hover:border-[#64748B]'
                }`}
              >
                {topic.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Article List / Feed */}
      <section className="space-y-4">
        {articles.map((article: CrimeArticle) => (
          <article
            key={article.id}
            className="bg-white border border-[#D5DCE0] rounded-lg p-5 hover:border-[#0F766E] transition-all hover:shadow-xs space-y-3"
          >
            {/* Top metadata line: Zero-pill unboxed text with subtle typographic separators */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#475569] border-b border-[#D5DCE0]/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#0F766E] flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {article.publisher}
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#64748B]" />
                  {formatDate(article.publicationDate)}
                </span>
                {article.stateFocus && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-[#0B1F33]">{article.stateFocus}</span>
                  </>
                )}
                {article.author && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="italic text-[#64748B]">By {article.author}</span>
                  </>
                )}
              </div>

              {/* Distinct Badge: Journalistic Reporting */}
              <div className="text-[11px] font-medium text-[#475569] bg-[#F6F8F7] border border-[#D5DCE0] px-2 py-0.5 rounded">
                News Analysis · Not an official police notice
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-lg sm:text-xl font-bold font-serif text-[#0B1F33] leading-snug">
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#0F766E] transition-colors inline-flex items-center gap-1.5"
              >
                <span>{article.headline}</span>
                <ExternalLink className="w-4 h-4 text-[#64748B] shrink-0" />
              </a>
            </h2>

            {/* Factual Short Summary (Fair Use) */}
            <p className="text-sm text-[#475569] leading-relaxed">
              {article.summary}
            </p>

            {/* Bottom Row: Topic Label & Read Original Link */}
            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-[#64748B] font-medium">
                Topic: <span className="text-[#0B1F33]">{article.topicLabel}</span>
              </span>

              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#0F766E] font-semibold hover:underline"
              >
                <span>Read full report at {article.publisher}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </article>
        ))}

        {/* Honest Empty State if no articles match */}
        {articles.length === 0 && (
          <div className="bg-white border border-dashed border-[#D5DCE0] rounded-lg p-8 sm:p-12 text-center space-y-4">
            <BookOpen className="w-10 h-10 text-[#64748B] mx-auto opacity-50" />
            <div className="space-y-1">
              <h3 className="text-base font-bold font-serif text-[#0B1F33]">
                No reports matching your criteria
              </h3>
              <p className="text-xs text-[#475569] max-w-md mx-auto">
                No verified articles were found matching the selected filters. We do not fabricate news articles or headlines to fill the layout.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedTopic('all');
                  setSearchQuery('');
                  if (onSelectState) onSelectState(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-[#0F766E] bg-[#E8F0EE] hover:bg-[#D1E3DF] rounded-md transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>

              {onNavigateToAtlas && (
                <button
                  type="button"
                  onClick={onNavigateToAtlas}
                  className="px-3 py-1.5 text-xs font-semibold text-[#475569] bg-[#F6F8F7] hover:bg-[#E2E8F0] border border-[#D5DCE0] rounded-md transition-colors cursor-pointer"
                >
                  Return to Civic Atlas
                </button>
              )}
            </div>

            {/* Official Indian Journalism & Legal Sources Links */}
            <div className="pt-4 border-t border-[#D5DCE0]/60 text-xs text-[#64748B] space-y-1">
              <div>Consult authoritative Indian legal and civic news portals:</div>
              <div className="flex flex-wrap items-center justify-center gap-4 text-[#0F766E] font-medium pt-1">
                <a href="https://www.thehindu.com" target="_blank" rel="noopener noreferrer" className="hover:underline">The Hindu</a>
                <span aria-hidden="true">·</span>
                <a href="https://indianexpress.com" target="_blank" rel="noopener noreferrer" className="hover:underline">The Indian Express</a>
                <span aria-hidden="true">·</span>
                <a href="https://pib.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline">Press Information Bureau (PIB)</a>
                <span aria-hidden="true">·</span>
                <a href="https://www.livelaw.in" target="_blank" rel="noopener noreferrer" className="hover:underline">LiveLaw</a>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default CrimeReportsView;
