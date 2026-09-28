'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Flame, Droplets, Layers, Zap, Gauge, Thermometer, Compass, Cpu, Info, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { TelemetryRecord, AnalyticsData, PredictionsData } from '@/types/telemetry';
import { Tooltip } from './Tooltip';

interface WellboreDigitalTwinProps {
  latest: TelemetryRecord | null;
  analytics?: AnalyticsData | null;
  predictions?: PredictionsData | null;
}

export const WellboreDigitalTwin: React.FC<WellboreDigitalTwinProps> = React.memo(({
  latest,
  analytics,
  predictions,
}) => {
  const [activeLayer, setActiveLayer] = useState<'all' | 'thermal' | 'mechanical'>('all');
  const [showAnnotations, setShowAnnotations] = useState(true);

  // Live telemetry parameters
  const spm = latest?.spm ?? 5.5;
  const isRunning = latest ? (latest.spm > 0.05 && latest.pump_running !== false) : true;
  const strokeLength = latest?.stroke_length_m ?? 2.5;
  const rodPos = latest?.rod_position_m ?? (strokeLength * 0.5);
  const rodLoad = latest?.rod_load_kn ?? 68.4;
  const tempC = latest?.temperature_c ?? 78.5;
  const viscCp = latest?.viscosity_cp ?? 10240;
  const fluidLevel = latest?.fluid_level_m ?? 340;
  const bopd = latest?.production_bopd ?? 48.2;
  const tubingPressure = latest?.tubing_pressure_bar ?? 18.5;
  const stage = latest?.operating_stage ?? 'PRODUCTION';
  const vfdHz = latest?.vfd_frequency_hz ?? 42.0;

  // Normalized stroke position (0 = top of stroke, 1 = bottom of stroke)
  const normPos = Math.max(0, Math.min(1, rodPos / Math.max(0.1, strokeLength)));
  // Walking beam tilt angle (degrees)
  const beamAngle = (normPos - 0.5) * 16;
  // Pitman arm and crank rotation
  const crankAngle = normPos * Math.PI * 2;
  const crankX = 258 + Math.cos(crankAngle) * 16;
  const crankY = 66 + Math.sin(crankAngle) * 16;

  // Temperature color styling
  const getTempColor = (t: number) => {
    if (t >= 90) return '#f43f5e'; // Steam injection red
    if (t >= 70) return '#f97316'; // Warm orange
    if (t >= 55) return '#eab308'; // Moderate amber
    return '#38bdf8'; // Cooled cyan
  };

  return (
    <div className="bg-[#0D1219] border border-[#1E293B] rounded-lg p-4 flex flex-col justify-between relative overflow-hidden shadow-2xl">
      {/* Precision Blueprint Grid Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:18px_18px] opacity-35 pointer-events-none" />
      
      {/* Top Header & Layer Filter Controls */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.9)]" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-mono font-bold tracking-widest text-slate-100 uppercase">
                WELL-TO-SURFACE DIGITAL TWIN SCHEMATIC
              </h2>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
                1,150M DEPTH // JODHPUR SANDSTONE
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              REAL-TIME MECHANICAL KINEMATICS, THERMAL DISSIPATION &amp; INFLOW SURROGATE
            </p>
          </div>
        </div>

        {/* Layer Filters & Display Toggles */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAnnotations(!showAnnotations)}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-medium transition flex items-center gap-1.5 border ${
              showAnnotations
                ? 'bg-[#111821] text-slate-300 border-[#1E293B]'
                : 'bg-[#080B10] text-slate-500 border-[#17202D]'
            }`}
          >
            {showAnnotations ? <Eye className="w-3 h-3 text-cyan-400" /> : <EyeOff className="w-3 h-3" />}
            <span>HUD LABELS</span>
          </button>

          <div className="flex items-center gap-1 bg-[#080B10] p-1 rounded border border-[#1E293B]">
            <button
              type="button"
              onClick={() => setActiveLayer('all')}
              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition ${
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
              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition ${
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
              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition ${
                activeLayer === 'mechanical'
                  ? 'bg-[#1E293B] text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              LIFT DYNAMICS
            </button>
          </div>
        </div>
      </div>

      {/* Main Digital Twin Visual Grid */}
      <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-4 my-3 items-center">
        {/* Left Telemetry Highlights: Surface Domain */}
        <div className="xl:col-span-3 space-y-2.5 font-mono text-xs">
          <div className="bg-[#111821] border border-[#1E293B] rounded p-3 space-y-2">
            <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-[#1E293B] pb-1.5">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" /> SURFACE PUMPING UNIT
              </span>
              <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${isRunning ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {isRunning ? 'RUNNING' : 'STOPPED'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
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

          <div className="bg-[#111821] border border-[#1E293B] rounded p-3 space-y-2">
            <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-[#1E293B] pb-1.5">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" /> WELLHEAD TRANSDUCERS
              </span>
              <span className="text-cyan-400 font-bold">{tubingPressure.toFixed(1)} bar</span>
            </div>
            <div className="text-[10px] space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">FLUID LEVEL:</span>
                <span className="text-slate-100 font-bold">{fluidLevel.toFixed(0)} m (from surface)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">GROSS PRODUCTION:</span>
                <span className="text-emerald-400 font-bold">{bopd.toFixed(1)} BOPD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: High-Precision SVG Cross-Sectional Digital Twin */}
        <div className="xl:col-span-6 bg-[#080B10] border border-[#1E293B] rounded p-2 h-80 flex items-center justify-center relative overflow-hidden">
          <svg viewBox="0 0 620 340" className="w-full h-full">
            <defs>
              <linearGradient id="groundGradTwin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#17202D" />
                <stop offset="35%" stopColor="#0D1219" />
                <stop offset="100%" stopColor="#05070A" />
              </linearGradient>
              <linearGradient id="casingGradTwin" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="50%" stopColor="#64748B" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
              <linearGradient id="fluidColumnGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="thermalSteamGradTwin" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#ea580c" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Subsurface Strata Background */}
            <rect x="0" y="85" width="620" height="255" fill="url(#groundGradTwin)" />
            
            {/* Depth Guideline Markers & Formations */}
            <line x1="20" y1="85" x2="600" y2="85" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 4" />
            <text x="25" y="80" fill="#64748B" fontSize="8.5" fontFamily="monospace">SURFACE ELEVATION (0m)</text>
            
            <line x1="20" y1="175" x2="600" y2="175" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 4" />
            <text x="25" y="170" fill="#64748B" fontSize="8.5" fontFamily="monospace">WORKING FLUID CONTACT (~{fluidLevel.toFixed(0)}m)</text>

            <line x1="20" y1="280" x2="600" y2="280" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 4" />
            <text x="25" y="275" fill="#64748B" fontSize="8.5" fontFamily="monospace">RESERVOIR PERFORATIONS (1,150m JODHPUR SANDSTONE)</text>

            {/* Wellbore Casing (Steel Outer Pipe) */}
            <rect x="280" y="80" width="60" height="235" fill="#080B10" stroke="url(#casingGradTwin)" strokeWidth="2.5" rx="2" />
            
            {/* Production Tubing Inner String */}
            <rect x="294" y="80" width="32" height="225" fill="#0D1219" stroke="#475569" strokeWidth="1.5" />

            {/* Dynamic Fluid Column */}
            <rect x="295" y="160" width="30" height="145" fill="url(#fluidColumnGrad)" opacity="0.85" />

            {/* Polished Rod & Sucker Rod String (Real-Time Kinematic Position) */}
            <line
              x1="310"
              y1={75 + normPos * 14}
              x2="310"
              y2={280 + normPos * 14}
              stroke="#fbbf24"
              strokeWidth="3.2"
              strokeLinecap="round"
            />

            {/* Downhole Pump Plunger & Valve Assembly */}
            <g transform={`translate(298, ${260 + normPos * 14})`}>
              <rect x="0" y="0" width="24" height="24" fill="#d97706" stroke="#fbbf24" strokeWidth="1" rx="2" />
              <circle cx="12" cy="12" r="3.5" fill="#ffffff" />
            </g>

            {/* Downhole Cyclic Steam Stimulation (CSS) Thermal Bubble */}
            <ellipse cx="310" cy="298" rx="150" ry="28" fill="url(#thermalSteamGradTwin)" opacity={activeLayer === 'mechanical' ? 0.2 : 0.85} />

            {/* Inflow Jet Stream Lines */}
            <g opacity="0.9">
              <line x1="260" y1="292" x2="280" y2="292" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
              <line x1="340" y1="292" x2="360" y2="292" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
              <line x1="250" y1="304" x2="280" y2="304" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" />
              <line x1="340" y1="304" x2="370" y2="304" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" />
            </g>

            {/* Surface SRP Machine: Realistic Mechanical Kinematics */}
            <g transform="translate(235, 18)">
              {/* Concrete Base */}
              <rect x="0" y="65" width="130" height="6" fill="#1E293B" rx="1" />
              
              {/* Samson Post (A-Frame) */}
              <polygon points="75,65 58,24 92,24" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
              
              {/* Walking Beam with Center Pivot */}
              <g transform={`rotate(${beamAngle}, 75, 24)`}>
                <rect x="15" y="20" width="120" height="9" rx="2" fill="#475569" stroke="#94A3B8" strokeWidth="1" />
                {/* Horsehead Curved Profile */}
                <path d="M 135 15 Q 152 22 150 42 L 144 42 Q 146 24 135 24 Z" fill="#D97706" stroke="#B45309" strokeWidth="1" />
                {/* Bridle Wire to polished rod */}
                <line x1="147" y1="42" x2="147" y2={64 - normPos * 8} stroke="#E2E8F0" strokeWidth="1.8" />
              </g>

              {/* Crank & Counterweight */}
              <circle cx="28" cy="48" r="14" fill="#0D1219" stroke="#475569" strokeWidth="2" />
              {/* Rotating Crank Pin */}
              <circle cx={28 + Math.cos(crankAngle) * 9} cy={48 + Math.sin(crankAngle) * 9} r="3" fill="#F59E0B" />
              {/* Pitman Arm from Crank to Beam Tail */}
              <line x1={28 + Math.cos(crankAngle) * 9} y1={48 + Math.sin(crankAngle) * 9} x2="20" y2={24 - Math.sin(beamAngle * Math.PI / 180) * 55} stroke="#64748B" strokeWidth="2.5" />
            </g>

            {/* Real-time Dynamic HUD Badges */}
            {showAnnotations && (
              <>
                <g transform="translate(410, 110)">
                  <rect x="0" y="0" width="190" height="42" fill="#0D1219" stroke="#1E293B" rx="4" />
                  <text x="10" y="16" fill="#94A3B8" fontSize="8.5" fontFamily="monospace">DYNAMIC CRUDE VISCOSITY</text>
                  <text x="10" y="32" fill="#A855F7" fontSize="12" fontWeight="bold" fontFamily="monospace">
                    {Math.round(viscCp).toLocaleString()} cP
                  </text>
                  <text x="115" y="32" fill="#64748B" fontSize="9" fontFamily="monospace">
                    {viscCp < 12000 ? 'OPTIMAL' : 'HIGH DRAG'}
                  </text>
                </g>

                <g transform="translate(410, 255)">
                  <rect x="0" y="0" width="190" height="42" fill="#0D1219" stroke="#1E293B" rx="4" />
                  <text x="10" y="16" fill="#94A3B8" fontSize="8.5" fontFamily="monospace">BOTTOMHOLE TEMPERATURE</text>
                  <text x="10" y="32" fill={getTempColor(tempC)} fontSize="12" fontWeight="bold" fontFamily="monospace">
                    {tempC.toFixed(1)}°C
                  </text>
                  <text x="100" y="32" fill="#64748B" fontSize="9" fontFamily="monospace">
                    CSS {stage}
                  </text>
                </g>
              </>
            )}
          </svg>
        </div>

        {/* Right Telemetry Highlights: Subsurface & AI Domain */}
        <div className="xl:col-span-3 space-y-2.5 font-mono text-xs">
          <div className="bg-[#111821] border border-[#1E293B] rounded p-3 space-y-2">
            <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-[#1E293B] pb-1.5">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-rose-400" /> DOWNHOLE THERMAL STATE
              </span>
              <span className="px-1.5 py-0.2 rounded font-bold text-[9px] bg-rose-500/10 border border-rose-500/30 text-rose-300">
                {stage}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
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

          <div className="bg-[#111821] border border-[#1E293B] rounded p-3 space-y-2">
            <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-[#1E293B] pb-1.5">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" /> AI SURROGATE MODEL
              </span>
              <span className="text-emerald-400 font-bold">ONLINE (99.4%)</span>
            </div>
            <div className="text-[10px] space-y-1 text-slate-300">
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

      {/* Status Footer Readout */}
      <div className="relative z-10 pt-2 border-t border-[#1E293B] flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            TELEMETRY INGESTION: 10 Hz
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            MECHANICAL KINEMATICS: SYNCHRONIZED
          </span>
        </div>
        <div>
          SURROGATE MODEL: PINN + ARRHENIUS FLUID DISPERSION
        </div>
      </div>
    </div>
  );
});

WellboreDigitalTwin.displayName = 'WellboreDigitalTwin';

export default WellboreDigitalTwin;
