'use client';

import React from 'react';
import { Thermometer, Droplets, Calendar } from 'lucide-react';
import { AnalyticsData, PredictionsData, TelemetryRecord } from '@/types/telemetry';

interface ThermalViscosityCardProps {
  analytics?: AnalyticsData | null;
  predictions?: PredictionsData | null;
  latest?: TelemetryRecord | null;
}

export const ThermalViscosityCard: React.FC<ThermalViscosityCardProps> = ({
  analytics,
  predictions,
  latest,
}) => {
  const currentTemp = latest?.temperature_c ?? 50.0;
  const currentVisc = latest?.viscosity_cp ?? 12000;
  const coolingRate = analytics?.cooling_rate?.cooling_rate_c_per_day ?? 0.45;
  const viscosityTrend = analytics?.viscosity_trend?.viscosity_increase_rate_cp_per_day ?? 280;

  const tempPred = predictions?.reservoir_temperature ?? {
    forecast_7d_c: 49.3,
    forecast_14d_c: 48.8,
    forecast_30d_c: 48.3,
  };

  const viscPred = predictions?.oil_viscosity ?? {
    forecast_7d_cp: 12500,
    forecast_14d_cp: 12900,
    forecast_30d_cp: 13400,
  };

  const resteamWindow = predictions?.reservoir_cooling?.recommended_css_resteam_window_days ?? 7;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-rose-400" />
          Thermal Decay & Viscosity Dynamics
        </h3>
        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
          <Calendar className="w-3.5 h-3.5 text-sky-400" />
          Re-steam window: ~{resteamWindow} days
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Temperature Box */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-rose-400" /> Wellbore Temperature
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Decay: {coolingRate}°C/day</span>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 my-1">
            {currentTemp}°C
          </div>
          <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-800 text-[10px] font-mono">
            <div>
              <span className="text-slate-500 block">7d</span>
              <span className="text-slate-300">{tempPred.forecast_7d_c}°C</span>
            </div>
            <div>
              <span className="text-slate-500 block">14d</span>
              <span className="text-slate-300">{tempPred.forecast_14d_c}°C</span>
            </div>
            <div>
              <span className="text-slate-500 block">30d</span>
              <span className="text-slate-400">{tempPred.forecast_30d_c}°C</span>
            </div>
          </div>
        </div>

        {/* Viscosity Box */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-purple-400" /> Dynamic Viscosity
            </span>
            <span className="text-[10px] text-slate-500 font-mono">+{viscosityTrend} cP/day</span>
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400 my-1">
            {currentVisc.toLocaleString()} <span className="text-xs font-normal text-slate-500">cP</span>
          </div>
          <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-800 text-[10px] font-mono">
            <div>
              <span className="text-slate-500 block">7d</span>
              <span className="text-slate-300">{Math.round(viscPred.forecast_7d_cp)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">14d</span>
              <span className="text-slate-300">{Math.round(viscPred.forecast_14d_cp)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">30d</span>
              <span className="text-slate-400">{Math.round(viscPred.forecast_30d_cp)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
