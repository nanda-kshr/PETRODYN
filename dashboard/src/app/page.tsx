'use client';

import React, { useState } from 'react';
import { useTelemetryWebSocket } from '@/hooks/useTelemetryWebSocket';
import { usePredictions } from '@/hooks/usePredictions';
import { OilDrillingIntro } from '@/components/OilDrillingIntro';
import { Header } from '@/components/Header';
import { HealthScoreGauge } from '@/components/HealthScoreGauge';
import { DynamometerCard } from '@/components/DynamometerCard';
import { TelemetryGraphs } from '@/components/TelemetryGraphs';
import { ThermalViscosityCard } from '@/components/ThermalViscosityCard';
import { PredictiveRiskPanel } from '@/components/PredictiveRiskPanel';
import { ProductionForecastPanel } from '@/components/ProductionForecastPanel';
import { OptimizationAdvisoryCard } from '@/components/OptimizationAdvisoryCard';
import { SimulatorControls } from '@/components/SimulatorControls';
import { Activity, Sparkles, Sliders, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const [wellId] = useState('BW-001');
  const [activeTab, setActiveTab] = useState<'all' | 'analytics' | 'predictions' | 'simulator'>('all');
  const [showIntro, setShowIntro] = useState(true);

  // 1. Real-time WebSocket connection to Data Ingestion
  const { latest, history, isConnected } = useTelemetryWebSocket(
    process.env.NEXT_PUBLIC_INGESTION_WS_URL,
    wellId,
  );

  // 2. Periodic polling of AI Predictions & Analytics from Database / AI Pipeline
  const { analytics, predictions, healthScore, lastUpdated, refetch } = usePredictions(
    process.env.NEXT_PUBLIC_AI_API_URL,
    wellId,
    3000,
  );

  return (
    <>
      {/* 2D Animated Oil-Drilling Loading Screen */}
      <AnimatePresence>
        {showIntro && (
          <OilDrillingIntro onComplete={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      <div className="min-h-screen text-slate-100 flex flex-col selection:bg-sky-500/30 selection:text-sky-200">
        {/* Top Header & Status Bar */}
        <Header
          wellId={wellId}
          isConnected={isConnected}
          latest={latest}
          lastUpdated={lastUpdated}
          onRefresh={refetch}
          onReplayIntro={() => setShowIntro(true)}
        />

        {/* Main Grid Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 max-w-[1650px] w-full mx-auto">
          {/* Navigation & Mode Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-2.5 rounded-2xl border border-slate-800/90 shadow-xl">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  activeTab === 'all'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> All Overview
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  activeTab === 'analytics'
                    ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white border border-sky-400/40 shadow-lg glow-sky'
                    : 'text-slate-400 hover:text-sky-300 hover:bg-sky-500/10'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                <span>Real-Time Analytics</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === 'analytics' ? 'bg-black/30 text-white' : 'bg-sky-500/10 text-sky-300 border border-sky-500/30'
                }`}>15</span>
              </button>

              <button
                onClick={() => setActiveTab('predictions')}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  activeTab === 'predictions'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border border-purple-400/40 shadow-lg glow-purple'
                    : 'text-slate-400 hover:text-purple-300 hover:bg-purple-500/10'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Predictions &amp; Risk</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === 'predictions' ? 'bg-black/30 text-white' : 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                }`}>13</span>
              </button>

              <button
                onClick={() => setActiveTab('simulator')}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  activeTab === 'simulator'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border border-emerald-400/40 shadow-lg glow-emerald'
                    : 'text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-400" /> Simulator Controls
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 font-mono px-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50 animate-pulse" /> Analytics (Current)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400/50 animate-pulse" /> Predictions (Future)
              </span>
            </div>
          </div>

          {/* SECTION 1: REAL-TIME ANALYTICS (Current State Diagnostics) */}
          {(activeTab === 'all' || activeTab === 'analytics') && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800/80">
                <span className="p-1.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 shadow-sm">
                  <Activity className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-white tracking-tight font-mono">
                  Real-Time Diagnostics &amp; Operational Analytics
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 font-mono">
                  15 Metrics Active
                </span>
              </div>

              {/* Row 1: Health Score HUD Gauge & Surface Dynamometer Card */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <HealthScoreGauge healthScore={healthScore} />
                <DynamometerCard analytics={analytics} latest={latest} />
              </div>

              {/* Row 2: Live Mechanical, Electrical & Production Graphs */}
              <TelemetryGraphs history={history} />
            </motion.section>
          )}

          {/* SECTION 2: PREDICTIVE MODELS & MULTI-HORIZON RISK OUTLOOK */}
          {(activeTab === 'all' || activeTab === 'predictions') && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 pt-2"
            >
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800/80">
                <span className="p-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-white tracking-tight font-mono">
                  AI Predictive Modeling &amp; Multi-Horizon Risk Outlook
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono">
                  13 Predictions Active
                </span>
              </div>

              {/* Predictive Mechanical Risk Guard */}
              <PredictiveRiskPanel predictions={predictions} />

              {/* Shift Thermal Decay & Viscosity Dynamics */}
              <ThermalViscosityCard
                analytics={analytics}
                predictions={predictions}
                latest={latest}
              />

              {/* Operational & Cycle Production/Energy Forecasts */}
              <ProductionForecastPanel predictions={predictions} />

              {/* Field Optimization Decision Cadence Matrix */}
              <OptimizationAdvisoryCard items={predictions?.optimization_advisory} />
            </motion.section>
          )}

          {/* SECTION 3: SIMULATOR RUNTIME CONTROLS */}
          {(activeTab === 'all' || activeTab === 'simulator') && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 pt-2"
            >
              <SimulatorControls
                simulatorApiUrl={process.env.NEXT_PUBLIC_SIMULATOR_API_URL}
                latest={latest}
                onParameterChanged={refetch}
              />
            </motion.section>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 glass-panel-sub px-6 py-4 text-center text-xs text-slate-500 font-mono mt-10">
          THERMO-LIFT Prototype &bull; Real-time SRP &amp; CSS Well Digital Twin &bull; Baghewala Field Heavy Oil Pilot
        </footer>
      </div>
    </>
  );
}
