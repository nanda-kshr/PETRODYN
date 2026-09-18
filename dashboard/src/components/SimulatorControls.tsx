'use client';

import React, { useState } from 'react';
import { Sliders, Check, Flame, Gauge, Activity } from 'lucide-react';

interface SimulatorControlsProps {
  simulatorApiUrl?: string;
  onParameterChanged?: () => void;
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  simulatorApiUrl,
  onParameterChanged,
}) => {
  const url = simulatorApiUrl || process.env.NEXT_PUBLIC_SIMULATOR_API_URL || 'http://localhost:3001';
  const [loadingParam, setLoadingParam] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const setParam = async (parameter: string, value: number) => {
    setLoadingParam(parameter);
    setLastMessage(null);
    try {
      const res = await fetch(`${url}/api/v1/simulator/set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parameter, value }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLastMessage(`Updated ${parameter} to ${value}`);
        if (onParameterChanged) onParameterChanged();
      } else {
        setLastMessage(`Failed: ${data.message || 'Error'}`);
      }
    } catch (err: any) {
      setLastMessage(`Error connecting to simulator: ${err.message}`);
    } finally {
      setLoadingParam(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-400" />
          Interactive Simulator Controls (Test Live Dynamics)
        </h3>
        {lastMessage && (
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
            {lastMessage}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Temperature presets */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
          <span className="text-slate-400 block mb-2 flex items-center gap-1.5 font-medium">
            <Flame className="w-3.5 h-3.5 text-rose-400" /> Wellbore Temperature (°C)
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setParam('temperature_c', 80)}
              disabled={loadingParam === 'temperature_c'}
              className="px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 transition"
            >
              80°C (Hot Steam)
            </button>
            <button
              onClick={() => setParam('temperature_c', 50)}
              disabled={loadingParam === 'temperature_c'}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
            >
              50°C (Baseline)
            </button>
            <button
              onClick={() => setParam('temperature_c', 35)}
              disabled={loadingParam === 'temperature_c'}
              className="px-2.5 py-1 rounded bg-sky-950/60 hover:bg-sky-900 border border-sky-800/80 text-sky-300 transition"
            >
              35°C (Cold Decay)
            </button>
          </div>
        </div>

        {/* SPM / Pumping Speed */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
          <span className="text-slate-400 block mb-2 flex items-center gap-1.5 font-medium">
            <Activity className="w-3.5 h-3.5 text-amber-400" /> Pumping Speed (SPM)
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setParam('spm', 4.0)}
              disabled={loadingParam === 'spm'}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
            >
              4.0 SPM (Slow)
            </button>
            <button
              onClick={() => setParam('spm', 5.5)}
              disabled={loadingParam === 'spm'}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
            >
              5.5 SPM (Normal)
            </button>
            <button
              onClick={() => setParam('spm', 8.0)}
              disabled={loadingParam === 'spm'}
              className="px-2.5 py-1 rounded bg-amber-950/60 hover:bg-amber-900 border border-amber-800/80 text-amber-300 transition"
            >
              8.0 SPM (High Drag)
            </button>
          </div>
        </div>

        {/* Tubing Pressure */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
          <span className="text-slate-400 block mb-2 flex items-center gap-1.5 font-medium">
            <Gauge className="w-3.5 h-3.5 text-sky-400" /> Tubing Pressure (bar)
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setParam('tubing_pressure_bar', 15)}
              disabled={loadingParam === 'tubing_pressure_bar'}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
            >
              15 bar
            </button>
            <button
              onClick={() => setParam('tubing_pressure_bar', 25)}
              disabled={loadingParam === 'tubing_pressure_bar'}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
            >
              25 bar
            </button>
            <button
              onClick={() => setParam('tubing_pressure_bar', 45)}
              disabled={loadingParam === 'tubing_pressure_bar'}
              className="px-2.5 py-1 rounded bg-sky-950/60 hover:bg-sky-900 border border-sky-800/80 text-sky-300 transition"
            >
              45 bar (Heavy Head)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
