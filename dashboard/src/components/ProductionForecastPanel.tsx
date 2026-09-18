'use client';

import React from 'react';
import { TrendingDown, Zap, Flame, BarChart2 } from 'lucide-react';
import { PredictionsData } from '@/types/telemetry';
import { Tooltip } from './Tooltip';

interface ProductionForecastPanelProps {
  predictions?: PredictionsData | null;
}

export const ProductionForecastPanel: React.FC<ProductionForecastPanelProps> = ({ predictions }) => {
  const prod = predictions?.production_rate ?? {
    current_bopd: 30.5,
    forecast_6h_bopd: 30.1,
    forecast_24h_bopd: 29.4,
    forecast_range_24h: '28–31 BOPD',
    summary: 'Next 24 h production = 28–31 BOPD',
  };

  const energy = predictions?.energy_consumption ?? {
    current_kwh_per_bbl: 14.2,
    forecast_6h_kwh_per_bbl: 14.5,
    forecast_24h_kwh_per_bbl: 15.1,
    summary: 'Tomorrow = 15.1 kWh/bbl',
    projected_cost_trend: 'INCREASING_LIFT_COST_PER_BARREL',
  };

  const cooling = predictions?.reservoir_cooling ?? {
    cooling_rate_c_per_day: 1.4,
    days_until_cooling_threshold_55c: 12.5,
    recommended_css_resteam_window_days: 19.5,
    summary: 'Cooling = 1.4°C/day',
  };

  const sor = predictions?.sor ?? {
    current_sor_forecast: 4.8,
    projected_cycle_end_sor: 5.9,
    summary: 'Expected SOR next cycle = 5.9',
    efficiency_status: 'ECONOMIC_WINDOW',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-purple-950/80 border border-purple-800 text-purple-400 tracking-wider">
            PREDICTION &bull; OPERATIONAL &amp; CYCLE
          </span>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-purple-400" />
            Operational Production, Thermal &amp; Energy Forecast
          </h3>
          <Tooltip
            title="Operational & Cycle Forecasts"
            category="PREDICTION"
            content="Multi-tier horizons: 6–24 h shift forecasts for production and energy intensity; 1–7 days strategic forecasts for thermal cooling rate and steam-oil ratio (SOR)."
          />
        </div>
        <span className="text-[10px] text-slate-400 font-mono">SHIFT (6–24H) &amp; CYCLE (1–7D) HORIZONS</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        {/* 1. Production Forecast (Next 6-24 h) */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                Production (BOPD)
                <Tooltip
                  title="BOPD Forecast (Next 6–24 h)"
                  category="PREDICTION"
                  content="Forecasted oil production over the next 6 to 24 hours as crude cools and viscosity shifts. Updated every 15–60 min."
                />
              </span>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {prod.current_bopd} <span className="text-xs text-slate-500 font-normal">Now</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-emerald-300">Next 6–24 h</span>
              <span>&bull; Upd: 15–60m</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1">
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-slate-500">+6h: <span className="text-slate-200">{prod.forecast_6h_bopd ?? prod.current_bopd}</span></span>
              <span className="text-slate-500">+24h: <span className="text-slate-200">{prod.forecast_24h_bopd ?? (prod.current_bopd - 1.0)}</span></span>
            </div>
            <p className="text-[11px] text-emerald-300 font-mono font-medium truncate pt-1">
              {prod.summary ?? `Next 24 h: ${prod.forecast_range_24h}`}
            </p>
          </div>
        </div>

        {/* 2. Specific Energy (Next 6-24 h) */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-sky-400" /> Energy (kWh/bbl)
                <Tooltip
                  title="Energy Intensity (Next 6–24 h)"
                  category="PREDICTION"
                  content="Lifting power per barrel over the next 6–24 hours. Motor load rises as viscous drag increases with wellbore cooling. Updated every 15–60 min."
                />
              </span>
              <div className="text-xl font-bold font-mono text-sky-400">{energy.current_kwh_per_bbl}</div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-sky-300">Next 6–24 h</span>
              <span>&bull; Upd: 15–60m</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1">
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-slate-500">+6h: <span className="text-slate-200">{energy.forecast_6h_kwh_per_bbl ?? energy.current_kwh_per_bbl}</span></span>
              <span className="text-slate-500">+24h: <span className="text-slate-200">{energy.forecast_24h_kwh_per_bbl ?? energy.current_kwh_per_bbl}</span></span>
            </div>
            <p className="text-[11px] text-sky-300 font-mono font-medium truncate pt-1">
              {energy.summary ?? `Tomorrow = ${energy.forecast_24h_kwh_per_bbl} kWh/bbl`}
            </p>
          </div>
        </div>

        {/* 3. Cooling Rate (Next 1-7 days) */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-amber-400" /> Cooling Rate
                <Tooltip
                  title="Reservoir Cooling Rate (Next 1–7 days)"
                  category="PREDICTION"
                  content="Thermal decay rate over the next 1–7 days. Updated every 1–6 hours. Drives future viscosity increase and re-steaming timing."
                />
              </span>
              <div className="text-xl font-bold font-mono text-amber-400">
                {cooling.cooling_rate_c_per_day}&deg;C<span className="text-xs text-slate-500 font-normal">/d</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-amber-300">Next 1–7 days</span>
              <span>&bull; Upd: 1–6h</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1">
            <p className="text-[11px] text-amber-300 font-mono font-medium truncate">
              {cooling.summary ?? `Cooling = ${cooling.cooling_rate_c_per_day}°C/day`}
            </p>
            <span className="text-[10px] text-slate-400 block truncate">
              Re-steam in: ~{cooling.recommended_css_resteam_window_days} days
            </span>
          </div>
        </div>

        {/* 4. Future SOR (Next 1-7 days) */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-rose-400" /> Cycle SOR
                <Tooltip
                  title="Future Steam-to-Oil Ratio (Next 1–7 days)"
                  category="PREDICTION"
                  content="Forecasts cumulative steam injected vs oil recovered over next 1–7 days. Updated every 1–6 hours."
                />
              </span>
              <div className="text-xl font-bold font-mono text-rose-400">{sor.current_sor_forecast}</div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-rose-300">Next 1–7 days</span>
              <span>&bull; Upd: 1–6h</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1">
            <p className="text-[11px] text-rose-300 font-mono font-medium truncate">
              {sor.summary ?? `Expected SOR = ${sor.projected_cycle_end_sor}`}
            </p>
            <span className="text-[10px] text-slate-400 block truncate">
              Status: {sor.efficiency_status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
