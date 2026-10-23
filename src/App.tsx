import React, { useState, useEffect, useMemo } from 'react';
import { ActiveTab, Notice } from './types';
import { INITIAL_NOTICES } from './data/noticesData';
import { ALL_INDIA_STATES } from './data/crimeData';
import { getDistrictNamesForState } from './data/indiaGeoData';
import { Header } from './components/Header';
import { IndiaMap } from './components/IndiaMap';
import { InteractiveMap } from './components/InteractiveMap';
import { PoliceAdminDashboard } from './components/PoliceAdminDashboard';
import { StateListView } from './components/StateListView';
import { StateSummaryCard } from './components/StateSummaryCard';
import { NoticesPanel } from './components/NoticesPanel';
import { WantedNoticesPanel } from './components/WantedNoticesPanel';
import { CrimeReportsView } from './components/CrimeReportsView';
import { OverviewSection } from './components/OverviewSection';
import { PublicNoticesView } from './components/PublicNoticesView';
import { NoticeDetailModal } from './components/NoticeDetailModal';
import { EmergencyHelpPage } from './components/EmergencyHelpPage';
import { SourcesMethodModal } from './components/SourcesMethodModal';
import { AboutModal } from './components/AboutModal';
import { CorrectionsModal } from './components/CorrectionsModal';
import { NoticeTipModal } from './components/NoticeTipModal';
import { Footer } from './components/Footer';
import {
  Map as MapIcon,
  List as ListIcon,
  ChevronDown,
  Phone,
  Shield,
  Layers,
  FileText,
  Newspaper,
  LayoutDashboard
} from 'lucide-react';

