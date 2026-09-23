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
  Snowflake,
  Settings,
  Droplets,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
        setLastMessage(`✓ SETPOINT DISPATCH: ${parameter.toUpperCase()} = ${value}`);
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
  const activeStage =
    latest?.operating_stage ||
    (isPumpStopped ? (temp >= 180 ? 'STEAM' : temp >= 90 ? 'SOAK' : 'STOPPED') : 'PRODUCTION');
  const isInjecting = activeStage === 'STEAM';
  const isSoaking = activeStage === 'SOAK';
  const isHotFlush = activeStage === 'PRODUCTION' && temp >= 70;

  return (
    <div className="bg-[#0D1219] border border-[#1E293B] rounded-lg p-4 space-y-4 relative overflow-hidden shadow-xl">
      {/* Top Cockpit Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-[#111821] border border-[#1E293B] text-emerald-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
                SIMULATION &amp; EXPERIMENTAL SETPOINT COCKPIT
              </h3>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
                PHYSICS ENGINE // PORT 3001
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              DISPATCH REAL-TIME DYNAMIC SETPOINTS TO WELL SYSTEM SIMULATOR
            </p>
          </div>
        </div>

        {/* Runtime Loop State & Action Buttons */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <AnimatePresence>
            {lastMessage && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded text-[10px] flex items-center gap-1"
              >
                <Terminal className="w-3 h-3 text-emerald-400" />
                {lastMessage}
              </motion.span>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => controlLoop('start')}
            disabled={loadingParam === 'loop_start'}
            className="flex items-center gap-1 px-3 py-1 rounded bg-[#111821] hover:bg-emerald-500/20 border border-[#1E293B] hover:border-emerald-500/40 text-emerald-300 font-semibold transition cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" /> RESUME
          </button>

          <button
            type="button"
            onClick={() => controlLoop('stop')}
            disabled={loadingParam === 'loop_stop'}
            className="flex items-center gap-1 px-3 py-1 rounded bg-[#111821] hover:bg-rose-500/20 border border-[#1E293B] hover:border-rose-500/40 text-rose-300 font-semibold transition cursor-pointer"
          >
            <Square className="w-3 h-3 fill-current" /> PAUSE
          </button>
        </div>
      </div>

      {/* Cyclic Steam Stimulation (CSS) Stage Transitions */}
      <div className="bg-[#111821] border border-[#1E293B] rounded p-3.5 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E293B] pb-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300 tracking-wider">
            CYCLIC STEAM STIMULATION (CSS) LIFECYCLE DISPATCH
          </span>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="text-slate-400">ACTIVE STAGE:</span>
            {isInjecting && (
              <span className="px-2 py-0.5 rounded font-bold bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center gap-1">
                <Flame className="w-3 h-3 text-rose-400" /> 1. STEAM INJECTION (HUFF)
              </span>
            )}
            {isSoaking && (
              <span className="px-2 py-0.5 rounded font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1">
                <Hourglass className="w-3 h-3 text-amber-400" /> 2. THERMAL SOAKING
              </span>
            )}
            {isHotFlush && (
              <span className="px-2 py-0.5 rounded font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" /> 3. HOT FLUSH (PUFF)
              </span>
            )}
            {!isInjecting && !isSoaking && !isHotFlush && (
              <span className="px-2 py-0.5 rounded bg-[#080B10] border border-[#1E293B] text-slate-300">
                {isPumpStopped ? 'PUMP STOPPED' : 'STEADY PRODUCTION'}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => applyCssStage('STEAM')}
            disabled={loadingParam === 'css_STEAM'}
            className={`flex items-center justify-between p-2.5 rounded border transition font-mono ${
              isInjecting
                ? 'bg-rose-500/20 border-rose-500/60 text-white'
                : 'bg-[#080B10] border-[#1E293B] hover:border-rose-500/40 text-slate-200'
            }`}
          >
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" /> 1. Steam Injection
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300">
              PUMP OFF
            </span>
          </button>

          <button
            type="button"
            onClick={() => applyCssStage('SOAK')}
            disabled={loadingParam === 'css_SOAK'}
            className={`flex items-center justify-between p-2.5 rounded border transition font-mono ${
              isSoaking
                ? 'bg-amber-500/20 border-amber-500/60 text-white'
                : 'bg-[#080B10] border-[#1E293B] hover:border-amber-500/40 text-slate-200'
            }`}
          >
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Hourglass className="w-3.5 h-3.5" /> 2. Soak (Shut-In)
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
              PUMP OFF
            </span>
          </button>

          <button
            type="button"
            onClick={() => applyCssStage('PRODUCTION')}
            disabled={loadingParam === 'css_PRODUCTION'}
            className={`flex items-center justify-between p-2.5 rounded border transition font-mono ${
              isHotFlush
                ? 'bg-emerald-500/20 border-emerald-500/60 text-white'
                : 'bg-[#080B10] border-[#1E293B] hover:border-emerald-500/40 text-slate-200'
            }`}
          >
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 fill-current" /> 3. Production (Puff)
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              PUMP ON
            </span>
          </button>
        </div>
      </div>

      {/* Preset Scenarios Strip */}
      <div className="bg-[#111821] border border-[#1E293B] rounded p-3 space-y-2">
        <span className="text-slate-400 block text-[10px] font-mono font-semibold uppercase flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> ONE-CLICK DIGITAL TWIN EXPERIMENTAL SCENARIOS:
        </span>
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          <button
            type="button"
            onClick={() => applyScenario('Hot Steam Flush', { temperature_c: 85, spm: 5.5, tubing_pressure_bar: 22 })}
            className="px-2.5 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-rose-500/30 text-rose-300 transition flex items-center gap-1 text-[10px]"
          >
            <Flame className="w-3 h-3 text-rose-400" /> Hot Steam Flush (85°C)
          </button>
          <button
            type="button"
            onClick={() => applyScenario('Cold Viscous Trap', { temperature_c: 32, spm: 6.5, tubing_pressure_bar: 25 })}
            className="px-2.5 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-amber-500/30 text-amber-300 transition flex items-center gap-1 text-[10px]"
          >
            <Snowflake className="w-3 h-3 text-amber-400" /> Cold Shock (32°C)
          </button>
          <button
            type="button"
            onClick={() => applyScenario('High-Speed Pumping', { vfd_frequency_hz: 55, spm: 7.5, stroke_length_m: 2.8 })}
            className="px-2.5 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-sky-500/30 text-sky-300 transition flex items-center gap-1 text-[10px]"
          >
            <Settings className="w-3 h-3 text-sky-400" /> High-Speed (7.5 SPM)
          </button>
          <button
            type="button"
            onClick={() => applyScenario('Deep Fluid Drawdown', { fluid_level_m: 1050, tubing_pressure_bar: 30 })}
            className="px-2.5 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-indigo-500/30 text-indigo-300 transition flex items-center gap-1 text-[10px]"
          >
            <Droplets className="w-3 h-3 text-indigo-400" /> Deep Drawdown (1050m)
          </button>
          <button
            type="button"
            onClick={() =>
              applyScenario('Baseline Reset', {
                temperature_c: 50,
                spm: 5.5,
                vfd_frequency_hz: 40,
                stroke_length_m: 2.5,
                tubing_pressure_bar: 18.5,
                fluid_level_m: 850,
              })
            }
            className="px-2.5 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300 transition flex items-center gap-1 text-[10px]"
          >
            <RotateCcw className="w-3 h-3" /> Reset Baseline
          </button>
        </div>
      </div>

      {/* Surface Machinery & Lift Setpoints */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-1.5">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-sky-500/10 border border-sky-500/30 text-sky-300 tracking-wider">
            SURFACE MACHINERY SETPOINTS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          {/* SPM */}
          <div className="bg-[#111821] border border-[#1E293B] rounded p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium flex items-center gap-1.5 text-[11px]">
                <Activity className="w-3 h-3 text-amber-400" /> Pumping Speed (SPM)
              </span>
              <span className="font-bold text-amber-400">
                {spm <= 0.05 ? <span className="text-rose-400">0.0 (OFF)</span> : `${spm.toFixed(1)} SPM`}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setParam('spm', 0.0)}
                className={`px-2 py-1 rounded border text-[10px] font-bold transition ${
                  spm <= 0.05
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                    : 'bg-[#080B10] hover:bg-[#151D27] border-[#1E293B] text-rose-400'
                }`}
              >
                0
              </button>
              <button
                type="button"
                onClick={() => setParam('spm', Math.max(0, Math.round((spm - 0.5) * 10) / 10))}
                className="p-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
              <button type="button" onClick={() => setParam('spm', 3.5)} className="flex-1 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300 text-[10px]">3.5</button>
              <button type="button" onClick={() => setParam('spm', 5.5)} className="flex-1 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300 text-[10px]">5.5</button>
              <button type="button" onClick={() => setParam('spm', 7.5)} className="flex-1 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300 text-[10px]">7.5</button>
              <button type="button" onClick={() => setParam('spm', 9.5)} className="flex-1 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300 text-[10px]">9.5</button>
              <button
                type="button"
                onClick={() => setParam('spm', Math.min(15, Math.round((spm + 0.5) * 10) / 10))}
                className="p-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* VFD */}
          <div className="bg-[#111821] border border-[#1E293B] rounded p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium flex items-center gap-1.5 text-[11px]">
                <Zap className="w-3 h-3 text-cyan-400" /> VFD Frequency (Hz)
              </span>
              <span className="font-bold text-cyan-400">
                {vfd <= 0.05 ? <span className="text-rose-400">0.0 Hz (OFF)</span> : `${vfd.toFixed(1)} Hz`}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setParam('vfd_frequency_hz', 0)}
                className={`px-2 py-1 rounded border text-[10px] font-bold transition ${
                  vfd <= 0.05
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                    : 'bg-[#080B10] hover:bg-[#151D27] border-[#1E293B] text-rose-400'
                }`}
              >
                0Hz
              </button>
              <button
                type="button"
                onClick={() => setParam('vfd_frequency_hz', Math.max(0, Math.round(vfd - 5)))}
                className="p-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
              <button type="button" onClick={() => setParam('vfd_frequency_hz', 30)} className="flex-1 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300 text-[10px]">30</button>
              <button type="button" onClick={() => setParam('vfd_frequency_hz', 40)} className="flex-1 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300 text-[10px]">40</button>
              <button type="button" onClick={() => setParam('vfd_frequency_hz', 50)} className="flex-1 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300 text-[10px]">50</button>
              <button type="button" onClick={() => setParam('vfd_frequency_hz', 60)} className="flex-1 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300 text-[10px]">60</button>
              <button
                type="button"
                onClick={() => setParam('vfd_frequency_hz', Math.min(70, Math.round(vfd + 5)))}
                className="p-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Stroke Length */}
          <div className="bg-[#111821] border border-[#1E293B] rounded p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium flex items-center gap-1.5 text-[11px]">
                <Layers className="w-3 h-3 text-emerald-400" /> Stroke Length (m)
              </span>
              <span className="font-bold text-emerald-400">{stroke.toFixed(2)} m</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setParam('stroke_length_m', Math.max(1.0, Math.round((stroke - 0.2) * 10) / 10))}
                className="p-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
              <button type="button" onClick={() => setParam('stroke_length_m', 1.8)} className="flex-1 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300 text-[10px]">1.8m</button>
              <button type="button" onClick={() => setParam('stroke_length_m', 2.5)} className="flex-1 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300 text-[10px]">2.5m</button>
              <button type="button" onClick={() => setParam('stroke_length_m', 3.2)} className="flex-1 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300 text-[10px]">3.2m</button>
              <button type="button" onClick={() => setParam('stroke_length_m', 4.0)} className="flex-1 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300 text-[10px]">4.0m</button>
              <button
                type="button"
                onClick={() => setParam('stroke_length_m', Math.min(5.0, Math.round((stroke + 0.2) * 10) / 10))}
                className="p-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nature & Downhole Reservoir Dynamics */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-1.5">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300 tracking-wider">
            RESERVOIR &amp; DOWNHOLE CONDITIONS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          {/* Temperature */}
          <div className="bg-[#111821] border border-[#1E293B] rounded p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium flex items-center gap-1.5 text-[11px]">
                <Flame className="w-3 h-3 text-rose-400" /> Wellbore Temp (°C)
              </span>
              <span className="font-bold text-rose-400">{temp.toFixed(1)}°C</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setParam('temperature_c', Math.max(20, Math.round(temp - 5)))}
                className="p-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
              <button type="button" onClick={() => setParam('temperature_c', 35)} className="flex-1 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300 text-[10px]">35°C</button>
              <button type="button" onClick={() => setParam('temperature_c', 50)} className="flex-1 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300 text-[10px]">50°C</button>
              <button type="button" onClick={() => setParam('temperature_c', 75)} className="flex-1 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300 text-[10px]">75°C</button>
              <button type="button" onClick={() => setParam('temperature_c', 95)} className="flex-1 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300 text-[10px]">95°C</button>
              <button
                type="button"
                onClick={() => setParam('temperature_c', Math.min(180, Math.round(temp + 5)))}
                className="p-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Tubing Pressure */}
          <div className="bg-[#111821] border border-[#1E293B] rounded p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium flex items-center gap-1.5 text-[11px]">
                <Gauge className="w-3 h-3 text-cyan-400" /> Tubing Pressure (bar)
              </span>
              <span className="font-bold text-cyan-400">{press.toFixed(1)} bar</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setParam('tubing_pressure_bar', Math.max(5, Math.round(press - 5)))}
                className="p-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
              <button type="button" onClick={() => setParam('tubing_pressure_bar', 15)} className="flex-1 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300 text-[10px]">15</button>
              <button type="button" onClick={() => setParam('tubing_pressure_bar', 25)} className="flex-1 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300 text-[10px]">25</button>
              <button type="button" onClick={() => setParam('tubing_pressure_bar', 40)} className="flex-1 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300 text-[10px]">40</button>
              <button type="button" onClick={() => setParam('tubing_pressure_bar', 60)} className="flex-1 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300 text-[10px]">60</button>
              <button
                type="button"
                onClick={() => setParam('tubing_pressure_bar', Math.min(90, Math.round(press + 5)))}
                className="p-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Fluid Level Depth */}
          <div className="bg-[#111821] border border-[#1E293B] rounded p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium flex items-center gap-1.5 text-[11px]">
                <Layers className="w-3 h-3 text-indigo-400" /> Fluid Level Depth (m)
              </span>
              <span className="font-bold text-indigo-400">{fluidLevel.toFixed(0)} m</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setParam('fluid_level_m', Math.max(300, Math.round(fluidLevel - 50)))}
                className="p-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
              <button type="button" onClick={() => setParam('fluid_level_m', 650)} className="flex-1 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300 text-[10px]">650m</button>
              <button type="button" onClick={() => setParam('fluid_level_m', 850)} className="flex-1 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300 text-[10px]">850m</button>
              <button type="button" onClick={() => setParam('fluid_level_m', 1050)} className="flex-1 py-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300 text-[10px]">1050m</button>
              <button
                type="button"
                onClick={() => setParam('fluid_level_m', Math.min(1150, Math.round(fluidLevel + 50)))}
                className="p-1 rounded bg-[#080B10] hover:bg-[#151D27] border border-[#1E293B] text-slate-300"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulatorControls;
