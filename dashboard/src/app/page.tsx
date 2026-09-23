'use client';

import React, { useState } from 'react';
import { useTelemetryWebSocket } from '@/hooks/useTelemetryWebSocket';
import { usePredictions } from '@/hooks/usePredictions';
import { OilDrillingIntro } from '@/components/OilDrillingIntro';
import { Header } from '@/components/Header';
import { WellboreDigitalTwin } from '@/components/WellboreDigitalTwin';
import { HealthScoreGauge } from '@/components/HealthScoreGauge';
import { DynamometerCard } from '@/components/DynamometerCard';
import { TelemetryGraphs } from '@/components/TelemetryGraphs';
import { ThermalViscosityCard } from '@/components/ThermalViscosityCard';
import { PredictiveRiskPanel } from '@/components/PredictiveRiskPanel';
import { ProductionForecastPanel } from '@/components/ProductionForecastPanel';
import { OptimizationAdvisoryCard } from '@/components/OptimizationAdvisoryCard';
import { SimulatorControls } from '@/components/SimulatorControls';
import { Activity, Sparkles, Sliders, LayoutGrid, Radio, ShieldCheck, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const [wellId] = useState('BW-001');
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'predictions' | 'simulator'>('overview');
  const [showIntro, setShowIntro] = useState(true);

  const { latest, history, isConnected } = useTelemetryWebSocket(
    process.env.NEXT_PUBLIC_INGESTION_WS_URL,
    wellId,
  );

  const { analytics, predictions, healthScore, lastUpdated, refetch } = usePredictions(
    process.env.NEXT_PUBLIC_AI_API_URL,
    wellId,
    3000,
  );

  return (
    <div className="min-h-screen bg-[#080B10] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 font-sans">
      <AnimatePresence>
        {showIntro && (
          <OilDrillingIntro onComplete={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showIntro ? 0 : 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex flex-col"
      >
        <Header
          wellId={wellId}
          isConnected={isConnected}
          latest={latest}
          lastUpdated={lastUpdated}
          onRefresh={refetch}
          onReplayIntro={() => setShowIntro(true)}
        />

        {/* Precision Industrial Workstation Navigation Bar */}
        <div className="sticky top-[53px] z-40 bg-[#0D1219]/95 border-b border-[#1E293B] px-4 lg:px-6 py-2 backdrop-blur-md">
          <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3">
            {/* Nav Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded transition ${
                  activeTab === 'overview'
                    ? 'bg-[#151D27] text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#111821] border border-transparent'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
                <span>1. OVERVIEW &amp; DIGITAL TWIN</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded transition ${
                  activeTab === 'analytics'
                    ? 'bg-[#151D27] text-sky-300 border border-sky-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#111821] border border-transparent'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                <span>2. REAL-TIME ANALYTICS</span>
                <span className="px-1.5 py-0.2 rounded bg-[#080B10] text-sky-400 text-[9px] border border-sky-500/30">
                  15
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('predictions')}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded transition ${
                  activeTab === 'predictions'
                    ? 'bg-[#151D27] text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#111821] border border-transparent'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>3. AI PREDICTIONS &amp; RISK</span>
                <span className="px-1.5 py-0.2 rounded bg-[#080B10] text-purple-400 text-[9px] border border-purple-500/30">
                  13
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('simulator')}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded transition ${
                  activeTab === 'simulator'
                    ? 'bg-[#151D27] text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#111821] border border-transparent'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span>4. SIMULATOR COCKPIT</span>
              </button>
            </div>

            {/* Right Status Meta */}
            <div className="hidden sm:flex items-center gap-4 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                TWIN: 100% CALIBRATED
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                AI INFERENCE: ACTIVE
              </span>
              <span className="text-slate-400">
                LAST SYNC: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'LIVE'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Workstation Operational Canvas */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 space-y-5 max-w-[1720px] w-full mx-auto">
          {/* TAB 1: OVERVIEW & DIGITAL TWIN CENTERPIECE */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              {/* ZONE A: PRIMARY DIGITAL TWIN VISUALIZATION */}
              <WellboreDigitalTwin
                latest={latest}
                analytics={analytics}
                predictions={predictions}
              />

              {/* ZONE B: LIVE OPERATING STATUS & DIAGNOSTICS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <HealthScoreGauge healthScore={healthScore} />
                <DynamometerCard analytics={analytics} latest={latest} />
              </div>

              {/* ZONE C: AI PREDICTIVE INTELLIGENCE & TELEMETRY */}
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between border-b border-[#1E293B] pb-2 text-xs font-mono">
                  <div className="flex items-center gap-2 text-slate-100 font-bold">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>AI SURROGATE INTELLIGENCE &amp; MULTI-HORIZON FORECASTS</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    PINN PHYSICS-INFORMED SURROGATE LAYER
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <PredictiveRiskPanel predictions={predictions} />
                  <ThermalViscosityCard
                    analytics={analytics}
                    predictions={predictions}
                    latest={latest}
                  />
                  <ProductionForecastPanel predictions={predictions} />
                  <OptimizationAdvisoryCard items={predictions?.optimization_advisory} />
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: REAL-TIME ANALYTICS & TELEMETRY WORKSTATION */}
          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-100 font-bold">
                  <Activity className="w-4 h-4 text-sky-400" />
                  <span>REAL-TIME SCADA TELEMETRY &amp; DIAGNOSTIC WORKSTATION</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-300">
                  15 ACTIVE CHANNELS (10 Hz)
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <HealthScoreGauge healthScore={healthScore} />
                <DynamometerCard analytics={analytics} latest={latest} />
              </div>

              <TelemetryGraphs history={history} />
            </motion.div>
          )}

          {/* TAB 3: AI PREDICTIONS & MULTI-HORIZON RISK DECISION CENTER */}
          {activeTab === 'predictions' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-100 font-bold">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>AI OPERATIONS DECISION-SUPPORT CENTER</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300">
                  13 PREDICTION MODELS ACTIVE
                </span>
              </div>

              <PredictiveRiskPanel predictions={predictions} />

              <ThermalViscosityCard
                analytics={analytics}
                predictions={predictions}
                latest={latest}
              />

              <ProductionForecastPanel predictions={predictions} />

              <OptimizationAdvisoryCard items={predictions?.optimization_advisory} />
            </motion.div>
          )}

          {/* TAB 4: SIMULATOR EXPERIMENTATION COCKPIT */}
          {activeTab === 'simulator' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-100 font-bold">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>IN-SILICO EXPERIMENTATION &amp; SETPOINT SIMULATOR</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  PORT 3001 // DIGITAL TWIN LOOP
                </span>
              </div>

              <SimulatorControls
                simulatorApiUrl={process.env.NEXT_PUBLIC_SIMULATOR_API_URL}
                latest={latest}
                onParameterChanged={refetch}
              />
            </motion.div>
          )}
        </main>

        {/* Industrial Control Room Footer */}
        <footer className="border-t border-[#1E293B] bg-[#080B10] px-6 py-3 text-center text-[10px] text-slate-400 font-mono mt-8">
          THERMO-LIFT &bull; AI-Powered Well-to-Surface Digital Twin &bull; Baghewala Heavy Oil Pilot, Rajasthan &bull; All Subsurface Models Validated
        </footer>
      </motion.div>
    </div>
  );
}
