import React, { useState, useMemo } from 'react';
import {
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Layers,
  Search,
  Filter,
  Download,
  Building2,
  ExternalLink,
  ChevronRight,
  Eye,
  PhoneCall,
  MapPin,
  Calendar,
  Lock,
  RefreshCw,
  Info,
  Check,
  Share2
} from 'lucide-react';

/**
 * Initial realistic mock tips
 */
const INITIAL_TIPS = [
  {
    id: '#AV-2026-8942',
    noticeRef: 'OD-MP-2026-0842',
    noticeTitle: 'Missing Adult (Male) - Dilip Kumar',
    category: 'missing',
    dateTime: '12 Oct 2026, 13:45 IST',
    locality: 'Rasulgarh Square, Bhubaneswar, Odisha',
    description: 'Individual matching description spotted near the overbridge tea stall asking for directions to Cuttack.',
    clothingOrVehicle: 'Wearing faded blue cotton shirt, grey trousers, carrying brown shoulder bag.',
    verifiedPhone: '+91 98******12',
    safeguardConfirmed: true,
    status: 'pending',
    duplicateTipIds: ['#AV-2026-8945']
  },
  {
    id: '#AV-2026-8945',
    noticeRef: 'OD-MP-2026-0842',
    noticeTitle: 'Missing Adult (Male) - Dilip Kumar',
    category: 'missing',
    dateTime: '12 Oct 2026, 14:15 IST',
    locality: 'NH-16 Flyover Underpass, Rasulgarh, Bhubaneswar',
    description: 'Saw elderly person matching photo sitting on concrete bench near bus stand. Looked disoriented.',
    clothingOrVehicle: 'Blue collared shirt, dark slippers, small satchel.',
    verifiedPhone: '+91 94******44',
    safeguardConfirmed: true,
    status: 'pending',
    duplicateGroupMasterId: null
  },
  {
    id: '#AV-2026-8910',
    noticeRef: 'CBI-WNT-2026-0089',
    noticeTitle: 'Wanted Notice - Sandeep V. (Organized Financial Fraud)',
    category: 'wanted',
    dateTime: '11 Oct 2026, 19:20 IST',
    locality: 'Janpath Commercial Complex, Saheed Nagar, Bhubaneswar',
    description: 'Suspect spotted leaving a co-working space entrance and getting into a silver sedan.',
    clothingOrVehicle: 'Black blazer, dark sunglasses, silver hatchback (OD-02-X-****).',
    verifiedPhone: '+91 70******89',
    safeguardConfirmed: true,
    status: 'pending'
  },
  {
    id: '#AV-2026-8890',
    noticeRef: 'DL-MP-2026-1102',
    noticeTitle: 'Missing Teenager (Female) - Ananya S.',
    category: 'missing',
    dateTime: '10 Oct 2026, 11:05 IST',
    locality: 'Inter-State Bus Terminal (ISBT) Baramunda, Bhubaneswar',
    description: 'Station ticket counter attendant noticed person asking for Kolkata route schedules.',
    clothingOrVehicle: 'Yellow kurti with white dupatta, purple backpack.',
    verifiedPhone: '+91 91******30',
    safeguardConfirmed: true,
    status: 'forwarded',
    forwardedToOfficer: 'Insp. R. K. Mohapatra (Khandagiri PS)'
  },
  {
    id: '#AV-2026-8854',
    noticeRef: 'OD-WNT-2026-0104',
    noticeTitle: 'Wanted Notice - Prakash Nayak (Excise / Smuggling)',
    category: 'wanted',
    dateTime: '09 Oct 2026, 21:50 IST',
    locality: 'Palasuni Checkpoint, Bhubaneswar',
    description: 'Vehicle spotted bypassing main highway toll booth via canal road.',
    clothingOrVehicle: 'White SUV bearing tinted windows.',
    verifiedPhone: '+91 99******76',
    safeguardConfirmed: true,
    status: 'resolved',
    forwardedToOfficer: 'SI M. Jena (Mancheswar PS)',
    resolutionNote: 'Intercepted and detained by patrol vehicle PCR-04. Case diary updated.'
  },
  {
    id: '#AV-2026-8820',
    noticeRef: 'OD-MP-2026-0842',
    noticeTitle: 'Missing Adult (Male) - Dilip Kumar',
    category: 'missing',
    dateTime: '08 Oct 2026, 16:10 IST',
    locality: 'Master Canteen Square, Bhubaneswar',
    description: 'Passerby noticed person resting outside station concourse.',
    clothingOrVehicle: 'Blue shirt, dark grey pants.',
    verifiedPhone: '+91 82******55',
    safeguardConfirmed: true,
    status: 'resolved',
    forwardedToOfficer: 'SI D. Sahoo (Capital PS)',
    resolutionNote: 'Family contacted. Citizen tip verified genuine.'
  }
];

