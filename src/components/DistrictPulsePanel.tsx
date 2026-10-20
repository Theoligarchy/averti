import React, { useState, useMemo, useEffect } from 'react';
import {
  Radio,
  MapPin,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Compass,
  RefreshCw,
  PlusCircle,
  Phone,
  ChevronDown,
  ChevronUp,
  Share2,
  Check,
  SlidersHorizontal,
  Navigation,
  Car,
  CloudRain,
  ShieldAlert,
  Cpu,
  Info,
  X,
  Sparkles,
  Globe,
  Search,
  ExternalLink,
  Loader2
} from 'lucide-react';
import {
  DistrictPulseAlert,
  PulseCategory,
  PulseSeverity,
  generateDistrictPulseAlerts,
  generateSingleIncomingAlert
} from '../data/districtPulseData';
import { DistrictPulsePanelSkeleton } from './Skeletons';

interface DistrictPulsePanelProps {
  selectedDistrict: string | null;
  selectedState: string | null;
  onSelectDistrict?: (district: string, state?: string | null) => void;
  onLocateOnMap?: (lat: number, lng: number) => void;
  isLoading?: boolean;
}

export const DistrictPulsePanel: React.FC<DistrictPulsePanelProps> = ({
  selectedDistrict,
  selectedState,
  onSelectDistrict,
  isLoading = false
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high'>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const [modalAlert, setModalAlert] = useState<DistrictPulseAlert | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [newAlertNotification, setNewAlertNotification] = useState<string | null>(null);

  // Dynamic alert list with support for user simulation
  const [salt, setSalt] = useState<number>(1);
  const [injectedAlerts, setInjectedAlerts] = useState<DistrictPulseAlert[]>([]);

  // Google Search Grounding state (powered by gemini-3.8-flash)
  const [searchGroundedData, setSearchGroundedData] = useState<{
    text: string;
    queries: string[];
    sources: Array<{ title: string; url: string }>;
    isGrounded: boolean;
    timestamp: string;
  } | null>(null);
  const [isFetchingSearch, setIsFetchingSearch] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const fetchSearchGrounded = async () => {
    setIsFetchingSearch(true);
    setSearchError(null);
    try {
      const res = await fetch('/api/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district: selectedDistrict,
          state: selectedState,
          topic: 'public_safety'
        })
      });
      if (!res.ok) throw new Error('Search grounding request failed');
      const data = await res.json();
      setSearchGroundedData(data);
    } catch (err: any) {
      setSearchError(err?.message || 'Failed to query live Google Search');
    } finally {
      setIsFetchingSearch(false);
    }
  };

  // Reset or regenerate when district changes
  useEffect(() => {
    setInjectedAlerts([]);
    setExpandedAlertId(null);
    if (activeCategory === 'google_search') {
      fetchSearchGrounded();
    } else {
      setSearchGroundedData(null);
    }
  }, [selectedDistrict, selectedState]);

  // Base alerts generated for this district
  const baseAlerts = useMemo(() => {
    if (selectedDistrict) {
      return generateDistrictPulseAlerts(selectedDistrict, selectedState, salt);
    }
    return generateDistrictPulseAlerts('', null, salt);
  }, [selectedDistrict, selectedState, salt]);

  // Combine injected real-time alerts + base alerts
  const allAlerts = useMemo(() => {
    return [...injectedAlerts, ...baseAlerts];
  }, [injectedAlerts, baseAlerts]);

  // Filter alerts by category, severity, and search term
  const filteredAlerts = useMemo(() => {
    return allAlerts.filter((item) => {
      // Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      // Severity filter
      if (severityFilter === 'high' && item.severity !== 'critical' && item.severity !== 'warning') {
        return false;
      }
      // Search term
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const match =
          item.headline.toLowerCase().includes(q) ||
          item.landmark.toLowerCase().includes(q) ||
          item.locality.toLowerCase().includes(q) ||
          item.sourceAgency.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [allAlerts, activeCategory, severityFilter, searchFilter]);

  // Quick refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSalt((prev) => prev + 1);
      setIsRefreshing(false);
    }, 400);
  };

  // Simulate incoming live alert
  const handleSimulateAlert = () => {
    const targetDistrict = selectedDistrict || 'Pune';
    const newAlert = generateSingleIncomingAlert(targetDistrict, selectedState);
    setInjectedAlerts((prev) => [newAlert, ...prev]);
    setNewAlertNotification(`New live alert broadcast: ${newAlert.locality}`);
    setTimeout(() => {
      setNewAlertNotification(null);
    }, 4000);
  };

  // Copy alert text to clipboard
  const handleCopyAlert = (alert: DistrictPulseAlert, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `[Averti District Pulse] ${alert.severity.toUpperCase()} ALERT: ${alert.headline}\nLocation: ${alert.landmark} (${alert.distanceFromHqKm} km ${alert.direction})\n${alert.summary}\nIssued by: ${alert.sourceAgency}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(alert.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Severity styling helper
  const getSeverityStyle = (severity: PulseSeverity) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-50 text-red-700 border-red-200',
          badge: 'bg-red-600 text-white',
          dot: 'bg-red-500',
          border: 'border-l-red-500'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          badge: 'bg-amber-600 text-white',
          dot: 'bg-amber-500',
          border: 'border-l-amber-500'
        };
      case 'advisory':
        return {
          bg: 'bg-teal-50 text-teal-800 border-teal-200',
          badge: 'bg-[#0F766E] text-white',
          dot: 'bg-[#0F766E]',
          border: 'border-l-[#0F766E]'
        };
      case 'info':
      default:
        return {
          bg: 'bg-sky-50 text-sky-800 border-sky-200',
          badge: 'bg-sky-600 text-white',
          dot: 'bg-sky-500',
          border: 'border-l-sky-500'
        };
    }
  };

  // Category Icon helper
  const getCategoryIcon = (category: PulseCategory) => {
    switch (category) {
      case 'traffic':
        return <Car className="w-3.5 h-3.5 text-amber-600" />;
      case 'law_order':
        return <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />;
      case 'civic_weather':
        return <CloudRain className="w-3.5 h-3.5 text-sky-600" />;
      case 'cyber_fraud':
        return <Cpu className="w-3.5 h-3.5 text-purple-600" />;
      case 'emergency':
        return <AlertTriangle className="w-3.5 h-3.5 text-red-600" />;
      default:
        return <Info className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getCategoryLabel = (category: PulseCategory) => {
    switch (category) {
      case 'traffic':
        return 'Traffic';
      case 'law_order':
        return 'Law & Order';
      case 'civic_weather':
        return 'Civic & Weather';
      case 'cyber_fraud':
        return 'Cyber Alert';
      case 'emergency':
        return 'Emergency Drill';
    }
  };

  // Popular quick-jump districts
  const QUICK_DISTRICTS = [
    { name: 'Pune', state: 'Maharashtra' },
    { name: 'Bengaluru Urban', state: 'Karnataka' },
    { name: 'Gurugram', state: 'Haryana' },
    { name: 'Varanasi', state: 'Uttar Pradesh' }
  ];

  if (isLoading) {
    return <DistrictPulsePanelSkeleton />;
  }

  return (
    <div className="flex flex-col bg-white rounded-lg border border-[#D5DCE0] shadow-xs overflow-hidden">
      {/* Header section with live indicator */}
      <div className="p-3.5 sm:p-4 border-b border-[#D5DCE0] bg-gradient-to-r from-white via-[#F6F8F7] to-white">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-md bg-[#0F766E]/10 border border-[#0F766E]/20 text-[#0F766E]">
              <Radio className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm sm:text-base font-bold font-serif text-[#0B1F33] leading-tight">
                  District Pulse
                </h2>
                <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-[#0F766E] shrink-0" />
                <span className="font-semibold text-[#0B1F33] truncate max-w-[190px]">
                  {selectedDistrict ? `${selectedDistrict}` : 'All-India Safety Stream'}
                </span>
                {selectedState && (
                  <span className="text-[#64748B] truncate max-w-[100px]">({selectedState})</span>
                )}
              </p>
            </div>
          </div>

          {/* Action buttons: Simulate + Refresh */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleSimulateAlert}
              title="Simulate incoming live public safety broadcast"
              className="p-1.5 text-xs text-[#0F766E] hover:bg-[#0F766E]/10 rounded border border-[#0F766E]/30 flex items-center gap-1 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px] font-medium">Broadcast</span>
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              title="Refresh District Pulse alerts"
              className={`p-1.5 text-xs text-[#64748B] hover:text-[#0B1F33] hover:bg-slate-100 rounded border border-[#D5DCE0] transition-transform ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live notification flash banner if an alert was added */}
        {newAlertNotification && (
          <div className="mt-2.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              {newAlertNotification}
            </span>
            <button
              onClick={() => setNewAlertNotification(null)}
              className="text-emerald-700 hover:text-emerald-900"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Filter bar: Category pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5 pb-0.5">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-2 py-1 text-[11px] font-medium rounded transition-colors shrink-0 ${
              activeCategory === 'all'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'bg-slate-100 text-[#475569] hover:bg-slate-200'
            }`}
          >
            All Alerts ({allAlerts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('traffic')}
            className={`px-2 py-1 text-[11px] font-medium rounded transition-colors shrink-0 flex items-center gap-1 ${
              activeCategory === 'traffic'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/60'
            }`}
          >
            <Car className="w-3 h-3" />
            Traffic
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('law_order')}
            className={`px-2 py-1 text-[11px] font-medium rounded transition-colors shrink-0 flex items-center gap-1 ${
              activeCategory === 'law_order'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200/60'
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            Patrol
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('civic_weather')}
            className={`px-2 py-1 text-[11px] font-medium rounded transition-colors shrink-0 flex items-center gap-1 ${
              activeCategory === 'civic_weather'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'bg-sky-50 text-sky-900 hover:bg-sky-100 border border-sky-200/60'
            }`}
          >
            <CloudRain className="w-3 h-3" />
            Civic
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('cyber_fraud')}
            className={`px-2 py-1 text-[11px] font-medium rounded transition-colors shrink-0 flex items-center gap-1 ${
              activeCategory === 'cyber_fraud'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200/60'
            }`}
          >
            <Cpu className="w-3 h-3" />
            Cyber
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('google_search');
              if (!searchGroundedData) {
                fetchSearchGrounded();
              }
            }}
            className={`px-2 py-1 text-[11px] font-semibold rounded transition-colors shrink-0 flex items-center gap-1.5 ${
              activeCategory === 'google_search'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-300'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Search Intel</span>
          </button>
        </div>
      </div>

      {/* Quick shortcuts if viewing all-India or wanting to jump to popular districts */}
      {!selectedDistrict && onSelectDistrict && (
        <div className="px-3.5 py-2 bg-[#FFFBEB] border-b border-[#FDE68A] text-xs text-[#92400E]">
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <span className="font-semibold text-[11px]">Select a district for hyper-local radar:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {QUICK_DISTRICTS.map((qd) => (
                <button
                  key={qd.name}
                  type="button"
                  onClick={() => onSelectDistrict(qd.name, qd.state)}
                  className="px-1.5 py-0.5 text-[10px] font-semibold bg-white border border-[#F59E0B]/50 rounded hover:bg-[#FEF3C7] text-[#78350F] transition-colors"
                >
                  {qd.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alerts Scrollable Container */}
      <div className="p-3 space-y-2.5 max-h-[440px] overflow-y-auto">
        {activeCategory === 'google_search' ? (
          <div className="space-y-3">
            {/* Grounding Header Box */}
            <div className="p-3 bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 border border-teal-200 rounded-lg flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Google Search Grounded Advisories</span>
                </div>
                <p className="text-[11px] text-teal-700 truncate mt-0.5">
                  Live real-world verification for {selectedDistrict || selectedState || 'India'} via gemini-3.8-flash
                </p>
              </div>
              <button
                type="button"
                disabled={isFetchingSearch}
                onClick={fetchSearchGrounded}
                className="px-2 py-1 rounded bg-[#0F766E] hover:bg-[#0D655E] text-white text-[10px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isFetchingSearch ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                <span>{isFetchingSearch ? 'Querying...' : 'Refresh'}</span>
              </button>
            </div>

            {/* Results or Loading */}
            {isFetchingSearch ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-center text-slate-400 bg-[#F8FAFC] rounded-lg border border-slate-200">
                <Loader2 className="w-6 h-6 animate-spin text-[#0F766E]" />
                <span className="text-xs font-medium text-slate-600">Retrieving official search-grounded directives...</span>
                <span className="text-[11px] text-slate-400">Querying Google Search Grounding with gemini-3.8-flash</span>
              </div>
            ) : searchError ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs space-y-1">
                <div className="font-bold">Search Grounding Error</div>
                <div className="text-[11px]">{searchError}</div>
                <button
                  type="button"
                  onClick={fetchSearchGrounded}
                  className="underline text-[11px] font-semibold text-rose-900 cursor-pointer"
                >
                  Retry Search
                </button>
              </div>
            ) : searchGroundedData ? (
              <div className="space-y-3">
                {/* Text summary box */}
                <div className="p-3 bg-white border border-[#D5DCE0] rounded-lg text-xs leading-relaxed text-[#1E293B] shadow-2xs whitespace-pre-line">
                  {searchGroundedData.text}
                </div>

                {/* Search queries list */}
                {searchGroundedData.queries && searchGroundedData.queries.length > 0 && (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                      <Search className="w-3 h-3" />
                      <span>Google Search Queries</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {searchGroundedData.queries.map((q, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono"
                        >
                          "{q}"
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Official Web Citations */}
                {searchGroundedData.sources && searchGroundedData.sources.length > 0 && (
                  <div className="p-2.5 bg-white border border-[#D5DCE0] rounded-lg space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                      <Globe className="w-3 h-3 text-blue-600" />
                      <span>Verified Citations &amp; Portals</span>
                    </div>
                    <div className="space-y-1">
                      {searchGroundedData.sources.map((src, idx) => (
                        <a
                          key={idx}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 border border-slate-100 text-[11px] text-blue-700 font-medium transition-colors"
                        >
                          <span className="truncate pr-2">{src.title}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 text-slate-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="py-8 text-center px-4 bg-[#F6F8F7] rounded-lg border border-dashed border-[#D5DCE0]">
            <Radio className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
            <p className="text-xs font-semibold text-[#475569]">No alerts matching active filters</p>
            <p className="text-[11px] text-[#64748B] mt-1">
              Try switching back to 'All Alerts' or click 'Broadcast' to simulate an alert.
            </p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchFilter('');
                setSeverityFilter('all');
              }}
              className="mt-2.5 text-xs text-[#0F766E] font-medium underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isExpanded = expandedAlertId === alert.id;
            const style = getSeverityStyle(alert.severity);

            return (
              <div
                key={alert.id}
                onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                className={`group bg-white rounded-lg border border-[#D5DCE0] hover:border-[#0F766E] p-3 transition-all cursor-pointer relative hover:shadow-xs border-l-[3px] ${style.border}`}
              >
                {/* Top Badge & Time row */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Severity chip */}
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${style.badge}`}
                    >
                      {alert.severity}
                    </span>
                    {/* Category tag */}
                    <span className="text-[10px] font-semibold text-[#475569] bg-slate-100 border border-slate-200/80 px-1.5 py-0.5 rounded flex items-center gap-1">
                      {getCategoryIcon(alert.category)}
                      {getCategoryLabel(alert.category)}
                    </span>
                  </div>

                  {/* Relative timestamp */}
                  <span className="text-[10px] text-[#64748B] flex items-center gap-1 shrink-0 font-medium">
                    <Clock className="w-3 h-3 text-[#94A3B8]" />
                    {alert.timeAgo}
                  </span>
                </div>

                {/* Headline */}
                <h3 className="text-xs sm:text-[13px] font-bold text-[#0B1F33] leading-snug group-hover:text-[#0F766E] transition-colors">
                  {alert.headline}
                </h3>

                {/* Geolocated Landmark & Distance */}
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#475569] flex-wrap">
                  <span className="inline-flex items-center gap-1 font-medium text-[#0F766E] bg-[#0F766E]/8 px-1.5 py-0.5 rounded">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate max-w-[210px]">{alert.landmark}</span>
                  </span>

                  <span className="text-[10px] text-[#64748B] flex items-center gap-0.5">
                    <Compass className="w-2.5 h-2.5 text-[#94A3B8]" />
                    {alert.distanceFromHqKm} km {alert.direction}
                  </span>
                </div>

                {/* Summary */}
                <p className="text-[11px] text-[#475569] mt-1.5 leading-relaxed">
                  {alert.summary}
                </p>

                {/* Action Required Banner if critical/warning */}
                {alert.actionRequired && (
                  <div className="mt-2 p-1.5 bg-[#FFFBEB] border border-[#FDE68A] rounded text-[10px] text-[#92400E] flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="w-3 h-3 text-[#D97706] shrink-0" />
                    <span>{alert.actionRequired}</span>
                  </div>
                )}

                {/* Expandable details when clicked */}
                {isExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-200 space-y-2 text-[11px] animate-fadeIn">
                    <p className="text-[#334155] leading-relaxed bg-[#F8FAFC] p-2 rounded border border-slate-200">
                      {alert.fullDetails}
                    </p>

                    {/* Coordinates & Technical Geolocation chip */}
                    <div className="flex items-center justify-between text-[10px] text-[#64748B] bg-slate-100 px-2 py-1 rounded">
                      <span className="font-mono">
                        GPS: {alert.coordinates.lat}° N, {alert.coordinates.lng}° E
                      </span>
                      {alert.contactHelpline && (
                        <span className="font-semibold text-[#0B1F33] flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5 text-[#0F766E]" />
                          Helpline: {alert.contactHelpline}
                        </span>
                      )}
                    </div>

                    {/* Bottom Action buttons */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalAlert(alert);
                        }}
                        className="text-[11px] font-semibold text-[#0F766E] hover:underline flex items-center gap-1"
                      >
                        <Info className="w-3 h-3" />
                        Full Official Bulletin
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleCopyAlert(alert, e)}
                          className="px-2 py-1 text-[10px] font-medium bg-white hover:bg-slate-50 border border-slate-200 rounded text-[#475569] flex items-center gap-1"
                        >
                          {copiedId === alert.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3 h-3" />
                              Share
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Attribution footer */}
                <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-[#64748B]">
                  <span className="flex items-center gap-1 truncate max-w-[210px]">
                    <ShieldCheck className="w-3 h-3 text-[#0F766E] shrink-0" />
                    <span className="truncate">{alert.sourceAgency}</span>
                  </span>
                  <span className="text-[#0F766E] font-medium flex items-center gap-0.5 shrink-0">
                    {isExpanded ? (
                      <>
                        Less <ChevronUp className="w-3 h-3" />
                      </>
                    ) : (
                      <>
                        More <ChevronDown className="w-3 h-3" />
                      </>
                    )}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer bar with disclaimer and count */}
      <div className="p-2.5 bg-[#F6F8F7] border-t border-[#D5DCE0] flex items-center justify-between text-[10px] text-[#64748B]">
        <span>
          Showing {filteredAlerts.length} verified {selectedDistrict ? `${selectedDistrict}` : 'national'} public safety alerts
        </span>
        <span className="font-semibold text-[#0F766E]">ERSS 112 Synced</span>
      </div>

      {/* Full Bulletin Modal */}
      {modalAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl border border-slate-300 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl p-5 space-y-4">
            {/* Modal header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      getSeverityStyle(modalAlert.severity).badge
                    }`}
                  >
                    {modalAlert.severity}
                  </span>
                  <span className="text-xs font-semibold text-[#475569]">
                    {modalAlert.sourceBadge}
                  </span>
                </div>
                <h3 className="text-base font-bold font-serif text-[#0B1F33]">
                  {modalAlert.headline}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalAlert(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Geolocation & Source Card */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">District & State:</span>
                <span className="font-semibold text-[#0B1F33]">
                  {modalAlert.district}, {modalAlert.state}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Landmark / Area:</span>
                <span className="font-semibold text-[#0F766E]">{modalAlert.landmark}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Distance from HQ:</span>
                <span className="font-medium text-[#0B1F33]">
                  {modalAlert.distanceFromHqKm} km ({modalAlert.direction})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">GPS Centroid:</span>
                <span className="font-mono text-[#0B1F33]">
                  {modalAlert.coordinates.lat}° N, {modalAlert.coordinates.lng}° E
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Issuing Agency:</span>
                <span className="font-semibold text-[#0B1F33]">{modalAlert.sourceAgency}</span>
              </div>
            </div>

            {/* Incident full details */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-[#0B1F33] uppercase tracking-wider">
                Full Public Safety Bulletin
              </h4>
              <p className="text-xs text-[#334155] leading-relaxed bg-[#F1F5F9]/50 p-3 rounded-lg border border-slate-200">
                {modalAlert.fullDetails}
              </p>
            </div>

            {/* Action Required advisory */}
            {modalAlert.actionRequired && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
                <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  Citizen Action Advisory
                </span>
                <p className="text-xs text-amber-950 font-medium">
                  {modalAlert.actionRequired}
                </p>
              </div>
            )}

            {/* Helpline and close buttons */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-200">
              {modalAlert.contactHelpline ? (
                <a
                  href={`tel:${modalAlert.contactHelpline.split('/')[0].trim()}`}
                  className="px-3 py-2 bg-[#0F766E] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-[#0D655E] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Helpline ({modalAlert.contactHelpline})
                </a>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={() => setModalAlert(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
              >
                Close Bulletin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
