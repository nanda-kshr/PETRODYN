'use client';

import React from 'react';
import { Thermometer, Droplets, Calendar, Flame, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const currentTemp = latest?.temperature_c ?? null;
  const currentVisc = latest?.viscosity_cp ?? null;
  const coolingRate = analytics?.cooling_rate?.cooling_rate_c_per_day ?? null;
  const viscosityTrend = analytics?.viscosity_trend?.viscosity_increase_rate_cp_per_day ?? null;

  const tempPred = predictions?.reservoir_temperature;
  const viscPred = predictions?.oil_viscosity;
  const resteamWindow = predictions?.reservoir_cooling?.recommended_css_resteam_window_days ?? null;

  return (
    <div className="bg-[#0D1219] border border-[#1E293B] rounded-lg p-4 flex flex-col justify-between relative overflow-hidden shadow-xl">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1E293B]">
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

        <div className="flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded bg-[#111821] border border-[#1E293B] text-slate-300">
          <Calendar className="w-3 h-3 text-cyan-400" />
          <span>RE-STEAM WINDOW:</span>
          <strong className="text-cyan-300">{resteamWindow !== null ? `~${resteamWindow} DAYS` : '--'}</strong>
        </div>
      </div>

      {/* 2 Forecast Containers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
        {/* Box 1: Bottomhole Temperature Forecast */}
        <div className="bg-[#111821] border border-[#1E293B] rounded p-3.5 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-semibold text-slate-200 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" /> BOTTOMHOLE TEMPERATURE (BHT)
              </span>
              <span className="text-[10px] font-mono text-rose-400">
                DECAY: <strong>{coolingRate !== null ? `${coolingRate}°C/d` : '--'}</strong>
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-mono font-bold text-rose-400">
                {currentTemp !== null ? `${currentTemp.toFixed(1)}°C` : '--'}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300">
                REAL-TIME TELEMETRY
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2.5 border-t border-[#1E293B] text-[10px] font-mono">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#080B10] p-1.5 rounded border border-[#1E293B]">
                <span className="text-slate-400 block text-[9px]">+6H</span>
                <span className="text-slate-200 font-bold text-xs">
                  {tempPred?.forecast_6h_c !== undefined ? `${tempPred.forecast_6h_c}°C` : '--'}
                </span>
              </div>
              <div className="bg-[#080B10] p-1.5 rounded border border-[#1E293B]">
                <span className="text-slate-400 block text-[9px]">+24H</span>
                <span className="text-rose-400 font-bold text-xs">
                  {tempPred?.forecast_24h_c !== undefined ? `${tempPred.forecast_24h_c}°C` : '--'}
                </span>
              </div>
              <div className="bg-[#080B10] p-1.5 rounded border border-[#1E293B]">
                <span className="text-slate-400 block text-[9px]">+72H</span>
                <span className="text-slate-400 font-bold text-xs">
                  {tempPred?.forecast_72h_c !== undefined ? `${tempPred.forecast_72h_c}°C` : '--'}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-rose-300 font-mono bg-[#080B10] p-1.5 rounded border border-[#1E293B] truncate">
              {tempPred?.summary ?? (tempPred ? `Forecasted 24h temp: ${tempPred.forecast_24h_c}°C` : 'Awaiting thermal model...')}
            </p>
          </div>
        </div>

        {/* Box 2: Crude Viscosity Inversion & Forecast */}
        <div className="bg-[#111821] border border-[#1E293B] rounded p-3.5 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-semibold text-slate-200 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-purple-400" /> DYNAMIC CRUDE VISCOSITY
              </span>
              <span className="text-[10px] font-mono text-purple-400">
                TREND: <strong>{viscosityTrend !== null ? `+${viscosityTrend} cP/d` : '--'}</strong>
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-mono font-bold text-purple-400">
                {currentVisc !== null ? Math.round(currentVisc).toLocaleString() : '--'}{' '}
                <span className="text-xs font-normal text-slate-400">cP</span>
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300">
                SURROGATE INVERSION
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2.5 border-t border-[#1E293B] text-[10px] font-mono">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#080B10] p-1.5 rounded border border-[#1E293B]">
                <span className="text-slate-400 block text-[9px]">+6H</span>
                <span className="text-slate-200 font-bold text-xs">
                  {viscPred?.forecast_6h_cp !== undefined ? Math.round(viscPred.forecast_6h_cp).toLocaleString() : '--'}
                </span>
              </div>
              <div className="bg-[#080B10] p-1.5 rounded border border-[#1E293B]">
                <span className="text-slate-400 block text-[9px]">+24H</span>
                <span className="text-purple-400 font-bold text-xs">
                  {viscPred?.forecast_24h_cp !== undefined ? Math.round(viscPred.forecast_24h_cp).toLocaleString() : '--'}
                </span>
              </div>
              <div className="bg-[#080B10] p-1.5 rounded border border-[#1E293B]">
                <span className="text-slate-400 block text-[9px]">+72H</span>
                <span className="text-slate-400 font-bold text-xs">
                  {viscPred?.forecast_72h_cp !== undefined ? Math.round(viscPred.forecast_72h_cp).toLocaleString() : '--'}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-purple-300 font-mono bg-[#080B10] p-1.5 rounded border border-[#1E293B] truncate">
              {viscPred?.summary ?? (viscPred ? `Forecasted 24h viscosity: ${Math.round(viscPred.forecast_24h_cp).toLocaleString()} cP` : 'Awaiting viscosity model...')}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span>MODEL: TRANSIENT RADIAL HEAT CONDUCTION</span>
        <span>WINDOW: 6H // 24H // 72H</span>
      </div>
    </div>
  );
};

export default ThermalViscosityCard;
