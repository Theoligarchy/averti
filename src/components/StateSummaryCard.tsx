import React, { useState, useMemo } from 'react';
import {
  ALL_INDIA_OVERALL,
  STATE_CRIME_MAP,
  get3YearTrendData,
  formatIndianNumber,
  getStateBandIndex,
  BAND_NAMES,
  getCrimeCategoryBreakdown
} from '../data/crimeData';
import {
  RotateCcw,
  MapPin,
  PieChart,
  Info,
  Building2,
  Calendar
} from 'lucide-react';
import { getDistrictFeature } from '../data/indiaGeoData';
import { StateSummaryCardSkeleton } from './Skeletons';

export interface StateSummaryCardProps {
  selectedState: string | null;
  selectedDistrict?: string | null;
  onResetToIndia: () => void;
  onResetDistrict?: () => void;
  onOpenDetailedStats?: () => void;
  isLoading?: boolean;
}

export const StateSummaryCard: React.FC<StateSummaryCardProps> = ({
  selectedState,
  selectedDistrict,
  onResetToIndia,
  onResetDistrict,
  onOpenDetailedStats,
  isLoading = false
}) => {
  const [hoveredCatId, setHoveredCatId] = useState<string | null>(null);
  const [pinnedCatId, setPinnedCatId] = useState<string | null>(null);

  const isStateSelected = Boolean(selectedState);
  const isDistrictSelected = Boolean(selectedState && selectedDistrict);

  // Look up district feature if selected
  const districtFeature = (selectedState && selectedDistrict)
    ? getDistrictFeature(selectedState, selectedDistrict)
    : null;

  const displayName = isDistrictSelected
    ? `${districtFeature?.properties?.name || selectedDistrict}, ${selectedState}`
    : (selectedState || 'India (overall)');

  // 2024 state metrics loaded strictly from verified NCRB 2024 dataset
  const currentStateData = isStateSelected && selectedState
    ? STATE_CRIME_MAP[selectedState]
    : ALL_INDIA_OVERALL;

  const total2024 = currentStateData?.count ?? 0;
  const rate2024 = currentStateData?.rate ?? 0;

  // 3-Year official trajectory (2022, 2023, 2024)
  const trendPoints = useMemo(() => {
    return get3YearTrendData(selectedState);
  }, [selectedState]);

  // Validated crime category breakdown from NCRB standard classification
  const categories = useMemo(() => {
    return getCrimeCategoryBreakdown(
      selectedState || 'All India',
      total2024,
      rate2024
    );
  }, [selectedState, total2024, rate2024]);

  const activeCatId = hoveredCatId || pinnedCatId;
  const activeCategory = useMemo(() => {
    return categories.find(c => c.id === activeCatId) || null;
  }, [categories, activeCatId]);

  // Quintile Band
  const stateBandIndex = isStateSelected ? getStateBandIndex(selectedState) : -1;
  const bandLabel = stateBandIndex >= 0 ? BAND_NAMES[stateBandIndex] : 'National baseline';

  if (isLoading) {
    return <StateSummaryCardSkeleton />;
  }

  return (
    <article
      className="bg-white rounded-lg border border-[#D5DCE0] p-4 sm:p-5 shadow-xs space-y-4"
      aria-labelledby="summary-card-title"
    >
      {/* Header: Area Title, Classification & Reset */}
      <div className="flex items-start justify-between gap-3 border-b border-[#D5DCE0]/70 pb-3">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-[#475569] flex-wrap">
            <MapPin className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
            <span className="font-medium text-[#0B1F33]">
              {isDistrictSelected
                ? 'District & State Overview'
                : isStateSelected
                ? 'State Statistics'
                : 'National Baseline'}
            </span>
            <span aria-hidden="true">·</span>
            <span>NCRB 2024</span>
          </div>

          <h2
            id="summary-card-title"
            className="text-lg sm:text-xl font-bold font-serif text-[#0B1F33] truncate"
            title={displayName}
          >
            {isDistrictSelected ? (districtFeature?.properties?.name || selectedDistrict) : displayName}
          </h2>

          {isDistrictSelected && (
            <p className="text-xs text-[#475569]">
              District in <strong>{selectedState}</strong>
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isDistrictSelected && onResetDistrict && (
            <button
              type="button"
              onClick={onResetDistrict}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#475569] bg-[#F1F5F9] hover:bg-[#E2E8F0] hover:text-[#0B1F33] rounded transition-colors cursor-pointer"
              title={`Return to whole ${selectedState} view`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>{selectedState}</span>
            </button>
          )}

          {isStateSelected && (
            <button
              type="button"
              onClick={onResetToIndia}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0F766E] bg-[#E8F0EE] hover:bg-[#0F766E] hover:text-white rounded transition-colors cursor-pointer"
              title="Reset view to whole India map"
            >
              <RotateCcw className="w-3 h-3" />
              <span>All India</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Key Metrics: Registered Cases & Rate Per Lakh */}
      <div className="grid grid-cols-2 gap-3">
        {/* Metric 1: Registered Cases */}
        <div className="bg-[#F6F8F7] rounded-md p-3 border border-[#D5DCE0]/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#475569]">
              Registered cases (2024)
            </span>
            <Building2 className="w-3 h-3 text-[#64748B]" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-[#0B1F33] tabular-nums tracking-tight">
            {formatIndianNumber(total2024)}
          </div>
          <span className="block text-[10px] text-[#64748B]">
            IPC/BNS &amp; SLL FIRs
          </span>
        </div>

        {/* Metric 2: Registered Cases Per 1 Lakh Population */}
        <div className="bg-[#F6F8F7] rounded-md p-3 border border-[#D5DCE0]/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#475569]">
              Rate per 1 lakh pop.
            </span>
            <Info className="w-3 h-3 text-[#64748B]" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-[#0F766E] tabular-nums tracking-tight">
            {rate2024.toFixed(1)}
          </div>
          <span className="block text-[10px] text-[#64748B] truncate">
            {isStateSelected ? `Band: ${bandLabel}` : 'National baseline rate'}
          </span>
        </div>
      </div>

      {/* Statutory Data Source & Citation (Required by Prompt) */}
      <div className="text-[11px] text-[#475569] bg-[#F6F8F7] p-2.5 rounded border border-[#D5DCE0]/60 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#0B1F33]">Data Source &amp; Reporting Year:</span>
          <span className="font-mono text-[#0F766E] font-medium">NCRB 2024</span>
        </div>
        <p className="text-[10px] leading-relaxed text-[#64748B]">
          National Crime Records Bureau (NCRB), Ministry of Home Affairs, Government of India. Table 1A.1 &amp; Table 1A.3.
        </p>
      </div>

      {/* Validated Crime Category Composition (Interactive with Hover Tooltips) */}
      <div className="space-y-2 pt-1 border-t border-[#D5DCE0]/60">
        <div className="flex items-center justify-between flex-wrap gap-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0B1F33]">
            <PieChart className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Category Composition (NCRB 2024)</span>
          </div>
          <span className="text-[10px] text-[#64748B]">
            Hover segments for details
          </span>
        </div>

        {/* Interactive Stacked Horizontal Bar */}
        <div className="relative pt-1">
          <div
            role="region"
            aria-label="Crime category distribution bar"
            className="h-6 w-full rounded overflow-hidden flex bg-slate-200/80 p-0.5 border border-[#D5DCE0]"
          >
            {categories.map((cat) => {
              const isHovered = activeCatId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  aria-label={`${cat.name}: ${cat.percentage}% of registered cases`}
                  onMouseEnter={() => setHoveredCatId(cat.id)}
                  onMouseLeave={() => setHoveredCatId(null)}
                  onFocus={() => setHoveredCatId(cat.id)}
                  onBlur={() => setHoveredCatId(null)}
                  onClick={() => setPinnedCatId(prev => (prev === cat.id ? null : cat.id))}
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: cat.color
                  }}
                  className={`h-full transition-all duration-150 relative cursor-pointer focus:outline-none ${
                    isHovered
                      ? 'brightness-110 z-10 scale-y-105'
                      : activeCatId ? 'opacity-40' : 'opacity-95 hover:opacity-100'
                  }`}
                />
              );
            })}
          </div>

          {/* Interactive Floating Hover Tooltip */}
          {activeCategory && (
            <div
              role="tooltip"
              className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-72 sm:w-80 bg-[#0B1F33] text-white text-xs rounded-lg p-3 shadow-xl border border-slate-700 pointer-events-none transition-all duration-150 animate-in fade-in"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-700 pb-1.5 mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: activeCategory.color }}
                  />
                  <span className="font-bold text-[12px] text-white truncate">
                    {activeCategory.name}
                  </span>
                </div>
                <span className="text-[10px] text-slate-300 font-mono bg-slate-800 px-1 py-0.5 rounded">
                  {activeCategory.ncrbChapter}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-800/80 rounded p-2 mb-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">Category Share</span>
                  <span className="text-base font-bold text-emerald-400 tabular-nums">
                    {activeCategory.percentage.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Estimated Cases</span>
                  <span className="text-base font-bold text-white tabular-nums">
                    {formatIndianNumber(activeCategory.count)}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-[10px] text-slate-300">
                <div>
                  <span className="text-slate-400 font-semibold">Statutes: </span>
                  <span className="font-mono text-slate-200">{activeCategory.keySections}</span>
                </div>
                <p className="text-slate-400 italic pt-1 border-t border-slate-800">
                  {activeCategory.reportingNote}
                </p>
              </div>

              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0B1F33]" />
            </div>
          )}
        </div>

        {/* Category Legend Grid */}
        <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
          {categories.slice(0, 4).map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-1.5 rounded bg-[#F6F8F7] border border-[#D5DCE0]/60 text-[#475569]"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2 h-2 rounded-xs shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="truncate">{cat.shortName}</span>
              </div>
              <span className="font-mono font-medium text-[#0B1F33] tabular-nums shrink-0 ml-1">
                {cat.percentage.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3-Year Official Historical Record (2022-2024 NCRB) */}
      <div className="pt-2 border-t border-[#D5DCE0]/60 space-y-1.5">
        <div className="flex items-center justify-between text-xs text-[#475569]">
          <span className="font-semibold text-[#0B1F33] flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>3-Year Registered Trajectory</span>
          </span>
          <span className="text-[10px] text-[#64748B]">Official NCRB returns</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {trendPoints.map((pt) => (
            <div
              key={pt.year}
              className="bg-[#F6F8F7] border border-[#D5DCE0]/60 rounded p-2"
            >
              <span className="text-[10px] text-[#64748B] block font-mono">{pt.year}</span>
              <span className="font-bold text-[#0B1F33] tabular-nums">
                {pt.count !== null ? formatIndianNumber(pt.count) : 'N/A'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory Caveat Required by Specification */}
      <div className="bg-[#FFF7E6] border border-[#B45309]/30 rounded-md p-3 text-xs text-[#0B1F33] leading-relaxed">
        <strong className="text-[#B45309] block mb-0.5">Statistical Caveat:</strong>
        “Registered cases reflect police-recorded incidents, not every crime that occurs. Differences in reporting and recording affect comparisons.”
      </div>

      {/* District Drill-down Explanation if district selected */}
      {isDistrictSelected && (
        <div className="text-[11px] text-[#64748B] italic bg-[#F6F8F7] p-2 rounded border border-[#D5DCE0]/60">
          Note: District-level crime returns are published by individual state police headquarters. Statistics presented above reflect official state-level NCRB aggregates for {selectedState}.
        </div>
      )}

      {/* Methodology Action Button */}
      {onOpenDetailedStats && (
        <button
          type="button"
          onClick={onOpenDetailedStats}
          className="w-full py-2 px-3 text-xs font-semibold text-[#0F766E] hover:text-[#0D655E] bg-[#E8F0EE] hover:bg-[#D4E5E2] rounded-md transition-colors text-center cursor-pointer"
        >
          View NCRB Methodology &amp; Official Data Sources
        </button>
      )}
    </article>
  );
};

export default StateSummaryCard;
