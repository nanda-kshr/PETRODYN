'use client';

import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: string;
  title?: string;
  category?: 'ANALYTICS' | 'PREDICTION' | 'CONTROL';
  children?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  title,
  category,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
    >
      <button
        type="button"
        className="inline-flex items-center cursor-help focus:outline-none transition-transform active:scale-95"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={title || 'Information'}
      >
        {children || <Info className="w-3.5 h-3.5 text-slate-400 hover:text-cyan-400 transition-colors" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 2 }}
            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-[#0D1219]/95 border border-[#1E293B] rounded-lg shadow-2xl backdrop-blur-md text-left pointer-events-none ring-1 ring-cyan-500/10"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-[#1E293B] pb-1.5">
              <span className="text-xs font-bold text-slate-100 tracking-wide font-sans">
                {title || 'Information'}
              </span>
              {category && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold tracking-wider ${
                    category === 'ANALYTICS'
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      : category === 'PREDICTION'
                      ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {category}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
              {content}
            </p>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-[#0D1219]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
