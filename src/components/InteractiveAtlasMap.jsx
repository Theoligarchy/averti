import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  MapPin,
  ChevronRight,
  Search,
  X,
  Info
} from 'lucide-react';

import {
  INDIA_STATES_GEOJSON,
  INDIA_DISTRICTS_BY_STATE,
  getDistrictsForState
} from '../data/indiaGeoData';

import {
  ALL_INDIA_STATES,
  STATE_CRIME_MAP,
  getStateBandIndex,
  MAP_RAMP_COLORS,
  NO_DATA_COLOR,
  SELECTED_OUTLINE_COLOR,
  formatIndianNumber,
  getQuintileLegendRanges
} from '../data/crimeData';

// Esri World Light Gray Base: High-performance, restrained, clean cartography
const BASEMAP_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
const BASEMAP_ATTR = '&copy; <a href="https://www.esri.com/">Esri</a>, DeLorme, NAVTEQ';

// Default India geographic center & bounding box
const INDIA_DEFAULT_CENTER = [22.5937, 78.9629];
const INDIA_DEFAULT_ZOOM = 4.4;

// Custom Zoom Controls Component
function CustomZoomControls({ onResetIndia }) {
  const map = useMap();

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1.5 shadow-xs">
      <button
        type="button"
        onClick={() => map.zoomIn()}
        className="w-8 h-8 bg-white hover:bg-[#F6F8F7] text-[#0B1F33] border border-[#D5DCE0] rounded flex items-center justify-center font-bold text-base transition-colors cursor-pointer"
        aria-label="Zoom in"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        className="w-8 h-8 bg-white hover:bg-[#F6F8F7] text-[#0B1F33] border border-[#D5DCE0] rounded flex items-center justify-center font-bold text-base transition-colors cursor-pointer"
        aria-label="Zoom out"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onResetIndia}
        className="w-8 h-8 bg-white hover:bg-[#F6F8F7] text-[#0F766E] border border-[#D5DCE0] rounded flex items-center justify-center transition-colors cursor-pointer"
        aria-label="Reset map view"
        title="Reset to whole India"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// Camera Controller for Smooth State Focus & Reset
function MapCameraController({
  selectedState,
  selectedDistrict,
  stateLayersRef,
  districtLayersRef,
  triggerResetCounter
}) {
  const map = useMap();

  useEffect(() => {
    if (triggerResetCounter > 0 && !selectedState) {
      map.setView(INDIA_DEFAULT_CENTER, INDIA_DEFAULT_ZOOM, {
        animate: true,
        duration: 0.4
      });
      return;
    }

    if (selectedDistrict && districtLayersRef.current[selectedDistrict]) {
      const layer = districtLayersRef.current[selectedDistrict];
      if (layer && typeof layer.getBounds === 'function') {
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [40, 40],
            maxZoom: 9,
            animate: true,
            duration: 0.4
          });
          return;
        }
      }
    }

    if (selectedState && stateLayersRef.current[selectedState]) {
      const stateLayer = stateLayersRef.current[selectedState];
      if (stateLayer && typeof stateLayer.getBounds === 'function') {
        const bounds = stateLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [30, 30],
            maxZoom: 7,
            animate: true,
            duration: 0.4
          });
        }
      }
    } else if (!selectedState) {
      map.setView(INDIA_DEFAULT_CENTER, INDIA_DEFAULT_ZOOM, {
        animate: true,
        duration: 0.3
      });
    }
  }, [selectedState, selectedDistrict, map, stateLayersRef, districtLayersRef, triggerResetCounter]);

  return null;
}

