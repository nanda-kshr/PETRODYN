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
        {children || <Info className="w-3.5 h-3.5 text-gray-400 hover:text-sky-600 transition" />}
      </div>

      {isOpen && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 p-3 bg-white border border-gray-200 rounded-lg shadow-xl text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-gray-100 pb-1">
            <span className="text-xs font-bold text-gray-900 tracking-wide">
              {title || 'Information'}
            </span>
            {category && (
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold ${
                  category === 'ANALYTICS'
                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                    : category === 'PREDICTION'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {category}
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed font-normal">
            {content}
          </p>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-300" />
        </div>
      )}
    </div>
  );
};
