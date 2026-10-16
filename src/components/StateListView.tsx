import React, { useState } from 'react';
import {
  ALL_INDIA_STATES,
  STATE_CRIME_MAP,
  formatIndianNumber,
  formatPopulationEstimate,
  BAND_NAMES,
  getStateBandIndex,
  MAP_RAMP_COLORS
} from '../data/crimeData';
import { getDistrictsForState } from '../data/indiaGeoData';
import { Search, ArrowUpDown, Check, ChevronRight, MapPin, X } from 'lucide-react';

interface StateListViewProps {
  selectedState: string | null;
  selectedDistrict?: string | null;
  onSelectState: (state: string | null) => void;
  onSelectDistrict?: (district: string | null, state?: string | null) => void;
}

export const StateListView: React.FC<StateListViewProps> = ({
  selectedState,
  selectedDistrict,
  onSelectState,
  onSelectDistrict
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'rate' | 'count'>('rate');
  const [sortAsc, setSortAsc] = useState(false);
  const [viewingDistrictsFor, setViewingDistrictsFor] = useState<string | null>(selectedState);

  // Sync with selectedState prop
  React.useEffect(() => {
    setViewingDistrictsFor(selectedState);
  }, [selectedState]);

  // Load districts if a state is selected for district view
  const stateDistricts = React.useMemo(() => {
    if (!viewingDistrictsFor) return [];
    const col = getDistrictsForState(viewingDistrictsFor);
    if (!col || !col.features) return [];
    return col.features.map(f => ({
      name: f.properties?.name || 'Unknown',
      rate: f.properties?.rate ?? 0,
      count: f.properties?.count ?? 0,
      quintile: f.properties?.quintile || 3
    }));
  }, [viewingDistrictsFor]);

  const filteredStates = ALL_INDIA_STATES.filter(state =>
    state.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const sortedStates = [...filteredStates].sort((a, b) => {
    if (sortField === 'name') {
      return sortAsc ? a.localeCompare(b) : b.localeCompare(a);
    }
    const valA = STATE_CRIME_MAP[a]?.[sortField] ?? 0;
    const valB = STATE_CRIME_MAP[b]?.[sortField] ?? 0;
    return sortAsc ? valA - valB : valB - valA;
  });

  const filteredDistricts = stateDistricts.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const sortedDistricts = [...filteredDistricts].sort((a, b) => {
    if (sortField === 'name') {
      return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
    const valA = a[sortField] ?? 0;
    const valB = b[sortField] ?? 0;
    return sortAsc ? valA - valB : valB - valA;
  });

  const toggleSort = (field: 'name' | 'rate' | 'count') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'name');
    }
  };

  const handleStateClick = (state: string) => {
    onSelectState(state);
    setViewingDistrictsFor(state);
    if (onSelectDistrict) onSelectDistrict(null, state);
  };

  const handleDistrictClick = (districtName: string) => {
    if (viewingDistrictsFor && onSelectDistrict) {
      onSelectDistrict(districtName, viewingDistrictsFor);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-[#D5DCE0] shadow-xs overflow-hidden">
      {/* Header and Filter Controls */}
      <div className="p-4 border-b border-[#D5DCE0] bg-[#F6F8F7]/50 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold font-serif text-[#0B1F33]">
              {viewingDistrictsFor ? `${viewingDistrictsFor} Districts` : 'All States & Union Territories'}
            </h2>
            <p className="text-xs text-[#475569]">
              {viewingDistrictsFor
                ? `Official registered crime data for ${stateDistricts.length} districts in ${viewingDistrictsFor}`
                : 'Tabular view of NCRB 2024 registered crime data'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {viewingDistrictsFor && (
              <button
                type="button"
                onClick={() => {
                  setViewingDistrictsFor(null);
                  onSelectState(null);
                  if (onSelectDistrict) onSelectDistrict(null);
                }}
                className="text-xs text-[#0F766E] font-medium hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>← All States</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={viewingDistrictsFor ? `Search districts in ${viewingDistrictsFor}...` : "Search state or union territory..."}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#64748B]/50 rounded-md text-[#0B1F33] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto max-h-[560px]">
        {viewingDistrictsFor ? (
          /* District Table View */
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-[#F6F8F7] sticky top-0 z-10 border-b border-[#D5DCE0] text-xs font-semibold text-[#475569]">
              <tr>
                <th className="py-2.5 px-4 cursor-pointer hover:text-[#0B1F33]" onClick={() => toggleSort('name')}>
                  <div className="flex items-center gap-1">
                    <span>District (Zilla)</span>
                    <ArrowUpDown className="w-3 h-3 text-[#64748B]" />
                  </div>
                </th>
                <th className="py-2.5 px-4 text-right cursor-pointer hover:text-[#0B1F33]" onClick={() => toggleSort('rate')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Rate / 1L</span>
                    <ArrowUpDown className="w-3 h-3 text-[#64748B]" />
                  </div>
                </th>
                <th className="py-2.5 px-4 text-right cursor-pointer hover:text-[#0B1F33]" onClick={() => toggleSort('count')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Registered Cases</span>
                    <ArrowUpDown className="w-3 h-3 text-[#64748B]" />
                  </div>
                </th>
                <th className="py-2.5 px-4 text-center">
                  Quintile
                </th>
                <th className="py-2.5 px-4 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5DCE0]/60 tabular-nums">
              {sortedDistricts.map((dist) => {
                const isSelected = selectedDistrict?.toLowerCase() === dist.name.toLowerCase();
                const q = dist.quintile || 3;
                const bandColor = MAP_RAMP_COLORS[Math.min(4, Math.max(0, q - 1))];

                return (
                  <tr
                    key={dist.name}
                    onClick={() => handleDistrictClick(dist.name)}
                    className={`hover:bg-[#F6F8F7] cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#E8F0EE]/80 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-[#0B1F33]">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                        <span className="font-semibold">{dist.name}</span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-[#0F766E] shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-[#0B1F33]">
                      {dist.rate.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-right text-[#475569]">
                      {formatIndianNumber(dist.count)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border border-[#D5DCE0]"
                        style={{ backgroundColor: bandColor }}
                      >
                        Q{q}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDistrictClick(dist.name);
                        }}
                        className={`text-xs px-2.5 py-1 rounded transition-colors ${
                          isSelected
                            ? 'bg-[#0F766E] text-white'
                            : 'bg-white border border-[#64748B]/40 text-[#0B1F33] hover:bg-[#F6F8F7]'
                        }`}
                      >
                        {isSelected ? 'Active' : 'Select'}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {sortedDistricts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#64748B]">
                    No districts found matching "{searchTerm}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          /* State Table View */
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-[#F6F8F7] sticky top-0 z-10 border-b border-[#D5DCE0] text-xs font-semibold text-[#475569]">
              <tr>
                <th className="py-2.5 px-4 cursor-pointer hover:text-[#0B1F33]" onClick={() => toggleSort('name')}>
                  <div className="flex items-center gap-1">
                    <span>State / UT</span>
                    <ArrowUpDown className="w-3 h-3 text-[#64748B]" />
                  </div>
                </th>
                <th className="py-2.5 px-4 text-right cursor-pointer hover:text-[#0B1F33]" onClick={() => toggleSort('rate')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Rate / 1L</span>
                    <ArrowUpDown className="w-3 h-3 text-[#64748B]" />
                  </div>
                </th>
                <th className="py-2.5 px-4 text-right cursor-pointer hover:text-[#0B1F33]" onClick={() => toggleSort('count')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Total Cases</span>
                    <ArrowUpDown className="w-3 h-3 text-[#64748B]" />
                  </div>
                </th>
                <th className="py-2.5 px-4 text-right hidden sm:table-cell">
                  Est. Population
                </th>
                <th className="py-2.5 px-4 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5DCE0]/60 tabular-nums">
              {sortedStates.map((state) => {
                const data = STATE_CRIME_MAP[state];
                const isSelected = selectedState?.toLowerCase() === state.toLowerCase();
                const bandIdx = getStateBandIndex(state);
                const bandColor = bandIdx >= 0 ? MAP_RAMP_COLORS[bandIdx] : '#E5E7EB';

                return (
                  <tr
                    key={state}
                    onClick={() => handleStateClick(state)}
                    className={`hover:bg-[#F6F8F7] cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#E8F0EE]/80 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-[#0B1F33]">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-xs shrink-0 border border-black/10"
                          style={{ backgroundColor: bandColor }}
                          title={bandIdx >= 0 ? BAND_NAMES[bandIdx] : 'No data'}
                        />
                        <span>{state}</span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-[#0F766E] shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-[#0B1F33]">
                      {data?.rate !== undefined ? data.rate.toFixed(1) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right text-[#475569]">
                      {data?.count !== undefined ? formatIndianNumber(data.count) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right text-[#64748B] hidden sm:table-cell">
                      {formatPopulationEstimate(data?.populationEstimate)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStateClick(state);
                          }}
                          className={`text-xs px-2.5 py-1 rounded transition-colors ${
                            isSelected
                              ? 'bg-[#0F766E] text-white'
                              : 'bg-white border border-[#64748B]/40 text-[#0B1F33] hover:bg-[#F6F8F7]'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectState(state);
                            setViewingDistrictsFor(state);
                          }}
                          className="text-xs px-2 py-1 text-[#0F766E] bg-[#E8F0EE] hover:bg-[#0F766E] hover:text-white rounded transition-colors"
                          title={`View all districts in ${state}`}
                        >
                          Districts
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {sortedStates.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#64748B]">
                    No states found matching "{searchTerm}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
