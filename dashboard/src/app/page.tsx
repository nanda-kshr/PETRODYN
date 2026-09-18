'use client';

import React, { useState } from 'react';
import { useTelemetryWebSocket } from '@/hooks/useTelemetryWebSocket';
import { usePredictions } from '@/hooks/usePredictions';
import { Header } from '@/components/Header';
import { HealthScoreGauge } from '@/components/HealthScoreGauge';
import { DynamometerCard } from '@/components/DynamometerCard';
import { TelemetryGraphs } from '@/components/TelemetryGraphs';
import { ThermalViscosityCard } from '@/components/ThermalViscosityCard';
import { PredictiveRiskPanel } from '@/components/PredictiveRiskPanel';
import { ProductionForecastPanel } from '@/components/ProductionForecastPanel';
import { OptimizationAdvisoryCard } from '@/components/OptimizationAdvisoryCard';
import { SimulatorControls } from '@/components/SimulatorControls';
import { Activity, Sparkles, Sliders, LayoutGrid, Info } from 'lucide-react';

export default function DashboardPage() {
  const [wellId] = useState('BW-001');
  const [activeTab, setActiveTab] = useState<'all' | 'analytics' | 'predictions' | 'simulator'>('all');

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
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col">
      {/* Top Navigation & Status Bar */}
      <Header
        wellId={wellId}
        isConnected={isConnected}
        latest={latest}
        lastUpdated={lastUpdated}
        onRefresh={refetch}
      />

      {/* Main Grid Content */}
      <main className="flex-1 p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        {/* Navigation & Mode Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl shadow-md">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'all'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> All Overview
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'analytics'
                  ? 'bg-sky-950 text-sky-300 border border-sky-800 shadow-sm'
                  : 'text-slate-400 hover:text-sky-300 hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span>Real-Time Analytics</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-900/60 font-mono">15</span>
            </button>

            <button
              onClick={() => setActiveTab('predictions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'predictions'
                  ? 'bg-purple-950 text-purple-300 border border-purple-800 shadow-sm'
                  : 'text-slate-400 hover:text-purple-300 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Predictions &amp; Risk</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-900/60 font-mono">13</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'simulator'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 shadow-sm'
                  : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" /> Simulator Controls
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Analytics (Current)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Predictions (Future)
            </span>
          </div>
        </div>

        {/* SECTION 1: REAL-TIME ANALYTICS (Current State Diagnostics) */}
        {(activeTab === 'all' || activeTab === 'analytics') && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="p-1 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
                <Activity className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">
                Real-Time Diagnostics &amp; Operational Analytics
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-300 font-mono">
                15 Metrics Active
              </span>
            </div>

            {/* Row 1: Health Score & Surface Dynamometer Card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HealthScoreGauge healthScore={healthScore} />
              <DynamometerCard analytics={analytics} latest={latest} />
            </div>

            {/* Row 2: Live Mechanical, Electrical & Production Graphs */}
            <TelemetryGraphs history={history} />
          </section>
        )}

        {/* SECTION 2: PREDICTIVE MODELS & MULTI-HORIZON RISK OUTLOOK */}
        {(activeTab === 'all' || activeTab === 'predictions') && (
          <section className="space-y-4 pt-2">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="p-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">
                AI Predictive Modeling &amp; Multi-Horizon Risk Outlook
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 font-mono">
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
          </section>
        )}

        {/* SECTION 3: SIMULATOR RUNTIME CONTROLS */}
        {(activeTab === 'all' || activeTab === 'simulator') && (
          <section className="space-y-4 pt-2">
            <SimulatorControls
              simulatorApiUrl={process.env.NEXT_PUBLIC_SIMULATOR_API_URL}
              latest={latest}
              onParameterChanged={refetch}
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-3 text-center text-xs text-slate-500">
        THERMO-LIFT Prototype &bull; Real-time SRP &amp; CSS Well Digital Twin &bull; Baghewala Field Heavy Oil Pilot
      </footer>
    </div>
  );
}
