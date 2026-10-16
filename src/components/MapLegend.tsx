import React, { useState, useMemo } from 'react';
import {
  Info,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Layers,
  Sparkles,
  Flame
} from 'lucide-react';
import {
  MAP_RAMP_COLORS,
  NO_DATA_COLOR,
  BAND_NAMES,
  getQuintileLegendRanges,
  getSortedStatesByRate,
  STATE_CRIME_MAP,
  getStateBandIndex,
  ALL_INDIA_OVERALL,
  CRIME_DENSITY_HEATMAP_STOPS,
  getDensityLevelLabel
} from '../data/crimeData';

export interface MapLegendProps {
  selectedState?: string | null;
  selectedDistrict?: string | null;
  hoveredRegion?: {
    name: string;
    type: 'state' | 'district';
    stateName?: string;
    rate?: number | null;
    count?: number | null;
    quintile?: number;
    hasRealData?: boolean;
    densityLabel?: string;
  } | null;
  basemapStyle?: 'dual' | 'satellite' | 'osm' | string;
  activeBandFilter?: number | null;
  onSelectBandFilter?: (bandIndex: number | null) => void;
  showDensityLayer?: boolean;
  onToggleDensityLayer?: (show: boolean) => void;
  className?: string;
  defaultExpanded?: boolean;
}

