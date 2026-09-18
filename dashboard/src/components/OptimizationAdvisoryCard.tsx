'use client';

import React from 'react';
import { Sliders, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { OptimizationAdvisoryItem } from '@/types/telemetry';
import { Tooltip } from './Tooltip';

interface OptimizationAdvisoryCardProps {
  items?: OptimizationAdvisoryItem[];
}

const defaultItems: OptimizationAdvisoryItem[] = [
  {
    parameter: 'SPM (Pumping Speed)',
    decision_interval: 'Every 5–15 min',
    current_setting: '5.5 SPM',
    recommended_action: 'Maintain 5.2–5.5 SPM',
    rationale: 'Avoid downstroke floating while keeping fluid velocity above stalling point',
  },
  {
    parameter: 'VFD Frequency',
    decision_interval: 'Every 5–15 min',
    current_setting: '40.0 Hz',
    recommended_action: 'Trim down if float >50%',
    rationale: 'VFD enables instant slowing of downstroke to allow buoyant rod fall',
  },
  {
    parameter: 'Stroke Length',
    decision_interval: 'Every 1–6 h',
    current_setting: '2.5 m',
    recommended_action: 'Maintain long stroke (2.5m)',
    rationale: 'Long stroke reduces cycle frequency and minimizes cyclic impact reversals',
  },
  {
    parameter: 'Production Cut-off',
    decision_interval: 'Every 1–6 h',
    current_setting: 'Active Lift (30 BOPD)',
    recommended_action: 'Continue production phase',
    rationale: 'Well is above the economic cutoff limit of 10 BOPD',
  },
  {
    parameter: 'Steam Injection Pressure',
    decision_interval: 'Every 5–30 min (CSS)',
    current_setting: 'Cycle 4 Standby',
    recommended_action: 'Target 85–110 bar in cycle',
    rationale: 'Avoid formation fracture in shallow Jodhpur Sandstone (~1,150 m)',
  },
  {
    parameter: 'Steam Volume / Rate',
    decision_interval: 'Continuously / 5–30 min',
    current_setting: 'Standby',
    recommended_action: 'Allocate 2,500 m³ CWE',
    rationale: 'Maximizes thermal penetration radius to lower viscosity under 1,500 cP',
  },
  {
    parameter: 'Soak Time',
    decision_interval: 'Per CSS cycle',
    current_setting: 'Completed (5 days)',
    recommended_action: '5–7 days soak recommended',
    rationale: 'Allows uniform heat transfer into heavy crude before initial flowback',
  },
  {
    parameter: 'Overall CSS Strategy',
    decision_interval: 'Per cycle / before next',
    current_setting: 'Lift Phase (Day 18)',
    recommended_action: 'Plan Cycle 5 re-steam @ <55°C',
    rationale: 'Re-stimulate when cooling drives oil viscosity above 15,000 cP threshold',
  },
];

export const OptimizationAdvisoryCard: React.FC<OptimizationAdvisoryCardProps> = ({ items = defaultItems }) => {
  const advisoryList = items && items.length > 0 ? items : defaultItems;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-amber-950/80 border border-amber-800 text-amber-400 tracking-wider">
            CONTROL &bull; DECISION INTERVALS
          </span>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-amber-400" />
            Field Optimization &amp; Decision Cadence
          </h3>
          <Tooltip
            title="Optimization Decision Intervals"
            category="CONTROL"
            content="Specifies recommended operator/automation decision cadence: tactical parameters (SPM, VFD) adjust every 5–15 min, operational parameters (Stroke, Cut-off) adjust every 1–6 h, and CSS thermal parameters adjust continuously or per cycle."
          />
        </div>
        <span className="text-[10px] text-slate-400 font-mono">AUTOMATED ADVISORY ENGINE</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {advisoryList.map((item, idx) => (
          <div
            key={idx}
            className="bg-slate-950/70 border border-slate-800/80 hover:border-slate-700/80 rounded-lg p-3 flex flex-col justify-between transition"
          >
            <div>
              <div className="flex items-start justify-between gap-1 mb-1.5">
                <span className="text-xs font-semibold text-slate-200 truncate">{item.parameter}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-amber-500/10 border border-amber-500/20 text-amber-400 whitespace-nowrap flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {item.decision_interval}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] mb-2 font-mono">
                <span className="text-slate-500">Current:</span>
                <span className="text-slate-300 font-medium">{item.current_setting}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/70 space-y-1">
              <div className="flex items-start gap-1 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-400" />
                <span className="line-clamp-2">{item.recommended_action}</span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-2 italic pt-0.5 pl-4">
                {item.rationale}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
