import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ActiveTab } from '../types';
import { ALL_INDIA_STATES } from '../data/crimeData';
import { INDIA_DISTRICTS_BY_STATE, DISTRICT_KNOWN_ALIASES } from '../data/indiaGeoData';
import {
  Search,
  Phone,
  Shield,
  X,
  MapPin,
  Menu,
  ChevronDown
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
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onNavigate,
  selectedState,
  selectedDistrict,
  onSelectState,
  onSelectDistrict,
  onOpenSources,
  onOpenAbout
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
          score = 105;
        } else if (dLower.startsWith(q)) {
          score = 85;
        } else if (dLower.includes(q)) {
          score = 65;
        }

        // Check aliases
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
    return scored.slice(0, 10).map(s => s.item);
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
    if (!isSearchOpen || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = searchResults[highlightedIndex];
      if (current) {
        if (current.type === 'state') {
          handleSelectStateItem(current.name);
        } else {
          handleSelectDistrictItem(current.name, current.stateName);
        }
      }
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="bg-white border-b border-[#D5DCE0] sticky top-0 z-40 transition-colors">
      {/* Top Disclaimer Banner - Clean & Restrained */}
      <div className="bg-[#F6F8F7] border-b border-[#D5DCE0]/70 px-4 py-1.5 text-[11px] text-[#475569]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
            <span>
              Independent project. Not affiliated with any police force or government body.
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-[#64748B]">
            <span className="font-medium text-[#0F766E]">NCRB 2024 DATASET</span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-[#B45309]">SAMPLE NOTICES LABELED DEMO</span>
            <span aria-hidden="true">·</span>
            <span>Emergency dial 112</span>
            <span aria-hidden="true">·</span>
            <span className="hidden md:inline">Shortcuts: [O] Overview · [A] Stats · [N] Notices · [R] Research · [E] Help</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Wordmark and State Search */}
        <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => onNavigate('overview')}
            className="text-2xl font-bold font-serif text-[#0B1F33] tracking-tight hover:text-[#0F766E] transition-colors cursor-pointer shrink-0 flex items-center gap-2"
            aria-label="Averti Home Overview"
          >
            <span>Averti</span>
            <span className="text-[10px] uppercase font-sans font-semibold tracking-wider px-1.5 py-0.5 rounded bg-[#E8F0EE] text-[#0F766E] border border-[#0F766E]/20 hidden sm:inline-block">
              Atlas
            </span>
          </button>

          {/* State / UT Quick Search */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-xs hidden sm:block">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                placeholder="Search state or district..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#F6F8F7] border border-[#D5DCE0] rounded-md text-[#0B1F33] placeholder-[#64748B] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                aria-label="Search Indian states, union territories, or districts"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0B1F33] p-0.5 cursor-pointer"
                  aria-label="Clear search query"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Dropdown Results */}
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
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <MapPin className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                            <span className="font-semibold truncate">{item.name}</span>
                            <span className="text-[10px] text-[#64748B]">State / UT</span>
                          </span>
                          {selectedState === item.name && !selectedDistrict && (
                            <span className="text-[10px] text-[#0F766E] font-semibold shrink-0">Selected</span>
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
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <MapPin className="w-3.5 h-3.5 text-[#B45309] shrink-0" />
                            <div className="truncate">
                              <span className="font-semibold text-[#0B1F33]">{item.displayName || item.name}</span>
                              <span className="text-[11px] text-[#64748B] ml-1">({item.stateName})</span>
                            </div>
                          </span>
                          {selectedState === item.stateName && selectedDistrict === item.name && (
                            <span className="text-[10px] text-[#0F766E] font-semibold shrink-0">Selected</span>
                          )}
                        </button>
                      );
                    }
                  })
                ) : (
                  <div className="p-3 text-center text-[#64748B]">
                    No state or district matches &ldquo;{searchQuery}&rdquo;
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center Nav Links (Desktop) - 6 Clear Pillars */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#475569]">
          <button
            type="button"
            onClick={() => onNavigate('overview')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer border-b-2 ${
              activeTab === 'overview'
                ? 'text-[#0F766E] border-[#0F766E] font-semibold'
                : 'border-transparent hover:text-[#0B1F33]'
            }`}
          >
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('atlas')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer border-b-2 ${
              activeTab === 'atlas'
                ? 'text-[#0F766E] border-[#0F766E] font-semibold'
                : 'border-transparent hover:text-[#0B1F33]'
            }`}
          >
            <span>Crime Statistics</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('notices')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer border-b-2 ${
              activeTab === 'notices' || activeTab === 'wanted'
                ? 'text-[#0F766E] border-[#0F766E] font-semibold'
                : 'border-transparent hover:text-[#0B1F33]'
            }`}
          >
            <span>Public Notices</span>
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
            <span>Safety Resources</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('reports')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer border-b-2 ${
              activeTab === 'reports'
                ? 'text-[#0F766E] border-[#0F766E] font-semibold'
                : 'border-transparent hover:text-[#0B1F33]'
            }`}
          >
            <span>Research &amp; Insights</span>
          </button>

          <button
            type="button"
            onClick={onOpenSources}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer border-b-2 ${
              activeTab === 'sources'
                ? 'text-[#0F766E] border-[#0F766E] font-semibold'
                : 'border-transparent hover:text-[#0B1F33]'
            }`}
          >
            <span>Sources</span>
          </button>

          <button
            type="button"
            onClick={onOpenAbout}
            className="whitespace-nowrap transition-colors py-1 cursor-pointer border-b-2 border-transparent hover:text-[#0B1F33]"
          >
            <span>About</span>
          </button>
        </nav>

        {/* Right: Call 112 Emergency CTA + Mobile Menu Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="tel:112"
            className="inline-flex items-center gap-2 bg-[#D92D20] text-white hover:bg-[#B42318] px-3.5 py-1.5 rounded-md font-bold text-xs tracking-wide shadow-xs transition-colors cursor-pointer"
            aria-label="Call 112 Emergency"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call 112</span>
          </a>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="lg:hidden p-1.5 rounded-md border border-[#D5DCE0] text-[#475569] hover:text-[#0B1F33] cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#D5DCE0] px-4 py-3 space-y-2 text-sm font-medium">
          <button
            type="button"
            onClick={() => {
              onNavigate('overview');
              setMobileMenuOpen(false);
            }}
            className={`block w-full text-left py-2 px-3 rounded-md transition-colors ${
              activeTab === 'overview' ? 'bg-[#E8F0EE] text-[#0F766E] font-bold' : 'text-[#475569]'
            }`}
          >
            1. Overview
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigate('atlas');
              setMobileMenuOpen(false);
            }}
            className={`block w-full text-left py-2 px-3 rounded-md transition-colors ${
              activeTab === 'atlas' ? 'bg-[#E8F0EE] text-[#0F766E] font-bold' : 'text-[#475569]'
            }`}
          >
            2. Crime Statistics
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigate('notices');
              setMobileMenuOpen(false);
            }}
            className={`block w-full text-left py-2 px-3 rounded-md transition-colors ${
              activeTab === 'notices' || activeTab === 'wanted' ? 'bg-[#E8F0EE] text-[#0F766E] font-bold' : 'text-[#475569]'
            }`}
          >
            3. Public Notices
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigate('emergency');
              setMobileMenuOpen(false);
            }}
            className={`block w-full text-left py-2 px-3 rounded-md transition-colors ${
              activeTab === 'emergency' ? 'bg-[#FEE4E2] text-[#D92D20] font-bold' : 'text-[#475569]'
            }`}
          >
            4. Safety Resources (112)
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigate('reports');
              setMobileMenuOpen(false);
            }}
            className={`block w-full text-left py-2 px-3 rounded-md transition-colors ${
              activeTab === 'reports' ? 'bg-[#E8F0EE] text-[#0F766E] font-bold' : 'text-[#475569]'
            }`}
          >
            5. Research &amp; Insights
          </button>

          <div className="pt-2 border-t border-[#D5DCE0]/60 flex items-center justify-between text-xs text-[#64748B]">
            <button
              type="button"
              onClick={() => {
                onOpenSources();
                setMobileMenuOpen(false);
              }}
              className="py-1 px-2 hover:text-[#0B1F33]"
            >
              6. Data Sources
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenAbout();
                setMobileMenuOpen(false);
              }}
              className="py-1 px-2 hover:text-[#0B1F33]"
            >
              About Averti
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
