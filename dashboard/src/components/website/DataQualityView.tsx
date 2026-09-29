'use client';

import React from 'react';
import {
  ShieldCheck,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Radio,
  Sliders,
  Filter,
} from 'lucide-react';
import { SiteNavId } from '@/components/SiteNavbar';

interface DataQualityViewProps {
  onNavigate: (view: SiteNavId) => void;
}

export const DataQualityView: React.FC<DataQualityViewProps> = ({ onNavigate }) => {
  const sensorStreams = [
    { id: 'S-01', name: 'Steam Injection Volume', unit: 'm³', rate: '1 Hz', status: 'VALIDATED', bounds: '0 – 12,000 m³' },
    { id: 'S-02', name: 'Injection Pressure', unit: 'MPa', rate: '10 Hz', status: 'VALIDATED', bounds: '0 – 25 MPa' },
    { id: 'S-03', name: 'Injection Temperature', unit: '°C', rate: '1 Hz', status: 'VALIDATED', bounds: '20 – 350°C' },
    { id: 'S-04', name: 'Wellhead Tubing Pressure', unit: 'bar', rate: '10 Hz', status: 'VALIDATED', bounds: '0 – 80 bar' },
    { id: 'S-05', name: 'Wellhead Casing Pressure', unit: 'bar', rate: '10 Hz', status: 'VALIDATED', bounds: '0 – 60 bar' },
    { id: 'S-06', name: 'Gross Liquid Rate', unit: 'BFPD', rate: '1 Hz', status: 'VALIDATED', bounds: '0 – 400 BFPD' },
    { id: 'S-07', name: 'Net Oil Production', unit: 'BOPD', rate: '1 Hz', status: 'VALIDATED', bounds: '0 – 250 BOPD' },
    { id: 'S-08', name: 'Pumping Speed (SPM)', unit: 'SPM', rate: '10 Hz', status: 'VALIDATED', bounds: '0.5 – 12 SPM' },
    { id: 'S-09', name: 'Stroke Length Transducer', unit: 'in', rate: '10 Hz', status: 'VALIDATED', bounds: '50 – 160 in' },
    { id: 'S-10', name: 'Polished Rod Load Cell', unit: 'kN', rate: '50 Hz', status: 'VALIDATED', bounds: '0 – 140 kN' },
    { id: 'S-11', name: 'VFD Output Frequency', unit: 'Hz', rate: '10 Hz', status: 'VALIDATED', bounds: '10 – 60 Hz' },
    { id: 'S-12', name: 'Motor Active Power', unit: 'kW', rate: '10 Hz', status: 'VALIDATED', bounds: '0 – 75 kW' },
    { id: 'S-13', name: 'Acoustic Fluid Level (Echometer)', unit: 'm', rate: '0.1 Hz', status: 'VALIDATED', bounds: '200 – 1,150 m' },
    { id: 'S-14', name: 'Bottomhole Temp (BHT)', unit: '°C', rate: '1 Hz', status: 'VALIDATED', bounds: '40 – 320°C' },
    { id: 'S-15', name: 'Bottomhole Pressure (BHP)', unit: 'MPa', rate: '1 Hz', status: 'VALIDATED', bounds: '2 – 15 MPa' },
  ];

  return (
    <div className="space-y-10 pb-16 max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 font-mono">
      {/* HEADER BANNER */}
      <div className="border-b border-[#1E2A3B] pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Real-Time Sensor Validation &amp; Ingestion Layer</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Robust Data Quality Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-3xl leading-relaxed">
          Protects physics-informed neural network (PINN) and mechanical surrogate models from corrupt, noisy, or drifted
          sensor telemetry through continuous statistical validation and physical boundary verification.
        </p>
      </div>

      {/* 4 ANOMALY DETECTION FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-2">
          <span className="text-[10px] text-sky-400 uppercase font-bold">Filter 01</span>
          <h3 className="text-sm font-bold text-slate-100">Outlier &amp; Spike Clipping</h3>
          <p className="text-xs text-slate-400 font-sans">
            Suppresses transient inductive voltage spikes on rod load cells and pressure transducers using 3-sigma Hampel filters.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-2">
          <span className="text-[10px] text-cyan-400 uppercase font-bold">Filter 02</span>
          <h3 className="text-sm font-bold text-slate-100">Flatline Detection</h3>
          <p className="text-xs text-slate-400 font-sans">
            Detects frozen signals and unseated sensor connections when variance drops below epsilon across a 60-second sliding window.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-2">
          <span className="text-[10px] text-amber-400 uppercase font-bold">Filter 03</span>
          <h3 className="text-sm font-bold text-slate-100">Calibration Drift Rejection</h3>
          <p className="text-xs text-slate-400 font-sans">
            Identifies zero-offset drift on load cells by checking minimum load baseline consistency during the neutral stroke transition.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-2">
          <span className="text-[10px] text-purple-400 uppercase font-bold">Filter 04</span>
          <h3 className="text-sm font-bold text-slate-100">Kalman State Fusion</h3>
          <p className="text-xs text-slate-400 font-sans">
            Combines acoustic echometer fluid level with casing pressure and motor power to estimate true downhole pump submergence.
          </p>
        </div>
      </div>

      {/* 15 ACTIVE TRANSDUCERS MATRIX */}
      <section className="p-6 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              15 SCADA Ingestion Streams (Transducer Health Matrix)
            </h3>
          </div>
          <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30">
            ALL 15 SENSORS CALIBRATED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sensorStreams.map((s) => (
            <div key={s.id} className="p-3 rounded bg-[#0B1017] border border-[#1E2A3B] space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold">{s.id}</span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{s.status}</span>
                </span>
              </div>
              <div className="text-slate-100 font-medium">{s.name}</div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-[#1E2A3B]/60">
                <span>Rate: <strong className="text-slate-200">{s.rate}</strong></span>
                <span>Bounds: <strong className="text-cyan-300">{s.bounds}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 px-5 py-2.5 rounded bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-mono text-xs transition cursor-pointer"
        >
          <span>View Telemetry Streams on Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DataQualityView;
