'use client';

import React from 'react';
import { Activity, Wifi, WifiOff, RefreshCw, Flame, Hourglass, Play } from 'lucide-react';
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
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sky-600">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            THERMO-LIFT <span className="text-xs px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-700 font-mono">DIGITAL TWIN</span>
          </h1>
          <p className="text-xs text-gray-500">
            Baghewala Field &bull; Wellbore &bull; Sucker Rod Pump &bull; Jodhpur Sandstone
          </p>
        </div>
      </div>

      {/* Quick Live Telemetry Bar */}
      {latest && (
        <div className="hidden lg:flex items-center gap-4 bg-gray-50 px-4 py-1.5 rounded-lg border border-gray-200 text-xs">
          <div>
            <span className="text-gray-400 block text-[10px]">CSS STAGE</span>
            <span className={`font-bold ${
              latest.operating_stage === 'STEAM'
                ? 'text-rose-600'
                : latest.operating_stage === 'SOAK'
                ? 'text-amber-600'
                : 'text-emerald-600'
            }`}>
              {latest.operating_stage || (latest.spm <= 0.05 ? 'STOPPED' : 'PROD')}
            </span>
          </div>
          <div className="h-6 w-px bg-gray-200" />
          <div>
            <span className="text-gray-400 block text-[10px]">SPM</span>
            <span className="font-semibold text-sky-600">
              {latest.spm <= 0.05 ? '0.0 (OFF)' : latest.spm}
            </span>
          </div>
          <div className="h-6 w-px bg-gray-200" />
          <div>
            <span className="text-gray-400 block text-[10px]">ROD LOAD</span>
            <span className="font-semibold text-amber-600">{latest.rod_load_kn} kN</span>
          </div>
          <div className="h-6 w-px bg-gray-200" />
          <div>
            <span className="text-gray-400 block text-[10px]">PRODUCTION</span>
            <span className="font-semibold text-emerald-600">{latest.production_bopd} BOPD</span>
          </div>
          <div className="h-6 w-px bg-gray-200" />
          <div>
            <span className="text-gray-400 block text-[10px]">TEMP</span>
            <span className="font-semibold text-rose-600">{latest.temperature_c}°C</span>
          </div>
          <div className="h-6 w-px bg-gray-200" />
          <div>
            <span className="text-gray-400 block text-[10px]">VISCOSITY</span>
            <span className="font-semibold text-purple-600">{latest.viscosity_cp} cP</span>
          </div>
        </div>
      )}

      {/* Connection status and sync indicator */}
      <div className="flex items-center gap-3 text-xs">
        {latest?.operating_stage === 'STEAM' && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 border border-rose-200 text-rose-700 animate-pulse flex items-center gap-1">
            <Flame className="w-3 h-3" /> STEAM INJECTION
          </span>
        )}
        {latest?.operating_stage === 'SOAK' && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-700 animate-pulse flex items-center gap-1">
            <Hourglass className="w-3 h-3" /> SOAKING
          </span>
        )}
        {latest?.operating_stage === 'PRODUCTION' && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1">
            <Play className="w-3 h-3 fill-current" /> PRODUCTION
          </span>
        )}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200">
          <span className="font-mono text-gray-700 font-medium">WELL: {wellId}</span>
        </div>

        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-medium transition-colors ${
            isConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
              : 'bg-rose-50 border-rose-200 text-rose-600'
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
          className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition"
          title="Refresh AI predictions"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
