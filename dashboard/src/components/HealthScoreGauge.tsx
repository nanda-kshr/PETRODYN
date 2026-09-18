'use client';

import React from 'react';
import { ShieldCheck, Flame, Wrench, BarChart3, Zap, CheckCircle2 } from 'lucide-react';
import { WellHealthScore } from '@/types/telemetry';
import { Tooltip } from './Tooltip';

interface HealthScoreGaugeProps {
  healthScore?: WellHealthScore | null;
}

export const HealthScoreGauge: React.FC<HealthScoreGaugeProps> = ({ healthScore }) => {
  const score = healthScore?.well_health_score ?? 85;
  const status = healthScore?.health_status ?? 'EXCELLENT_HEALTH';
  const sub = healthScore?.sub_scores ?? {
    thermal_score: 75,
    mechanical_score: 90,
    production_efficiency_score: 80,
    electrical_score: 85,
    sensor_health_score: 100,
  };

  const getColor = (val: number) => {
    if (val >= 80) return 'text-emerald-400 stroke-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (val >= 60) return 'text-sky-400 stroke-sky-400 bg-sky-500/10 border-sky-500/20';
    if (val >= 45) return 'text-amber-400 stroke-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 stroke-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden">
      {/* Category Indicator Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-cyan-400" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-sky-950/80 border border-sky-800 text-sky-400 tracking-wider">
            ANALYTICS &bull; CURRENT STATE
          </span>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            Well Health Score
          </h3>
          <Tooltip
            title="Well Health Score (0–100)"
            category="ANALYTICS"
            content="Real-time composite index representing overall well integrity. Synthesizes 5 domains: Thermal decay, Mechanical stress, Volumetric fillage, Motor power, and Sensor data quality."
          />
        </div>
        <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-mono ${getColor(score)}`}>
          {status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 my-2">
        {/* Gauge Circle */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={radius} className="stroke-slate-800" strokeWidth="10" fill="transparent" />
            <circle
              cx="70"
              cy="70"
              r={radius}
              className={`transition-all duration-1000 ease-out ${
                score >= 80 ? 'stroke-emerald-400' : score >= 60 ? 'stroke-sky-400' : score >= 45 ? 'stroke-amber-400' : 'stroke-rose-400'
              }`}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-white tracking-tight">{score}</span>
            <span className="text-[10px] text-slate-400 tracking-wider">SCORE (0-100)</span>
          </div>
        </div>

        {/* 5 Sub-scores Breakdown with Tooltips */}
        <div className="flex-1 w-full space-y-2 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Flame className="w-3.5 h-3.5 text-rose-400" /> Thermal State (25%)
                <Tooltip
                  title="Thermal State Sub-Score"
                  category="ANALYTICS"
                  content="Evaluates current downhole temperature vs. optimal production window (>60°C). Lower temperatures cause high viscosity drag."
                />
              </span>
              <span className="font-mono font-medium">{sub.thermal_score}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-rose-400 h-1.5 rounded-full transition-all" style={{ width: `${sub.thermal_score}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Wrench className="w-3.5 h-3.5 text-amber-400" /> Mechanical Lift (25%)
                <Tooltip
                  title="Mechanical Lift Sub-Score"
                  category="ANALYTICS"
                  content="Measures polished rod load stability. Penalizes rod-floating risk (min load < 20 kN) and excessive peak load (> 140 kN)."
                />
              </span>
              <span className="font-mono font-medium">{sub.mechanical_score}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-amber-400 h-1.5 rounded-full transition-all" style={{ width: `${sub.mechanical_score}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-400" /> Production Efficiency (20%)
                <Tooltip
                  title="Volumetric Efficiency Sub-Score"
                  category="ANALYTICS"
                  content="Ratio of actual daily gross oil production to theoretical plunger displacement based on stroke and SPM."
                />
              </span>
              <span className="font-mono font-medium">{sub.production_efficiency_score}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-400 h-1.5 rounded-full transition-all" style={{ width: `${sub.production_efficiency_score}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Zap className="w-3.5 h-3.5 text-sky-400" /> Electrical / Motor (15%)
                <Tooltip
                  title="Electrical Motor Load Sub-Score"
                  category="ANALYTICS"
                  content="Monitors surface electric motor current draw vs. full-load rating. Penalizes motor overcurrent and extreme underload."
                />
              </span>
              <span className="font-mono font-medium">{sub.electrical_score}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-sky-400 h-1.5 rounded-full transition-all" style={{ width: `${sub.electrical_score}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Sensor Health (15%)
                <Tooltip
                  title="Sensor Data Quality Sub-Score"
                  category="ANALYTICS"
                  content="Sanity validation checking for missing telemetry channels, stuck/flatline sensors, calibration drift, and unphysical outliers."
                />
              </span>
              <span className="font-mono font-medium">{sub.sensor_health_score}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-purple-400 h-1.5 rounded-full transition-all" style={{ width: `${sub.sensor_health_score}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
