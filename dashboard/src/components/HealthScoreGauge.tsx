'use client';

import React from 'react';
import { ShieldCheck, Flame, Wrench, BarChart3, Zap, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { WellHealthScore } from '@/types/telemetry';
import { Tooltip } from './Tooltip';

interface HealthScoreGaugeProps {
  healthScore?: WellHealthScore | null;
}

export const HealthScoreGauge: React.FC<HealthScoreGaugeProps> = ({ healthScore }) => {
  const isAvailable = Boolean(healthScore && typeof healthScore.well_health_score === 'number');
  const score = isAvailable ? healthScore!.well_health_score : null;
  const status = healthScore?.health_status ?? 'CALCULATING...';
  const sub = healthScore?.sub_scores;

  const getTheme = (val: number | null) => {
    if (val === null) {
      return {
        text: 'text-slate-400',
        stroke: '#475569',
        badge: 'bg-slate-800 text-slate-400 border-[#1E293B]',
      };
    }
    if (val >= 80) {
      return {
        text: 'text-emerald-400',
        stroke: '#10b981',
        badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      };
    }
    if (val >= 60) {
      return {
        text: 'text-cyan-400',
        stroke: '#06b6d4',
        badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      };
    }
    if (val >= 45) {
      return {
        text: 'text-amber-400',
        stroke: '#f59e0b',
        badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      };
    }
    return {
      text: 'text-rose-400',
      stroke: '#f43f5e',
      badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    };
  };

  const currentTheme = getTheme(score);
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = score !== null ? circumference - (score / 100) * circumference : circumference;

  return (
    <div className="bg-[#0D1219] border border-[#1E293B] rounded-lg p-4 flex flex-col justify-between relative overflow-hidden shadow-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
            WELL INTEGRITY HEALTH SCORE
          </h3>
          <Tooltip
            title="Well Health Score (0–100)"
            category="ANALYTICS"
            content="Composite integrity index synthesizing downhole thermal state (25%), mechanical stress stability (25%), volumetric efficiency (20%), motor electrical draw (15%), and sensor data quality (15%)."
          />
        </div>
        <span className={`text-[10px] px-2.5 py-0.5 rounded font-mono font-bold tracking-wider border ${currentTheme.badge}`}>
          {status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Main Gauge Arc & Sub-Score Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center my-3">
        {/* HUD Arc Meter (5 cols) */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 150 150">
              {/* Outer Track Ring */}
              <circle
                cx="75"
                cy="75"
                r={radius}
                className="stroke-[#17202D]"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Ticked Calibrations */}
              <circle
                cx="75"
                cy="75"
                r={radius + 8}
                className="stroke-[#1E293B]"
                strokeWidth="1.5"
                strokeDasharray="2 6"
                fill="transparent"
              />
              {/* Active Progress Arc */}
              <motion.circle
                cx="75"
                cy="75"
                r={radius}
                stroke={currentTheme.stroke}
                strokeWidth="8"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.0, ease: 'easeOut' }}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Score Center Value */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-mono font-bold text-slate-100 tracking-tight">
                {score !== null ? score : '--'}
              </span>
              <span className="text-[8.5px] font-mono text-slate-400 tracking-widest uppercase font-semibold">
                INDEX / 100
              </span>
            </div>
          </div>
        </div>

        {/* 5 Sub-Score Diagnostics (7 cols) */}
        <div className="sm:col-span-7 space-y-2 text-xs font-mono">
          {/* 1. Thermal State */}
          <div className="space-y-0.5">
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="flex items-center gap-1 text-slate-300">
                <Flame className="w-3 h-3 text-rose-400" /> Thermal State (25%)
              </span>
              <span className="font-bold text-rose-300">
                {sub?.thermal_score !== undefined ? `${sub.thermal_score}%` : '--'}
              </span>
            </div>
            <div className="w-full bg-[#111821] border border-[#1E293B] rounded h-1.5 overflow-hidden">
              <div
                style={{ width: `${sub?.thermal_score ?? 0}%` }}
                className="bg-rose-500 h-full rounded transition-all duration-500"
              />
            </div>
          </div>

          {/* 2. Mechanical Lift */}
          <div className="space-y-0.5">
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="flex items-center gap-1 text-slate-300">
                <Wrench className="w-3 h-3 text-amber-400" /> Mechanical Lift (25%)
              </span>
              <span className="font-bold text-amber-300">
                {sub?.mechanical_score !== undefined ? `${sub.mechanical_score}%` : '--'}
              </span>
            </div>
            <div className="w-full bg-[#111821] border border-[#1E293B] rounded h-1.5 overflow-hidden">
              <div
                style={{ width: `${sub?.mechanical_score ?? 0}%` }}
                className="bg-amber-500 h-full rounded transition-all duration-500"
              />
            </div>
          </div>

          {/* 3. Production Efficiency */}
          <div className="space-y-0.5">
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="flex items-center gap-1 text-slate-300">
                <BarChart3 className="w-3 h-3 text-emerald-400" /> Production Efficiency (20%)
              </span>
              <span className="font-bold text-emerald-300">
                {sub?.production_efficiency_score !== undefined ? `${sub.production_efficiency_score}%` : '--'}
              </span>
            </div>
            <div className="w-full bg-[#111821] border border-[#1E293B] rounded h-1.5 overflow-hidden">
              <div
                style={{ width: `${sub?.production_efficiency_score ?? 0}%` }}
                className="bg-emerald-500 h-full rounded transition-all duration-500"
              />
            </div>
          </div>

          {/* 4. Electrical Motor */}
          <div className="space-y-0.5">
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="flex items-center gap-1 text-slate-300">
                <Zap className="w-3 h-3 text-cyan-400" /> Electrical / Motor (15%)
              </span>
              <span className="font-bold text-cyan-300">
                {sub?.electrical_score !== undefined ? `${sub.electrical_score}%` : '--'}
              </span>
            </div>
            <div className="w-full bg-[#111821] border border-[#1E293B] rounded h-1.5 overflow-hidden">
              <div
                style={{ width: `${sub?.electrical_score ?? 0}%` }}
                className="bg-cyan-500 h-full rounded transition-all duration-500"
              />
            </div>
          </div>

          {/* 5. Sensor Quality */}
          <div className="space-y-0.5">
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="flex items-center gap-1 text-slate-300">
                <CheckCircle2 className="w-3 h-3 text-purple-400" /> Sensor Health (15%)
              </span>
              <span className="font-bold text-purple-300">
                {sub?.sensor_health_score !== undefined ? `${sub.sensor_health_score}%` : '--'}
              </span>
            </div>
            <div className="w-full bg-[#111821] border border-[#1E293B] rounded h-1.5 overflow-hidden">
              <div
                style={{ width: `${sub?.sensor_health_score ?? 0}%` }}
                className="bg-purple-500 h-full rounded transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Diagnostic Note */}
      <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span>DOMAIN: MULTI-SYSTEM TELEMETRY SYNTHESIS</span>
        <span className="text-slate-400">CALCULATED: LIVE (1000ms)</span>
      </div>
    </div>
  );
};

export default HealthScoreGauge;