export function PoliceAdminDashboard() {
  const [tips, setTips] = useState(INITIAL_TIPS);
  const [statusFilter, setStatusFilter] = useState('all');
  const [noticeFilter, setNoticeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTipIds, setSelectedTipIds] = useState(new Set());
  const [activeDistrict, setActiveDistrict] = useState('Bhubaneswar Urban Police Commissionerate');
  const [showCctnsModal, setShowCctnsModal] = useState(false);
  const [cctnsExportPayload, setCctnsExportPayload] = useState(null);
  const [notificationBanner, setNotificationBanner] = useState(null);

  // Distinct notices for the dropdown
  const uniqueNotices = useMemo(() => {
    const map = new Map();
    tips.forEach(t => map.set(t.noticeRef, `${t.noticeRef} - ${t.noticeTitle}`));
    return Array.from(map.entries());
  }, [tips]);

  // Derived filtered tips
  const filteredTips = useMemo(() => {
    return tips.filter(tip => {
      // Status filter
      if (statusFilter !== 'all' && tip.status !== statusFilter) {
        return false;
      }
      // Notice filter
      if (noticeFilter !== 'all' && tip.noticeRef !== noticeFilter) {
        return false;
      }
      // Search query filter (search in ID, locality, description, officer)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          tip.id.toLowerCase().includes(q) ||
          tip.noticeRef.toLowerCase().includes(q) ||
          tip.locality.toLowerCase().includes(q) ||
          tip.description.toLowerCase().includes(q) ||
          (tip.forwardedToOfficer && tip.forwardedToOfficer.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [tips, statusFilter, noticeFilter, searchQuery]);

  // Executive summary metrics
  const totalTips = tips.length;
  const pendingCount = tips.filter(t => t.status === 'pending').length;
  const mergedCount = tips.filter(t => t.duplicateGroupMasterId != null || (t.duplicateTipIds && t.duplicateTipIds.length > 0)).length;
  const resolvedCount = tips.filter(t => t.status === 'resolved').length;

  // Helper notification toaster
  const showNotification = (msg) => {
    setNotificationBanner(msg);
    setTimeout(() => {
      setNotificationBanner(null);
    }, 4500);
  };

  // Status transition handlers
  const updateStatus = (tipId, nextStatus, note) => {
    setTips(prev =>
      prev.map(t => {
        if (t.id === tipId) {
          return {
            ...t,
            status: nextStatus,
            forwardedToOfficer:
              nextStatus === 'forwarded'
                ? t.forwardedToOfficer || 'Duty Officer (Control Room Desk-B)'
                : t.forwardedToOfficer,
            resolutionNote: note || t.resolutionNote
          };
        }
        return t;
      })
    );
    showNotification(`Receipt ${tipId} updated to status "${nextStatus.toUpperCase()}". Citizen receipt updated in real time.`);
  };

  // One-click duplicate merging handler
  const handleMergeDuplicates = (masterId, duplicateId) => {
    setTips(prev => {
      const masterTip = prev.find(t => t.id === masterId);
      const duplicateTip = prev.find(t => t.id === duplicateId);
      if (!masterTip || !duplicateTip) return prev;

      return prev.map(t => {
        if (t.id === masterId) {
          const currentDuplicates = t.duplicateTipIds || [];
          return {
            ...t,
            description: `${t.description} \n\n[Auto-Merged Consolidated Sighting from ${duplicateId}]: ${duplicateTip.description}`,
            duplicateTipIds: Array.from(new Set([...currentDuplicates, duplicateId]))
          };
        }
        if (t.id === duplicateId) {
          return {
            ...t,
            duplicateGroupMasterId: masterId,
            status: 'resolved',
            resolutionNote: `Merged into Master Sighting Tip ${masterId}. Consolidated for Station Investigating Officer.`
          };
        }
        return t;
      });
    });
    showNotification(`Duplicate tips ${masterId} and ${duplicateId} merged into consolidated master report.`);
  };

  // Batch toggle
  const toggleSelectTip = (id) => {
    setSelectedTipIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    if (selectedTipIds.size === filteredTips.length) {
      setSelectedTipIds(new Set());
    } else {
      setSelectedTipIds(new Set(filteredTips.map(t => t.id)));
    }
  };

  // Bulk status change
  const handleBulkForward = () => {
    if (selectedTipIds.size === 0) return;
    setTips(prev =>
      prev.map(t => {
        if (selectedTipIds.has(t.id)) {
          return {
            ...t,
            status: 'forwarded',
            forwardedToOfficer: t.forwardedToOfficer || 'Station Officer (Zonal Triage)'
          };
        }
        return t;
      })
    );
    showNotification(`${selectedTipIds.size} tips forwarded to jurisdictional station officers.`);
    setSelectedTipIds(new Set());
  };

  // CCTNS Export Simulation
  const handleExportCctns = (singleTip) => {
    const exportItems = singleTip
      ? [singleTip]
      : selectedTipIds.size > 0
      ? tips.filter(t => selectedTipIds.has(t.id))
      : filteredTips;

    const payload = {
      exportTimestamp: new Date().toISOString(),
      cctnsJurisdictionCode: 'OD-BBSR-URBAN-COMM',
      jurisdiction: activeDistrict,
      exportBatchId: `CCTNS-EXP-${Date.now().toString(36).toUpperCase()}`,
      standardsCompliance: 'NCRB CCTNS Core Application Software v5.2 / BPRD Public-Tip Interoperability Protocol',
      recordCount: exportItems.length,
      records: exportItems.map(item => ({
        cctnsTipReceiptNumber: item.id,
        relatedNoticeReference: item.noticeRef,
        noticeTitle: item.noticeTitle,
        category: item.category,
        sightingTimestamp: item.dateTime,
        sightingLocality: item.locality,
        citizenVerifiedOtpHash: 'SHA256:8f4c2e...' + item.verifiedPhone.slice(-4),
        safeguardConsentLogged: item.safeguardConfirmed,
        currentTriageStatus: item.status,
        forwardedOfficerJurisdiction: item.forwardedToOfficer || 'Control Room Desk-B',
        observationNarrative: item.description,
        physicalOrVehicleFeatures: item.clothingOrVehicle,
        mergedGroupReferences: item.duplicateTipIds || []
      }))
    };

    setCctnsExportPayload(payload);
    setShowCctnsModal(true);
  };

  return (
    <div className="w-full bg-[#F6F8F7] text-[#0B1F33] py-2 font-sans space-y-6">
      {/* Official Authorized B2G Banner */}
      <div className="bg-[#0B1F33] text-white px-4 py-2.5 rounded-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-l-4 border-[#0F766E]">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-[#0F766E] shrink-0" />
          <div>
            <div className="text-xs sm:text-sm font-bold tracking-wide uppercase font-sans flex items-center gap-2">
              <span>AUTHORISED DEMO VIEW</span>
              <span className="text-[#94A3B8] font-normal">|</span>
              <span className="text-[#94A3B8] font-normal lowercase sm:capitalize">
                District Police Triage &amp; CCTNS Integration Dashboard
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-tight">
              Simulated B2G environment for state police commissionerates, reducing citizen notice noise &amp; duplicate sightings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#0F766E]/20 text-[#2DD4BF] border border-[#0F766E]">
            CCTNS API v5.2 Ready
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F59E0B]/20 text-[#FBBF24] border border-[#B45309]">
            Demo Sandbox
          </span>
        </div>
      </div>

      {/* Real-time Notification Banner */}
      {notificationBanner && (
        <div
          role="status"
          aria-live="polite"
          className="bg-[#E8F0EE] border border-[#0F766E] text-[#0B1F33] px-4 py-3 rounded-lg flex items-center justify-between shadow-xs transition-all animate-in fade-in"
        >
          <div className="flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
            <span>{notificationBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotificationBanner(null)}
            className="text-xs text-[#0F766E] font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Header & District Jurisdiction Context */}
      <div className="bg-white border border-[#D5DCE0] rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#0F766E]" />
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#0B1F33]">
              District Sighting Triage &amp; Case Verification Desk
            </h1>
          </div>
          <p className="text-xs text-[#475569] mt-1">
            Structured citizen sightings submitted via Averti public portal. All submissions phone OTP-verified with no-vigilante safeguards.
          </p>
        </div>

        {/* Active District Jurisdiction Selector */}
        <div className="flex items-center gap-2 bg-[#F6F8F7] border border-[#64748B]/40 rounded-lg p-2 text-xs">
          <MapPin className="w-4 h-4 text-[#0F766E] shrink-0" />
          <span className="font-semibold text-[#475569]">Jurisdiction:</span>
          <select
            value={activeDistrict}
            onChange={e => setActiveDistrict(e.target.value)}
            className="bg-transparent font-bold text-[#0B1F33] focus:outline-none cursor-pointer"
          >
            <option value="Bhubaneswar Urban Police Commissionerate">Bhubaneswar Urban Commissionerate (Odisha)</option>
            <option value="New Delhi District Police (Parliament Street HQ)">New Delhi District Police (Delhi HQ)</option>
            <option value="Bengaluru City Police (Central Division)">Bengaluru City Police (Central Division)</option>
            <option value="Mumbai Police Commissionerate (South Zone)">Mumbai Police Commissionerate (South Zone)</option>
            <option value="Kolkata Police HQ (Lalbazar)">Kolkata Police HQ (Lalbazar)</option>
          </select>
        </div>
      </div>

      {/* A. Executive Summary Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Tips Received */}
        <div className="bg-white border border-[#D5DCE0] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#475569] text-xs font-semibold mb-1">
            <span>Total Tips Received</span>
            <FileText className="w-4 h-4 text-[#0F766E]" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#0B1F33] tabular-nums">
            {totalTips}
          </div>
          <div className="text-[11px] text-[#475569] mt-1">
            Past 7 days across current jurisdiction
          </div>
        </div>

        {/* Card 2: Pending Triage */}
        <div className="bg-white border border-[#D5DCE0] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#475569] text-xs font-semibold mb-1">
            <span>Pending Triage</span>
            <Clock className="w-4 h-4 text-[#B45309]" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#B45309] tabular-nums">
            {pendingCount}
          </div>
          <div className="text-[11px] text-[#B45309] font-medium mt-1">
            Requires desk officer review
          </div>
        </div>

        {/* Card 3: Merged Duplicates */}
        <div className="bg-white border border-[#D5DCE0] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#475569] text-xs font-semibold mb-1">
            <span>Merged Duplicates</span>
            <Layers className="w-4 h-4 text-[#0F766E]" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#0F766E] tabular-nums">
            {mergedCount}
          </div>
          <div className="text-[11px] text-[#0F766E] font-medium mt-1">
            Noise reduced by ~45% via locality grouping
          </div>
        </div>

        {/* Card 4: Actioned & Resolved */}
        <div className="bg-white border border-[#D5DCE0] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#475569] text-xs font-semibold mb-1">
            <span>Actioned &amp; Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#15803D] tabular-nums">
            {resolvedCount}
          </div>
          <div className="text-[11px] text-[#15803D] font-medium mt-1">
            Forwarded to stations or closed
          </div>
        </div>
      </div>

      {/* B. Filter & Search Controls */}
      <div className="bg-white border border-[#D5DCE0] rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Tip ID, case ref, locality, landmark, description or officer..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#F6F8F7] border border-[#64748B]/40 rounded-lg text-[#0B1F33] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
            />
          </div>

          {/* Notice Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#64748B] shrink-0" />
            <select
              value={noticeFilter}
              onChange={e => setNoticeFilter(e.target.value)}
              className="py-2 px-3 text-xs sm:text-sm bg-[#F6F8F7] border border-[#64748B]/40 rounded-lg text-[#0B1F33] font-medium focus:outline-none focus:ring-1 focus:ring-[#0F766E] cursor-pointer"
            >
              <option value="all">All Notice References</option>
              {uniqueNotices.map(([ref, label]) => (
                <option key={ref} value={ref}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Chips + CCTNS Export Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#D5DCE0]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#475569]">Filter Status:</span>
            {[
              { key: 'all', label: 'All' },
              { key: 'pending', label: 'Pending Triage' },
              { key: 'forwarded', label: 'Forwarded' },
              { key: 'resolved', label: 'Resolved' }
            ].map(chip => (
              <button
                key={chip.key}
                type="button"
                onClick={() => setStatusFilter(chip.key)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === chip.key
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'bg-[#F6F8F7] text-[#475569] border border-[#64748B]/40 hover:text-[#0B1F33]'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Action Buttons: Bulk Forward + Export CCTNS */}
          <div className="flex items-center gap-2">
            {selectedTipIds.size > 0 && (
              <button
                type="button"
                onClick={handleBulkForward}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Forward Selected ({selectedTipIds.size})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleExportCctns()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0B1F33] hover:bg-[#1E293B] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>Export Selection to CCTNS Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* C. Main Tip Triage Table & Card List */}
      <div className="space-y-4">
        {/* Table / Batch Header Bar */}
        <div className="flex items-center justify-between text-xs text-[#475569] px-2 font-semibold">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTipIds.size > 0 && selectedTipIds.size === filteredTips.length}
                onChange={selectAllFiltered}
                className="w-4 h-4 rounded text-[#0F766E] focus:ring-[#0F766E] border-gray-300 cursor-pointer"
              />
              <span>Select All Displayed ({filteredTips.length})</span>
            </label>
          </div>
          <span>Showing {filteredTips.length} citizen sighting reports</span>
        </div>

        {/* Tip Cards */}
        {filteredTips.length === 0 ? (
          <div className="bg-white border border-[#D5DCE0] rounded-xl p-8 text-center text-[#475569] space-y-2">
            <Info className="w-8 h-8 text-[#64748B] mx-auto" />
            <h3 className="text-sm font-bold text-[#0B1F33]">No citizen tips match active filters</h3>
            <p className="text-xs">Adjust your search term or status filter chip above.</p>
          </div>
        ) : (
          filteredTips.map(tip => {
            const isSelected = selectedTipIds.has(tip.id);

            // Duplicate pairing detection: check if there is an active candidate
            const hasDuplicateCandidate =
              tip.duplicateTipIds &&
              tip.duplicateTipIds.length > 0 &&
              tips.some(t => tip.duplicateTipIds.includes(t.id) && t.duplicateGroupMasterId == null);

            return (
              <div
                key={tip.id}
                className={`bg-white border rounded-xl p-5 shadow-xs transition-all ${
                  isSelected ? 'border-[#0F766E] ring-1 ring-[#0F766E]' : 'border-[#D5DCE0] hover:border-[#64748B]'
                }`}
              >
                {/* Duplicate Merging Banner if detected */}
                {hasDuplicateCandidate && tip.status === 'pending' && (
                  <div className="mb-4 bg-[#FFFBEB] border border-[#F59E0B] rounded-lg p-3 text-xs text-[#92400E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0" />
                      <div>
                        <span className="font-bold">Duplicate Sighting Detected:</span> High geographic &amp; timing correlation with{' '}
                        {tip.duplicateTipIds.join(', ')} in Rasulgarh NH-16 corridor.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const targetId = tip.duplicateTipIds[0];
                        if (targetId) handleMergeDuplicates(tip.id, targetId);
                      }}
                      className="inline-flex items-center gap-1 bg-[#B45309] hover:bg-[#92400E] text-white px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Merge with Master Tip</span>
                    </button>
                  </div>
                )}

                {/* Card Top Row: Checkbox, Receipt ID, Notice Target, Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D5DCE0]/70">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectTip(tip.id)}
                      className="w-4 h-4 rounded text-[#0F766E] focus:ring-[#0F766E] border-gray-300 cursor-pointer"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-serif font-bold text-[#0B1F33] tabular-nums">
                          {tip.id}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[#E8F0EE] text-[#0F766E] border border-[#0F766E]/40">
                          {tip.noticeRef}
                        </span>
                        {tip.duplicateGroupMasterId && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-[#F1F5F9] text-[#475569]">
                            Merged into {tip.duplicateGroupMasterId}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#475569] font-medium mt-0.5">
                        {tip.noticeTitle}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {tip.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-[#FEF3C7] text-[#B45309] border border-[#B45309]/30">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending Triage</span>
                      </span>
                    )}
                    {tip.status === 'forwarded' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-[#E8F0EE] text-[#0F766E] border border-[#0F766E]/40">
                        <Send className="w-3.5 h-3.5" />
                        <span>Forwarded to Station</span>
                      </span>
                    )}
                    {tip.status === 'resolved' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-[#DCFCE7] text-[#15803D] border border-[#15803D]/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolved / Actioned</span>
                      </span>
                    )}
                    {tip.status === 'dismissed' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-[#F1F5F9] text-[#64748B] border border-[#64748B]/30">
                        Dismissed
                      </span>
                    )}
                  </div>
                </div>

                {/* Sighting Details Narrative */}
                <div className="py-3 space-y-2 text-xs sm:text-sm text-[#0B1F33]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[#475569] bg-[#F6F8F7] p-2.5 rounded-lg border border-[#D5DCE0]/60">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                      <span className="font-semibold text-[#0B1F33]">Sighting Timestamp:</span>
                      <span className="tabular-nums">{tip.dateTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                      <span className="font-semibold text-[#0B1F33]">Locality:</span>
                      <span className="truncate">{tip.locality}</span>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-xs text-[#475569] block mb-0.5">Sighting Narrative:</span>
                    <p className="text-xs sm:text-sm text-[#0B1F33] leading-relaxed whitespace-pre-line bg-white">
                      {tip.description}
                    </p>
                  </div>

                  {tip.clothingOrVehicle && (
                    <div className="text-xs bg-[#F8FAFC] border-l-2 border-[#0F766E] pl-2.5 py-1">
                      <span className="font-bold text-[#475569]">Clothing &amp; Vehicle Features: </span>
                      <span className="text-[#0B1F33]">{tip.clothingOrVehicle}</span>
                    </div>
                  )}

                  {tip.forwardedToOfficer && (
                    <div className="text-xs text-[#0F766E] bg-[#E8F0EE] p-2 rounded-md font-medium">
                      Assigned Station Officer: <span className="font-bold">{tip.forwardedToOfficer}</span>
                    </div>
                  )}

                  {tip.resolutionNote && (
                    <div className="text-xs text-[#15803D] bg-[#DCFCE7]/60 p-2 rounded-md font-medium">
                      Action Summary: {tip.resolutionNote}
                    </div>
                  )}
                </div>

                {/* Badges: Verification + Safeguard confirmation */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#D5DCE0]/60 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#F1F5F9] text-[#0F766E] font-medium border border-[#D5DCE0]">
                      <PhoneCall className="w-3 h-3 text-[#0F766E]" />
                      <span>Phone OTP Verified ({tip.verifiedPhone})</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#F1F5F9] text-[#15803D] font-medium border border-[#D5DCE0]">
                      <Check className="w-3 h-3 text-[#15803D]" />
                      <span>[&#10003;] Confirmed: Did not approach suspect</span>
                    </span>
                  </div>

                  {/* Interactive Status Transition Action Bar */}
                  <div className="flex items-center gap-1.5">
                    {tip.status !== 'pending' && (
                      <button
                        type="button"
                        onClick={() => updateStatus(tip.id, 'pending')}
                        className="px-2 py-1 text-[11px] font-semibold text-[#475569] hover:text-[#0B1F33] border border-[#64748B]/40 rounded hover:bg-[#F6F8F7] cursor-pointer"
                        title="Reset to Pending"
                      >
                        Mark Received
                      </button>
                    )}

                    {tip.status !== 'forwarded' && (
                      <button
                        type="button"
                        onClick={() =>
                          updateStatus(tip.id, 'forwarded', 'Dispatched to jurisdictional police station patrol unit.')
                        }
                        className="px-2.5 py-1 text-[11px] font-bold text-[#0F766E] hover:bg-[#0F766E] hover:text-white border border-[#0F766E] rounded transition-colors cursor-pointer"
                      >
                        Forward to Station Officer
                      </button>
                    )}

                    {tip.status !== 'resolved' && (
                      <button
                        type="button"
                        onClick={() =>
                          updateStatus(tip.id, 'resolved', 'Verified on ground by PCR unit. Case logged in CCTNS diary.')
                        }
                        className="px-2.5 py-1 text-[11px] font-bold text-[#15803D] hover:bg-[#15803D] hover:text-white border border-[#15803D] rounded transition-colors cursor-pointer"
                      >
                        Mark Resolved / Closed
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleExportCctns(tip)}
                      className="px-2 py-1 text-[11px] font-medium text-[#0B1F33] hover:bg-[#F1F5F9] border border-[#D5DCE0] rounded cursor-pointer"
                      title="Export single tip to CCTNS"
                    >
                      Export JSON
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CCTNS Modal Simulation */}
      {showCctnsModal && cctnsExportPayload && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#0B1F33]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-xl border border-[#D5DCE0] max-w-2xl w-full p-6 shadow-xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5DCE0]">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#0F766E]" />
                <h3 className="text-lg font-serif font-bold text-[#0B1F33]">
                  CCTNS Portal Gateway Export Simulation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCctnsModal(false)}
                className="text-xs font-bold text-[#475569] hover:text-[#0B1F33] p-1.5"
              >
                Close
              </button>
            </div>

            <div className="text-xs text-[#475569] space-y-1">
              <p>
                <strong className="text-[#0B1F33]">Standard: </strong>
                {cctnsExportPayload.standardsCompliance}
              </p>
              <p>
                <strong className="text-[#0B1F33]">Jurisdiction: </strong>
                {cctnsExportPayload.jurisdiction} ({cctnsExportPayload.cctnsJurisdictionCode})
              </p>
              <p>
                <strong className="text-[#0B1F33]">Records Selected: </strong>
                {cctnsExportPayload.recordCount} verified citizen receipts
              </p>
            </div>

            <div className="bg-[#0B1F33] text-[#2DD4BF] p-3 rounded-lg font-mono text-[11px] max-h-64 overflow-y-auto border border-[#1E293B]">
              <pre>{JSON.stringify(cctnsExportPayload, null, 2)}</pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#D5DCE0] text-xs">
              <span className="text-[#475569]">Ready for push to State Police WAN (Secure MP-BGP VPN tunnel)</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(cctnsExportPayload, null, 2)], {
                      type: 'application/json'
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `cctns-export-${Date.now()}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    showNotification('CCTNS JSON file downloaded successfully.');
                    setShowCctnsModal(false);
                  }}
                  className="px-3.5 py-1.5 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Download File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showNotification('Simulated transmission to District CCTNS server successful (HTTP 200 OK).');
                    setShowCctnsModal(false);
                  }}
                  className="px-3.5 py-1.5 bg-[#0B1F33] hover:bg-[#1E293B] text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Transmit to CCTNS Node
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
