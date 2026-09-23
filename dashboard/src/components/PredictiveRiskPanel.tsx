'use client';

import React from 'react';
import { AlertOctagon, ShieldAlert, ArrowDownCircle, Anchor, ShieldCheck } from 'lucide-react';
import { PredictionsData } from '@/types/telemetry';
import { Tooltip } from './Tooltip';

interface PredictiveRiskPanelProps {
  predictions?: PredictionsData | null;
}

export const PredictiveRiskPanel: React.FC<PredictiveRiskPanelProps> = ({ predictions }) => {
  const floating = predictions?.rod_floating;
  const impact = predictions?.impact_loading;
  const rodFailure = predictions?.rod_failure;
  const unsetting = predictions?.pump_unsetting;

  const getRiskTheme = (prob?: number) => {
    if (prob === undefined || prob === null) {
      return {
        badge: 'text-slate-400 bg-[#111821] border-[#1E293B]',
        bar: 'bg-slate-700',
        text: 'text-slate-400',
      };
    }
    if (prob >= 0.65) {
      return {
        badge: 'text-rose-300 bg-rose-500/15 border-rose-500/40',
        bar: 'bg-rose-500',
        text: 'text-rose-400',
      };
    }
    if (prob >= 0.35) {
      return {
        badge: 'text-amber-300 bg-amber-500/15 border-amber-500/40',
        bar: 'bg-amber-500',
        text: 'text-amber-400',
      };
    }
    return {
      badge: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/40',
      bar: 'bg-emerald-500',
      text: 'text-emerald-400',
    };
  };

  return (
    <div className="bg-[#0D1219] border border-[#1E293B] rounded-lg p-4 flex flex-col justify-between relative overflow-hidden shadow-xl">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
            MULTI-HORIZON MECHANICAL RISK RADAR
          </h3>
          <Tooltip
            title="Multi-Horizon Predictive Risk"
            category="PREDICTION"
            content="Real-time multi-horizon failure prevention: downstroke rod floating (5–30 min horizon), fluid pound impact (1–15 min), seating unsetting (1–24 h), and cumulative Goodman fatigue (24h–30d)."
          />
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          INFERENCE ENGINE: NEURAL SURROGATE
        </span>
      </div>

      {/* 4 Multi-Horizon Risk Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-3">
        {/* 1. Rod Floating (5-30 min) */}
        {(() => {
          const theme = getRiskTheme(floating?.floating_probability);
          return (
            <div className="bg-[#111821] border border-[#1E293B] rounded p-3 flex flex-col justify-between space-y-2.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                    <ArrowDownCircle className="w-3.5 h-3.5 text-amber-400" /> ROD FLOATING
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${theme.badge}`}>
                    {floating?.floating_probability !== undefined ? `${(floating.floating_probability * 100).toFixed(0)}%` : '--'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
                  <span className="px-1 py-0.2 rounded bg-[#080B10] text-cyan-300 border border-[#1E293B]">5–30m HORIZON</span>
                  <span>&bull; UPD: 10s</span>
                </div>
              </div>

              <div className="w-full bg-[#080B10] h-1.5 rounded overflow-hidden border border-[#1E293B]">
                <div
                  style={{ width: `${(floating?.floating_probability ?? 0) * 100}%` }}
                  className={`h-full ${theme.bar} transition-all duration-500`}
                />
              </div>

              <div className="bg-[#080B10] border border-[#1E293B] rounded p-2 text-[10px] font-mono space-y-0.5">
                <p className="text-cyan-300 truncate">
                  {floating?.summary ?? 'Calibrating viscous drag...'}
                </p>
                <div className="text-slate-400 truncate">
                  REMEDY: <span className="text-slate-200">{floating?.recommended_remedy ?? '--'}</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 2. Impact Loading (1-15 min) */}
        {(() => {
          const theme = getRiskTheme(impact?.impact_probability);
          return (
            <div className="bg-[#111821] border border-[#1E293B] rounded p-3 flex flex-col justify-between space-y-2.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-400" /> IMPACT SHOCK
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${theme.badge}`}>
                    {impact?.impact_probability !== undefined ? `${(impact.impact_probability * 100).toFixed(0)}%` : '--'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
                  <span className="px-1 py-0.2 rounded bg-[#080B10] text-rose-300 border border-[#1E293B]">1–15m HORIZON</span>
                  <span>&bull; UPD: 5s</span>
                </div>
              </div>

              <div className="w-full bg-[#080B10] h-1.5 rounded overflow-hidden border border-[#1E293B]">
                <div
                  style={{ width: `${(impact?.impact_probability ?? 0) * 100}%` }}
                  className={`h-full ${theme.bar} transition-all duration-500`}
                />
              </div>

              <div className="bg-[#080B10] border border-[#1E293B] rounded p-2 text-[10px] font-mono space-y-0.5">
                <p className="text-rose-300 truncate">
                  {impact?.summary ?? (impact?.impact_severity ? impact.impact_severity.replace(/_/g, ' ') : 'Analyzing fluid pound...')}
                </p>
                <div className="text-slate-400 truncate">
                  SEVERITY: <span className="text-slate-200">{impact?.impact_severity ? impact.impact_severity.replace(/_/g, ' ') : '--'}</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 3. Rod String Fatigue (24h - 30 days) */}
        {(() => {
          const theme = getRiskTheme(rodFailure?.failure_probability);
          return (
            <div className="bg-[#111821] border border-[#1E293B] rounded p-3 flex flex-col justify-between space-y-2.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> ROD FATIGUE
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${theme.badge}`}>
                    {rodFailure?.failure_probability !== undefined ? `${(rodFailure.failure_probability * 100).toFixed(0)}%` : '--'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
                  <span className="px-1 py-0.2 rounded bg-[#080B10] text-cyan-300 border border-[#1E293B]">24H–30D HORIZON</span>
                  <span>&bull; UPD: 1H</span>
                </div>
              </div>

              <div className="w-full bg-[#080B10] h-1.5 rounded overflow-hidden border border-[#1E293B]">
                <div
                  style={{ width: `${(rodFailure?.failure_probability ?? 0) * 100}%` }}
                  className={`h-full ${theme.bar} transition-all duration-500`}
                />
              </div>

              <div className="bg-[#080B10] border border-[#1E293B] rounded p-2 text-[10px] font-mono space-y-0.5">
                <p className="text-cyan-300 truncate">
                  {rodFailure?.summary ?? (rodFailure?.fatigue_risk_level ? `Risk: ${rodFailure.fatigue_risk_level}` : 'Computing Goodman stress...')}
                </p>
                <div className="text-slate-400 truncate">
                  CYCLES REMAINING: <span className="text-slate-200">{rodFailure?.estimated_cycles_to_failure ? `~${(rodFailure.estimated_cycles_to_failure / 1000).toFixed(0)}k` : '--'}</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 4. Pump Unsetting (1-24h) */}
        {(() => {
          const theme = getRiskTheme(unsetting?.unsetting_probability);
          return (
            <div className="bg-[#111821] border border-[#1E293B] rounded p-3 flex flex-col justify-between space-y-2.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                    <Anchor className="w-3.5 h-3.5 text-purple-400" /> PUMP UNSETTING
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${theme.badge}`}>
                    {unsetting?.unsetting_probability !== undefined ? `${(unsetting.unsetting_probability * 100).toFixed(0)}%` : '--'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
                  <span className="px-1 py-0.2 rounded bg-[#080B10] text-purple-300 border border-[#1E293B]">1–24H HORIZON</span>
                  <span>&bull; UPD: 15M</span>
                </div>
              </div>

              <div className="w-full bg-[#080B10] h-1.5 rounded overflow-hidden border border-[#1E293B]">
                <div
                  style={{ width: `${(unsetting?.unsetting_probability ?? 0) * 100}%` }}
                  className={`h-full ${theme.bar} transition-all duration-500`}
                />
              </div>

              <div className="bg-[#080B10] border border-[#1E293B] rounded p-2 text-[10px] font-mono space-y-0.5">
                <p className="text-purple-300 truncate">
                  {unsetting?.summary ?? (unsetting?.status ? unsetting.status.replace(/_/g, ' ') : 'Monitoring hold-down...')}
                </p>
                <div className="text-slate-400 truncate">
                  ACTION: <span className="text-slate-200">{unsetting?.recommended_action ?? '--'}</span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span>SAFETY THRESHOLD: PROBABILITY &gt; 0.65 TRIGGERS AUTO-DECELERATION</span>
        <span>STATUS: ACTIVE MONITORING</span>
      </div>
    </div>
  );
};

export default PredictiveRiskPanel;
