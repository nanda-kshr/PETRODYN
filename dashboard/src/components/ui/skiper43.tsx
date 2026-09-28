"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Skiper43Props {
  children: React.ReactNode;
  content: React.ReactNode;
  shortcut?: string;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
  tooltipClassName?: string;
}

export function Skiper43({
  children,
  content,
  shortcut,
  side = "top",
  className,
  tooltipClassName,
}: Skiper43Props) {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionStyles = () => {
    switch (side) {
      case "bottom":
        return "top-full left-1/2 -translate-x-1/2 mt-2";
      case "left":
        return "right-full top-1/2 -translate-y-1/2 mr-2";
      case "right":
        return "left-full top-1/2 -translate-y-1/2 ml-2";
      case "top":
      default:
        return "bottom-full left-1/2 -translate-x-1/2 mb-2";
    }
  };

  const getArrowStyles = () => {
    switch (side) {
      case "bottom":
        return "bottom-full left-1/2 -translate-x-1/2 border-b-slate-900 border-b-[5px] border-x-[5px] border-x-transparent border-t-0";
      case "left":
        return "left-full top-1/2 -translate-y-1/2 border-l-slate-900 border-l-[5px] border-y-[5px] border-y-transparent border-r-0";
      case "right":
        return "right-full top-1/2 -translate-y-1/2 border-r-slate-900 border-r-[5px] border-y-[5px] border-y-transparent border-l-0";
      case "top":
      default:
        return "top-full left-1/2 -translate-x-1/2 border-t-slate-900 border-t-[5px] border-x-[5px] border-x-transparent border-b-0";
    }
  };

  return (
    <div
      className={cn("relative inline-flex items-center", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: side === "top" ? 4 : side === "bottom" ? -4 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: side === "top" ? 2 : side === "bottom" ? -2 : 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
            className={cn(
              "absolute z-50 pointer-events-none whitespace-nowrap",
              getPositionStyles(),
              tooltipClassName
            )}
          >
            <div className="relative flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900/95 border border-slate-700/60 backdrop-blur-md shadow-2xl text-[11px] font-medium text-slate-100 ring-1 ring-white/10">
              <span className="leading-none">{content}</span>
              {shortcut && (
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[9px] text-slate-400 font-normal uppercase tracking-wider">
                  {shortcut}
                </kbd>
              )}
              {/* Arrow */}
              <div className={cn("absolute w-0 h-0", getArrowStyles())} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Skiper43;
