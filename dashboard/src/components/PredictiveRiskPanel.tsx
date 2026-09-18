'use client';

import React from 'react';
import { AlertOctagon, ShieldAlert, ArrowDownCircle, Anchor } from 'lucide-react';
import { PredictionsData } from '@/types/telemetry';

interface PredictiveRiskPanelProps {
  predictions?: PredictionsData | null;
}

export const PredictiveRiskPanel: React.FC<PredictiveRiskPanelProps> = ({ predictions }) => {
  const floating = predictions?.rod_floating ?? {
    floating_probability: 0.28,
    status: 'NORMAL_FREE_FALL',
    trigger_cause: 'Nominal',
    recommended_remedy: 'None',
  };

  const impact = predictions?.impact_loading ?? {
    impact_probability: 0.31,
    impact_severity: 'MINIMAL_SMOOTH_REVERSAL',
    description: 'Smooth rod reversal with negligible impact shock.',
  };

  const rodFailure = predictions?.rod_failure ?? {
    failure_probability: 0.18,
    fatigue_risk_level: 'ACCEPTABLE',
    estimated_cycles_to_failure: 850000,
    primary_threat_vector: 'TENSILE_OVERLOAD',
  };

  const unsetting = predictions?.pump_unsetting ?? {
    unsetting_probability: 0.15,
    status: 'SEATED_SECURE',
    recommended_action: 'Routine inspection',
  };

  const getRiskColor = (prob: number) => {
    if (prob >= 0.65) return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    if (prob >= 0.35) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          Predictive Mechanical Risk Guard
        </h3>
        <span className="text-[10px] text-slate-400 font-mono">AI REAL-TIME INFERENCE</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Rod Floating */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <ArrowDownCircle className="w-3.5 h-3.5 text-amber-400" /> Rod Floating Risk
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${getRiskColor(floating.floating_probability)}`}>
              {(floating.floating_probability * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden my-2.5">
            <div
              className={`h-full transition-all ${
                floating.floating_probability > 0.6 ? 'bg-rose-500' : floating.floating_probability > 0.3 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${floating.floating_probability * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-300 font-medium truncate">{floating.status.replace(/_/g, ' ')}</p>
          <span className="text-[10px] text-slate-500 block mt-1 truncate">Action: {floating.recommended_remedy}</span>
        </div>

        {/* 2. Impact Loading */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" /> Impact Loading
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${getRiskColor(impact.impact_probability)}`}>
              {(impact.impact_probability * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden my-2.5">
            <div
              className={`h-full transition-all ${
                impact.impact_probability > 0.6 ? 'bg-rose-500' : impact.impact_probability > 0.3 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${impact.impact_probability * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-300 font-medium truncate">{impact.impact_severity.replace(/_/g, ' ')}</p>
          <span className="text-[10px] text-slate-500 block mt-1 truncate">{impact.description}</span>
        </div>

        {/* 3. Rod Fatigue Failure */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-sky-400" /> Rod String Fatigue
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${getRiskColor(rodFailure.failure_probability)}`}>
              {(rodFailure.failure_probability * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden my-2.5">
            <div
              className={`h-full transition-all ${
                rodFailure.failure_probability > 0.6 ? 'bg-rose-500' : rodFailure.failure_probability > 0.3 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${rodFailure.failure_probability * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-300 font-medium truncate">Level: {rodFailure.fatigue_risk_level}</p>
          <span className="text-[10px] text-slate-500 block mt-1 truncate">
            Remaining: ~{(rodFailure.estimated_cycles_to_failure / 1000).toFixed(0)}k cycles
          </span>
        </div>

        {/* 4. Pump Unsetting Risk */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Anchor className="w-3.5 h-3.5 text-purple-400" /> Pump Unsetting
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${getRiskColor(unsetting.unsetting_probability)}`}>
              {(unsetting.unsetting_probability * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden my-2.5">
            <div
              className={`h-full transition-all ${
                unsetting.unsetting_probability > 0.6 ? 'bg-rose-500' : unsetting.unsetting_probability > 0.3 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${unsetting.unsetting_probability * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-300 font-medium truncate">{unsetting.status.replace(/_/g, ' ')}</p>
          <span className="text-[10px] text-slate-500 block mt-1 truncate">Action: {unsetting.recommended_action}</span>
        </div>
      </div>
    </div>
  );
};
