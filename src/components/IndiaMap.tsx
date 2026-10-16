import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  INDIA_MAP_FEATURES,
  StateGeoFeature
} from '../data/indiaMapPaths';
import {
  STATE_CRIME_MAP,
  getStateFillColor,
  getQuintileLegendRanges,
  formatIndianNumber,
  BAND_NAMES,
  getStateBandIndex,
  ALL_INDIA_OVERALL,
  getSortedStatesByRate
} from '../data/crimeData';
import {
  ExternalLink,
  Info,
  Plus,
  Minus,
  RotateCcw,
  Layers,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Keyboard
} from 'lucide-react';

interface IndiaMapProps {
  selectedState: string | null;
  onSelectState: (state: string | null) => void;
  onOpenSourcesModal: () => void;
}

// Intensity qualitative descriptors for accessibility and clarity
const BAND_INTENSITY_DESCRIPTIONS = [
  'Lowest 20% (Low registration)',
  'Lower-Mid (Below average)',
  'Moderate (Median spread)',
  'Higher-Mid (Above average)',
  'Highest 20% (High registration)'
];

// Calculate spatially nearest neighbor for arrow-key navigation across states
function getNextStateByDirection(
  currentName: string | null,
  direction: 'up' | 'down' | 'left' | 'right'
): StateGeoFeature {
  const currentIndex = INDIA_MAP_FEATURES.findIndex(
    f => f.name.toLowerCase() === currentName?.toLowerCase()
  );

  if (currentIndex === -1) {
    const defaultFeature = INDIA_MAP_FEATURES.find(f => f.name === 'Delhi') || INDIA_MAP_FEATURES[0];
    return defaultFeature;
  }

  const currentFeature = INDIA_MAP_FEATURES[currentIndex];
  const [cx, cy] = currentFeature.center;

  const candidates: { feature: StateGeoFeature; score: number }[] = [];

  for (const feature of INDIA_MAP_FEATURES) {
    if (feature.id === currentFeature.id) continue;
    const [tx, ty] = feature.center;
    const dx = tx - cx;
    const dy = ty - cy;

    if (direction === 'right' && dx > 8) {
      // Prioritize East, penalize vertical distance
      const score = Math.hypot(dx, dy) + Math.abs(dy) * 1.5;
      candidates.push({ feature, score });
    } else if (direction === 'left' && dx < -8) {
      // Prioritize West
      const score = Math.hypot(dx, dy) + Math.abs(dy) * 1.5;
      candidates.push({ feature, score });
    } else if (direction === 'down' && dy > 8) {
      // Prioritize South
      const score = Math.hypot(dx, dy) + Math.abs(dx) * 1.5;
      candidates.push({ feature, score });
    } else if (direction === 'up' && dy < -8) {
      // Prioritize North
      const score = Math.hypot(dx, dy) + Math.abs(dx) * 1.5;
      candidates.push({ feature, score });
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => a.score - b.score);
    return candidates[0].feature;
  }

  // Fallback to cyclical sequential index if at boundary
  if (direction === 'right' || direction === 'down') {
    return INDIA_MAP_FEATURES[(currentIndex + 1) % INDIA_MAP_FEATURES.length];
  } else {
    return INDIA_MAP_FEATURES[(currentIndex - 1 + INDIA_MAP_FEATURES.length) % INDIA_MAP_FEATURES.length];
  }
}

