'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isDone, setIsDone] = useState(false);
  const isCompletedRef = useRef(false);

  const triggerComplete = useCallback(() => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;
    setIsFadingOut(true);

    // Smooth black fade transition
    setTimeout(() => {
      try {
        onComplete();
      } catch (err) {
        console.error('Error in onComplete callback:', err);
      }
      setIsDone(true);
    }, 600);
  }, [onComplete]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Trigger complete when video animation finishes
    const onEnded = () => {
      triggerComplete();
    };

    video.addEventListener('ended', onEnded);

    // Ensure video starts playing immediately as native animation
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
    };
  }, [triggerComplete]);

  // Keyboard shortcut to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        triggerComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerComplete]);

  if (isDone) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="oil-animation-stage"
        initial={{ opacity: 1 }}
        animate={{ opacity: isFadingOut ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-[99999] w-screen h-screen overflow-hidden bg-black select-none pointer-events-auto"
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

        {/* Minimalist Floating Skip Button */}
        <motion.button
          type="button"
          onClick={triggerComplete}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="absolute top-6 right-6 z-50 px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider bg-black/40 hover:bg-black/80 text-white/70 hover:text-white border border-white/15 hover:border-white/30 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-lg hover:scale-105 active:scale-95"
        >
          Skip &rarr;
        </motion.button>

        {/* Blackout curtain for seamless transition into black dashboard */}
        <AnimatePresence>
          {isFadingOut && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute inset-0 z-40 bg-black pointer-events-none"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

export default OilDrillingIntro;
