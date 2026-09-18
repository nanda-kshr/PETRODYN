'use client';

import React from 'react';
import { Thermometer, Droplets, Calendar } from 'lucide-react';
import { AnalyticsData, PredictionsData, TelemetryRecord } from '@/types/telemetry';
import { Tooltip } from './Tooltip';

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
    current_temperature_c: 50.0,
    forecast_6h_c: 49.8,
    forecast_24h_c: 48.9,
    forecast_72h_c: 48.2,
    summary: 'Temperature tomorrow = 48.9°C',
  };

  const viscPred = predictions?.oil_viscosity ?? {
    current_viscosity_cp: 12000,
    forecast_6h_cp: 12300,
    forecast_24h_cp: 13100,
    forecast_72h_cp: 14200,
    summary: 'Viscosity tomorrow = 13,100 cP',
  };

  const resteamWindow = predictions?.reservoir_cooling?.recommended_css_resteam_window_days ?? 19;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-purple-950/80 border border-purple-800 text-purple-400 tracking-wider">
            HYBRID &bull; STATE &amp; SHIFT FORECAST
          </span>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <Thermometer className="w-4 h-4 text-rose-400" />
            Thermal Decay &amp; Viscosity Dynamics
          </h3>
          <Tooltip
            title="Thermal & Viscosity Dynamics"
            category="PREDICTION"
            content="Combines live bottomhole analytics with 6–72h conductive decay and Arrhenius viscosity forecasting. Updated every 15–60 min."
          />
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
          <Calendar className="w-3.5 h-3.5 text-sky-400" />
          Re-steam in: ~{resteamWindow} days
          <Tooltip
            title="Recommended Re-Steam Window"
            category="PREDICTION"
            content="Estimated days until near-wellbore temperature decays below 55°C, where viscosity exceeds 15,000 cP and requires the next CSS steam injection cycle."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Temperature Box */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-rose-400" /> Temperature
                <span className="text-[9px] px-1 rounded bg-sky-950 text-sky-400 border border-sky-800">NOW</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                Decay: {coolingRate}&deg;C/day
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold font-mono text-rose-400">
                {currentTemp}&deg;C
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-rose-300">Next 6–72 h</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[10px] font-mono mt-2">
            <div className="grid grid-cols-3 gap-1 text-center">
              <div>
                <span className="text-slate-500 block">+6h</span>
                <span className="text-slate-300 font-semibold">{tempPred.forecast_6h_c ?? currentTemp}&deg;C</span>
              </div>
              <div>
                <span className="text-slate-500 block">+24h</span>
                <span className="text-rose-300 font-semibold">{tempPred.forecast_24h_c ?? (currentTemp - 0.9)}&deg;C</span>
              </div>
              <div>
                <span className="text-slate-500 block">+72h</span>
                <span className="text-slate-400">{tempPred.forecast_72h_c ?? (currentTemp - 1.8)}&deg;C</span>
              </div>
            </div>
            <p className="text-[11px] text-rose-300 font-mono text-center font-medium pt-1 truncate">
              {tempPred.summary ?? `Temperature tomorrow = ${tempPred.forecast_24h_c}&deg;C`}
            </p>
          </div>
        </div>

        {/* Viscosity Box */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-purple-400" /> Dynamic Viscosity
                <span className="text-[9px] px-1 rounded bg-sky-950 text-sky-400 border border-sky-800">NOW</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                +{viscosityTrend} cP/day
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold font-mono text-purple-400">
                {currentVisc.toLocaleString()} <span className="text-xs font-normal text-slate-500">cP</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-purple-300">Next 6–72 h</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[10px] font-mono mt-2">
            <div className="grid grid-cols-3 gap-1 text-center">
              <div>
                <span className="text-slate-500 block">+6h</span>
                <span className="text-slate-300 font-semibold">{Math.round(viscPred.forecast_6h_cp ?? currentVisc * 1.02)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">+24h</span>
                <span className="text-purple-300 font-semibold">{Math.round(viscPred.forecast_24h_cp ?? currentVisc * 1.08)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">+72h</span>
                <span className="text-slate-400">{Math.round(viscPred.forecast_72h_cp ?? currentVisc * 1.18)}</span>
              </div>
            </div>
            <p className="text-[11px] text-purple-300 font-mono text-center font-medium pt-1 truncate">
              {viscPred.summary ?? `Viscosity tomorrow = ${Math.round(viscPred.forecast_24h_cp ?? currentVisc * 1.08).toLocaleString()} cP`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
