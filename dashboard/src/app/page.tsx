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
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
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
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-gray-200 p-2.5 rounded-xl shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'all'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> All Overview
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'analytics'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-sky-700 hover:bg-sky-50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Real-Time Analytics</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'analytics' ? 'bg-sky-700 text-sky-100' : 'bg-sky-100 text-sky-800'
              }`}>15</span>
            </button>

            <button
              onClick={() => setActiveTab('predictions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'predictions'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Predictions &amp; Risk</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'predictions' ? 'bg-purple-700 text-purple-100' : 'bg-purple-100 text-purple-800'
              }`}>13</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'simulator'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> Simulator Controls
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
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
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
              <span className="p-1 rounded bg-sky-500/10 border border-sky-500/30 text-sky-600">
                <Activity className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-gray-900 tracking-tight">
                Real-Time Diagnostics &amp; Operational Analytics
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-700 font-mono">
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
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
              <span className="p-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-600">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-gray-900 tracking-tight">
                AI Predictive Modeling &amp; Multi-Horizon Risk Outlook
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-700 font-mono">
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
      <footer className="border-t border-gray-200 bg-gray-50 px-6 py-3 text-center text-xs text-gray-400">
        THERMO-LIFT Prototype &bull; Real-time SRP &amp; CSS Well Digital Twin &bull; Baghewala Field Heavy Oil Pilot
      </footer>
    </div>
  );
}
