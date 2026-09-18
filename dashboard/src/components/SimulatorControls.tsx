'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Flame,
  Gauge,
  Activity,
  Play,
  Square,
  RotateCcw,
  Layers,
  ArrowUp,
  ArrowDown,
  Zap,
  Sparkles,
  Hourglass,
  Power,
} from 'lucide-react';
import { TelemetryRecord } from '@/types/telemetry';

interface SimulatorControlsProps {
  simulatorApiUrl?: string;
  latest?: TelemetryRecord | null;
  onParameterChanged?: () => void;
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  simulatorApiUrl,
  latest,
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
        body: JSON.stringify({ parameter, value: Number(value) }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLastMessage(`✓ Set ${parameter} = ${value}`);
        if (onParameterChanged) onParameterChanged();
      } else {
        setLastMessage(`Error: ${data.message || 'Failed'}`);
      }
    } catch (err: any) {
      setLastMessage(`Connection error: ${err.message}`);
    } finally {
      setLoadingParam(null);
    }
  };

  const controlLoop = async (action: 'start' | 'stop') => {
    setLoadingParam(`loop_${action}`);
    try {
      const res = await fetch(`${url}/api/v1/simulator/${action}`, {
        method: 'POST',
      });
      const data = await res.json();
      setLastMessage(`Simulator ${action === 'start' ? 'Resumed' : 'Paused'}`);
      if (onParameterChanged) onParameterChanged();
    } catch (err: any) {
      setLastMessage(`Error: ${err.message}`);
    } finally {
      setLoadingParam(null);
    }
  };

  const applyScenario = async (scenarioName: string, params: Record<string, number>) => {
    setLoadingParam('scenario');
    setLastMessage(`Applying ${scenarioName}...`);
    for (const [key, val] of Object.entries(params)) {
      await fetch(`${url}/api/v1/simulator/set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parameter: key, value: val }),
      });
    }
    setLastMessage(`Applied: ${scenarioName}`);
    if (onParameterChanged) onParameterChanged();
    setLoadingParam(null);
  };

  const applyCssStage = async (stage: 'STEAM' | 'SOAK' | 'PRODUCTION') => {
    setLoadingParam(`css_${stage}`);
    const stageNames: Record<string, string> = {
      STEAM: '🔥 Steam Injection (Huff)',
      SOAK: '⏳ Steam Soaking (Soak)',
      PRODUCTION: '▶️ Hot Flush Production (Puff)',
    };
    setLastMessage(`Initiating ${stageNames[stage]}...`);
    try {
      const res = await fetch(`${url}/api/v1/simulator/stage/${stage}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLastMessage(`✓ CSS Stage Active: ${stageNames[stage]}`);
        if (onParameterChanged) onParameterChanged();
      } else {
        setLastMessage(`Error: ${data.message || 'Failed'}`);
      }
    } catch (err: any) {
      setLastMessage(`Connection error: ${err.message}`);
    } finally {
      setLoadingParam(null);
    }
  };

  const temp = latest?.temperature_c ?? 50.0;
  const spm = latest?.spm ?? 5.5;
  const vfd = latest?.vfd_frequency_hz ?? 40.0;
  const stroke = latest?.stroke_length_m ?? 2.5;
  const press = latest?.tubing_pressure_bar ?? 18.5;
  const fluidLevel = latest?.fluid_level_m ?? 850.0;

  const isPumpStopped = spm <= 0.05;
  const activeStage = latest?.operating_stage || (isPumpStopped ? (temp >= 180 ? 'STEAM' : (temp >= 90 ? 'SOAK' : 'STOPPED')) : 'PRODUCTION');
  const isInjecting = activeStage === 'STEAM';
  const isSoaking = activeStage === 'SOAK';
  const isHotFlush = activeStage === 'PRODUCTION' && temp >= 70;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      {/* Top Header & Simulation Loop Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sky-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Simulator Runtime Control Panel
            </h3>
            <p className="text-[11px] text-slate-400">
              Click any button to dynamically modify downhole and surface parameters & observe real-time graph updates.
            </p>
          </div>
        </div>

        {/* Status Message & Loop Buttons */}
        <div className="flex items-center gap-2 text-xs">
          {lastMessage && (
            <span className="font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2.5 py-1 rounded-md text-[11px]">
              {lastMessage}
            </span>
          )}

          <button
            onClick={() => controlLoop('start')}
            disabled={loadingParam === 'loop_start'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-medium transition active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Start
          </button>

          <button
            onClick={() => controlLoop('stop')}
            disabled={loadingParam === 'loop_stop'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-medium transition active:scale-95"
          >
            <Square className="w-3.5 h-3.5 fill-current" /> Stop
          </button>
        </div>
      </div>

      {/* CYCLIC STEAM STIMULATION (CSS) LIFECYCLE CONTROLLER */}
      <div className="bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-rose-950/40 border border-orange-800/60 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-orange-800/40 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-orange-900/80 border border-orange-600 text-orange-200 tracking-wider">
              CYCLIC STEAM STIMULATION (CSS) LIFECYCLE
            </span>
            <span className="text-xs font-semibold text-slate-200">
              Shut-in pump, inject superheated steam, soak formation, and resume hot flush production
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">Live Cycle Stage:</span>
            {isInjecting && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 border border-rose-500/50 text-rose-400 animate-pulse flex items-center gap-1">
                <Flame className="w-3 h-3" /> 1. STEAM INJECTION (HUFF)
              </span>
            )}
            {isSoaking && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 border border-amber-500/50 text-amber-400 animate-pulse flex items-center gap-1">
                <Hourglass className="w-3 h-3" /> 2. THERMAL SOAKING
              </span>
            )}
            {isHotFlush && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center gap-1">
                <Zap className="w-3 h-3" /> 3. HOT FLUSH PRODUCTION (PUFF)
              </span>
            )}
            {!isInjecting && !isSoaking && !isHotFlush && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 border border-slate-700 text-slate-300">
                {isPumpStopped ? 'Pump Stopped / Shut-In' : 'Steady Production'}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Stage 1: Inject Steam */}
          <button
            onClick={() => applyCssStage('STEAM')}
            disabled={loadingParam === 'css_STEAM'}
            className={`flex flex-col p-3 rounded-lg border text-left transition active:scale-[0.98] ${
              isInjecting
                ? 'bg-rose-950/90 border-rose-500 ring-1 ring-rose-500 text-white'
                : 'bg-slate-950/80 border-rose-900/60 hover:border-rose-700 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4" /> 1. Steam Injection (Huff)
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-900/70 border border-rose-800 text-rose-300">
                PUMP STOPPED
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Stop pump (0 SPM). Inject 280°C steam @ 125 bar (OIL tender up to 340°C &amp; 165 bar). Viscosity collapses to ~20 cP.
            </p>
            <div className="mt-2 pt-2 border-t border-rose-900/40 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Temp: 280°C</span>
              <span>Press: 125 bar</span>
              <span>BOPD: 0</span>
            </div>
          </button>

          {/* Stage 2: Soak Well */}
          <button
            onClick={() => applyCssStage('SOAK')}
            disabled={loadingParam === 'css_SOAK'}
            className={`flex flex-col p-3 rounded-lg border text-left transition active:scale-[0.98] ${
              isSoaking
                ? 'bg-amber-950/90 border-amber-500 ring-1 ring-amber-500 text-white'
                : 'bg-slate-950/80 border-amber-900/60 hover:border-amber-700 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Hourglass className="w-4 h-4" /> 2. Soak Well (Shut-In)
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-900/70 border border-amber-800 text-amber-300">
                PUMP STOPPED
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Keep pump off (0 SPM). Formation shut-in for heat soaking &amp; thermal diffusion (160°C @ 45 bar).
            </p>
            <div className="mt-2 pt-2 border-t border-amber-900/40 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Temp: 160°C</span>
              <span>Press: 45 bar</span>
              <span>BOPD: 0</span>
            </div>
          </button>

          {/* Stage 3: Restart Production */}
          <button
            onClick={() => applyCssStage('PRODUCTION')}
            disabled={loadingParam === 'css_PRODUCTION'}
            className={`flex flex-col p-3 rounded-lg border text-left transition active:scale-[0.98] ${
              isHotFlush
                ? 'bg-emerald-950/90 border-emerald-500 ring-1 ring-emerald-500 text-white'
                : 'bg-slate-950/80 border-emerald-900/60 hover:border-emerald-700 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Play className="w-4 h-4 fill-current" /> 3. Restart Production (Puff)
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-900/70 border border-emerald-800 text-emerald-300">
                PUMP RUNNING
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Start pump (5.5 SPM, 40 Hz). Flush fluid at high initial rate (~48.5 BOPD) before gradual cooling.
            </p>
            <div className="mt-2 pt-2 border-t border-emerald-900/40 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>SPM: 5.5</span>
              <span>Temp: 85°C</span>
              <span>BOPD: ~48.5</span>
            </div>
          </button>
        </div>
      </div>

      {/* Quick Failure & Optimization Scenarios */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
        <span className="text-slate-400 block text-[11px] mb-2 font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> One-Click Simulation Scenarios:
        </span>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => applyScenario('Hot Steam Flush', { temperature_c: 85, spm: 5.5, tubing_pressure_bar: 22 })}
            className="px-3 py-1.5 rounded-md bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 transition active:scale-95"
          >
            🔥 Nature: Hot Steam Flush (85°C)
          </button>
          <button
            onClick={() => applyScenario('Cold Viscous Trap', { temperature_c: 32, spm: 6.5, tubing_pressure_bar: 25 })}
            className="px-3 py-1.5 rounded-md bg-amber-950/50 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 transition active:scale-95"
          >
            ❄️ Nature: Cold Cooling Shock (32°C)
          </button>
          <button
            onClick={() => applyScenario('High-Speed Pumping', { vfd_frequency_hz: 55, spm: 7.5, stroke_length_m: 2.8 })}
            className="px-3 py-1.5 rounded-md bg-sky-950/50 hover:bg-sky-900/60 border border-sky-800/60 text-sky-300 transition active:scale-95"
          >
            ⚙️ Operator: High-Speed Pumping (7.5 SPM)
          </button>
          <button
            onClick={() => applyScenario('Deep Fluid Drawdown', { fluid_level_m: 1050, tubing_pressure_bar: 30 })}
            className="px-3 py-1.5 rounded-md bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-800/60 text-indigo-300 transition active:scale-95"
          >
            💧 Nature: Deep Fluid Drawdown (1050m)
          </button>
          <button
            onClick={() => applyScenario('Baseline Reset', { temperature_c: 50, spm: 5.5, vfd_frequency_hz: 40, stroke_length_m: 2.5, tubing_pressure_bar: 18.5, fluid_level_m: 850 })}
            className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition active:scale-95 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset Baseline
          </button>
        </div>
      </div>

      {/* SECTION 1: OPERATOR ACTUATED CONTROLS (MACHINERY & SURFACE SETTINGS) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-sky-950/90 border border-sky-800 text-sky-400 tracking-wider">
              OPERATOR ACTUATED &bull; SURFACE MACHINERY
            </span>
            <span className="text-xs font-semibold text-slate-200">
              Parameters directly controllable by field operators and automation
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">DCS / VFD INTERVENTIONS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* 1. SPM (Pumping Speed) Control */}
          <div className="bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" /> Pumping Speed (SPM)
              </span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {spm <= 0.05 ? <span className="text-rose-400 font-bold">0.0 (STOPPED)</span> : `${spm.toFixed(1)} SPM`}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setParam('spm', 0.0)}
                className={`px-2 py-1 rounded border text-[11px] font-bold transition ${
                  spm <= 0.05
                    ? 'bg-rose-900/80 border-rose-500 text-rose-200'
                    : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-rose-400'
                }`}
                title="Stop pump (0 SPM)"
              >
                0 (Stop)
              </button>
              <button
                onClick={() => setParam('spm', Math.max(0, Math.round((spm - 0.5) * 10) / 10))}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
                title="-0.5 SPM"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setParam('spm', 3.5)} className="flex-1 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px]">3.5</button>
              <button onClick={() => setParam('spm', 5.5)} className="flex-1 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px]">5.5</button>
              <button onClick={() => setParam('spm', 7.5)} className="flex-1 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px]">7.5</button>
              <button onClick={() => setParam('spm', 9.5)} className="flex-1 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px]">9.5</button>
              <button
                onClick={() => setParam('spm', Math.min(15, Math.round((spm + 0.5) * 10) / 10))}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
                title="+0.5 SPM"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. VFD Frequency Control */}
          <div className="bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-sky-400" /> VFD Frequency (Hz)
              </span>
              <span className="font-mono font-bold text-sky-400 text-sm">
                {vfd <= 0.05 ? <span className="text-rose-400 font-bold">0.0 Hz (OFF)</span> : `${vfd.toFixed(1)} Hz`}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setParam('vfd_frequency_hz', 0)}
                className={`px-2 py-1 rounded border text-[11px] font-bold transition ${
                  vfd <= 0.05
                    ? 'bg-rose-900/80 border-rose-500 text-rose-200'
                    : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-rose-400'
                }`}
                title="Turn off VFD (0 Hz)"
              >
                0 Hz
              </button>
              <button
                onClick={() => setParam('vfd_frequency_hz', Math.max(0, Math.round(vfd - 5)))}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
                title="-5 Hz"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setParam('vfd_frequency_hz', 30)} className="flex-1 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px]">30 Hz</button>
              <button onClick={() => setParam('vfd_frequency_hz', 40)} className="flex-1 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px]">40 Hz</button>
              <button onClick={() => setParam('vfd_frequency_hz', 50)} className="flex-1 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px]">50 Hz</button>
              <button onClick={() => setParam('vfd_frequency_hz', 60)} className="flex-1 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px]">60 Hz</button>
              <button
                onClick={() => setParam('vfd_frequency_hz', Math.min(70, Math.round(vfd + 5)))}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
                title="+5 Hz"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. Stroke Length Control */}
          <div className="bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" /> Stroke Length (m)
              </span>
              <span className="font-mono font-bold text-emerald-400 text-sm">{stroke.toFixed(2)} m</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setParam('stroke_length_m', Math.max(1.0, Math.round((stroke - 0.2) * 10) / 10))}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setParam('stroke_length_m', 1.8)} className="flex-1 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px]">1.8m</button>
              <button onClick={() => setParam('stroke_length_m', 2.5)} className="flex-1 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px]">2.5m</button>
              <button onClick={() => setParam('stroke_length_m', 3.2)} className="flex-1 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px]">3.2m</button>
              <button onClick={() => setParam('stroke_length_m', 4.0)} className="flex-1 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px]">4.0m</button>
              <button
                onClick={() => setParam('stroke_length_m', Math.min(5.0, Math.round((stroke + 0.2) * 10) / 10))}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: NATURE & DOWNHOLE RESERVOIR DYNAMICS */}
      <div className="space-y-3 pt-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-amber-950/90 border border-amber-800 text-amber-400 tracking-wider">
              NATURE &bull; DOWNHOLE &amp; RESERVOIR
            </span>
            <span className="text-xs font-semibold text-slate-200">
              Environmental and in-situ physical conditions (Heat dissipation, Viscosity, Reservoir inflow)
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">FORMATION STATE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* 1. Reservoir / Wellbore Temperature Control */}
          <div className="bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" /> Wellbore Temp (°C)
              </span>
              <span className="font-mono font-bold text-rose-400 text-sm">{temp.toFixed(1)}°C</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setParam('temperature_c', Math.max(20, Math.round(temp - 5)))}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
                title="-5°C (Cooling)"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setParam('temperature_c', 35)} className="flex-1 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px]">35°C</button>
              <button onClick={() => setParam('temperature_c', 50)} className="flex-1 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px]">50°C</button>
              <button onClick={() => setParam('temperature_c', 75)} className="flex-1 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px]">75°C</button>
              <button onClick={() => setParam('temperature_c', 95)} className="flex-1 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px]">95°C</button>
              <button
                onClick={() => setParam('temperature_c', Math.min(180, Math.round(temp + 5)))}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
                title="+5°C (Steam Injection)"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. Tubing Hydraulic Pressure Control */}
          <div className="bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-sky-400" /> Tubing Pressure (bar)
              </span>
              <span className="font-mono font-bold text-sky-400 text-sm">{press.toFixed(1)} bar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setParam('tubing_pressure_bar', Math.max(5, Math.round(press - 5)))}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setParam('tubing_pressure_bar', 15)} className="flex-1 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px]">15 bar</button>
              <button onClick={() => setParam('tubing_pressure_bar', 25)} className="flex-1 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px]">25 bar</button>
              <button onClick={() => setParam('tubing_pressure_bar', 40)} className="flex-1 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px]">40 bar</button>
              <button onClick={() => setParam('tubing_pressure_bar', 60)} className="flex-1 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px]">60 bar</button>
              <button
                onClick={() => setParam('tubing_pressure_bar', Math.min(90, Math.round(press + 5)))}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. Fluid Level Depth Control */}
          <div className="bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> Fluid Level Depth (m)
              </span>
              <span className="font-mono font-bold text-indigo-400 text-sm">{fluidLevel.toFixed(0)} m</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setParam('fluid_level_m', Math.max(300, Math.round(fluidLevel - 50)))}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setParam('fluid_level_m', 650)} className="flex-1 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px]">650m</button>
              <button onClick={() => setParam('fluid_level_m', 850)} className="flex-1 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px]">850m</button>
              <button onClick={() => setParam('fluid_level_m', 1050)} className="flex-1 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px]">1050m</button>
              <button
                onClick={() => setParam('fluid_level_m', Math.min(1150, Math.round(fluidLevel + 50)))}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
