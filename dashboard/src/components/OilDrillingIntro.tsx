'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

interface OilDrillingIntroProps {
  onComplete: () => void;
  videoSrc?: string;
}

export function OilDrillingIntro({
  onComplete,
  videoSrc = '/oil_pumpjack_intro.mp4',
}: OilDrillingIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const isCompletedRef = useRef(false);

  const triggerComplete = useCallback(() => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;
    setIsFadingOut(true);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Trigger complete when video ends or within last 0.4s
    const onEnded = () => {
      triggerComplete();
    };

    const onTimeUpdate = () => {
      if (video.duration && video.currentTime >= video.duration - 0.35) {
        triggerComplete();
      }
    };

    video.addEventListener('ended', onEnded);
    video.addEventListener('timeupdate', onTimeUpdate);

    // Auto-play immediately
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Auto-play fallback:', err);
        video.muted = true;
        video.play().catch(() => {});
      });
    }

    return () => {
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [triggerComplete]);

  // Keyboard shortcut to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        triggerComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerComplete]);

  return (
    <motion.div
      key="oil-animation-stage"
      initial={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      animate={{
        opacity: isFadingOut ? 0 : 1,
        scale: isFadingOut ? 1.05 : 1,
        filter: isFadingOut ? 'blur(10px) brightness(1.1)' : 'blur(0px) brightness(1)',
      }}
      transition={{
        duration: 0.95,
        ease: [0.16, 1, 0.3, 1], // Exponential smooth ease-out
      }}
      onAnimationComplete={() => {
        if (isFadingOut) {
          onComplete();
        }
      }}
      className="fixed inset-0 z-[99999] w-screen h-screen overflow-hidden bg-[#05030e] select-none pointer-events-auto"
    >
      {/* Fullscreen Edge-to-Edge Animation Video */}
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        muted
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        controls={false}
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
      />

      {/* Ambient Vignette Overlay */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,_transparent_40%,_rgba(5,3,14,0.6)_100%] pointer-events-none" />

      {/* Cybernetic Energy Wave on Exit */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isFadingOut ? 0.4 : 0 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(6,182,212,0.3)_0%,_transparent_70%)] pointer-events-none"
      />

      {/* Minimalist Floating Skip Button */}
      <motion.button
        type="button"
        onClick={triggerComplete}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: isFadingOut ? 0 : 1, y: isFadingOut ? -10 : 0 }}
        transition={{ delay: 0.4, duration: 0.35 }}
        className="absolute top-6 right-6 z-50 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider bg-slate-950/60 hover:bg-slate-900/90 text-slate-300 hover:text-cyan-300 border border-slate-700/40 hover:border-cyan-500/50 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-xl hover:scale-105 active:scale-95"
      >
        <span>ENTER DASHBOARD</span>
        <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
      </motion.button>

      {/* Bottom Live System Ready Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isFadingOut ? 0 : 0.8 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-950/70 border border-[#1E2A3B] backdrop-blur-md text-[10px] font-mono text-slate-400 flex items-center gap-2 pointer-events-none"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span>INITIALIZING BAGHEWALA DIGITAL TWIN // BW-001</span>
      </motion.div>
    </motion.div>
  );
}

export default OilDrillingIntro;

