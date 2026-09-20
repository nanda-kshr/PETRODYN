'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OilDrillingIntroProps {
  onComplete: () => void;
}

type AnimationStage =
  | 'intro'          // 0.0 - 0.3s : Clean pure white bg, centered right-facing pumpjack
  | 'drilling'       // 0.3 - 1.8s : 3 synchronized mechanical down-up pumping strokes
  | 'oil-emerging'   // 1.8 - 2.1s : Dramatic black crude oil geyser eruption on the right
  | 'oil-spreading'  // 2.1 - 3.0s : Viscous liquid wave floods upwards, submerging the rig
  | 'completing'     // 3.0 - 3.4s : 100% solid black viewport & seamless dissolve
  | 'dashboard';     // 3.4s+      : Interactive live dashboard active

export function OilDrillingIntro({ onComplete }: OilDrillingIntroProps) {
  const [stage, setStage] = useState<AnimationStage>('intro');
  const [isDone, setIsDone] = useState(false);
  const isCompletedRef = useRef(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Safe completion trigger guaranteed to execute once
  const triggerComplete = useCallback(() => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;
    setIsDone(true);
    setStage('dashboard');
    try {
      onComplete();
    } catch (err) {
      console.error('Error in onComplete callback:', err);
    }
  }, [onComplete]);

  useEffect(() => {
    // 1. Accessibility: prefers-reduced-motion bypass
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        triggerComplete();
        return;
      }
    }

    // 2. Clear any leftover timers
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    const addTimeout = (fn: () => void, delayMs: number) => {
      const id = setTimeout(fn, delayMs);
      timeoutsRef.current.push(id);
      return id;
    };

    // Stage 1 -> 2: Drilling starts at 300ms
    addTimeout(() => {
      if (!isCompletedRef.current) setStage('drilling');
    }, 300);

    // Stage 2 -> 3: Oil erupts from right wellhead at 1800ms
    addTimeout(() => {
      if (!isCompletedRef.current) setStage('oil-emerging');
    }, 1800);

    // Stage 3 -> 4: Oil liquid wave floods upward across viewport at 2100ms
    addTimeout(() => {
      if (!isCompletedRef.current) setStage('oil-spreading');
    }, 2100);

    // Stage 4 -> 5: Completing at 3000ms (100% black screen)
    addTimeout(() => {
      if (!isCompletedRef.current) {
        setStage('completing');
        triggerComplete();
      }
    }, 3050);

    // Hard Fallback Safety: Always unlock dashboard by 3400ms under all circumstances
    addTimeout(() => {
      triggerComplete();
    }, 3400);

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, [triggerComplete]);

  if (isDone || stage === 'dashboard') {
    return null;
  }

  const isPumping =
    stage === 'drilling' ||
    stage === 'oil-emerging' ||
    stage === 'oil-spreading' ||
    stage === 'completing';

  return (
    <AnimatePresence>
      <motion.div
        key="oil-drilling-intro-overlay"
        initial={{ opacity: 1 }}
        animate={{ opacity: stage === 'completing' ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
        className="fixed inset-0 z-[9999] overflow-hidden flex items-center justify-center bg-white select-none pointer-events-auto"
        style={{
          pointerEvents: stage === 'completing' ? 'none' : 'auto',
        }}
      >
        {/* Subtle Minimal Skip Button */}
        <button
          type="button"
          onClick={triggerComplete}
          className="absolute top-5 right-5 z-50 px-3 py-1 rounded-full text-[11px] font-mono tracking-wide bg-slate-900/5 hover:bg-slate-900/15 text-slate-400 hover:text-slate-800 border border-slate-200/80 backdrop-blur-sm transition-all duration-150 cursor-pointer"
        >
          Skip &rarr;
        </button>

        {/* Center Illustration Area (No text) */}
        <div className="relative w-full max-w-2xl px-6 flex items-center justify-center">
          <div className="relative w-full aspect-[16/10] flex items-center justify-center">
            <svg
              viewBox="0 0 540 340"
              className="w-full h-full overflow-visible"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Vibrant Amber/Orange Gradient for Horsehead & Counterweight */}
                <linearGradient id="amberAccent" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="40%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>

                {/* Dark Steel Metallic */}
                <linearGradient id="darkSteel" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#090d16" />
                </linearGradient>

                {/* Polished Chrome Rod */}
                <linearGradient id="chromeRod" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#64748b" />
                  <stop offset="50%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>

                {/* Glossy Black Heavy Crude */}
                <linearGradient id="crudeJet" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="30%" stopColor="#090d16" />
                  <stop offset="100%" stopColor="#000000" />
                </linearGradient>
              </defs>

              {/* 1. Ground Surface Horizon Line */}
              <line x1="20" y1="275" x2="520" y2="275" stroke="#090d16" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="50" y1="282" x2="490" y2="282" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 6" />

              {/* 2. Base Skid Frame & Motor Housing on LEFT (x=110 to x=180) */}
              <rect x="90" y="267" width="90" height="8" rx="2" fill="#090d16" />
              <rect x="100" y="248" width="48" height="19" rx="3" fill="#1e293b" stroke="#090d16" strokeWidth="2" />
              <circle cx="112" cy="257" r="3" fill="#475569" />

              {/* 3. ROTATING CRANK & VIBRANT AMBER COUNTERWEIGHT on LEFT (Crank Pin at x=145, y=235) */}
              <g transform="translate(145, 235)">
                <motion.g
                  animate={isPumping ? { rotate: 360 * 3 } : { rotate: 0 }}
                  transition={{
                    duration: 1.5,
                    ease: 'easeInOut',
                  }}
                >
                  {/* Crank Shaft Hub */}
                  <circle cx="0" cy="0" r="13" fill="#1e293b" stroke="#090d16" strokeWidth="2.5" />
                  {/* Crank Arm */}
                  <line x1="0" y1="0" x2="0" y2="-36" stroke="#090d16" strokeWidth="7" strokeLinecap="round" />
                  
                  {/* Vibrant Industrial Amber/Orange Counterweight */}
                  <path
                    d="M-18 -36 C-18 -52, 18 -52, 18 -36 C18 -26, -18 -26, -18 -36 Z"
                    fill="url(#amberAccent)"
                    stroke="#090d16"
                    strokeWidth="2.5"
                  />
                  {/* Inner Counterweight Bolt Details */}
                  <circle cx="0" cy="-38" r="4" fill="#090d16" />
                  <circle cx="0" cy="-38" r="1.5" fill="#fef3c7" />
                </motion.g>
              </g>

              {/* 4. SAMSON POST / A-FRAME TOWER in CENTER (Center Pivot at x=265, y=125) */}
              {/* Center Skid Base */}
              <rect x="200" y="267" width="130" height="8" rx="2" fill="#090d16" />
              {/* Left A-Frame Leg */}
              <line x1="265" y1="125" x2="215" y2="267" stroke="#090d16" strokeWidth="9" strokeLinecap="round" />
              {/* Right A-Frame Leg */}
              <line x1="265" y1="125" x2="315" y2="267" stroke="#090d16" strokeWidth="9" strokeLinecap="round" />
              {/* Structural Cross Braces */}
              <line x1="235" y1="210" x2="295" y2="210" stroke="#334155" strokeWidth="4" />
              <line x1="247" y1="170" x2="283" y2="170" stroke="#334155" strokeWidth="3.5" />
              {/* Center Saddle Bearing Housing */}
              <circle cx="265" cy="125" r="9" fill="#334155" stroke="#090d16" strokeWidth="3" />
              <circle cx="265" cy="125" r="3.5" fill="#f8fafc" />

              {/* 5. RECIPROCATING WALKING BEAM & AMBER HORSEHEAD (Pivoting at x=265, y=125) */}
              <g transform="translate(265, 125)">
                <motion.g
                  animate={
                    isPumping
                      ? {
                          // Stroke 1: down (-9) -> up (+10)
                          // Stroke 2: down (-9) -> up (+10)
                          // Stroke 3: down (-9) -> up (+10) -> settled (0)
                          rotate: [0, 9, -10, 9, -10, 9, -10, 0],
                        }
                      : { rotate: 0 }
                  }
                  transition={{
                    duration: 1.5,
                    times: [0, 0.16, 0.32, 0.48, 0.64, 0.8, 0.94, 1.0],
                    ease: 'easeInOut',
                  }}
                >
                  {/* Heavy Steel Walking Beam Bar (Left tail x=-120, Right front x=+135) */}
                  <path
                    d="M-120 -3 L135 -3 L125 7 L-110 7 Z"
                    fill="url(#darkSteel)"
                    stroke="#090d16"
                    strokeWidth="2.5"
                  />
                  <line x1="-120" y1="-3" x2="135" y2="-3" stroke="#475569" strokeWidth="3" />

                  {/* Tail Pin on Left for Pitman Arm */}
                  <circle cx="-120" cy="2" r="5" fill="#334155" stroke="#090d16" strokeWidth="2" />

                  {/* VIBRANT AMBER/ORANGE HORSEHEAD on the RIGHT (Front end at relative x=+135) */}
                  {/* Horsehead Triangular Backbone Frame */}
                  <path
                    d="M135 2 L145 -22 L170 -38 L160 30 Z"
                    fill="#090d16"
                  />
                  {/* Horsehead Curved Outer Arc with Signature Industrial Amber/Orange */}
                  <path
                    d="M145 -22 C165 -36, 178 -44, 185 -46 C180 -12, 176 18, 145 32 C158 16, 160 -10, 145 -22 Z"
                    fill="url(#amberAccent)"
                    stroke="#090d16"
                    strokeWidth="2.5"
                  />
                  {/* Horsehead Curved Wireline Outer Cable Track */}
                  <path
                    d="M185 -46 C178 -12, 172 16, 145 32"
                    stroke="#090d16"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  {/* Motion Energy Arcs (visible at top of stroke) */}
                  <motion.path
                    d="M192 -50 C186 -20, 180 10, 155 28"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="4 4"
                    initial={{ opacity: 0 }}
                    animate={isPumping ? { opacity: [0, 1, 0, 1, 0] } : { opacity: 0 }}
                    transition={{ duration: 1.5, ease: 'linear' }}
                  />
                </motion.g>
              </g>

              {/* 6. PITMAN ARM (Connects Left Crank Pin to Walking Beam Tail) */}
              <line x1="145" y1="230" x2="145" y2="127" stroke="#090d16" strokeWidth="5" strokeLinecap="round" />

              {/* 7. WELLHEAD & POLISHED ROD on the RIGHT (x=410) */}
              {/* Wellhead Casing & Flange Tree */}
              <rect x="396" y="245" width="28" height="30" rx="2" fill="#090d16" />
              <rect x="390" y="235" width="40" height="12" rx="2" fill="#1e293b" stroke="#090d16" strokeWidth="2" />
              <circle cx="398" cy="241" r="1.8" fill="#f8fafc" />
              <circle cx="422" cy="241" r="1.8" fill="#f8fafc" />
              {/* Flow Line Outflow Pipe (Right) */}
              <path d="M430 252 L452 252 L452 270" stroke="#334155" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Polished Rod & Wireline Bridle (Sliding vertically at x=410) */}
              <motion.g
                animate={
                  isPumping
                    ? {
                        // In sync with beam right-end motion (down -> up -> down -> up)
                        y: [0, -22, 22, -22, 22, -22, 22, 0],
                      }
                    : { y: 0 }
                }
                transition={{
                  duration: 1.5,
                  times: [0, 0.16, 0.32, 0.48, 0.64, 0.8, 0.94, 1.0],
                  ease: 'easeInOut',
                }}
              >
                {/* Bridle Wire Cables */}
                <line x1="406" y1="95" x2="408" y2="165" stroke="#334155" strokeWidth="2" />
                <line x1="414" y1="95" x2="412" y2="165" stroke="#334155" strokeWidth="2" />
                {/* Carrier Bar Clamp */}
                <rect x="401" y="165" width="18" height="6" rx="1.5" fill="#090d16" stroke="#475569" strokeWidth="1" />
                {/* Polished Chrome Rod */}
                <line x1="410" y1="171" x2="410" y2="255" stroke="url(#chromeRod)" strokeWidth="4.5" strokeLinecap="round" />
              </motion.g>

              {/* 8. DRAMATIC CRUDE OIL GEYSER ERUPTION on RIGHT WELLHEAD (Frame 2.0s: 1.8s - 2.1s) */}
              <AnimatePresence>
                {(stage === 'oil-emerging' || stage === 'oil-spreading' || stage === 'completing') && (
                  <motion.g
                    initial={{ opacity: 0, scale: 0.2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    {/* Expanding Black Crude Liquid Base Pool */}
                    <ellipse cx="410" cy="274" rx="45" ry="11" fill="url(#crudeJet)" />
                    <ellipse cx="410" cy="272" rx="34" ry="7" fill="#000000" />

                    {/* High-Pressure Vertical Oil Geyser Stream */}
                    <path
                      d="M398 270 C388 230, 392 180, 410 160 C428 180, 432 230, 422 270 Z"
                      fill="url(#crudeJet)"
                    />

                    {/* Dynamic High-Velocity Oil Splatters & Droplets (Exact match to 2.0s frame) */}
                    <motion.circle
                      cx="410"
                      cy="150"
                      r="7.5"
                      fill="#000000"
                      initial={{ y: 30, scale: 0.2 }}
                      animate={{ y: [-15, -45, -20], scale: [1, 1.4, 0.8] }}
                      transition={{ duration: 0.5, repeat: Infinity, ease: 'easeOut' }}
                    />
                    <motion.circle
                      cx="432"
                      cy="170"
                      r="6"
                      fill="#090d16"
                      initial={{ y: 20, scale: 0 }}
                      animate={{ y: [0, -32, 10], x: [0, 18, 26] }}
                      transition={{ duration: 0.45, repeat: Infinity, delay: 0.05 }}
                    />
                    <motion.circle
                      cx="388"
                      cy="175"
                      r="5.5"
                      fill="#000000"
                      initial={{ y: 20, scale: 0 }}
                      animate={{ y: [0, -28, 8], x: [0, -16, -24] }}
                      transition={{ duration: 0.48, repeat: Infinity, delay: 0.08 }}
                    />
                    <motion.circle
                      cx="448"
                      cy="195"
                      r="4.5"
                      fill="#000000"
                      initial={{ y: 10, scale: 0 }}
                      animate={{ y: [0, -20, 12], x: [0, 22, 30] }}
                      transition={{ duration: 0.42, repeat: Infinity, delay: 0.12 }}
                    />
                    <motion.circle
                      cx="374"
                      cy="200"
                      r="4"
                      fill="#090d16"
                      initial={{ y: 10, scale: 0 }}
                      animate={{ y: [0, -18, 10], x: [0, -20, -28] }}
                      transition={{ duration: 0.44, repeat: Infinity, delay: 0.15 }}
                    />
                  </motion.g>
                )}
              </AnimatePresence>
            </svg>
          </div>
        </div>

        {/* 9. VISCOUS LIQUID WAVE FLOOD (Frames 2.3s & 2.7s -> Submerges Rig & Fills Screen from Bottom) */}
        <AnimatePresence>
          {(stage === 'oil-spreading' || stage === 'completing') && (
            <motion.div
              initial={{ transform: 'translateY(100%)' }}
              animate={{ transform: 'translateY(-5%)' }}
              transition={{
                duration: 0.95,
                ease: [0.3, 0.9, 0.4, 1], // Viscous organic fluid surge
              }}
              className="absolute inset-0 z-40 pointer-events-none flex flex-col justify-start"
              style={{
                background: 'linear-gradient(to top, #000000 85%, #05080c 95%, #090d16 100%)',
                height: '110%',
                width: '100%',
              }}
            >
              {/* Dynamic Undulating Liquid Surface Waves with Splashing Droplets */}
              <div className="relative w-full -mt-16 h-20 overflow-hidden">
                {/* Secondary Background Wave */}
                <motion.svg
                  viewBox="0 0 1440 120"
                  className="absolute top-0 left-0 w-[200%] h-20 opacity-60 fill-[#090d16]"
                  animate={{ x: [0, -720] }}
                  transition={{ duration: 2.0, repeat: Infinity, ease: 'linear' }}
                >
                  <path d="M0,45 C240,80 480,10 720,45 C960,80 1200,10 1440,45 L1440,120 L0,120 Z" />
                </motion.svg>

                {/* Primary Thick Crude Surface Wave */}
                <motion.svg
                  viewBox="0 0 1440 120"
                  className="absolute top-2 left-0 w-[200%] h-20 fill-[#000000]"
                  animate={{ x: [-720, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
                >
                  <path d="M0,50 C180,15 360,85 540,50 C720,15 900,85 1080,50 C1260,15 1380,75 1440,50 L1440,120 L0,120 Z" />
                </motion.svg>

                {/* Floating Oil Droplets Splattering on Wave Crest */}
                <div className="absolute inset-0 flex justify-around items-start">
                  <span className="w-2.5 h-2.5 rounded-full bg-black -mt-1 shadow-sm" />
                  <span className="w-3.5 h-3.5 rounded-full bg-black -mt-3 shadow-sm" />
                  <span className="w-2 h-2 rounded-full bg-black -mt-2 shadow-sm" />
                  <span className="w-4 h-4 rounded-full bg-black -mt-4 shadow-sm" />
                  <span className="w-2.5 h-2.5 rounded-full bg-black -mt-1 shadow-sm" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

export default OilDrillingIntro;
