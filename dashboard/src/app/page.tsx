'use client';

import React, { useState, useEffect } from 'react';
import { useTelemetryWebSocket } from '@/hooks/useTelemetryWebSocket';
import { usePredictions } from '@/hooks/usePredictions';
import { OilDrillingIntro } from '@/components/OilDrillingIntro';
import { CommandHeader } from '@/components/CommandHeader';
import { WorkspaceRail, WorkspaceTab } from '@/components/WorkspaceRail';
import { DigitalTwinSchematic } from '@/components/DigitalTwinSchematic';
import { LiveTelemetryRibbon } from '@/components/LiveTelemetryRibbon';
import { AiIntelligenceRail } from '@/components/AiIntelligenceRail';
import { HealthScoreGauge } from '@/components/HealthScoreGauge';
import { DynamometerCard } from '@/components/DynamometerCard';
import { TelemetryGraphs } from '@/components/TelemetryGraphs';
import { ThermalViscosityCard } from '@/components/ThermalViscosityCard';
import { PredictiveRiskPanel } from '@/components/PredictiveRiskPanel';
import { ProductionForecastPanel } from '@/components/ProductionForecastPanel';
import { OptimizationAdvisoryCard } from '@/components/OptimizationAdvisoryCard';
import { SimulatorControls } from '@/components/SimulatorControls';
import { Skiper1 } from '@/components/ui/skiper1';
import { GlobeCollection } from '@/shaders/globe/GlobeCollection';
import '@/shaders/threeui.css';
import { Activity, Sparkles, Sliders, LayoutGrid, Radio, ShieldCheck, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Website Navigation and Specialized Views
import { SiteNavbar, SiteNavId } from '@/components/SiteNavbar';
import { HomeView } from '@/components/website/HomeView';
import { DigitalTwinView } from '@/components/website/DigitalTwinView';
import { OptimizationView } from '@/components/website/OptimizationView';
import { DataQualityView } from '@/components/website/DataQualityView';
import { VrSimulatorView } from '@/components/website/VrSimulatorView';
import { BaghewalaFieldView } from '@/components/website/BaghewalaFieldView';

export default function DashboardPage() {
  const [wellId] = useState('BW-001');
  const [currentSiteView, setCurrentSiteView] = useState<SiteNavId>('home');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [showIntro, setShowIntro] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [isFxEnabled, setIsFxEnabled] = useState(true);

  const { latest, history, isConnected } = useTelemetryWebSocket(
    'https://sih.instaroid.page',
    wellId,
  );

  const { analytics, predictions, healthScore, lastUpdated, refetch } = usePredictions(
    'https://sih.instaroid.page/ai',
    wellId,
    3000,
  );

  // Keyboard shortcut listener for workspaces 1, 2, 3, 4 when in dashboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (currentSiteView === 'dashboard') {
        if (e.key === '1') setActiveTab('overview');
        if (e.key === '2') setActiveTab('analytics');
        if (e.key === '3') setActiveTab('predictions');
        if (e.key === '4') setActiveTab('simulator');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSiteView]);

  return (
    <div className="min-h-screen bg-[#05030e] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 font-sans relative overflow-x-hidden">
      {/* ThreeUI Energy Orb Background Layer */}
      {isFxEnabled ? (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-35">
          <GlobeCollection
            variant="energy-orb"
            speed={1.00}
            scale={1.00}
            smokeScale={1.00}
            smokeStrength={1.00}
            smokeSpeed={1.00}
            hue={0}
            saturation={1.00}
            glow={1.00}
            starDensity={0.6}
            starSpeed={0.8}
            starSize={1.00}
            brightness={0.9}
            opacity={0.8}
          />
        </div>
      ) : (
        <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/20 via-[#05030e] to-[#05030e]" />
      )}

      {/* Optional Oil Drilling Intro Fullscreen Modal */}
      <AnimatePresence>
        {showIntro && (
          <OilDrillingIntro onComplete={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      {/* Global Website Top Navbar */}
      <SiteNavbar
        currentView={currentSiteView}
        onNavigate={setCurrentSiteView}
        isConnected={isConnected}
        isFxEnabled={isFxEnabled}
        onToggleFx={() => setIsFxEnabled((prev) => !prev)}
      />

      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 flex flex-col relative z-10"
      >
        {/* VIEW 01: HOME LANDING PAGE WITH PUMPJACK HERO */}
        {currentSiteView === 'home' && (
          <motion.div
            key="site-home"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <HomeView
              onNavigate={setCurrentSiteView}
              onOpenCinematicModal={() => setShowIntro(true)}
            />
          </motion.div>
        )}

        {/* VIEW 02: COUPLED DIGITAL TWIN */}
        {currentSiteView === 'digital-twin' && (
          <motion.div
            key="site-twin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <DigitalTwinView onNavigate={setCurrentSiteView} />
          </motion.div>
        )}

        {/* VIEW 03: MULTI-OBJECTIVE OPTIMIZATION */}
        {currentSiteView === 'optimization' && (
          <motion.div
            key="site-optimization"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <OptimizationView onNavigate={setCurrentSiteView} />
          </motion.div>
        )}

        {/* VIEW 04: DATA QUALITY ENGINE */}
        {currentSiteView === 'data-quality' && (
          <motion.div
            key="site-data-quality"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <DataQualityView onNavigate={setCurrentSiteView} />
          </motion.div>
        )}

        {/* VIEW 05: VR SIMULATOR & TRAINING */}
        {currentSiteView === 'vr-simulator' && (
          <motion.div
            key="site-vr-simulator"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <VrSimulatorView onNavigate={setCurrentSiteView} />
          </motion.div>
        )}

        {/* VIEW 06: BAGHEWALA FIELD PROFILE */}
        {currentSiteView === 'baghewala' && (
          <motion.div
            key="site-baghewala"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <BaghewalaFieldView onNavigate={setCurrentSiteView} />
          </motion.div>
        )}

        {/* VIEW 07: LIVE SCADA OPERATIONS DASHBOARD */}
        {currentSiteView === 'dashboard' && (
          <motion.div
            key="site-dashboard"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            {/* Compact Industrial Command Header */}
            <CommandHeader
              wellId={wellId}
              isConnected={isConnected}
              latest={latest}
              lastUpdated={lastUpdated}
              onRefresh={refetch}
              onReplayIntro={() => setShowIntro(true)}
              isFxEnabled={isFxEnabled}
              onToggleFx={() => setIsFxEnabled((prev) => !prev)}
            />

            {/* FIXED SCADA TELEMETRY INSTRUMENT BAR (Pinned during all scrolling) */}
            <div className="sticky top-12 z-30 bg-[#070A0F]/95 backdrop-blur-xl border-b border-[#1E2A3B] px-3 lg:px-5 py-2 shadow-xl">
              <div className="max-w-[1780px] mx-auto w-full">
                <LiveTelemetryRibbon latest={latest} />
              </div>
            </div>

            {/* Operating System Shell: Left Workspace Rail + Main Engineering Canvas */}
            <div className="flex-1 flex overflow-hidden">
              {/* Vertical Workspace Navigation Rail */}
              <WorkspaceRail
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isCollapsed={isNavCollapsed}
                onToggleCollapse={() => setIsNavCollapsed(!isNavCollapsed)}
                badgeCounts={{ analytics: 15, predictions: 13 }}
              />

              {/* Main Engineering Workspace Canvas */}
              <main className="flex-1 p-3 sm:p-4 lg:p-5 space-y-4 max-w-[1780px] w-full mx-auto overflow-y-auto">
                {/* WORKSPACE 01: OVERVIEW & DIGITAL TWIN CENTERPIECE */}
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview-workspace"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    {/* HERO SECTION: Large Central Digital Twin (8 cols) + Right AI Decision Rail (4 cols) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
                      <div className="lg:col-span-8 flex flex-col">
                        <DigitalTwinSchematic
                          latest={latest}
                          analytics={analytics}
                          predictions={predictions}
                        />
                      </div>
                      <div className="lg:col-span-4 flex flex-col">
                        <AiIntelligenceRail
                          healthScore={healthScore}
                          predictions={predictions}
                          analytics={analytics}
                          onNavigateTab={setActiveTab}
                        />
                      </div>
                    </div>

                    {/* ENGINEERING ANALYTICS WORKSPACE: SURFACE DYNAMOMETER & HEALTH GAUGE */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                      <DynamometerCard analytics={analytics} latest={latest} />
                      <HealthScoreGauge healthScore={healthScore} />
                    </div>

                    {/* REAL-TIME MECHANICAL, ELECTRICAL & PRODUCTION TELEMETRY STREAM */}
                    <TelemetryGraphs history={history} />

                    {/* ADVANCED AI PREDICTIVE INTELLIGENCE PANELS */}
                    <div className="space-y-3.5 pt-1">
                      <div className="flex items-center justify-between border-b border-[#1E2A3B] pb-2 text-xs font-mono">
                        <div className="flex items-center gap-2 text-slate-100 font-bold">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          <span>PINN PHYSICS-INFORMED SURROGATE INTELLIGENCE &amp; MULTI-HORIZON RISK</span>
                        </div>
                        <span className="text-[9.5px] text-purple-300">
                          AUTONOMOUS SURROGATE LAYER // 1,150M RESERVOIR
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3.5">
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

                {/* WORKSPACE 02: REAL-TIME SCADA TELEMETRY WORKSTATION */}
                {activeTab === 'analytics' && (
                  <motion.div
                    key="analytics-workspace"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-[#1E2A3B] pb-2 text-xs font-mono">
                      <div className="flex items-center gap-2 text-slate-100 font-bold">
                        <Activity className="w-4 h-4 text-sky-400" />
                        <span>REAL-TIME SCADA TELEMETRY &amp; LOAD DIAGNOSTIC WORKSTATION</span>
                      </div>
                      <span className="text-[9.5px] px-2 py-0.5 rounded-sm bg-sky-500/10 border border-sky-500/30 text-sky-300">
                        15 ACTIVE TRANSDUCERS (10 Hz)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                      <DynamometerCard analytics={analytics} latest={latest} />
                      <HealthScoreGauge healthScore={healthScore} />
                    </div>

                    <TelemetryGraphs history={history} />
                  </motion.div>
                )}

                {/* WORKSPACE 03: AI INTELLIGENCE & MULTI-HORIZON DECISION CENTER */}
                {activeTab === 'predictions' && (
                  <motion.div
                    key="predictions-workspace"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-[#1E2A3B] pb-2 text-xs font-mono">
                      <div className="flex items-center gap-2 text-slate-100 font-bold">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span>AI OPERATIONS DECISION-SUPPORT &amp; RISK RADAR</span>
                      </div>
                      <span className="text-[9.5px] px-2 py-0.5 rounded-sm bg-purple-500/10 border border-purple-500/30 text-purple-300">
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

                {/* WORKSPACE 04: IN-SILICO EXPERIMENTATION & SIMULATION WORKSTATION */}
                {activeTab === 'simulator' && (
                  <motion.div
                    key="simulator-workspace"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <SimulatorControls
                      simulatorApiUrl="https://sih.instaroid.page/simulator"
                      latest={latest}
                      onParameterChanged={refetch}
                    />
                  </motion.div>
                )}

                {/* Industrial Control Room Footer */}
                <footer className="border-t border-[#1E2A3B] bg-[#070A0F] px-4 py-2.5 text-center text-[9.5px] text-slate-500 font-mono mt-6">
                  THERMO-LIFT &bull; AI-Powered Well-to-Surface Digital Twin &bull; Baghewala Heavy Oil Pilot, Rajasthan &bull; All Subsurface Models Validated
                </footer>
              </main>
            </div>
          </motion.div>
        )}

        {/* Global Website Footer for Non-Dashboard Pages */}
        {currentSiteView !== 'dashboard' && (
          <footer className="border-t border-[#1E2A3B] bg-[#070A0F]/90 px-6 py-6 text-center text-xs text-slate-400 font-mono space-y-2 mt-auto">
            <div className="flex flex-wrap items-center justify-center gap-6 text-slate-300">
              <button onClick={() => setCurrentSiteView('home')} className="hover:text-cyan-400 transition">
                Home
              </button>
              <button onClick={() => setCurrentSiteView('dashboard')} className="hover:text-cyan-400 transition">
                Live Console
              </button>
              <button onClick={() => setCurrentSiteView('digital-twin')} className="hover:text-cyan-400 transition">
                Digital Twin
              </button>
              <button onClick={() => setCurrentSiteView('optimization')} className="hover:text-cyan-400 transition">
                Optimization
              </button>
              <button onClick={() => setCurrentSiteView('data-quality')} className="hover:text-cyan-400 transition">
                Data Quality
              </button>
              <button onClick={() => setCurrentSiteView('vr-simulator')} className="hover:text-cyan-400 transition">
                VR Simulator
              </button>
              <button onClick={() => setCurrentSiteView('baghewala')} className="hover:text-cyan-400 transition">
                Baghewala Field
              </button>
            </div>
            <p className="text-[10.5px] text-slate-500 pt-2">
              THERMO-LIFT &bull; Integrated Heavy Oil Digital Twin &bull; Cyclic Steam Stimulation &amp; Sucker Rod Pumping &bull; Jodhpur Sandstone, Rajasthan
            </p>
          </footer>
        )}

        {/* Skiper1 Interactive Smooth Scrollbar */}
        <Skiper1 />
      </motion.div>
    </div>
  );
}
