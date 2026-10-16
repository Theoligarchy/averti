import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ActiveTab } from '../types';
import { ALL_INDIA_STATES, normalizeStateName } from '../data/crimeData';
import { INDIA_DISTRICTS_BY_STATE, DISTRICT_KNOWN_ALIASES } from '../data/indiaGeoData';
import {
  Search,
  Phone,
  Shield,
  X,
  MapPin,
  Menu,
  ChevronDown,
  Clock
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  selectedState: string | null;
  selectedDistrict?: string | null;
  onSelectState: (state: string | null) => void;
  onSelectDistrict?: (district: string | null, state?: string | null) => void;
  onOpenSources: () => void;
  onOpenAbout: () => void;
  onOpenTrustedCircle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onNavigate,
  selectedState,
  selectedDistrict,
  onSelectState,
  onSelectDistrict,
  onOpenAbout,
  onOpenTrustedCircle
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Multi-tier search: States and Authentic Districts with Relevance Scoring
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    type ScoredResult = {
      score: number;
      item:
        | { type: 'state'; name: string }
        | { type: 'district'; name: string; stateName: string; displayName: string; rate?: number | null; count?: number | null };
    };

    const scored: ScoredResult[] = [];

    // 1. Match States
    for (const st of ALL_INDIA_STATES) {
      const stLower = st.toLowerCase();
      let score = -1;
      if (stLower === q) score = 100;
      else if (stLower.startsWith(q)) score = 80;
      else if (stLower.includes(q)) score = 55;

      if (score > 0) {
        scored.push({
          score,
          item: { type: 'state', name: st }
        });
      }
    }

    // 2. Match Districts across all 36 States/UTs
    for (const [stName, col] of Object.entries(INDIA_DISTRICTS_BY_STATE)) {
      if (!col || !col.features) continue;
      for (const f of col.features) {
        const dName = f.properties?.name || '';
        const dLower = dName.toLowerCase();
        let score = -1;
        let displayName = dName;

        if (dLower === q) {
          score = 105; // Exact district match prioritizes over partial state
        } else if (dLower.startsWith(q)) {
          score = 85;
        } else if (dLower.includes(q)) {
          score = 65;
        }

        // Check aliases (e.g. Gurugram/Gurgaon, Bangalore/Bengaluru, Banaras/Varanasi, Bombay/Mumbai)
        for (const [alias, info] of Object.entries(DISTRICT_KNOWN_ALIASES)) {
          if (info.state.toLowerCase() === stName.toLowerCase() && info.canonicalName.toLowerCase() === dLower) {
            if (alias === q) {
              score = Math.max(score, 102);
              displayName = info.displayName;
              break;
            } else if (alias.startsWith(q)) {
              score = Math.max(score, 82);
              displayName = info.displayName;
              break;
            } else if (alias.includes(q)) {
              score = Math.max(score, 62);
              displayName = info.displayName;
              break;
            }
          }
        }

        if (score > 0) {
          scored.push({
            score,
            item: {
              type: 'district',
              name: dName,
              stateName: stName,
              displayName,
              rate: f.properties?.rate ?? null,
              count: f.properties?.count ?? null
            }
          });
        }
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 12).map(s => s.item);
  }, [searchQuery]);

  const handleSelectStateItem = (stateName: string) => {
    onSelectState(stateName);
    if (onSelectDistrict) onSelectDistrict(null);
    setSearchQuery('');
    setIsSearchOpen(false);
    onNavigate('atlas');
  };

  const handleSelectDistrictItem = (districtName: string, stateName: string) => {
    if (onSelectDistrict) {
      onSelectDistrict(districtName, stateName);
    } else {
      onSelectState(stateName);
    }
    setSearchQuery('');
    setIsSearchOpen(false);
    onNavigate('atlas');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchOpen || searchResults.length === 0) {
      if (e.key === 'Enter' && searchQuery.trim()) {
        const norm = normalizeStateName(searchQuery);
        if (norm) {
          handleSelectStateItem(norm);
        }
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = searchResults[highlightedIndex] || searchResults[0];
      if (selected) {
        if (selected.type === 'state') {
          handleSelectStateItem(selected.name);
        } else {
          handleSelectDistrictItem(selected.name, selected.stateName);
        }
      }
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#D5DCE0] shadow-xs">
      {/* Top Advisory Banner for Example Data */}
      {showBanner && (
        <div className="bg-[#FFF7E6] text-[#0B1F33] text-xs font-semibold px-4 py-2 border-b border-[#B45309]/30 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1">
            <span className="w-2 h-2 rounded-full bg-[#B45309] shrink-0" />
            <span className="leading-snug">
              <strong>DESIGN PREVIEW:</strong> Notice cards are illustrative examples. Statistical figures are official data from NCRB, Crime in India 2024.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowBanner(false)}
            className="text-[#64748B] hover:text-[#0B1F33] p-0.5 cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Wordmark and State Search */}
        <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => {
              onNavigate('atlas');
            }}
            className="text-2xl font-bold font-serif text-[#0B1F33] tracking-tight hover:opacity-90 transition-opacity cursor-pointer shrink-0"
            aria-label="Averti Home"
          >
            Averti
          </button>

          {/* State / UT Quick Search */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-xs hidden sm:block">
            <div className="relative">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onFocus={() => {
                  setIsSearchOpen(true);
                  setHighlightedIndex(0);
                }}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search state or district (e.g. Pune, Bengaluru, Gurugram, Varanasi)..."
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-[#F6F8F7] border border-[#64748B]/40 rounded-md text-[#0B1F33] placeholder-[#64748B] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                aria-label="Search Indian states, union territories, or districts"
                aria-autocomplete="list"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0B1F33] p-0.5 cursor-pointer"
                  aria-label="Clear search query"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Dropdown Results with Autocomplete */}
            {isSearchOpen && searchQuery.trim() && (
              <div
                className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#D5DCE0] rounded-md shadow-lg max-h-72 overflow-y-auto z-50 text-xs divide-y divide-[#F1F5F9]"
                role="listbox"
              >
                {searchResults.length > 0 ? (
                  searchResults.map((item, idx) => {
                    const isHighlighted = idx === highlightedIndex;
                    if (item.type === 'state') {
                      return (
                        <button
                          key={`state-${item.name}`}
                          type="button"
                          onClick={() => handleSelectStateItem(item.name)}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between text-[#0B1F33] cursor-pointer transition-colors ${
                            isHighlighted ? 'bg-[#E8F0EE]' : 'hover:bg-[#F6F8F7]'
                          }`}
                          role="option"
                          aria-selected={isHighlighted}
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <MapPin className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                            <span className="font-semibold truncate">{item.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-[#E8F0EE] text-[#0F766E] font-medium rounded">
                              State / UT
                            </span>
                          </span>
                          {selectedState === item.name && !selectedDistrict && (
                            <span className="text-[10px] text-[#0F766E] font-semibold shrink-0">Active</span>
                          )}
                        </button>
                      );
                    } else {
                      return (
                        <button
                          key={`district-${item.stateName}-${item.name}`}
                          type="button"
                          onClick={() => handleSelectDistrictItem(item.name, item.stateName)}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between text-[#0B1F33] cursor-pointer transition-colors ${
                            isHighlighted ? 'bg-[#E8F0EE]' : 'hover:bg-[#F6F8F7]'
                          }`}
                          role="option"
                          aria-selected={isHighlighted}
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <MapPin className="w-3.5 h-3.5 text-[#B45309] shrink-0" />
                            <div className="truncate">
                              <span className="font-semibold text-[#0B1F33]">{item.displayName || item.name}</span>
                              <span className="text-[11px] text-[#64748B] ml-1.5">({item.stateName})</span>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.2 bg-[#F1F5F9] text-[#64748B] font-medium rounded shrink-0">
                              District
                            </span>
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {item.rate !== undefined && item.rate !== null && (
                              <span className="text-[10px] tabular-nums font-semibold text-[#0F766E] bg-emerald-50 px-1 rounded">
                                {item.rate.toFixed(1)}/1L
                              </span>
                            )}
                            {selectedState === item.stateName && selectedDistrict === item.name && (
                              <span className="text-[10px] text-[#0F766E] font-semibold">Active</span>
                            )}
                          </div>
                        </button>
                      );
                    }
                  })
                ) : (
                  <div className="p-3 text-center text-[#64748B]">
                    No state or district matches "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#475569]">
          <button
            type="button"
            onClick={() => onNavigate('atlas')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer border-b-2 ${
              activeTab === 'atlas'
                ? 'text-[#0F766E] border-[#0F766E] font-semibold'
                : 'border-transparent hover:text-[#0B1F33]'
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onNavigate('notices')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer border-b-2 ${
              activeTab === 'notices'
                ? 'text-[#0F766E] border-[#0F766E] font-semibold'
                : 'border-transparent hover:text-[#0B1F33]'
            }`}
          >
            Notices
          </button>
          <button
            type="button"
            onClick={() => onNavigate('wanted')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer border-b-2 ${
              activeTab === 'wanted'
                ? 'text-[#0F766E] border-[#0F766E] font-semibold'
                : 'border-transparent hover:text-[#0B1F33]'
            }`}
          >
            Wanted Notices
          </button>
          <button
            type="button"
            onClick={() => onNavigate('emergency')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer border-b-2 ${
              activeTab === 'emergency'
                ? 'text-[#0F766E] border-[#0F766E] font-semibold'
                : 'border-transparent hover:text-[#0B1F33]'
            }`}
          >
            Emergency Help
          </button>
          <button
            type="button"
            onClick={() => onNavigate('police_triage')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer border-b-2 ${
              activeTab === 'police_triage'
                ? 'text-[#0F766E] border-[#0F766E] font-semibold'
                : 'border-transparent hover:text-[#0B1F33]'
            }`}
          >
            Police Triage (B2G)
          </button>
          <button
            type="button"
            onClick={onOpenAbout}
            className="whitespace-nowrap transition-colors py-1 cursor-pointer border-b-2 border-transparent hover:text-[#0B1F33]"
          >
            About
          </button>
        </nav>

        {/* Right: Independent Project Disclaimer + Call 112 CTA */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Independent project badge */}
          <div className="hidden xl:flex items-center gap-2 text-right">
            <Shield className="w-5 h-5 text-[#0F766E] shrink-0" />
            <div className="text-[11px] leading-tight text-[#475569]">
              <span className="font-bold text-[#0B1F33] block">Independent project</span>
              <span>Not affiliated with police or government</span>
            </div>
          </div>

          {/* Trusted Circle Check-In Button */}
          {onOpenTrustedCircle && (
            <button
              type="button"
              onClick={onOpenTrustedCircle}
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#E8F0EE] hover:bg-[#D1E3DF] text-[#0F766E] border border-[#0F766E]/40 px-3 py-2 rounded-lg font-bold text-xs tracking-wide transition-colors cursor-pointer"
              title="Timed Safety Check-In for students & commuters"
            >
              <Clock className="w-4 h-4 text-[#0F766E]" />
              <span>Safety Check-In</span>
            </button>
          )}

          {/* Reserved Emergency Call 112 Action */}
          <a
            href="tel:112"
            className="inline-flex items-center gap-2 bg-[#D92D20] text-white hover:bg-[#B42318] px-3.5 py-2 rounded-lg font-bold text-xs sm:text-sm tracking-wide shadow-xs transition-colors cursor-pointer"
            aria-label="Call 112 Emergency"
          >
            <Phone className="w-4 h-4" />
            <span>Call 112</span>
          </a>

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md border border-[#D5DCE0] text-[#0B1F33] hover:bg-[#F6F8F7]"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#D5DCE0] bg-white p-4 space-y-3">
          {/* Mobile State Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Indian State or UT..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F6F8F7] border border-[#64748B]/40 rounded-md"
            />
            {searchQuery && (
              <div className="mt-1 bg-white border border-[#D5DCE0] rounded-md max-h-40 overflow-y-auto divide-y divide-[#F1F5F9]">
                {searchResults.map(item => {
                  const isState = item.type === 'state';
                  const label = isState ? item.name : `${item.displayName || item.name} (${item.stateName})`;
                  return (
                    <button
                      key={isState ? `m-state-${item.name}` : `m-dist-${item.stateName}-${item.name}`}
                      type="button"
                      onClick={() => {
                        if (isState) {
                          handleSelectStateItem(item.name);
                        } else {
                          handleSelectDistrictItem(item.name, item.stateName);
                        }
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left p-2 text-xs hover:bg-[#F6F8F7] flex items-center justify-between"
                    >
                      <span>{label}</span>
                      <span className="text-[10px] px-1 py-0.2 bg-[#F1F5F9] text-[#64748B] rounded">
                        {isState ? 'State' : 'District'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                onNavigate('atlas');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-md text-left bg-[#F6F8F7] text-[#0B1F33]"
            >
              Atlas & Map
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate('notices');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-md text-left bg-[#F6F8F7] text-[#0B1F33]"
            >
              Missing Notices
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate('wanted');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-md text-left bg-[#F6F8F7] text-[#0B1F33]"
            >
              Wanted Notices
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate('emergency');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-md text-left bg-[#FEE2E2] text-[#D92D20]"
            >
              Emergency Help
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate('police_triage');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-md text-left bg-[#E8F0EE] text-[#0F766E] col-span-2 font-bold"
            >
              Police Triage Desk (B2G Demo)
            </button>
            {onOpenTrustedCircle && (
              <button
                type="button"
                onClick={() => {
                  onOpenTrustedCircle();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-md text-left bg-[#E8F0EE] text-[#0F766E] col-span-2 font-bold flex items-center gap-2 border border-[#0F766E]/30"
              >
                <Clock className="w-4 h-4 text-[#0F766E]" />
                <span>Trusted Circle Safety Check-In</span>
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-[#D5DCE0] flex items-center justify-between text-xs text-[#475569]">
            <button
              type="button"
              onClick={() => {
                onOpenAbout();
                setMobileMenuOpen(false);
              }}
              className="hover:underline text-[#0F766E] font-medium"
            >
              About Project
            </button>
            <span>NCRB 2024</span>
          </div>
        </div>
      )}
    </header>
  );
};
