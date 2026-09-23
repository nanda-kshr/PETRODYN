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
import { motion } from 'framer-motion';
import { TelemetryRecord } from '@/types/telemetry';
import { Gauge, TrendingUp, Radio, Activity, Zap } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface TelemetryGraphsProps {
  history: TelemetryRecord[];
}

export const TelemetryGraphs: React.FC<TelemetryGraphsProps> = ({ history }) => {
  const chartData = history.map((rec, i) => {
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Chart 1: Mechanical Rod Load & Motor Current Stream */}
      <div className="bg-[#0D1219] border border-[#1E293B] rounded-lg p-4 flex flex-col justify-between relative overflow-hidden shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#1E293B]">
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

          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#111821] border border-[#1E293B] text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> ROD LOAD (kN)
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#111821] border border-[#1E293B] text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> CURRENT (A)
            </span>
          </div>
        </div>

        <div className="w-full h-56 pt-3">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="loadGradInd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="currentGradInd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="#17202D" />
                <XAxis dataKey="time" stroke="#475569" fontSize={9.5} tickLine={false} fontFamily="monospace" />
                <YAxis yAxisId="left" stroke="#f59e0b" fontSize={9.5} domain={['dataMin - 5', 'dataMax + 10']} fontFamily="monospace" tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" fontSize={9.5} domain={['dataMin - 5', 'dataMax + 10']} fontFamily="monospace" tickLine={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#080B10',
                    borderColor: '#1E293B',
                    borderRadius: '6px',
                    fontSize: '10.5px',
                    color: '#F8FAFC',
                    fontFamily: 'monospace',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                  }}
                />
                <Area yAxisId="left" type="monotone" dataKey="rod_load_kn" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#loadGradInd)" isAnimationActive={false} />
                <Area yAxisId="right" type="monotone" dataKey="motor_current_a" stroke="#06b6d4" strokeWidth={1.5} fillOpacity={1} fill="url(#currentGradInd)" isAnimationActive={false} />
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
      <div className="bg-[#0D1219] border border-[#1E293B] rounded-lg p-4 flex flex-col justify-between relative overflow-hidden shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#1E293B]">
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

          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#111821] border border-[#1E293B] text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> PRODUCTION (BOPD)
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#111821] border border-[#1E293B] text-sky-300">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> FLUID LEVEL (m)
            </span>
          </div>
        </div>

        <div className="w-full h-56 pt-3">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="prodGradInd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="fluidGradInd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="#17202D" />
                <XAxis dataKey="time" stroke="#475569" fontSize={9.5} tickLine={false} fontFamily="monospace" />
                <YAxis yAxisId="left" stroke="#10b981" fontSize={9.5} domain={['dataMin - 5', 'dataMax + 5']} fontFamily="monospace" tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" fontSize={9.5} domain={['dataMin - 20', 'dataMax + 20']} fontFamily="monospace" tickLine={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#080B10',
                    borderColor: '#1E293B',
                    borderRadius: '6px',
                    fontSize: '10.5px',
                    color: '#F8FAFC',
                    fontFamily: 'monospace',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                  }}
                />
                <Area yAxisId="left" type="monotone" dataKey="production_bopd" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#prodGradInd)" isAnimationActive={false} />
                <Area yAxisId="right" type="monotone" dataKey="fluid_level_m" stroke="#38bdf8" strokeWidth={1.5} fillOpacity={1} fill="url(#fluidGradInd)" isAnimationActive={false} />
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
