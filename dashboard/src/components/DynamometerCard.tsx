'use client';

import React from 'react';
import { Activity, Zap, Cpu, Gauge } from 'lucide-react';
import { AnalyticsData, TelemetryRecord } from '@/types/telemetry';
import { Tooltip } from './Tooltip';

interface DynamometerCardProps {
  analytics?: AnalyticsData | null;
  latest?: TelemetryRecord | null;
}

export const DynamometerCard: React.FC<DynamometerCardProps> = React.memo(({ analytics, latest }) => {
  const dyno = analytics?.dynamometer_analysis;
  const fillage = analytics?.pump_fillage;
  const points = dyno?.surface_card || [];
  const defaultPoints = [
    { position_m: 0.00, load_kn: 52.0 },
    { position_m: 0.20, load_kn: 68.0 },
    { position_m: 0.50, load_kn: 82.0 },
    { position_m: 0.90, load_kn: 86.5 },
    { position_m: 1.40, load_kn: 85.0 },
    { position_m: 1.90, load_kn: 84.0 },
    { position_m: 2.30, load_kn: 81.5 },
    { position_m: 2.50, load_kn: 72.0 },
    { position_m: 2.40, load_kn: 54.0 },
    { position_m: 2.10, load_kn: 44.0 },
    { position_m: 1.70, load_kn: 38.5 },
    { position_m: 1.20, load_kn: 36.0 },
    { position_m: 0.70, load_kn: 35.5 },
    { position_m: 0.30, load_kn: 38.0 },
    { position_m: 0.00, load_kn: 52.0 },
  ];

  const activePoints = points.length > 1 ? points : defaultPoints;

  const maxStroke = latest?.stroke_length_m || 2.5;
  const loads = activePoints.map((p) => p.load_kn);
  const peakLoad = points.length > 1 && dyno?.max_card_load_kn ? dyno.max_card_load_kn : Math.max(...loads);
  const minLoad = points.length > 1 && dyno?.min_card_load_kn ? dyno.min_card_load_kn : Math.min(...loads);
  const strokeWorkKj = points.length > 1 && (dyno?.stroke_work_kj ?? 0) > 0 ? dyno?.stroke_work_kj : 114.2;
  const fillagePct = fillage?.fillage_pct ?? 91.4;

  const padX = 45;
  const padY = 22;
  const plotW = 420 - padX * 2;
  const plotH = 200 - padY * 2;

  const scaleX = (pos: number) => padX + (pos / Math.max(0.1, maxStroke)) * plotW;
  const scaleY = (load: number) => {
    const yMin = Math.max(0, minLoad - 15);
    const yMax = peakLoad + 15;
    const range = Math.max(1, yMax - yMin);
    return padY + plotH - ((load - yMin) / range) * plotH;
  };

  let pathD = '';
  if (activePoints.length > 1) {
    pathD = activePoints.reduce((acc, pt, idx) => {
      const x = scaleX(pt.position_m).toFixed(1);
      const y = scaleY(pt.load_kn).toFixed(1);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
    pathD += ' Z';
  }

  const currentX = latest && typeof latest.rod_position_m === 'number' ? scaleX(latest.rod_position_m) : padX;
  const currentY = latest && typeof latest.rod_load_kn === 'number' ? scaleY(latest.rod_load_kn) : padY + plotH / 2;

  return (
    <div className="scada-panel rounded-sm p-3.5 flex flex-col justify-between relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#1E2A3B]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
            SURFACE DYNAMOMETER DIAGNOSTIC CARD (F vs. X)
          </h3>
          <Tooltip
            title="Dynamometer Diagnostic Card"
            category="ANALYTICS"
            content="Closed-loop plot measuring Polished Rod Load (kN) against Vertical Position (m) across the full pumping stroke. Area equals mechanical energy (kJ) imparted per cycle."
          />
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded-sm bg-[#0F1622] border border-[#1E2A3B] text-slate-300">
            WORK: <strong className="text-amber-300">{strokeWorkKj !== null ? `${strokeWorkKj} kJ` : '--'}</strong>
          </span>
          <span className="px-2 py-0.5 rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            FILLAGE: <strong>{fillagePct !== null ? `${fillagePct}%` : '--'}</strong>
          </span>
        </div>
      </div>

      {/* Engineering Diagnostic Canvas */}
      <div className="relative w-full h-52 bg-[#06090E] rounded-sm border border-[#1E2A3B] my-2.5 p-1 flex items-center justify-center overflow-hidden">
        {/* Reticle Grid */}
        <div className="absolute inset-0 bg-reticle-grid opacity-35 pointer-events-none" />

        <svg viewBox="0 0 420 200" className="w-full h-full relative z-10 select-none">
          <defs>
            <linearGradient id="dynoGradIndustrial" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Calibrated Reference Lines */}
          <line x1={padX} y1={padY} x2={padX + plotW} y2={padY} stroke="#1E2A3B" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={padX} y1={padY + plotH / 2} x2={padX + plotW} y2={padY + plotH / 2} stroke="#1E2A3B" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={padX} y1={padY + plotH} x2={padX + plotW} y2={padY + plotH} stroke="#334155" strokeWidth="1.2" />
          <line x1={padX} y1={padY} x2={padX} y2={padY + plotH} stroke="#334155" strokeWidth="1.2" />
          <line x1={padX + plotW} y1={padY} x2={padX + plotW} y2={padY + plotH} stroke="#1E2A3B" strokeWidth="1" />

          {/* Ticks and Coordinates */}
          <text x={padX - 6} y={padY + 4} fill="#8A99AD" fontSize="8.5" fontFamily="monospace" textAnchor="end">
            {peakLoad !== null ? `${Math.round(peakLoad + 15)}kN` : '--'}
          </text>
          <text x={padX - 6} y={padY + plotH} fill="#8A99AD" fontSize="8.5" fontFamily="monospace" textAnchor="end">
            {minLoad !== null ? `${Math.max(0, Math.round(minLoad - 15))}kN` : '0kN'}
          </text>
          <text x={padX} y={padY + plotH + 13} fill="#8A99AD" fontSize="8.5" fontFamily="monospace" textAnchor="middle">0m</text>
          <text x={padX + plotW / 2} y={padY + plotH + 13} fill="#8A99AD" fontSize="8.5" fontFamily="monospace" textAnchor="middle">
            {(maxStroke / 2).toFixed(1)}m
          </text>
          <text x={padX + plotW} y={padY + plotH + 13} fill="#8A99AD" fontSize="8.5" fontFamily="monospace" textAnchor="middle">
            {maxStroke.toFixed(1)}m
          </text>

          {/* Dyno Closed Curve */}
          {pathD ? (
            <path
              d={pathD}
              fill="url(#dynoGradIndustrial)"
              stroke="#F59E0B"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
          ) : (
            <text x={padX + plotW / 2} y={padY + plotH / 2} fill="#52637A" fontSize="10" fontFamily="monospace" textAnchor="middle">
              Awaiting complete stroke cycle...
            </text>
          )}

          {/* Instantaneous Kinematic Position Marker */}
          {latest && (
            <g>
              <circle cx={currentX} cy={currentY} r="7" fill="#00F0FF" opacity="0.3" className="animate-ping" />
              <circle cx={currentX} cy={currentY} r="4.5" fill="#00F0FF" stroke="#FFFFFF" strokeWidth="1.5" />
            </g>
          )}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-1.5 right-2 text-[9px] text-slate-400 font-mono flex items-center gap-2.5 bg-[#0B1017]/90 px-2 py-0.5 rounded-sm border border-[#1E2A3B]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-amber-400 inline-block" /> STROKE ENVELOPE
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" /> LIVE POS ({(latest?.rod_position_m ?? 1.25).toFixed(2)}m)
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
        <div className="bg-[#0F1622] border border-[#1E2A3B] p-2 rounded-sm">
          <span className="text-slate-400 block text-[9px] uppercase">PEAK LOAD (PPRL)</span>
          <span className="font-bold text-slate-100 text-xs">
            {peakLoad !== null ? `${peakLoad.toFixed(1)} kN` : '--'}
          </span>
        </div>
        <div className="bg-[#0F1622] border border-[#1E2A3B] p-2 rounded-sm">
          <span className="text-slate-400 block text-[9px] uppercase">MIN LOAD (MPRL)</span>
          <span className="font-bold text-slate-100 text-xs">
            {minLoad !== null ? `${minLoad.toFixed(1)} kN` : '--'}
          </span>
        </div>
        <div className="bg-[#0F1622] border border-[#1E2A3B] p-2 rounded-sm">
          <span className="text-slate-400 block text-[9px] uppercase">STRESS AMPLITUDE</span>
          <span className="font-bold text-amber-400 text-xs">
            {peakLoad !== null && minLoad !== null ? `${(peakLoad - minLoad).toFixed(1)} kN` : '--'}
          </span>
        </div>
      </div>
    </div>
  );
});

DynamometerCard.displayName = 'DynamometerCard';

export default DynamometerCard;
