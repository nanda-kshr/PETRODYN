'use client';

import React from 'react';
import {
  Cpu,
  Thermometer,
  Zap,
  Activity,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Layers,
  Gauge,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { SiteNavId } from '@/components/SiteNavbar';

interface DigitalTwinViewProps {
  onNavigate: (view: SiteNavId) => void;
}

export const DigitalTwinView: React.FC<DigitalTwinViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-10 pb-16 max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 font-mono">
      {/* HEADER BANNER */}
      <div className="border-b border-[#1E2A3B] pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs">
          <Cpu className="w-3.5 h-3.5" />
          <span>Coupled Physics-Informed Digital Twin Core</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Coupled Well-to-Surface Modeling Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-3xl leading-relaxed">
          THERMO-LIFT couples thermodynamic reservoir cooling equations with wave-equation sucker rod pump (SRP)
          kinematics to predict rod-floating risks, thermal decay, and dynamometer card profiles in real time.
        </p>
      </div>

      {/* 3 CORE COUPLED TWIN MODULES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module 1: Thermal & Cooling Dynamics */}
        <div className="p-6 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30">
              THERMODYNAMICS
            </span>
            <Thermometer className="w-4 h-4 text-rose-400" />
          </div>
          <h2 className="text-base font-bold text-slate-100">Near-Wellbore Thermal Decay</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Tracks heat dissipation following 14–21 day Cyclic Steam Stimulation (CSS) cycles. Models heat transfer from the 1,150 m Jodhpur Sandstone formation into the wellbore fluid column.
          </p>

          <div className="space-y-2 pt-2 border-t border-[#1E2A3B]/60 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Peak Injection Temp:</span>
              <span className="text-rose-400 font-bold">250–320°C</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Cooling Baseline (Reservoir):</span>
              <span className="text-slate-200 font-bold">50.0°C</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Soak Duration:</span>
              <span className="text-amber-400 font-bold">7–10 Days</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Thermal Radial Penetration:</span>
              <span className="text-cyan-400 font-bold">14.2 m</span>
            </div>
          </div>
        </div>

        {/* Module 2: Viscosity Tracking */}
        <div className="p-6 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
              RHEOLOGY MODEL
            </span>
            <TrendingDown className="w-4 h-4 text-amber-400" />
          </div>
          <h2 className="text-base font-bold text-slate-100">Arrhenius Viscosity Tracking</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Real-time viscosity prediction using Andrade-Arrhenius temperature-dependence calibrated to Baghewala crude samples. Quantifies the viscous drag force along the rod string.
          </p>

          <div className="space-y-2 pt-2 border-t border-[#1E2A3B]/60 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Viscosity @ 50°C (Cold):</span>
              <span className="text-rose-400 font-bold">10,000–13,000 cP</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Viscosity @ 120°C (Hot):</span>
              <span className="text-emerald-400 font-bold">180–320 cP</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>API Gravity:</span>
              <span className="text-slate-200 font-bold">16.8° API</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Model Confidence:</span>
              <span className="text-cyan-400 font-bold">98.4% R²</span>
            </div>
          </div>
        </div>

        {/* Module 3: SRP Mechanical Dynamics */}
        <div className="p-6 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              KINEMATICS & LOAD
            </span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <h2 className="text-base font-bold text-slate-100">Wave-Equation Rod Lift Simulator</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Simulates mechanical stress along the 1,150 m tapered rod string via damped 1D wave equation (Gibbs method). Produces surface and downhole dynamometer pump cards at 10 Hz.
          </p>

          <div className="space-y-2 pt-2 border-t border-[#1E2A3B]/60 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Peak Polished Rod Load:</span>
              <span className="text-slate-200 font-bold">78.4 kN (Target: &lt; 95 kN)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Minimum Rod Load:</span>
              <span className="text-cyan-400 font-bold">24.2 kN (Compression safety)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Rod Floating Risk Threshold:</span>
              <span className="text-emerald-400 font-bold">&lt; 15% (Nominal: 8.2%)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Stroke Length / Speed:</span>
              <span className="text-slate-200 font-bold">120 in / 5.5 SPM</span>
            </div>
          </div>
        </div>
      </div>

      {/* ROD-FLOATING PHENOMENON & MATHEMATICAL BASIS */}
      <section className="p-6 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-4">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <span>THE PHYSICS OF ROD FLOATING IN HEAVY CRUDE OIL</span>
        </div>
        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          During the downstroke, gravitational force pulls the rod string downward against upward viscous drag and fluid buoyancy.
          When crude viscosity exceeds ~4,000 cP at low temperatures, upward frictional drag exceeds the buoyant weight of the rods:
        </p>

        <div className="p-4 rounded bg-[#0B1017] border border-[#1E2A3B] text-center text-xs sm:text-sm text-cyan-300 font-bold tracking-wide">
          F_drag = 2 &pi; &mu; L_rod (v_rod / ln(r_tubing / r_rod)) &ge; W_rod - F_buoyancy
        </div>

        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          When this threshold is reached, the sucker rod floats, causing bridle separation, catastrophic impact shock loading upon downhole pump landing, and severe casing wear. THERMO-LIFT continuously predicts this margin and automatically recommends reducing SPM or throttling VFD frequency.
        </p>
      </section>

      {/* COMPOSITE WELL HEALTH SCORE BREAKDOWN */}
      <section className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Gauge className="w-4 h-4 text-purple-400" />
          <span>Composite 0–100 Well Health Scoring Index</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-[#0B1017] border border-[#1E2A3B] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Thermal Subsurface Efficiency</span>
              <span className="text-cyan-400 font-bold">35% Weight</span>
            </div>
            <div className="w-full bg-[#1E2A3B] h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-400 h-full w-[85%]" />
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Evaluates temperature retention, steam enthalpy utilization, and thermal decay rate versus CSS injection timeline.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#0B1017] border border-[#1E2A3B] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Mechanical Lift Stability</span>
              <span className="text-emerald-400 font-bold">35% Weight</span>
            </div>
            <div className="w-full bg-[#1E2A3B] h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full w-[90%]" />
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Assesses dyno card fillage, rod-floating margin, gear reducer torque load, and fatigue stress cycle margins.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#0B1017] border border-[#1E2A3B] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Fluid Inflow & Recovery Ratio</span>
              <span className="text-purple-400 font-bold">30% Weight</span>
            </div>
            <div className="w-full bg-[#1E2A3B] h-1.5 rounded-full overflow-hidden">
              <div className="bg-purple-400 h-full w-[78%]" />
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Monitors dynamic acoustic fluid level, pump submergence, pump volumetric efficiency, and Steam-to-Oil Ratio (SOR).
            </p>
          </div>
        </div>
      </section>

      {/* JUMP TO DASHBOARD */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 px-5 py-2.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono text-xs transition cursor-pointer"
        >
          <span>View Live Digital Twin on Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DigitalTwinView;
