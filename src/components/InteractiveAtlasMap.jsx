import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, Circle, LayerGroup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  RotateCcw,
  Layers,
  ZoomIn,
  ZoomOut,
  MapPin,
  Info,
  ChevronRight,
  ShieldAlert,
  Plus,
  Minus,
  Search,
  X,
  Globe,
  Flame,
  Shield,
  HeartHandshake,
  Phone,
  Clock,
  Navigation
} from 'lucide-react';

import {
  INDIA_STATES_GEOJSON,
  INDIA_DISTRICTS_BY_STATE,
  getDistrictsForState,
  DISTRICT_KNOWN_ALIASES,
  getDistrictCentroid,
  getDistrictFeature
} from '../data/indiaGeoData';

import {
  ALL_INDIA_STATES,
  STATE_CRIME_MAP,
  getStateBandIndex,
  MAP_RAMP_COLORS,
  NO_DATA_COLOR,
  SELECTED_OUTLINE_COLOR,
  formatIndianNumber,
  getQuintileLegendRanges,
  getDistrictHeatmapColor,
  getDensityLevelLabel,
  CRIME_DENSITY_HEATMAP_STOPS
} from '../data/crimeData';

import {
  MOCK_POLICE_STATIONS,
  MOCK_CRIME_HOTSPOTS,
  MOCK_HELP_CENTERS,
  getFilteredLayerFeatures
} from '../data/atlasLayersData';

import { InteractiveMapLegend } from './InteractiveMapLegend';
import { MapLegend } from './MapLegend';

// Basemap configurations: Dual-Layer stack, High-Resolution Earth Satellite, and OpenStreetMap
const BASEMAP_PRESETS = {
  dual: {
    id: 'dual',
    name: 'Dual-Layer Canvas',
    baseUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    referenceUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, DeLorme, NAVTEQ',
    maxZoom: 16
  },
  satellite: {
    id: 'satellite',
    name: 'Earth / Satellite',
    baseUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    referenceUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics, CNES/Airbus DS',
    maxZoom: 18
  },
  osm: {
    id: 'osm',
    name: 'OpenStreetMap Detailed',
    baseUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    referenceUrl: null,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }
};

// Sets up a dedicated Leaflet pane above polygon fills (zIndex: 450) with pointerEvents: none
function LabelsPaneSetup() {
  const map = useMap();
  useEffect(() => {
    if (!map.getPane('labelsPane')) {
      const pane = map.createPane('labelsPane');
      pane.style.zIndex = '450';
      pane.style.pointerEvents = 'none';
    }
  }, [map]);
  return null;
}



// Default India geographic center & bounding box
const INDIA_DEFAULT_CENTER = [22.5937, 78.9629];
const INDIA_DEFAULT_ZOOM = 4.4;
const INDIA_BOUNDS = [
  [6.5, 68.0],
  [37.5, 97.5]
];

// Douglas-Peucker point-reduction algorithm for geometry simplification
function getSqSegDist(p, p1, p2) {
  let x = p1[0];
  let y = p1[1];
  let dx = p2[0] - x;
  let dy = p2[1] - y;
  if (dx !== 0 || dy !== 0) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = p2[0];
      y = p2[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }
  dx = p[0] - x;
  dy = p[1] - y;
  return dx * dx + dy * dy;
}

function simplifyPoints(points, sqTolerance) {
  if (!points || points.length <= 4) return points;
  let maxSqDist = 0;
  let index = 0;
  const last = points.length - 1;
  for (let i = 1; i < last; i++) {
    const sqDist = getSqSegDist(points[i], points[0], points[last]);
    if (sqDist > maxSqDist) {
      index = i;
      maxSqDist = sqDist;
    }
  }
  if (maxSqDist > sqTolerance) {
    const left = simplifyPoints(points.slice(0, index + 1), sqTolerance);
    const right = simplifyPoints(points.slice(index), sqTolerance);
    return left.slice(0, -1).concat(right);
  }
  return [points[0], points[last]];
}

// Geometry Simplifier: Simplifies coordinates if GeoJSON string exceeds 2MB
function simplifyGeoJsonIfNeeded(geoJson, byteThreshold = 2 * 1024 * 1024) {
  try {
    const jsonString = JSON.stringify(geoJson);
    const sizeBytes = new Blob([jsonString]).size;
    if (sizeBytes <= byteThreshold) {
      console.log(`[GeoJSON Engine] State boundary GeoJSON loaded (${(sizeBytes / 1024).toFixed(1)} KB) - within 2MB threshold.`);
      return geoJson;
    }

    console.log(`[GeoJSON Engine] GeoJSON size (${(sizeBytes / (1024 * 1024)).toFixed(2)} MB) exceeds 2MB. Applying Douglas-Peucker simplification...`);
    const tolerance = 0.0005; // ~50m threshold
    const sqTolerance = tolerance * tolerance;

    const simplifiedFeatures = geoJson.features.map(feature => {
      if (feature.geometry.type === 'Polygon') {
        const simplifiedCoords = feature.geometry.coordinates.map(ring => {
          const simplifiedRing = simplifyPoints(ring, sqTolerance);
          // Keep valid closed polygon ring (min 4 points)
          return simplifiedRing.length >= 4 ? simplifiedRing : ring;
        });
        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: simplifiedCoords
          }
        };
      } else if (feature.geometry.type === 'MultiPolygon') {
        const simplifiedCoords = feature.geometry.coordinates.map(poly =>
          poly.map(ring => {
            const simplifiedRing = simplifyPoints(ring, sqTolerance);
            return simplifiedRing.length >= 4 ? simplifiedRing : ring;
          })
        );
        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: simplifiedCoords
          }
        };
      }
      return feature;
    });

    return {
      ...geoJson,
      features: simplifiedFeatures
    };
  } catch (err) {
    console.warn('[GeoJSON Engine] Simplification skipped:', err);
    return geoJson;
  }
}

