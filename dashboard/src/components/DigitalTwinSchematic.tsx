'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Flame,
  Droplets,
  Layers,
  Zap,
  Gauge,
  Thermometer,
  Cpu,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react';
import { TelemetryRecord, AnalyticsData, PredictionsData } from '@/types/telemetry';

interface DigitalTwinSchematicProps {
  latest: TelemetryRecord | null;
  analytics?: AnalyticsData | null;
  predictions?: PredictionsData | null;
}

export const DigitalTwinSchematic: React.FC<DigitalTwinSchematicProps> = React.memo(({
  latest,
  analytics,
  predictions,
}) => {
  const [viewMode, setViewMode] = useState<'realistic' | 'blueprint'>('realistic');
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Live telemetry parameters (with fallback defaults)
  const spm = latest?.spm ?? 5.5;
  const isRunning = latest ? (latest.spm > 0.05 && latest.pump_running !== false) : true;
  const strokeLength = latest?.stroke_length_m ?? 2.5;
  const rodLoad = latest?.rod_load_kn ?? 68.4;
  const tempC = latest?.temperature_c ?? 78.5;
  const viscCp = latest?.viscosity_cp ?? 10240;
  const fluidLevel = latest?.fluid_level_m ?? 340;
  const bopd = latest?.production_bopd ?? 48.2;
  const tubingPressure = latest?.tubing_pressure_bar ?? 18.5;
  const stage = latest?.operating_stage ?? 'PRODUCTION';
  const vfdHz = latest?.vfd_frequency_hz ?? 42.0;

  // DOM Refs for Mathematically Locked 4-Bar Kinematics
  const crankGroupRef = useRef<SVGGElement | null>(null);
  const beamGroupRef = useRef<SVGGElement | null>(null);
  const pitmanBackLineRef = useRef<SVGLineElement | null>(null);
  const pitmanFrontLineRef = useRef<SVGLineElement | null>(null);
  const pitmanFrontHighlightRef = useRef<SVGLineElement | null>(null);
  const equalizerBracketRef = useRef<SVGGElement | null>(null);
  const crankPinBracketRef = useRef<SVGGElement | null>(null);
  const bridleCableLeftRef = useRef<SVGLineElement | null>(null);
  const bridleCableRightRef = useRef<SVGLineElement | null>(null);
  const carrierBarRef = useRef<SVGGElement | null>(null);
  const polishedRodRef = useRef<SVGRectElement | null>(null);
  const stopCollarRef = useRef<SVGRectElement | null>(null);
  const fluidFlowLineRef = useRef<SVGLineElement | null>(null);
  const downholePlungerRef = useRef<SVGGElement | null>(null);
  const downholeValveRef = useRef<SVGCircleElement | null>(null);
  const beamAngleTextRef = useRef<HTMLSpanElement | null>(null);
  const strokeCountRef = useRef<HTMLSpanElement | null>(null);

  // Animation state refs (prevents loop reset on telemetry state changes)
  const isRunningRef = useRef(isRunning);
  const spmRef = useRef(spm);
  isRunningRef.current = isRunning;
  spmRef.current = spm;

  // Exact API Class C Pumpjack 4-Bar Linkage Geometry (SVG viewBox 0 0 1000 620)
  // 1. Fulcrum Ob (Center saddle bearing on top of Samson Post): (550, 198)
  // 2. Crankshaft Center Oc (Gearbox output axis): (315, 425)
  // 3. Crank Radius R: 60 px
  // 4. Rear Walking Beam Arm L1 (Fulcrum to Equalizer Bearing): 215 px
  // 5. Front Walking Beam Arm L2 (Fulcrum to Horsehead Plumb Line X=804): 254 px
  // 6. Pitman Arm Physical Length Lp: 230 px (Strictly rigid connecting rod)
  const Ob = { x: 550, y: 198 };
  const Oc = { x: 315, y: 425 };
  const R = 60;
  const L1 = 215;
  const L2 = 254;
  const Lp = 230;

  useEffect(() => {
    let crankAngle = 0;
    let lastTime: number | null = null;
    let frameId: number;
    let totalStrokes = 0;
    let lastAngle = crankAngle;
    let fluidOffset = 0;

    // Closed-Form Analytical 4-Bar Linkage Solver
    const solveKinematics = (theta: number) => {
      // 1. Crank Pin coordinates Pc
      const Pcx = Oc.x + R * Math.cos(theta);
      const Pcy = Oc.y + R * Math.sin(theta);

      // 2. Vector from Crank Pin to Fulcrum
      const Dx = Ob.x - Pcx;
      const Dy = Ob.y - Pcy;
      const M = Math.hypot(Dx, Dy);

      // 3. Law of Cosines for closed 4-bar loop
      const K = (Dx * Dx + Dy * Dy + L1 * L1 - Lp * Lp) / (2 * L1);
      const gamma = Math.atan2(Dy, Dx);
      const cosVal = Math.max(-1, Math.min(1, K / M));

      // Physical Grashof rocker branch (keeps beam rocking naturally around 0 rad)
      const phi = gamma + Math.acos(cosVal);

      // 4. Equalizer Bearing coordinates Pe
      const Pex = Ob.x - L1 * Math.cos(phi);
      const Pey = Ob.y - L1 * Math.sin(phi);

      // 5. Pitman rod orientation angle
      const pitmanAngle = Math.atan2(Pey - Pcy, Pex - Pcx);

      return { Pcx, Pcy, Pex, Pey, phi, pitmanAngle };
    };

    const renderLoop = (time: number) => {
      if (lastTime !== null) {
        const delta = Math.min((time - lastTime) / 1000, 0.1); // Clamp delta to avoid large jump
        const curRunning = isRunningRef.current;
        const curSpm = spmRef.current;
        const effectiveSpm = curRunning ? Math.max(0.1, curSpm) : 0;
        // Angular speed: (SPM * 2 * PI) / 60 radians/sec
        const omega = (effectiveSpm * 2 * Math.PI) / 60;

        if (curRunning && effectiveSpm > 0) {
          crankAngle += omega * delta;
          if (crankAngle > Math.PI * 2) {
            crankAngle -= Math.PI * 2;
          }

          // Count pump strokes (trigger on top dead center transition)
          if (lastAngle < Math.PI * 1.5 && crankAngle >= Math.PI * 1.5) {
            totalStrokes++;
            if (strokeCountRef.current) {
              strokeCountRef.current.textContent = `${totalStrokes}`;
            }
          }
          lastAngle = crankAngle;

          // Flow line dash offset
          fluidOffset = (fluidOffset - delta * 28 * (effectiveSpm / 5.5)) % 20;
          if (fluidFlowLineRef.current) {
            fluidFlowLineRef.current.style.strokeDashoffset = `${fluidOffset}`;
          }
        }

        // Solve exact 4-bar kinematics
        const { Pcx, Pcy, Pex, Pey, phi, pitmanAngle } = solveKinematics(crankAngle);

        // 1. Rotate Crank & Heavy Counterweights around Oc (315, 425)
        const crankDeg = (crankAngle * 180) / Math.PI;
        if (crankGroupRef.current) {
          crankGroupRef.current.setAttribute('transform', `rotate(${crankDeg}, ${Oc.x}, ${Oc.y})`);
        }

        // 2. Rock Walking Beam & Horsehead around Fulcrum Ob (550, 198)
        const beamDeg = (phi * 180) / Math.PI;
        if (beamGroupRef.current) {
          beamGroupRef.current.setAttribute('transform', `rotate(${beamDeg}, ${Ob.x}, ${Ob.y})`);
        }

        // 3. Connect Pitman Struts rigidly between Pc and Pe
        if (pitmanBackLineRef.current) {
          pitmanBackLineRef.current.setAttribute('x1', `${Pex - 4}`);
          pitmanBackLineRef.current.setAttribute('y1', `${Pey}`);
          pitmanBackLineRef.current.setAttribute('x2', `${Pcx - 4}`);
          pitmanBackLineRef.current.setAttribute('y2', `${Pcy}`);
        }
        if (pitmanFrontLineRef.current) {
          pitmanFrontLineRef.current.setAttribute('x1', `${Pex + 7}`);
          pitmanFrontLineRef.current.setAttribute('y1', `${Pey}`);
          pitmanFrontLineRef.current.setAttribute('x2', `${Pcx + 7}`);
          pitmanFrontLineRef.current.setAttribute('y2', `${Pcy}`);
        }
        if (pitmanFrontHighlightRef.current) {
          pitmanFrontHighlightRef.current.setAttribute('x1', `${Pex + 7}`);
          pitmanFrontHighlightRef.current.setAttribute('y1', `${Pey}`);
          pitmanFrontHighlightRef.current.setAttribute('x2', `${Pcx + 7}`);
          pitmanFrontHighlightRef.current.setAttribute('y2', `${Pcy}`);
        }

        // Equalizer & Crank Pin Brackets
        const pitmanDeg = (pitmanAngle * 180) / Math.PI;
        if (equalizerBracketRef.current) {
          equalizerBracketRef.current.setAttribute('transform', `translate(${Pex}, ${Pey}) rotate(${pitmanDeg + 90})`);
        }
        if (crankPinBracketRef.current) {
          crankPinBracketRef.current.setAttribute('transform', `translate(${Pcx}, ${Pcy}) rotate(${pitmanDeg + 90})`);
        }

        // 4. Exact Vertical Plumb Stroke for Carrier Bar, Polished Rod & Bridle
        // When horsehead rocks UP (phi < 0), rod moves UP (Y decreases).
        // When horsehead rocks DOWN (phi > 0), rod moves DOWN (Y increases).
        const verticalDelta = L2 * Math.sin(phi);
        const carrierY = 405 + verticalDelta;

        if (carrierBarRef.current) {
          carrierBarRef.current.setAttribute('transform', `translate(0, ${verticalDelta})`);
        }
        if (polishedRodRef.current) {
          polishedRodRef.current.setAttribute('transform', `translate(0, ${verticalDelta})`);
        }
        if (stopCollarRef.current) {
          stopCollarRef.current.setAttribute('transform', `translate(0, ${verticalDelta})`);
        }

        // Bottom-most tip of the horsehead in global coordinates (local socket at 804, 330)
        const hx_bot = Ob.x + (804 - Ob.x) * Math.cos(phi) - (330 - Ob.y) * Math.sin(phi);
        const hy_bot = Ob.y + (804 - Ob.x) * Math.sin(phi) + (330 - Ob.y) * Math.cos(phi);

        // Twin Bridle Cables emerge directly from the bottom-most socket of the horsehead down to carrier bar
        if (bridleCableLeftRef.current) {
          bridleCableLeftRef.current.setAttribute('x1', `${(hx_bot - 4).toFixed(1)}`);
          bridleCableLeftRef.current.setAttribute('y1', `${hy_bot.toFixed(1)}`);
          bridleCableLeftRef.current.setAttribute('x2', '799');
          bridleCableLeftRef.current.setAttribute('y2', `${(carrierY + 4).toFixed(1)}`);
        }
        if (bridleCableRightRef.current) {
          bridleCableRightRef.current.setAttribute('x1', `${(hx_bot + 4).toFixed(1)}`);
          bridleCableRightRef.current.setAttribute('y1', `${hy_bot.toFixed(1)}`);
          bridleCableRightRef.current.setAttribute('x2', '809');
          bridleCableRightRef.current.setAttribute('y2', `${(carrierY + 4).toFixed(1)}`);
        }

        // Downhole Plunger moves inside wellbore casing in exact sync with polished rod
        if (downholePlungerRef.current) {
          downholePlungerRef.current.setAttribute('transform', `translate(0, ${verticalDelta * 0.75})`);
        }

        // Traveling valve indicator (Green on UPSTROKE when rod goes UP, Amber on DOWNSTROKE when rod goes DOWN)
        const isUpstroke = phi < 0;
        if (downholeValveRef.current) {
          downholeValveRef.current.setAttribute('fill', isUpstroke ? '#10B981' : '#F59E0B');
        }

        // Update HUD Beam Angle readout
        if (beamAngleTextRef.current) {
          beamAngleTextRef.current.textContent = `${beamDeg.toFixed(1)}°`;
        }
      }
      lastTime = time;
      frameId = requestAnimationFrame(renderLoop);
    };

    frameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const getTempColor = (t: number) => {
    if (t >= 90) return '#FF1744';
    if (t >= 70) return '#FF6B00';
    if (t >= 55) return '#F59E0B';
    return '#00F0FF';
  };

  return (
    <div className={`scada-panel rounded-sm p-3.5 flex flex-col justify-between transition-all duration-300 ${isExpanded ? 'min-h-[640px]' : 'min-h-[480px]'}`}>
      {/* Precision Blueprint Grid Backdrop */}
      <div className="absolute inset-0 bg-reticle-grid opacity-25 pointer-events-none" />
      <div className="absolute inset-0 scanline-overlay opacity-25 pointer-events-none" />

      {/* Top Header & Layer Filter Controls */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-[#1E2A3B]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-6 h-6 rounded-sm bg-[#0F1622] border border-[#1E2A3B] text-cyan-400 shrink-0">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-mono font-bold tracking-wider text-slate-100 uppercase">
                WELL-TO-SURFACE DIGITAL TWIN SCHEMATIC
              </h2>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-sm bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
                1,150M DEPTH // JODHPUR SANDSTONE
              </span>
            </div>
            <p className="text-[9.5px] font-mono text-slate-400">
              API CLASS C 4-BAR KINEMATICS &bull; SAMSON DERRICK &bull; DOWNHOLE LIFT &bull; CSS THERMAL DISPERSION
            </p>
          </div>
        </div>

        {/* View Mode & HUD Controls */}
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <button
            type="button"
            onClick={() => setShowAnnotations(!showAnnotations)}
            className={`px-2 py-1 rounded-sm transition flex items-center gap-1.5 border ${
              showAnnotations
                ? 'bg-[#0F1622] text-slate-200 border-[#2A3B52]'
                : 'bg-[#070A0F] text-slate-500 border-[#15202E]'
            }`}
          >
            {showAnnotations ? <Eye className="w-3 h-3 text-cyan-400" /> : <EyeOff className="w-3 h-3" />}
            <span>HUD LABELS</span>
          </button>

          <div className="flex items-center gap-0.5 bg-[#070A0F] p-0.5 rounded-sm border border-[#1E2A3B]">
            <button
              type="button"
              onClick={() => setViewMode('realistic')}
              className={`px-2 py-0.5 rounded-sm font-bold transition flex items-center gap-1 ${
                viewMode === 'realistic'
                  ? 'bg-[#141E2E] text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>DIGITAL TWIN</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('blueprint')}
              className={`px-2 py-0.5 rounded-sm font-bold transition flex items-center gap-1 ${
                viewMode === 'blueprint'
                  ? 'bg-[#141E2E] text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>VECTOR SCADA</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label="Toggle Expand"
            className="p-1 rounded-sm bg-[#0F1622] hover:bg-[#141E2E] border border-[#1E2A3B] text-slate-400 hover:text-slate-200 transition"
          >
            {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Main Digital Twin Visual Canvas */}
      <div className="relative z-10 w-full flex-1 my-2 bg-[#06090E] border border-[#1E2A3B] rounded-sm overflow-hidden flex items-center justify-center min-h-[400px]">
        <div className="relative w-full h-full flex items-center justify-center p-2 select-none overflow-hidden">
          <svg
            viewBox="0 0 1000 620"
            className="w-full h-full max-h-[540px] select-none"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Steel Materials & Industrial Gradients */}
              <linearGradient id="beamSteelGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3C4654" />
                <stop offset="25%" stopColor="#2C3440" />
                <stop offset="85%" stopColor="#191E25" />
                <stop offset="100%" stopColor="#111418" />
              </linearGradient>

              <linearGradient id="charcoalSteelGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#333C48" />
                <stop offset="50%" stopColor="#232932" />
                <stop offset="100%" stopColor="#14181D" />
              </linearGradient>

              {/* Safety Yellow / Amber Equipment Coatings */}
              <linearGradient id="safetyYellowGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>

              <linearGradient id="yellowBevelGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#92400E" />
              </linearGradient>

              {/* Stainless Chrome Polished Rod */}
              <linearGradient id="chromeRodGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#94A3B8" />
                <stop offset="35%" stopColor="#FFFFFF" />
                <stop offset="70%" stopColor="#CBD5E1" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>

              {/* Pitman Arm Cylindrical Shading */}
              <linearGradient id="pitmanGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="40%" stopColor="#475569" />
                <stop offset="70%" stopColor="#334155" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>

              {/* Foundation Concrete Pad */}
              <linearGradient id="concretePadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="30%" stopColor="#1E293B" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>

              {/* Geological Soil Strata */}
              <linearGradient id="soilStrataGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1B222D" />
                <stop offset="35%" stopColor="#11161F" />
                <stop offset="100%" stopColor="#06090E" />
              </linearGradient>

              {/* Thermal CSS Vapor Cloud */}
              <radialGradient id="thermalBubbleGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF1744" stopOpacity="0.85" />
                <stop offset="45%" stopColor="#FF6B00" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
              </radialGradient>

              {/* Drop Shadows */}
              <filter id="machineryShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.5" />
              </filter>
            </defs>

            {/* =========================================================
                1. SUBTERRANEAN STRATA & 1,150M WELLBORE HORIZONS
                ========================================================= */}
            <g id="ground-strata">
              <rect x="0" y="525" width="1000" height="95" fill="url(#soilStrataGrad)" />
              <line x1="0" y1="525" x2="1000" y2="525" stroke="#1E2A3B" strokeWidth="1.5" />
              <line x1="0" y1="565" x2="1000" y2="565" stroke="#1E2A3B" strokeWidth="1" strokeDasharray="6 6" />

              {/* CSS Thermal Steam Plume at 1,150M Sandstone Perforations */}
              <ellipse cx="804" cy="595" rx="130" ry="24" fill="url(#thermalBubbleGrad)" />

              {/* Geological Horizons Text Labels */}
              <text x="25" y="542" fill="#64748B" fontSize="9" fontFamily="monospace" fontWeight="bold">
                SURFACE ELEVATION (0M) // THAR ALLUVIUM
              </text>
              <text x="25" y="582" fill="#475569" fontSize="8.5" fontFamily="monospace">
                BILARA DOLOMITE CAP (450M DEPTH)
              </text>
              <text x="25" y="612" fill="#F59E0B" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                RESERVOIR PAYZONE (1,150M JODHPUR SANDSTONE // CSS STEAM CHAMBER)
              </text>
            </g>

            {/* =========================================================
                2. CONCRETE FOUNDATION SLAB & STRUCTURAL STEEL SKID
                ========================================================= */}
            <g id="concrete-pad">
              <polygon points="90,526 690,526 680,510 100,510" fill="#1E2A3B" opacity="0.6" />
              <rect x="90" y="510" width="590" height="18" rx="2" fill="url(#concretePadGrad)" />
              <rect x="90" y="510" width="590" height="2" fill="#475569" />
              <rect x="110" y="492" width="550" height="18" rx="2" fill="url(#charcoalSteelGrad)" stroke="#111827" strokeWidth="1" />
              <g fill="#00F0FF">
                <circle cx="125" cy="501" r="2.5" opacity="0.8" />
                <circle cx="220" cy="501" r="2.5" opacity="0.8" />
                <circle cx="430" cy="501" r="2.5" opacity="0.8" />
                <circle cx="645" cy="501" r="2.5" opacity="0.8" />
              </g>
            </g>

            {/* =========================================================
                3. ELECTRICAL VFD CONTROL CABINET & PRIME MOVER MOTOR
                ========================================================= */}
            <g id="electric-cabinet">
              <rect x="35" y="500" width="50" height="26" rx="2" fill="url(#concretePadGrad)" />
              <rect x="38" y="415" width="44" height="86" rx="2" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
              <rect x="36" y="411" width="48" height="6" rx="1.5" fill="url(#safetyYellowGrad)" stroke="#B45309" strokeWidth="1" />
              <rect x="42" y="423" width="36" height="72" rx="1" fill="#0F1622" />
              <line x1="47" y1="432" x2="73" y2="432" stroke="#1E2A3B" strokeWidth="1.5" />
              <line x1="47" y1="437" x2="73" y2="437" stroke="#1E2A3B" strokeWidth="1.5" />
              <line x1="47" y1="442" x2="73" y2="442" stroke="#1E2A3B" strokeWidth="1.5" />
              <circle cx="45" cy="465" r="2" fill="#00F0FF" />

              {/* High-Torque NEMA D Prime Mover Motor */}
              <rect x="105" y="440" width="70" height="52" rx="8" fill="url(#charcoalSteelGrad)" stroke="#0B0F17" strokeWidth="2" />
              <path d="M120 440 V492 M135 440 V492 M150 440 V492 M165 440 V492" stroke="#1E2A3B" strokeWidth="2" />
            </g>

            {/* =========================================================
                4. SAFETY WALKWAY & HANDRAILS
                ========================================================= */}
            <g id="walkway">
              <rect x="95" y="482" width="415" height="10" rx="1" fill="#0F1622" stroke="#1E2A3B" strokeWidth="1.5" />
              <g stroke="#1E2A3B" strokeWidth="3" strokeLinecap="round">
                <line x1="100" y1="482" x2="100" y2="438" />
                <line x1="215" y1="482" x2="215" y2="438" />
                <line x1="320" y1="482" x2="320" y2="438" />
                <line x1="425" y1="482" x2="425" y2="438" />
                <line x1="505" y1="482" x2="505" y2="438" />
              </g>
              <line x1="98" y1="460" x2="508" y2="460" stroke="#334155" strokeWidth="2" />
              <line x1="96" y1="438" x2="510" y2="438" stroke="url(#safetyYellowGrad)" strokeWidth="4" strokeLinecap="round" />
            </g>

            {/* =========================================================
                5. SAMSON POST DERRICK (A-Frame Structure & Ladder)
                ========================================================= */}
            <g id="samson-derrick">
              {/* Heavy A-Frame Triangular Legs */}
              <g stroke="url(#charcoalSteelGrad)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round">
                <line x1="540" y1="198" x2="445" y2="495" />
                <line x1="560" y1="198" x2="650" y2="495" />
              </g>
              <g stroke="#090D14" strokeWidth="4">
                <line x1="538" y1="198" x2="443" y2="495" />
                <line x1="562" y1="198" x2="652" y2="495" />
              </g>

              {/* Horizontal Cross Girders */}
              <g stroke="url(#charcoalSteelGrad)" strokeWidth="10" strokeLinecap="square">
                <line x1="492" y1="330" x2="600" y2="330" />
                <line x1="462" y1="440" x2="630" y2="440" />
              </g>
              <line x1="492" y1="327" x2="600" y2="327" stroke="#475569" strokeWidth="1.5" />
              <line x1="462" y1="437" x2="630" y2="437" stroke="#475569" strokeWidth="1.5" />

              {/* Center Inspection Climbing Ladder */}
              <line x1="542" y1="210" x2="542" y2="488" stroke="#334155" strokeWidth="2.5" />
              <line x1="558" y1="210" x2="558" y2="488" stroke="#334155" strokeWidth="2.5" />
              <g stroke="#64748B" strokeWidth="2" strokeLinecap="round">
                <line x1="542" y1="230" x2="558" y2="230" /><line x1="542" y1="255" x2="558" y2="255" />
                <line x1="542" y1="280" x2="558" y2="280" /><line x1="542" y1="305" x2="558" y2="305" />
                <line x1="542" y1="350" x2="558" y2="350" /><line x1="542" y1="375" x2="558" y2="375" />
                <line x1="542" y1="400" x2="558" y2="400" /><line x1="542" y1="425" x2="558" y2="425" />
                <line x1="542" y1="460" x2="558" y2="460" /><line x1="542" y1="480" x2="558" y2="480" />
              </g>

              {/* Derrick Base Footing Anchors */}
              <rect x="430" y="482" width="30" height="14" rx="2" fill="#141E2E" stroke="#1E2A3B" strokeWidth="2" />
              <rect x="635" y="482" width="30" height="14" rx="2" fill="#141E2E" stroke="#1E2A3B" strokeWidth="2" />
            </g>

            {/* =========================================================
                6. DOUBLE-REDUCTION GEARBOX & ROTATING CRANK COUNTERWEIGHT
                ========================================================= */}
            <g id="gearbox-assembly">
              <polygon points="230,492 245,385 410,385 430,492" fill="url(#charcoalSteelGrad)" stroke="#090D14" strokeWidth="2.5" />
              <circle cx="315" cy="425" r="56" fill="#0D131C" stroke="#1E2A3B" strokeWidth="8" />
              <circle cx="315" cy="425" r="44" fill="#141E2E" stroke="#090D14" strokeWidth="2" />

              {/* ROTATING CRANK ARM & CAST IRON COUNTERWEIGHT (Oc = 315, 425) */}
              <g ref={crankGroupRef}>
                {/* Crank Hub */}
                <circle cx="315" cy="425" r="22" fill="#242B35" stroke="#090D14" strokeWidth="3" />

                {/* Crank Arm Body pointing to Crank Pin at (375, 425) with throw R = 60 */}
                <path d="M 315 412 L 375 415 L 382 425 L 375 435 L 315 438 Z" fill="#1E242C" stroke="#090D14" strokeWidth="2" />

                {/* Heavy Cast Iron Counterweight (Opposite side from crank pin for gravitational assist) */}
                <path
                  d="M 305 400 
                     C 275 365, 235 375, 220 410 
                     C 205 445, 230 485, 265 490 
                     C 295 495, 310 470, 312 450 Z"
                  fill="url(#safetyYellowGrad)"
                  stroke="#92400E"
                  strokeWidth="2.5"
                  filter="url(#machineryShadow)"
                />

                {/* Counterweight Safety Hazard Stripes & Weight Slices */}
                <path
                  d="M 235 390 L 255 385 M 225 420 L 250 415 M 225 450 L 255 445 M 245 478 L 270 468"
                  stroke="#92400E"
                  strokeWidth="3.5"
                />

                {/* Counterweight Bolt Lugs */}
                <g fill="#1E293B">
                  <circle cx="270" cy="410" r="3.5" />
                  <circle cx="255" cy="435" r="3.5" />
                  <circle cx="280" cy="460" r="3.5" />
                </g>

                {/* Master Crank Pin Bearing at (375, 425) */}
                <circle cx="375" cy="425" r="10" fill="#CBD5E1" stroke="#1E2A3B" strokeWidth="3" />
                <circle cx="375" cy="425" r="4" fill="#090D14" />
              </g>

              {/* Main Shaft Center Grease Cap */}
              <circle cx="315" cy="425" r="12" fill="#475569" stroke="#090D14" strokeWidth="2" />
              <circle cx="315" cy="425" r="4" fill="#F8FAFC" />
            </g>

            {/* =========================================================
                7. TWIN PITMAN CONNECTING RODS & WRIST PIN BRACKETS
                ========================================================= */}
            <g id="pitmanGroup">
              {/* Back Pitman Rod (Depth Shadow) */}
              <line ref={pitmanBackLineRef} x1="335" y1="198" x2="375" y2="425" stroke="#141E2E" strokeWidth="9" strokeLinecap="round" />
              
              {/* Front Pitman Rod (Main Cylindrical Rod) */}
              <line ref={pitmanFrontLineRef} x1="347" y1="198" x2="387" y2="425" stroke="url(#pitmanGrad)" strokeWidth="11" strokeLinecap="round" />
              <line ref={pitmanFrontHighlightRef} x1="347" y1="198" x2="387" y2="425" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />

              {/* Equalizer Cross-Beam Wrist Pin Bracket at Pe */}
              <g ref={equalizerBracketRef}>
                <rect x="-14" y="-8" width="28" height="16" rx="3" fill="#334155" stroke="#090D14" strokeWidth="2" />
                <circle cx="0" cy="0" r="5" fill="#E2E8F0" stroke="#1E2A3B" strokeWidth="2" />
              </g>

              {/* Crank Pin Bracket at Pc */}
              <g ref={crankPinBracketRef}>
                <circle cx="0" cy="0" r="8" fill="#475569" stroke="#090D14" strokeWidth="2" />
                <circle cx="0" cy="0" r="4" fill="#F8FAFC" />
              </g>
            </g>

            {/* =========================================================
                8. WALKING BEAM & SAFETY YELLOW HORSEHEAD (Ob = 550, 198)
                ========================================================= */}
            <g ref={beamGroupRef}>
              {/* Heavy Structural Steel I-Beam */}
              <g id="i-beam">
                <polygon points="335,198 335,178 745,188 745,208" fill="url(#beamSteelGrad)" stroke="#090D14" strokeWidth="2.5" />
                <polygon points="330,178 745,188 745,182 330,172" fill="#3B4452" stroke="#090D14" strokeWidth="1.5" />
                <polygon points="335,198 745,208 745,214 335,204" fill="#14181E" stroke="#090D14" strokeWidth="1.5" />

                {/* Vertical Web Stiffener Plates */}
                <line x1="385" y1="179" x2="385" y2="200" stroke="#090D14" strokeWidth="3" />
                <line x1="400" y1="180" x2="400" y2="201" stroke="#475569" strokeWidth="2" />
                <line x1="475" y1="182" x2="475" y2="203" stroke="#090D14" strokeWidth="3" />
                <line x1="630" y1="185" x2="630" y2="207" stroke="#090D14" strokeWidth="3" />
              </g>

              {/* Saddle Center Fulcrum Bearing Housing at (550, 198) */}
              <rect x="532" y="185" width="36" height="28" rx="4" fill="#1E293B" stroke="#090D14" strokeWidth="2.5" />
              <circle cx="550" cy="198" r="14" fill="#CBD5E1" stroke="#1E2A3B" strokeWidth="4" />
              <circle cx="550" cy="198" r="6" fill="#090D14" />

              {/* ICONIC SAFETY GOLDEN-YELLOW HORSEHEAD */}
              <g id="horsehead" filter="url(#machineryShadow)">
                <path
                  d="M 728 190 
                     C 724 160, 730 100, 755 58 
                     C 765 42, 782 45, 788 65 
                     C 804 118, 818 195, 814 260 
                     C 812 285, 808 310, 804 330 
                     C 790 336, 760 328, 756 295 
                     C 762 258, 762 230, 742 208 Z"
                  fill="url(#safetyYellowGrad)"
                  stroke="#92400E"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />

                <path
                  d="M 755 58 C 765 42, 782 45, 788 65 C 804 118, 818 195, 814 260 C 812 285, 808 310, 804 330 L 798 325 C 804 305, 808 280, 808 258 C 810 195, 796 120, 782 68 Z"
                  fill="url(#yellowBevelGrad)"
                  opacity="0.95"
                />

                {/* 3 Structural Cutouts */}
                <path d="M 764 78 C 770 95, 775 118, 778 135 L 752 135 C 748 118, 745 95, 750 82 Z" fill="#06090E" stroke="#78350F" strokeWidth="2" />
                <path d="M 780 152 C 784 175, 786 200, 788 222 L 758 222 C 758 200, 756 175, 754 152 Z" fill="#06090E" stroke="#78350F" strokeWidth="2" />
                <path d="M 788 238 C 788 260, 785 282, 782 298 L 766 292 C 770 275, 770 255, 768 238 Z" fill="#06090E" stroke="#78350F" strokeWidth="2" />

                {/* Bolting Flange to Beam */}
                <rect x="726" y="185" width="22" height="26" rx="2" fill="#141E2E" stroke="#090D14" strokeWidth="1.5" />
                <circle cx="733" cy="192" r="2.5" fill="#CBD5E1" />
                <circle cx="733" cy="204" r="2.5" fill="#CBD5E1" />

                {/* Cable Guide Track running down the full outer perimeter to the bottom tip */}
                <path d="M 784 62 C 800 115, 814 192, 810 260 C 808 285, 806 310, 804 330" stroke="#334155" strokeWidth="4" fill="none" strokeLinecap="round" />

                {/* Bottom Cable Exit Socket at the lowest tip (804, 330) */}
                <rect x="797" y="325" width="14" height="8" rx="2" fill="#1E293B" stroke="#090D14" strokeWidth="1.5" />
                <circle cx="800" cy="329" r="2" fill="#CBD5E1" />
                <circle cx="808" cy="329" r="2" fill="#CBD5E1" />
              </g>
            </g>

            {/* =========================================================
                9. WIRE BRIDLE & VERTICAL POLISHED ROD (EXACT X = 804)
                ========================================================= */}
            <g id="rodCarrierGroup">
              {/* Twin High-Tensile Steel Wire Rope Bridles (Drop from bottom socket down to carrier bar) */}
              <line ref={bridleCableLeftRef} x1="799" y1="330" x2="799" y2="405" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
              <line ref={bridleCableRightRef} x1="809" y1="330" x2="809" y2="405" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />

              {/* Heavy Carrier Bar */}
              <g ref={carrierBarRef}>
                <rect x="789" y="401" width="30" height="9" rx="2" fill="url(#charcoalSteelGrad)" stroke="#090D14" strokeWidth="1.5" />
                <circle cx="799" cy="405" r="2.5" fill="#CBD5E1" />
                <circle cx="809" cy="405" r="2.5" fill="#CBD5E1" />
              </g>

              {/* Continuous Stainless Steel Polished Rod (Passes through Stuffing Box at Y = 492) */}
              <rect ref={polishedRodRef} x="801" y="410" width="6" height="150" rx="1" fill="url(#chromeRodGrad)" stroke="#334155" strokeWidth="0.75" />

              {/* Polished Rod Brass Stop Collar */}
              <rect ref={stopCollarRef} x="798" y="460" width="12" height="7" rx="1.5" fill="#F59E0B" stroke="#92400E" strokeWidth="1" />
            </g>

            {/* =========================================================
                10. WELLHEAD & PRODUCTION CASING (CENTERED AT X = 804)
                ========================================================= */}
            <g id="wellhead-assembly">
              {/* Stuffing Box Packing Gland */}
              <rect x="796" y="492" width="16" height="14" rx="2" fill="#1E293B" stroke="#090D14" strokeWidth="1.5" />
              
              {/* Christmas Tree Flow Tee & Side Production Outlets */}
              <rect x="764" y="506" width="80" height="10" rx="1" fill="url(#charcoalSteelGrad)" stroke="#090D14" strokeWidth="1.5" />
              <rect x="758" y="503" width="7" height="16" rx="1" fill="#0B0F17" />
              <rect x="843" y="503" width="7" height="16" rx="1" fill="#0B0F17" />

              {/* Master Casing Head & Base Flange */}
              <rect x="792" y="516" width="24" height="20" rx="2" fill="#141E2E" stroke="#090D14" strokeWidth="2" />
              <line x1="788" y1="536" x2="820" y2="536" stroke="#475569" strokeWidth="3" />

              {/* Subsurface Surface Casing String */}
              <rect x="794" y="536" width="20" height="84" fill="#080D14" stroke="#334155" strokeWidth="2" rx="1" />
              
              {/* Production Tubing Inner String */}
              <rect x="799" y="536" width="10" height="84" fill="#0D131C" stroke="#475569" strokeWidth="1" />

              {/* Dynamic Produced Fluid Flow Indicator */}
              <line ref={fluidFlowLineRef} x1="804" y1="536" x2="804" y2="620" stroke="#F59E0B" strokeWidth="3" strokeDasharray="6 8" opacity="0.85" />

              {/* Downhole Reciprocating Pump Plunger & Traveling Valve (1,150M) */}
              <g ref={downholePlungerRef} transform="translate(0, 0)">
                <rect x="797" y="578" width="14" height="20" fill="#B45309" stroke="#F59E0B" strokeWidth="1" rx="1" />
                <circle ref={downholeValveRef} cx="804" cy="588" r="3.5" fill="#10B981" />
              </g>
            </g>
          </svg>

          {/* SCADA HUD Callout Overlays */}
          {showAnnotations && (
            <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between font-mono">
              {/* Top Row Callouts */}
              <div className="flex justify-between items-start">
                {/* Wellhead Transducers */}
                <div className="bg-[#0B1017]/90 backdrop-blur-md px-2.5 py-1.5 rounded-sm border border-[#1E2A3B] shadow-lg">
                  <div className="flex items-center gap-1.5 text-[8px] text-slate-400 font-bold uppercase mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>WELLHEAD TRANSDUCERS</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-emerald-400">{bopd.toFixed(1)} BOPD</span>
                    <span className="text-xs font-bold text-cyan-400">{tubingPressure.toFixed(1)} bar</span>
                  </div>
                </div>

                {/* Surface SRP Kinematics */}
                <div className="bg-[#0B1017]/90 backdrop-blur-md px-2.5 py-1.5 rounded-sm border border-[#1E2A3B] shadow-lg text-right">
                  <div className="flex items-center justify-end gap-1.5 text-[8px] text-slate-400 font-bold uppercase mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span>SURFACE SRP KINEMATICS</span>
                  </div>
                  <div className="flex items-baseline justify-end gap-2">
                    <span className="text-sm font-bold text-cyan-400">{spm.toFixed(1)} SPM</span>
                    <span className="text-[10px] text-slate-400">({vfdHz.toFixed(1)} Hz)</span>
                    <span className="text-xs font-bold text-amber-400">{rodLoad.toFixed(1)} kN</span>
                  </div>
                </div>
              </div>

              {/* Bottom Row Callouts */}
              <div className="flex justify-end items-end gap-2.5">
                {/* Viscosity Card */}
                <div className="bg-[#0B1017]/90 backdrop-blur-md px-2.5 py-1.5 rounded-sm border border-[#1E2A3B] shadow-lg">
                  <div className="text-[8px] text-purple-400 font-bold uppercase mb-0.5">
                    CRUDE VISCOSITY (ARRHENIUS)
                  </div>
                  <div className="text-xs font-bold text-purple-300">
                    {Math.round(viscCp).toLocaleString()} cP
                  </div>
                </div>

                {/* Bottomhole Temp */}
                <div className="bg-[#0B1017]/90 backdrop-blur-md px-2.5 py-1.5 rounded-sm border border-[#1E2A3B] shadow-lg">
                  <div className="text-[8px] text-orange-400 font-bold uppercase mb-0.5">
                    BOTTOMHOLE TEMP // CSS
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold" style={{ color: getTempColor(tempC) }}>
                      {tempC.toFixed(1)}°C
                    </span>
                    <span className="text-[8.5px] text-amber-400 font-bold">
                      STAGE: {stage}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Status Readout */}
      <div className="relative z-10 pt-2 border-t border-[#1E2A3B] flex flex-wrap items-center justify-between text-[9.5px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
            DIGITAL TWIN: {isRunning ? (
              <span className="text-cyan-300 font-bold">
                {spm.toFixed(1)} SPM CLOSED-FORM 4-BAR KINEMATICS (60 FPS CONTINUOUS)
              </span>
            ) : 'PAUSED'}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            BEAM TILT: <span ref={beamAngleTextRef} className="text-slate-200 font-bold">0.0°</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            STROKES: <span ref={strokeCountRef} className="text-amber-300 font-bold">0</span>
          </span>
        </div>
        <div>
          API SPEC 11E CLASS C PUMPJACK &bull; 1,150M RESERVOIR
        </div>
      </div>
    </div>
  );
});

DigitalTwinSchematic.displayName = 'DigitalTwinSchematic';

export default DigitalTwinSchematic;