export const IndiaMap: React.FC<IndiaMapProps> = ({
  selectedState,
  onSelectState,
  onOpenSourcesModal
}) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [keyboardFocusedState, setKeyboardFocusedState] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [activeLegendBand, setActiveLegendBand] = useState<number | null>(null);
  const [hoveredLegendBand, setHoveredLegendBand] = useState<number | null>(null);
  const [isLegendExpanded, setIsLegendExpanded] = useState<boolean>(true);

  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const svgCanvasRef = useRef<HTMLDivElement>(null);

  const legendRanges = useMemo(() => getQuintileLegendRanges(), []);

  // Effective band highlighted on map (hover takes temporary precedence over click lock)
  const effectiveBand = hoveredLegendBand !== null ? hoveredLegendBand : activeLegendBand;

  // Track which band the hovered or selected state belongs to
  const hoveredStateBand = hoveredState ? getStateBandIndex(hoveredState) : -1;
  const selectedStateBand = selectedState ? getStateBandIndex(selectedState) : -1;
  const stateActiveBand = hoveredStateBand >= 0 ? hoveredStateBand : (selectedStateBand >= 0 ? selectedStateBand : -1);

  // States grouped by quintile band for quick accessible tooltips/lookup
  const statesByBand = useMemo(() => {
    const sorted = getSortedStatesByRate();
    const n = sorted.length;
    const map: Record<number, string[]> = {};
    for (let b = 0; b < 5; b++) {
      const startIdx = Math.floor((b * n) / 5);
      const endIdx = Math.floor(((b + 1) * n) / 5);
      map[b] = sorted.slice(startIdx, endIdx);
    }
    return map;
  }, []);

  // Find selected feature for callout pin
  const selectedFeature = INDIA_MAP_FEATURES.find(
    f => f.name.toLowerCase() === selectedState?.toLowerCase()
  );

  const MIN_ZOOM = 0.75;
  const MAX_ZOOM = 3.2;
  const ZOOM_STEP = 0.35;

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(+(prev + ZOOM_STEP).toFixed(2), MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const next = Math.max(+(prev - ZOOM_STEP).toFixed(2), MIN_ZOOM);
      if (next <= 1) {
        setPanOffset(offset => ({ x: +(offset.x * 0.5).toFixed(1), y: +(offset.y * 0.5).toFixed(1) }));
      }
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Wheel zoom listener with non-passive event registration
  useEffect(() => {
    const canvasElem = svgCanvasRef.current;
    if (!canvasElem) return;

    const onWheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.2 : -0.2;
      setZoomLevel(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, +(prev + delta).toFixed(2))));
    };

    canvasElem.addEventListener('wheel', onWheelHandler, { passive: false });
    return () => {
      canvasElem.removeEventListener('wheel', onWheelHandler);
    };
  }, []);

  const updateTooltipPosition = (clientX: number, clientY: number) => {
    if (svgCanvasRef.current) {
      const rect = svgCanvasRef.current.getBoundingClientRect();
      setTooltipPos({
        x: clientX - rect.left,
        y: clientY - rect.top
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    }
    updateTooltipPosition(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Stats for currently hovered state
  const hoveredStat = hoveredState ? STATE_CRIME_MAP[hoveredState] : null;

  // Comparison with national rate (418.9)
  const nationalRate = ALL_INDIA_OVERALL.rate;
  let diffPercent: number | null = null;
  let isAboveNational = false;
  let isCloseToNational = false;

  if (hoveredStat?.rate !== undefined) {
    const diff = hoveredStat.rate - nationalRate;
    diffPercent = Math.abs((diff / nationalRate) * 100);
    isAboveNational = diff > 0;
    isCloseToNational = diffPercent < 3;
  }

  // Smart tooltip clamping to prevent viewport clipping
  const canvasWidth = svgCanvasRef.current?.clientWidth ?? 800;
  const showBelow = (tooltipPos?.y ?? 0) < 160;
  const clampedX = tooltipPos ? Math.max(140, Math.min(tooltipPos.x, canvasWidth - 140)) : 0;
  const tooltipTop = tooltipPos ? (showBelow ? tooltipPos.y + 16 : tooltipPos.y - 12) : 0;
  const transformClass = showBelow
    ? '-translate-x-1/2'
    : '-translate-x-1/2 -translate-y-full';

  // Focus a specific state element programmatically for keyboard navigation
  const focusStateElement = (feature: StateGeoFeature) => {
    setHoveredState(feature.name);
    setKeyboardFocusedState(feature.name);
    const pathElem = document.getElementById(`state-path-${feature.id}`) as SVGPathElement | null;
    if (pathElem) {
      pathElem.focus();
      const rect = pathElem.getBoundingClientRect();
      if (svgCanvasRef.current) {
        const canvasRect = svgCanvasRef.current.getBoundingClientRect();
        setTooltipPos({
          x: rect.left + rect.width / 2 - canvasRect.left,
          y: rect.top + rect.height / 3 - canvasRect.top
        });
      }
    }
  };

  // Keyboard navigation on individual state paths
  const handleStateKeyDown = (e: React.KeyboardEvent, stateName: string) => {
    let direction: 'up' | 'down' | 'left' | 'right' | null = null;
    if (e.key === 'ArrowUp') direction = 'up';
    else if (e.key === 'ArrowDown') direction = 'down';
    else if (e.key === 'ArrowLeft') direction = 'left';
    else if (e.key === 'ArrowRight') direction = 'right';

    if (direction) {
      e.preventDefault();
      e.stopPropagation();
      const nextFeature = getNextStateByDirection(stateName, direction);
      focusStateElement(nextFeature);
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      const isSelected = selectedState?.toLowerCase() === stateName.toLowerCase();
      onSelectState(isSelected ? null : stateName);
    }
  };

  // Keyboard navigation when the SVG map container itself is focused
  const handleSvgKeyDown = (e: React.KeyboardEvent) => {
    let direction: 'up' | 'down' | 'left' | 'right' | null = null;
    if (e.key === 'ArrowUp') direction = 'up';
    else if (e.key === 'ArrowDown') direction = 'down';
    else if (e.key === 'ArrowLeft') direction = 'left';
    else if (e.key === 'ArrowRight') direction = 'right';

    if (direction) {
      e.preventDefault();
      const currentName = keyboardFocusedState || hoveredState || selectedState;
      const nextFeature = getNextStateByDirection(currentName, direction);
      focusStateElement(nextFeature);
      return;
    }

    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      handleZoomIn();
      return;
    }

    if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      handleZoomOut();
      return;
    }

    if (e.key === '0' || e.key.toLowerCase() === 'r') {
      e.preventDefault();
      handleResetZoom();
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      const currentName = keyboardFocusedState || hoveredState;
      if (currentName) {
        e.preventDefault();
        const isSelected = selectedState?.toLowerCase() === currentName.toLowerCase();
        onSelectState(isSelected ? null : currentName);
      }
    }
  };

  return (
    <div
      ref={mapContainerRef}
      className="relative flex flex-col h-full bg-white rounded-lg border border-[#D5DCE0] shadow-xs select-none overflow-hidden"
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setIsDragging(false);
        setHoveredState(null);
      }}
    >
      {/* Map Sub-Header & Dynamic Legend */}
      <div className="px-5 pt-4 pb-2 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold font-serif text-[#0B1F33] leading-snug">
            Registered cases per 1 lakh population
          </h2>
          <p className="text-xs text-[#475569] mt-0.5">
            NCRB Crime in India 2024 (Table 1A.3) - Thematic Quintile Distribution
          </p>
        </div>

        {/* Dynamic Legend Container */}
        <div
          role="region"
          aria-label="Crime intensity levels legend"
          className="bg-[#F6F8F7]/95 backdrop-blur-xs border border-[#D5DCE0] rounded-lg p-3 text-xs text-[#0B1F33] shadow-xs w-full sm:w-auto sm:min-w-[280px] max-w-sm"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#D5DCE0]/60">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#0F766E]" />
              <span className="font-semibold text-xs text-[#0B1F33]">
                Crime Intensity Levels
              </span>
              <span className="text-[10px] font-medium bg-[#0F766E]/10 text-[#0F766E] px-1.5 py-0.2 rounded">
                5 Quintiles
              </span>
            </div>
            <div className="flex items-center gap-1">
              {activeLegendBand !== null && (
                <button
                  type="button"
                  onClick={() => setActiveLegendBand(null)}
                  className="inline-flex items-center gap-0.5 text-[10px] text-[#0F766E] hover:underline font-medium bg-white px-1.5 py-0.5 rounded border border-[#0F766E]/30 cursor-pointer"
                  title="Clear band filter and show all states"
                  aria-label="Clear band filter"
                >
                  <X className="w-2.5 h-2.5" />
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsLegendExpanded(prev => !prev)}
                className="text-[#475569] hover:text-[#0B1F33] p-0.5 rounded hover:bg-black/5 cursor-pointer"
                title={isLegendExpanded ? 'Collapse legend details' : 'Expand legend details'}
                aria-label={isLegendExpanded ? 'Collapse legend details' : 'Expand legend details'}
                aria-expanded={isLegendExpanded}
              >
                {isLegendExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Stepped Continuous Gradient Bar */}
          <div className="mt-2 mb-1">
            <div className="h-2 rounded-xs flex overflow-hidden border border-black/10">
              {legendRanges.map((range, idx) => (
                <div
                  key={idx}
                  className={`flex-1 transition-opacity cursor-pointer ${
                    effectiveBand !== null && effectiveBand !== idx ? 'opacity-30' : 'opacity-100'
                  }`}
                  style={{ backgroundColor: range.color }}
                  title={`Band ${idx + 1}: ${range.bandName} (${range.min.toFixed(0)} - ${range.max.toFixed(0)})`}
                  onMouseEnter={() => setHoveredLegendBand(idx)}
                  onMouseLeave={() => setHoveredLegendBand(null)}
                  onClick={() => setActiveLegendBand(prev => prev === idx ? null : idx)}
                />
              ))}
            </div>
            <div className="flex justify-between items-center text-[10px] text-[#64748B] mt-0.5 tabular-nums">
              <span>Low (42.7)</span>
              <span className="font-medium text-[#0F766E]" title="All India national baseline rate is 418.9 registered cases per 1 lakh population">
                India avg: 418.9
              </span>
              <span>High (1,360.2)</span>
            </div>
          </div>

          {/* Expanded Quintile Breakdown List */}
          {isLegendExpanded && (
            <div className="mt-2 space-y-1 tabular-nums">
              {legendRanges.map((range, idx) => {
                const isSelectedBand = activeLegendBand === idx;
                const isHoveredBand = hoveredLegendBand === idx;
                const isStateCurrentBand = stateActiveBand === idx;
                const isHighlighted = effectiveBand === idx;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveLegendBand(prev => prev === idx ? null : idx)}
                    onMouseEnter={() => setHoveredLegendBand(idx)}
                    onMouseLeave={() => setHoveredLegendBand(null)}
                    onFocus={() => setHoveredLegendBand(idx)}
                    onBlur={() => setHoveredLegendBand(null)}
                    aria-pressed={isSelectedBand}
                    aria-label={`Band ${idx + 1}: ${range.bandName}, ${range.min.toFixed(1)} to ${range.max.toFixed(1)} cases per 1 lakh population, containing ${range.statesCount} states. ${isSelectedBand ? 'Filter active.' : 'Click to filter map.'}`}
                    className={`w-full text-left flex items-center justify-between gap-2 px-2 py-1.5 rounded text-[11px] transition-all cursor-pointer border ${
                      isSelectedBand
                        ? 'bg-[#0F766E]/10 border-[#0F766E] shadow-2xs font-semibold'
                        : isHoveredBand
                          ? 'bg-slate-100/90 border-[#0F766E]/50'
                          : isStateCurrentBand
                            ? 'bg-[#FFF7E6] border-[#B45309]/40'
                            : 'hover:bg-slate-50 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-3.5 h-3.5 rounded-xs shrink-0 border border-black/15 transition-transform ${
                          isHighlighted ? 'scale-110 ring-1 ring-[#0F766E]' : ''
                        }`}
                        style={{ backgroundColor: range.color }}
                      />
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[#0B1F33]">
                            {range.bandName}
                          </span>
                          <span className="text-[10px] text-[#64748B]">
                            ({BAND_INTENSITY_DESCRIPTIONS[idx].split(' ')[0]})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[#475569] font-medium text-[11px]">
                        {range.min.toFixed(0)} - {range.max.toFixed(0)}
                      </span>
                      <span className="text-[10px] bg-white border border-[#D5DCE0] text-[#475569] px-1.5 py-0.2 rounded font-normal">
                        {range.statesCount}
                      </span>
                    </div>
                  </button>
                );
              })}

              {/* No Data Row */}
              <div className="flex items-center justify-between gap-2 px-2 py-1 text-[11px] border-t border-[#D5DCE0]/60 pt-1.5 text-[#64748B]">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-xs border border-black/10 bg-[#E5E7EB] shrink-0" />
                  <span>No data / Unreported</span>
                </div>
                <span>-</span>
              </div>

              {/* Active State / Filter Prompt */}
              {hoveredState && (
                <div className="pt-1.5 border-t border-[#D5DCE0]/60 text-[10px] text-[#0F766E] font-medium flex items-center justify-between animate-in fade-in duration-100">
                  <span>Current: <strong>{hoveredState}</strong></span>
                  <span className="tabular-nums">
                    {hoveredStat?.rate !== undefined ? `${hoveredStat.rate.toFixed(1)} / lakh` : ''}
                  </span>
                </div>
              )}
              {!hoveredState && activeLegendBand !== null && (
                <div className="pt-1.5 border-t border-[#D5DCE0]/60 text-[10px] text-[#0F766E] font-medium flex items-center justify-between">
                  <span>Isolating {legendRanges[activeLegendBand]?.statesCount} states in {legendRanges[activeLegendBand]?.bandName}</span>
                  <button
                    type="button"
                    onClick={() => setActiveLegendBand(null)}
                    className="underline text-[10px] cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              )}
              {!hoveredState && activeLegendBand === null && (
                <div className="pt-1 text-[10px] text-[#64748B] italic leading-tight">
                  Click or hover any band to isolate states on the map.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div
        ref={svgCanvasRef}
        className={`relative flex-1 min-h-[380px] lg:min-h-[500px] cursor-${isDragging ? 'grabbing' : zoomLevel > 1 ? 'grab' : 'default'} overflow-hidden`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onDoubleClick={(e) => {
          // Double-click to quickly zoom in
          if ((e.target as HTMLElement).tagName !== 'path') {
            handleZoomIn();
          }
        }}
      >
        <svg
          viewBox="0 0 1000 1150"
          className="w-full h-full max-h-[640px] transition-transform duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]/50 rounded-sm"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: '50% 50%'
          }}
          tabIndex={0}
          aria-label="Interactive thematic map of Indian states showing crime case registration rates. Use arrow keys to navigate between states, and Enter to select a state."
          role="region"
          onKeyDown={handleSvgKeyDown}
        >
          {/* Subtle ocean / regional decorative background elements */}
          <g opacity="0.3">
            <text x="210" y="870" fill="#64748B" fontSize="16" fontStyle="italic" letterSpacing="2">
              Arabian Sea
            </text>
            <text x="730" y="730" fill="#64748B" fontSize="16" fontStyle="italic" letterSpacing="2">
              Bay of Bengal
            </text>
            <text x="440" y="1120" fill="#64748B" fontSize="16" fontStyle="italic" letterSpacing="2">
              Indian Ocean
            </text>
          </g>

          {/* State & Union Territory Path Polygons */}
          <g id="states-layer">
            {INDIA_MAP_FEATURES.map((feature: StateGeoFeature) => {
              const stateName = feature.name;
              const isSelected = selectedState?.toLowerCase() === stateName.toLowerCase();
              const isHovered = hoveredState?.toLowerCase() === stateName.toLowerCase();
              const isKeyboardFocused = keyboardFocusedState?.toLowerCase() === stateName.toLowerCase();
              const fillColor = getStateFillColor(stateName);
              const stat = STATE_CRIME_MAP[stateName];
              const stateBand = getStateBandIndex(stateName);

              // Check if state belongs to the highlighted legend band
              const isInEffectiveBand = effectiveBand !== null && stateBand === effectiveBand;
              const isDimmedByLegend = effectiveBand !== null && !isInEffectiveBand && !isSelected && !isHovered && !isKeyboardFocused;

              const strokeColor = isSelected || isKeyboardFocused
                ? '#0B1F33'
                : isHovered || isInEffectiveBand
                  ? '#0F766E'
                  : '#94A3B8';

              const strokeWidth = isSelected || isKeyboardFocused
                ? 3.5
                : isHovered
                  ? 2.2
                  : isInEffectiveBand
                    ? 1.8
                    : 0.8;

              return (
                <path
                  key={feature.id}
                  id={`state-path-${feature.id}`}
                  d={feature.path}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className="transition-all duration-200 outline-none cursor-pointer focus:outline-none"
                  style={{
                    opacity: isDimmedByLegend ? 0.22 : 1,
                    filter: isSelected || isKeyboardFocused
                      ? 'drop-shadow(0 2px 5px rgba(11,31,51,0.35))'
                      : isHovered || isInEffectiveBand
                        ? 'drop-shadow(0 1px 3px rgba(15,118,110,0.35))'
                        : undefined,
                    cursor: 'pointer'
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  aria-label={`${stateName}: Total reported crime index ${stat?.rate !== undefined ? stat.rate.toFixed(1) : 'N/A'} per 1 lakh population, ${stat?.count !== undefined ? formatIndianNumber(stat.count) : 'N/A'} total registered cases, statistical band: ${BAND_NAMES[stateBand] ?? 'N/A'}`}
                  onMouseEnter={(e) => {
                    setHoveredState(stateName);
                    updateTooltipPosition(e.clientX, e.clientY);
                  }}
                  onMouseMove={(e) => {
                    updateTooltipPosition(e.clientX, e.clientY);
                  }}
                  onMouseLeave={() => {
                    if (!keyboardFocusedState) {
                      setHoveredState(null);
                    }
                  }}
                  onFocus={(e) => {
                    setHoveredState(stateName);
                    setKeyboardFocusedState(stateName);
                    if (svgCanvasRef.current) {
                      const targetRect = (e.currentTarget as SVGPathElement).getBoundingClientRect();
                      updateTooltipPosition(
                        targetRect.left + targetRect.width / 2,
                        targetRect.top + targetRect.height / 3
                      );
                    }
                  }}
                  onBlur={() => {
                    setKeyboardFocusedState(null);
                    setHoveredState(null);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isSelected) {
                      onSelectState(null); // toggle off to all India
                    } else {
                      onSelectState(stateName);
                    }
                  }}
                  onKeyDown={(e) => handleStateKeyDown(e, stateName)}
                >
                  <title>{`${stateName} - Total reported crime index: ${stat?.rate !== undefined ? stat.rate.toFixed(1) : 'N/A'} per 1 lakh (${stat?.count !== undefined ? formatIndianNumber(stat.count) : 'N/A'} total registered cases)`}</title>
                </path>
              );
            })}
          </g>

          {/* Selected State Distinct Indicator Pin & Callout Label */}
          {selectedFeature && (
            <g className="pointer-events-none transition-all duration-200">
              {/* Center point marker */}
              <circle
                cx={selectedFeature.center[0]}
                cy={selectedFeature.center[1]}
                r="4.5"
                fill="#0F766E"
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
              {/* Connecting line to badge */}
              <line
                x1={selectedFeature.center[0]}
                y1={selectedFeature.center[1]}
                x2={selectedFeature.center[0] + 45}
                y2={selectedFeature.center[1] - 25}
                stroke="#0F766E"
                strokeWidth="2"
                strokeDasharray="2,2"
              />
              {/* Callout box */}
              <g transform={`translate(${selectedFeature.center[0] + 45}, ${selectedFeature.center[1] - 40})`}>
                <rect
                  x="0"
                  y="0"
                  width={selectedFeature.name.length * 10 + 28}
                  height="28"
                  rx="6"
                  fill="#0F766E"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                />
                <text
                  x="14"
                  y="18"
                  fill="#FFFFFF"
                  fontSize="13"
                  fontWeight="600"
                  fontFamily="Public Sans, sans-serif"
                >
                  {selectedFeature.name}
                </text>
              </g>
            </g>
          )}

          {/* Island Territory labels */}
          <g className="pointer-events-none text-xs" fill="#475569" fontSize="12" fontFamily="Public Sans">
            <text x="195" y="1080" textAnchor="middle" fontWeight="500">
              Lakshadweep
            </text>
            <text x="195" y="1095" textAnchor="middle" fontSize="10" fill="#64748B">
              (India)
            </text>

            <text x="821" y="995" textAnchor="middle" fontWeight="500">
              Andaman & Nicobar
            </text>
            <text x="821" y="1010" textAnchor="middle" fontSize="10" fill="#64748B">
              Islands (India)
            </text>
          </g>
        </svg>

        {/* Interactive Hover Tooltip */}
        {hoveredState && tooltipPos && (
          <div
            className={`absolute z-30 pointer-events-none bg-[#0B1F33] text-white text-xs px-3.5 py-2.5 rounded-lg shadow-xl border border-white/15 min-w-[220px] max-w-[280px] transition-opacity duration-150 ${transformClass}`}
            style={{
              left: `${clampedX}px`,
              top: `${tooltipTop}px`
            }}
            role="tooltip"
            aria-live="polite"
          >
            {/* Header: State Name & Geographic Indicator */}
            <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-1.5 mb-2">
              <span className="font-serif font-bold text-sm text-white tracking-tight">
                {hoveredState}
              </span>
              <span className="text-[10px] font-sans font-medium text-teal-300 uppercase tracking-wider bg-white/10 px-1.5 py-0.5 rounded">
                {hoveredStat?.code || 'State'}
              </span>
            </div>

            {hoveredStat ? (
              <div className="space-y-1.5 tabular-nums text-slate-200">
                {/* Total Reported Crime Index Highlight */}
                <div className="bg-white/10 rounded-md p-2 border border-white/10">
                  <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                    Total Reported Crime Index
                  </div>
                  <div className="flex items-baseline justify-between gap-2 mt-0.5">
                    <span className="text-xl font-bold font-serif text-[#5EEAD4]">
                      {hoveredStat.rate.toFixed(1)}
                    </span>
                    <span className="text-[11px] text-slate-300">
                      cases / 1 lakh pop.
                    </span>
                  </div>
                </div>

                {/* Total Reported Crime Count */}
                <div className="flex items-center justify-between gap-3 text-xs pt-0.5">
                  <span className="text-slate-400">Total Reported Cases:</span>
                  <span className="font-semibold text-white">
                    {formatIndianNumber(hoveredStat.count)}
                  </span>
                </div>

                {/* Quintile Band */}
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-400">Statistical Band:</span>
                  <span className="flex items-center gap-1.5 font-medium text-white">
                    <span
                      className="w-2.5 h-2.5 rounded-xs inline-block border border-white/30 shrink-0"
                      style={{ backgroundColor: getStateFillColor(hoveredState) }}
                    />
                    <span>{BAND_NAMES[getStateBandIndex(hoveredState)] ?? '-'}</span>
                  </span>
                </div>

                {/* Benchmark vs National Rate (418.9) */}
                {diffPercent !== null && (
                  <div className="flex items-center justify-between gap-3 text-[11px] pt-1.5 border-t border-white/10 text-slate-300">
                    <span className="text-slate-400">vs National Baseline:</span>
                    <span
                      className={`inline-flex items-center gap-0.5 font-semibold ${
                        isCloseToNational
                          ? 'text-slate-300'
                          : isAboveNational
                            ? 'text-amber-300'
                            : 'text-emerald-300'
                      }`}
                    >
                      {isCloseToNational ? (
                        'Near average (418.9)'
                      ) : (
                        <>
                          {isAboveNational ? '+' : '-'}
                          {diffPercent.toFixed(1)}% ({isAboveNational ? 'higher' : 'lower'})
                        </>
                      )}
                    </span>
                  </div>
                )}

                {/* Prompt hint */}
                <div className="text-[10px] text-slate-400 pt-1 text-center border-t border-white/5 font-sans">
                  Click to filter atlas view
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-1">
                No crime statistics available
              </div>
            )}
          </div>
        )}

        {/* Keyboard Navigation Accessibility Badge */}
        <div className="absolute left-4 top-3 hidden sm:flex items-center gap-1.5 text-[11px] text-[#475569] bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded border border-[#D5DCE0] shadow-xs pointer-events-none z-10">
          <Keyboard className="w-3.5 h-3.5 text-[#0F766E]" />
          <span>
            Use <strong>Arrow keys</strong> to navigate states, <strong>Enter</strong> to select
          </span>
        </div>

        {/* Interactive Map Navigation & Zoom Controls Toolbar */}
        <div
          role="toolbar"
          aria-label="Map navigation and zoom controls"
          className="absolute right-4 bottom-14 flex flex-col items-center bg-white border border-[#D5DCE0] rounded-lg shadow-md p-1.5 z-20 select-none"
        >
          {/* Zoom In Button */}
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= MAX_ZOOM}
            className="w-8 h-8 flex items-center justify-center rounded-md text-[#0B1F33] hover:bg-[#F6F8F7] active:bg-[#0F766E]/10 disabled:opacity-35 disabled:cursor-not-allowed transition-all focus-visible:outline-[#0F766E] cursor-pointer"
            aria-label="Zoom in map to magnify view"
            title={`Zoom in (+)`}
          >
            <Plus className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* Current Zoom Percentage Readout / Quick 100% Reset */}
          <button
            type="button"
            onClick={handleResetZoom}
            className="w-full py-1 my-0.5 text-[10px] font-semibold text-[#0F766E] hover:bg-[#0F766E]/10 rounded tabular-nums text-center transition-colors cursor-pointer"
            title="Click to reset to default 100% zoom"
            aria-label={`Current zoom level is ${Math.round(zoomLevel * 100)} percent. Click to reset to 100 percent.`}
          >
            {Math.round(zoomLevel * 100)}%
          </button>

          {/* Zoom Out Button */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= MIN_ZOOM}
            className="w-8 h-8 flex items-center justify-center rounded-md text-[#0B1F33] hover:bg-[#F6F8F7] active:bg-[#0F766E]/10 disabled:opacity-35 disabled:cursor-not-allowed transition-all focus-visible:outline-[#0F766E] cursor-pointer"
            aria-label="Zoom out map for wider view"
            title={`Zoom out (-)`}
          >
            <Minus className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* Divider */}
          <div className="w-6 h-px bg-[#D5DCE0] my-1" />

          {/* Reset Position and Zoom Center Button */}
          <button
            type="button"
            onClick={handleResetZoom}
            className="w-8 h-8 flex items-center justify-center rounded-md text-[#475569] hover:text-[#0B1F33] hover:bg-[#F6F8F7] active:bg-[#0F766E]/10 transition-colors focus-visible:outline-[#0F766E] cursor-pointer"
            aria-label="Reset zoom and center view"
            title="Reset position and zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dynamic Distance Scale Bar */}
        <div className="absolute left-5 bottom-14 flex items-center gap-2 text-[11px] text-[#475569] bg-white/85 backdrop-blur-xs px-2.5 py-1 rounded border border-[#D5DCE0] tabular-nums pointer-events-none z-10 shadow-2xs">
          <span>0</span>
          <div className="w-14 h-1 border-b-2 border-l border-r border-[#475569]" />
          <span>{Math.round(500 / zoomLevel)}</span>
          <div className="w-14 h-1 border-b-2 border-l border-r border-[#475569]" />
          <span>{Math.round(1000 / zoomLevel)} km</span>
        </div>
      </div>

      {/* Map Caveat & Source Footer */}
      <div className="px-4 py-3 bg-[#F6F8F7] border-t border-[#D5DCE0] flex items-center justify-between gap-3 text-xs text-[#475569]">
        <div className="flex items-start gap-2 max-w-[85%]">
          <Info className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong>How to read this number:</strong> Registered cases depend on reporting and recording, and may not include all crime. They do not directly indicate personal safety in a location.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenSourcesModal}
          className="inline-flex items-center gap-1 text-[#0F766E] font-medium hover:underline shrink-0 text-xs cursor-pointer"
        >
          Source: NCRB 2024
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
