'use client';

import React, { useState } from 'react';
import {
  Activity,
  Wifi,
  WifiOff,
  RefreshCw,
  Flame,
  Cpu,
  Zap,
  Droplets,
  Thermometer,
  RotateCcw,
  Gauge,
  Radio,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { TelemetryRecord } from '@/types/telemetry';

interface HeaderProps {
  wellId: string;
  isConnected: boolean;
  latest: TelemetryRecord | null;
  lastUpdated: Date | null;
  onRefresh: () => void;
  onReplayIntro?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  wellId,
  isConnected,
  latest,
  lastUpdated,
  onRefresh,
  onReplayIntro,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const stage = latest?.operating_stage ?? 'PRODUCTION';
  const spm = latest?.spm ?? 0;
  const tempC = latest?.temperature_c ?? 0;
  const bopd = latest?.production_bopd ?? 0;
  const loadKn = latest?.rod_load_kn ?? 0;
  const viscCp = latest?.viscosity_cp ?? 0;

  return (
    <header className="sticky top-0 z-50 bg-[#080B10]/95 border-b border-[#1E293B] px-4 lg:px-6 py-2.5 backdrop-blur-md">
      <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Industrial Facility & System Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-[#111821] border border-[#1E293B] text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-bold tracking-wider text-slate-100">
                THERMO-LIFT
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold tracking-wider">
                WELL-TO-SURFACE DIGITAL TWIN
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#111821] border border-[#1E293B] text-slate-300">
                WELL {wellId}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span>BAGHEWALA FIELD, RAJASTHAN</span>
              <span>&bull;</span>
              <span className="text-slate-400">JODHPUR SANDSTONE (HEAVY OIL CSS-SRP)</span>
            </div>
          </div>
        </div>

        {/* Center: Live SCADA Telemetry Strip (Compact Engineering Readouts) */}
        {latest && (
          <div className="hidden lg:flex items-center gap-2 bg-[#0D1219] border border-[#1E293B] px-3 py-1 rounded text-xs font-mono">
            {/* CSS Stage Indicator */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#111821] border border-[#1E293B]">
              <span className="text-[9px] text-slate-400">CSS STAGE:</span>
              <span
                className={`font-bold text-[10px] ${
                  stage === 'STEAM'
                    ? 'text-rose-400'
                    : stage === 'SOAK'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {stage}
              </span>
            </div>

            <div className="h-4 w-px bg-[#1E293B]" />

            {/* SPM */}
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-sky-400" />
              <span className="text-slate-400 text-[10px]">SPM:</span>
              <span className="text-slate-100 font-bold">{spm > 0.05 ? spm.toFixed(1) : '0.0'}</span>
            </div>

            <div className="h-4 w-px bg-[#1E293B]" />

            {/* Rod Load */}
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="text-slate-400 text-[10px]">LOAD:</span>
              <span className="text-amber-300 font-bold">{loadKn.toFixed(1)} kN</span>
            </div>

            <div className="h-4 w-px bg-[#1E293B]" />

            {/* Temp */}
            <div className="flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-rose-400" />
              <span className="text-slate-400 text-[10px]">BHT:</span>
              <span className="text-rose-300 font-bold">{tempC.toFixed(1)}°C</span>
            </div>

            <div className="h-4 w-px bg-[#1E293B]" />

            {/* Production */}
            <div className="flex items-center gap-1">
              <Droplets className="w-3 h-3 text-emerald-400" />
              <span className="text-slate-400 text-[10px]">PROD:</span>
              <span className="text-emerald-300 font-bold">{bopd.toFixed(1)} BOPD</span>
            </div>
          </div>
        )}

        {/* Right: Operational Connection State & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Connection Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono border ${
              isConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {isConnected ? (
              <>
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span className="font-semibold">SCADA ONLINE</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-rose-400" />
                <span className="font-semibold">OFFLINE</span>
              </>
            )}
          </div>

          {/* Replay Intro Button */}
          {onReplayIntro && (
            <button
              type="button"
              onClick={onReplayIntro}
              title="Replay Well-to-Surface Animation"
              className="p-1.5 rounded bg-[#111821] hover:bg-[#1E293B] border border-[#1E293B] text-slate-300 hover:text-white transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Sync / Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh In-Memory Predictions"
            className={`p-1.5 rounded bg-[#111821] hover:bg-[#1E293B] border border-[#1E293B] text-slate-300 hover:text-cyan-300 transition cursor-pointer ${
              isRefreshing ? 'animate-spin text-cyan-400' : ''
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
