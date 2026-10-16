import React, { useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid
} from 'recharts';
import {
  ALL_INDIA_OVERALL,
  ALL_INDIA_STATES,
  STATE_CRIME_MAP,
  get3YearTrendData,
  getYoYChange,
  formatIndianNumber,
  formatPopulationEstimate,
  getStateBandIndex,
  BAND_NAMES,
  YOY_EXACT_NOTE,
  TrendYearPoint,
  getDistrict6MonthTrend,
  DistrictMonthPoint,
  getState12MonthTrend,
  StateMonthPoint
} from '../data/crimeData';
import {
  RotateCcw,
  MapPin,
  TrendingDown,
  TrendingUp,
  Minus,
  HelpCircle,
  Activity,
  BarChart3,
  Calendar,
  ArrowRightLeft,
  X,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

import { getDistrictFeature } from '../data/indiaGeoData';

export interface StateSummaryCardProps {
  selectedState: string | null;
  selectedDistrict?: string | null;
  comparisonState?: string | null;
  onSelectComparisonState?: (state: string | null) => void;
  onResetToIndia: () => void;
  onResetDistrict?: () => void;
  onOpenDetailedStats?: () => void;
}

// 3-Year Trend Chart Component (2022, 2023, 2024)
const Trend3YearChart: React.FC<{
  points: TrendYearPoint[];
  stateName: string;
}> = ({ points, stateName }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Check if all counts are null or not available
  const hasValidData = points && points.some(p => p.count !== null && p.count !== undefined);

  if (!hasValidData) {
    return (
      <div className="py-6 px-3 bg-[#F6F8F7] rounded-md border border-[#D5DCE0] text-center">
        <p className="text-xs text-[#475569] italic">
          Trend data: <span className="font-medium text-[#0B1F33]">Not available</span>
        </p>
      </div>
    );
  }

  const width = 320;
  const height = 110;
  const margin = { top: 26, right: 36, bottom: 24, left: 36 };

  // Valid non-null points
  const validPoints = points.filter(p => p.count !== null) as { year: number; count: number }[];
  const counts = validPoints.map(p => p.count);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);
  const yPadding = (maxCount - minCount) * 0.25 || maxCount * 0.1 || 10;

  const xScale = d3
    .scalePoint<number>()
    .domain(points.map(d => d.year))
    .range([margin.left, width - margin.right]);

  const yScale = d3
    .scaleLinear()
    .domain([Math.max(0, minCount - yPadding), maxCount + yPadding])
    .range([height - margin.bottom, margin.top]);

  const lineGenerator = d3
    .line<{ year: number; count: number | null }>()
    .defined(d => d.count !== null && d.count !== undefined)
    .x(d => xScale(d.year) ?? margin.left)
    .y(d => yScale(d.count!))
    .curve(d3.curveMonotoneX);

  const areaGenerator = d3
    .area<{ year: number; count: number | null }>()
    .defined(d => d.count !== null && d.count !== undefined)
    .x(d => xScale(d.year) ?? margin.left)
    .y0(height - margin.bottom)
    .y1(d => yScale(d.count!))
    .curve(d3.curveMonotoneX);

  const pathD = lineGenerator(points) || '';
  const areaD = areaGenerator(points) || '';
  const gradientId = `trend-grad-${stateName.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div className="w-full bg-[#F6F8F7] rounded-md border border-[#D5DCE0] p-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold text-[#475569] uppercase tracking-wider">
          3-Year Trajectory (2022–2024)
        </span>
        <span className="text-[10px] text-[#475569]">
          Exact registered counts
        </span>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          aria-label={`3-year crime statistics trajectory chart for ${stateName}`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0F766E" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#0F766E" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Baseline grid */}
          <line
            x1={margin.left}
            y1={height - margin.bottom}
            x2={width - margin.right}
            y2={height - margin.bottom}
            stroke="#CBD5E1"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Area fill */}
          {areaD && <path d={areaD} fill={`url(#${gradientId})`} />}

          {/* Stroke path */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#0F766E"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Points & Exact Values Display */}
          {points.map((p, idx) => {
            const cx = xScale(p.year) ?? margin.left;
            const isAvailable = p.count !== null && p.count !== undefined;
            const cy = isAvailable ? yScale(p.count!) : height - margin.bottom;
            const isHovered = hoveredIdx === idx;
            const isLatest = p.year === 2024;

            return (
              <g key={p.year}>
                {/* Year Label */}
                <text
                  x={cx}
                  y={height - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight={isLatest ? "700" : "500"}
                  fill={isLatest ? "#0B1F33" : "#64748B"}
                  className="tabular-nums font-sans"
                >
                  {p.year}
                </text>

                {isAvailable ? (
                  <>
                    {/* Exact Numerical Value displayed on the point */}
                    <text
                      x={cx}
                      y={cy - 9}
                      textAnchor="middle"
                      fontSize="9.5"
                      fontWeight="600"
                      fill="#0B1F33"
                      className="tabular-nums font-sans"
                    >
                      {formatIndianNumber(p.count)}
                    </text>

                    {/* Touch / Hover hit area */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="14"
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    />

                    {/* Visible point circle */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 5 : isLatest ? 4 : 3}
                      fill={isLatest ? "#0F766E" : "#FFFFFF"}
                      stroke="#0F766E"
                      strokeWidth={isLatest ? "2.5" : "2"}
                      className="pointer-events-none transition-all duration-150"
                    />
                  </>
                ) : (
                  <text
                    x={cx}
                    y={height - 28}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#94A3B8"
                    fontStyle="italic"
                  >
                    Not available
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

// 12-Month State Crime Trend Bar Chart Component (Recharts) with Side-by-Side Comparison
interface State12MonthBarChartProps {
  stateName: string;
  comparisonState?: string | null;
  onSelectComparisonState?: (state: string | null) => void;
  annualCount?: number | null;
  annualRate?: number | null;
}

const State12MonthBarChart: React.FC<State12MonthBarChartProps> = ({
  stateName,
  comparisonState: externalComparisonState,
  onSelectComparisonState,
  annualCount,
  annualRate
}) => {
  const [internalComparisonState, setInternalComparisonState] = useState<string | null>(null);
  const [metricMode, setMetricMode] = useState<'incidents' | 'rate'>('incidents');
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  // Effective comparison state (props or internal)
  const comparisonState = externalComparisonState !== undefined ? externalComparisonState : internalComparisonState;

  const handleSetComparisonState = (target: string | null) => {
    setInternalComparisonState(target);
    if (onSelectComparisonState) {
      onSelectComparisonState(target);
    }
  };

  // State 1 points
  const points1 = useMemo(() => {
    return getState12MonthTrend(stateName, annualCount, annualRate);
  }, [stateName, annualCount, annualRate]);

  // State 2 (comparison) points
  const points2 = useMemo(() => {
    if (!comparisonState) return null;
    return getState12MonthTrend(comparisonState);
  }, [comparisonState]);

  // Combined chart dataset
  const combinedData = useMemo(() => {
    return points1.map((p1, idx) => {
      const p2 = points2 ? points2[idx] : null;
      return {
        month: p1.month,
        monthFull: p1.monthFull,
        // State 1 values
        state1Incidents: p1.incidents,
        state1Rate: p1.rate,
        state1Value: metricMode === 'rate' ? p1.rate : p1.incidents,
        state1IsPeak: p1.isPeak,
        // State 2 values
        state2Incidents: p2 ? p2.incidents : null,
        state2Rate: p2 ? p2.rate : null,
        state2Value: p2 ? (metricMode === 'rate' ? p2.rate : p2.incidents) : null,
        state2IsPeak: p2 ? p2.isPeak : false,
        // Relative difference
        diffIncidents: p2 ? p1.incidents - p2.incidents : 0,
        diffRate: p2 ? Number((p1.rate - p2.rate).toFixed(1)) : 0
      };
    });
  }, [points1, points2, metricMode]);

  const peakPoint1 = useMemo(() => {
    return points1.find(p => p.isPeak) || points1[0];
  }, [points1]);

  const peakPoint2 = useMemo(() => {
    if (!points2) return null;
    return points2.find(p => p.isPeak) || points2[0];
  }, [points2]);

  const total1 = useMemo(() => {
    return points1.reduce((acc, p) => acc + p.incidents, 0);
  }, [points1]);

  const total2 = useMemo(() => {
    if (!points2) return 0;
    return points2.reduce((acc, p) => acc + p.incidents, 0);
  }, [points2]);

  const monthlyAverage1 = useMemo(() => Math.round(total1 / 12), [total1]);
  const monthlyAverage2 = useMemo(() => Math.round(total2 / 12), [total2]);

  // Comparison suggestions (peers that are not the current state)
  const peerSuggestions = useMemo(() => {
    const list = ['Maharashtra', 'Karnataka', 'Delhi', 'Uttar Pradesh', 'Tamil Nadu', 'Gujarat', 'Kerala', 'Rajasthan'];
    return list.filter(s => s !== stateName).slice(0, 4);
  }, [stateName]);

  return (
    <div className="w-full bg-[#F6F8F7] rounded-md border border-[#D5DCE0] p-3 space-y-2.5">
      {/* Header with Mode Switcher & Title */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-[#0F766E]" />
          <span className="text-[11px] font-semibold text-[#0B1F33] uppercase tracking-wider">
            12-Month Incident Trajectory (2024)
          </span>
        </div>

        {/* Metric Toggle: Total Cases vs Rate per 1 Lakh */}
        <div className="flex items-center rounded bg-slate-200/80 p-0.5 text-[9.5px] font-medium">
          <button
            type="button"
            onClick={() => setMetricMode('incidents')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              metricMode === 'incidents'
                ? 'bg-white text-[#0B1F33] font-bold shadow-2xs'
                : 'text-[#64748B] hover:text-[#0B1F33]'
            }`}
            title="Display absolute reported incidents volume"
          >
            Cases
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('rate')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              metricMode === 'rate'
                ? 'bg-white text-[#0B1F33] font-bold shadow-2xs'
                : 'text-[#64748B] hover:text-[#0B1F33]'
            }`}
            title="Display population-normalized rate per 100,000 population"
          >
            Rate / 1L
          </button>
        </div>
      </div>

      {/* Comparison Selector & Active State Badges */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5 border-t border-[#D5DCE0]/60">
        {comparisonState ? (
          /* Active Comparison Indicator with Legend */
          <div className="flex items-center gap-2 flex-wrap text-[10px]">
            <span className="flex items-center gap-1 font-semibold text-[#0F766E]">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#0F766E]" />
              <span>{stateName}</span>
            </span>
            <span className="text-slate-400 font-bold">vs</span>
            <span className="flex items-center gap-1 font-semibold text-[#B45309]">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#D97706]" />
              <span>{comparisonState}</span>
            </span>
            <button
              type="button"
              onClick={() => handleSetComparisonState(null)}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-[9px] font-medium transition-colors cursor-pointer ml-1"
              title="Remove secondary comparison state"
            >
              <X className="w-2.5 h-2.5" />
              <span>Clear</span>
            </button>
          </div>
        ) : (
          /* Prompt to compare */
          <div className="flex items-center gap-1.5 text-[10px] text-[#475569] flex-wrap">
            <ArrowRightLeft className="w-3 h-3 text-[#0F766E]" />
            <span className="font-medium">Compare side-by-side with:</span>
            <div className="flex items-center gap-1 flex-wrap">
              {peerSuggestions.map(peer => (
                <button
                  key={peer}
                  type="button"
                  onClick={() => handleSetComparisonState(peer)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-900 text-[9.5px] font-medium transition-colors cursor-pointer"
                >
                  +{peer}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* State Dropdown Selector */}
        <div className="flex items-center gap-1">
          <select
            value={comparisonState || ''}
            onChange={(e) => handleSetComparisonState(e.target.value ? e.target.value : null)}
            className="text-[10px] bg-white border border-[#CBD5E1] rounded px-1.5 py-1 text-[#0B1F33] focus:outline-none focus:ring-1 focus:ring-[#0F766E] cursor-pointer"
            aria-label="Select state to compare side by side"
          >
            <option value="">{comparisonState ? 'Change comparison state...' : '+ Choose any state...'}</option>
            {ALL_INDIA_STATES.filter(s => s !== stateName).map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-label describing data scale */}
      <div className="flex items-center justify-between text-[10px] text-[#475569]">
        <span>
          {comparisonState ? (
            <>
              Comparing <strong>{stateName}</strong> (Teal) vs <strong>{comparisonState}</strong> (Amber) in {metricMode === 'rate' ? 'monthly rate per 1L' : 'monthly incidents'}
            </>
          ) : (
            <>
              Reported crime incidents in <strong>{stateName || 'India'}</strong> (Monthly avg: <strong>{formatIndianNumber(monthlyAverage1)}</strong>)
            </>
          )}
        </span>
        {!comparisonState && (
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-50 text-teal-800 border border-teal-200 tabular-nums">
            Peak: {peakPoint1.month}
          </span>
        )}
      </div>

      {/* Recharts Side-by-Side Bar Chart */}
      <div className="w-full h-[145px] min-w-0" style={{ minHeight: 145 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={combinedData} margin={{ top: 8, right: 6, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1' }}
              tick={{ fontSize: 9.5, fill: '#64748B', fontWeight: 500 }}
              interval={0}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 9, fill: '#94A3B8' }}
              tickFormatter={(v: number) => {
                if (metricMode === 'rate') return `${v.toFixed(0)}`;
                if (v >= 100000) return `${(v / 100000).toFixed(1)}L`;
                if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
                return String(v);
              }}
            />
            <RechartsTooltip
              cursor={{ fill: 'rgba(15, 118, 110, 0.08)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#0B1F33] text-white text-xs px-2.5 py-2 rounded-md shadow-lg border border-[#334155] space-y-1.5 min-w-[200px]">
                      <div className="font-semibold text-slate-200 border-b border-slate-700 pb-0.5 flex items-center justify-between">
                        <span>{data.monthFull}</span>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-normal">
                          {metricMode === 'rate' ? 'Rate / 1L' : 'FIRs'}
                        </span>
                      </div>

                      {/* State 1 Entry */}
                      <div className="flex items-center justify-between gap-3 text-[11px]">
                        <span className="flex items-center gap-1.5 text-teal-300 font-medium truncate max-w-[120px]">
                          <span className="w-2 h-2 rounded-full bg-[#0F766E] shrink-0" />
                          <span className="truncate">{stateName}</span>
                        </span>
                        <span className="font-mono font-bold text-white tabular-nums">
                          {formatIndianNumber(data.state1Incidents)}
                          <span className="text-[9px] text-slate-400 ml-1 font-normal">({data.state1Rate}/1L)</span>
                        </span>
                      </div>

                      {/* State 2 Entry (if comparing) */}
                      {comparisonState && data.state2Incidents !== null && (
                        <>
                          <div className="flex items-center justify-between gap-3 text-[11px]">
                            <span className="flex items-center gap-1.5 text-amber-300 font-medium truncate max-w-[120px]">
                              <span className="w-2 h-2 rounded-full bg-[#D97706] shrink-0" />
                              <span className="truncate">{comparisonState}</span>
                            </span>
                            <span className="font-mono font-bold text-white tabular-nums">
                              {formatIndianNumber(data.state2Incidents)}
                              <span className="text-[9px] text-slate-400 ml-1 font-normal">({data.state2Rate}/1L)</span>
                            </span>
                          </div>

                          {/* Variance breakdown */}
                          <div className="pt-1 border-t border-slate-700/80 text-[10px] flex items-center justify-between text-slate-300">
                            <span>Monthly Difference:</span>
                            <span className={`font-mono font-bold ${data.diffIncidents >= 0 ? 'text-teal-300' : 'text-amber-300'}`}>
                              {data.diffIncidents >= 0 ? `+${formatIndianNumber(data.diffIncidents)}` : formatIndianNumber(data.diffIncidents)}
                              <span className="text-[9px] font-normal text-slate-400 ml-1">
                                ({data.state2Incidents > 0 ? (((data.diffIncidents) / data.state2Incidents) * 100).toFixed(1) : 0}%)
                              </span>
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Bar Series 1: Primary State */}
            <Bar
              dataKey="state1Value"
              name={stateName}
              fill="#0F766E"
              radius={[3, 3, 0, 0]}
              maxBarSize={comparisonState ? 14 : 26}
              onMouseEnter={(entry: any) => setHoveredMonth(entry?.month || null)}
              onMouseLeave={() => setHoveredMonth(null)}
            >
              {!comparisonState && points1.map((entry) => {
                const isHovered = hoveredMonth === entry.month;
                const isPeak = entry.isPeak;
                const fillColor = isHovered
                  ? '#0D655E'
                  : isPeak
                  ? '#0F766E'
                  : '#14B8A6';
                return (
                  <Cell
                    key={entry.month}
                    fill={fillColor}
                    fillOpacity={isHovered ? 1 : isPeak ? 0.95 : 0.75}
                    stroke={isPeak ? '#0F766E' : undefined}
                    strokeWidth={isPeak ? 1 : 0}
                  />
                );
              })}
            </Bar>

            {/* Bar Series 2: Comparison State (Side-by-Side) */}
            {comparisonState && (
              <Bar
                dataKey="state2Value"
                name={comparisonState}
                fill="#D97706"
                radius={[3, 3, 0, 0]}
                maxBarSize={14}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Comparison Scorecard or Standard Footer */}
      {comparisonState && peakPoint2 ? (
        <div className="grid grid-cols-2 gap-2 text-[10px] bg-white rounded border border-[#D5DCE0] p-2">
          {/* State 1 Stats */}
          <div className="space-y-0.5 border-r border-[#D5DCE0]/80 pr-2">
            <div className="font-bold text-[#0F766E] truncate">{stateName}</div>
            <div className="flex justify-between text-slate-600">
              <span>Annual:</span>
              <strong className="text-slate-900">{formatIndianNumber(total1)}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Avg/mo:</span>
              <strong className="text-slate-900">{formatIndianNumber(monthlyAverage1)}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Peak:</span>
              <strong className="text-slate-900">{peakPoint1.month} ({formatIndianNumber(peakPoint1.incidents)})</strong>
            </div>
          </div>

          {/* State 2 Stats */}
          <div className="space-y-0.5 pl-1">
            <div className="font-bold text-[#B45309] truncate">{comparisonState}</div>
            <div className="flex justify-between text-slate-600">
              <span>Annual:</span>
              <strong className="text-slate-900">{formatIndianNumber(total2)}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Avg/mo:</span>
              <strong className="text-slate-900">{formatIndianNumber(monthlyAverage2)}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Peak:</span>
              <strong className="text-slate-900">{peakPoint2.month} ({formatIndianNumber(peakPoint2.incidents)})</strong>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between text-[10px] text-[#475569] border-t border-[#D5DCE0]/60 pt-1.5 px-0.5">
          <span>Annual Sum: <strong>{formatIndianNumber(total1)}</strong></span>
          <span>Lowest: <strong>{points1.find(p => p.isTrough)?.month} ({formatIndianNumber(points1.find(p => p.isTrough)?.incidents || 0)})</strong></span>
        </div>
      )}
    </div>
  );
};

// 6-Month District Crime Trend Line Chart Component (Recharts)
interface District6MonthTrendChartProps {
  districtName: string;
  stateName: string;
  annualCount?: number | null;
  annualRate?: number | null;
}

const District6MonthTrendChart: React.FC<District6MonthTrendChartProps> = ({
  districtName,
  stateName,
  annualCount,
  annualRate
}) => {
  const points = useMemo(() => {
    return getDistrict6MonthTrend(districtName, stateName, annualCount, annualRate);
  }, [districtName, stateName, annualCount, annualRate]);

  const firstMonth = points[0];
  const lastMonth = points[points.length - 1];
  const trajectoryPct = firstMonth && firstMonth.cases > 0
    ? Number((((lastMonth.cases - firstMonth.cases) / firstMonth.cases) * 100).toFixed(1))
    : 0;

  const peakPoint = useMemo(() => {
    return points.reduce((max, p) => (p.cases > max.cases ? p : max), points[0]);
  }, [points]);

  return (
    <div className="w-full bg-[#F6F8F7] rounded-md border border-[#D5DCE0] p-3 space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-1">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#0F766E]" />
          <span className="text-[11px] font-semibold text-[#0B1F33] uppercase tracking-wider">
            6-Month Trajectory (Jul–Dec 2024)
          </span>
        </div>
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border tabular-nums ${
            trajectoryPct >= 0
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-teal-50 text-teal-800 border-teal-200'
          }`}
        >
          {trajectoryPct >= 0 ? `+${trajectoryPct}%` : `${trajectoryPct}%`} trajectory
        </span>
      </div>

      <div className="text-[10px] text-[#475569]">
        Monthly registered FIRs at local police stations in <strong>{districtName}</strong>
      </div>

      {/* Recharts Line Chart */}
      <div className="w-full h-[125px] min-w-0" style={{ minHeight: 125 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 8, right: 12, left: -22, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1' }}
              tick={{ fontSize: 10, fill: '#64748B', fontWeight: 500 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 9, fill: '#94A3B8' }}
              tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)}
            />
            <RechartsTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as DistrictMonthPoint;
                  return (
                    <div className="bg-[#0B1F33] text-white text-xs px-2.5 py-1.5 rounded shadow-lg border border-[#334155] space-y-0.5">
                      <div className="font-semibold text-slate-200">{data.monthFull}</div>
                      <div className="font-mono text-[13px] font-bold text-teal-300">
                        {formatIndianNumber(data.cases)} cases
                      </div>
                      <div className="text-[10px] text-slate-300 flex items-center justify-between gap-2">
                        <span>Est. rate: {data.rate} / 1L</span>
                        {data.momChangePct !== 0 && (
                          <span className={data.momChangePct > 0 ? 'text-amber-300' : 'text-teal-300'}>
                            {data.momChangePct > 0 ? `+${data.momChangePct}%` : `${data.momChangePct}%`} MoM
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="cases"
              stroke="#0F766E"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: '#FFFFFF', stroke: '#0F766E', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: '#0F766E', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer stats summary */}
      <div className="flex items-center justify-between text-[10px] text-[#475569] border-t border-[#D5DCE0]/60 pt-1.5 px-0.5">
        <span>Active Zilla: <strong>{districtName}</strong></span>
        <span>Peak month: <strong>{peakPoint.month} ({formatIndianNumber(peakPoint.cases)})</strong></span>
      </div>
    </div>
  );
};

export const StateSummaryCard: React.FC<StateSummaryCardProps> = ({
  selectedState,
  selectedDistrict,
  comparisonState: externalComparisonState,
  onSelectComparisonState,
  onResetToIndia,
  onResetDistrict,
  onOpenDetailedStats
}) => {
  const [internalComparisonState, setInternalComparisonState] = useState<string | null>(null);
  const comparisonState = externalComparisonState !== undefined ? externalComparisonState : internalComparisonState;
  const setComparisonState = (st: string | null) => {
    setInternalComparisonState(st);
    if (onSelectComparisonState) onSelectComparisonState(st);
  };

  const [trendView, setTrendView] = useState<'12month' | '3year'>('12month');
  const isStateSelected = Boolean(selectedState);
  const isDistrictSelected = Boolean(selectedState && selectedDistrict);

  // Look up district feature if selected
  const districtFeature = (selectedState && selectedDistrict)
    ? getDistrictFeature(selectedState, selectedDistrict)
    : null;

  const displayName = isDistrictSelected
    ? `${districtFeature?.properties?.name || selectedDistrict}, ${selectedState}`
    : (selectedState || 'India (overall)');

  // 2024 state metrics loaded strictly from ncrb-2024-state-data.json
  const currentStateData = isStateSelected && selectedState
    ? STATE_CRIME_MAP[selectedState]
    : ALL_INDIA_OVERALL;

  const total2024 = isDistrictSelected
    ? (districtFeature?.properties?.count ?? 0)
    : currentStateData?.count;

  const rate2024 = isDistrictSelected
    ? (districtFeature?.properties?.rate ?? 0)
    : currentStateData?.rate;

  const population2024 = currentStateData?.populationEstimate;

  // YoY growth / decline strictly calculated from 2024 vs 2023 files for state
  const yoyData = getYoYChange(selectedState);

  // 3-year trajectory data strictly for 2022, 2023, 2024 only
  const trendPoints = get3YearTrendData(selectedState);

  // Quintile Band
  const stateBandIndex = isStateSelected ? getStateBandIndex(selectedState) : -1;
  const districtQuintile = districtFeature?.properties?.quintile;
  const bandIndex = isDistrictSelected
    ? (districtQuintile ? Math.min(4, Math.max(0, districtQuintile - 1)) : 2)
    : stateBandIndex;
  const bandLabel = bandIndex >= 0 ? BAND_NAMES[bandIndex] : 'National baseline';

  // Compare district rate against state average rate
  const stateRate = currentStateData?.rate ?? 0;
  const districtRateVariance = isDistrictSelected && stateRate > 0 && typeof rate2024 === 'number'
    ? ((rate2024 - stateRate) / stateRate) * 100
    : null;

  return (
    <article
      className="bg-white rounded-lg border border-[#D5DCE0] p-4 sm:p-5 shadow-xs space-y-4"
      aria-labelledby="summary-card-title"
    >
      {/* Header: Title & Reset Button */}
      <div className="flex items-start justify-between gap-3 border-b border-[#D5DCE0]/70 pb-3">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-[#475569] flex-wrap">
            <MapPin className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
            <span className="truncate">
              {isDistrictSelected ? (
                <>
                  <span className="font-medium text-[#0B1F33]">{selectedState}</span>
                  <span className="mx-1 text-[#CBD5E1]">/</span>
                  <span className="text-[#0F766E] font-semibold">District Profile</span>
                </>
              ) : isStateSelected ? (
                'State Statistics'
              ) : (
                'National Overview'
              )}
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
              Administrative Zilla in <strong>{selectedState}</strong>
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isDistrictSelected && onResetDistrict && (
            <button
              type="button"
              onClick={onResetDistrict}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#475569] bg-[#F1F5F9] hover:bg-[#E2E8F0] hover:text-[#0B1F33] rounded-md transition-colors cursor-pointer"
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
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0F766E] bg-[#E8F0EE] hover:bg-[#0F766E] hover:text-white rounded-md transition-colors cursor-pointer"
              title="Reset view to all India overview"
            >
              <RotateCcw className="w-3 h-3" />
              <span>All India</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Key Metrics Grid (Single-source-of-truth 2024 stats) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Metric 1: Total Registered Cases */}
        <div className="bg-[#F6F8F7] rounded-md p-3 border border-[#D5DCE0]/60">
          <span className="block text-[11px] font-medium text-[#475569] mb-1">
            {isDistrictSelected ? 'District Registered Cases' : '2024 Total Registered Cases'}
          </span>
          <div className="text-base sm:text-lg font-bold text-[#0B1F33] tabular-nums tracking-tight">
            {formatIndianNumber(total2024)}
          </div>
          <span className="block text-[10px] text-[#475569] mt-0.5">
            {isDistrictSelected ? 'Local police stations FIRs' : 'IPC/BNS + SLL crimes'}
          </span>
        </div>

        {/* Metric 2: Registration Rate per 1 Lakh */}
        <div className="bg-[#F6F8F7] rounded-md p-3 border border-[#D5DCE0]/60">
          <span className="block text-[11px] font-medium text-[#475569] mb-1">
            Registered cases per 1 lakh
          </span>
          <div className="text-base sm:text-lg font-bold text-[#0F766E] tabular-nums tracking-tight">
            {rate2024 !== undefined && rate2024 !== null ? rate2024.toFixed(1) : 'Not available'}
          </div>
          <span className="block text-[10px] text-[#475569] mt-0.5 truncate">
            {isDistrictSelected ? `Quintile: ${bandLabel}` : isStateSelected ? `Band: ${bandLabel}` : 'National baseline rate'}
          </span>
        </div>
      </div>

      {/* Comparison against state average when district is selected */}
      {isDistrictSelected && districtRateVariance !== null && (
        <div className="p-2.5 bg-[#F6F8F7] rounded-md border border-[#D5DCE0] text-xs flex items-center justify-between gap-2">
          <span className="text-[#475569]">Comparison vs {selectedState} average:</span>
          <span className={`font-bold tabular-nums ${districtRateVariance >= 0 ? 'text-[#B45309]' : 'text-[#0F766E]'}`}>
            {districtRateVariance >= 0 ? '+' : ''}{districtRateVariance.toFixed(1)}%
            <span className="text-[10px] font-normal text-[#64748B] ml-1">
              (state: {stateRate.toFixed(1)})
            </span>
          </span>
        </div>
      )}

      {/* Population Estimate Row (when state selected) */}
      {!isDistrictSelected && (
        <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-[#F6F8F7] rounded-md border border-[#D5DCE0]/60">
          <span className="text-[#475569]">Estimated Population (2024):</span>
          <span className="font-semibold text-[#0B1F33] tabular-nums">
            {formatPopulationEstimate(population2024)}
          </span>
        </div>
      )}

      {/* Year-on-Year Badge & Mandatory IPC/BNS Care Note (State/National) */}
      {!isDistrictSelected && (
        <div className="bg-[#F6F8F7] rounded-md p-3 border border-[#D5DCE0] space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold text-[#0B1F33]">
              Year-on-Year (2024 vs 2023)
            </span>

            {/* YoY Badge / Value */}
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold tabular-nums bg-white border border-[#D5DCE0]">
              {yoyData.isIncrease ? (
                <TrendingUp className="w-3.5 h-3.5 text-[#B45309]" />
              ) : yoyData.isDecline ? (
                <TrendingDown className="w-3.5 h-3.5 text-[#0F766E]" />
              ) : (
                <Minus className="w-3.5 h-3.5 text-[#64748B]" />
              )}
              <span
                className={
                  yoyData.isIncrease
                    ? 'text-[#B45309]'
                    : yoyData.isDecline
                    ? 'text-[#0F766E]'
                    : 'text-[#64748B]'
                }
              >
                {yoyData.formattedChange}
              </span>
            </div>
          </div>

          {/* EXACT NOTE REQUIRED BY PROMPT */}
          <p className="text-[11px] leading-relaxed text-[#475569] bg-white/80 p-2 rounded border border-[#D5DCE0]/60">
            <span className="font-semibold text-[#0B1F33]">Note: </span>
            {YOY_EXACT_NOTE}
          </p>
        </div>
      )}

      {/* 6-Month Crime Trends Line Chart using Recharts for Selected District */}
      {isDistrictSelected && (
        <District6MonthTrendChart
          districtName={districtFeature?.properties?.name || selectedDistrict!}
          stateName={selectedState!}
          annualCount={total2024}
          annualRate={rate2024}
        />
      )}

      {/* State Trends View (12-Month Incident Bar Chart & 3-Year Trajectory) */}
      {!isDistrictSelected && (
        <div className="space-y-2">
          {/* Trend Mode Switcher */}
          <div className="flex rounded-md p-0.5 bg-slate-100 border border-slate-200 text-[10px] font-medium">
            <button
              type="button"
              onClick={() => setTrendView('12month')}
              className={`flex-1 py-1 px-2 rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                trendView === '12month'
                  ? 'bg-white text-[#0B1F33] font-bold shadow-xs'
                  : 'text-[#64748B] hover:text-[#0B1F33]'
              }`}
            >
              <BarChart3 className="w-3 h-3 text-[#0F766E]" />
              <span>12-Month Trend (Bar Chart)</span>
            </button>
            <button
              type="button"
              onClick={() => setTrendView('3year')}
              className={`flex-1 py-1 px-2 rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                trendView === '3year'
                  ? 'bg-white text-[#0B1F33] font-bold shadow-xs'
                  : 'text-[#64748B] hover:text-[#0B1F33]'
              }`}
            >
              <Calendar className="w-3 h-3 text-[#0F766E]" />
              <span>3-Year Trajectory</span>
            </button>
          </div>

          {trendView === '12month' ? (
            <State12MonthBarChart
              stateName={selectedState || 'India (overall)'}
              comparisonState={comparisonState}
              onSelectComparisonState={setComparisonState}
              annualCount={total2024}
              annualRate={rate2024}
            />
          ) : (
            <Trend3YearChart points={trendPoints} stateName={selectedState || 'India (overall)'} />
          )}
        </div>
      )}

      {/* Civic Statistical Principle Disclaimer */}
      <div className="text-[11px] leading-normal text-[#475569] space-y-1 pt-1 border-t border-[#D5DCE0]/60">
        <p>
          <span className="font-medium text-[#0B1F33]">Core Principle: </span>
          {isDistrictSelected ? (
            'District figures reflect official FIR registrations at local police stations, not personal danger on any specific street or neighborhood.'
          ) : (
            'Statistics reflect registered cases per 1 lakh population and reporting volume, not individual safety or danger. Compare only within equivalent measures.'
          )}
        </p>
      </div>

      {onOpenDetailedStats && (
        <button
          type="button"
          onClick={onOpenDetailedStats}
          className="w-full py-2 px-3 text-xs font-medium text-[#0F766E] hover:text-[#0D655E] bg-[#E8F0EE] hover:bg-[#D4E5E2] rounded-md transition-colors text-center cursor-pointer"
        >
          View NCRB Methodology & Official Data Sources
        </button>
      )}
    </article>
  );
};

export default StateSummaryCard;


