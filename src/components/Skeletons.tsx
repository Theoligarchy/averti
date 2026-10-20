import React from 'react';

/**
 * Skeleton component mimicking the layout of StateSummaryCard
 * Displays during initial load or while transitioning between states/districts.
 */
export const StateSummaryCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <article
      aria-label="Loading summary data"
      aria-busy="true"
      className={`bg-white rounded-lg border border-[#D5DCE0] p-4 sm:p-5 shadow-xs space-y-4 animate-pulse ${className}`}
    >
      {/* Header: Subtitle & Title */}
      <div className="flex items-start justify-between gap-3 border-b border-[#D5DCE0]/70 pb-3">
        <div className="space-y-2 min-w-0 flex-1">
          {/* Breadcrumb / Category kicker */}
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded bg-slate-200 shrink-0" />
            <div className="h-3 w-32 bg-slate-200 rounded" />
            <div className="h-3 w-16 bg-slate-100 rounded" />
          </div>
          {/* Main Title */}
          <div className="h-6 w-48 sm:w-60 bg-slate-200 rounded" />
        </div>
        {/* Reset / Action button placeholder */}
        <div className="w-8 h-8 rounded bg-slate-100 shrink-0" />
      </div>

      {/* 3 Primary Stat Cards (Cases, Rate, Population) */}
      <div className="grid grid-cols-3 gap-2.5">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="p-2.5 rounded bg-[#F6F8F7] border border-[#D5DCE0]/70 space-y-1.5"
          >
            <div className="h-2.5 w-14 bg-slate-200 rounded" />
            <div className="h-6 w-20 bg-slate-300 rounded" />
            <div className="h-2 w-16 bg-slate-200 rounded" />
          </div>
        ))}
      </div>

      {/* Crime Category Composition Skeleton */}
      <div className="w-full bg-[#F6F8F7] rounded-md border border-[#D5DCE0] p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-slate-200" />
            <div className="h-3 w-48 bg-slate-200 rounded" />
          </div>
          <div className="h-2.5 w-24 bg-slate-100 rounded" />
        </div>
        <div className="h-5 w-full rounded bg-slate-200" />
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-9 rounded bg-white border border-slate-200 p-1.5 space-y-1">
              <div className="h-2 w-12 bg-slate-200 rounded" />
              <div className="h-2 w-8 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Trajectory / Comparison Chart Section Skeleton */}
      <div className="w-full bg-[#F6F8F7] rounded-md border border-[#D5DCE0] p-3 space-y-3">
        {/* Chart Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-slate-200" />
            <div className="h-3 w-40 bg-slate-200 rounded" />
          </div>
          <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded">
            <div className="h-5 w-14 bg-white rounded" />
            <div className="h-5 w-14 bg-transparent rounded" />
          </div>
        </div>

        {/* 12-Month Simulated Bar Chart Grid */}
        <div className="h-[140px] w-full pt-4 pb-2 px-1 flex items-end justify-between gap-1.5 border-b border-slate-200">
          {[38, 55, 42, 70, 62, 85, 78, 65, 52, 60, 48, 58].map((heightPct, barIdx) => (
            <div key={barIdx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <div
                className="w-full bg-slate-200 rounded-t transition-all"
                style={{ height: `${heightPct}%` }}
              />
            </div>
          ))}
        </div>

        {/* Months Label Axis */}
        <div className="flex items-center justify-between text-[9px] px-1 text-slate-400">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
            <span key={m} className="w-4 text-center">{m[0]}</span>
          ))}
        </div>

        {/* Chart Subtitle / Peak Marker line */}
        <div className="flex items-center justify-between pt-1">
          <div className="h-2.5 w-32 bg-slate-200 rounded" />
          <div className="h-2.5 w-24 bg-slate-200 rounded" />
        </div>
      </div>

      {/* YoY / Multi-Year Context Card Skeleton */}
      <div className="p-3 rounded-md bg-[#F6F8F7] border border-[#D5DCE0]/80 space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-3 w-36 bg-slate-200 rounded" />
          <div className="h-4 w-16 bg-slate-200 rounded" />
        </div>
        <div className="h-2.5 w-full bg-slate-100 rounded" />
      </div>
    </article>
  );
};

/**
 * Skeleton component mimicking the layout of NoticesPanel
 * Displays during initialization or category filtering transitions.
 */
