'use client';

import React from 'react';
import { Activity, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { TelemetryRecord } from '@/types/telemetry';

interface HeaderProps {
  wellId: string;
  isConnected: boolean;
  latest: TelemetryRecord | null;
  lastUpdated: Date | null;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  wellId,
  isConnected,
  latest,
  lastUpdated,
  onRefresh,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sky-400">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            THERMO-LIFT <span className="text-xs px-2 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-300 font-mono">DIGITAL TWIN</span>
          </h1>
          <p className="text-xs text-slate-400">
            Baghewala Field &bull; Wellbore &bull; Sucker Rod Pump &bull; Jodhpur Sandstone
          </p>
        </div>
      </div>

      {/* Quick Live Telemetry Bar */}
      {latest && (
        <div className="hidden lg:flex items-center gap-4 bg-slate-950/80 px-4 py-1.5 rounded-lg border border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px]">CSS STAGE</span>
            <span className={`font-bold ${
              latest.operating_stage === 'STEAM'
                ? 'text-rose-400'
                : latest.operating_stage === 'SOAK'
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}>
              {latest.operating_stage || (latest.spm <= 0.05 ? 'STOPPED' : 'PROD')}
            </span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-500 block text-[10px]">SPM</span>
            <span className="font-semibold text-sky-400">
              {latest.spm <= 0.05 ? '0.0 (OFF)' : latest.spm}
            </span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-500 block text-[10px]">ROD LOAD</span>
            <span className="font-semibold text-amber-400">{latest.rod_load_kn} kN</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-500 block text-[10px]">PRODUCTION</span>
            <span className="font-semibold text-emerald-400">{latest.production_bopd} BOPD</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-500 block text-[10px]">TEMP</span>
            <span className="font-semibold text-rose-400">{latest.temperature_c}°C</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-500 block text-[10px]">VISCOSITY</span>
            <span className="font-semibold text-purple-400">{latest.viscosity_cp} cP</span>
          </div>
        </div>
      )}

      {/* Connection status and sync indicator */}
      <div className="flex items-center gap-3 text-xs">
        {latest?.operating_stage === 'STEAM' && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 border border-rose-700 text-rose-300 animate-pulse">
            🔥 STEAM INJECTION
          </span>
        )}
        {latest?.operating_stage === 'SOAK' && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 border border-amber-700 text-amber-300 animate-pulse">
            ⏳ SOAKING
          </span>
        )}
        {latest?.operating_stage === 'PRODUCTION' && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 border border-emerald-700 text-emerald-300">
            ▶️ PRODUCTION
          </span>
        )}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700">
          <span className="font-mono text-slate-300 font-medium">WELL: {wellId}</span>
        </div>

        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-medium transition-colors ${
            isConnected
              ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-400'
              : 'bg-rose-950/50 border-rose-800/60 text-rose-400'
          }`}
        >
          {isConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Wifi className="w-3.5 h-3.5" />
              <span>WS LIVE</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <WifiOff className="w-3.5 h-3.5" />
              <span>OFFLINE</span>
            </>
          )}
        </div>

        <button
          onClick={onRefresh}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          title="Refresh AI predictions"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
