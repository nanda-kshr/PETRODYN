'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TelemetryRecord } from '@/types/telemetry';
import { Gauge, TrendingUp } from 'lucide-react';

interface TelemetryGraphsProps {
  history: TelemetryRecord[];
}

export const TelemetryGraphs: React.FC<TelemetryGraphsProps> = ({ history }) => {
  const chartData = history.map((rec, i) => {
    let timeLabel = `${i}`;
    try {
      const d = new Date(rec.timestamp);
      timeLabel = d.toTimeString().split(' ')[0].slice(3); // mm:ss
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
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-amber-400" />
            Live Mechanical & Electrical Load
          </h3>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-0.5 bg-amber-400 inline-block" /> Rod Load (kN)
            </span>
            <span className="flex items-center gap-1.5 text-sky-400">
              <span className="w-2.5 h-0.5 bg-sky-400 inline-block" /> Motor Current (A)
            </span>
          </div>
        </div>

        <div className="w-full h-56 pt-2">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis yAxisId="left" stroke="#f59e0b" fontSize={10} domain={['dataMin - 5', 'dataMax + 10']} />
                <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" fontSize={10} domain={['dataMin - 5', 'dataMax + 10']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="rod_load_kn"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="motor_current_a"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Awaiting telemetry streaming...
            </div>
          )}
        </div>
      </div>

      {/* Chart 2: Production Rate & Fluid Level */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Live Inflow & Production
          </h3>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" /> Production (BOPD)
            </span>
            <span className="flex items-center gap-1.5 text-indigo-400">
              <span className="w-2.5 h-0.5 bg-indigo-400 inline-block" /> Fluid Level (m)
            </span>
          </div>
        </div>

        <div className="w-full h-56 pt-2">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis yAxisId="left" stroke="#10b981" fontSize={10} domain={['dataMin - 5', 'dataMax + 5']} />
                <YAxis yAxisId="right" orientation="right" stroke="#818cf8" fontSize={10} domain={['dataMin - 20', 'dataMax + 20']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="production_bopd"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="fluid_level_m"
                  stroke="#818cf8"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Awaiting telemetry streaming...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
