'use client';

import React from 'react';
import { Sliders, Clock, CheckCircle2, Cpu, ArrowRight } from 'lucide-react';
import { OptimizationAdvisoryItem } from '@/types/telemetry';
import { Tooltip } from './Tooltip';

interface OptimizationAdvisoryCardProps {
  items?: OptimizationAdvisoryItem[];
}

export const OptimizationAdvisoryCard: React.FC<OptimizationAdvisoryCardProps> = ({ items }) => {
  const advisoryList = items || [];
  const hasItems = advisoryList.length > 0;

  const surfaceItems = advisoryList.slice(0, 4);
  const thermalItems = advisoryList.slice(4);

  return (
    <div className="scada-panel rounded-sm p-3.5 space-y-3 relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#1E2A3B]">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
            AUTONOMOUS CLOSED-LOOP OPTIMIZATION &amp; ADVISORY
          </h3>
          <Tooltip
            title="Closed-Loop Optimization Advisory"
            category="CONTROL"
            content="Real-time multi-variable setpoint advisory engine. Generates continuous operational setpoints for surface machinery (VFD, SPM, Stroke) and downhole CSS thermal management with prescribed decision intervals."
          />
        </div>
        <span className="text-[9.5px] font-mono text-slate-400">
          ALGORITHM: SURROGATE PINN + MULTI-OBJECTIVE PARETO
        </span>
      </div>

      {hasItems ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 text-xs font-mono">
          {/* Surface Machinery Domain */}
          <div className="bg-[#0F1622] border border-[#1E2A3B] rounded-sm p-3 space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#1E2A3B] pb-2">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" /> SURFACE MACHINERY &amp; LIFT SETPOINTS
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-[#070A0F] text-cyan-300 border border-[#1E2A3B]">
                TACTICAL CADENCE
              </span>
            </div>

            <div className="space-y-2">
              {surfaceItems.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#070A0F] border border-[#1E2A3B] rounded-sm p-2.5 space-y-1 hover:border-[#2A3B52] transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-100 text-xs">{item.parameter}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">
                        NOW: <strong className="text-slate-200">{item.current_setting}</strong>
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-[#0F1622] border border-[#1E2A3B] text-amber-300 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {item.decision_interval}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5 text-emerald-400 text-[10.5px] font-semibold pt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{item.recommended_action}</span>
                  </div>

                  <p className="text-[9.5px] text-slate-400 pl-5 italic">
                    {item.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Thermal Strategy Domain */}
          <div className="bg-[#0F1622] border border-[#1E2A3B] rounded-sm p-3 space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#1E2A3B] pb-2">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-rose-400" /> CSS THERMAL &amp; RESERVOIR STRATEGY
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-[#070A0F] text-rose-300 border border-[#1E2A3B]">
                CYCLE CADENCE
              </span>
            </div>

            <div className="space-y-2">
              {thermalItems.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#070A0F] border border-[#1E2A3B] rounded-sm p-2.5 space-y-1 hover:border-[#2A3B52] transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-100 text-xs">{item.parameter}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">
                        NOW: <strong className="text-slate-200">{item.current_setting}</strong>
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-[#0F1622] border border-[#1E2A3B] text-rose-300 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {item.decision_interval}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5 text-emerald-400 text-[10.5px] font-semibold pt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{item.recommended_action}</span>
                  </div>

                  <p className="text-[9.5px] text-slate-400 pl-5 italic">
                    {item.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#0F1622] border border-[#1E2A3B] rounded-sm p-6 text-center text-xs text-slate-500 font-mono">
          Awaiting multi-objective advisory engine evaluation...
        </div>
      )}

      {/* Footer */}
      <div className="pt-2 border-t border-[#1E2A3B] flex items-center justify-between text-[9.5px] font-mono text-slate-400">
        <span>AUTO-ADVISORY: CLOSED-LOOP COMPLIANT</span>
        <span>SETPOINT SAFETY ENVELOPES: ENFORCED</span>
      </div>
    </div>
  );
};

export default OptimizationAdvisoryCard;