export const MapLegend: React.FC<MapLegendProps> = ({
  selectedState = null,
  selectedDistrict = null,
  hoveredRegion = null,
  basemapStyle = 'dual',
  activeBandFilter = null,
  onSelectBandFilter,
  showDensityLayer = false,
  onToggleDensityLayer,
  className = '',
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [showLogicInfo, setShowLogicInfo] = useState<boolean>(false);
  const [inspectedBandIdx, setInspectedBandIdx] = useState<number | null>(null);

  // Dynamic quintile ranges strictly computed from single source of truth
  const quintileRanges = useMemo(() => getQuintileLegendRanges(), []);

  // Map of states grouped by quintile band for quick drilldown
  const statesByBand = useMemo(() => {
    const sorted = getSortedStatesByRate();
    const n = sorted.length;
    const map: Record<number, { name: string; rate: number }[]> = {};
    for (let b = 0; b < 5; b++) {
      const startIdx = Math.floor((b * n) / 5);
      const endIdx = Math.floor(((b + 1) * n) / 5);
      map[b] = sorted.slice(startIdx, endIdx).map(name => ({
        name,
        rate: STATE_CRIME_MAP[name]?.rate ?? 0
      }));
    }
    return map;
  }, []);

  // Determine active band for the currently hovered or selected region
  const activeBandIndex = useMemo(() => {
    // 1. Hovered state or district with valid quintile/rate
    if (hoveredRegion) {
      if (typeof hoveredRegion.quintile === 'number') {
        return Math.min(4, Math.max(0, hoveredRegion.quintile - 1));
      }
      if (typeof hoveredRegion.rate === 'number' && !isNaN(hoveredRegion.rate)) {
        // Find which band contains this rate
        for (let i = 0; i < quintileRanges.length; i++) {
          const q = quintileRanges[i];
          if (hoveredRegion.rate >= q.min && hoveredRegion.rate <= q.max) {
            return i;
          }
        }
        if (hoveredRegion.rate < quintileRanges[0].min) return 0;
        if (hoveredRegion.rate > quintileRanges[4].max) return 4;
      }
      if (hoveredRegion.type === 'state') {
        return getStateBandIndex(hoveredRegion.name);
      }
    }

    // 2. Selected state
    if (selectedState) {
      return getStateBandIndex(selectedState);
    }

    return -1;
  }, [hoveredRegion, selectedState, quintileRanges]);

  // Active region readout label
  const activeRegionLabel = useMemo(() => {
    if (hoveredRegion) {
      const typeLabel = hoveredRegion.type === 'district' ? 'District' : 'State';
      const rateText = typeof hoveredRegion.rate === 'number'
        ? `${hoveredRegion.rate.toFixed(1)}/1L`
        : 'Pending data';
      return {
        prefix: 'Inspecting',
        name: hoveredRegion.name,
        type: typeLabel,
        rate: rateText,
        isDistrict: hoveredRegion.type === 'district'
      };
    }
    if (selectedState) {
      const stat = STATE_CRIME_MAP[selectedState];
      return {
        prefix: 'Selected',
        name: selectedState,
        type: 'State',
        rate: stat?.rate ? `${stat.rate.toFixed(1)}/1L` : '',
        isDistrict: false
      };
    }
    return null;
  }, [hoveredRegion, selectedState]);

  // Is satellite basemap mode active?
  const isSatellite = basemapStyle === 'satellite';

  // Toggle filter
  const handleBandClick = (idx: number) => {
    if (onSelectBandFilter) {
      onSelectBandFilter(activeBandFilter === idx ? null : idx);
    } else {
      setInspectedBandIdx(prev => (prev === idx ? null : idx));
    }
  };

  const currentInspectedBand = activeBandFilter !== null ? activeBandFilter : inspectedBandIdx;

  const activeRate = useMemo(() => {
    if (hoveredRegion && typeof hoveredRegion.rate === 'number' && !isNaN(hoveredRegion.rate)) {
      return hoveredRegion.rate;
    }
    if (selectedState && STATE_CRIME_MAP[selectedState]?.rate) {
      return STATE_CRIME_MAP[selectedState].rate;
    }
    return null;
  }, [hoveredRegion, selectedState]);

  const activeDensityMarkerPercent = useMemo(() => {
    if (activeRate === null) return null;
    return Math.max(0, Math.min(100, ((activeRate - 300) / (520 - 300)) * 100));
  }, [activeRate]);

  return (
    <div
      role="region"
      aria-label={showDensityLayer ? "District Crime Density Heatmap Legend" : "Crime Rate Quintile Map Legend"}
      className={`absolute bottom-3 left-3 z-[1000] w-[275px] sm:w-[310px] max-w-[calc(100vw-24px)] rounded-xl border transition-all duration-200 select-none shadow-lg text-[11px] ${
        isSatellite
          ? 'bg-[#0B1F33]/92 backdrop-blur-md border-white/20 text-white shadow-black/40'
          : 'bg-white/95 backdrop-blur-md border-[#D5DCE0] text-[#0B1F33] shadow-slate-900/10'
      } ${className}`}
    >
      {/* Top Header Row */}
      <div className={`px-3 py-2 border-b flex items-center justify-between gap-1.5 ${
        isSatellite ? 'border-white/15' : 'border-[#D5DCE0]/80'
      }`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              showDensityLayer
                ? 'bg-rose-500 ring-2 ring-rose-500/20'
                : isSatellite ? 'bg-teal-400 ring-2 ring-teal-400/30' : 'bg-[#0F766E] ring-2 ring-[#0F766E]/20'
            }`}
          />
          <div className="min-w-0">
            <h4 className="font-semibold text-xs leading-none truncate flex items-center gap-1">
              <span>{showDensityLayer ? 'Crime Density Heatmap' : 'Map Legend: Crime Rate'}</span>
            </h4>
            <p className={`text-[10px] leading-tight mt-0.5 truncate ${
              isSatellite ? 'text-slate-300' : 'text-[#64748B]'
            }`}>
              {showDensityLayer ? 'Subtle choropleth heatmap gradient' : 'Registered cases per 1 lakh (5 Quintiles)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Shading Logic Explainer Info Toggle */}
          <button
            type="button"
            onClick={() => setShowLogicInfo(prev => !prev)}
            className={`p-1 rounded transition-colors cursor-pointer ${
              showLogicInfo
                ? (isSatellite ? 'bg-white/20 text-teal-300' : showDensityLayer ? 'bg-rose-100 text-rose-700' : 'bg-[#0F766E]/10 text-[#0F766E]')
                : (isSatellite ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-[#64748B] hover:text-[#0B1F33] hover:bg-[#F6F8F7]')
            }`}
            title="How map shading works"
            aria-label="View shading logic explanation"
            aria-expanded={showLogicInfo}
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          {/* Expand / Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(prev => !prev)}
            className={`p-1 rounded transition-colors cursor-pointer ${
              isSatellite
                ? 'text-slate-300 hover:text-white hover:bg-white/10'
                : 'text-[#64748B] hover:text-[#0B1F33] hover:bg-[#F6F8F7]'
            }`}
            title={isExpanded ? 'Collapse legend' : 'Expand legend'}
            aria-label={isExpanded ? 'Collapse legend' : 'Expand legend'}
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Shading Logic Explanation Popover / Panel */}
      {showLogicInfo && (
        <div className={`p-2.5 mx-2 my-2 rounded-lg border text-[10px] leading-snug space-y-1.5 ${
          isSatellite
            ? 'bg-slate-900/90 border-teal-500/30 text-slate-200'
            : showDensityLayer
              ? 'bg-[#FFF7ED]/95 border-orange-300/50 text-[#9A3412]'
              : 'bg-[#F0FDF4]/90 border-[#0F766E]/30 text-[#0F766E]'
        }`}>
          <div className="flex items-start justify-between gap-1 font-semibold text-[11px]">
            <span className="flex items-center gap-1">
              {showDensityLayer ? (
                <>
                  <Flame className="w-3 h-3 text-rose-500 shrink-0" />
                  <span>District Density Gradient</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-[#0F766E] shrink-0" />
                  <span>Shading Logic & Quintiles</span>
                </>
              )}
            </span>
            <button
              type="button"
              onClick={() => setShowLogicInfo(false)}
              className="hover:opacity-75 cursor-pointer p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          {showDensityLayer ? (
            <>
              <p className={isSatellite ? 'text-slate-300' : 'text-[#334155]'}>
                <strong>Continuous Density Heatmap:</strong> Renders a subtle choropleth gradient from soft cream-yellow (lowest crime density) to deep crimson ruby (highest density) based on verified district rates per 100k population.
              </p>
              <p className={isSatellite ? 'text-slate-300' : 'text-[#334155]'}>
                <strong>Centroid Anchors:</strong> Permanent typography badges sit at each district&apos;s exact geometric centroid, remaining readable over the heat colors.
              </p>
            </>
          ) : (
            <>
              <p className={isSatellite ? 'text-slate-300' : 'text-[#334155]'}>
                <strong>Why 5 Tiers?</strong> India&apos;s 36 States and UTs are ranked by registered crimes per 1 lakh residents and grouped into 5 equal 20% bins (~7 jurisdictions each).
              </p>
              <p className={isSatellite ? 'text-slate-300' : 'text-[#334155]'}>
                <strong>Interpretation:</strong> Lighter cream tones reflect lowest registered crime volume, transitioning to deeper terracotta for the highest 20%. Higher registration rates reflect reporting willingness rather than underlying danger.
              </p>
            </>
          )}
          <div className="pt-0.5 flex items-center justify-between text-[9px] text-[#64748B] border-t border-black/10 dark:border-white/10">
            <span>Source: NCRB 2024</span>
            <span className="font-medium text-[#0F766E]">National Avg: {ALL_INDIA_OVERALL.rate}</span>
          </div>
        </div>
      )}

      {/* Stepped Continuous Color Ramp Bar (Always visible) */}
      <div className="px-3 pt-2 pb-1.5">
        <div className="flex items-center justify-between text-[10px] mb-1 tabular-nums">
          <span className={isSatellite ? 'text-slate-300' : 'text-[#64748B]'}>
            {showDensityLayer ? 'Low (300.0)' : 'Low (42.7)'}
          </span>
          <span
            className={`font-semibold ${
              showDensityLayer
                ? (isSatellite ? 'text-orange-300' : 'text-orange-600')
                : (isSatellite ? 'text-teal-300' : 'text-[#0F766E]')
            }`}
            title={showDensityLayer ? "District median rate is ~408.6 cases per 100k" : "National baseline rate is 418.9 registered cases per 100k population"}
          >
            {showDensityLayer ? 'District Median: ~408.6' : 'India Avg: 418.9'}
          </span>
          <span className={isSatellite ? 'text-slate-300' : 'text-[#64748B]'}>
            {showDensityLayer ? 'Peak (518.3)' : 'High (1,389.0)'}
          </span>
        </div>

        {/* Continuous Bar with Marker */}
        <div className="relative">
          {showDensityLayer ? (
            <div className="relative h-2.5 rounded-md overflow-hidden border border-black/15 shadow-2xs" style={{ background: 'linear-gradient(to right, #FEF08A 0%, #FBBF24 25%, #F97316 50%, #EF4444 75%, #991B1B 100%)' }}>
              {activeDensityMarkerPercent !== null && (
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-black ring-1 ring-white shadow-sm z-20 transition-all duration-200"
                  style={{ left: `calc(${activeDensityMarkerPercent}% - 3px)` }}
                  title={`Active rate: ${activeRate?.toFixed(1)}/1L`}
                />
              )}
            </div>
          ) : (
            <div className="h-2.5 rounded-md flex overflow-hidden border border-black/15 shadow-2xs">
              {quintileRanges.map((range, idx) => {
                const isBandActive = activeBandIndex === idx;
                const isFiltered = currentInspectedBand !== null && currentInspectedBand !== idx;

                return (
                  <div
                    key={idx}
                    onClick={() => handleBandClick(idx)}
                    className={`flex-1 relative cursor-pointer transition-all duration-150 ${
                      isFiltered ? 'opacity-35' : 'opacity-100'
                    }`}
                    style={{ backgroundColor: range.color }}
                    title={`Quintile ${idx + 1}: ${range.bandName} (${range.min.toFixed(1)} – ${range.max.toFixed(1)})`}
                  >
                    {isBandActive && (
                      <div className="absolute inset-0 ring-2 ring-[#0F766E] ring-offset-1 z-10" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Real-Time "On The Fly" Active Region Banner */}
      {activeRegionLabel && (
        <div className={`mx-3 my-1 px-2.5 py-1 rounded-md text-[10px] flex items-center justify-between gap-1.5 border transition-all ${
          showDensityLayer
            ? (isSatellite ? 'bg-rose-950/60 border-rose-500/40 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900')
            : isSatellite
              ? 'bg-teal-950/60 border-teal-500/40 text-teal-200'
              : 'bg-[#F0FDF4] border-[#0F766E]/30 text-[#0F766E]'
        }`}>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse shrink-0 ${
              showDensityLayer ? 'bg-rose-500' : 'bg-[#0F766E]'
            }`} />
            <span className="truncate">
              <strong>{activeRegionLabel.name}</strong>
              <span className={`ml-1 text-[9px] opacity-80 ${isSatellite ? 'text-slate-300' : 'text-[#64748B]'}`}>
                ({activeRegionLabel.type})
              </span>
            </span>
          </div>
          <div className="shrink-0 font-bold tabular-nums flex items-center gap-1">
            <span>
              {activeRegionLabel.rate || (
                <span className="italic font-normal opacity-80">Data pending</span>
              )}
            </span>
            {showDensityLayer && activeRate !== null && (
              <span className={`text-[9px] px-1 py-0.2 rounded font-semibold ${
                isSatellite ? 'bg-white/20 text-white' : 'bg-rose-200/90 text-rose-950'
              }`}>
                {getDensityLevelLabel(activeRate).label}
              </span>
            )}
            {!showDensityLayer && activeBandIndex >= 0 && (
              <span className="text-[9px] font-medium opacity-90">
                • Q{activeBandIndex + 1}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Expanded Breakdown Rows */}
      {isExpanded && (
        <div className="px-3 pb-2.5 pt-1 space-y-1">
          {showDensityLayer ? (
            /* Density Stops Breakdown */
            <div className="space-y-1 pt-0.5">
              {CRIME_DENSITY_HEATMAP_STOPS.map((stop, idx) => {
                const isActive = activeRate !== null && (
                  idx === 0 ? activeRate < 330 :
                  idx === 1 ? activeRate >= 330 && activeRate < 380 :
                  idx === 2 ? activeRate >= 380 && activeRate < 435 :
                  idx === 3 ? activeRate >= 435 && activeRate < 485 :
                  activeRate >= 485
                );

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between px-2 py-1 rounded-md border text-[10px] transition-all ${
                      isActive
                        ? (isSatellite
                            ? 'bg-rose-500/20 border-rose-400 font-semibold'
                            : 'bg-rose-50 border-rose-400 text-rose-950 font-semibold')
                        : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-xs shrink-0 border border-black/20"
                        style={{ backgroundColor: stop.color }}
                      />
                      <span>{stop.label} Density</span>
                    </div>
                    <span className="tabular-nums font-mono text-[9px] opacity-80">
                      ~{stop.rate} / 1L
                    </span>
                  </div>
                );
              })}

              {/* Mode switch helper button */}
              {onToggleDensityLayer && (
                <button
                  type="button"
                  onClick={() => onToggleDensityLayer(false)}
                  className={`w-full mt-1.5 py-1 px-2 rounded text-[10px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                    isSatellite
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-[#0B1F33]'
                  }`}
                >
                  <Layers className="w-3 h-3 text-[#0F766E]" />
                  <span>Switch back to Quintile Bands</span>
                </button>
              )}
            </div>
          ) : (
            /* Quintile Breakdown */
            <>
              {quintileRanges.map((range, idx) => {
                const isBandActive = activeBandIndex === idx;
                const isInspected = currentInspectedBand === idx;
                const isFaded = currentInspectedBand !== null && !isInspected;

                return (
                  <div key={idx} className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => handleBandClick(idx)}
                      className={`w-full text-left flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        isBandActive
                          ? (isSatellite
                              ? 'bg-teal-500/20 border-teal-400 font-semibold shadow-xs'
                              : 'bg-[#0F766E]/10 border-[#0F766E] font-semibold shadow-xs')
                          : isInspected
                            ? (isSatellite
                                ? 'bg-white/15 border-white/40 font-semibold'
                                : 'bg-slate-100 border-[#94A3B8] font-semibold')
                            : isFaded
                              ? 'opacity-40 border-transparent'
                              : (isSatellite
                                  ? 'hover:bg-white/10 border-transparent'
                                  : 'hover:bg-[#F6F8F7] border-transparent')
                      }`}
                      aria-pressed={isInspected || isBandActive}
                      aria-label={`Quintile ${idx + 1}: ${range.bandName}, ${range.min.toFixed(1)} to ${range.max.toFixed(1)} cases per 1 lakh population`}
                    >
                      {/* Left: Swatch and Quintile Band Name */}
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-3.5 h-3.5 rounded-xs shrink-0 border transition-transform ${
                            isBandActive ? 'scale-110 ring-2 ring-[#0F766E]' : 'border-black/15'
                          }`}
                          style={{ backgroundColor: range.color }}
                        />
                        <div className="truncate">
                          <div className="flex items-center gap-1 leading-none">
                            <span className="font-semibold">Q{idx + 1}</span>
                            <span className={`text-[10px] ${
                              isSatellite ? 'text-slate-300' : 'text-[#64748B]'
                            }`}>
                              • {range.bandName}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Value Range & State Count */}
                      <div className="flex items-center gap-1.5 shrink-0 tabular-nums text-right">
                        <span className="font-medium">
                          {range.min.toFixed(1)}–{range.max.toFixed(1)}
                        </span>
                        <span className={`text-[9px] px-1 py-0.5 rounded ${
                          isSatellite ? 'bg-white/10 text-slate-300' : 'bg-black/5 text-[#64748B]'
                        }`}>
                          {range.statesCount}
                        </span>
                      </div>
                    </button>

                    {/* Drilldown: Expanded states list when band is inspected */}
                    {isInspected && statesByBand[idx] && (
                      <div className={`mt-1 mb-1 p-2 rounded-md border text-[10px] space-y-1 ${
                        isSatellite
                          ? 'bg-black/40 border-white/15 text-slate-200'
                          : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#334155]'
                      }`}>
                        <div className="flex items-center justify-between font-semibold text-[10px] border-b border-black/10 dark:border-white/10 pb-0.5">
                          <span>Jurisdictions in Quintile {idx + 1}</span>
                          <span className="text-[9px] text-[#64748B] font-normal">
                            Rate per 1L
                          </span>
                        </div>
                        <div className="max-h-28 overflow-y-auto space-y-0.5 pr-1">
                          {statesByBand[idx].map(st => (
                            <div
                              key={st.name}
                              className="flex items-center justify-between py-0.5 hover:bg-black/5 rounded px-1 transition-colors"
                            >
                              <span className={`truncate ${
                                selectedState === st.name ? 'font-bold text-[#0F766E]' : ''
                              }`}>
                                {st.name}
                              </span>
                              <span className="tabular-nums font-medium shrink-0 ml-1">
                                {st.rate.toFixed(1)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* District Pending Baseline Indicator (Gray band) */}
              <div className={`pt-1.5 border-t flex items-center justify-between text-[10px] ${
                isSatellite ? 'border-white/15 text-slate-300' : 'border-[#D5DCE0]/80 text-[#64748B]'
              }`}>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-xs shrink-0 border border-black/15"
                    style={{ backgroundColor: NO_DATA_COLOR }}
                  />
                  <span className="italic">
                    District baseline pending
                  </span>
                </div>
                <span className="text-[9px] opacity-75">
                  Gray shade
                </span>
              </div>

              {/* Filter Reset Button if band filter is active */}
              {currentInspectedBand !== null && (
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectBandFilter) onSelectBandFilter(null);
                    setInspectedBandIdx(null);
                  }}
                  className={`w-full mt-1.5 py-1 px-2 rounded text-[10px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                    isSatellite
                      ? 'bg-white/15 hover:bg-white/25 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-[#0B1F33]'
                  }`}
                >
                  <X className="w-3 h-3" />
                  <span>Clear Quintile Selection</span>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MapLegend;
