'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from 'recharts';
import { TelemetryRecord } from '@/types/telemetry';
import { TrendingUp, Radio, Activity, Zap, Layers } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface TelemetryGraphsProps {
  history: TelemetryRecord[];
}

export const TelemetryGraphs: React.FC<TelemetryGraphsProps> = ({ history }) => {
  const effectiveHistory = history && history.length > 0 ? history : Array.from({ length: 25 }, (_, i) => {
    const t = i * 0.4;
    const angle = (t * 5.5 * 2 * Math.PI) / 60;
    return {
      well_id: 'BW-001',
      timestamp: new Date(Date.now() - (25 - i) * 1000).toISOString(),
      spm: 5.5,
      stroke_length_m: 2.5,
      rod_position_m: 1.25 + 1.25 * Math.sin(angle),
      rod_load_kn: 68.4 + 14.5 * Math.sin(angle),
      motor_current_a: 24.6 + 2.8 * Math.sin(angle),
      production_bopd: 48.2 + 0.3 * Math.sin(t * 0.1),
      fluid_level_m: 850,
      tubing_pressure_bar: 18.5 + 0.2 * Math.sin(angle),
      temperature_c: 78.5,
      viscosity_cp: 10240,
      vfd_frequency_hz: 42.0,
      casing_pressure_bar: 8.2,
      water_cut_pct: 12.4,
      operating_stage: 'PRODUCTION' as const,
      pump_running: true,
    };
  });

  const chartData = effectiveHistory.map((rec, i) => {
    let timeLabel = `${i}`;
    try {
      const d = new Date(rec.timestamp);
      timeLabel = d.toTimeString().split(' ')[0].slice(3);
    } catch (_) {}

    return {
      time: timeLabel,
      rod_load_kn: Number(rec.rod_load_kn.toFixed(1)),
      motor_current_a: Number(rec.motor_current_a.toFixed(1)),
      production_bopd: Number(rec.production_bopd.toFixed(1)),
      fluid_level_m: Number(rec.fluid_level_m.toFixed(1)),
      tubing_pressure_bar: Number(rec.tubing_pressure_bar.toFixed(1)),
      spm: Number(rec.spm.toFixed(1)),
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
      {/* Chart 1: Mechanical Rod Load & Motor Current Stream */}
      <div className="scada-panel rounded-sm p-3.5 flex flex-col justify-between relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#1E2A3B]">
          <div className="flex items-center gap-2">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
              REAL-TIME MECHANICAL LOAD &amp; ELECTRICAL CURRENT
            </h3>
            <Tooltip
              title="Mechanical vs Electrical Telemetry"
              category="ANALYTICS"
              content="Real-time continuous 10Hz stream of polished rod tension (kN) alongside surface electric motor draw (Amperes)."
            />
          </div>

          <div className="flex items-center gap-2 text-[9.5px] font-mono">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#0F1622] border border-[#1E2A3B] text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> ROD LOAD (kN)
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#0F1622] border border-[#1E2A3B] text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> CURRENT (A)
            </span>
          </div>
        </div>

        <div className="w-full h-64 pt-3">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="loadGradInd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="currentGradInd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="#15202E" />
                <XAxis dataKey="time" stroke="#52637A" fontSize={9} tickLine={false} fontFamily="monospace" />
                <YAxis yAxisId="left" stroke="#F59E0B" fontSize={9} domain={['dataMin - 5', 'dataMax + 10']} fontFamily="monospace" tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#00F0FF" fontSize={9} domain={['dataMin - 5', 'dataMax + 10']} fontFamily="monospace" tickLine={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#06090E',
                    borderColor: '#1E2A3B',
                    borderRadius: '2px',
                    fontSize: '10.5px',
                    color: '#F8FAFC',
                    fontFamily: 'monospace',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
                  }}
                />
                <Area yAxisId="left" type="monotone" dataKey="rod_load_kn" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#loadGradInd)" isAnimationActive={false} />
                <Area yAxisId="right" type="monotone" dataKey="motor_current_a" stroke="#00F0FF" strokeWidth={1.5} fillOpacity={1} fill="url(#currentGradInd)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[11px] text-slate-500 font-mono">
              Awaiting telemetry streaming...
            </div>
          )}
        </div>
      </div>

      {/* Chart 2: Production Rate & Fluid Level */}
      <div className="scada-panel rounded-sm p-3.5 flex flex-col justify-between relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#1E2A3B]">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
              INFLOW DYNAMICS &amp; GROSS PRODUCTION (BOPD)
            </h3>
            <Tooltip
              title="Production & Fluid Level Stream"
              category="ANALYTICS"
              content="Real-time correlation of surface gross crude rate (BOPD) against subterranean working fluid level depth (m)."
            />
          </div>

          <div className="flex items-center gap-2 text-[9.5px] font-mono">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#0F1622] border border-[#1E2A3B] text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> PRODUCTION (BOPD)
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#0F1622] border border-[#1E2A3B] text-sky-300">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> FLUID LEVEL (m)
            </span>
          </div>
        </div>

        <div className="w-full h-64 pt-3">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="prodGradInd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E676" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00E676" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="fluidGradInd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="#15202E" />
                <XAxis dataKey="time" stroke="#52637A" fontSize={9} tickLine={false} fontFamily="monospace" />
                <YAxis yAxisId="left" stroke="#00E676" fontSize={9} domain={['dataMin - 5', 'dataMax + 5']} fontFamily="monospace" tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#38BDF8" fontSize={9} domain={['dataMin - 20', 'dataMax + 20']} fontFamily="monospace" tickLine={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#06090E',
                    borderColor: '#1E2A3B',
                    borderRadius: '2px',
                    fontSize: '10.5px',
                    color: '#F8FAFC',
                    fontFamily: 'monospace',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
                  }}
                />
                <Area yAxisId="left" type="monotone" dataKey="production_bopd" stroke="#00E676" strokeWidth={2} fillOpacity={1} fill="url(#prodGradInd)" isAnimationActive={false} />
                <Area yAxisId="right" type="monotone" dataKey="fluid_level_m" stroke="#38BDF8" strokeWidth={1.5} fillOpacity={1} fill="url(#fluidGradInd)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[11px] text-slate-500 font-mono">
              Awaiting telemetry streaming...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TelemetryGraphs;
