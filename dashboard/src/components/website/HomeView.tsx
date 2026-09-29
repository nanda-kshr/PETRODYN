'use client';

import React, { useRef, useState } from 'react';
import {
  Flame,
  LayoutGrid,
  Cpu,
  Sliders,
  ShieldCheck,
  Glasses,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ArrowRight,
  TrendingDown,
  Activity,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { SiteNavId } from '@/components/SiteNavbar';

interface HomeViewProps {
  onNavigate: (view: SiteNavId) => void;
  onOpenCinematicModal?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenCinematicModal,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const restartVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  return (
    <div className="space-y-12 pb-16 max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      {/* HERO SECTION */}
      <section className="relative rounded-xl border border-[#1E2A3B] bg-gradient-to-b from-[#0B1017]/80 via-[#070A0F]/90 to-[#05030e] p-6 lg:p-10 overflow-hidden shadow-2xl">
        {/* Subtle decorative grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text / Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>BAGHEWALA FIELD &bull; JODHPUR SANDSTONE, RAJASTHAN</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-mono leading-tight">
                THERMO-LIFT
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300 text-2xl sm:text-3xl lg:text-4xl pt-1">
                  AI-Enabled Well-to-Surface Digital Twin
                </span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                An integrated physics-informed digital twin and multi-objective optimization platform
                engineered specifically for heavy oil Cyclic Steam Stimulation (CSS) and Sucker Rod Pumping (SRP).
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2 px-5 py-3 rounded-md bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-mono font-bold text-xs tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.35)] active:scale-95 cursor-pointer"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>LAUNCH LIVE DASHBOARD</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('digital-twin')}
                className="flex items-center gap-2 px-4 py-3 rounded-md bg-[#0F1622] hover:bg-[#152030] text-slate-200 border border-[#1E2A3B] hover:border-cyan-500/40 font-mono text-xs transition cursor-pointer"
              >
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Coupled Twin Models</span>
              </button>

              {onOpenCinematicModal && (
                <button
                  type="button"
                  onClick={onOpenCinematicModal}
                  className="flex items-center gap-2 px-4 py-3 rounded-md bg-[#070A0F] hover:bg-[#0F1622] text-slate-400 hover:text-slate-200 border border-[#1E2A3B] font-mono text-xs transition cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cinematic Intro</span>
                </button>
              )}
            </div>

            {/* Quick telemetry badges */}
            <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-[#1E2A3B]/60 text-xs font-mono">
              <div className="bg-[#070A0F]/80 p-2.5 rounded border border-[#1E2A3B]">
                <span className="text-[10px] text-slate-400 block">DEPTH</span>
                <span className="text-slate-100 font-bold">1,150 m</span>
              </div>
              <div className="bg-[#070A0F]/80 p-2.5 rounded border border-[#1E2A3B]">
                <span className="text-[10px] text-slate-400 block">VISCOSITY (50°C)</span>
                <span className="text-amber-400 font-bold">10k-13k cP</span>
              </div>
              <div className="bg-[#070A0F]/80 p-2.5 rounded border border-[#1E2A3B]">
                <span className="text-[10px] text-slate-400 block">FIELD ASSETS</span>
                <span className="text-cyan-400 font-bold">56 / 34 Wells</span>
              </div>
            </div>
          </div>

          {/* Right Video / Kinematic Animation Showcase */}
          <div className="lg:col-span-6">
            <div className="relative rounded-xl border border-[#1E2A3B] bg-[#000000] overflow-hidden shadow-2xl group">
              {/* Top video status bar */}
              <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-3 py-2 bg-gradient-to-b from-[#070A0F]/90 to-transparent text-[10px] font-mono">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>SRP SURFACE DYNAMICS // KINEMATIC CYCLE</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  WELL BW-001
                </span>
              </div>

              {/* Video Element */}
              <div className="relative aspect-video w-full flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  src="/oil_pumpjack_intro.mp4"
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Subtle vignette gradient */}
                <div className="absolute inset-0 bg-radial-[circle_at_center,_transparent_50%,_rgba(5,3,14,0.4)_100%] pointer-events-none" />
              </div>

              {/* Bottom Video Controls Overlay */}
              <div className="absolute bottom-0 inset-x-0 z-20 flex items-center justify-between px-3 py-2 bg-gradient-to-t from-[#070A0F]/95 via-[#070A0F]/70 to-transparent">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
                    className="p-1.5 rounded bg-[#0F1622]/80 hover:bg-[#1E2A3B] text-slate-200 border border-[#1E2A3B] transition cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                  <button
                    type="button"
                    onClick={restartVideo}
                    aria-label="Restart animation"
                    className="p-1.5 rounded bg-[#0F1622]/80 hover:bg-[#1E2A3B] text-slate-200 border border-[#1E2A3B] transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
                    className="p-1.5 rounded bg-[#0F1622]/80 hover:bg-[#1E2A3B] text-slate-200 border border-[#1E2A3B] transition cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <span className="hidden sm:inline">CYCLE: RECIPROCATING</span>
                  <span className="px-2 py-0.5 rounded bg-[#0F1622] border border-[#1E2A3B] text-slate-300">
                    5.5 SPM
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM CONTEXT & THE BAGHEWALA CHALLENGE */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#1E2A3B] pb-3">
          <div>
            <span className="text-cyan-400 text-xs font-mono tracking-wider uppercase">Field Engineering Context</span>
            <h2 className="text-xl sm:text-2xl font-bold font-mono text-white">The Baghewala Field Heavy Oil Problem</h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('baghewala')}
            className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition"
          >
            <span>Full Field Profile</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-3">
            <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <TrendingDown className="w-4 h-4" />
            </div>
            <h3 className="font-mono text-sm font-bold text-slate-100">Rapid Thermal Viscosity Spikes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Superheated steam (250–320°C) is injected during CSS. As the well cools from 180°C to 50°C, viscosity explodes from 150 cP to over 12,000 cP, inducing severe flow impedance.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-3">
            <div className="w-8 h-8 rounded bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="font-mono text-sm font-bold text-slate-100">Rod-Floating & Impact Loading</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extreme viscous drag exceeds the gravitational falling speed of the rod string. Downward motion stalls, causing cable slack, violent bridle rebound, and fatigue failures.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-[#070A0F]/80 border border-[#1E2A3B] space-y-3">
            <div className="w-8 h-8 rounded bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-mono text-sm font-bold text-slate-100">Disconnected Operations</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              CSS steam injection and SRP artificial lift historically operate as isolated systems. THERMO-LIFT bridges subsurface heat decay with surface pump drive automation.
            </p>
          </div>
        </div>
      </section>

      {/* SYSTEM ARCHITECTURE PIPELINE */}
      <section className="space-y-6">
        <div className="border-b border-[#1E2A3B] pb-3">
          <span className="text-cyan-400 text-xs font-mono tracking-wider uppercase">Unified System Architecture</span>
          <h2 className="text-xl sm:text-2xl font-bold font-mono text-white">4 Core Engineering Pillars</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pillar 1 */}
          <div
            onClick={() => onNavigate('data-quality')}
            className="group p-5 rounded-lg bg-[#070A0F]/80 hover:bg-[#0B1017] border border-[#1E2A3B] hover:border-cyan-500/40 transition cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  PILLAR 01
                </span>
                <ShieldCheck className="w-4 h-4 text-sky-400" />
              </div>
              <h3 className="font-mono text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition">
                Data Quality Engine
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ingests 15 live transducer streams. Performs automatic outlier rejection, flatline detection, and sensor drift compensation.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs font-mono text-cyan-400">
              <span>View Data Engine</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Pillar 2 */}
          <div
            onClick={() => onNavigate('digital-twin')}
            className="group p-5 rounded-lg bg-[#070A0F]/80 hover:bg-[#0B1017] border border-[#1E2A3B] hover:border-cyan-500/40 transition cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  PILLAR 02
                </span>
                <Cpu className="w-4 h-4 text-cyan-400" />
              </div>
              <h3 className="font-mono text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition">
                Coupled Digital Twin
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Simulates subsurface thermal cooling cycles, in-situ viscosity decay, wave-equation rod load, and 0–100 Well Health Score.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs font-mono text-cyan-400">
              <span>Explore Twin Core</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Pillar 3 */}
          <div
            onClick={() => onNavigate('optimization')}
            className="group p-5 rounded-lg bg-[#070A0F]/80 hover:bg-[#0B1017] border border-[#1E2A3B] hover:border-cyan-500/40 transition cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  PILLAR 03
                </span>
                <Sliders className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="font-mono text-sm font-bold text-slate-100 group-hover:text-amber-300 transition">
                Multi-Objective Optimization
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Optimizes CSS steam parameters alongside SRP speed (SPM, VFD Hz). Balances net oil production against SOR and power costs.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs font-mono text-amber-400">
              <span>Review Optimization</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Pillar 4 */}
          <div
            onClick={() => onNavigate('vr-simulator')}
            className="group p-5 rounded-lg bg-[#070A0F]/80 hover:bg-[#0B1017] border border-[#1E2A3B] hover:border-cyan-500/40 transition cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  PILLAR 04
                </span>
                <Glasses className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="font-mono text-sm font-bold text-slate-100 group-hover:text-purple-300 transition">
                VR Training Simulator
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Interactive 3D what-if scenario testing and emergency response drill sandbox for field operators and reservoir engineers.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs font-mono text-purple-400">
              <span>Enter VR Sandbox</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </section>

      {/* QUICK LAUNCH BANNER */}
      <section className="p-6 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-[#070A0F] to-sky-950/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-mono font-bold text-base text-white flex items-center gap-2 justify-center sm:justify-start">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Operational Console Ready</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Connected to 10Hz SCADA stream on Baghewala Well BW-001. PINN models synchronized.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 px-6 py-2.5 rounded bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono font-bold text-xs tracking-wider transition active:scale-95 shadow-lg shadow-cyan-500/20 shrink-0 cursor-pointer"
        >
          <span>OPEN DASHBOARD</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};

export default HomeView;
