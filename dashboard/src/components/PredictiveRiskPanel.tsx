'use client';

import React from 'react';
import { AlertOctagon, ShieldAlert, ArrowDownCircle, Anchor } from 'lucide-react';
import { PredictionsData } from '@/types/telemetry';
import { Tooltip } from './Tooltip';

interface PredictiveRiskPanelProps {
  predictions?: PredictionsData | null;
}

export const PredictiveRiskPanel: React.FC<PredictiveRiskPanelProps> = ({ predictions }) => {
  const floating = predictions?.rod_floating ?? {
    floating_probability: 0.28,
    risk_next_10min_pct: 28,
    status: 'NORMAL_FREE_FALL',
    summary: 'Rod-floating risk in next 10 min = 28%',
    recommended_remedy: 'None',
  };

  const impact = predictions?.impact_loading ?? {
    impact_probability: 0.31,
    impact_severity: 'MINIMAL_SMOOTH_REVERSAL',
    summary: 'Smooth turnaround expected within next 15 min',
  };

  const rodFailure = predictions?.rod_failure ?? {
    failure_probability: 0.18,
    failure_risk_7d_pct: 3.2,
    fatigue_risk_level: 'ACCEPTABLE',
    estimated_cycles_to_failure: 850000,
    summary: 'Failure risk in next 7 days = 3.2%',
  };

  const unsetting = predictions?.pump_unsetting ?? {
    unsetting_probability: 0.15,
    unsetting_risk_6h_pct: 9.8,
    status: 'SEATED_SECURE',
    summary: 'Unsetting risk in next 6 h = 9.8%',
    recommended_action: 'Routine inspection',
  };

  const getRiskColor = (prob: number) => {
    if (prob >= 0.65) return 'text-rose-700 bg-rose-50 border-rose-200';
    if (prob >= 0.35) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
      {/* Category Indicator Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-purple-50 border border-purple-200 text-purple-600 tracking-wider">
            PREDICTION &bull; TACTICAL &amp; SHIFT RISK
          </span>
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-purple-600" />
            Predictive Mechanical Failure Guard
          </h3>
          <Tooltip
            title="Mechanical Failure Risk Guard"
            category="PREDICTION"
            content="AI models calibrated for tactical operational horizons: 5–30 min for downstroke drag/floating, 1–15 min for impact pound, 1–24 h for seating unsetting, and 24h–30d for cumulative rod fatigue."
          />
        </div>
        <span className="text-[10px] text-gray-500 font-mono">MULTI-HORIZON RISK INFERENCE</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Rod Floating (5-30 min) */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-700 font-medium flex items-center gap-1.5">
                <ArrowDownCircle className="w-4 h-4 text-amber-600" /> Rod Floating
                <Tooltip
                  title="Rod Floating Risk (Next 5–30 min)"
                  category="PREDICTION"
                  content="Forecasts downstroke viscous drag exceeding buoyant rod weight within the next 5–30 minutes. Updated every 10–30 sec to allow immediate VFD deceleration."
                />
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${getRiskColor(floating.floating_probability)}`}>
                {(floating.floating_probability * 100).toFixed(0)}% Risk
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
              <span className="px-1.5 py-0.5 rounded bg-gray-100 text-purple-700">Next 5–30 min</span>
              <span>&bull; Upd: 10–30s</span>
            </div>
          </div>

          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden my-1">
            <div
              className={`h-full transition-all duration-500 ${
                floating.floating_probability > 0.6 ? 'bg-rose-500' : floating.floating_probability > 0.3 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${floating.floating_probability * 100}%` }}
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-2.5 space-y-1">
            <p className="text-[11px] text-purple-700 font-mono font-medium">
              {floating.summary ?? `Risk in 10 min = ${(floating.floating_probability * 100).toFixed(0)}%`}
            </p>
            <span className="text-[10px] text-gray-500 block truncate">Remedy: {floating.recommended_remedy}</span>
          </div>
        </div>

        {/* 2. Impact Loading (1-15 min) */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-700 font-medium flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-600" /> Impact Loading
                <Tooltip
                  title="Impact Shock Severity (Next 1–15 min)"
                  category="PREDICTION"
                  content="Evaluates turnaround fluid pound and horsehead impact shocks over the next 1–15 min. Updated every 5–10 sec."
                />
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${getRiskColor(impact.impact_probability)}`}>
                {(impact.impact_probability * 100).toFixed(0)}% Shock
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
              <span className="px-1.5 py-0.5 rounded bg-gray-100 text-rose-700">Next 1–15 min</span>
              <span>&bull; Upd: 5–10s</span>
            </div>
          </div>

          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden my-1">
            <div
              className={`h-full transition-all duration-500 ${
                impact.impact_probability > 0.6 ? 'bg-rose-500' : impact.impact_probability > 0.3 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${impact.impact_probability * 100}%` }}
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-2.5 space-y-1">
            <p className="text-[11px] text-rose-700 font-mono font-medium">
              {impact.summary ?? impact.impact_severity.replace(/_/g, ' ')}
            </p>
            <span className="text-[10px] text-gray-500 block truncate">Status: {impact.impact_severity.replace(/_/g, ' ')}</span>
          </div>
        </div>

        {/* 3. Rod Fatigue Failure (24h - 30 days) */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-700 font-medium flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-sky-600" /> Rod String Fatigue
                <Tooltip
                  title="Rod Failure Risk (Next 24 h – 30 days)"
                  category="PREDICTION"
                  content="Goodman cyclic stress endurance evaluation. Updated every 1–6 hours for preventative replacement scheduling."
                />
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${getRiskColor(rodFailure.failure_probability)}`}>
                {(rodFailure.failure_probability * 100).toFixed(0)}% Fatigue
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
              <span className="px-1.5 py-0.5 rounded bg-gray-100 text-sky-700">Next 24h–30d</span>
              <span>&bull; Upd: 1–6h</span>
            </div>
          </div>

          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden my-1">
            <div
              className={`h-full transition-all duration-500 ${
                rodFailure.failure_probability > 0.6 ? 'bg-rose-500' : rodFailure.failure_probability > 0.3 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${rodFailure.failure_probability * 100}%` }}
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-2.5 space-y-1">
            <p className="text-[11px] text-sky-700 font-mono font-medium">
              {rodFailure.summary ?? `Level: ${rodFailure.fatigue_risk_level}`}
            </p>
            <span className="text-[10px] text-gray-500 block truncate">
              Cycles remaining: ~{(rodFailure.estimated_cycles_to_failure / 1000).toFixed(0)}k
            </span>
          </div>
        </div>

        {/* 4. Pump Unsetting Risk (1-24h) */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-700 font-medium flex items-center gap-1.5">
                <Anchor className="w-4 h-4 text-purple-600" /> Pump Unsetting
                <Tooltip
                  title="Pump Unsetting Probability (Next 1–24 h)"
                  category="PREDICTION"
                  content="Mechanical hold-down unseating probability caused by upward drag and pressure differentials. Updated every 5–15 min."
                />
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${getRiskColor(unsetting.unsetting_probability)}`}>
                {(unsetting.unsetting_probability * 100).toFixed(0)}% Hold
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
              <span className="px-1.5 py-0.5 rounded bg-gray-100 text-indigo-700">Next 1–24 h</span>
              <span>&bull; Upd: 5–15m</span>
            </div>
          </div>

          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden my-1">
            <div
              className={`h-full transition-all duration-500 ${
                unsetting.unsetting_probability > 0.6 ? 'bg-rose-500' : unsetting.unsetting_probability > 0.3 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${unsetting.unsetting_probability * 100}%` }}
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-2.5 space-y-1">
            <p className="text-[11px] text-indigo-700 font-mono font-medium">
              {unsetting.summary ?? unsetting.status.replace(/_/g, ' ')}
            </p>
            <span className="text-[10px] text-gray-500 block truncate">Action: {unsetting.recommended_action}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
