import React from 'react';
import { VERIFIED_HELPLINES } from '../data/helplinesData';
import {
  PhoneCall,
  AlertTriangle,
  ExternalLink,
  MapPin,
  ShieldCheck,
  Building,
  HeartPulse,
  Flame,
  Clock,
  Shield,
  Users
} from 'lucide-react';

interface EmergencyHelpPageProps {
  onBackToAtlas: () => void;
  onOpenTrustedCircle?: () => void;
}

export const EmergencyHelpPage: React.FC<EmergencyHelpPageProps> = ({
  onBackToAtlas,
  onOpenTrustedCircle
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Breadcrumb / Back button */}
      <div>
        <button
          type="button"
          onClick={onBackToAtlas}
          className="text-xs font-semibold text-[#0F766E] hover:underline cursor-pointer mb-2 inline-flex items-center gap-1"
        >
          ← Return to Atlas & Statistics
        </button>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[#0B1F33]">
          Emergency Help & Verified Helplines
        </h1>
        <p className="text-sm text-[#475569] mt-1 max-w-2xl">
          Direct, verified contact numbers for emergency assistance across all States and Union Territories of India.
        </p>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="bg-[#FFF7E6] border-2 border-[#B45309]/50 rounded-xl p-5 flex items-start gap-4 shadow-xs">
        <AlertTriangle className="w-6 h-6 text-[#B45309] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-base font-bold text-[#0B1F33] font-serif">
            If someone is in immediate danger, call 112. Averti is not an emergency service. We cannot send help.
          </p>
          <p className="text-xs text-[#475569] leading-relaxed">
            Averti is an independent public-safety information atlas. We do not dispatch first responders, track phone locations, or receive emergency distress calls. In any critical incident, use the official direct channels below.
          </p>
        </div>
      </div>

      {/* Hero Primary 112 Emergency Action Card */}
      {/* Emergency red is reserved exclusively for the Call 112 action */}
      <div className="bg-[#D92D20] text-white rounded-xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-medium tracking-wide">
            <ShieldCheck className="w-4 h-4" />
            <span>Pan-India Single Emergency Response System</span>
          </div>
          <div className="text-5xl sm:text-6xl font-bold font-serif tracking-tight tabular-nums">
            112
          </div>
          <p className="text-sm sm:text-base text-white/90 max-w-md">
            All-in-one emergency dispatch for Police, Fire, Ambulance, and Disaster Management. Free 24/7 call from any mobile or landline across India.
          </p>
        </div>

        <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
          <a
            href="tel:112"
            className="inline-flex items-center justify-center gap-3 bg-white text-[#D92D20] hover:bg-[#F6F8F7] font-bold text-xl px-8 py-4 rounded-xl shadow-lg transition-all transform active:scale-95"
            aria-label="Call 112 directly"
          >
            <PhoneCall className="w-6 h-6 animate-pulse" />
            <span>Call 112</span>
          </a>
          <span className="text-xs text-white/80">
            Source: <a href="https://112.gov.in" target="_blank" rel="noopener noreferrer" className="underline">112.gov.in (ERSS)</a>
          </span>
        </div>
      </div>

      {/* Trusted Circle Timed Safety Check-In Feature Card */}
      {onOpenTrustedCircle && (
        <div className="bg-[#E8F0EE] border border-[#0F766E]/30 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0F766E]/15 text-[#0F766E] text-[11px] font-bold tracking-wide uppercase">
              <Users className="w-3.5 h-3.5" />
              <span>Privacy-First Software Protocol</span>
            </div>
            <h2 className="text-lg font-bold font-serif text-[#0B1F33]">
              Trusted Circle Timed Safety Check-In
            </h2>
            <p className="text-xs text-[#475569] max-w-xl leading-relaxed">
              For students, solo commuters, and late-night travel. Set an expected arrival timer. Zero continuous tracking—if you fail to check in before time expires, your pre-configured family contacts receive an immediate automated alert with your last reported locality and formatted 112 ERSS dispatch data.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenTrustedCircle}
            className="shrink-0 px-5 py-3 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>Launch Safety Check-In</span>
          </button>
        </div>
      )}

      {/* Nearby Assistance Quick Finders (Google Maps Query) */}
      <div className="bg-white rounded-xl border border-[#D5DCE0] p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-[#0B1F33]">
            Find Nearby Emergency Facilities
          </h2>
          <p className="text-xs text-[#475569]">
            Search verified nearest public emergency services on Google Maps. Averti does not access your location coordinates.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="https://www.google.com/maps/search/police+station+near+me"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-lg border border-[#D5DCE0] hover:border-[#0F766E] hover:bg-[#F6F8F7] transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#0B1F33] group-hover:text-[#0F766E]">
                  Police Station
                </div>
                <div className="text-xs text-[#475569]">Nearest stations</div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-[#64748B] group-hover:text-[#0F766E]" />
          </a>

          <a
            href="https://www.google.com/maps/search/hospital+emergency+near+me"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-lg border border-[#D5DCE0] hover:border-[#0F766E] hover:bg-[#F6F8F7] transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#0B1F33] group-hover:text-[#0F766E]">
                  Hospital / ER
                </div>
                <div className="text-xs text-[#475569]">Trauma & medical care</div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-[#64748B] group-hover:text-[#0F766E]" />
          </a>

          <a
            href="https://www.google.com/maps/search/fire+station+near+me"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-lg border border-[#D5DCE0] hover:border-[#0F766E] hover:bg-[#F6F8F7] transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#0B1F33] group-hover:text-[#0F766E]">
                  Fire Station
                </div>
                <div className="text-xs text-[#475569]">Rescue services</div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-[#64748B] group-hover:text-[#0F766E]" />
          </a>
        </div>
      </div>

      {/* Verified Specialized National Helplines Grid */}
      <div className="bg-white rounded-xl border border-[#D5DCE0] p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-[#0B1F33]">
            Verified Specialized Official Helplines
          </h2>
          <p className="text-xs text-[#475569]">
            National toll-free numbers verified against government portals. Last reviewed: October 2026.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VERIFIED_HELPLINES.filter(h => !h.isPrimary).map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-lg border border-[#D5DCE0] hover:border-[#0F766E]/40 bg-[#F6F8F7]/40 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-semibold text-[#0F766E] uppercase tracking-wider block">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-[#0B1F33] font-serif mt-0.5">
                      {item.name}
                    </h3>
                  </div>
                  <a
                    href={`tel:${item.number}`}
                    className="px-3 py-1.5 rounded-md bg-white border border-[#64748B] text-[#0B1F33] hover:bg-[#0F766E] hover:text-white hover:border-[#0F766E] text-xs font-bold transition-colors shrink-0 tabular-nums flex items-center gap-1.5"
                    title={`Call ${item.number}`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    {item.number}
                  </a>
                </div>

                <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#D5DCE0]/60 flex items-center justify-between text-[11px] text-[#64748B]">
                <span className="truncate max-w-[200px]" title={item.source}>
                  Source: <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-[#0F766E]">{item.source}</a>
                </span>
                <span className="flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3" />
                  Checked: {item.verifiedDate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
