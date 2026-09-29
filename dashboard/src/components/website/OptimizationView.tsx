'use client';

import React from 'react';
import {
  Sliders,
  Zap,
  TrendingUp,
  Cpu,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Flame,
  Droplets,
  Gauge,
  Sparkles,
} from 'lucide-react';
import { SiteNavId } from '@/components/SiteNavbar';

interface OptimizationViewProps {
  onNavigate: (view: SiteNavId) => void;
}

export const OptimizationView: React.FC<OptimizationViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-10 pb-16 max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 font-mono">
      {/* HEADER BANNER */}
      <div className="border-b border-[#1E2A3B] pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          <Sliders className="w-3.5 h-3.5" />
          <span>Multi-Objective Autonomous Optimization Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          CSS-SRP Joint Optimization Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-3xl leading-relaxed">
          Evaluates multi-parametric decision surfaces to balance maximum cumulative oil recovery against Steam-to-Oil Ratio (SOR),
          lifting energy consumption, and sucker rod string fatigue.
        </p>
      </div>

      {/* PARETO OBJECTIVES MATRIX */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              OBJECTIVE 1
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <h2 className="text-sm font-bold text-slate-100">Maximize Net Oil Production</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Optimizes fluid drawdown pressure to sustain peak production plateaus throughout post-steam thermal cycles without starving the pump.
          </p>
          <div className="pt-2 border-t border-[#1E2A3B]/60 text-xs text-slate-300">
            <span>Target: </span>
            <span className="text-emerald-400 font-bold">+18.5% BOPD Cumulative</span>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
              OBJECTIVE 2
            </span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <h2 className="text-sm font-bold text-slate-100">Minimize Steam-to-Oil Ratio (SOR)</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Eliminates wasted boiler fuel and excessive steam injection by predicting optimal steam slugs and heat soak cut-off thresholds.
          </p>
          <div className="pt-2 border-t border-[#1E2A3B]/60 text-xs text-slate-300">
            <span>Target: </span>
            <span className="text-amber-400 font-bold">SOR &lt; 3.1 (Baseline: 4.8)</span>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              OBJECTIVE 3
            </span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <h2 className="text-sm font-bold text-slate-100">Minimize Power & Mechanical Fatigue</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Prevents over-pumping, fluid pound, and rod-floating. Dynamically modulates VFD speed to maintain minimum rod compression margins.
          </p>
          <div className="pt-2 border-t border-[#1E2A3B]/60 text-xs text-slate-300">
            <span>Target: </span>
            <span className="text-cyan-400 font-bold">-22% kWh/bbl Lifting Energy</span>
          </div>
        </div>
      </div>

      {/* PARAMETRIC DECISION SPACE */}
      <section className="p-6 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>Decision Variables &amp; Optimization Range</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E2A3B] text-slate-400">
                <th className="py-2.5 px-3">Subsystem</th>
                <th className="py-2.5 px-3">Control Parameter</th>
                <th className="py-2.5 px-3">Feasible Range</th>
                <th className="py-2.5 px-3">Current Dispatch</th>
                <th className="py-2.5 px-3">Governing Boundary Constraint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2A3B]/50 text-slate-300">
              <tr>
                <td className="py-2.5 px-3 text-rose-400 font-bold">CSS Injection</td>
                <td className="py-2.5 px-3">Steam Injection Volume</td>
                <td className="py-2.5 px-3 text-slate-400">4,000 – 10,000 m³</td>
                <td className="py-2.5 px-3 text-white font-bold">7,200 m³</td>
                <td className="py-2.5 px-3 text-slate-400">Caprock fracture pressure &lt; 18.5 MPa</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-rose-400 font-bold">CSS Injection</td>
                <td className="py-2.5 px-3">Soak Duration</td>
                <td className="py-2.5 px-3 text-slate-400">5 – 14 Days</td>
                <td className="py-2.5 px-3 text-white font-bold">8.0 Days</td>
                <td className="py-2.5 px-3 text-slate-400">Formation heat diffusion equilibrium</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-sky-400 font-bold">SRP Lift</td>
                <td className="py-2.5 px-3">Pumping Speed (SPM)</td>
                <td className="py-2.5 px-3 text-slate-400">1.5 – 8.0 SPM</td>
                <td className="py-2.5 px-3 text-cyan-300 font-bold">5.5 SPM</td>
                <td className="py-2.5 px-3 text-slate-400">Rod floating speed margin &gt; 18%</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-sky-400 font-bold">SRP Lift</td>
                <td className="py-2.5 px-3">Stroke Length</td>
                <td className="py-2.5 px-3 text-slate-400">86 – 144 in</td>
                <td className="py-2.5 px-3 text-white font-bold">120 in</td>
                <td className="py-2.5 px-3 text-slate-400">Surface unit geometry &amp; gearbox torque</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-sky-400 font-bold">Electrical</td>
                <td className="py-2.5 px-3">VFD Drive Frequency</td>
                <td className="py-2.5 px-3 text-slate-400">20.0 – 55.0 Hz</td>
                <td className="py-2.5 px-3 text-cyan-300 font-bold">42.5 Hz</td>
                <td className="py-2.5 px-3 text-slate-400">Motor thermal overload protection</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* OPERATIONAL MODES COMPARISON */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mode 1 */}
        <div className="p-5 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <CheckCircle className="w-4 h-4" />
            <h3 className="font-bold text-sm text-slate-100">Recommendation Mode (Human-in-the-Loop)</h3>
          </div>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Generates actionable setpoint guidance with Explainable AI (XAI) rationale. The field operator reviews predicted outcomes, confidence intervals, and signs off before manual dispatch.
          </p>
          <div className="p-3 rounded bg-[#0B1017] border border-[#1E2A3B] text-[11px] text-slate-300">
            <span className="text-cyan-400 font-bold">Sample Advisory:</span> &ldquo;Decrease SPM from 5.5 to 4.2. Near-wellbore temp has decayed to 64°C, raising viscosity to 5,200 cP. Rod floating risk elevated by 14%.&rdquo;
          </div>
        </div>

        {/* Mode 2 */}
        <div className="p-5 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-3">
          <div className="flex items-center gap-2 text-purple-400">
            <Sparkles className="w-4 h-4" />
            <h3 className="font-bold text-sm text-slate-100">Closed-Loop Autonomous Mode (SCADA-Integrated)</h3>
          </div>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Integrates directly with SCADA RTU registers. Continuously regulates VFD frequency and SPM within pre-approved engineering envelopes without human latency.
          </p>
          <div className="p-3 rounded bg-[#0B1017] border border-[#1E2A3B] text-[11px] text-slate-300">
            <span className="text-purple-400 font-bold">Safety Governors:</span> Max acceleration &le; 0.2 Hz/sec, automatic fallback to baseline on sensor anomalies or network disruption.
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
          <span>Test Optimization Controls on Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default OptimizationView;
