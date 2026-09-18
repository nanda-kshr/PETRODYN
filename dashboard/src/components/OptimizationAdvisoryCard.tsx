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

  // Split into Surface Machinery vs CSS Thermal Strategy
  const surfaceItems = advisoryList.slice(0, 4);
  const thermalItems = advisoryList.slice(4);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative overflow-hidden space-y-4">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />

      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-amber-50 border border-amber-200 text-amber-600 tracking-wider">
            CONTROL &bull; DECISION CADENCE
          </span>
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-amber-600" />
            Field Optimization &amp; Recommended Decision Intervals
          </h3>
          <Tooltip
            title="Optimization Decision Intervals"
            category="CONTROL"
            content="Specifies recommended operator/automation decision cadence: tactical parameters (SPM, VFD) adjust every 5–15 min, operational parameters (Stroke, Cut-off) adjust every 1–6 h, and CSS thermal parameters adjust continuously or per cycle."
          />
        </div>
        <span className="text-[10px] text-gray-500 font-mono">AUTOMATED ADVISORY ENGINE</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
        {/* Group 1: Surface Machinery & Pumping Controls */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
              ⚙️ Surface Machinery &amp; Lift Controls
            </span>
            <span className="text-[10px] text-gray-400 font-mono">SHIFT / TACTICAL</span>
          </div>

          <div className="space-y-2.5">
            {surfaceItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-lg p-3 space-y-1.5 hover:border-gray-300 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-gray-800 text-xs">{item.parameter}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-gray-500">
                      Now: <strong className="text-gray-800">{item.current_setting}</strong>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-amber-50 border border-amber-200 text-amber-700 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {item.decision_interval}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-1.5 pt-1 text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-600" />
                  <span className="font-medium text-[11px]">{item.recommended_action}</span>
                </div>

                <p className="text-[11px] text-gray-500 pl-5 italic">
                  {item.rationale}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Group 2: CSS Thermal & Reservoir Cycle Strategy */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <span className="text-xs font-bold text-orange-600 flex items-center gap-1.5">
              🔥 CSS Thermal &amp; Reservoir Cycle Optimization
            </span>
            <span className="text-[10px] text-gray-400 font-mono">CYCLE / STRATEGIC</span>
          </div>

          <div className="space-y-2.5">
            {thermalItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-lg p-3 space-y-1.5 hover:border-gray-300 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-gray-800 text-xs">{item.parameter}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-gray-500">
                      Now: <strong className="text-gray-800">{item.current_setting}</strong>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-orange-50 border border-orange-200 text-orange-700 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {item.decision_interval}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-1.5 pt-1 text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-600" />
                  <span className="font-medium text-[11px]">{item.recommended_action}</span>
                </div>

                <p className="text-[11px] text-gray-500 pl-5 italic">
                  {item.rationale}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