export const NoticesPanelSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      aria-label="Loading notices"
      aria-busy="true"
      className={`flex flex-col h-full bg-white rounded-lg border border-[#D5DCE0] shadow-xs animate-pulse overflow-hidden ${className}`}
    >
      {/* Header section */}
      <div className="p-4 border-b border-[#D5DCE0] space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-slate-200 shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-5 w-48 bg-slate-200 rounded" />
            <div className="h-3 w-56 bg-slate-100 rounded" />
          </div>
        </div>

        {/* Category Filter Pills Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[18, 24, 16, 14, 20].map((widthRem, idx) => (
            <div
              key={idx}
              className={`h-7 rounded-full bg-slate-200 shrink-0`}
              style={{ width: `${widthRem * 3.5}px` }}
            />
          ))}
        </div>

        {/* Search input placeholder */}
        <div className="h-9 w-full rounded-md bg-slate-100 border border-slate-200 flex items-center px-3">
          <div className="w-3.5 h-3.5 rounded bg-slate-300 mr-2" />
          <div className="h-3 w-40 bg-slate-200 rounded" />
        </div>
      </div>

      {/* Notices List Skeleton items */}
      <div className="divide-y divide-[#D5DCE0]/60 p-1">
        {[1, 2, 3, 4].map((itemIdx) => (
          <div key={itemIdx} className="p-3.5 space-y-2.5">
            {/* Top row: Category tag & Status badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-slate-200" />
                <div className="h-3 w-28 bg-slate-200 rounded" />
              </div>
              <div className="h-5 w-16 bg-slate-200 rounded" />
            </div>

            {/* Title */}
            <div className="h-4 w-5/6 bg-slate-200 rounded" />

            {/* Snippet / Description */}
            <div className="space-y-1">
              <div className="h-2.5 w-full bg-slate-100 rounded" />
              <div className="h-2.5 w-3/4 bg-slate-100 rounded" />
            </div>

            {/* Footer row: Authority & Date */}
            <div className="flex items-center justify-between pt-1">
              <div className="h-2.5 w-32 bg-slate-200 rounded" />
              <div className="h-2.5 w-20 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton component mimicking the layout of DistrictPulsePanel
 * Displays during district geolocated alert feeds initialization.
 */
export const DistrictPulsePanelSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      aria-label="Loading district pulse alerts"
      aria-busy="true"
      className={`flex flex-col bg-white rounded-lg border border-[#D5DCE0] shadow-xs overflow-hidden animate-pulse ${className}`}
    >
      {/* Header section with live icon placeholder */}
      <div className="p-3.5 sm:p-4 border-b border-[#D5DCE0] bg-[#F6F8F7]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-md bg-slate-200 shrink-0" />
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-1.5">
                <div className="h-4 w-28 bg-slate-200 rounded" />
                <div className="h-3.5 w-10 bg-slate-200 rounded" />
              </div>
              <div className="h-3 w-40 bg-slate-100 rounded" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <div className="h-7 w-20 bg-slate-200 rounded" />
            <div className="h-7 w-7 bg-slate-200 rounded" />
          </div>
        </div>

        {/* Filter categories pills */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-0.5 no-scrollbar">
          {[12, 14, 16, 14, 18].map((w, idx) => (
            <div
              key={idx}
              className="h-6 rounded bg-slate-200 shrink-0"
              style={{ width: `${w * 4}px` }}
            />
          ))}
        </div>
      </div>

      {/* Pulse Alert cards */}
      <div className="p-3 space-y-2.5">
        {[1, 2, 3].map((alertIdx) => (
          <div
            key={alertIdx}
            className="border-l-4 border-slate-300 bg-slate-50/70 p-3 rounded-r border border-[#D5DCE0]/60 space-y-2"
          >
            {/* Alert Header: Category & Timestamp */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-slate-200" />
                <div className="h-3 w-24 bg-slate-200 rounded" />
              </div>
              <div className="h-2.5 w-16 bg-slate-200 rounded" />
            </div>

            {/* Alert Headline */}
            <div className="h-4 w-4/5 bg-slate-200 rounded" />

            {/* Alert Body */}
            <div className="space-y-1">
              <div className="h-2.5 w-full bg-slate-100 rounded" />
              <div className="h-2.5 w-2/3 bg-slate-100 rounded" />
            </div>

            {/* Alert Authority / Jurisdiction */}
            <div className="flex items-center justify-between pt-1">
              <div className="h-2.5 w-32 bg-slate-200 rounded" />
              <div className="h-4 w-16 bg-slate-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton component mimicking the layout of WantedNoticesPanel
 */
export const WantedNoticesPanelSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      aria-label="Loading wanted notices"
      aria-busy="true"
      className={`flex flex-col bg-white rounded-lg border border-[#D5DCE0] shadow-xs mt-4 animate-pulse overflow-hidden ${className}`}
    >
      <div className="p-4 border-b border-[#D5DCE0] space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-slate-200 shrink-0" />
          <div className="space-y-1 flex-1">
            <div className="h-4 w-36 bg-slate-200 rounded" />
            <div className="h-3 w-48 bg-slate-100 rounded" />
          </div>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {[1, 2].map((idx) => (
          <div key={idx} className="p-3 rounded border border-[#D5DCE0]/60 space-y-2 bg-[#F6F8F7]/60">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-slate-200 rounded" />
              <div className="h-4 w-14 bg-slate-200 rounded" />
            </div>
            <div className="h-4 w-3/4 bg-slate-200 rounded" />
            <div className="h-2.5 w-full bg-slate-100 rounded" />
            <div className="flex items-center justify-between pt-1">
              <div className="h-2.5 w-28 bg-slate-200 rounded" />
              <div className="h-2.5 w-16 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

