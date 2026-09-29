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
  Cpu,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TelemetryRecord } from '@/types/telemetry';
import { DigitalTwinSchematic } from './DigitalTwinSchematic';

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
  const url = simulatorApiUrl || process.env.NEXT_PUBLIC_SIMULATOR_API_URL || 'http://localhost:4001';
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
  const bopd = latest?.production_bopd ?? 48.2;
  const rodLoad = latest?.rod_load_kn ?? 68.4;
  const viscCp = latest?.viscosity_cp ?? 10240;

  const isPumpStopped = spm <= 0.05;
  const activeStage =
    latest?.operating_stage ||
    (isPumpStopped ? (temp >= 180 ? 'STEAM' : temp >= 90 ? 'SOAK' : 'STOPPED') : 'PRODUCTION');
  const isInjecting = activeStage === 'STEAM';
  const isSoaking = activeStage === 'SOAK';
  const isHotFlush = activeStage === 'PRODUCTION' && temp >= 70;

  return (
    <div className="space-y-4">
      {/* Top Cockpit Header */}
      <div className="scada-panel rounded-sm p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-sm bg-[#0F1622] border border-[#1E2A3B] text-emerald-400 shrink-0">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
                IN-SILICO SIMULATION &amp; EXPERIMENTAL SETPOINT WORKSTATION
              </h3>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
                PORT 4001 // DIGITAL TWIN LOOP
              </span>
            </div>
            <p className="text-[9.5px] font-mono text-slate-400">
              PHYSICAL RESERVOIR INFLOW &bull; SUCKER ROD KINEMATICS &bull; HEAT CONDUCTION DISSIPATION
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
                className="text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-sm text-[9.5px] flex items-center gap-1"
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
            className="flex items-center gap-1 px-3 py-1 rounded-sm bg-[#0F1622] hover:bg-emerald-500/20 border border-[#1E2A3B] hover:border-emerald-500/40 text-emerald-300 font-semibold transition cursor-pointer text-[10px]"
          >
            <Play className="w-3 h-3 fill-current" /> RESUME LOOP
          </button>

          <button
            type="button"
            onClick={() => controlLoop('stop')}
            disabled={loadingParam === 'loop_stop'}
            className="flex items-center gap-1 px-3 py-1 rounded-sm bg-[#0F1622] hover:bg-rose-500/20 border border-[#1E2A3B] hover:border-rose-500/40 text-rose-300 font-semibold transition cursor-pointer text-[10px]"
          >
            <Square className="w-3 h-3 fill-current" /> PAUSE LOOP
          </button>
        </div>
      </div>

      {/* Preset Scenarios Strip */}
      <div className="scada-panel rounded-sm p-3 space-y-2">
        <span className="text-slate-400 block text-[10px] font-mono font-semibold uppercase flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> PRESET EXPERIMENTAL SCENARIOS:
        </span>
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          <button
            type="button"
            onClick={() => applyScenario('Hot Steam Flush', { temperature_c: 85, spm: 5.5, tubing_pressure_bar: 22 })}
            className="px-2.5 py-1 rounded-sm bg-[#070A0F] hover:bg-[#141E2E] border border-rose-500/30 text-rose-300 transition flex items-center gap-1 text-[10px]"
          >
            <Flame className="w-3 h-3 text-rose-400" /> Hot Steam Flush (85°C)
          </button>
          <button
            type="button"
            onClick={() => applyScenario('Cold Viscous Shock', { temperature_c: 32, spm: 6.5, tubing_pressure_bar: 25 })}
            className="px-2.5 py-1 rounded-sm bg-[#070A0F] hover:bg-[#141E2E] border border-amber-500/30 text-amber-300 transition flex items-center gap-1 text-[10px]"
          >
            <Snowflake className="w-3 h-3 text-amber-400" /> Cold Shock (32°C)
          </button>
          <button
            type="button"
            onClick={() => applyScenario('High-Speed Pumping', { vfd_frequency_hz: 55, spm: 7.5, stroke_length_m: 2.8 })}
            className="px-2.5 py-1 rounded-sm bg-[#070A0F] hover:bg-[#141E2E] border border-sky-500/30 text-sky-300 transition flex items-center gap-1 text-[10px]"
          >
            <Settings className="w-3 h-3 text-sky-400" /> High-Speed (7.5 SPM)
          </button>
          <button
            type="button"
            onClick={() => applyScenario('Deep Drawdown', { fluid_level_m: 1050, tubing_pressure_bar: 30 })}
            className="px-2.5 py-1 rounded-sm bg-[#070A0F] hover:bg-[#141E2E] border border-indigo-500/30 text-indigo-300 transition flex items-center gap-1 text-[10px]"
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
            className="px-2.5 py-1 rounded-sm bg-[#070A0F] hover:bg-[#141E2E] border border-[#1E2A3B] text-slate-300 transition flex items-center gap-1 text-[10px]"
          >
            <RotateCcw className="w-3 h-3" /> Reset Baseline
          </button>
        </div>
      </div>

      {/* 3-Column Engineering Simulation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: Controls & CSS Lifecycle (4 cols) */}
        <div className="lg:col-span-4 space-y-3.5">
          {/* Cyclic Steam Stimulation (CSS) Stage Transitions */}
          <div className="scada-panel rounded-sm p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#1E2A3B] pb-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300 tracking-wider">
                CSS LIFECYCLE DISPATCH
              </span>
              <span className="text-[9.5px] font-mono text-slate-400">
                ACTIVE: <strong className="text-amber-300">{activeStage}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => applyCssStage('STEAM')}
                disabled={loadingParam === 'css_STEAM'}
                className={`flex items-center justify-between p-2.5 rounded-sm border transition font-mono ${
                  isInjecting
                    ? 'bg-rose-500/20 border-rose-500/60 text-white'
                    : 'bg-[#0F1622] border-[#1E2A3B] hover:border-rose-500/40 text-slate-200'
                }`}
              >
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" /> 1. Steam Injection (Huff)
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold">
                  PUMP OFF
                </span>
              </button>

              <button
                type="button"
                onClick={() => applyCssStage('SOAK')}
                disabled={loadingParam === 'css_SOAK'}
                className={`flex items-center justify-between p-2.5 rounded-sm border transition font-mono ${
                  isSoaking
                    ? 'bg-amber-500/20 border-amber-500/60 text-white'
                    : 'bg-[#0F1622] border-[#1E2A3B] hover:border-amber-500/40 text-slate-200'
                }`}
              >
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Hourglass className="w-3.5 h-3.5" /> 2. Thermal Soak (Shut-In)
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
                  PUMP OFF
                </span>
              </button>

              <button
                type="button"
                onClick={() => applyCssStage('PRODUCTION')}
                disabled={loadingParam === 'css_PRODUCTION'}
                className={`flex items-center justify-between p-2.5 rounded-sm border transition font-mono ${
                  isHotFlush
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-white'
                    : 'bg-[#0F1622] border-[#1E2A3B] hover:border-emerald-500/40 text-slate-200'
                }`}
              >
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 fill-current" /> 3. Production Flush (Puff)
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
                  PUMP ON
                </span>
              </button>
            </div>
          </div>

          {/* Steppers & Setpoints */}
          <div className="scada-panel rounded-sm p-3.5 space-y-3">
            <div className="border-b border-[#1E2A3B] pb-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm font-bold bg-sky-500/10 border border-sky-500/30 text-sky-300 tracking-wider">
                SURFACE MACHINERY SETPOINTS
              </span>
            </div>

            {/* SPM */}
            <div className="bg-[#0F1622] border border-[#1E2A3B] rounded-sm p-2.5 space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium flex items-center gap-1 text-[10.5px]">
                  <Activity className="w-3 h-3 text-amber-400" /> Speed (SPM)
                </span>
                <span className="font-bold text-amber-400">
                  {spm <= 0.05 ? <span className="text-rose-400">0.0 (OFF)</span> : `${spm.toFixed(1)} SPM`}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setParam('spm', 0.0)}
                  className="px-2 py-0.5 rounded-sm border border-[#1E2A3B] text-rose-400 hover:bg-[#141E2E] text-[10px] font-bold"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => setParam('spm', Math.max(0, Math.round((spm - 0.5) * 10) / 10))}
                  className="p-1 rounded-sm bg-[#070A0F] hover:bg-[#141E2E] border border-[#1E2A3B] text-slate-300"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button type="button" onClick={() => setParam('spm', 3.5)} className="flex-1 py-0.5 rounded-sm bg-[#070A0F] hover:bg-[#141E2E] border border-[#1E2A3B] text-slate-300 text-[10px]">3.5</button>
                <button type="button" onClick={() => setParam('spm', 5.5)} className="flex-1 py-0.5 rounded-sm bg-[#070A0F] hover:bg-[#141E2E] border border-[#1E2A3B] text-slate-300 text-[10px]">5.5</button>
                <button type="button" onClick={() => setParam('spm', 7.5)} className="flex-1 py-0.5 rounded-sm bg-[#070A0F] hover:bg-[#141E2E] border border-[#1E2A3B] text-slate-300 text-[10px]">7.5</button>
                <button
                  type="button"
                  onClick={() => setParam('spm', Math.min(15, Math.round((spm + 0.5) * 10) / 10))}
                  className="p-1 rounded-sm bg-[#070A0F] hover:bg-[#141E2E] border border-[#1E2A3B] text-slate-300"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* VFD */}
            <div className="bg-[#0F1622] border border-[#1E2A3B] rounded-sm p-2.5 space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium flex items-center gap-1 text-[10.5px]">
                  <Zap className="w-3 h-3 text-cyan-400" /> VFD Freq (Hz)
                </span>
                <span className="font-bold text-cyan-400">
                  {vfd <= 0.05 ? <span className="text-rose-400">0.0 Hz</span> : `${vfd.toFixed(1)} Hz`}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setParam('vfd_frequency_hz', Math.max(0, Math.round(vfd - 5)))}
                  className="p-1 rounded-sm bg-[#070A0F] hover:bg-[#141E2E] border border-[#1E2A3B] text-slate-300"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button type="button" onClick={() => setParam('vfd_frequency_hz', 30)} className="flex-1 py-0.5 rounded-sm bg-[#070A0F] hover:bg-[#141E2E] border border-[#1E2A3B] text-slate-300 text-[10px]">30</button>
                <button type="button" onClick={() => setParam('vfd_frequency_hz', 40)} className="flex-1 py-0.5 rounded-sm bg-[#070A0F] hover:bg-[#141E2E] border border-[#1E2A3B] text-slate-300 text-[10px]">40</button>
                <button type="button" onClick={() => setParam('vfd_frequency_hz', 50)} className="flex-1 py-0.5 rounded-sm bg-[#070A0F] hover:bg-[#141E2E] border border-[#1E2A3B] text-slate-300 text-[10px]">50</button>
                <button
                  type="button"
                  onClick={() => setParam('vfd_frequency_hz', Math.min(70, Math.round(vfd + 5)))}
                  className="p-1 rounded-sm bg-[#070A0F] hover:bg-[#141E2E] border border-[#1E2A3B] text-slate-300"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Temperature */}
            <div className="bg-[#0F1622] border border-[#1E2A3B] rounded-sm p-2.5 space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium flex items-center gap-1 text-[10.5px]">
                  <Flame className="w-3 h-3 text-rose-400" /> Wellbore Temp (°C)
                </span>
                <span className="font-bold text-rose-400">{temp.toFixed(1)}°C</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setParam('temperature_c', Math.max(20, Math.round(temp - 5)))}
                  className="p-1 rounded-sm bg-[#070A0F] hover:bg-[#141E2E] border border-[#1E2A3B] text-slate-300"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button type="button" onClick={() => setParam('temperature_c', 35)} className="flex-1 py-0.5 rounded-sm bg-[#070A0F] hover:bg-[#141E2E] border border-[#1E2A3B] text-slate-300 text-[10px]">35°C</button>
                <button type="button" onClick={() => setParam('temperature_c', 50)} className="flex-1 py-0.5 rounded-sm bg-[#070A0F] hover:bg-[#141E2E] border border-[#1E2A3B] text-slate-300 text-[10px]">50°C</button>
                <button type="button" onClick={() => setParam('temperature_c', 75)} className="flex-1 py-0.5 rounded-sm bg-[#070A0F] hover:bg-[#141E2E] border border-[#1E2A3B] text-slate-300 text-[10px]">75°C</button>
                <button
                  type="button"
                  onClick={() => setParam('temperature_c', Math.min(180, Math.round(temp + 5)))}
                  className="p-1 rounded-sm bg-[#070A0F] hover:bg-[#141E2E] border border-[#1E2A3B] text-slate-300"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Large Simulation Visualization (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          <DigitalTwinSchematic latest={latest} />
        </div>

        {/* RIGHT COLUMN: Results, Diagnostics & Current State (3 cols) */}
        <div className="lg:col-span-3 space-y-3.5 font-mono text-xs">
          <div className="scada-panel rounded-sm p-3.5 space-y-3">
            <div className="border-b border-[#1E2A3B] pb-2 flex items-center justify-between">
              <span className="text-slate-300 font-bold text-xs flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" /> SIMULATION RESPONSE
              </span>
              <span className="text-[9px] text-emerald-300 bg-emerald-500/10 px-1 py-0.2 rounded-sm border border-emerald-500/30">
                PORT 4001
              </span>
            </div>

            <div className="space-y-2 text-[10.5px]">
              <div className="flex justify-between bg-[#0F1622] p-2 rounded-sm border border-[#1E2A3B]">
                <span className="text-slate-400">GROSS PRODUCTION:</span>
                <strong className="text-emerald-400">{bopd.toFixed(1)} BOPD</strong>
              </div>

              <div className="flex justify-between bg-[#0F1622] p-2 rounded-sm border border-[#1E2A3B]">
                <span className="text-slate-400">POLISHED ROD LOAD:</span>
                <strong className="text-amber-400">{rodLoad.toFixed(1)} kN</strong>
              </div>

              <div className="flex justify-between bg-[#0F1622] p-2 rounded-sm border border-[#1E2A3B]">
                <span className="text-slate-400">CRUDE VISCOSITY:</span>
                <strong className="text-purple-400">{Math.round(viscCp).toLocaleString()} cP</strong>
              </div>

              <div className="flex justify-between bg-[#0F1622] p-2 rounded-sm border border-[#1E2A3B]">
                <span className="text-slate-400">TUBING PRESSURE:</span>
                <strong className="text-cyan-400">{press.toFixed(1)} bar</strong>
              </div>

              <div className="flex justify-between bg-[#0F1622] p-2 rounded-sm border border-[#1E2A3B]">
                <span className="text-slate-400">FLUID LEVEL:</span>
                <strong className="text-slate-200">{fluidLevel.toFixed(0)} m</strong>
              </div>
            </div>

            <div className="p-2.5 rounded-sm bg-[#0F1622] border border-[#1E2A3B] text-[9.5px] text-slate-400 space-y-1">
              <div className="font-bold text-slate-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                CONVERGENCE TOLERANCE
              </div>
              <p>Physical residual error &lt; 0.001%. Continuous solver synchronized with client clock.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulatorControls;
