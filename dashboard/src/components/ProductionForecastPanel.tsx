'use client';

import React from 'react';
import { TrendingDown, Zap, Flame, BarChart2 } from 'lucide-react';
import { PredictionsData } from '@/types/telemetry';

interface ProductionForecastPanelProps {
  predictions?: PredictionsData | null;
}

export const ProductionForecastPanel: React.FC<ProductionForecastPanelProps> = ({ predictions }) => {
  const prod = predictions?.production_rate ?? {
    current_bopd: 30.5,
    forecast_7d_bopd: 29.8,
    forecast_14d_bopd: 29.1,
    forecast_30d_bopd: 27.5,
    cumulative_30d_oil_bbl: 870,
  };

  const decline = predictions?.production_decline ?? {
    expected_monthly_decline_pct: 3.5,
    decline_character: 'STABLE_PLATEAU',
    economic_limit_cut_off_days: 90,
  };

  const energy = predictions?.energy_consumption ?? {
    current_kwh_per_bbl: 14.2,
    forecast_7d_kwh_per_bbl: 14.6,
    forecast_30d_kwh_per_bbl: 16.1,
    projected_monthly_energy_cost_trend: 'INCREASING_LIFT_COST_PER_BARREL',
  };

  const sor = predictions?.sor ?? {
    current_sor_forecast: 4.8,
    projected_cycle_end_sor: 5.9,
    efficiency_status: 'ECONOMIC_WINDOW',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-emerald-400" />
          Multi-Horizon Production & Energy Forecast
        </h3>
        <span className="text-[10px] text-slate-400 font-mono">30-DAY OUTLOOK</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        {/* Production Forecast Card */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <span className="text-slate-400 block text-[11px] mb-1">Production Forecast (BOPD)</span>
            <div className="text-xl font-bold font-mono text-emerald-400">{prod.current_bopd} <span className="text-xs text-slate-500 font-normal">Now</span></div>
          </div>
          <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2.5 border-t border-slate-800/80 font-mono text-[11px]">
            <div>
              <span className="text-[10px] text-slate-500 block">+7d</span>
              <span className="text-slate-200">{prod.forecast_7d_bopd}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">+14d</span>
              <span className="text-slate-200">{prod.forecast_14d_bopd}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">+30d</span>
              <span className="text-slate-300">{prod.forecast_30d_bopd}</span>
            </div>
          </div>
        </div>

        {/* Expected Monthly Decline */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <span className="text-slate-400 block text-[11px] mb-1 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-amber-400" /> Expected Monthly Decline
            </span>
            <div className="text-xl font-bold font-mono text-amber-400">
              {decline.expected_monthly_decline_pct}%
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px]">
            <span className="text-slate-400 block truncate">{decline.decline_character.replace(/_/g, ' ')}</span>
            <span className="text-[10px] text-slate-500 block">Cut-off limit: ~{decline.economic_limit_cut_off_days} days</span>
          </div>
        </div>

        {/* Specific Energy (kWh/bbl) */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <span className="text-slate-400 block text-[11px] mb-1 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-sky-400" /> Energy Intensity (kWh/bbl)
            </span>
            <div className="text-xl font-bold font-mono text-sky-400">{energy.current_kwh_per_bbl}</div>
          </div>
          <div className="grid grid-cols-2 gap-1 mt-3 pt-2.5 border-t border-slate-800/80 font-mono text-[11px]">
            <div>
              <span className="text-[10px] text-slate-500 block">+7d</span>
              <span className="text-slate-200">{energy.forecast_7d_kwh_per_bbl}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">+30d</span>
              <span className="text-slate-200">{energy.forecast_30d_kwh_per_bbl}</span>
            </div>
          </div>
        </div>

        {/* Future SOR */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <span className="text-slate-400 block text-[11px] mb-1 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-400" /> Steam-to-Oil Ratio (SOR)
            </span>
            <div className="text-xl font-bold font-mono text-rose-400">{sor.current_sor_forecast}</div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px]">
            <span className="text-slate-300 block font-mono">Cycle-End: {sor.projected_cycle_end_sor}</span>
            <span className="text-[10px] text-slate-500 block truncate">{sor.efficiency_status.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
