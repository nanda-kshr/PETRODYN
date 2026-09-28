'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Zap, Activity } from 'lucide-react';

interface PolygonMorphLoaderProps {
  onComplete?: () => void;
  title?: string;
  duration?: number; // total duration in ms before auto-completing (if desired)
  autoComplete?: boolean;
}

export function PolygonMorphLoader({
  onComplete,
  title = 'System Initializing',
  duration = 3500,
  autoComplete = true,
}: PolygonMorphLoaderProps) {
  const path1Ref = useRef<SVGPolygonElement>(null);
  const path2Ref = useRef<SVGPolygonElement>(null);
  const [progress, setProgress] = useState(0);
  const [statusLog, setStatusLog] = useState('Generating dynamic mesh topology...');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const isMountedRef = useRef(true);

  // Generate random points matching user function
  const generatePoints = () => {
    const total = Math.floor(Math.random() * (64 - 4 + 1)) + 4;
    const r1 = Math.floor(Math.random() * (56 - 4 + 1)) + 4;
    const r2 = 56;
    const isOdd = (n: number) => n % 2 !== 0;
    let points = '';
    const len = isOdd(total) ? total + 1 : total;
    for (let i = 0; i < len; i++) {
      const r = isOdd(i) ? r1 : r2;
      const a = (2 * Math.PI * i) / len - Math.PI / 2;
      const x = 152 + Math.round(r * Math.cos(a));
      const y = 56 + Math.round(r * Math.sin(a));
      points += `${x},${y} `;
    }
    return points.trim();
  };

  useEffect(() => {
    isMountedRef.current = true;
    let animeInstance: any = null;

    const startAnimeAnimation = async () => {
      try {
        // Dynamically import animejs to ensure SSR safety and v4 compatibility
        const animeModule: any = await import('animejs');
        const { animate, svg, utils } = animeModule;

        const $p1 = path1Ref.current;
        const $p2 = path2Ref.current;

        if (!$p1 || !$p2) return;

        const animateRandomPoints = () => {
          if (!isMountedRef.current) return;
          const nextPoints = generatePoints();
          if (utils && utils.set) {
            utils.set($p2, { points: nextPoints });
          } else {
            $p2.setAttribute('points', nextPoints);
          }

          if (svg && typeof svg.morphTo === 'function') {
            animeInstance = animate($p1, {
              points: svg.morphTo($p2),
              ease: 'inOutCirc',
              duration: 500,
              onComplete: animateRandomPoints,
            });
          } else if (typeof animeModule.default === 'function') {
            // Anime.js v3 fallback
            animeInstance = animeModule.default({
              targets: $p1,
              points: [{ value: nextPoints }],
              easing: 'easeInOutCirc',
              duration: 500,
              complete: animateRandomPoints,
            });
          }
        };

        animateRandomPoints();
      } catch (err) {
        // Pure JS fallback loop with requestAnimationFrame interpolation
        console.warn('Anime.js module initialization fallback:', err);
      }
    };

    startAnimeAnimation();

    // Progress bar simulation
    const logs = [
      'Calibrating topological manifold mesh...',
      'Computing Voronoi polygon vectors...',
      'Synchronizing multi-agent neural telemetry...',
      'Digital Twin state synced (100%)...',
    ];

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 8) + 4;
        const idx = Math.min(logs.length - 1, Math.floor((next / 100) * logs.length));
        setStatusLog(logs[idx]);
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, 180);

    let finishTimeout: NodeJS.Timeout | null = null;
    if (autoComplete) {
      finishTimeout = setTimeout(() => {
        handleComplete();
      }, duration);
    }

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
      if (finishTimeout) clearTimeout(finishTimeout);
      if (animeInstance && typeof animeInstance.pause === 'function') {
        animeInstance.pause();
      }
    };
  }, [autoComplete, duration]);

  const handleComplete = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 500);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isFadingOut ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#07090e]/95 backdrop-blur-xl text-slate-100 select-none"
      >
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute w-[400px] h-[300px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Card */}
        <div className="relative z-10 flex flex-col items-center bg-slate-900/80 border border-slate-800 p-8 rounded-2xl shadow-2xl shadow-cyan-950/30 max-w-md w-[92vw]">
          {/* Header Title */}
          <div className="flex items-center gap-2 mb-6">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span className="font-mono text-xs font-semibold tracking-wider text-slate-400 uppercase">
              {title}
            </span>
          </div>

          {/* Morphing SVG Stage */}
          <div className="relative w-[304px] h-[112px] flex items-center justify-center my-2">
            <div className="absolute inset-0 bg-cyan-500/10 filter blur-xl rounded-full pointer-events-none" />
            <svg
              viewBox="0 0 304 112"
              className="w-full h-full overflow-visible drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              <defs>
                <linearGradient id="polyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0.5" />
                </linearGradient>
              </defs>

              <polygon
                ref={path1Ref}
                id="path-1"
                points="152,0 208,56 152,112 96,56"
                fill="url(#polyGrad)"
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              <polygon ref={path2Ref} id="path-2" style={{ display: 'none' }} points="" />
            </svg>
          </div>

          {/* Progress Bar & Telemetry */}
          <div className="w-full mt-6 space-y-2">
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span className="truncate max-w-[200px] text-cyan-400/90">{statusLog}</span>
              <span className="font-semibold text-slate-200">{progress}%</span>
            </div>
          </div>

          {/* Skip Button */}
          <button
            onClick={handleComplete}
            type="button"
            className="mt-6 text-xs font-mono tracking-wider text-slate-400 hover:text-slate-100 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 px-4 py-1.5 rounded-full transition duration-150 cursor-pointer"
          >
            Skip Intro &rarr;
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default PolygonMorphLoader;