// Controller component to handle flyToBounds and camera synchronization
function MapCameraController({
  selectedState,
  selectedDistrict,
  stateLayersRef,
  districtLayersRef,
  districtGeoJson,
  triggerResetCounter
}) {
  const map = useMap();

  useEffect(() => {
    if (!selectedState) {
      map.flyToBounds(INDIA_BOUNDS, {
        padding: [20, 20],
        duration: 1.0,
        easeLinearity: 0.25
      });
      return;
    }

    // If district is selected, zoom directly to district polygon
    if (selectedDistrict) {
      if (districtLayersRef.current[selectedDistrict]) {
        const districtLayer = districtLayersRef.current[selectedDistrict];
        try {
          if (districtLayer.bringToFront) districtLayer.bringToFront();
        } catch (e) {
          // ignore
        }
        map.flyToBounds(districtLayer.getBounds(), {
          padding: [50, 50],
          maxZoom: 10,
          duration: 1.1
        });
        return;
      }

      // Instant geometry bounds calculation fallback using getDistrictFeature
      const feat = getDistrictFeature(selectedState, selectedDistrict);
      if (feat) {
        try {
          const b = L.geoJSON(feat).getBounds();
          if (b.isValid()) {
            map.flyToBounds(b, {
              padding: [50, 50],
              maxZoom: 10,
              duration: 1.1
            });
            return;
          }
        } catch (e) {
          // ignore
        }
      }
    }

    // Zoom to state
    if (selectedState) {
      if (stateLayersRef.current[selectedState]) {
        const stateLayer = stateLayersRef.current[selectedState];
        map.flyToBounds(stateLayer.getBounds(), {
          padding: [35, 35],
          maxZoom: 7.5,
          duration: 1.1
        });
        return;
      }

      const feat = INDIA_STATES_GEOJSON.features.find(f => f.properties?.name === selectedState);
      if (feat) {
        try {
          const b = L.geoJSON(feat).getBounds();
          if (b.isValid()) {
            map.flyToBounds(b, {
              padding: [35, 35],
              maxZoom: 7.5,
              duration: 1.1
            });
            return;
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }, [selectedState, selectedDistrict, map, stateLayersRef, districtLayersRef, districtGeoJson, triggerResetCounter]);

  return null;
}

// Component to track active map zoom level for zoom-dependent label display
function MapZoomTracker({ onZoomChange }) {
  const map = useMap();
  useEffect(() => {
    onZoomChange(map.getZoom());
    const handleZoom = () => {
      onZoomChange(map.getZoom());
    };
    map.on('zoomend', handleZoom);
    map.on('zoom', handleZoom);
    return () => {
      map.off('zoomend', handleZoom);
      map.off('zoom', handleZoom);
    };
  }, [map, onZoomChange]);
  return null;
}

// Accessible, touch-optimised standard Zoom-in and Zoom-out controls (>=44px touch targets)
function CustomZoomControls({ onResetIndia }) {
  const map = useMap();
  const [zoomLevel, setZoomLevel] = useState(map.getZoom());

  useEffect(() => {
    const updateZoom = () => {
      setZoomLevel(map.getZoom());
    };
    map.on('zoomend', updateZoom);
    return () => {
      map.off('zoomend', updateZoom);
    };
  }, [map]);

  const canZoomIn = zoomLevel < map.getMaxZoom();
  const canZoomOut = zoomLevel > map.getMinZoom();

  return (
    <div
      className="absolute top-3 left-3 z-[1000] flex flex-col bg-white border border-[#D5DCE0] rounded-lg shadow-sm overflow-hidden select-none"
      role="group"
      aria-label="Map navigation and zoom controls"
    >
      {/* Zoom In Button */}
      <button
        type="button"
        onClick={() => map.zoomIn(0.75)}
        disabled={!canZoomIn}
        className={`w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-[#0F766E] border-b border-[#D5DCE0]/80 ${
          canZoomIn
            ? 'text-[#0B1F33] hover:text-[#0F766E] hover:bg-[#F6F8F7] active:bg-[#E8F0EE] cursor-pointer'
            : 'text-[#CBD5E1] cursor-not-allowed bg-[#F8FAFC]'
        }`}
        aria-label="Zoom in"
        title="Zoom in"
      >
        <Plus className="w-5 h-5 stroke-[2.2]" />
      </button>

      {/* Zoom Out Button */}
      <button
        type="button"
        onClick={() => map.zoomOut(0.75)}
        disabled={!canZoomOut}
        className={`w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-[#0F766E] ${
          onResetIndia ? 'border-b border-[#D5DCE0]/80' : ''
        } ${
          canZoomOut
            ? 'text-[#0B1F33] hover:text-[#0F766E] hover:bg-[#F6F8F7] active:bg-[#E8F0EE] cursor-pointer'
            : 'text-[#CBD5E1] cursor-not-allowed bg-[#F8FAFC]'
        }`}
        aria-label="Zoom out"
        title="Zoom out"
      >
        <Minus className="w-5 h-5 stroke-[2.2]" />
      </button>

      {/* Quick Reset Extent Button */}
      {onResetIndia && (
        <button
          type="button"
          onClick={onResetIndia}
          className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#475569] hover:text-[#0F766E] hover:bg-[#F6F8F7] active:bg-[#E8F0EE] transition-colors focus-visible:outline-2 focus-visible:outline-[#0F766E] cursor-pointer"
          aria-label="Reset map view to India"
          title="Reset map view to India"
        >
          <RotateCcw className="w-4 h-4 stroke-[2]" />
        </button>
      )}
    </div>
  );
}

// Search input field with autocomplete suggestions for fast navigation & zooming
function RegionSearchInput({
  searchableRegions = [],
  onSelectState,
  onSelectDistrict
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Filter matches based on query with relevance scoring
  const filteredSuggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !Array.isArray(searchableRegions)) return [];

    const matches = [];
    for (const item of searchableRegions) {
      const name = (item.name || '').toLowerCase();
      const stateName = (item.stateName || '').toLowerCase();
      const code = (item.code || '').toLowerCase();

      let score = -1;
      if (name === q) {
        score = 100;
      } else if (name.startsWith(q)) {
        score = 80;
      } else if (name.includes(q)) {
        score = 60;
      } else if (stateName.startsWith(q)) {
        score = 40;
      } else if (stateName.includes(q)) {
        score = 25;
      } else if (code === q) {
        score = 90;
      }

      if (score > 0) {
        if (item.type === 'state' && name.startsWith(q)) score += 5;
        matches.push({ item, score });
      }
    }

    matches.sort((a, b) => b.score - a.score);
    return matches.slice(0, 8).map(m => m.item);
  }, [query, searchableRegions]);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    if (item.type === 'state') {
      onSelectState(item.name);
      if (onSelectDistrict) onSelectDistrict(null);
    } else if (item.type === 'district') {
      onSelectState(item.stateName);
      if (onSelectDistrict) onSelectDistrict(item.canonicalName || item.name);
    }
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || filteredSuggestions.length === 0) {
      if (e.key === 'ArrowDown' && query.trim()) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSuggestions[highlightedIndex]) {
        handleSelect(filteredSuggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full sm:w-60 md:w-64">
      <div className="relative flex items-center">
        <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search state or district..."
          className="w-full pl-8 pr-7 py-1 text-xs bg-[#F6F8F7] hover:bg-white focus:bg-white text-[#0B1F33] placeholder-[#64748B] border border-[#D5DCE0] focus:border-[#0F766E] rounded-md transition-all outline-none focus:ring-1 focus:ring-[#0F766E]"
          aria-label="Search and zoom to state or district by name"
          aria-autocomplete="list"
          aria-expanded={isOpen && filteredSuggestions.length > 0}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-2 text-[#94A3B8] hover:text-[#0B1F33] p-0.5 cursor-pointer"
            aria-label="Clear search input"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && query.trim() && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D5DCE0] rounded-md shadow-lg z-[2000] max-h-64 overflow-y-auto py-1"
          role="listbox"
        >
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((item, idx) => {
              const isHighlighted = idx === highlightedIndex;
              const isState = item.type === 'state';

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`px-3 py-1.5 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                    isHighlighted ? 'bg-[#E8F0EE] text-[#0B1F33]' : 'hover:bg-[#F6F8F7] text-[#0B1F33]'
                  }`}
                  role="option"
                  aria-selected={isHighlighted}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold truncate flex items-center gap-1.5">
                      <span className="text-[#0B1F33]">{item.name}</span>
                      <span className="text-[10px] font-normal text-[#64748B]">
                        {isState ? 'State' : `District in ${item.stateName}`}
                      </span>
                    </div>
                  </div>
                  {item.rate !== undefined && item.rate !== null && (
                    <span className="text-[10px] tabular-nums font-medium text-[#0F766E] shrink-0">
                      {item.rate.toFixed(1)}/1L
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-3 py-2 text-xs text-[#64748B] italic">
              No region matching &ldquo;{query}&rdquo;
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
 *   onSelectState?: (state: string | null) => void;
 *   onSelectDistrict?: (district: string | null, stateOverride?: string | null) => void;
 *   showCrimeDensity?: boolean;
 *   onToggleCrimeDensity?: ((active: boolean) => void) | undefined;
 * }} props
 */
export function InteractiveAtlasMap({
  selectedState = null,
  selectedDistrict = null,
  onSelectState,
  onSelectDistrict,
  showCrimeDensity = false,
  onToggleCrimeDensity
}) {
  const stateLayersRef = useRef({});
  const districtLayersRef = useRef({});
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [triggerResetCounter, setTriggerResetCounter] = useState(0);
  const [basemapStyle, setBasemapStyle] = useState('dual');
  const [showReferenceLabels, setShowReferenceLabels] = useState(true);
  const [activeBandFilter, setActiveBandFilter] = useState(null);

  // Active layer visibility toggles: Police stations, crime hotspots, help centers, choropleth fills
  const [activeLayers, setActiveLayers] = useState({
    policeStations: true,
    crimeHotspots: true,
    helpCenters: true,
    choroplethBands: true
  });

  const handleToggleLayer = useCallback((layerKey, value) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerKey]: typeof value === 'boolean' ? value : !prev[layerKey]
    }));
  }, []);

  const handleToggleAllLayers = useCallback((visible) => {
    setActiveLayers({
      policeStations: visible,
      crimeHotspots: visible,
      helpCenters: visible,
      choroplethBands: visible
    });
  }, []);

  // Filter features based on current state & district selection
  const visibleFeatures = useMemo(() => {
    return getFilteredLayerFeatures(selectedState, selectedDistrict);
  }, [selectedState, selectedDistrict]);

  // Leaflet custom div icons for crisp SVG markers
  const policeIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-police-marker',
      html: `
        <div style="
          width: 28px;
          height: 28px;
          background: #1D4ED8;
          border: 2px solid #FFFFFF;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          cursor: pointer;
        ">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14]
    });
  }, []);

  const hotspotIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-hotspot-marker',
      html: `
        <div style="
          width: 30px;
          height: 30px;
          background: #E11D48;
          border: 2px solid #FFFFFF;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(225,29,72,0.6), 0 2px 6px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          cursor: pointer;
          animation: pulse-ring 2s infinite;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
          </svg>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });
  }, []);

  const helpCenterIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-help-marker',
      html: `
        <div style="
          width: 28px;
          height: 28px;
          background: #059669;
          border: 2px solid #FFFFFF;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          cursor: pointer;
        ">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14]
    });
  }, []);

  // Thematic layer toggle state: Crime density choropleth heatmap gradient
  const [internalDensityLayer, setInternalDensityLayer] = useState(showCrimeDensity);
  const showDensityLayer = typeof onToggleCrimeDensity === 'function' ? showCrimeDensity : internalDensityLayer;
  const handleToggleDensityLayer = useCallback((nextVal) => {
    const val = typeof nextVal === 'boolean' ? nextVal : !showDensityLayer;
    setInternalDensityLayer(val);
    if (onToggleCrimeDensity) onToggleCrimeDensity(val);
  }, [showDensityLayer, onToggleCrimeDensity]);

  // Lazy loaded district boundaries for selected state
  const [districtGeoJson, setDistrictGeoJson] = useState(null);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isDistrictViewComingSoon, setIsDistrictViewComingSoon] = useState(false);
  const [mapZoom, setMapZoom] = useState(INDIA_DEFAULT_ZOOM);

  // Zoom-dependent visibility: hide district labels at national level, reveal when clicking/zooming into a state
  const isStateZoomLevel = Boolean(selectedState || mapZoom >= 5.5);

  // Comprehensive searchable list of all 36 States/UTs and authentic districts
  const searchableRegions = useMemo(() => {
    const list = [];
    // 1. All 36 States/UTs
    ALL_INDIA_STATES.forEach(stateName => {
      const stat = STATE_CRIME_MAP[stateName];
      list.push({
        id: `state-${stateName}`,
        name: stateName,
        type: 'state',
        stateName: stateName,
        rate: stat?.rate ?? null,
        count: stat?.count ?? null
      });
    });

    // 2. All defined districts from INDIA_DISTRICTS_BY_STATE
    Object.entries(INDIA_DISTRICTS_BY_STATE).forEach(([stName, distCollection]) => {
      if (distCollection && distCollection.features) {
        distCollection.features.forEach(f => {
          const districtName = f.properties?.name;
          if (districtName) {
            list.push({
              id: `dist-${stName}-${districtName}`,
              name: districtName,
              type: 'district',
              stateName: stName,
              code: f.properties?.id,
              rate: f.properties?.rate ?? null,
              count: f.properties?.count ?? null
            });
          }
        });
      }
    });

    // 3. Known aliases (e.g. Kochi -> Ernakulam, Bhubaneswar -> Khordha)
    if (DISTRICT_KNOWN_ALIASES) {
      Object.entries(DISTRICT_KNOWN_ALIASES).forEach(([alias, info]) => {
        list.push({
          id: `alias-${info.state}-${alias}`,
          name: info.displayName || `${alias} (${info.canonicalName})`,
          type: 'district',
          stateName: info.state,
          canonicalName: info.canonicalName,
          rate: null,
          count: null
        });
      });
    }

    return list;
  }, []);

  // Validate state names against ALL_INDIA_STATES and log any unmatched names
  useEffect(() => {
    const geoStateNames = INDIA_STATES_GEOJSON.features.map(f => f.properties?.name);
    const unmatchedNames = geoStateNames.filter(name => !ALL_INDIA_STATES.includes(name));
    const missingStates = ALL_INDIA_STATES.filter(state => !geoStateNames.includes(state));

    if (unmatchedNames.length > 0) {
      console.warn('[Region Validation] Unmatched region names in GeoJSON:', unmatchedNames);
    }
    if (missingStates.length > 0) {
      console.warn('[Region Validation] Missing states from GeoJSON:', missingStates);
    }
    if (unmatchedNames.length === 0 && missingStates.length === 0) {
      console.log('[Region Validation] 100% matched: All 36 jurisdictions aligned with ALL_INDIA_STATES.');
    }
  }, []);

  // Prepare and simplify state boundary GeoJSON if it exceeds 2MB
  const processedStateGeoJson = useMemo(() => {
    return simplifyGeoJsonIfNeeded(INDIA_STATES_GEOJSON);
  }, []);

  // Lazy load district boundaries strictly when a state is clicked
  useEffect(() => {
    if (!selectedState) {
      setDistrictGeoJson(null);
      setIsDistrictViewComingSoon(false);
      setIsLoadingDistricts(false);
      return;
    }

    setIsLoadingDistricts(true);
    // Simulate slight async lazy fetch to keep UI non-blocking
    const timer = setTimeout(() => {
      const districts = getDistrictsForState(selectedState);
      if (districts && districts.features && districts.features.length > 0) {
        setDistrictGeoJson(districts);
        setIsDistrictViewComingSoon(false);
      } else {
        setDistrictGeoJson(null);
        setIsDistrictViewComingSoon(true);
      }
      setIsLoadingDistricts(false);
    }, 40);

    return () => clearTimeout(timer);
  }, [selectedState]);

  // Style for State polygons
  const getStateStyle = useCallback((feature) => {
    const stateName = feature.properties?.name;
    const isSelected = selectedState === stateName;
    const bandIdx = getStateBandIndex(stateName);
    const stat = STATE_CRIME_MAP[stateName];

    let fillColor = bandIdx >= 0 ? MAP_RAMP_COLORS[bandIdx] : NO_DATA_COLOR;
    if (showDensityLayer && stat?.rate) {
      // Harmonic subtle heatmap gradient at state level
      fillColor = getDistrictHeatmapColor(stat.rate);
    }

    const isSatellite = basemapStyle === 'satellite';
    const isFilteredOut = activeBandFilter !== null && bandIdx !== activeBandFilter;
    const isDimmed = (selectedState && !isSelected) || isFilteredOut;
    const isBandHighlighted = activeBandFilter !== null && bandIdx === activeBandFilter;
    const showFills = activeLayers.choroplethBands;

    return {
      fillColor,
      fillOpacity: !showFills
        ? (isSelected ? 0.25 : 0.0)
        : isSatellite
          ? (isDimmed ? 0.15 : (isSelected || isBandHighlighted) ? 0.72 : (showDensityLayer ? 0.58 : 0.42))
          : (isDimmed ? 0.25 : (isSelected || isBandHighlighted) ? 0.95 : (showDensityLayer ? 0.85 : 0.78)),
      color: isSelected
        ? SELECTED_OUTLINE_COLOR
        : isBandHighlighted
          ? '#0F766E'
          : (isSatellite ? '#FFFFFF' : showDensityLayer ? '#991B1B80' : '#94A3B8'),
      weight: isSelected ? 2.5 : isBandHighlighted ? 2.2 : (isSatellite ? 1.4 : 1.0),
      opacity: isSatellite ? 0.95 : (isSelected ? 1 : 0.75),
      dashArray: isSelected ? '' : (isSatellite ? '' : '1'),
      className: 'transition-all duration-200 cursor-pointer'
    };
  }, [selectedState, basemapStyle, activeBandFilter, showDensityLayer, activeLayers.choroplethBands]);

  // Style for District polygons (Thematic subtle choropleth heatmap gradient)
  const getDistrictStyle = useCallback((feature) => {
    const districtName = feature.properties?.name;
    const isSelected = selectedDistrict === districtName ||
      Boolean(selectedDistrict && districtName && selectedDistrict.toLowerCase() === districtName.toLowerCase());

    // Check if district has real verified crime rate loaded
    const realRate = feature.properties?.rate;
    const hasRealData = typeof realRate === 'number' && !isNaN(realRate) && feature.properties?.isLoaded !== false;

    let fillColor = '#E5E7EB'; // Default grey for "District data not loaded yet"
    if (hasRealData) {
      if (showDensityLayer) {
        // Thematic layer: Subtle choropleth heatmap gradient visualizing verified district crime density
        fillColor = getDistrictHeatmapColor(realRate);
      } else {
        // Standard quintile ramp
        const q = feature.properties?.quintile || 3;
        fillColor = MAP_RAMP_COLORS[Math.min(4, Math.max(0, q - 1))];
      }
    }

    const isSatellite = basemapStyle === 'satellite';
    const showFills = activeLayers.choroplethBands;

    return {
      fillColor: isSelected
        ? (showDensityLayer && realRate ? getDistrictHeatmapColor(realRate) : (hasRealData ? MAP_RAMP_COLORS[Math.min(4, Math.max(0, (feature.properties?.quintile || 3) - 1))] : '#0F766E'))
        : fillColor,
      fillOpacity: !showFills
        ? (isSelected ? 0.35 : 0.0)
        : isSatellite
          ? (isSelected ? 0.90 : showDensityLayer ? 0.65 : 0.45)
          : (isSelected ? 0.95 : showDensityLayer ? 0.84 : 0.75),
      color: isSelected
        ? (isSatellite ? '#38BDF8' : '#0F766E')
        : (isSatellite ? '#FFFFFF' : showDensityLayer ? '#991B1B' : '#64748B'),
      weight: isSelected ? 3.5 : showDensityLayer ? 1.4 : (isSatellite ? 1.5 : 1.2),
      opacity: 1,
      dashArray: isSelected ? '' : '2',
      className: `transition-all duration-200 cursor-pointer ${isSelected ? 'district-boundary-selected' : ''}`
    };
  }, [selectedDistrict, basemapStyle, showDensityLayer, activeLayers.choroplethBands]);

  // State feature interaction handlers
  const onEachStateFeature = useCallback((feature, layer) => {
    const stateName = feature.properties?.name;
    if (!stateName) return;

    stateLayersRef.current[stateName] = layer;

    layer.on({
      click: () => {
        onSelectState(stateName);
      },
      mouseover: (e) => {
        const stat = STATE_CRIME_MAP[stateName];
        const densityInfo = stat?.rate ? getDensityLevelLabel(stat.rate) : null;
        setHoveredRegion({
          name: stateName,
          type: 'state',
          rate: stat?.rate,
          count: stat?.count,
          quintile: getStateBandIndex(stateName) + 1,
          densityLabel: densityInfo?.label
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

    districtLayersRef.current[districtName] = layer;

    // Calculate geometric centroid for accurate badge placement
    const centroid = getDistrictCentroid(feature);
    if (centroid && Array.isArray(centroid) && centroid.length === 2) {
      layer.getCenter = () => L.latLng(centroid[0], centroid[1]);
    }

    const isSelected = selectedDistrict === districtName ||
      Boolean(selectedDistrict && districtName && selectedDistrict.toLowerCase() === districtName.toLowerCase());

    // Permanent centroid label for crisp district name visibility
    layer.bindTooltip(districtName, {
      permanent: true,
      direction: 'center',
      className: `district-centroid-label ${isSelected ? 'district-centroid-label-active' : ''}`
    });

    if (centroid && Array.isArray(centroid) && centroid.length === 2) {
      try {
        const tip = layer.getTooltip();
        if (tip) {
          tip.setLatLng(L.latLng(centroid[0], centroid[1]));
        }
      } catch (err) {
        // ignore
      }
    }

    if (isSelected) {
      try {
        if (layer.bringToFront) {
          layer.bringToFront();
        }
      } catch (err) {
        // ignore
      }
    }

    layer.on({
      click: () => {
        if (onSelectDistrict) {
          onSelectDistrict(selectedDistrict === districtName ? null : districtName);
        }
      },
      mouseover: (e) => {
        const realRate = feature.properties?.rate;
        const hasRealData = typeof realRate === 'number' && !isNaN(realRate) && feature.properties?.isLoaded !== false;
        const densityInfo = hasRealData ? getDensityLevelLabel(realRate) : null;
        setHoveredRegion({
          name: districtName,
          type: 'district',
          stateName: selectedState,
          rate: hasRealData ? realRate : null,
          hasRealData,
          count: feature.properties?.count,
          quintile: feature.properties?.quintile,
          densityLabel: densityInfo?.label
        });
        const l = e.target;
        if (selectedDistrict !== districtName) {
          l.setStyle({
            weight: 2.2,
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
    setActiveBandFilter(null);
    setTriggerResetCounter(prev => prev + 1);
  };

  const quintileRanges = useMemo(() => getQuintileLegendRanges(), []);

  return (
    <div className="relative flex flex-col w-full bg-white rounded-lg border border-[#D5DCE0] overflow-hidden shadow-xs">
      {/* Top Map Breadcrumbs & Status Toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-white border-b border-[#D5DCE0] flex-wrap gap-2 z-10">
        <div className="flex items-center gap-1.5 text-xs text-[#0B1F33]">
          <span className="font-semibold text-[#0F766E] flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            Atlas View
          </span>
          <ChevronRight className="w-3 h-3 text-[#64748B]" />
          <button
            type="button"
            onClick={handleReset}
            className={`font-medium hover:text-[#0F766E] transition-colors cursor-pointer ${
              !selectedState ? 'font-bold text-[#0B1F33]' : 'text-[#475569]'
            }`}
          >
            India
          </button>
          {selectedState && (
            <>
              <ChevronRight className="w-3 h-3 text-[#64748B]" />
              <button
                type="button"
                onClick={() => onSelectDistrict && onSelectDistrict(null)}
                className={`font-semibold hover:text-[#0F766E] transition-colors cursor-pointer ${
                  !selectedDistrict ? 'text-[#0B1F33]' : 'text-[#475569]'
                }`}
              >
                {selectedState}
              </button>
            </>
          )}
          {selectedDistrict && (
            <>
              <ChevronRight className="w-3 h-3 text-[#64748B]" />
              <span className="font-bold text-[#0F766E]">{selectedDistrict}</span>
            </>
          )}
        </div>

        {/* Right Controls: Search, Basemap Switcher, Labels Toggle & Reset */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Autocomplete Region & District Search */}
          <RegionSearchInput
            searchableRegions={searchableRegions}
            onSelectState={onSelectState}
            onSelectDistrict={onSelectDistrict}
          />

          {/* Basemap Preset Switcher */}
          <div className="inline-flex rounded border border-[#D5DCE0] p-0.5 bg-[#F6F8F7] text-[11px]">
            <button
              type="button"
              onClick={() => setBasemapStyle('dual')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                basemapStyle === 'dual'
                  ? 'bg-white text-[#0B1F33] font-semibold shadow-xs'
                  : 'text-[#475569] hover:text-[#0B1F33]'
              }`}
              title="Dual-Layer Cartography: Esri Base + Administrative Reference Labels"
            >
              Dual-Layer Canvas
            </button>
            <button
              type="button"
              onClick={() => setBasemapStyle('satellite')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                basemapStyle === 'satellite'
                  ? 'bg-white text-[#0B1F33] font-semibold shadow-xs'
                  : 'text-[#475569] hover:text-[#0B1F33]'
              }`}
              title="Satellite Realistic Mode: High-resolution Esri World Imagery terrain (Himalayas, Thar Desert, Western Ghats, Sundarbans)"
            >
              <Globe className="w-3 h-3 text-[#0F766E]" />
              <span>Satellite Realistic</span>
            </button>
            <button
              type="button"
              onClick={() => setBasemapStyle('osm')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                basemapStyle === 'osm'
                  ? 'bg-white text-[#0B1F33] font-semibold shadow-xs'
                  : 'text-[#475569] hover:text-[#0B1F33]'
              }`}
              title="OpenStreetMap Detailed View: Native district boundaries (zillas), taluks, NH highways & railways"
            >
              Streets & Zillas
            </button>
          </div>

          {/* Reference Layer Toggle (Overlay on Dual-Layer Canvas and Satellite Realistic modes) */}
          {(basemapStyle === 'dual' || basemapStyle === 'satellite') && (
            <button
              type="button"
              onClick={() => setShowReferenceLabels(prev => !prev)}
              className={`px-2.5 py-1 text-[11px] rounded border transition-colors cursor-pointer flex items-center gap-1.5 font-medium ${
                showReferenceLabels
                  ? 'bg-[#E8F0EE] border-[#0F766E]/40 text-[#0F766E] font-semibold shadow-xs'
                  : 'bg-white border-[#D5DCE0] text-[#64748B] hover:text-[#0B1F33]'
              }`}
              title="Toggle Official Reference Layer (Administrative boundaries, districts, cities, divisional headquarters, waterways)"
              aria-pressed={showReferenceLabels}
            >
              <Layers className="w-3 h-3 text-[#0F766E]" />
              <span>Reference Layer:</span>
              <span className={`text-[10px] px-1 py-0.2 rounded font-mono font-bold ${
                showReferenceLabels ? 'bg-[#0F766E]/15 text-[#0F766E]' : 'bg-slate-100 text-slate-500'
              }`}>
                {showReferenceLabels ? 'ON' : 'OFF'}
              </span>
            </button>
          )}

          {/* Thematic Layer Control: District Crime Density Choropleth Heatmap */}
          <button
            type="button"
            onClick={() => handleToggleDensityLayer()}
            className={`px-2.5 py-1 text-[11px] rounded border transition-all cursor-pointer flex items-center gap-1.5 font-medium ${
              showDensityLayer
                ? 'bg-gradient-to-r from-amber-50 to-rose-50 border-rose-300 text-rose-950 font-semibold shadow-xs ring-1 ring-rose-400/30'
                : 'bg-white border-[#D5DCE0] text-[#475569] hover:text-[#0B1F33] hover:bg-[#F6F8F7]'
            }`}
            title="Toggle district crime density choropleth heatmap gradient thematic layer"
            aria-pressed={showDensityLayer}
          >
            <Flame className={`w-3.5 h-3.5 ${showDensityLayer ? 'text-rose-600 animate-pulse' : 'text-[#64748B]'}`} />
            <span>Density Heatmap</span>
            <span className={`text-[10px] px-1 py-0.2 rounded font-mono font-bold ${
              showDensityLayer ? 'bg-rose-200 text-rose-950' : 'bg-slate-100 text-slate-500'
            }`}>
              {showDensityLayer ? 'ON' : 'OFF'}
            </span>
          </button>

          {selectedState && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0F766E] bg-[#E8F0EE] hover:bg-[#0F766E] hover:text-white rounded transition-colors cursor-pointer"
              title="Reset view to whole India map"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to India</span>
            </button>
          )}
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className={`relative w-full h-[540px] sm:h-[580px] transition-colors duration-300 ${isStateZoomLevel ? 'zoom-state-level' : 'zoom-national-level'} ${basemapStyle === 'satellite' ? 'bg-[#0B1320]' : 'bg-[#F6F8F7]'}`}>
        {/* Leaflet Map */}
        <MapContainer
          center={INDIA_DEFAULT_CENTER}
          zoom={INDIA_DEFAULT_ZOOM}
          minZoom={3.8}
          maxZoom={12}
          maxBounds={[[3.0, 60.0], [40.0, 105.0]]}
          maxBoundsViscosity={0.8}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          zoomControl={false}
          className="w-full h-full z-0 font-sans"
        >
          {/* Synchronize active zoom level for zoom-dependent typography badges */}
          <MapZoomTracker onZoomChange={setMapZoom} />

          {/* Dedicated Reference Labels Pane (zIndex: 450, pointer-events: none) */}
          <LabelsPaneSetup />

          {/* Accessible Touch-Friendly Zoom Controls */}
          <CustomZoomControls onResetIndia={handleReset} />

          {/* Dual-Layer Basemap 1: Base Terrain/Canvas/Imagery Layer (Below polygons) */}
          <TileLayer
            key={`base-${basemapStyle}`}
            url={BASEMAP_PRESETS[basemapStyle].baseUrl}
            attribution={BASEMAP_PRESETS[basemapStyle].attribution}
            maxZoom={BASEMAP_PRESETS[basemapStyle].maxZoom}
          />

          {/* Camera Controller */}
          <MapCameraController
            selectedState={selectedState}
            selectedDistrict={selectedDistrict}
            stateLayersRef={stateLayersRef}
            districtLayersRef={districtLayersRef}
            districtGeoJson={districtGeoJson}
            triggerResetCounter={triggerResetCounter}
          />

          {/* State Boundaries Layer (Default) */}
          <GeoJSON
            key={`state-layer-${selectedState || 'all'}-${basemapStyle}-${activeBandFilter ?? 'all'}-${showDensityLayer ? 'density' : 'quintile'}`}
            data={processedStateGeoJson}
            style={getStateStyle}
            onEachFeature={onEachStateFeature}
          />

          {/* District Boundaries Layer (Lazy-Loaded when state is selected) */}
          {selectedState && districtGeoJson && (
            <GeoJSON
              key={`district-layer-${selectedState}-${selectedDistrict || 'none'}-${basemapStyle}-${showDensityLayer ? 'density' : 'quintile'}`}
              data={districtGeoJson}
              style={getDistrictStyle}
              onEachFeature={onEachDistrictFeature}
            />
          )}

          {/* Reference Labels Layer (Overlaid ON TOP of polygons) */}
          {(basemapStyle === 'dual' || basemapStyle === 'satellite') && showReferenceLabels && BASEMAP_PRESETS[basemapStyle]?.referenceUrl && (
            <TileLayer
              key={`reference-labels-${basemapStyle}`}
              pane="labelsPane"
              url={BASEMAP_PRESETS[basemapStyle].referenceUrl}
              attribution=""
              maxZoom={BASEMAP_PRESETS[basemapStyle].maxZoom}
            />
          )}

          {/* Layer 1: Police Stations Geo-Markers */}
          {activeLayers.policeStations && visibleFeatures.police.length > 0 && (
            <LayerGroup key={`police-layer-${selectedState || 'all'}-${selectedDistrict || 'all'}`}>
              {visibleFeatures.police.map((station) => (
                <Marker
                  key={station.id}
                  position={[station.lat, station.lng]}
                  icon={policeIcon}
                >
                  <Popup className="custom-atlas-popup">
                    <div className="p-1 max-w-[240px] text-xs font-sans">
                      <div className="flex items-center gap-1.5 font-bold text-blue-900 border-b border-blue-100 pb-1 mb-1">
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                        <span className="truncate">{station.name}</span>
                      </div>
                      <div className="space-y-1 text-slate-700 text-[11px]">
                        <div>
                          <strong className="text-slate-900">Jurisdiction:</strong> {station.jurisdiction}
                        </div>
                        <div>
                          <strong className="text-slate-900">SHO / In-Charge:</strong> {station.officerInCharge}
                        </div>
                        <div>
                          <strong className="text-slate-900">Address:</strong> {station.address}
                        </div>
                        <div className="pt-1 flex items-center justify-between gap-1 border-t border-slate-100">
                          <a
                            href={`tel:${station.phone}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-[10px]"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{station.phone}</span>
                          </a>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-bold text-[10px]">
                            Dial 112
                          </span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          )}

          {/* Layer 2: Crime Hotspots (Perimeter Circle + Pulse Marker) */}
          {activeLayers.crimeHotspots && visibleFeatures.hotspots.length > 0 && (
            <LayerGroup key={`hotspots-layer-${selectedState || 'all'}-${selectedDistrict || 'all'}`}>
              {visibleFeatures.hotspots.map((hotspot) => (
                <React.Fragment key={hotspot.id}>
                  {/* Visual perimeter radius circle */}
                  <Circle
                    center={[hotspot.lat, hotspot.lng]}
                    radius={hotspot.radiusMeters}
                    pathOptions={{
                      color: hotspot.severity === 'high' ? '#E11D48' : '#F97316',
                      fillColor: hotspot.severity === 'high' ? '#E11D48' : '#F97316',
                      fillOpacity: 0.18,
                      weight: 1.5,
                      dashArray: '4, 4'
                    }}
                  />
                  <Marker
                    position={[hotspot.lat, hotspot.lng]}
                    icon={hotspotIcon}
                  >
                    <Popup className="custom-atlas-popup">
                      <div className="p-1 max-w-[250px] text-xs font-sans">
                        <div className="flex items-center gap-1.5 font-bold text-rose-900 border-b border-rose-100 pb-1 mb-1">
                          <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                          <span className="truncate">{hotspot.name}</span>
                        </div>
                        <div className="space-y-1 text-slate-700 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                              {hotspot.severity} Severity
                            </span>
                            <span className="text-[10px] font-mono text-slate-600">
                              {hotspot.reportedIncidents30d} FIRs / 30d
                            </span>
                          </div>
                          <div>
                            <strong className="text-slate-900">Primary Issue:</strong> {hotspot.primaryCategory}
                          </div>
                          <div>
                            <strong className="text-slate-900">Vigilance:</strong> {hotspot.patrolStatus}
                          </div>
                          <p className="text-[10px] text-slate-600 italic leading-snug pt-0.5">
                            {hotspot.description}
                          </p>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              ))}
            </LayerGroup>
          )}

          {/* Layer 3: Help Centers & Medical Facilities */}
          {activeLayers.helpCenters && visibleFeatures.helpCenters.length > 0 && (
            <LayerGroup key={`help-centers-layer-${selectedState || 'all'}-${selectedDistrict || 'all'}`}>
              {visibleFeatures.helpCenters.map((center) => (
                <Marker
                  key={center.id}
                  position={[center.lat, center.lng]}
                  icon={helpCenterIcon}
                >
                  <Popup className="custom-atlas-popup">
                    <div className="p-1 max-w-[240px] text-xs font-sans">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900 border-b border-emerald-100 pb-1 mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                        <span className="truncate">{center.name}</span>
                      </div>
                      <div className="space-y-1 text-slate-700 text-[11px]">
                        <div>
                          <strong className="text-slate-900">Managing Agency:</strong> {center.agency}
                        </div>
                        <div>
                          <strong className="text-slate-900">Operating Hours:</strong> {center.operatingHours}
                        </div>
                        <div>
                          <strong className="text-slate-900">Address:</strong> {center.address}
                        </div>
                        <div className="pt-1 flex items-center justify-between gap-1 border-t border-slate-100">
                          <a
                            href={`tel:${center.helplineNumber}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[10px]"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{center.helplineNumber}</span>
                          </a>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {center.district}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          )}
        </MapContainer>


        {/* OVERLAY: Active District Selection Banner */}
        {selectedState && selectedDistrict && (
          <div
            role="status"
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-xs border border-[#0F766E]/50 px-3.5 py-1.5 rounded-full shadow-md text-xs font-semibold text-[#0B1F33] flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-[#0F766E] shrink-0" />
            <span>
              District: <strong>{selectedDistrict}</strong> ({selectedState})
            </span>
            {onSelectDistrict && (
              <button
                type="button"
                onClick={() => onSelectDistrict(null)}
                className="ml-1 text-[#64748B] hover:text-[#0B1F33] cursor-pointer"
                title="Return to whole state overview"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* OVERLAY: "District view coming soon" (When state has no district boundary file) */}
        {selectedState && isDistrictViewComingSoon && !isLoadingDistricts && (
          <div
            role="status"
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-xs border border-[#D5DCE0] px-4 py-2 rounded-md shadow-sm text-xs font-medium text-[#475569] flex items-center gap-2 pointer-events-none"
          >
            <Info className="w-4 h-4 text-[#0F766E] shrink-0" />
            <span>
              District view coming soon for <strong className="text-[#0B1F33]">{selectedState}</strong>
            </span>
          </div>
        )}

        {/* Lazy Loading Spinner / Indicator */}
        {isLoadingDistricts && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 border border-[#D5DCE0] px-3.5 py-1.5 rounded-md shadow-sm text-xs text-[#0B1F33] flex items-center gap-2">
            <div className="w-3.5 h-3.5 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin" />
            <span>Loading district boundaries...</span>
          </div>
        )}

        {/* Floating Region Details Tooltip on Hover */}
        {hoveredRegion && (
          <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-xs border border-[#D5DCE0] rounded-lg p-2.5 shadow-md max-w-[240px] pointer-events-none text-xs">
            <div className="font-bold text-[#0B1F33] truncate">
              {hoveredRegion.name}
            </div>
            {hoveredRegion.type === 'state' ? (
              <div className="mt-1 space-y-0.5 text-[#475569]">
                <div>
                  <span className="text-[#0B1F33] font-semibold tabular-nums">
                    {hoveredRegion.rate !== undefined && hoveredRegion.rate !== null
                      ? hoveredRegion.rate.toFixed(1)
                      : 'Not available'}
                  </span>{' '}
                  registered cases per 1 lakh
                </div>
                {hoveredRegion.count !== undefined && (
                  <div className="text-[11px]">
                    Total registered: <span className="tabular-nums font-medium text-[#0B1F33]">{formatIndianNumber(hoveredRegion.count)}</span>
                  </div>
                )}
                <div className="text-[10px] text-[#0F766E] font-medium pt-0.5">
                  Click to inspect & drill down
                </div>
              </div>
            ) : (
              <div className="mt-1 space-y-0.5 text-[#475569]">
                {hoveredRegion.hasRealData ? (
                  <>
                    <div>
                      <span className="text-[#0B1F33] font-semibold tabular-nums">
                        {hoveredRegion.rate.toFixed(1)}
                      </span>{' '}
                      registered cases per 1 lakh
                    </div>
                    {hoveredRegion.count && (
                      <div className="text-[11px]">
                        Cases: <span className="tabular-nums font-medium text-[#0B1F33]">{formatIndianNumber(hoveredRegion.count)}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-[#64748B] italic">
                    District data not loaded yet
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Interactive WebGIS Legend & Layer Controller */}
        <InteractiveMapLegend
          layers={activeLayers}
          onToggleLayer={handleToggleLayer}
          onToggleAllLayers={handleToggleAllLayers}
          selectedState={selectedState}
          selectedDistrict={selectedDistrict}
          hoveredRegion={hoveredRegion}
          featureCounts={{
            police: visibleFeatures.police.length,
            hotspots: visibleFeatures.hotspots.length,
            helpCenters: visibleFeatures.helpCenters.length
          }}
          basemapStyle={basemapStyle}
          activeBandFilter={activeBandFilter}
          onSelectBandFilter={setActiveBandFilter}
          showDensityLayer={showDensityLayer}
          onToggleDensityLayer={handleToggleDensityLayer}
        />
      </div>

      {/* MANDATORY MAP ATTRIBUTION & NOTE (Under map container) */}
      <div className="px-3 py-2 bg-[#F6F8F7] border-t border-[#D5DCE0] text-center">
        <p className="text-xs text-[#475569]">
          Boundaries are indicative. Source: DataMeet (CC BY 2.5 India).
        </p>
      </div>
    </div>
  );
}

export { MapLegend, InteractiveMapLegend };
export default InteractiveAtlasMap;
