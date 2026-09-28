'use client';

import React, { useState } from 'react';
import {
  Activity,
  WifiOff,
  RefreshCw,
  Cpu,
  Zap,
  Droplets,
  Thermometer,
  RotateCcw,
  Radio,
  Layers,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { TelemetryRecord } from '@/types/telemetry';
import { Skiper43 } from '@/components/ui/skiper43';

interface CommandHeaderProps {
  wellId: string;
  isConnected: boolean;
  latest: TelemetryRecord | null;
  lastUpdated: Date | null;
  onRefresh: () => void;
  onReplayIntro?: () => void;
  isFxEnabled?: boolean;
  onToggleFx?: () => void;
}

export const CommandHeader: React.FC<CommandHeaderProps> = ({
  wellId,
  isConnected,
  latest,
  lastUpdated,
  onRefresh,
  onReplayIntro,
  isFxEnabled = true,
  onToggleFx,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 700);
  };

  const stage = latest?.operating_stage ?? 'PRODUCTION';
  const spm = latest?.spm ?? 0;
  const tempC = latest?.temperature_c ?? 0;
  const bopd = latest?.production_bopd ?? 0;
  const loadKn = latest?.rod_load_kn ?? 0;

  return (
    <header className="sticky top-0 z-50 bg-[#070A0F]/65 border-b border-[#1E2A3B]/70 px-3 lg:px-5 py-2 backdrop-blur-xl shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 w-full">
        {/* Left: Industrial Facility & System Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-sm bg-[#0F1622] border border-[#1E2A3B] text-cyan-400 shrink-0">
            <Cpu className="w-3.5 h-3.5" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider text-slate-100">
                THERMO-LIFT
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-sm bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold tracking-wider">
                WELL-TO-SURFACE DIGITAL TWIN
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-sm bg-[#0F1622] border border-[#1E2A3B] text-slate-300">
                WELL {wellId}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-slate-400">
              <span className="text-slate-300 font-medium">BAGHEWALA FIELD &bull; RAJASTHAN</span>
              <span>|</span>
              <span className="text-slate-400">JODHPUR SANDSTONE (1,150M HEAVY OIL CSS-SRP)</span>
            </div>
          </div>
        </div>

        {/* Center: Live SCADA Telemetry Stream Strip */}
        {latest && (
          <div className="hidden xl:flex items-center gap-2.5 bg-[#0B1017] border border-[#1E2A3B] px-2.5 py-1 rounded-sm text-xs font-mono">
            {/* CSS Stage Indicator */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#0F1622] border border-[#1E2A3B]">
              <span className="text-[9px] text-slate-400">STAGE:</span>
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

            <div className="h-3.5 w-px bg-[#1E2A3B]" />

            {/* SPM */}
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" />
              <span className="text-slate-400 text-[9.5px]">SPM:</span>
              <span className="text-slate-100 font-bold text-[11px]">{spm > 0.05 ? spm.toFixed(1) : '0.0'}</span>
            </div>

            <div className="h-3.5 w-px bg-[#1E2A3B]" />

            {/* Rod Load */}
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="text-slate-400 text-[9.5px]">LOAD:</span>
              <span className="text-amber-300 font-bold text-[11px]">{loadKn.toFixed(1)} kN</span>
            </div>

            <div className="h-3.5 w-px bg-[#1E2A3B]" />

            {/* Temp */}
            <div className="flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-rose-400" />
              <span className="text-slate-400 text-[9.5px]">BHT:</span>
              <span className="text-rose-300 font-bold text-[11px]">{tempC.toFixed(1)}°C</span>
            </div>

            <div className="h-3.5 w-px bg-[#1E2A3B]" />

            {/* Production */}
            <div className="flex items-center gap-1">
              <Droplets className="w-3 h-3 text-emerald-400" />
              <span className="text-slate-400 text-[9.5px]">PROD:</span>
              <span className="text-emerald-300 font-bold text-[11px]">{bopd.toFixed(1)} BOPD</span>
            </div>
          </div>
        )}

        {/* Right: Operational Status Rails & Actions */}
        <div className="flex items-center gap-2">
          {/* Digital Twin Calibration Status */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#0B1017] border border-[#1E2A3B] text-[9.5px] font-mono text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>TWIN: CALIBRATED</span>
          </div>

          {/* AI Inference Status */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#0B1017] border border-[#1E2A3B] text-[9.5px] font-mono text-purple-300">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span>AI: ACTIVE</span>
          </div>

          {/* Connection Status Badge */}
          <Skiper43
            content={isConnected ? "10Hz Live WebSocket Stream Active" : "WebSocket Disconnected"}
            shortcut={isConnected ? "WS 10Hz" : "RETRY"}
            side="bottom"
          >
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-sm text-[9.5px] font-mono border cursor-default ${
                isConnected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {isConnected ? (
                <>
                  <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                  <span className="font-bold">SCADA 10Hz</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-2.5 h-2.5 text-rose-400" />
                  <span className="font-bold">OFFLINE</span>
                </>
              )}
            </div>
          </Skiper43>

          {/* Last Sync Timestamp */}
          <span className="hidden md:inline-block text-[9.5px] font-mono text-slate-400 bg-[#0B1017] px-2 py-1 rounded-sm border border-[#1E2A3B]">
            {lastUpdated ? lastUpdated.toLocaleTimeString() : 'LIVE'}
          </span>

          {/* FX Shaders Mode Toggle */}
          {onToggleFx && (
            <Skiper43 content={isFxEnabled ? "GPU Shaders Active (Click for High-Performance Mode)" : "High-Performance Mode Active (Click for GPU Shaders)"} shortcut="FX" side="bottom">
              <button
                type="button"
                onClick={onToggleFx}
                aria-label="Toggle GPU Shader Effects"
                className={`flex items-center gap-1 px-2 py-1 rounded-sm text-[9.5px] font-mono border transition cursor-pointer ${
                  isFxEnabled
                    ? 'bg-[#0F1622] hover:bg-[#141E2E] border-cyan-500/40 text-cyan-300'
                    : 'bg-[#070A0F] hover:bg-[#0F1622] border-[#1E2A3B] text-slate-400'
                }`}
              >
                <Sparkles className={`w-3 h-3 ${isFxEnabled ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{isFxEnabled ? 'FX ON' : 'FX OFF'}</span>
              </button>
            </Skiper43>
          )}

          {/* Replay Intro Button */}
          {onReplayIntro && (
            <Skiper43 content="Replay Well-to-Surface Kinematic Intro" shortcut="INTRO" side="bottom">
              <button
                type="button"
                onClick={onReplayIntro}
                aria-label="Replay Well-to-Surface Animation"
                className="p-1.5 rounded-sm bg-[#0F1622] hover:bg-[#141E2E] border border-[#1E2A3B] text-slate-300 hover:text-white transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </Skiper43>
          )}

          {/* Sync / Refresh Button */}
          <Skiper43 content="Sync AI Models & Telemetry" shortcut="⌘R" side="bottom">
            <button
              type="button"
              onClick={handleRefresh}
              aria-label="Refresh In-Memory Predictions"
              className={`p-1.5 rounded-sm bg-[#0F1622] hover:bg-[#141E2E] border border-[#1E2A3B] text-slate-300 hover:text-cyan-300 transition cursor-pointer ${
                isRefreshing ? 'animate-spin text-cyan-400' : ''
              }`}
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </Skiper43>
        </div>
      </div>
    </header>
  );
};

export default CommandHeader;
