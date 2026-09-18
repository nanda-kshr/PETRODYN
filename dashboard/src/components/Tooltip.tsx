'use client';

import React, { useState } from 'react';
import { Info } from 'lucide-react';

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
    <div className="relative inline-flex items-center">
      <div
        className="inline-flex items-center cursor-help"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
      >
        {children || <Info className="w-3.5 h-3.5 text-slate-500 hover:text-sky-400 transition" />}
      </div>

      {isOpen && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-slate-800 pb-1">
            <span className="text-xs font-bold text-white tracking-wide">
              {title || 'Information'}
            </span>
            {category && (
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold ${
                  category === 'ANALYTICS'
                    ? 'bg-sky-950 text-sky-300 border border-sky-800'
                    : category === 'PREDICTION'
                    ? 'bg-purple-950 text-purple-300 border border-purple-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {category}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
            {content}
          </p>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-700" />
        </div>
      )}
    </div>
  );
};
