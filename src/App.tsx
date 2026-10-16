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
import { DistrictPulsePanel } from './components/DistrictPulsePanel';
import { NoticesPanel } from './components/NoticesPanel';
import { WantedNoticesPanel } from './components/WantedNoticesPanel';
import { NoticeDetailModal } from './components/NoticeDetailModal';
import { EmergencyHelpPage } from './components/EmergencyHelpPage';
import { SourcesMethodModal } from './components/SourcesMethodModal';
import { AboutModal } from './components/AboutModal';
import { CorrectionsModal } from './components/CorrectionsModal';
import { TrustedCircleModal } from './components/TrustedCircleModal';
import { NoticeTipModal } from './components/NoticeTipModal';
import { DemoPresentationBar } from './components/DemoPresentationBar';
import { OfflineStatusBanner } from './components/OfflineStatusBanner';
import { Footer } from './components/Footer';
import {
  Map as MapIcon,
  List as ListIcon,
  ChevronDown,
  Phone,
  Shield,
  Layers,
  FileText
} from 'lucide-react';

export default function App() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'gis' | 'list'>('gis');
  const [activeTab, setActiveTab] = useState<ActiveTab>('atlas');

  const [mobileSectionTab, setMobileSectionTab] = useState<'map' | 'pulse' | 'notices' | 'wanted'>('map');

  // Modal states
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isCorrectionsModalOpen, setIsCorrectionsModalOpen] = useState(false);
  const [correctionPrefillRef, setCorrectionPrefillRef] = useState<string>('');
  const [isTrustedCircleModalOpen, setIsTrustedCircleModalOpen] = useState(false);
  const [trustedCircleInitialState, setTrustedCircleInitialState] = useState<'setup' | 'escalated'>('setup');
  const [tipModalNotice, setTipModalNotice] = useState<Notice | null>(null);
  const [isOfflineSimulated, setIsOfflineSimulated] = useState<boolean>(false);

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
      } else if (hash.startsWith('#/emergency')) {
        setActiveTab('emergency');
      } else if (hash.startsWith('#/police') || hash.startsWith('#/triage')) {
        setActiveTab('police_triage');
      } else if (hash.startsWith('#/trusted') || hash.startsWith('#/safety')) {
        setIsTrustedCircleModalOpen(true);
      } else if (hash.startsWith('#/sources')) {
        setIsSourcesModalOpen(true);
      } else if (hash.startsWith('#/about')) {
        setIsAboutModalOpen(true);
      } else if (hash.startsWith('#/state/')) {
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

  // Sync state selection to URL hash when updated
  const handleSelectState = (state: string | null) => {
    setSelectedState(state);
    setSelectedDistrict(null);
    if (state) {
      window.history.replaceState(null, '', `#/state/${encodeURIComponent(state)}`);
    } else {
      window.history.replaceState(null, '', '#/');
    }
  };

  const handleSelectDistrict = (district: string | null, stateOverride?: string | null) => {
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
      window.history.replaceState(null, '', '#/');
    }
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
      window.history.replaceState(null, '', '#/');
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
          if (tab === 'emergency') {
            window.history.replaceState(null, '', '#/emergency');
          } else if (tab === 'police_triage') {
            window.history.replaceState(null, '', '#/police-triage');
          } else {
            window.history.replaceState(null, '', '#/');
          }
        }}
        selectedState={selectedState}
        selectedDistrict={selectedDistrict}
        onSelectState={handleSelectState}
        onSelectDistrict={handleSelectDistrict}
        onOpenSources={() => setIsSourcesModalOpen(true)}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenTrustedCircle={() => setIsTrustedCircleModalOpen(true)}
      />

      {/* Offline Status & Local Cache Banner */}
      <OfflineStatusBanner
        isSimulatedOffline={isOfflineSimulated}
        onEmergencyCall={() => {
          window.location.href = 'tel:112';
        }}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {activeTab === 'emergency' ? (
          <EmergencyHelpPage
            onBackToAtlas={() => setActiveTab('atlas')}
            onOpenTrustedCircle={() => setIsTrustedCircleModalOpen(true)}
          />
        ) : activeTab === 'police_triage' ? (
          <PoliceAdminDashboard />
        ) : (
          <div className="space-y-4">
            {/* Mobile View Switcher Tabs (360px - 1023px) */}
            <div className="lg:hidden flex items-center p-1 bg-white border border-[#D5DCE0] rounded-lg shadow-xs">
              <button
                type="button"
                onClick={() => setMobileSectionTab('map')}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
                  mobileSectionTab === 'map'
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'text-[#475569] hover:text-[#0B1F33]'
                }`}
              >
                Map & Stats
              </button>
              <button
                type="button"
                onClick={() => setMobileSectionTab('pulse')}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1 ${
                  mobileSectionTab === 'pulse'
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'text-[#475569] hover:text-[#0B1F33]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Pulse
              </button>
              <button
                type="button"
                onClick={() => setMobileSectionTab('notices')}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
                  mobileSectionTab === 'notices'
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'text-[#475569] hover:text-[#0B1F33]'
                }`}
              >
                Notices
              </button>
              <button
                type="button"
                onClick={() => setMobileSectionTab('wanted')}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
                  mobileSectionTab === 'wanted'
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'text-[#475569] hover:text-[#0B1F33]'
                }`}
              >
                Wanted
              </button>
            </div>

            {/* Core Desktop 3-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* LEFT COLUMN: Missing Persons & Other Notices (3.2 cols) */}
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
                    handleSelectState(null);
                  }}
                />
              </div>

              {/* CENTER COLUMN: Interactive India Map & Controls (5.6 cols) */}
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
                          className="w-full appearance-none pl-2.5 pr-7 py-1.5 text-xs font-medium bg-[#F6F8F7] border border-[#64748B]/50 rounded-md text-[#0B1F33] focus:outline-none focus:ring-1 focus:ring-[#0F766E] cursor-pointer"
                          aria-label="Filter entire atlas by state"
                        >
                          <option value="">India (overall) — All States & UTs</option>
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
                            className="w-full appearance-none pl-2.5 pr-7 py-1.5 text-xs font-medium bg-[#F6F8F7] border border-[#64748B]/50 rounded-md text-[#0B1F33] focus:outline-none focus:ring-1 focus:ring-[#0F766E] cursor-pointer"
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

                  {/* Segmented View Mode Toggle: Vector Map vs WebGIS vs List */}
                  <div className="inline-flex rounded-md border border-[#64748B]/40 p-0.5 bg-[#F6F8F7] text-xs font-semibold shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewMode('map')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded transition-colors cursor-pointer ${
                        viewMode === 'map'
                          ? 'bg-[#0F766E] text-white shadow-xs'
                          : 'text-[#475569] hover:text-[#0B1F33]'
                      }`}
                      aria-pressed={viewMode === 'map'}
                    >
                      <MapIcon className="w-3.5 h-3.5" />
                      <span>Vector Map</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('gis')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded transition-colors cursor-pointer ${
                        viewMode === 'gis'
                          ? 'bg-[#0F766E] text-white shadow-xs'
                          : 'text-[#475569] hover:text-[#0B1F33]'
                      }`}
                      aria-pressed={viewMode === 'gis'}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>WebGIS Atlas</span>
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

              {/* RIGHT COLUMN: State Summary, District Pulse & Wanted Notices (3.2 cols) */}
              <div
                className={`lg:col-span-3 xl:col-span-3 space-y-4 ${
                  mobileSectionTab === 'wanted' || mobileSectionTab === 'pulse' || mobileSectionTab === 'map'
                    ? 'block'
                    : 'hidden lg:block'
                }`}
              >
                {/* Selected State & District Summary Card */}
                <div className={mobileSectionTab === 'pulse' ? 'hidden lg:block' : 'block'}>
                  <StateSummaryCard
                    selectedState={selectedState}
                    selectedDistrict={selectedDistrict}
                    onResetToIndia={() => handleSelectState(null)}
                    onResetDistrict={() => handleSelectDistrict(null)}
                    onOpenDetailedStats={() => setIsSourcesModalOpen(true)}
                  />
                </div>

                {/* District Pulse Section: Scrollable list of recent geolocated public safety alerts */}
                <div className={mobileSectionTab === 'wanted' ? 'hidden lg:block' : 'block'}>
                  <DistrictPulsePanel
                    selectedDistrict={selectedDistrict}
                    selectedState={selectedState}
                    onSelectDistrict={handleSelectDistrict}
                  />
                </div>

                {/* Police & Agency Wanted Notices */}
                <div className={mobileSectionTab === 'pulse' ? 'hidden lg:block' : 'block'}>
                  <WantedNoticesPanel
                    notices={INITIAL_NOTICES}
                    selectedState={selectedState}
                    onSelectNotice={handleOpenNotice}
                    onViewAllWanted={() => {
                      handleSelectState(null);
                    }}
                  />
                </div>
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
        onClose={() => setIsCorrectionsModalOpen(false)}
        prefilledRef={correctionPrefillRef}
      />

      {/* Trusted Circle Timed Safety Check-In Modal */}
      <TrustedCircleModal
        isOpen={isTrustedCircleModalOpen}
        initialViewState={trustedCircleInitialState}
        onClose={() => {
          setIsTrustedCircleModalOpen(false);
          setTrustedCircleInitialState('setup');
        }}
        currentLocality={
          selectedDistrict
            ? `${selectedDistrict}, ${selectedState}`
            : (selectedState ? `${selectedState}, India` : 'Rasulgarh Square, Bhubaneswar')
        }
        onTrigger112={() => {
          window.location.href = 'tel:112';
        }}
      />

      {/* Floating Pitch Presentation Utility Dock */}
      <DemoPresentationBar
        currentState={selectedState || ''}
        isAdminActive={activeTab === 'police_triage'}
        onSelectState={(stateName: string) => {
          setActiveTab('atlas');
          handleSelectState(stateName);
        }}
        onToggleAdmin={() => {
          setActiveTab(prev => (prev === 'police_triage' ? 'atlas' : 'police_triage'));
        }}
        onTriggerEmergency={() => {
          setTrustedCircleInitialState('escalated');
          setIsTrustedCircleModalOpen(true);
        }}
        onToggleOffline={(offline: boolean) => {
          setIsOfflineSimulated(offline);
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
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#D5DCE0] py-2 px-4 flex items-center justify-around z-40 shadow-lg text-[11px] font-medium"
        aria-label="Mobile Bottom Navigation"
      >
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
          <Layers className="w-5 h-5" />
          <span>Atlas</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('atlas');
            setMobileSectionTab('notices');
          }}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'atlas' && mobileSectionTab === 'notices'
              ? 'text-[#0F766E] font-bold'
              : 'text-[#475569]'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>Notices</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('atlas');
            setMobileSectionTab('wanted');
          }}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'atlas' && mobileSectionTab === 'wanted'
              ? 'text-[#0F766E] font-bold'
              : 'text-[#475569]'
          }`}
        >
          <Shield className="w-5 h-5" />
          <span>Wanted</span>
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
          <Phone className="w-5 h-5 text-[#D92D20]" />
          <span>Help 112</span>
        </button>
      </nav>
    </div>
  );
}