export default function App() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'gis' | 'list'>('gis');
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  const [mobileSectionTab, setMobileSectionTab] = useState<'map' | 'notices' | 'wanted' | 'reports'>('map');

  // Modal states
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isCorrectionsModalOpen, setIsCorrectionsModalOpen] = useState(false);
  const [correctionPrefillRef, setCorrectionPrefillRef] = useState<string>('');
  const [tipModalNotice, setTipModalNotice] = useState<Notice | null>(null);

  // Loading states
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isDataTransitioning, setIsDataTransitioning] = useState<boolean>(false);

  // Initial initialization hydration window
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Available districts for the current state
  const availableDistricts = useMemo(() => {
    return selectedState ? getDistrictNamesForState(selectedState) : [];
  }, [selectedState]);

  // Handle URL deep links & hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/tip/')) {
        const id = hash.replace('#/tip/', '');
        const found = INITIAL_NOTICES.find(n => n.id === id);
        if (found) {
          setTipModalNotice(found);
        } else if (INITIAL_NOTICES.length > 0) {
          setTipModalNotice(INITIAL_NOTICES[0]);
        }
      } else if (hash.startsWith('#/notice/')) {
        const id = hash.replace('#/notice/', '');
        const found = INITIAL_NOTICES.find(n => n.id === id);
        if (found) setSelectedNotice(found);
      } else if (hash.startsWith('#/overview')) {
        setActiveTab('overview');
      } else if (hash.startsWith('#/map') || hash.startsWith('#/atlas')) {
        setActiveTab('atlas');
      } else if (hash.startsWith('#/emergency')) {
        setActiveTab('emergency');
      } else if (hash.startsWith('#/reports')) {
        setActiveTab('reports');
      } else if (hash.startsWith('#/notices')) {
        setActiveTab('notices');
      } else if (hash.startsWith('#/wanted')) {
        setActiveTab('wanted');
      } else if (hash.startsWith('#/police') || hash.startsWith('#/triage')) {
        setActiveTab('police_triage');
      } else if (hash.startsWith('#/sources')) {
        setIsSourcesModalOpen(true);
      } else if (hash.startsWith('#/about')) {
        setIsAboutModalOpen(true);
      } else if (hash.startsWith('#/state/')) {
        setActiveTab('atlas');
        const statePart = hash.replace('#/state/', '');
        if (statePart.includes('/district/')) {
          const [s, d] = statePart.split('/district/');
          const stateUrlName = decodeURIComponent(s);
          const districtUrlName = decodeURIComponent(d);
          const matched = ALL_INDIA_STATES.find(
            item => item.toLowerCase() === stateUrlName.toLowerCase()
          );
          if (matched) {
            setSelectedState(matched);
            setSelectedDistrict(districtUrlName);
          }
        } else {
          const stateUrlName = decodeURIComponent(statePart);
          const matched = ALL_INDIA_STATES.find(
            s => s.toLowerCase() === stateUrlName.toLowerCase()
          );
          if (matched) {
            setSelectedState(matched);
            setSelectedDistrict(null);
          }
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Keyboard shortcut listener ('o' for Overview, 'a' for Atlas/Stats, 'n' for Notices, 'r' for Reports, 'e' for Help, 'v' for View Mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'o') {
        e.preventDefault();
        setActiveTab('overview');
        window.history.replaceState(null, '', '#/overview');
      } else if (key === 'a') {
        e.preventDefault();
        setActiveTab('atlas');
        if (selectedState) {
          window.history.replaceState(null, '', `#/state/${encodeURIComponent(selectedState)}`);
        } else {
          window.history.replaceState(null, '', '#/map');
        }
      } else if (key === 'n') {
        e.preventDefault();
        setActiveTab('notices');
        window.history.replaceState(null, '', '#/notices');
      } else if (key === 'e') {
        e.preventDefault();
        setActiveTab('emergency');
        window.history.replaceState(null, '', '#/emergency');
      } else if (key === 'r') {
        e.preventDefault();
        setActiveTab('reports');
        window.history.replaceState(null, '', '#/reports');
      } else if (key === 'p') {
        e.preventDefault();
        setActiveTab('police_triage');
        window.history.replaceState(null, '', '#/police-triage');
      } else if (key === 'v') {
        if (activeTab === 'atlas') {
          e.preventDefault();
          setViewMode(prev => (prev === 'gis' ? 'map' : prev === 'map' ? 'list' : 'gis'));
        }
      } else if (key === 'escape') {
        if (selectedNotice) {
          setSelectedNotice(null);
        } else if (isAboutModalOpen) {
          setIsAboutModalOpen(false);
        } else if (isSourcesModalOpen) {
          setIsSourcesModalOpen(false);
        } else if (isCorrectionsModalOpen) {
          setIsCorrectionsModalOpen(false);
        } else if (selectedDistrict) {
          setSelectedDistrict(null);
        } else if (selectedState) {
          handleSelectState(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, selectedState, selectedDistrict, selectedNotice, isAboutModalOpen, isSourcesModalOpen, isCorrectionsModalOpen]);

  // Sync state selection to URL hash when updated
  const handleSelectState = (state: string | null) => {
    setIsDataTransitioning(true);
    setSelectedState(state);
    setSelectedDistrict(null);
    if (state) {
      window.history.replaceState(null, '', `#/state/${encodeURIComponent(state)}`);
    } else {
      window.history.replaceState(null, '', '#/map');
    }
    setTimeout(() => {
      setIsDataTransitioning(false);
    }, 200);
  };

  const handleSelectDistrict = (district: string | null, stateOverride?: string | null) => {
    setIsDataTransitioning(true);
    const targetState = stateOverride || selectedState;
    if (stateOverride && stateOverride !== selectedState) {
      setSelectedState(stateOverride);
    }
    setSelectedDistrict(district);
    if (district) {
      setViewMode('gis');
      setActiveTab('atlas');
      setMobileSectionTab('map');
    }
    if (targetState && district) {
      window.history.replaceState(null, '', `#/state/${encodeURIComponent(targetState)}/district/${encodeURIComponent(district)}`);
    } else if (targetState) {
      window.history.replaceState(null, '', `#/state/${encodeURIComponent(targetState)}`);
    } else {
      window.history.replaceState(null, '', '#/map');
    }
    setTimeout(() => {
      setIsDataTransitioning(false);
    }, 200);
  };

  const handleOpenNotice = (notice: Notice) => {
    setSelectedNotice(notice);
    window.history.replaceState(null, '', `#/notice/${notice.id}`);
  };

  const handleCloseNotice = () => {
    setSelectedNotice(null);
    if (selectedState) {
      window.history.replaceState(null, '', `#/state/${encodeURIComponent(selectedState)}`);
    } else {
      window.history.replaceState(null, '', '#/map');
    }
  };

  const handleOpenCorrection = (ref: string) => {
    setCorrectionPrefillRef(ref);
    setIsCorrectionsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F6F8F7] text-[#0B1F33] flex flex-col font-sans">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        onNavigate={(tab) => {
          setActiveTab(tab);
          if (tab === 'overview') {
            window.history.replaceState(null, '', '#/overview');
          } else if (tab === 'emergency') {
            window.history.replaceState(null, '', '#/emergency');
          } else if (tab === 'reports') {
            window.history.replaceState(null, '', '#/reports');
          } else if (tab === 'notices' || tab === 'wanted') {
            window.history.replaceState(null, '', '#/notices');
          } else if (tab === 'police_triage') {
            window.history.replaceState(null, '', '#/police-triage');
          } else {
            if (selectedState) {
              window.history.replaceState(null, '', `#/state/${encodeURIComponent(selectedState)}`);
            } else {
              window.history.replaceState(null, '', '#/map');
            }
          }
        }}
        selectedState={selectedState}
        selectedDistrict={selectedDistrict}
        onSelectState={handleSelectState}
        onSelectDistrict={handleSelectDistrict}
        onOpenSources={() => setIsSourcesModalOpen(true)}
        onOpenAbout={() => setIsAboutModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-3 sm:px-6 py-5 sm:py-7">
        {activeTab === 'overview' ? (
          <OverviewSection
            onNavigate={(tab) => {
              if (tab === 'about') {
                setIsAboutModalOpen(true);
              } else if (tab === 'sources') {
                setIsSourcesModalOpen(true);
              } else {
                setActiveTab(tab);
              }
            }}
            onSelectState={handleSelectState}
          />
        ) : activeTab === 'emergency' ? (
          <EmergencyHelpPage
            onBackToAtlas={() => {
              setActiveTab('atlas');
              window.history.replaceState(null, '', '#/map');
            }}
          />
        ) : activeTab === 'reports' ? (
          <CrimeReportsView
            selectedState={selectedState}
            onSelectState={handleSelectState}
            onNavigateToAtlas={() => {
              setActiveTab('atlas');
              window.history.replaceState(null, '', '#/map');
            }}
          />
        ) : activeTab === 'police_triage' ? (
          <PoliceAdminDashboard />
        ) : activeTab === 'notices' || activeTab === 'wanted' ? (
          <PublicNoticesView
            notices={INITIAL_NOTICES}
            selectedState={selectedState}
            onSelectState={handleSelectState}
            onSelectNotice={handleOpenNotice}
            onReturnToAtlas={() => {
              setActiveTab('atlas');
              window.history.replaceState(null, '', '#/map');
            }}
            isLoading={isInitializing || isDataTransitioning}
          />
        ) : (
          <div className="space-y-4">
            {/* Mobile View Switcher Tabs (360px - 1023px) */}
            <div className="lg:hidden flex items-center p-1 bg-white border border-[#D5DCE0] rounded-lg shadow-xs">
              <button
                type="button"
                onClick={() => setMobileSectionTab('map')}
                className={`flex-1 py-2 text-xs font-semibold rounded transition-colors ${
                  mobileSectionTab === 'map'
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'text-[#475569] hover:text-[#0B1F33]'
                }`}
              >
                Map &amp; Stats
              </button>
              <button
                type="button"
                onClick={() => setMobileSectionTab('notices')}
                className={`flex-1 py-2 text-xs font-semibold rounded transition-colors ${
                  mobileSectionTab === 'notices'
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'text-[#475569] hover:text-[#0B1F33]'
                }`}
              >
                Missing Persons
              </button>
              <button
                type="button"
                onClick={() => setMobileSectionTab('wanted')}
                className={`flex-1 py-2 text-xs font-semibold rounded transition-colors ${
                  mobileSectionTab === 'wanted'
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'text-[#475569] hover:text-[#0B1F33]'
                }`}
              >
                Wanted
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reports')}
                className="flex-1 py-2 text-xs font-semibold rounded transition-colors text-[#475569] hover:text-[#0B1F33]"
              >
                Reports
              </button>
            </div>

            {/* Core Desktop 3-Column Layout: Left (Missing), Center (Map), Right (Stats & Wanted) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* LEFT COLUMN: Missing Persons & Other Notices (3 cols) */}
              <div
                className={`lg:col-span-3 xl:col-span-3 ${
                  mobileSectionTab === 'notices' ? 'block' : 'hidden lg:block'
                }`}
              >
                <NoticesPanel
                  notices={INITIAL_NOTICES}
                  selectedState={selectedState}
                  onSelectNotice={handleOpenNotice}
                  onViewAllNotices={() => {
                    setActiveTab('notices');
                    window.history.replaceState(null, '', '#/notices');
                  }}
                  isLoading={isInitializing || isDataTransitioning}
                />
              </div>

              {/* CENTER COLUMN: Interactive India Map & Minimal Controls (6 cols) */}
              <div
                className={`lg:col-span-6 xl:col-span-6 space-y-4 ${
                  mobileSectionTab === 'map' ? 'block' : 'hidden lg:block'
                }`}
              >
                {/* Center Column Top Controls Bar */}
                <div className="bg-white rounded-lg border border-[#D5DCE0] p-3 shadow-xs flex items-center justify-between gap-3 flex-wrap">
                  {/* Selectors Container: State & District */}
                  <div className="flex items-center gap-2.5 flex-1 flex-wrap min-w-[220px]">
                    {/* State Select Dropdown */}
                    <div className="flex items-center gap-1.5 flex-1 min-w-[170px]">
                      <span className="text-xs font-semibold text-[#475569] shrink-0">
                        State:
                      </span>
                      <div className="relative flex-1">
                        <select
                          value={selectedState || ''}
                          onChange={(e) => handleSelectState(e.target.value || null)}
                          className="w-full appearance-none pl-2.5 pr-7 py-1.5 text-xs font-medium bg-[#F6F8F7] border border-[#D5DCE0] rounded text-[#0B1F33] focus:outline-none focus:ring-1 focus:ring-[#0F766E] cursor-pointer"
                          aria-label="Filter entire atlas by state"
                        >
                          <option value="">India (overall) — All States &amp; UTs</option>
                          {ALL_INDIA_STATES.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* District Select Dropdown (Visible whenever a state with districts is selected) */}
                    {selectedState && availableDistricts.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-1 min-w-[170px]">
                        <span className="text-xs font-semibold text-[#475569] shrink-0">
                          District:
                        </span>
                        <div className="relative flex-1">
                          <select
                            value={selectedDistrict || ''}
                            onChange={(e) => handleSelectDistrict(e.target.value || null)}
                            className="w-full appearance-none pl-2.5 pr-7 py-1.5 text-xs font-medium bg-[#F6F8F7] border border-[#D5DCE0] rounded text-[#0B1F33] focus:outline-none focus:ring-1 focus:ring-[#0F766E] cursor-pointer"
                            aria-label={`Filter by district in ${selectedState}`}
                          >
                            <option value="">All Districts ({selectedState})</option>
                            {availableDistricts.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Segmented View Mode Toggle: Interactive Map vs Vector Map vs List */}
                  <div className="inline-flex rounded border border-[#D5DCE0] p-0.5 bg-[#F6F8F7] text-xs font-semibold shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewMode('gis')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded transition-colors cursor-pointer ${
                        viewMode === 'gis'
                          ? 'bg-[#0F766E] text-white shadow-xs'
                          : 'text-[#475569] hover:text-[#0B1F33]'
                      }`}
                      aria-pressed={viewMode === 'gis'}
                      title="Interactive WebGIS Canvas Map [Key: V]"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>WebGIS Atlas</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('map')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded transition-colors cursor-pointer ${
                        viewMode === 'map'
                          ? 'bg-[#0F766E] text-white shadow-xs'
                          : 'text-[#475569] hover:text-[#0B1F33]'
                      }`}
                      aria-pressed={viewMode === 'map'}
                      title="Clean Vector Outline Map [Key: V]"
                    >
                      <MapIcon className="w-3.5 h-3.5" />
                      <span>Vector Map</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded transition-colors cursor-pointer ${
                        viewMode === 'list'
                          ? 'bg-[#0F766E] text-white shadow-xs'
                          : 'text-[#475569] hover:text-[#0B1F33]'
                      }`}
                      aria-pressed={viewMode === 'list'}
                      title="State Table List View [Key: V]"
                    >
                      <ListIcon className="w-3.5 h-3.5" />
                      <span>List</span>
                    </button>
                  </div>
                </div>

                {/* Primary Visualization Area */}
                {viewMode === 'gis' ? (
                  <InteractiveMap
                    selectedState={selectedState}
                    selectedDistrict={selectedDistrict}
                    onSelectState={handleSelectState}
                    onSelectDistrict={handleSelectDistrict}
                  />
                ) : viewMode === 'map' ? (
                  <IndiaMap
                    selectedState={selectedState}
                    onSelectState={handleSelectState}
                    onOpenSourcesModal={() => setIsSourcesModalOpen(true)}
                  />
                ) : (
                  <StateListView
                    selectedState={selectedState}
                    selectedDistrict={selectedDistrict}
                    onSelectState={handleSelectState}
                    onSelectDistrict={handleSelectDistrict}
                  />
                )}
              </div>

              {/* RIGHT COLUMN: State Summary & Wanted Notices (3 cols) */}
              <div
                className={`lg:col-span-3 xl:col-span-3 space-y-4 ${
                  mobileSectionTab === 'wanted' || mobileSectionTab === 'map'
                    ? 'block'
                    : 'hidden lg:block'
                }`}
              >
                {/* Selected State & Area Overview Card */}
                <StateSummaryCard
                  selectedState={selectedState}
                  selectedDistrict={selectedDistrict}
                  onResetToIndia={() => handleSelectState(null)}
                  onResetDistrict={() => handleSelectDistrict(null)}
                  onOpenDetailedStats={() => setIsSourcesModalOpen(true)}
                  isLoading={isInitializing || isDataTransitioning}
                />

                {/* Police & Agency Wanted Notices */}
                <WantedNoticesPanel
                  notices={INITIAL_NOTICES}
                  selectedState={selectedState}
                  onSelectNotice={handleOpenNotice}
                  onViewAllWanted={() => {
                    setActiveTab('notices');
                    window.history.replaceState(null, '', '#/notices');
                  }}
                  isLoading={isInitializing || isDataTransitioning}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Notice Detail View / Modal */}
      <NoticeDetailModal
        notice={selectedNotice}
        onClose={handleCloseNotice}
        onRequestCorrection={(ref) => handleOpenCorrection(ref)}
        onOpenTipModal={(targetNotice) => {
          setSelectedNotice(null);
          setTipModalNotice(targetNotice);
        }}
      />

      {/* Notice Citizen Tip Modal */}
      <NoticeTipModal
        isOpen={Boolean(tipModalNotice)}
        notice={tipModalNotice}
        onClose={() => setTipModalNotice(null)}
        onTipSubmitted={(receipt: any) => {
          console.log("Tip submitted:", receipt);
        }}
      />

      {/* Sources & Methodology Modal */}
      <SourcesMethodModal
        isOpen={isSourcesModalOpen}
        onClose={() => setIsSourcesModalOpen(false)}
      />

      {/* About Averti Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        onOpenSources={() => {
          setIsAboutModalOpen(false);
          setIsSourcesModalOpen(true);
        }}
      />

      {/* Corrections & Takedown Modal */}
      <CorrectionsModal
        isOpen={isCorrectionsModalOpen}
        prefilledRef={correctionPrefillRef}
        onClose={() => {
          setIsCorrectionsModalOpen(false);
          setCorrectionPrefillRef('');
        }}
      />

      {/* Footer */}
      <Footer
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenSources={() => setIsSourcesModalOpen(true)}
        onOpenCorrections={() => setIsCorrectionsModalOpen(true)}
      />

      {/* Bottom Sticky Navigation Bar for Mobile (≤ 768px) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#D5DCE0] py-2 px-3 flex items-center justify-around z-40 shadow-lg text-[10px] font-medium"
        aria-label="Mobile Bottom Navigation"
      >
        <button
          type="button"
          onClick={() => {
            setActiveTab('overview');
          }}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'overview'
              ? 'text-[#0F766E] font-bold'
              : 'text-[#475569]'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('atlas');
            setMobileSectionTab('map');
          }}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'atlas' && mobileSectionTab === 'map'
              ? 'text-[#0F766E] font-bold'
              : 'text-[#475569]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Statistics</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('notices');
          }}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'notices' || activeTab === 'wanted'
              ? 'text-[#0F766E] font-bold'
              : 'text-[#475569]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Notices</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('reports');
          }}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'reports'
              ? 'text-[#0F766E] font-bold'
              : 'text-[#475569]'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>Insights</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('emergency')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'emergency'
              ? 'text-[#D92D20] font-bold'
              : 'text-[#475569]'
          }`}
        >
          <Phone className="w-4 h-4 text-[#D92D20]" />
          <span>112 Help</span>
        </button>
      </nav>
    </div>
  );
}
