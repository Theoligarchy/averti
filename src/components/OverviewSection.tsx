import React from 'react';
import {
  Map,
  Shield,
  FileText,
  PhoneCall,
  Newspaper,
  BookOpen,
  ArrowRight,
  Building2,
  TrendingUp,
  AlertCircle,
  Database,
  CheckCircle2
} from 'lucide-react';
import { ALL_INDIA_OVERALL } from '../data/crimeData';

interface OverviewSectionProps {
  onNavigate: (tab: 'atlas' | 'notices' | 'wanted' | 'reports' | 'emergency' | 'sources' | 'about') => void;
  onSelectState?: (state: string | null) => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  onNavigate,
  onSelectState
}) => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Executive Hero Banner */}
      <section className="bg-white border border-[#D5DCE0] rounded-xl p-6 sm:p-10 shadow-xs space-y-6">
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0F766E] uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Independent Public-Safety Research Prototype</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[#0B1F33] tracking-tight leading-tight">
            Making India’s public safety data accessible, structured &amp; verifiable.
          </h1>

          <p className="text-base sm:text-lg text-[#475569] leading-relaxed">
            Averti bridges the gap between dense administrative crime publications, scattered district circulars, and citizen emergency needs—providing an authoritative, population-normalized civic intelligence atlas.
          </p>
        </div>

        {/* Primary Call to Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('atlas')}
            className="px-5 py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#0D655E] text-white text-sm font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Map className="w-4 h-4" />
            <span>Explore Crime Statistics Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('emergency')}
            className="px-5 py-2.5 rounded-lg bg-white border border-[#D92D20] text-[#D92D20] hover:bg-[#FEE4E2] text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Safety Resources &amp; 112</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('reports')}
            className="px-5 py-2.5 rounded-lg bg-[#F6F8F7] hover:bg-[#E8F0EE] border border-[#D5DCE0] text-[#0B1F33] text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Newspaper className="w-4 h-4 text-[#0F766E]" />
            <span>Research &amp; Insights</span>
          </button>
        </div>

        {/* Credibility & Independent Scope Disclaimer */}
        <div className="pt-4 border-t border-[#D5DCE0]/60 flex items-start gap-3 text-xs text-[#475569]">
          <AlertCircle className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#0B1F33]">Product Status:</strong> Averti is an independent academic and portfolio prototype created by Priyash Priyal Jena. It is not affiliated with any police commissionerate or government agency and does not receive live telemetry or dispatch emergency assistance.
          </p>
        </div>
      </section>

      {/* Quantitative Baseline Metrics (NCRB 2024 Return) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#D5DCE0] rounded-lg p-5 space-y-1 shadow-xs">
          <span className="text-xs font-medium text-[#475569] block">
            National Baseline Rate (2024)
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#0F766E] tabular-nums">
            {ALL_INDIA_OVERALL.rate.toFixed(1)}
          </div>
          <p className="text-[11px] text-[#64748B]">
            Registered cases per 1 lakh population (NCRB Table 1A.1)
          </p>
        </div>

        <div className="bg-white border border-[#D5DCE0] rounded-lg p-5 space-y-1 shadow-xs">
          <span className="text-xs font-medium text-[#475569] block">
            Geographic Coverage
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#0B1F33] tabular-nums">
            36 States &amp; UTs
          </div>
          <p className="text-[11px] text-[#64748B]">
            Standardized Survey of India boundary models
          </p>
        </div>

        <div className="bg-white border border-[#D5DCE0] rounded-lg p-5 space-y-1 shadow-xs">
          <span className="text-xs font-medium text-[#475569] block">
            Statutory Classification
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#0B1F33]">
            BNS + SLL
          </div>
          <p className="text-[11px] text-[#64748B]">
            IPC/Bharatiya Nyaya Sanhita &amp; Special and Local Laws
          </p>
        </div>

        <div className="bg-white border border-[#D5DCE0] rounded-lg p-5 space-y-1 shadow-xs">
          <span className="text-xs font-medium text-[#475569] block">
            Emergency Dispatch Line
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#D92D20]">
            Dial 112
          </div>
          <p className="text-[11px] text-[#64748B]">
            Pan-India single toll-free emergency response
          </p>
        </div>
      </section>

      {/* Information Architecture Modules Grid (6 Pillars) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#0B1F33]">
            Platform Modules &amp; Information Architecture
          </h2>
          <p className="text-sm text-[#475569] mt-0.5">
            A structured breakdown of Averti’s research tools and functional registries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Crime Statistics */}
          <div className="bg-white border border-[#D5DCE0] rounded-lg p-6 space-y-3 hover:border-[#0F766E] transition-all hover:shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-md bg-[#0F766E]/10 border border-[#0F766E]/20 flex items-center justify-center text-[#0F766E]">
                <Map className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-serif text-[#0B1F33]">
                Crime Statistics Explorer
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Interactive choropleth cartography presenting official NCRB registered rates, state-by-state quintile rankings, and 3-year historical trajectories (2022–2024).
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('atlas')}
              className="text-xs font-semibold text-[#0F766E] hover:underline inline-flex items-center gap-1 pt-2 cursor-pointer"
            >
              <span>Explore interactive map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Public Notices */}
          <div className="bg-white border border-[#D5DCE0] rounded-lg p-6 space-y-3 hover:border-[#0F766E] transition-all hover:shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-md bg-[#0F766E]/10 border border-[#0F766E]/20 flex items-center justify-center text-[#0F766E]">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-serif text-[#0B1F33]">
                Public Notices Registry
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Centralized missing-person notices and official agency lookouts with verified issuing authorities, published timestamps, and direct portal links.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('notices')}
              className="text-xs font-semibold text-[#0F766E] hover:underline inline-flex items-center gap-1 pt-2 cursor-pointer"
            >
              <span>View missing &amp; wanted notices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Safety Resources */}
          <div className="bg-white border border-[#D5DCE0] rounded-lg p-6 space-y-3 hover:border-[#0F766E] transition-all hover:shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-md bg-[#D92D20]/10 border border-[#D92D20]/20 flex items-center justify-center text-[#D92D20]">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-serif text-[#0B1F33]">
                Safety Resources &amp; 112
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Operational matrix of verified national emergency response helplines: 112 ERSS, 1930 Cyber Fraud Helpline, 1098 Childline, and 181 Women in Distress.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('emergency')}
              className="text-xs font-semibold text-[#D92D20] hover:underline inline-flex items-center gap-1 pt-2 cursor-pointer"
            >
              <span>Access emergency directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 4: Research & Insights */}
          <div className="bg-white border border-[#D5DCE0] rounded-lg p-6 space-y-3 hover:border-[#0F766E] transition-all hover:shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-md bg-[#0F766E]/10 border border-[#0F766E]/20 flex items-center justify-center text-[#0F766E]">
                <Newspaper className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-serif text-[#0B1F33]">
                Research &amp; Insights
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Source-attributed journalistic and policy analysis on India’s transition to the Bharatiya Nyaya Sanhita (BNS), digital arrest scams, and Supreme Court directives.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('reports')}
              className="text-xs font-semibold text-[#0F766E] hover:underline inline-flex items-center gap-1 pt-2 cursor-pointer"
            >
              <span>Read research articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 5: Sources & Methodology */}
          <div className="bg-white border border-[#D5DCE0] rounded-lg p-6 space-y-3 hover:border-[#0F766E] transition-all hover:shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-md bg-[#0F766E]/10 border border-[#0F766E]/20 flex items-center justify-center text-[#0F766E]">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-serif text-[#0B1F33]">
                Methodology &amp; Data Sources
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Transparent documentation of statistical normalization formulas, reporting variances across states, primary citations, and data dictionary.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('sources')}
              className="text-xs font-semibold text-[#0F766E] hover:underline inline-flex items-center gap-1 pt-2 cursor-pointer"
            >
              <span>Review methodology</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 6: About & Author */}
          <div className="bg-white border border-[#D5DCE0] rounded-lg p-6 space-y-3 hover:border-[#0F766E] transition-all hover:shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-md bg-[#0F766E]/10 border border-[#0F766E]/20 flex items-center justify-center text-[#0F766E]">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-serif text-[#0B1F33]">
                About Averti &amp; Ethics
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Civic mission, project development background, author profile (made by Priyash Priyal Jena), and public correction workflow.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className="text-xs font-semibold text-[#0F766E] hover:underline inline-flex items-center gap-1 pt-2 cursor-pointer"
            >
              <span>About the project</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Strategic Research Note for Evaluators */}
      <section className="bg-[#F0FDFA] border border-[#0F766E]/20 rounded-xl p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0F766E] uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4" />
          <span>Core Analytical &amp; Operational Principles</span>
        </div>

        <h3 className="text-xl font-bold font-serif text-[#0B1F33]">
          Why Population Normalization Matters in Civic Analytics
        </h3>

        <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
          Comparing raw FIR registration counts between high-population states (e.g., Uttar Pradesh with 23+ crore residents) and smaller states or Union Territories introduces severe statistical distortion. Averti standardizes all state and territory evaluations to <strong>Registered Cases per 1 Lakh Population</strong>. Furthermore, the platform strictly contextualizes that higher registration rates frequently correlate with proactive police registration drives, online e-FIR accessibility, and higher citizen reporting trust, rather than an absolute indicator of danger.
        </p>
      </section>
    </div>
  );
};

export default OverviewSection;
