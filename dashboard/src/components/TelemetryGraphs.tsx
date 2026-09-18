'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from 'recharts';
import { TelemetryRecord } from '@/types/telemetry';
import { Gauge, TrendingUp } from 'lucide-react';
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
      rod_load_kn: rec.rod_load_kn,
      motor_current_a: rec.motor_current_a,
      production_bopd: rec.production_bopd,
      fluid_level_m: rec.fluid_level_m,
      tubing_pressure_bar: rec.tubing_pressure_bar,
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Chart 1: Rod Load & Motor Current */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-cyan-400" />
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-sky-50 border border-sky-200 text-sky-600 tracking-wider">
              ANALYTICS &bull; LIVE STREAM
            </span>
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-amber-600" />
              Live Mechanical & Electrical Load
            </h3>
            <Tooltip
              title="Live Load & Current Stream"
              category="ANALYTICS"
              content="Real-time telemetry showing mechanical load on the polished rod (kN) alongside surface electric motor draw current (A)."
            />
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-amber-600">
              <span className="w-2.5 h-0.5 bg-amber-400 inline-block" /> Rod Load (kN)
            </span>
            <span className="flex items-center gap-1.5 text-sky-600">
              <span className="w-2.5 h-0.5 bg-sky-400 inline-block" /> Current (A)
            </span>
          </div>
        </div>

        <div className="w-full h-56 pt-2">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis yAxisId="left" stroke="#d97706" fontSize={10} domain={['dataMin - 5', 'dataMax + 10']} />
                <YAxis yAxisId="right" orientation="right" stroke="#0284c7" fontSize={10} domain={['dataMin - 5', 'dataMax + 10']} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line yAxisId="left" type="monotone" dataKey="rod_load_kn" stroke="#d97706" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line yAxisId="right" type="monotone" dataKey="motor_current_a" stroke="#0284c7" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-gray-400">
              Awaiting telemetry streaming...
            </div>
          )}
        </div>
      </div>

      {/* Chart 2: Production Rate & Fluid Level */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-cyan-400" />
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-sky-50 border border-sky-200 text-sky-700 tracking-wider">
              ANALYTICS &bull; LIVE STREAM
            </span>
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Live Inflow & Production
            </h3>
            <Tooltip
              title="Inflow & Production Stream"
              category="ANALYTICS"
              content="Real-time stream of gross oil production (BOPD) versus downhole fluid level (depth in meters from surface)."
            />
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2.5 h-0.5 bg-emerald-500 inline-block" /> Production (BOPD)
            </span>
            <span className="flex items-center gap-1.5 text-indigo-600">
              <span className="w-2.5 h-0.5 bg-indigo-500 inline-block" /> Fluid Level (m)
            </span>
          </div>
        </div>

        <div className="w-full h-56 pt-2">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis yAxisId="left" stroke="#059669" fontSize={10} domain={['dataMin - 5', 'dataMax + 5']} />
                <YAxis yAxisId="right" orientation="right" stroke="#4f46e5" fontSize={10} domain={['dataMin - 20', 'dataMax + 20']} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line yAxisId="left" type="monotone" dataKey="production_bopd" stroke="#059669" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line yAxisId="right" type="monotone" dataKey="fluid_level_m" stroke="#4f46e5" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-gray-400">
              Awaiting telemetry streaming...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
