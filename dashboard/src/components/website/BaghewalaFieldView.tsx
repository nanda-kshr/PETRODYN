'use client';

import React from 'react';
import {
  Compass,
  MapPin,
  Flame,
  Droplets,
  Layers,
  Thermometer,
  Activity,
  ArrowRight,
  TrendingDown,
  AlertOctagon,
} from 'lucide-react';
import { SiteNavId } from '@/components/SiteNavbar';

interface BaghewalaFieldViewProps {
  onNavigate: (view: SiteNavId) => void;
}

export const BaghewalaFieldView: React.FC<BaghewalaFieldViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-10 pb-16 max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 font-mono">
      {/* HEADER BANNER */}
      <div className="border-b border-[#1E2A3B] pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          <Compass className="w-3.5 h-3.5" />
          <span>Field Geology &amp; Reservoir Engineering Profile</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Baghewala Heavy Oil Field Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-3xl leading-relaxed">
          Located in the Bikaner-Nagaur Basin of Western Rajasthan and operated by Oil India Limited (OIL),
          Baghewala is India&apos;s premier onshore heavy oil reservoir undergoing Cyclic Steam Stimulation (CSS)
          and Sucker Rod Pumping (SRP) artificial lift.
        </p>
      </div>

      {/* QUICK KEY METRICS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-1">
          <span className="text-[10px] text-slate-400">RESERVOIR DEPTH</span>
          <div className="text-xl font-bold text-slate-100">~1,150 m</div>
          <span className="text-[11px] text-cyan-400">Jodhpur Sandstone</span>
        </div>

        <div className="p-4 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-1">
          <span className="text-[10px] text-slate-400">FLUID VISCOSITY (50°C)</span>
          <div className="text-xl font-bold text-amber-400">10,000–13,000 cP</div>
          <span className="text-[11px] text-slate-400">Ultra-viscous crude</span>
        </div>

        <div className="p-4 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-1">
          <span className="text-[10px] text-slate-400">WELL INVENTORY</span>
          <div className="text-xl font-bold text-cyan-300">56 / 34 Wells</div>
          <span className="text-[11px] text-slate-400">56 Drilled / 34 Active</span>
        </div>

        <div className="p-4 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-1">
          <span className="text-[10px] text-slate-400">STEAM INJECTION</span>
          <div className="text-xl font-bold text-rose-400">250–320°C</div>
          <span className="text-[11px] text-slate-400">14–21 day cycles</span>
        </div>
      </div>

      {/* DETAILED GEOLOGICAL & FLUID SPECIFICATIONS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Reservoir &amp; Formation Characteristics</span>
          </h3>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex justify-between py-1.5 border-b border-[#1E2A3B]/60">
              <span className="text-slate-400">Basin Location:</span>
              <span className="text-slate-100 font-bold">Bikaner-Nagaur Basin, Thar Desert</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1E2A3B]/60">
              <span className="text-slate-400">Geological Age:</span>
              <span className="text-slate-100 font-bold">Lower Cambrian / Ediacaran</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1E2A3B]/60">
              <span className="text-slate-400">Producing Horizon:</span>
              <span className="text-cyan-300 font-bold">Jodhpur Sandstone Member</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1E2A3B]/60">
              <span className="text-slate-400">Net Pay Thickness:</span>
              <span className="text-slate-100 font-bold">18 – 24 m</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1E2A3B]/60">
              <span className="text-slate-400">Initial Reservoir Temperature:</span>
              <span className="text-rose-400 font-bold">50.0°C</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1E2A3B]/60">
              <span className="text-slate-400">Reservoir Pressure:</span>
              <span className="text-slate-100 font-bold">11.2 MPa</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Operator:</span>
              <span className="text-slate-100 font-bold">Oil India Limited (OIL)</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Droplets className="w-4 h-4 text-amber-400" />
            <span>Heavy Crude Fluid Rheology</span>
          </h3>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex justify-between py-1.5 border-b border-[#1E2A3B]/60">
              <span className="text-slate-400">API Gravity:</span>
              <span className="text-slate-100 font-bold">16.0 – 19.0° API</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1E2A3B]/60">
              <span className="text-slate-400">Dynamic Viscosity @ 50°C:</span>
              <span className="text-amber-400 font-bold">10,000 – 13,000 cP</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1E2A3B]/60">
              <span className="text-slate-400">Dynamic Viscosity @ 120°C:</span>
              <span className="text-emerald-400 font-bold">180 – 320 cP</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1E2A3B]/60">
              <span className="text-slate-400">Asphaltene Content:</span>
              <span className="text-slate-100 font-bold">18.4 wt%</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1E2A3B]/60">
              <span className="text-slate-400">Sulfur Content:</span>
              <span className="text-slate-100 font-bold">2.3 wt%</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1E2A3B]/60">
              <span className="text-slate-400">Pour Point:</span>
              <span className="text-slate-100 font-bold">+24°C</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Drive Mechanism:</span>
              <span className="text-slate-100 font-bold">CSS Thermal Dissolution + SRP Lift</span>
            </div>
          </div>
        </div>
      </section>

      {/* THE CYCLIC STEAM STIMULATION LIFECYCLE */}
      <section className="p-6 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Flame className="w-4 h-4 text-rose-400" />
          <span>Cyclic Steam Stimulation (CSS) 3-Phase Operational Cycle</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
          <div className="p-4 rounded bg-[#0B1017] border border-[#1E2A3B] space-y-2">
            <span className="text-[10px] font-mono font-bold text-rose-400">PHASE 01 // 14–21 DAYS</span>
            <h4 className="font-mono font-bold text-slate-100 text-sm">Steam Injection</h4>
            <p className="text-slate-400 leading-relaxed text-xs">
              High-pressure superheated steam (250–320°C, 12–16 MPa) is injected downhole to heat the near-wellbore rock matrix and dramatically reduce heavy crude viscosity.
            </p>
          </div>

          <div className="p-4 rounded bg-[#0B1017] border border-[#1E2A3B] space-y-2">
            <span className="text-[10px] font-mono font-bold text-amber-400">PHASE 02 // 7–10 DAYS</span>
            <h4 className="font-mono font-bold text-slate-100 text-sm">Thermal Soak</h4>
            <p className="text-slate-400 leading-relaxed text-xs">
              The well is shut in to allow heat to diffuse deep into the formation pores (~14 m radial penetration), mobilizing immobile heavy oil towards the wellbore.
            </p>
          </div>

          <div className="p-4 rounded bg-[#0B1017] border border-[#1E2A3B] space-y-2">
            <span className="text-[10px] font-mono font-bold text-emerald-400">PHASE 03 // 60–120 DAYS</span>
            <h4 className="font-mono font-bold text-slate-100 text-sm">SRP Artificial Lift Production</h4>
            <p className="text-slate-400 leading-relaxed text-xs">
              The sucker rod pump is activated. Oil flows while the formation cools. THERMO-LIFT optimizes SPM to prevent rod floating as thermal decay increases viscosity.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 px-5 py-2.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono text-xs transition cursor-pointer"
        >
          <span>Monitor Well BW-001 Live on Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default BaghewalaFieldView;
