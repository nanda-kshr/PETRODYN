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
import { SimulatorControls } from '@/components/SimulatorControls';

export default function DashboardPage() {
  const [wellId] = useState('BW-001');

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
        {/* Row 1: Health Score & Surface Dynamometer Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HealthScoreGauge healthScore={healthScore} />
          <DynamometerCard analytics={analytics} latest={latest} />
        </div>

        {/* Row 2: Live Mechanical, Electrical & Production Graphs */}
        <TelemetryGraphs history={history} />

        {/* Row 3: Predictive Mechanical Risk Guard */}
        <PredictiveRiskPanel predictions={predictions} />

        {/* Row 4: Thermal Decay, Viscosity Dynamics & 30-Day Production Forecasts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ThermalViscosityCard
            analytics={analytics}
            predictions={predictions}
            latest={latest}
          />
          <ProductionForecastPanel predictions={predictions} />
        </div>

        {/* Row 5: Simulator Runtime Controls */}
        <SimulatorControls
          simulatorApiUrl={process.env.NEXT_PUBLIC_SIMULATOR_API_URL}
          onParameterChanged={refetch}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-3 text-center text-xs text-slate-500">
        THERMO-LIFT Prototype &bull; Real-time SRP & CSS Well Digital Twin &bull; Baghewala Field Heavy Oil Pilot
      </footer>
    </div>
  );
}
