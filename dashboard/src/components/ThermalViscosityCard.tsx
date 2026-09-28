'use client';

import React from 'react';
import { Thermometer, Droplets, Calendar, Flame, Layers } from 'lucide-react';
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
  const currentTemp = latest?.temperature_c ?? 78.5;
  const currentVisc = latest?.viscosity_cp ?? 10240;
  const coolingRate = analytics?.cooling_rate?.cooling_rate_c_per_day ?? 0.45;
  const viscosityTrend = analytics?.viscosity_trend?.viscosity_increase_rate_cp_per_day ?? 279.2;

  const tempPred = predictions?.reservoir_temperature;
  const viscPred = predictions?.oil_viscosity;
  const resteamWindow = predictions?.reservoir_cooling?.recommended_css_resteam_window_days ?? 18;

  const f6h_c = tempPred?.forecast_6h_c ?? 77.2;
  const f24h_c = tempPred?.forecast_24h_c ?? 74.5;
  const f72h_c = tempPred?.forecast_72h_c ?? 70.8;

  const f6h_cp = viscPred?.forecast_6h_cp ?? 10850;
  const f24h_cp = viscPred?.forecast_24h_cp ?? 12400;
  const f72h_cp = viscPred?.forecast_72h_cp ?? 14900;

  return (
    <div className="scada-panel rounded-sm p-3.5 flex flex-col justify-between relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#1E2A3B]">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-rose-400" />
          <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
            THERMAL DECAY &amp; VISCOSITY SHIFT PREDICTIONS
          </h3>
          <Tooltip
            title="Thermal & Viscosity Dynamics"
            category="PREDICTION"
            content="Conductive thermal decay model combined with Arrhenius crude viscosity predictor. Projects temperature cooling and resulting viscous drag over 6h, 24h, and 72h horizons."
          />
        </div>

        <div className="flex items-center gap-1.5 text-[9.5px] font-mono px-2 py-0.5 rounded-sm bg-[#0F1622] border border-[#1E2A3B] text-slate-300">
          <Calendar className="w-3 h-3 text-cyan-400" />
          <span>RE-STEAM WINDOW:</span>
          <strong className="text-cyan-300">~{resteamWindow} DAYS</strong>
        </div>
      </div>

      {/* 2 Forecast Containers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-3">
        {/* Box 1: Bottomhole Temperature Forecast */}
        <div className="bg-[#0F1622] border border-[#1E2A3B] rounded-sm p-3 flex flex-col justify-between space-y-2.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-semibold text-slate-200 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" /> BOTTOMHOLE TEMPERATURE (BHT)
              </span>
              <span className="text-[9.5px] font-mono text-rose-400">
                DECAY: <strong>{coolingRate}°C/d</strong>
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-mono font-bold text-rose-400">
                {currentTemp.toFixed(1)}°C
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-rose-500/10 border border-rose-500/30 text-rose-300 font-semibold">
                REAL-TIME TELEMETRY
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#1E2A3B] text-[10px] font-mono">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#070A0F] p-1.5 rounded-sm border border-[#1E2A3B]">
                <span className="text-slate-400 block text-[9px]">+6H</span>
                <span className="text-slate-200 font-bold text-xs">
                  {f6h_c}°C
                </span>
              </div>
              <div className="bg-[#070A0F] p-1.5 rounded-sm border border-[#1E2A3B]">
                <span className="text-slate-400 block text-[9px]">+24H</span>
                <span className="text-rose-400 font-bold text-xs">
                  {f24h_c}°C
                </span>
              </div>
              <div className="bg-[#070A0F] p-1.5 rounded-sm border border-[#1E2A3B]">
                <span className="text-slate-400 block text-[9px]">+72H</span>
                <span className="text-slate-400 font-bold text-xs">
                  {f72h_c}°C
                </span>
              </div>
            </div>
            <p className="text-[9.5px] text-rose-300 font-mono bg-[#070A0F] p-1.5 rounded-sm border border-[#1E2A3B] truncate">
              {tempPred?.summary ?? `Forecasted 24h temp: ${f24h_c}°C (Decay: ${coolingRate}°C/day)`}
            </p>
          </div>
        </div>

        {/* Box 2: Crude Viscosity Inversion & Forecast */}
        <div className="bg-[#0F1622] border border-[#1E2A3B] rounded-sm p-3 flex flex-col justify-between space-y-2.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-semibold text-slate-200 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-purple-400" /> DYNAMIC CRUDE VISCOSITY
              </span>
              <span className="text-[9.5px] font-mono text-purple-400">
                TREND: <strong>+{viscosityTrend} cP/d</strong>
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-mono font-bold text-purple-400">
                {Math.round(currentVisc).toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-400">cP</span>
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold">
                ARRHENIUS INVERSION
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#1E2A3B] text-[10px] font-mono">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#070A0F] p-1.5 rounded-sm border border-[#1E2A3B]">
                <span className="text-slate-400 block text-[9px]">+6H</span>
                <span className="text-slate-200 font-bold text-xs">
                  {Math.round(f6h_cp).toLocaleString()}
                </span>
              </div>
              <div className="bg-[#070A0F] p-1.5 rounded-sm border border-[#1E2A3B]">
                <span className="text-slate-400 block text-[9px]">+24H</span>
                <span className="text-purple-400 font-bold text-xs">
                  {Math.round(f24h_cp).toLocaleString()}
                </span>
              </div>
              <div className="bg-[#070A0F] p-1.5 rounded-sm border border-[#1E2A3B]">
                <span className="text-slate-400 block text-[9px]">+72H</span>
                <span className="text-slate-400 font-bold text-xs">
                  {Math.round(f72h_cp).toLocaleString()}
                </span>
              </div>
            </div>
            <p className="text-[9.5px] text-purple-300 font-mono bg-[#070A0F] p-1.5 rounded-sm border border-[#1E2A3B] truncate">
              {viscPred?.summary ?? `Viscosity forecast at 24h: ${Math.round(f24h_cp).toLocaleString()} cP (Arrhenius decay regime)`}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-[#1E2A3B] flex items-center justify-between text-[9.5px] font-mono text-slate-400">
        <span>MODEL: TRANSIENT RADIAL HEAT CONDUCTION</span>
        <span>WINDOW: 6H // 24H // 72H</span>
      </div>
    </div>
  );
};

export default ThermalViscosityCard;
