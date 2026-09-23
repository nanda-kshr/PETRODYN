'use client';

import React from 'react';
import { Activity, Zap, Cpu, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnalyticsData, TelemetryRecord } from '@/types/telemetry';
import { Tooltip } from './Tooltip';

interface DynamometerCardProps {
  analytics?: AnalyticsData | null;
  latest?: TelemetryRecord | null;
}

export const DynamometerCard: React.FC<DynamometerCardProps> = ({ analytics, latest }) => {
  const dyno = analytics?.dynamometer_analysis;
  const fillage = analytics?.pump_fillage;
  const points = dyno?.surface_card || [];

  const maxStroke = latest?.stroke_length_m || 2.5;
  const peakLoad = dyno?.max_card_load_kn ?? (latest ? Math.max(latest.rod_load_kn, 50) : null);
  const minLoad = dyno?.min_card_load_kn ?? (latest ? Math.min(latest.rod_load_kn, 30) : null);
  const strokeWorkKj = dyno?.stroke_work_kj ?? null;
  const fillagePct = fillage?.fillage_pct ?? null;

  const padX = 40;
  const padY = 20;
  const plotW = 380 - padX * 2;
  const plotH = 190 - padY * 2;

  const scaleX = (pos: number) => padX + (pos / Math.max(0.1, maxStroke)) * plotW;
  const scaleY = (load: number) => {
    const yMin = Math.max(0, (minLoad ?? 20) - 15);
    const yMax = (peakLoad ?? 100) + 15;
    return padY + plotH - ((load - yMin) / Math.max(1, yMax - yMin)) * plotH;
  };

  let pathD = '';
  if (points.length > 1) {
    pathD = points.reduce((acc, pt, idx) => {
      const x = scaleX(pt.position_m);
      const y = scaleY(pt.load_kn);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }

  const currentX = latest ? scaleX(latest.rod_position_m) : padX;
  const currentY = latest ? scaleY(latest.rod_load_kn) : padY + plotH / 2;

  return (
    <div className="bg-[#0D1219] border border-[#1E293B] rounded-lg p-4 flex flex-col justify-between relative overflow-hidden shadow-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
            SURFACE DYNAMOMETER CARD (F vs. X)
          </h3>
          <Tooltip
            title="Dynamometer Diagnostic Card"
            category="ANALYTICS"
            content="Closed-loop plot measuring Polished Rod Load (kN) against Vertical Position (m) across the full pumping stroke. Area equals mechanical energy (kJ) imparted per cycle."
          />
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded bg-[#111821] border border-[#1E293B] text-slate-300">
            WORK: <strong className="text-amber-300">{strokeWorkKj !== null ? `${strokeWorkKj} kJ` : '--'}</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            FILLAGE: <strong>{fillagePct !== null ? `${fillagePct}%` : '--'}</strong>
          </span>
        </div>
      </div>

      {/* Engineering Diagnostic Canvas */}
      <div className="relative w-full h-48 bg-[#080B10] rounded border border-[#1E293B] my-3 p-1 flex items-center justify-center overflow-hidden">
        {/* Engineering Crosshair Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E293B_1px,transparent_1px),linear-gradient(to_bottom,#1E293B_1px,transparent_1px)] bg-[size:20px_20px] opacity-40 pointer-events-none" />

        <svg viewBox="0 0 380 190" className="w-full h-full relative z-10">
          <defs>
            <linearGradient id="dynoGradIndustrial" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Calibrated Reference Lines */}
          <line x1={padX} y1={padY} x2={padX + plotW} y2={padY} stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={padX} y1={padY + plotH / 2} x2={padX + plotW} y2={padY + plotH / 2} stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={padX} y1={padY + plotH} x2={padX + plotW} y2={padY + plotH} stroke="#334155" strokeWidth="1" />
          <line x1={padX} y1={padY} x2={padX} y2={padY + plotH} stroke="#334155" strokeWidth="1" />
          <line x1={padX + plotW} y1={padY} x2={padX + plotW} y2={padY + plotH} stroke="#1E293B" strokeWidth="1" />

          {/* Ticks and Coordinates */}
          <text x={padX - 6} y={padY + 4} fill="#64748B" fontSize="8.5" fontFamily="monospace" textAnchor="end">
            {peakLoad !== null ? `${Math.round(peakLoad + 15)}kN` : '--'}
          </text>
          <text x={padX - 6} y={padY + plotH} fill="#64748B" fontSize="8.5" fontFamily="monospace" textAnchor="end">
            {minLoad !== null ? `${Math.max(0, Math.round(minLoad - 15))}kN` : '0kN'}
          </text>
          <text x={padX} y={padY + plotH + 12} fill="#64748B" fontSize="8.5" fontFamily="monospace" textAnchor="middle">0m</text>
          <text x={padX + plotW / 2} y={padY + plotH + 12} fill="#64748B" fontSize="8.5" fontFamily="monospace" textAnchor="middle">
            {(maxStroke / 2).toFixed(1)}m
          </text>
          <text x={padX + plotW} y={padY + plotH + 12} fill="#64748B" fontSize="8.5" fontFamily="monospace" textAnchor="middle">
            {maxStroke.toFixed(1)}m
          </text>

          {/* Dyno Closed Curve */}
          {pathD ? (
            <path
              d={pathD}
              fill="url(#dynoGradIndustrial)"
              stroke="#F59E0B"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          ) : (
            <text x={padX + plotW / 2} y={padY + plotH / 2} fill="#475569" fontSize="10" fontFamily="monospace" textAnchor="middle">
              Awaiting complete stroke cycle...
            </text>
          )}

          {/* Instantaneous Kinematic Position Radar Marker */}
          {latest && (
            <g>
              <circle cx={currentX} cy={currentY} r="7" fill="#06B6D4" opacity="0.35" className="animate-ping" />
              <circle cx={currentX} cy={currentY} r="4" fill="#06B6D4" stroke="#ffffff" strokeWidth="1.5" />
            </g>
          )}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-1.5 right-2 text-[9px] text-slate-400 font-mono flex items-center gap-2.5 bg-[#0D1219]/90 px-2 py-0.5 rounded border border-[#1E293B]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-amber-400 inline-block" /> STROKE ENVELOPE
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" /> KINEMATIC POSITION
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
        <div className="bg-[#111821] border border-[#1E293B] p-2 rounded">
          <span className="text-slate-400 block text-[9px] uppercase">PEAK LOAD (PPRL)</span>
          <span className="font-bold text-slate-100 text-xs">
            {peakLoad !== null ? `${peakLoad.toFixed(1)} kN` : '--'}
          </span>
        </div>
        <div className="bg-[#111821] border border-[#1E293B] p-2 rounded">
          <span className="text-slate-400 block text-[9px] uppercase">MIN LOAD (MPRL)</span>
          <span className="font-bold text-slate-100 text-xs">
            {minLoad !== null ? `${minLoad.toFixed(1)} kN` : '--'}
          </span>
        </div>
        <div className="bg-[#111821] border border-[#1E293B] p-2 rounded">
          <span className="text-slate-400 block text-[9px] uppercase">CYCLIC STRESS RANGE</span>
          <span className="font-bold text-amber-400 text-xs">
            {peakLoad !== null && minLoad !== null ? `${(peakLoad - minLoad).toFixed(1)} kN` : '--'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DynamometerCard;
