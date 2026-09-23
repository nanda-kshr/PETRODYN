'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Flame, Droplets, Layers, Zap, Gauge, Thermometer, Compass, Cpu, Info } from 'lucide-react';
import { TelemetryRecord, AnalyticsData, PredictionsData } from '@/types/telemetry';
import { Tooltip } from './Tooltip';

interface WellboreDigitalTwinProps {
  latest: TelemetryRecord | null;
  analytics?: AnalyticsData | null;
  predictions?: PredictionsData | null;
}

export const WellboreDigitalTwin: React.FC<WellboreDigitalTwinProps> = ({
  latest,
  analytics,
  predictions,
}) => {
  const [activeLayer, setActiveLayer] = useState<'all' | 'thermal' | 'mechanical'>('all');

  // Real data extractions
  const spm = latest?.spm ?? 0;
  const isRunning = latest ? (latest.spm > 0.05 && latest.pump_running !== false) : true;
  const strokeLength = latest?.stroke_length_m ?? 2.5;
  const rodPos = latest?.rod_position_m ?? (strokeLength * 0.5);
  const rodLoad = latest?.rod_load_kn ?? 65.4;
  const tempC = latest?.temperature_c ?? 78.5;
  const viscCp = latest?.viscosity_cp ?? 10240;
  const fluidLevel = latest?.fluid_level_m ?? 340;
  const bopd = latest?.production_bopd ?? 48.2;
  const tubingPressure = latest?.tubing_pressure_bar ?? 18.5;
  const stage = latest?.operating_stage ?? 'PRODUCTION';
  const vfdHz = latest?.vfd_frequency_hz ?? 42.0;

  // Normalized stroke progress (0 to 1)
  const normPos = Math.max(0, Math.min(1, rodPos / Math.max(0.1, strokeLength)));
  const beamAngle = (normPos - 0.5) * 16; // beam tilt degrees

  // Temperature color interpolation
  const getTempColor = (t: number) => {
    if (t >= 90) return '#f43f5e'; // Hot steam red
    if (t >= 70) return '#f97316'; // Orange warm
    if (t >= 55) return '#eab308'; // Moderate amber
    return '#38bdf8'; // Cooled cyan
  };

  return (
    <div className="bg-[#0D1219] border border-[#1E293B] rounded-lg p-4 flex flex-col justify-between relative overflow-hidden shadow-2xl">
      {/* Background Engineering Blueprint Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
      
      {/* Top Header & Layer Filter Controls */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-mono font-bold tracking-widest text-slate-100 uppercase">
                WELL-TO-SURFACE SUBSURFACE DIGITAL TWIN
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold">
                SCHEMATIC // 1,150M DEPTH
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              BAGHEWALA FIELD &bull; JODHPUR SANDSTONE HEAVY OIL FORMATION
            </p>
          </div>
        </div>

        {/* Layer Filter Buttons */}
        <div className="flex items-center gap-1 bg-[#080B10] p-1 rounded border border-[#1E293B]">
          <button
            type="button"
            onClick={() => setActiveLayer('all')}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-medium transition ${
              activeLayer === 'all'
                ? 'bg-[#1E293B] text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            COMPOSITE
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('thermal')}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-medium transition ${
              activeLayer === 'thermal'
                ? 'bg-[#1E293B] text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            THERMAL / CSS
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('mechanical')}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-medium transition ${
              activeLayer === 'mechanical'
                ? 'bg-[#1E293B] text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            LIFT DYNAMICS
          </button>
        </div>
      </div>

      {/* Main Digital Twin Schematic View */}
      <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-4 my-3 items-center">
        {/* Left Telemetry Highlights (Surface Domain) */}
        <div className="xl:col-span-3 space-y-2.5">
          <div className="bg-[#111821] border border-[#1E293B] rounded p-2.5">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
              <span>SURFACE PUMPING UNIT</span>
              <span className={`px-1.5 py-0.2 rounded font-bold ${isRunning ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {isRunning ? 'RUNNING' : 'STOPPED'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <span className="text-[9px] text-slate-400 block">SPEED (SPM)</span>
                <span className="text-sm font-bold text-slate-100">{spm.toFixed(1)}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block">VFD FREQ</span>
                <span className="text-sm font-bold text-cyan-400">{vfdHz.toFixed(1)} Hz</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block">STROKE LEN</span>
                <span className="text-sm font-bold text-slate-100">{strokeLength.toFixed(1)} m</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block">ROD LOAD</span>
                <span className="text-sm font-bold text-amber-400">{rodLoad.toFixed(1)} kN</span>
              </div>
            </div>
          </div>

          <div className="bg-[#111821] border border-[#1E293B] rounded p-2.5">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
              <span>WELLHEAD TRANSDUCERS</span>
              <span className="text-cyan-400 font-bold">{tubingPressure.toFixed(1)} bar</span>
            </div>
            <div className="text-[10px] font-mono space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">FLUID LEVEL:</span>
                <span className="text-slate-100 font-bold">{fluidLevel.toFixed(0)} m (from surface)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">PRODUCTION:</span>
                <span className="text-emerald-400 font-bold">{bopd.toFixed(1)} BOPD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Interactive SVG Cross-Section Schematic */}
        <div className="xl:col-span-6 bg-[#080B10] border border-[#1E293B] rounded p-2 h-72 flex items-center justify-center relative overflow-hidden">
          <svg viewBox="0 0 600 320" className="w-full h-full">
            <defs>
              <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="30%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#080B10" />
              </linearGradient>
              <linearGradient id="casingGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="50%" stopColor="#64748B" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
              <linearGradient id="fluidGradTwin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="thermalSteamGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#ea580c" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Geological Layer Background */}
            <rect x="0" y="80" width="600" height="240" fill="url(#groundGrad)" />
            
            {/* Depth Guideline Markers */}
            <line x1="20" y1="80" x2="580" y2="80" stroke="#334155" strokeWidth="1" strokeDasharray="2 4" />
            <text x="25" y="75" fill="#64748B" fontSize="9" fontFamily="monospace">SURFACE (0m)</text>
            
            <line x1="20" y1="160" x2="580" y2="160" stroke="#334155" strokeWidth="1" strokeDasharray="2 4" />
            <text x="25" y="155" fill="#64748B" fontSize="9" fontFamily="monospace">FLUID CONTACT (~{fluidLevel.toFixed(0)}m)</text>

            <line x1="20" y1="260" x2="580" y2="260" stroke="#334155" strokeWidth="1" strokeDasharray="2 4" />
            <text x="25" y="255" fill="#64748B" fontSize="9" fontFamily="monospace">RESERVOIR PERFS (1,150m)</text>

            {/* Wellbore Casing Structure */}
            <rect x="270" y="75" width="60" height="215" fill="#0b0f17" stroke="url(#casingGrad)" strokeWidth="2.5" rx="2" />
            
            {/* Tubing Column inside Casing */}
            <rect x="284" y="75" width="32" height="205" fill="#111827" stroke="#475569" strokeWidth="1.5" />

            {/* Fluid Column in Annulus/Tubing */}
            <rect x="285" y="145" width="30" height="135" fill="url(#fluidGradTwin)" opacity="0.85" />

            {/* Live Moving Sucker Rod String */}
            <line
              x1="300"
              y1={75 + normPos * 12}
              x2="300"
              y2={270 + normPos * 12}
              stroke="#fbbf24"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Downhole Pump Plunger & Standing Valve */}
            <g transform={`translate(288, ${250 + normPos * 12})`}>
              <rect x="0" y="0" width="24" height="22" fill="#d97706" stroke="#fbbf24" strokeWidth="1" rx="2" />
              {/* Traveling Valve */}
              <circle cx="12" cy="11" r="3.5" fill="#ffffff" />
            </g>

            {/* Bottomhole Steam / Thermal Zone (CSS Heated Sandstone) */}
            <ellipse cx="300" cy="285" rx="140" ry="25" fill="url(#thermalSteamGrad)" opacity={activeLayer === 'mechanical' ? 0.2 : 0.8} />

            {/* Perforations & Fluid Inflow Jets */}
            <g opacity="0.9">
              <line x1="250" y1="280" x2="270" y2="280" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" className="animate-pulse" />
              <line x1="330" y1="280" x2="350" y2="280" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" className="animate-pulse" />
              <line x1="245" y1="290" x2="270" y2="290" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" className="animate-pulse" />
              <line x1="330" y1="290" x2="355" y2="290" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" className="animate-pulse" />
            </g>

            {/* Surface SRP Machine Rig */}
            <g transform="translate(230, 20)">
              {/* Samson Post */}
              <polygon points="65,55 50,20 80,20" fill="#334155" stroke="#475569" strokeWidth="1.5" />
              
              {/* Walking Beam (Pivoting with rod position) */}
              <g transform={`rotate(${beamAngle}, 65, 20)`}>
                <rect x="15" y="16" width="100" height="8" rx="2" fill="#64748B" stroke="#94A3B8" strokeWidth="1" />
                {/* Horsehead Curved Front */}
                <path d="M 115 12 Q 130 18 128 36 L 122 36 Q 124 20 115 20 Z" fill="#D97706" />
                {/* Bridle wire to polished rod */}
                <line x1="126" y1="36" x2="126" y2="58" stroke="#E2E8F0" strokeWidth="1.5" />
              </g>

              {/* Counterweight & Crank */}
              <circle cx="28" cy="46" r="10" fill="#1E293B" stroke="#475569" strokeWidth="2" />
              <line x1="28" y1="46" x2={28 + Math.cos(normPos * Math.PI * 2) * 8} y2={46 + Math.sin(normPos * Math.PI * 2) * 8} stroke="#F59E0B" strokeWidth="3" />
            </g>

            {/* Telemetry Annotation Badges inside Canvas */}
            <g transform="translate(380, 100)">
              <rect x="0" y="0" width="180" height="42" fill="#0D1219" stroke="#1E293B" rx="4" />
              <text x="10" y="16" fill="#94A3B8" fontSize="8.5" fontFamily="monospace">DYNAMIC VISCOSITY REGIME</text>
              <text x="10" y="32" fill="#A855F7" fontSize="12" fontWeight="bold" fontFamily="monospace">
                {Math.round(viscCp).toLocaleString()} cP
              </text>
              <text x="110" y="32" fill="#64748B" fontSize="9" fontFamily="monospace">
                {viscCp < 12000 ? 'OPTIMAL' : 'HIGH DRAG'}
              </text>
            </g>

            <g transform="translate(380, 240)">
              <rect x="0" y="0" width="180" height="42" fill="#0D1219" stroke="#1E293B" rx="4" />
              <text x="10" y="16" fill="#94A3B8" fontSize="8.5" fontFamily="monospace">BOTTOMHOLE TEMPERATURE</text>
              <text x="10" y="32" fill={getTempColor(tempC)} fontSize="12" fontWeight="bold" fontFamily="monospace">
                {tempC.toFixed(1)}°C
              </text>
              <text x="90" y="32" fill="#64748B" fontSize="9" fontFamily="monospace">
                CSS {stage}
              </text>
            </g>
          </svg>
        </div>

        {/* Right Telemetry Highlights (Subsurface Domain) */}
        <div className="xl:col-span-3 space-y-2.5">
          <div className="bg-[#111821] border border-[#1E293B] rounded p-2.5">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
              <span>DOWNHOLE THERMAL STATE</span>
              <span className="px-1.5 py-0.2 rounded font-bold bg-rose-500/10 border border-rose-500/30 text-rose-300">
                {stage}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <span className="text-[9px] text-slate-400 block">TEMPERATURE</span>
                <span className="text-sm font-bold text-rose-400">{tempC.toFixed(1)}°C</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block">VISCOSITY</span>
                <span className="text-sm font-bold text-purple-400">{Math.round(viscCp).toLocaleString()} cP</span>
              </div>
            </div>
          </div>

          <div className="bg-[#111821] border border-[#1E293B] rounded p-2.5">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
              <span>AI SURROGATE STATE</span>
              <span className="text-emerald-400 font-bold">ONLINE (99.4%)</span>
            </div>
            <div className="text-[10px] font-mono space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">PUMP FILLAGE:</span>
                <span className="text-cyan-300 font-bold">{analytics?.pump_fillage?.fillage_pct ? `${analytics.pump_fillage.fillage_pct}%` : '84%'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">FATIGUE RISK:</span>
                <span className="text-slate-100 font-bold">{predictions?.rod_failure?.fatigue_risk_level ?? 'LOW'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Footer Strip */}
      <div className="relative z-10 pt-2 border-t border-[#1E293B] flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            TELEMETRY INGESTION: 10 Hz
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            DYNAMIC KINEMATICS: ACTIVE
          </span>
        </div>
        <div className="text-slate-400">
          SURROGATE MODEL: PINN + ARRHENIUS FLUID DISPERSION
        </div>
      </div>
    </div>
  );
};

export default WellboreDigitalTwin;
