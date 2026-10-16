import React, { useState, useEffect } from 'react';
import {
  Layers,
  Shield,
  Flame,
  HeartHandshake,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Info,
  MapPin,
  SlidersHorizontal,
  X,
  Search,
  Globe,
  Sparkles,
  ExternalLink,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { ActiveLayerToggles } from '../data/atlasLayersData';

export interface InteractiveMapLegendProps {
  // Layer visibility toggles
  layers: ActiveLayerToggles;
  onToggleLayer: (layerKey: keyof ActiveLayerToggles, value?: boolean) => void;
  onToggleAllLayers?: (visible: boolean) => void;

  // Selected geography & inspection info
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

  // Feature counts in current view
  featureCounts?: {
    police: number;
    hotspots: number;
    helpCenters: number;
  };

  // Choropleth / quintiles & density integration
  basemapStyle?: 'dual' | 'satellite' | 'osm' | string;
  activeBandFilter?: number | null;
  onSelectBandFilter?: (bandIndex: number | null) => void;
  showDensityLayer?: boolean;
  onToggleDensityLayer?: (show: boolean) => void;

  className?: string;
  defaultExpanded?: boolean;
}

export interface GroundedSearchResult {
  text: string;
  queries: string[];
  sources: Array<{ title: string; url: string }>;
  isGrounded: boolean;
  timestamp: string;
}

export const InteractiveMapLegend: React.FC<InteractiveMapLegendProps> = ({
  layers,
  onToggleLayer,
  onToggleAllLayers,
  selectedState = null,
  selectedDistrict = null,
  hoveredRegion = null,
  featureCounts = { police: 0, hotspots: 0, helpCenters: 0 },
  basemapStyle = 'dual',
  activeBandFilter = null,
  onSelectBandFilter,
  showDensityLayer = false,
  onToggleDensityLayer,
  className = '',
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [activeTab, setActiveTab] = useState<'layers' | 'search_intel' | 'crime_scale'>('layers');
  const [showHelperInfo, setShowHelperInfo] = useState<boolean>(false);

  // Google Search Grounding state (powered by gemini-3.8-flash)
  const [groundedTopic, setGroundedTopic] = useState<'public_safety' | 'police_stations' | 'crime_hotspots' | 'help_centers'>('public_safety');
  const [groundedData, setGroundedData] = useState<GroundedSearchResult | null>(null);
  const [isFetchingGrounding, setIsFetchingGrounding] = useState<boolean>(false);
  const [groundingError, setGroundingError] = useState<string | null>(null);

  const isSatellite = basemapStyle === 'satellite';

  // Count active layers
  const activeCount = Object.values(layers).filter(Boolean).length;
  const totalLayers = 4; // police, hotspots, helpCenters, choropleth

  // Trigger Google Search Grounding when search_intel tab is opened or topic changes
  const fetchGroundedIntel = async (topic = groundedTopic) => {
    setIsFetchingGrounding(true);
    setGroundingError(null);
    try {
      const res = await fetch('/api/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district: selectedDistrict,
          state: selectedState,
          topic
        })
      });
      if (!res.ok) throw new Error('Search grounding request failed');
      const data = await res.json();
      setGroundedData(data);
    } catch (err: any) {
      console.warn('Grounding fetch fallback:', err);
      setGroundingError(err?.message || 'Failed to fetch live search grounding');
    } finally {
      setIsFetchingGrounding(false);
    }
  };

  // Reset or re-fetch when region changes and user is on search_intel tab
  useEffect(() => {
    if (activeTab === 'search_intel') {
      fetchGroundedIntel(groundedTopic);
    } else {
      // Clear previous district's search result so it refreshes fresh on next tab switch
      setGroundedData(null);
    }
  }, [selectedDistrict, selectedState]);

  return (
    <div
      role="region"
      aria-label="Interactive WebGIS Layer Controller and Legend"
      className={`absolute bottom-3 left-3 z-[1000] w-[290px] sm:w-[345px] max-w-[calc(100vw-24px)] rounded-xl border transition-all duration-200 select-none shadow-xl text-[11px] ${
        isSatellite
          ? 'bg-[#0B1F33]/95 backdrop-blur-md border-white/20 text-white shadow-black/50'
          : 'bg-white/95 backdrop-blur-md border-[#D5DCE0] text-[#0B1F33] shadow-slate-900/15'
      } ${className}`}
    >
      {/* Top Header Row with Expand/Collapse & Quick Status */}
      <div
        className={`px-3 py-2.5 border-b flex items-center justify-between gap-1.5 ${
          isSatellite ? 'border-white/15' : 'border-[#D5DCE0]/80'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative">
            <span
              className={`flex items-center justify-center w-6 h-6 rounded-md ${
                isSatellite ? 'bg-teal-500/20 text-teal-300' : 'bg-[#0F766E]/10 text-[#0F766E]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
            </span>
            <span
              className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
                activeCount > 0 ? 'bg-emerald-500 ring-2 ring-emerald-500/30' : 'bg-slate-400'
              }`}
            />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-xs leading-none truncate flex items-center gap-1.5">
              <span>Interactive Layers &amp; Legend</span>
            </h4>
            <div className="flex items-center gap-1 mt-0.5">
              <span
                className={`text-[10px] leading-tight truncate ${
                  isSatellite ? 'text-slate-300' : 'text-[#64748B]'
                }`}
              >
                {activeCount} of {totalLayers} layers visible
              </span>
              {(selectedDistrict || selectedState) && (
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-medium truncate ${
                    isSatellite ? 'bg-white/15 text-teal-300' : 'bg-[#0F766E]/10 text-[#0F766E]'
                  }`}
                >
                  • {selectedDistrict || selectedState}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Info Modal Toggle */}
          <button
            type="button"
            onClick={() => setShowHelperInfo(prev => !prev)}
            className={`p-1 rounded transition-colors cursor-pointer ${
              showHelperInfo
                ? (isSatellite ? 'bg-white/20 text-teal-300' : 'bg-[#0F766E]/15 text-[#0F766E]')
                : (isSatellite ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-[#64748B] hover:text-[#0B1F33] hover:bg-[#F6F8F7]')
            }`}
            title="Layer symbology & verification info"
            aria-label="Layer symbology & verification info"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          {/* Expand / Collapse Button */}
          <button
            type="button"
            onClick={() => setIsExpanded(prev => !prev)}
            className={`p-1 rounded transition-colors cursor-pointer ${
              isSatellite
                ? 'text-slate-300 hover:text-white hover:bg-white/10'
                : 'text-[#64748B] hover:text-[#0B1F33] hover:bg-[#F6F8F7]'
            }`}
            title={isExpanded ? 'Collapse layer panel' : 'Expand layer panel'}
            aria-label={isExpanded ? 'Collapse layer panel' : 'Expand layer panel'}
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

      {/* Info Popover / Symbology Explainer */}
      {showHelperInfo && (
        <div
          className={`p-2.5 mx-2 my-2 rounded-lg border text-[10px] leading-snug space-y-1.5 ${
            isSatellite
              ? 'bg-slate-900/95 border-teal-500/30 text-slate-200 shadow-md'
              : 'bg-[#F0FDF4]/95 border-[#0F766E]/30 text-[#0F766E] shadow-sm'
          }`}
        >
          <div className="flex items-start justify-between gap-1 font-semibold text-[11px]">
            <span className="flex items-center gap-1 text-[#0B1F33] dark:text-white">
              <SlidersHorizontal className="w-3 h-3 text-[#0F766E] shrink-0" />
              <span>WebGIS Layer Symbology</span>
            </span>
            <button
              type="button"
              onClick={() => setShowHelperInfo(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className={isSatellite ? 'text-slate-300' : 'text-[#334155]'}>
            Toggle public safety layers on/off to analyze jurisdictional coverage, hotspot perimeters, and emergency response points across any Indian district. Live search grounding verifies latest advisories.
          </p>
          <div className="grid grid-cols-2 gap-1.5 pt-1 text-[9px] border-t border-black/10 dark:border-white/10">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
              <span className={isSatellite ? 'text-slate-200' : 'text-[#1E293B]'}>Police Stations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/30 shrink-0" />
              <span className={isSatellite ? 'text-slate-200' : 'text-[#1E293B]'}>Crime Hotspots</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
              <span className={isSatellite ? 'text-slate-200' : 'text-[#1E293B]'}>Help / 112 Centers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#B8613A] shrink-0" />
              <span className={isSatellite ? 'text-slate-200' : 'text-[#1E293B]'}>Quintile Choropleth</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Body (When Expanded) */}
      {isExpanded && (
        <div className="p-2.5 space-y-2">
          {/* Sub-tabs: Data Layer Toggles vs Google Search Intel vs Choropleth Scales */}
          <div className="flex rounded-md p-0.5 bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-[9.5px] font-medium gap-0.5">
            <button
              type="button"
              onClick={() => setActiveTab('layers')}
              className={`flex-1 py-1 px-1 rounded transition-all cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'layers'
                  ? (isSatellite ? 'bg-teal-600 text-white font-semibold shadow-xs' : 'bg-white text-[#0B1F33] font-semibold shadow-xs')
                  : (isSatellite ? 'text-slate-300 hover:text-white' : 'text-[#64748B] hover:text-[#0B1F33]')
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Layers ({activeCount}/{totalLayers})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('search_intel');
                if (!groundedData) {
                  fetchGroundedIntel(groundedTopic);
                }
              }}
              className={`flex-1 py-1 px-1 rounded transition-all cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'search_intel'
                  ? (isSatellite ? 'bg-teal-600 text-white font-semibold shadow-xs' : 'bg-white text-[#0B1F33] font-semibold shadow-xs')
                  : (isSatellite ? 'text-slate-300 hover:text-white' : 'text-[#64748B] hover:text-[#0B1F33]')
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Live Intel</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('crime_scale')}
              className={`flex-1 py-1 px-1 rounded transition-all cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'crime_scale'
                  ? (isSatellite ? 'bg-teal-600 text-white font-semibold shadow-xs' : 'bg-white text-[#0B1F33] font-semibold shadow-xs')
                  : (isSatellite ? 'text-slate-300 hover:text-white' : 'text-[#64748B] hover:text-[#0B1F33]')
              }`}
            >
              <span className="w-2 h-2 rounded-xs bg-[#B8613A]" />
              <span>Scales</span>
            </button>
          </div>

          {/* TAB 1: DATA LAYERS TOGGLE CONTROLLER */}
          {activeTab === 'layers' && (
            <div className="space-y-1.5 pt-0.5">
              {/* Layer 1: Police Stations */}
              <div
                onClick={() => onToggleLayer('policeStations')}
                role="checkbox"
                aria-checked={layers.policeStations}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    onToggleLayer('policeStations');
                  }
                }}
                className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  layers.policeStations
                    ? (isSatellite
                        ? 'bg-blue-950/40 border-blue-500/40 text-blue-100'
                        : 'bg-blue-50/80 border-blue-200 text-[#0F3866]')
                    : (isSatellite
                        ? 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                        : 'bg-[#F8FAFC] border-slate-200 text-slate-500 hover:bg-slate-100/70')
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                      layers.policeStations
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-[11px] flex items-center gap-1.5 truncate">
                      <span>Police Stations</span>
                      {featureCounts.police > 0 && (
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                            layers.policeStations
                              ? 'bg-blue-200 dark:bg-blue-800 text-blue-950 dark:text-blue-100'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {featureCounts.police} in view
                        </span>
                      )}
                    </div>
                    <div className={`text-[9px] truncate ${isSatellite ? 'text-slate-300' : 'text-slate-500'}`}>
                      Jurisdictions, SHOs, 24x7 desk contacts
                    </div>
                  </div>
                </div>

                {/* Switch Toggle */}
                <div
                  className={`w-8 h-4.5 rounded-full p-0.5 transition-colors relative shrink-0 ${
                    layers.policeStations ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transform transition-transform ${
                      layers.policeStations ? 'translate-x-3.5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              {/* Layer 2: Crime Hotspots */}
              <div
                onClick={() => onToggleLayer('crimeHotspots')}
                role="checkbox"
                aria-checked={layers.crimeHotspots}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    onToggleLayer('crimeHotspots');
                  }
                }}
                className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  layers.crimeHotspots
                    ? (isSatellite
                        ? 'bg-rose-950/40 border-rose-500/40 text-rose-100'
                        : 'bg-rose-50/80 border-rose-200 text-[#881337]')
                    : (isSatellite
                        ? 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                        : 'bg-[#F8FAFC] border-slate-200 text-slate-500 hover:bg-slate-100/70')
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                      layers.crimeHotspots
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-[11px] flex items-center gap-1.5 truncate">
                      <span>Crime Hotspots</span>
                      {featureCounts.hotspots > 0 && (
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                            layers.crimeHotspots
                              ? 'bg-rose-200 dark:bg-rose-900 text-rose-950 dark:text-rose-100'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {featureCounts.hotspots} flagged
                        </span>
                      )}
                    </div>
                    <div className={`text-[9px] truncate ${isSatellite ? 'text-slate-300' : 'text-slate-500'}`}>
                      Radius zones, 30d FIRs, transit nodes
                    </div>
                  </div>
                </div>

                {/* Switch Toggle */}
                <div
                  className={`w-8 h-4.5 rounded-full p-0.5 transition-colors relative shrink-0 ${
                    layers.crimeHotspots ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transform transition-transform ${
                      layers.crimeHotspots ? 'translate-x-3.5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              {/* Layer 3: Help Centers & Medical */}
              <div
                onClick={() => onToggleLayer('helpCenters')}
                role="checkbox"
                aria-checked={layers.helpCenters}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    onToggleLayer('helpCenters');
                  }
                }}
                className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  layers.helpCenters
                    ? (isSatellite
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
                        : 'bg-emerald-50/80 border-emerald-200 text-[#064E3B]')
                    : (isSatellite
                        ? 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                        : 'bg-[#F8FAFC] border-slate-200 text-slate-500 hover:bg-slate-100/70')
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                      layers.helpCenters
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <HeartHandshake className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-[11px] flex items-center gap-1.5 truncate">
                      <span>Help Centers &amp; Hospitals</span>
                      {featureCounts.helpCenters > 0 && (
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                            layers.helpCenters
                              ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-950 dark:text-emerald-100'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {featureCounts.helpCenters} active
                        </span>
                      )}
                    </div>
                    <div className={`text-[9px] truncate ${isSatellite ? 'text-slate-300' : 'text-slate-500'}`}>
                      Dial 112, trauma wards, women helplines
                    </div>
                  </div>
                </div>

                {/* Switch Toggle */}
                <div
                  className={`w-8 h-4.5 rounded-full p-0.5 transition-colors relative shrink-0 ${
                    layers.helpCenters ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transform transition-transform ${
                      layers.helpCenters ? 'translate-x-3.5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              {/* Layer 4: Choropleth Boundary Polygons */}
              <div
                onClick={() => onToggleLayer('choroplethBands')}
                role="checkbox"
                aria-checked={layers.choroplethBands}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    onToggleLayer('choroplethBands');
                  }
                }}
                className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  layers.choroplethBands
                    ? (isSatellite
                        ? 'bg-amber-950/40 border-amber-500/40 text-amber-100'
                        : 'bg-amber-50/80 border-amber-200 text-[#78350F]')
                    : (isSatellite
                        ? 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                        : 'bg-[#F8FAFC] border-slate-200 text-slate-500 hover:bg-slate-100/70')
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                      layers.choroplethBands
                        ? 'bg-[#B8613A] text-white shadow-xs'
                        : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-[11px] flex items-center gap-1.5 truncate">
                      <span>Boundary Shading Fill</span>
                    </div>
                    <div className={`text-[9px] truncate ${isSatellite ? 'text-slate-300' : 'text-slate-500'}`}>
                      {showDensityLayer ? 'Heatmap density gradient' : '5-quintile state/district fills'}
                    </div>
                  </div>
                </div>

                {/* Switch Toggle */}
                <div
                  className={`w-8 h-4.5 rounded-full p-0.5 transition-colors relative shrink-0 ${
                    layers.choroplethBands ? 'bg-[#B8613A]' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transform transition-transform ${
                      layers.choroplethBands ? 'translate-x-3.5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              {/* Master Actions: Show All / Hide All */}
              {onToggleAllLayers && (
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleAllLayers(true);
                    }}
                    className={`flex-1 py-1 px-2 rounded text-[10px] font-medium border transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                      isSatellite
                        ? 'border-white/15 hover:bg-white/10 text-slate-200'
                        : 'border-[#CBD5E1] bg-white hover:bg-slate-50 text-[#334155]'
                    }`}
                  >
                    <Eye className="w-3 h-3 text-teal-600" />
                    <span>Enable All Layers</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleAllLayers(false);
                    }}
                    className={`flex-1 py-1 px-2 rounded text-[10px] font-medium border transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                      isSatellite
                        ? 'border-white/15 hover:bg-white/10 text-slate-200'
                        : 'border-[#CBD5E1] bg-white hover:bg-slate-50 text-[#334155]'
                    }`}
                  >
                    <EyeOff className="w-3 h-3 text-slate-500" />
                    <span>Solo Basemap</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIVE GOOGLE SEARCH GROUNDED INTEL (gemini-3.8-flash + googleSearch) */}
          {activeTab === 'search_intel' && (
            <div className="space-y-2 pt-0.5">
              {/* Grounded Topic Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[9px] no-scrollbar">
                <button
                  type="button"
                  onClick={() => {
                    setGroundedTopic('public_safety');
                    fetchGroundedIntel('public_safety');
                  }}
                  className={`px-2 py-0.5 rounded-full shrink-0 font-medium transition-colors cursor-pointer ${
                    groundedTopic === 'public_safety'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : (isSatellite ? 'bg-white/10 text-slate-300 hover:bg-white/15' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
                  }`}
                >
                  All Advisories
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGroundedTopic('police_stations');
                    fetchGroundedIntel('police_stations');
                  }}
                  className={`px-2 py-0.5 rounded-full shrink-0 font-medium transition-colors cursor-pointer ${
                    groundedTopic === 'police_stations'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : (isSatellite ? 'bg-white/10 text-slate-300 hover:bg-white/15' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
                  }`}
                >
                  Police Stations
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGroundedTopic('crime_hotspots');
                    fetchGroundedIntel('crime_hotspots');
                  }}
                  className={`px-2 py-0.5 rounded-full shrink-0 font-medium transition-colors cursor-pointer ${
                    groundedTopic === 'crime_hotspots'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : (isSatellite ? 'bg-white/10 text-slate-300 hover:bg-white/15' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
                  }`}
                >
                  Hotspots
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGroundedTopic('help_centers');
                    fetchGroundedIntel('help_centers');
                  }}
                  className={`px-2 py-0.5 rounded-full shrink-0 font-medium transition-colors cursor-pointer ${
                    groundedTopic === 'help_centers'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : (isSatellite ? 'bg-white/10 text-slate-300 hover:bg-white/15' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
                  }`}
                >
                  112 / Help
                </button>
              </div>

              {/* Status & Refresh Banner */}
              <div
                className={`p-2 rounded-lg border flex items-center justify-between gap-1.5 ${
                  isSatellite
                    ? 'bg-teal-950/40 border-teal-500/30 text-teal-100'
                    : 'bg-teal-50/80 border-teal-200 text-[#0F766E]'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1 font-semibold text-[10px]">
                    <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="truncate">Google Search Grounded Intel</span>
                  </div>
                  <div className="text-[8.5px] opacity-80 truncate">
                    {selectedDistrict || selectedState || 'National Overview'} • gemini-3.8-flash
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isFetchingGrounding}
                  onClick={() => fetchGroundedIntel(groundedTopic)}
                  className="px-2 py-1 rounded bg-[#0F766E] hover:bg-[#0D655E] text-white text-[9px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
                  title="Re-query Google Search for live safety advisories"
                >
                  {isFetchingGrounding ? (
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-2.5 h-2.5" />
                  )}
                  <span>{isFetchingGrounding ? 'Searching...' : 'Refresh'}</span>
                </button>
              </div>

              {/* Grounded Content Display */}
              {isFetchingGrounding ? (
                <div className="py-6 flex flex-col items-center justify-center gap-2 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin text-[#0F766E]" />
                  <span className="text-[10px]">Grounded search via gemini-3.8-flash &amp; Google Search...</span>
                </div>
              ) : groundingError ? (
                <div className="p-2.5 rounded-lg border border-rose-300 bg-rose-50 text-rose-800 text-[10px] space-y-1">
                  <div className="font-semibold">Unable to fetch live search grounding</div>
                  <div className="text-[9px] opacity-90">{groundingError}</div>
                  <button
                    type="button"
                    onClick={() => fetchGroundedIntel(groundedTopic)}
                    className="underline text-[9px] font-medium cursor-pointer"
                  >
                    Retry search
                  </button>
                </div>
              ) : groundedData ? (
                <div className="space-y-2 max-h-[230px] overflow-y-auto pr-1">
                  {/* Formatted Text */}
                  <div
                    className={`p-2 rounded-lg border text-[10px] leading-relaxed whitespace-pre-line ${
                      isSatellite
                        ? 'bg-white/5 border-white/10 text-slate-200'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    {groundedData.text}
                  </div>

                  {/* Search Queries Executed */}
                  {groundedData.queries && groundedData.queries.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[9px] font-semibold text-slate-500 flex items-center gap-1">
                        <Search className="w-2.5 h-2.5" />
                        <span>Google Search Queries Executed</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {groundedData.queries.map((q, idx) => (
                          <span
                            key={idx}
                            className={`text-[8.5px] px-1.5 py-0.5 rounded font-mono truncate max-w-full ${
                              isSatellite ? 'bg-white/10 text-slate-300' : 'bg-slate-200/80 text-slate-700'
                            }`}
                          >
                            "{q}"
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Web Citations */}
                  {groundedData.sources && groundedData.sources.length > 0 && (
                    <div className="space-y-1 pt-1 border-t border-black/10 dark:border-white/10">
                      <div className="text-[9px] font-semibold text-slate-500 flex items-center gap-1">
                        <Globe className="w-2.5 h-2.5 text-blue-500" />
                        <span>Verified Citations &amp; Portals</span>
                      </div>
                      <div className="space-y-1">
                        {groundedData.sources.slice(0, 3).map((src, idx) => (
                          <a
                            key={idx}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center justify-between p-1 rounded border text-[9px] transition-colors cursor-pointer ${
                              isSatellite
                                ? 'border-white/10 hover:bg-white/10 text-teal-300'
                                : 'border-slate-200 hover:bg-slate-100 text-blue-700'
                            }`}
                          >
                            <span className="truncate pr-1 font-medium">{src.title}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-70" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 text-center text-slate-400 space-y-1.5">
                  <p className="text-[10px]">Explore real-time verified intelligence for {selectedDistrict || selectedState || 'all India'}.</p>
                  <button
                    type="button"
                    onClick={() => fetchGroundedIntel(groundedTopic)}
                    className="px-2.5 py-1 rounded bg-[#0F766E] text-white font-medium text-[9px] hover:bg-[#0D655E] cursor-pointer inline-flex items-center gap-1"
                  >
                    <Search className="w-3 h-3" />
                    <span>Run Grounded Search</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CHOROPLETH SCALES & HEATMAP BREAKDOWN */}
          {activeTab === 'crime_scale' && (
            <div className="space-y-1.5 pt-0.5">
              {/* Density toggle pill */}
              {onToggleDensityLayer && (
                <div className="flex items-center justify-between pb-1 border-b border-black/10 dark:border-white/10">
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    Mode: {showDensityLayer ? 'Continuous Heatmap' : '5-Quintile Classification'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleDensityLayer(!showDensityLayer)}
                    className={`px-2 py-0.5 text-[9px] font-bold rounded cursor-pointer transition-colors ${
                      showDensityLayer
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    Switch to {showDensityLayer ? 'Quintiles' : 'Heatmap'}
                  </button>
                </div>
              )}

              {/* 5 Quintile Color Swatches */}
              {!showDensityLayer ? (
                <div className="space-y-1">
                  <div className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                    National Crime Rate Quintiles (Cases / 1 Lakh)
                  </div>
                  <div className="flex rounded-md overflow-hidden h-3 border border-black/15 shadow-2xs">
                    <div style={{ backgroundColor: '#F7EFE5' }} className="flex-1" title="Lowest fifth" />
                    <div style={{ backgroundColor: '#EBCDB1' }} className="flex-1" title="Lower" />
                    <div style={{ backgroundColor: '#D9996B' }} className="flex-1" title="Middle" />
                    <div style={{ backgroundColor: '#B8613A' }} className="flex-1" title="Higher" />
                    <div style={{ backgroundColor: '#7F3420' }} className="flex-1" title="Highest fifth" />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>Low (Q1)</span>
                    <span>Median (Q3)</span>
                    <span>High (Q5)</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-[10px] font-semibold text-rose-700 dark:text-rose-400">
                    Crime Density Choropleth Gradient
                  </div>
                  <div
                    className="h-3 rounded-md border border-rose-300 shadow-2xs"
                    style={{
                      background: 'linear-gradient(to right, #FEF08A, #FBBF24, #F97316, #EF4444, #991B1B)'
                    }}
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>~300 / 1L</span>
                    <span>~410 / 1L</span>
                    <span>~520+ / 1L</span>
                  </div>
                </div>
              )}

              {/* Quick filter indicator if active */}
              {activeBandFilter !== null && onSelectBandFilter && (
                <div className="pt-1 flex items-center justify-between text-[10px] text-teal-700 dark:text-teal-300">
                  <span>Filtered to Band Q{activeBandFilter + 1}</span>
                  <button
                    type="button"
                    onClick={() => onSelectBandFilter(null)}
                    className="underline text-[9px] cursor-pointer"
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Active Hover / Inspect Readout */}
          {hoveredRegion && (
            <div
              className={`p-1.5 rounded-md border text-[10px] flex items-center justify-between ${
                isSatellite ? 'bg-white/10 border-white/15' : 'bg-[#F1F5F9] border-[#CBD5E1]'
              }`}
            >
              <div className="truncate pr-1">
                <span className="font-semibold">{hoveredRegion.name}</span>
                <span className="text-[9px] opacity-75 ml-1">
                  ({hoveredRegion.type})
                </span>
              </div>
              <div className="font-mono font-bold shrink-0 text-[#0F766E] dark:text-teal-300">
                {hoveredRegion.rate !== undefined && hoveredRegion.rate !== null
                  ? `${hoveredRegion.rate.toFixed(1)}/1L`
                  : 'Pending'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InteractiveMapLegend;
