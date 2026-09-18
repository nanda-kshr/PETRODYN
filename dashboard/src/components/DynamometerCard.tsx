'use client';

import React from 'react';
import { Activity, Layers } from 'lucide-react';
import { AnalyticsData, TelemetryRecord } from '@/types/telemetry';

interface DynamometerCardProps {
  analytics?: AnalyticsData | null;
  latest?: TelemetryRecord | null;
}

export const DynamometerCard: React.FC<DynamometerCardProps> = ({ analytics, latest }) => {
  const dyno = analytics?.dynamometer_analysis;
  const fillage = analytics?.pump_fillage;
  const points = dyno?.surface_card || [];

  const maxStroke = latest?.stroke_length_m || 2.5;
  const peakLoad = dyno?.max_card_load_kn || 120.0;
  const minLoad = dyno?.min_card_load_kn || 40.0;
  const strokeWorkKj = dyno?.stroke_work_kj || 32.5;
  const fillagePct = fillage?.fillage_pct ?? 85.0;

  // Viewbox coordinates for SVG plot (400 x 220)
  const padX = 45;
  const padY = 25;
  const plotW = 400 - padX * 2;
  const plotH = 220 - padY * 2;

  // Scale functions
  const scaleX = (pos: number) => padX + (pos / Math.max(0.1, maxStroke)) * plotW;
  const scaleY = (load: number) => {
    const yMin = Math.max(0, minLoad - 15);
    const yMax = peakLoad + 15;
    return padY + plotH - ((load - yMin) / Math.max(1, yMax - yMin)) * plotH;
  };

  // Build SVG path
  let pathD = '';
  if (points.length > 1) {
    pathD = points.reduce((acc, pt, idx) => {
      const x = scaleX(pt.position_m);
      const y = scaleY(pt.load_kn);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }

  // Current position indicator
  const currentX = latest ? scaleX(latest.rod_position_m) : padX;
  const currentY = latest ? scaleY(latest.rod_load_kn) : padY + plotH / 2;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          Surface Dynamometer Card
        </h3>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
            Work: {strokeWorkKj} kJ
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-mono">
            Fillage: {fillagePct}%
          </span>
        </div>
      </div>

      {/* SVG Dynamometer Plot */}
      <div className="relative w-full h-56 bg-slate-950/90 rounded-lg border border-slate-800/80 p-2 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 400 220" className="w-full h-full">
          {/* Grid lines */}
          <line x1={padX} y1={padY} x2={padX + plotW} y2={padY} stroke="#1e293b" strokeDasharray="3 3" />
          <line x1={padX} y1={padY + plotH / 2} x2={padX + plotW} y2={padY + plotH / 2} stroke="#1e293b" strokeDasharray="3 3" />
          <line x1={padX} y1={padY + plotH} x2={padX + plotW} y2={padY + plotH} stroke="#334155" />
          <line x1={padX} y1={padY} x2={padX} y2={padY + plotH} stroke="#334155" />
          <line x1={padX + plotW / 2} y1={padY} x2={padX + plotW / 2} y2={padY + plotH} stroke="#1e293b" strokeDasharray="3 3" />
          <line x1={padX + plotW} y1={padY} x2={padX + plotW} y2={padY + plotH} stroke="#334155" />

          {/* Axis Labels */}
          <text x={padX - 8} y={padY + 4} fill="#64748b" fontSize="9" textAnchor="end">{Math.round(peakLoad + 15)}kN</text>
          <text x={padX - 8} y={padY + plotH} fill="#64748b" fontSize="9" textAnchor="end">{Math.max(0, Math.round(minLoad - 15))}kN</text>
          <text x={padX} y={padY + plotH + 14} fill="#64748b" fontSize="9" textAnchor="middle">0m</text>
          <text x={padX + plotW / 2} y={padY + plotH + 14} fill="#64748b" fontSize="9" textAnchor="middle">{(maxStroke / 2).toFixed(1)}m</text>
          <text x={padX + plotW} y={padY + plotH + 14} fill="#64748b" fontSize="9" textAnchor="middle">{maxStroke.toFixed(1)}m</text>

          {/* Card Trajectory Path */}
          {pathD && (
            <path
              d={pathD}
              fill="rgba(245, 158, 11, 0.08)"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          )}

          {/* Live operating point marker */}
          {latest && (
            <g>
              <circle cx={currentX} cy={currentY} r="5" fill="#38bdf8" className="animate-ping opacity-75" />
              <circle cx={currentX} cy={currentY} r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
            </g>
          )}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-2 right-3 text-[10px] text-slate-400 flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-amber-400 inline-block" /> Stroke Envelope
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" /> Live Head
          </span>
        </div>
      </div>

      {/* Dyno metrics footer */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
        <div>
          <span className="text-slate-500 block text-[10px]">PEAK LOAD (PPRL)</span>
          <span className="font-mono font-semibold text-slate-200">{peakLoad.toFixed(1)} kN</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">MIN LOAD (MPRL)</span>
          <span className="font-mono font-semibold text-slate-200">{minLoad.toFixed(1)} kN</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">LOAD RANGE</span>
          <span className="font-mono font-semibold text-amber-400">{(peakLoad - minLoad).toFixed(1)} kN</span>
        </div>
      </div>
    </div>
  );
};
