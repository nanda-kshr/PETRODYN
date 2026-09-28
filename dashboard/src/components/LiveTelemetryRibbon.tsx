'use client';

import React from 'react';
import { Activity, Zap, Thermometer, Gauge, Droplets, Cpu, Layers } from 'lucide-react';
import { TelemetryRecord } from '@/types/telemetry';

interface LiveTelemetryRibbonProps {
  latest: TelemetryRecord | null;
}

export const LiveTelemetryRibbon: React.FC<LiveTelemetryRibbonProps> = React.memo(({ latest }) => {
  const spm = latest?.spm ?? 5.5;
  const rodLoad = latest?.rod_load_kn ?? 68.4;
  const tempC = latest?.temperature_c ?? 78.5;
  const press = latest?.tubing_pressure_bar ?? 18.5;
  const bopd = latest?.production_bopd ?? 48.2;
  const current = latest?.motor_current_a ?? 24.6;
  const fluidLevel = latest?.fluid_level_m ?? 850;

  const getTempColor = (t: number) => {
    if (t >= 90) return 'text-rose-400';
    if (t >= 70) return 'text-amber-400';
    if (t >= 50) return 'text-yellow-300';
    return 'text-sky-400';
  };

  const instruments = [
    {
      id: 'spm',
      label: 'PUMP SPEED',
      pIdTag: 'ST-101',
      value: spm > 0.05 ? spm.toFixed(1) : '0.0',
      unit: 'SPM',
      icon: Activity,
      textColor: spm > 0.05 ? 'text-cyan-300' : 'text-slate-400',
      status: spm > 0.05 ? 'RUNNING' : 'STOPPED',
      statusColor: spm > 0.05 ? 'bg-emerald-500' : 'bg-rose-500',
    },
    {
      id: 'load',
      label: 'POLISHED ROD LOAD',
      pIdTag: 'WT-204',
      value: rodLoad.toFixed(1),
      unit: 'kN',
      icon: Zap,
      textColor: 'text-amber-300',
      status: 'CYCLIC',
      statusColor: 'bg-amber-400',
    },
    {
      id: 'temp',
      label: 'BOTTOMHOLE TEMP',
      pIdTag: 'TT-401',
      value: tempC.toFixed(1),
      unit: '°C',
      icon: Thermometer,
      textColor: getTempColor(tempC),
      status: 'THERMAL',
      statusColor: 'bg-rose-400',
    },
    {
      id: 'pressure',
      label: 'TUBING PRESSURE',
      pIdTag: 'PT-302',
      value: press.toFixed(1),
      unit: 'bar',
      icon: Gauge,
      textColor: 'text-cyan-400',
      status: 'HYDRAULIC',
      statusColor: 'bg-cyan-400',
    },
    {
      id: 'bopd',
      label: 'GROSS PRODUCTION',
      pIdTag: 'FT-501',
      value: bopd.toFixed(1),
      unit: 'BOPD',
      icon: Droplets,
      textColor: 'text-emerald-400',
      status: 'LIFTED',
      statusColor: 'bg-emerald-400',
    },
    {
      id: 'current',
      label: 'MOTOR CURRENT',
      pIdTag: 'IT-105',
      value: current.toFixed(1),
      unit: 'A',
      icon: Cpu,
      textColor: 'text-sky-300',
      status: 'VFD 3-PHASE',
      statusColor: 'bg-sky-400',
    },
    {
      id: 'fluid',
      label: 'WORKING FLUID LEVEL',
      pIdTag: 'LT-601',
      value: fluidLevel.toFixed(0),
      unit: 'm',
      icon: Layers,
      textColor: 'text-indigo-300',
      status: 'ACOUSTIC',
      statusColor: 'bg-indigo-400',
    },
  ];

  return (
    <div className="w-full bg-[#0B1017] border border-[#1E2A3B] rounded-sm shadow-md select-none">
      {/* Stable 7-Column Strip with fixed height to prevent layout shifts/toggling on scroll */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 divide-x divide-y sm:divide-y-0 divide-[#1E2A3B]">
        {instruments.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="p-2.5 h-[84px] flex flex-col justify-between bg-[#0B1017] hover:bg-[#0E1520] transition-colors duration-150 min-w-0"
            >
              {/* Header Label + P&ID */}
              <div className="flex items-center justify-between gap-1 font-mono text-[9px] text-slate-400">
                <span className="font-semibold tracking-wider uppercase flex items-center gap-1 min-w-0 truncate">
                  <Icon className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                <span className="text-[8.5px] text-slate-400 shrink-0 font-mono">
                  {item.pIdTag}
                </span>
              </div>

              {/* Large Telemetry Value + Unit */}
              <div className="flex items-baseline gap-1.5 font-mono tabular-nums">
                <span className={`text-lg font-bold tracking-tight leading-none ${item.textColor}`}>
                  {item.value}
                </span>
                <span className="text-[10px] text-slate-400 font-medium leading-none">
                  {item.unit}
                </span>
              </div>

              {/* Sub-status Indicator */}
              <div className="flex items-center justify-between text-[8.5px] font-mono text-slate-400 pt-1 border-t border-[#1E2A3B]/60 leading-none">
                <span className="flex items-center gap-1 truncate">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.statusColor}`} />
                  <span className="truncate">{item.status}</span>
                </span>
                <span className="text-slate-400 shrink-0 font-mono">10Hz</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

LiveTelemetryRibbon.displayName = 'LiveTelemetryRibbon';

export default LiveTelemetryRibbon;
