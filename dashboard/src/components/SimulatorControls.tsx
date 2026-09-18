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
  Snowflake,
  Settings,
  Droplets,
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
      STEAM: 'Steam Injection (Huff)',
      SOAK: 'Steam Soaking (Soak)',
      PRODUCTION: 'Hot Flush Production (Puff)',
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
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-md space-y-4">
      {/* Top Header & Simulation Loop Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sky-600" title="Click any button to dynamically modify downhole and surface parameters & observe real-time graph updates.">
            <Sliders className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">
            Simulator Control Panel
          </h3>
        </div>

        {/* Status Message & Loop Buttons */}
        <div className="flex items-center gap-2 text-xs">
          {lastMessage && (
            <span className="font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md text-[11px]">
              {lastMessage}
            </span>
          )}

          <button
            onClick={() => controlLoop('start')}
            disabled={loadingParam === 'loop_start'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-medium transition active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Start
          </button>

          <button
            onClick={() => controlLoop('stop')}
            disabled={loadingParam === 'loop_stop'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-medium transition active:scale-95"
          >
            <Square className="w-3.5 h-3.5 fill-current" /> Stop
          </button>
        </div>
      </div>

      {/* CYCLIC STEAM STIMULATION (CSS) LIFECYCLE CONTROLLER */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-rose-50 border border-orange-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-orange-200/80 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-orange-100 border border-orange-300 text-orange-800 tracking-wider" title="Shut-in pump, inject superheated steam, soak formation, and resume hot flush production">
              CSS LIFECYCLE
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500 font-medium">Live Cycle Stage:</span>
            {isInjecting && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 border border-rose-300 text-rose-700 animate-pulse flex items-center gap-1">
                <Flame className="w-3 h-3" /> 1. STEAM INJECTION (HUFF)
              </span>
            )}
            {isSoaking && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 border border-amber-300 text-amber-700 animate-pulse flex items-center gap-1">
                <Hourglass className="w-3 h-3" /> 2. THERMAL SOAKING
              </span>
            )}
            {isHotFlush && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center gap-1">
                <Zap className="w-3 h-3" /> 3. HOT FLUSH PRODUCTION (PUFF)
              </span>
            )}
            {!isInjecting && !isSoaking && !isHotFlush && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 border border-gray-200 text-gray-700">
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
            title="Stop pump (0 SPM). Inject 280°C steam @ 125 bar (OIL tender up to 340°C & 165 bar). Viscosity collapses to ~20 cP."
            className={`flex items-center justify-between p-3 rounded-lg border transition active:scale-[0.98] ${
              isInjecting
                ? 'bg-rose-100 border-rose-400 ring-1 ring-rose-400 text-rose-950 shadow-sm'
                : 'bg-white border-gray-200 hover:border-rose-300 text-gray-800 shadow-sm'
            }`}
          >
            <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
              <Flame className="w-4 h-4" /> 1. Steam Injection
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
              PUMP OFF
            </span>
          </button>

          {/* Stage 2: Soak Well */}
          <button
            onClick={() => applyCssStage('SOAK')}
            disabled={loadingParam === 'css_SOAK'}
            title="Keep pump off (0 SPM). Formation shut-in for heat soaking & thermal diffusion (160°C @ 45 bar)."
            className={`flex items-center justify-between p-3 rounded-lg border transition active:scale-[0.98] ${
              isSoaking
                ? 'bg-amber-100 border-amber-400 ring-1 ring-amber-400 text-amber-950 shadow-sm'
                : 'bg-white border-gray-200 hover:border-amber-300 text-gray-800 shadow-sm'
            }`}
          >
            <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
              <Hourglass className="w-4 h-4" /> 2. Soak (Shut-In)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 font-semibold">
              PUMP OFF
            </span>
          </button>

          {/* Stage 3: Restart Production */}
          <button
            onClick={() => applyCssStage('PRODUCTION')}
            disabled={loadingParam === 'css_PRODUCTION'}
            title="Start pump (5.5 SPM, 40 Hz). Flush fluid at high initial rate (~48.5 BOPD) before gradual cooling."
            className={`flex items-center justify-between p-3 rounded-lg border transition active:scale-[0.98] ${
              isHotFlush
                ? 'bg-emerald-100 border-emerald-400 ring-1 ring-emerald-400 text-emerald-950 shadow-sm'
                : 'bg-white border-gray-200 hover:border-emerald-300 text-gray-800 shadow-sm'
            }`}
          >
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
              <Play className="w-4 h-4 fill-current" /> 3. Production (Puff)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
              PUMP ON
            </span>
          </button>
        </div>
      </div>

      {/* Quick Failure & Optimization Scenarios */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <span className="text-gray-500 block text-[11px] mb-2 font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" /> One-Click Simulation Scenarios:
        </span>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => applyScenario('Hot Steam Flush', { temperature_c: 85, spm: 5.5, tubing_pressure_bar: 22 })}
            className="px-3 py-1.5 rounded-md bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition active:scale-95 flex items-center gap-1"
            title="Sets temp=85°C, SPM=5.5, pressure=22 bar"
          >
            <Flame className="w-3 h-3" /> Hot Steam Flush
          </button>
          <button
            onClick={() => applyScenario('Cold Viscous Trap', { temperature_c: 32, spm: 6.5, tubing_pressure_bar: 25 })}
            className="px-3 py-1.5 rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 transition active:scale-95 flex items-center gap-1"
            title="Sets temp=32°C, SPM=6.5, pressure=25 bar"
          >
            <Snowflake className="w-3 h-3" /> Cold Shock
          </button>
          <button
            onClick={() => applyScenario('High-Speed Pumping', { vfd_frequency_hz: 55, spm: 7.5, stroke_length_m: 2.8 })}
            className="px-3 py-1.5 rounded-md bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 transition active:scale-95 flex items-center gap-1"
            title="Sets VFD=55Hz, SPM=7.5, stroke=2.8m"
          >
            <Settings className="w-3 h-3" /> High-Speed Pump
          </button>
          <button
            onClick={() => applyScenario('Deep Fluid Drawdown', { fluid_level_m: 1050, tubing_pressure_bar: 30 })}
            className="px-3 py-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 transition active:scale-95 flex items-center gap-1"
            title="Sets fluid level=1050m, pressure=30 bar"
          >
            <Droplets className="w-3 h-3" /> Deep Drawdown
          </button>
          <button
            onClick={() => applyScenario('Baseline Reset', { temperature_c: 50, spm: 5.5, vfd_frequency_hz: 40, stroke_length_m: 2.5, tubing_pressure_bar: 18.5, fluid_level_m: 850 })}
            className="px-3 py-1.5 rounded-md bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 transition active:scale-95 flex items-center gap-1"
            title="Reset all parameters to default values"
          >
            <RotateCcw className="w-3 h-3" /> Reset Baseline
          </button>
        </div>
      </div>

      {/* SECTION 1: OPERATOR ACTUATED CONTROLS (MACHINERY & SURFACE SETTINGS) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-sky-50 border border-sky-200 text-sky-700 tracking-wider" title="Parameters directly controllable by field operators and automation (DCS / VFD interventions)">
              OPERATOR &bull; SURFACE MACHINERY
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* 1. SPM (Pumping Speed) Control */}
          <div className="bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-600" /> Pumping Speed (SPM)
              </span>
              <span className="font-mono font-bold text-amber-600 text-sm">
                {spm <= 0.05 ? <span className="text-rose-600 font-bold">0.0 (STOPPED)</span> : `${spm.toFixed(1)} SPM`}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setParam('spm', 0.0)}
                className={`px-2 py-1 rounded border text-[11px] font-bold transition ${
                  spm <= 0.05
                    ? 'bg-rose-100 border-rose-300 text-rose-800'
                    : 'bg-white hover:bg-gray-100 border-gray-300 text-rose-600'
                }`}
                title="Stop pump (0 SPM)"
              >
                0 (Stop)
              </button>
              <button
                onClick={() => setParam('spm', Math.max(0, Math.round((spm - 0.5) * 10) / 10))}
                className="p-1.5 rounded bg-white hover:bg-gray-100 border border-gray-300 text-gray-700"
                title="-0.5 SPM"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setParam('spm', 3.5)} className="flex-1 py-1 rounded bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 text-[11px]">3.5</button>
              <button onClick={() => setParam('spm', 5.5)} className="flex-1 py-1 rounded bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 text-[11px]">5.5</button>
              <button onClick={() => setParam('spm', 7.5)} className="flex-1 py-1 rounded bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 text-[11px]">7.5</button>
              <button onClick={() => setParam('spm', 9.5)} className="flex-1 py-1 rounded bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 text-[11px]">9.5</button>
              <button
                onClick={() => setParam('spm', Math.min(15, Math.round((spm + 0.5) * 10) / 10))}
                className="p-1.5 rounded bg-white hover:bg-gray-100 border border-gray-300 text-gray-700"
                title="+0.5 SPM"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. VFD Frequency Control */}
          <div className="bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-sky-600" /> VFD Frequency (Hz)
              </span>
              <span className="font-mono font-bold text-sky-600 text-sm">
                {vfd <= 0.05 ? <span className="text-rose-600 font-bold">0.0 Hz (OFF)</span> : `${vfd.toFixed(1)} Hz`}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setParam('vfd_frequency_hz', 0)}
                className={`px-2 py-1 rounded border text-[11px] font-bold transition ${
                  vfd <= 0.05
                    ? 'bg-rose-100 border-rose-300 text-rose-800'
                    : 'bg-white hover:bg-gray-100 border-gray-300 text-rose-600'
                }`}
                title="Turn off VFD (0 Hz)"
              >
                0 Hz
              </button>
              <button
                onClick={() => setParam('vfd_frequency_hz', Math.max(0, Math.round(vfd - 5)))}
                className="p-1.5 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 shadow-sm"
                title="-5 Hz"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setParam('vfd_frequency_hz', 30)} className="flex-1 py-1 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[11px] shadow-sm">30 Hz</button>
              <button onClick={() => setParam('vfd_frequency_hz', 40)} className="flex-1 py-1 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[11px] shadow-sm">40 Hz</button>
              <button onClick={() => setParam('vfd_frequency_hz', 50)} className="flex-1 py-1 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[11px] shadow-sm">50 Hz</button>
              <button onClick={() => setParam('vfd_frequency_hz', 60)} className="flex-1 py-1 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[11px] shadow-sm">60 Hz</button>
              <button
                onClick={() => setParam('vfd_frequency_hz', Math.min(70, Math.round(vfd + 5)))}
                className="p-1.5 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 shadow-sm"
                title="+5 Hz"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. Stroke Length Control */}
          <div className="bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" /> Stroke Length (m)
              </span>
              <span className="font-mono font-bold text-emerald-600 text-sm">{stroke.toFixed(2)} m</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setParam('stroke_length_m', Math.max(1.0, Math.round((stroke - 0.2) * 10) / 10))}
                className="p-1.5 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 shadow-sm"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setParam('stroke_length_m', 1.8)} className="flex-1 py-1 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[11px] shadow-sm">1.8m</button>
              <button onClick={() => setParam('stroke_length_m', 2.5)} className="flex-1 py-1 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[11px] shadow-sm">2.5m</button>
              <button onClick={() => setParam('stroke_length_m', 3.2)} className="flex-1 py-1 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[11px] shadow-sm">3.2m</button>
              <button onClick={() => setParam('stroke_length_m', 4.0)} className="flex-1 py-1 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[11px] shadow-sm">4.0m</button>
              <button
                onClick={() => setParam('stroke_length_m', Math.min(5.0, Math.round((stroke + 0.2) * 10) / 10))}
                className="p-1.5 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 shadow-sm"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: NATURE & DOWNHOLE RESERVOIR DYNAMICS */}
      <div className="space-y-3 pt-3">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-amber-50 border border-amber-200 text-amber-700 tracking-wider" title="Environmental and in-situ physical conditions (Heat dissipation, Viscosity, Reservoir inflow)">
              NATURE &bull; DOWNHOLE &amp; RESERVOIR
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* 1. Reservoir / Wellbore Temperature Control */}
          <div className="bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-600" /> Wellbore Temp (°C)
              </span>
              <span className="font-mono font-bold text-rose-600 text-sm">{temp.toFixed(1)}°C</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setParam('temperature_c', Math.max(20, Math.round(temp - 5)))}
                className="p-1.5 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 shadow-sm"
                title="-5°C (Cooling)"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setParam('temperature_c', 35)} className="flex-1 py-1 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[11px] shadow-sm">35°C</button>
              <button onClick={() => setParam('temperature_c', 50)} className="flex-1 py-1 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[11px] shadow-sm">50°C</button>
              <button onClick={() => setParam('temperature_c', 75)} className="flex-1 py-1 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[11px] shadow-sm">75°C</button>
              <button onClick={() => setParam('temperature_c', 95)} className="flex-1 py-1 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[11px] shadow-sm">95°C</button>
              <button
                onClick={() => setParam('temperature_c', Math.min(180, Math.round(temp + 5)))}
                className="p-1.5 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 shadow-sm"
                title="+5°C (Steam Injection)"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. Tubing Hydraulic Pressure Control */}
          <div className="bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-sky-600" /> Tubing Pressure (bar)
              </span>
              <span className="font-mono font-bold text-sky-600 text-sm">{press.toFixed(1)} bar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setParam('tubing_pressure_bar', Math.max(5, Math.round(press - 5)))}
                className="p-1.5 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 shadow-sm"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setParam('tubing_pressure_bar', 15)} className="flex-1 py-1 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[11px] shadow-sm">15 bar</button>
              <button onClick={() => setParam('tubing_pressure_bar', 25)} className="flex-1 py-1 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[11px] shadow-sm">25 bar</button>
              <button onClick={() => setParam('tubing_pressure_bar', 40)} className="flex-1 py-1 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[11px] shadow-sm">40 bar</button>
              <button onClick={() => setParam('tubing_pressure_bar', 60)} className="flex-1 py-1 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[11px] shadow-sm">60 bar</button>
              <button
                onClick={() => setParam('tubing_pressure_bar', Math.min(90, Math.round(press + 5)))}
                className="p-1.5 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 shadow-sm"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. Fluid Level Depth Control */}
          <div className="bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" /> Fluid Level Depth (m)
              </span>
              <span className="font-mono font-bold text-indigo-600 text-sm">{fluidLevel.toFixed(0)} m</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setParam('fluid_level_m', Math.max(300, Math.round(fluidLevel - 50)))}
                className="p-1.5 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 shadow-sm"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setParam('fluid_level_m', 650)} className="flex-1 py-1 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[11px] shadow-sm">650m</button>
              <button onClick={() => setParam('fluid_level_m', 850)} className="flex-1 py-1 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[11px] shadow-sm">850m</button>
              <button onClick={() => setParam('fluid_level_m', 1050)} className="flex-1 py-1 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[11px] shadow-sm">1050m</button>
              <button
                onClick={() => setParam('fluid_level_m', Math.min(1150, Math.round(fluidLevel + 50)))}
                className="p-1.5 rounded bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 shadow-sm"
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
