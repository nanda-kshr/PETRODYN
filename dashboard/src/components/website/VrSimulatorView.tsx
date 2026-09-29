'use client';

import React from 'react';
import {
  Glasses,
  Play,
  Flame,
  Zap,
  Activity,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Box,
  Sliders,
} from 'lucide-react';
import { SiteNavId } from '@/components/SiteNavbar';

interface VrSimulatorViewProps {
  onNavigate: (view: SiteNavId) => void;
}

export const VrSimulatorView: React.FC<VrSimulatorViewProps> = ({ onNavigate }) => {
  const drills = [
    {
      id: 'DRILL-01',
      title: 'Viscosity Spike & Rod-Floating Mitigation',
      severity: 'CRITICAL',
      color: 'rose',
      description:
        'Simulate sudden cooling from 110°C to 54°C in the fluid column. Heavy crude viscosity spikes to 11,200 cP, causing rod float on downstroke. Operator must modulate SPM and VFD frequency to prevent bridle slack.',
      recommendedAction: 'Reduce SPM from 5.5 to 2.8, increase stroke length to 144 in, verify rod compression margin > 15 kN.',
    },
    {
      id: 'DRILL-02',
      title: 'CSS Steam Breakthrough & Thermal Shock Drill',
      severity: 'HIGH',
      color: 'amber',
      description:
        'Simulate steam channeling through high-permeability thief zones during 300°C CSS injection. Casing temperature spikes rapidly, risking casing elongation and packer seal breach.',
      recommendedAction: 'Throttle steam injection rate by 35%, activate annulus nitrogen blanket, initiate temperature log survey.',
    },
    {
      id: 'DRILL-03',
      title: 'Severe Fluid Pound & Gas Interference',
      severity: 'MODERATE',
      color: 'purple',
      description:
        'Fluid level drops below pump intake, causing incomplete pump barrel fillage. Traveling valve slams into fluid surface on downstroke, generating severe shock waves through the rod string.',
      recommendedAction: 'Engage VFD dynamic speed control: slow downstroke velocity to 0.4 m/s, lower SPM to match inflow rate.',
    },
    {
      id: 'DRILL-04',
      title: 'Thermal Decay Production Plateau Optimization',
      severity: 'STANDARD',
      color: 'cyan',
      description:
        'Practice finding the economic cut-off point where declining production rate and rising SOR warrant terminating SRP pumping and commencing the next CSS steam injection cycle.',
      recommendedAction: 'Run multi-objective Pareto optimizer to evaluate net oil profit vs steam generation cost for next cycle.',
    },
  ];

  return (
    <div className="space-y-10 pb-16 max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 font-mono">
      {/* HEADER BANNER */}
      <div className="border-b border-[#1E2A3B] pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs">
          <Glasses className="w-3.5 h-3.5" />
          <span>Interactive WebXR &amp; Unity Digital Twin Sandbox</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          VR What-If Simulator &amp; Operator Training
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-3xl leading-relaxed">
          An interactive in-silico sandbox enabling petroleum engineers and field operators to run failure drills,
          test radical CSS steam injection parameters, and experience downhole mechanical dynamics in virtual reality.
        </p>
      </div>

      {/* 3D SANDBOX CAPABILITIES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-3">
          <div className="w-8 h-8 rounded bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Box className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-100">1:1 Kinematic Wellbore Rig</h2>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Full 3D visualization of the surface pumpjack unit, horsehead, polished rod, 1,150 m rod string, and bottomhole pump assembly with physical collision and fluid dynamics.
          </p>
        </div>

        <div className="p-5 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-3">
          <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-100">Live What-If Parameter Tweaker</h2>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Adjust SPM, stroke length, steam volume, and soak duration in real time to observe the instantaneous effect on the surface dynamometer card and rod-floating margin.
          </p>
        </div>

        <div className="p-5 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-3">
          <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-100">Operator Emergency Drill Mode</h2>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Timed training simulations designed to test operator reflexes against sudden fluid pound, parted rods, extreme thermal decay, and high casing pressure events.
          </p>
        </div>
      </div>

      {/* TRAINING DRILLS CATALOG */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Glasses className="w-4 h-4 text-purple-400" />
          <span>Field Operator Failure Response Training Drills</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drills.map((drill) => (
            <div key={drill.id} className="p-5 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold">{drill.id}</span>
                <span
                  className={`text-[9.5px] px-2 py-0.5 rounded border font-bold ${
                    drill.severity === 'CRITICAL'
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      : drill.severity === 'HIGH'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : drill.severity === 'MODERATE'
                      ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                      : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                  }`}
                >
                  {drill.severity}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-100">{drill.title}</h4>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">{drill.description}</p>
              <div className="p-3 rounded bg-[#0B1017] border border-[#1E2A3B] text-[11px] text-slate-300">
                <span className="text-cyan-400 font-bold">Standard Operating Procedure: </span>
                {drill.recommendedAction}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 px-5 py-2.5 rounded bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-mono text-xs transition cursor-pointer"
        >
          <span>Open Interactive Simulator Cockpit</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default VrSimulatorView;
