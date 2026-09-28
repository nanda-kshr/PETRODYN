'use client';

import React from 'react';
import {
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  TrendingDown,
  Zap,
  Flame,
  Droplets,
  CheckCircle2,
  Sliders,
  Cpu,
  ArrowRight,
} from 'lucide-react';
import { WellHealthScore, PredictionsData, AnalyticsData } from '@/types/telemetry';

interface AiIntelligenceRailProps {
  healthScore?: WellHealthScore | null;
  predictions?: PredictionsData | null;
  analytics?: AnalyticsData | null;
  onNavigateTab?: (tab: 'overview' | 'analytics' | 'predictions' | 'simulator') => void;
}

export const AiIntelligenceRail: React.FC<AiIntelligenceRailProps> = React.memo(({
  healthScore,
  predictions,
  analytics,
  onNavigateTab,
}) => {
  const score = healthScore?.well_health_score ?? 86;
  const status = healthScore?.health_status ?? 'HEALTHY_NOMINAL';
  const sub = healthScore?.sub_scores;

  const floatingProb = predictions?.rod_floating?.floating_probability ?? 0.12;
  const impactProb = predictions?.impact_loading?.impact_probability ?? 0.08;
  const rodFatigueProb = predictions?.rod_failure?.failure_probability ?? 0.05;
  const unsettingProb = predictions?.pump_unsetting?.unsetting_probability ?? 0.02;

  const prodForecast24h = predictions?.production_rate?.forecast_24h_bopd ?? 54.6;
  const energyKwh = predictions?.energy_consumption?.forecast_24h_kwh_per_bbl ?? 22.4;
  const resteamWindow = predictions?.reservoir_cooling?.recommended_css_resteam_window_days ?? 18;
  const sorForecast = predictions?.sor?.current_sor_forecast ?? 3.2;

  const topAdvisory = predictions?.optimization_advisory?.[0];

  const getScoreTheme = (val: number) => {
    if (val >= 80) return { text: 'text-emerald-400', stroke: '#00E676', badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' };
    if (val >= 60) return { text: 'text-cyan-400', stroke: '#00F0FF', badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' };
    if (val >= 45) return { text: 'text-amber-400', stroke: '#F59E0B', badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
    return { text: 'text-rose-400', stroke: '#FF1744', badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30' };
  };

  const theme = getScoreTheme(score);

  return (
    <aside className="scada-panel rounded-sm p-3.5 flex flex-col justify-between space-y-3.5 h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#1E2A3B]">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-sm bg-[#0F1622] border border-[#1E2A3B] text-purple-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
              AI INTELLIGENCE &amp; RISK RAIL
            </h3>
            <span className="text-[9px] font-mono text-purple-300">
              PINN SURROGATE DECISION SUPPORT
            </span>
          </div>
        </div>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold">
          13 MODELS
        </span>
      </div>

      {/* Module 1: Dominant Well Health Index */}
      <div className="scada-panel-inner p-3 rounded-sm space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-semibold flex items-center gap-1.5 text-[10.5px]">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> WELL HEALTH INDEX
          </span>
          <span className={`text-[9px] px-2 py-0.2 rounded-sm font-bold border ${theme.badge}`}>
            {status.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="flex items-baseline justify-between font-mono">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-3xl font-bold tracking-tight ${theme.text}`}>
              {score}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">/ 100</span>
          </div>
          <span className="text-[9.5px] text-slate-400">
            CONFIDENCE: <strong className="text-emerald-400">99.4%</strong>
          </span>
        </div>

        {/* 5 Sub-Score Factors Horizontal Bars */}
        <div className="space-y-1.5 pt-1 text-[10px] font-mono">
          <div className="space-y-0.5">
            <div className="flex justify-between text-slate-400">
              <span>THERMAL STATE (25%)</span>
              <span className="text-rose-300 font-bold">{sub?.thermal_score ?? 88}%</span>
            </div>
            <div className="h-1 w-full bg-[#070A0F] rounded-full overflow-hidden">
              <div className="h-full bg-rose-500" style={{ width: `${sub?.thermal_score ?? 88}%` }} />
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="flex justify-between text-slate-400">
              <span>MECHANICAL LIFT (25%)</span>
              <span className="text-amber-300 font-bold">{sub?.mechanical_score ?? 82}%</span>
            </div>
            <div className="h-1 w-full bg-[#070A0F] rounded-full overflow-hidden">
              <div className="h-full bg-amber-500" style={{ width: `${sub?.mechanical_score ?? 82}%` }} />
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="flex justify-between text-slate-400">
              <span>VOLUMETRIC EFFICIENCY (20%)</span>
              <span className="text-emerald-300 font-bold">{sub?.production_efficiency_score ?? 91}%</span>
            </div>
            <div className="h-1 w-full bg-[#070A0F] rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${sub?.production_efficiency_score ?? 91}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Module 2: Multi-Horizon Mechanical Risk Matrix */}
      <div className="scada-panel-inner p-3 rounded-sm space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[#1E2A3B] pb-1.5">
          <span className="text-slate-300 font-semibold text-[10.5px] flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> MECHANICAL RISK ENVELOPE
          </span>
          <span className="text-[9px] text-slate-400">MULTI-HORIZON</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px]">
          {/* Rod Floating */}
          <div className="bg-[#0B1017] p-2 rounded-sm border border-[#1E2A3B] space-y-0.5">
            <span className="text-slate-400 block text-[9px]">ROD FLOATING</span>
            <div className="flex items-baseline justify-between">
              <span className={`font-bold ${floatingProb > 0.35 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {(floatingProb * 100).toFixed(0)}%
              </span>
              <span className="text-[8.5px] text-cyan-400">5-30m</span>
            </div>
          </div>

          {/* Fluid Pound Impact */}
          <div className="bg-[#0B1017] p-2 rounded-sm border border-[#1E2A3B] space-y-0.5">
            <span className="text-slate-400 block text-[9px]">IMPACT SHOCK</span>
            <div className="flex items-baseline justify-between">
              <span className={`font-bold ${impactProb > 0.35 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {(impactProb * 100).toFixed(0)}%
              </span>
              <span className="text-[8.5px] text-rose-400">1-15m</span>
            </div>
          </div>

          {/* Rod Fatigue */}
          <div className="bg-[#0B1017] p-2 rounded-sm border border-[#1E2A3B] space-y-0.5">
            <span className="text-slate-400 block text-[9px]">ROD FATIGUE</span>
            <div className="flex items-baseline justify-between">
              <span className="font-bold text-slate-200">
                {(rodFatigueProb * 100).toFixed(0)}%
              </span>
              <span className="text-[8.5px] text-cyan-400">24h-30d</span>
            </div>
          </div>

          {/* Pump Unsetting */}
          <div className="bg-[#0B1017] p-2 rounded-sm border border-[#1E2A3B] space-y-0.5">
            <span className="text-slate-400 block text-[9px]">UNSETTING</span>
            <div className="flex items-baseline justify-between">
              <span className="font-bold text-slate-200">
                {(unsettingProb * 100).toFixed(0)}%
              </span>
              <span className="text-[8.5px] text-purple-400">1-24h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Module 3: 24-Hour Horizon Forecasts */}
      <div className="scada-panel-inner p-3 rounded-sm space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[#1E2A3B] pb-1.5">
          <span className="text-slate-300 font-semibold text-[10.5px] flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" /> 24H PREDICTIVE HORIZON
          </span>
          <span className="text-[9px] text-emerald-300 bg-emerald-500/10 px-1 py-0.2 rounded-sm border border-emerald-500/30">
            SHIFT + CYCLE
          </span>
        </div>

        <div className="space-y-1.5 text-[10px]">
          <div className="flex justify-between items-center bg-[#0B1017] p-1.5 rounded-sm border border-[#1E2A3B]">
            <span className="text-slate-400 flex items-center gap-1">
              <Droplets className="w-3 h-3 text-emerald-400" /> 24H PROD:
            </span>
            <strong className="text-emerald-400">{prodForecast24h} BOPD</strong>
          </div>

          <div className="flex justify-between items-center bg-[#0B1017] p-1.5 rounded-sm border border-[#1E2A3B]">
            <span className="text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" /> ENERGY INTENSITY:
            </span>
            <strong className="text-cyan-300">{energyKwh} kWh/bbl</strong>
          </div>

          <div className="flex justify-between items-center bg-[#0B1017] p-1.5 rounded-sm border border-[#1E2A3B]">
            <span className="text-slate-400 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" /> RE-STEAM WINDOW:
            </span>
            <strong className="text-amber-300">~{resteamWindow} DAYS</strong>
          </div>
        </div>
      </div>

      {/* Module 4: Autonomous Closed-Loop Advisory Snippet */}
      {topAdvisory && (
        <div className="scada-panel-inner p-2.5 rounded-sm space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between text-[10px] text-cyan-300 font-semibold border-b border-[#1E2A3B] pb-1">
            <span className="flex items-center gap-1">
              <Sliders className="w-3 h-3 text-cyan-400" /> TOP ADVISORY SETPOINT
            </span>
            <span className="text-amber-400">{topAdvisory.decision_interval}</span>
          </div>
          <div className="flex items-start gap-1.5 text-emerald-400 text-[10.5px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{topAdvisory.recommended_action}</span>
          </div>
          <p className="text-[9px] text-slate-400 italic line-clamp-2">
            {topAdvisory.rationale}
          </p>
        </div>
      )}

      {/* View All AI Diagnostics Button */}
      {onNavigateTab && (
        <button
          type="button"
          onClick={() => onNavigateTab('predictions')}
          className="w-full py-2 px-3 rounded-sm bg-[#141E2E] hover:bg-[#1A283D] border border-purple-500/40 hover:border-purple-500/70 text-purple-300 hover:text-white transition font-mono text-[10.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
        >
          <span>OPEN FULL AI INTELLIGENCE WORKSPACE</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </aside>
  );
});

AiIntelligenceRail.displayName = 'AiIntelligenceRail';

export default AiIntelligenceRail;