// Autocomplete State Search
function QuickRegionSearch({ searchableRegions, onSelectState }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return searchableRegions
      .filter(r => r.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, searchableRegions]);

  return (
    <div className="relative min-w-[180px] sm:min-w-[220px]">
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Filter map by state..."
          className="w-full pl-8 pr-7 py-1 text-xs bg-[#F6F8F7] border border-[#D5DCE0] rounded text-[#0B1F33] placeholder-[#64748B] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0B1F33] p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {isOpen && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D5DCE0] rounded shadow-md z-[1100] max-h-56 overflow-y-auto py-1 text-xs divide-y divide-[#F1F5F9]">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => (
              <button
                key={`search-region-${item.name}-${idx}`}
                type="button"
                onClick={() => {
                  onSelectState(item.name);
                  setQuery('');
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#E8F0EE] flex items-center justify-between text-[#0B1F33] cursor-pointer"
              >
                <span className="font-medium truncate">{item.name}</span>
                {item.rate !== undefined && (
                  <span className="text-[10px] text-[#0F766E] font-mono">
                    {item.rate.toFixed(1)}/1L
                  </span>
                )}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-xs text-[#64748B] italic">
              No state matching &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * @param {{
 *   selectedState?: string | null;
 *   selectedDistrict?: string | null;
 *   onSelectState: (state: string | null) => void;
 *   onSelectDistrict?: (district: string | null) => void;
 * }} props
 */
export function InteractiveAtlasMap({
  selectedState = null,
  selectedDistrict = null,
  onSelectState,
  onSelectDistrict
}) {
  const stateLayersRef = useRef({});
  const districtLayersRef = useRef({});
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [triggerResetCounter, setTriggerResetCounter] = useState(0);

  const searchableRegions = useMemo(() => {
    return ALL_INDIA_STATES.map(st => {
      const stat = STATE_CRIME_MAP[st];
      return {
        name: st,
        rate: stat?.rate
      };
    });
  }, []);

  // District GeoJSON when a state is selected
  const districtGeoJson = useMemo(() => {
    if (!selectedState) return null;
    return getDistrictsForState(selectedState);
  }, [selectedState]);

  // Clean, consistent State styling (reactive layer.setStyle)
  const getStateStyle = useCallback((feature) => {
    const stateName = feature?.properties?.name;
    const isSelected = selectedState && stateName && selectedState.toLowerCase() === stateName.toLowerCase();
    const stat = STATE_CRIME_MAP[stateName];
    const bandIdx = getStateBandIndex(stateName);
    const fillColor = bandIdx >= 0 ? MAP_RAMP_COLORS[bandIdx] : NO_DATA_COLOR;

    if (isSelected) {
      return {
        fillColor: fillColor,
        weight: 2.8,
        opacity: 1,
        color: SELECTED_OUTLINE_COLOR,
        fillOpacity: 0.88
      };
    }

    return {
      fillColor: fillColor,
      weight: 1,
      opacity: 0.9,
      color: '#CBD5E1',
      fillOpacity: 0.72
    };
  }, [selectedState]);

  // District styling when rendered
  const getDistrictStyle = useCallback((feature) => {
    const districtName = feature?.properties?.name;
    const isSelected = selectedDistrict && districtName && selectedDistrict.toLowerCase() === districtName.toLowerCase();

    if (isSelected) {
      return {
        fillColor: '#0F766E',
        weight: 2.2,
        opacity: 1,
        color: '#0F766E',
        fillOpacity: 0.4
      };
    }

    return {
      fillColor: 'transparent',
      weight: 0.8,
      opacity: 0.7,
      color: '#64748B',
      dashArray: '2, 3',
      fillOpacity: 0.05
    };
  }, [selectedDistrict]);

  // Reactive in-place styling updates for 60 FPS transitions without DOM recreation
  useEffect(() => {
    if (!stateLayersRef.current) return;
    Object.values(stateLayersRef.current).forEach((layer) => {
      if (layer && layer.feature && typeof layer.setStyle === 'function') {
        layer.setStyle(getStateStyle(layer.feature));
      }
    });
  }, [getStateStyle]);

  // State feature interaction handlers
  const onEachStateFeature = useCallback((feature, layer) => {
    const stateName = feature.properties?.name;
    if (!stateName) return;

    layer.feature = feature;
    stateLayersRef.current[stateName] = layer;

    layer.on({
      click: () => {
        onSelectState(selectedState === stateName ? null : stateName);
      },
      mouseover: (e) => {
        const stat = STATE_CRIME_MAP[stateName];
        setHoveredRegion({
          name: stateName,
          rate: stat?.rate,
          count: stat?.count
        });
        const l = e.target;
        if (selectedState !== stateName) {
          l.setStyle({
            weight: 2,
            color: '#0F766E',
            fillOpacity: 0.88
          });
        }
      },
      mouseout: (e) => {
        setHoveredRegion(null);
        const l = e.target;
        if (selectedState !== stateName) {
          l.setStyle(getStateStyle(feature));
        }
      }
    });
  }, [onSelectState, selectedState, getStateStyle]);

  // District feature interaction handlers
  const onEachDistrictFeature = useCallback((feature, layer) => {
    const districtName = feature.properties?.name;
    if (!districtName) return;

    layer.feature = feature;
    districtLayersRef.current[districtName] = layer;

    layer.on({
      click: () => {
        if (onSelectDistrict) {
          onSelectDistrict(selectedDistrict === districtName ? null : districtName);
        }
      },
      mouseover: (e) => {
        setHoveredRegion({
          name: districtName,
          stateName: selectedState
        });
        const l = e.target;
        if (selectedDistrict !== districtName) {
          l.setStyle({
            weight: 1.8,
            color: '#0F766E'
          });
        }
      },
      mouseout: (e) => {
        setHoveredRegion(null);
        const l = e.target;
        if (selectedDistrict !== districtName) {
          l.setStyle(getDistrictStyle(feature));
        }
      }
    });
  }, [onSelectDistrict, selectedDistrict, selectedState, getDistrictStyle]);

  const handleReset = () => {
    onSelectState(null);
    if (onSelectDistrict) onSelectDistrict(null);
    setTriggerResetCounter(prev => prev + 1);
  };

  const quintileRanges = useMemo(() => getQuintileLegendRanges(), []);

  return (
    <div className="relative flex flex-col w-full bg-white rounded-lg border border-[#D5DCE0] overflow-hidden shadow-xs">
      {/* Top Map Breadcrumb & Search Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-white border-b border-[#D5DCE0] flex-wrap gap-2 z-10">
        <div className="flex items-center gap-1.5 text-xs text-[#0B1F33]">
          <span className="font-semibold text-[#0F766E]">National Atlas</span>
          <ChevronRight className="w-3 h-3 text-[#64748B]" />
          <button
            type="button"
            onClick={handleReset}
            className={`hover:text-[#0F766E] transition-colors cursor-pointer ${
              !selectedState ? 'font-bold text-[#0B1F33]' : 'text-[#475569]'
            }`}
          >
            India Overview
          </button>
          {selectedState && (
            <>
              <ChevronRight className="w-3 h-3 text-[#64748B]" />
              <span className="font-bold text-[#0F766E]">{selectedState}</span>
            </>
          )}
          {selectedDistrict && (
            <>
              <ChevronRight className="w-3 h-3 text-[#64748B]" />
              <span className="text-[#475569]">{selectedDistrict}</span>
            </>
          )}
        </div>

        {/* Right: State Search & Reset Button */}
        <div className="flex items-center gap-2">
          <QuickRegionSearch
            searchableRegions={searchableRegions}
            onSelectState={onSelectState}
          />

          {selectedState && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0F766E] bg-[#E8F0EE] hover:bg-[#0F766E] hover:text-white rounded transition-colors cursor-pointer"
              title="Reset to whole India map"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className="relative w-full h-[520px] sm:h-[580px] bg-[#F6F8F7]">
        <MapContainer
          preferCanvas={true}
          center={INDIA_DEFAULT_CENTER}
          zoom={INDIA_DEFAULT_ZOOM}
          minZoom={3.8}
          maxZoom={10}
          maxBounds={[[3.0, 60.0], [40.0, 105.0]]}
          maxBoundsViscosity={0.8}
          scrollWheelZoom={true}
          zoomControl={false}
          className="w-full h-full z-0 font-sans"
        >
          {/* Touch-Friendly Custom Zoom Controls */}
          <CustomZoomControls onResetIndia={handleReset} />

          {/* Clean Cartographic Basemap TileLayer */}
          <TileLayer
            url={BASEMAP_URL}
            attribution={BASEMAP_ATTR}
            maxZoom={12}
          />

          {/* Smooth Camera Controller */}
          <MapCameraController
            selectedState={selectedState}
            selectedDistrict={selectedDistrict}
            stateLayersRef={stateLayersRef}
            districtLayersRef={districtLayersRef}
            triggerResetCounter={triggerResetCounter}
          />

          {/* Permanent State Boundaries Layer with Reactive in-place styling */}
          <GeoJSON
            key="india-state-boundary-layer"
            data={INDIA_STATES_GEOJSON}
            style={getStateStyle}
            onEachFeature={onEachStateFeature}
          />

          {/* Optional District Boundaries when state is focused */}
          {selectedState && districtGeoJson && (
            <GeoJSON
              key={`district-layer-${selectedState}`}
              data={districtGeoJson}
              style={getDistrictStyle}
              onEachFeature={onEachDistrictFeature}
            />
          )}
        </MapContainer>

        {/* Live Hover Info Overlay (Authoritative, Minimal) */}
        {hoveredRegion && (
          <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-xs border border-[#D5DCE0] rounded p-2.5 shadow-md pointer-events-none text-xs space-y-0.5">
            <div className="font-bold text-[#0B1F33] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>{hoveredRegion.name}</span>
            </div>
            {hoveredRegion.rate !== undefined && (
              <div className="text-[#475569] text-[11px]">
                Registered Rate: <strong className="text-[#0F766E]">{hoveredRegion.rate?.toFixed(1)}</strong> per 1 lakh
              </div>
            )}
            {hoveredRegion.count !== undefined && (
              <div className="text-[10px] text-[#64748B]">
                Total FIRs: {formatIndianNumber(hoveredRegion.count)}
              </div>
            )}
          </div>
        )}

        {/* Compact, Clean Quintile Legend at Bottom Left */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-xs border border-[#D5DCE0] rounded p-2.5 shadow-md text-xs space-y-1.5 max-w-[240px]">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#0B1F33]">
            <span>NCRB 2024 Crime Rate</span>
            <span className="text-[10px] text-[#64748B]">Per 1L pop.</span>
          </div>

          <div className="space-y-1">
            {quintileRanges.map((q, idx) => (
              <div key={`quintile-band-${idx}-${q.bandName}`} className="flex items-center justify-between gap-2 text-[10px] text-[#475569]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-xs shrink-0 border border-slate-300"
                    style={{ backgroundColor: q.color }}
                  />
                  <span className="truncate">{q.bandName}</span>
                </div>
                <span className="font-mono text-[#64748B] tabular-nums shrink-0 ml-1">
                  {q.min.toFixed(0)}–{q.max.toFixed(0)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-1 border-t border-[#D5DCE0]/60 text-[9.5px] text-[#64748B] flex items-center gap-1">
            <Info className="w-3 h-3 text-[#0F766E] shrink-0" />
            <span>Click any state to inspect details</span>
          </div>
        </div>
      </div>

      {/* Bottom Cartographic Source Caption */}
      <div className="px-3 py-1.5 bg-[#F6F8F7] border-t border-[#D5DCE0] text-[11px] text-[#64748B] flex items-center justify-between flex-wrap gap-2">
        <span>Survey of India boundary alignment · NCRB Crime in India 2024 returns</span>
        <span>Canvas 60 FPS vector renderer</span>
      </div>
    </div>
  );
}

export default InteractiveAtlasMap;
