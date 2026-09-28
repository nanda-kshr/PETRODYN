"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface Skiper1Props {
  className?: string;
  showPercentage?: boolean;
  color?: string;
}

export function Skiper1({
  className,
  showPercentage = true,
  color = "#06B6D4",
}: Skiper1Props) {
  const { scrollYProgress } = useScroll();
  const [percent, setPercent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  // Smooth physics spring animation
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 30,
    restDelta: 0.001,
  });

  // Calculate height transform
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 28,
  });

  const thumbTop = useTransform(smoothProgress, (val) => `${val * 96}%`);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setPercent(Math.round(latest * 100));
      setIsScrolling(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsScrolling(false);
      }, 1200);
    });
    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [scrollYProgress]);

  return (
    <div
      className={cn(
        "fixed right-2 top-0 bottom-0 z-50 flex items-center justify-center pointer-events-none py-6",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Scrollbar Track */}
      <div className="relative h-full w-1.5 rounded-full bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 overflow-visible flex flex-col justify-between items-center pointer-events-auto">
        {/* Fill Indicator */}
        <motion.div
          className="absolute top-0 left-0 right-0 rounded-full origin-top"
          style={{
            scaleY: smoothProgress,
            backgroundColor: color,
            boxShadow: `0 0 12px ${color}80, 0 0 20px ${color}40`,
          }}
        />

        {/* Dynamic Glowing Thumb */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full flex items-center justify-center cursor-pointer pointer-events-auto group"
          style={{
            top: thumbTop,
            backgroundColor: color,
            boxShadow: `0 0 14px ${color}, 0 0 28px ${color}80`,
          }}
          whileHover={{ scale: 1.4 }}
          whileTap={{ scale: 0.9 }}
        >
          {/* Inner Core */}
          <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />

          {/* Tooltip on Scroll / Hover */}
          {showPercentage && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{
                opacity: isScrolling || isHovered ? 1 : 0,
                x: isScrolling || isHovered ? 0 : 10,
              }}
              transition={{ duration: 0.2 }}
              className="absolute right-6 px-2 py-0.5 rounded bg-slate-900/90 border border-cyan-500/40 backdrop-blur-md text-[10px] font-mono text-cyan-300 whitespace-nowrap shadow-lg"
            >
              SCROLL {percent}%
            </motion.div>
          )}
        </motion.div>

        {/* Ticks at 25%, 50%, 75% */}
        <div className="absolute top-1/4 w-2 h-0.5 bg-slate-700/60 -left-[1px]" />
        <div className="absolute top-2/4 w-2 h-0.5 bg-slate-700/60 -left-[1px]" />
        <div className="absolute top-3/4 w-2 h-0.5 bg-slate-700/60 -left-[1px]" />
      </div>
    </div>
  );
}

export default Skiper1;
