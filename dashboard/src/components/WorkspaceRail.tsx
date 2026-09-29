'use client';

import React from 'react';
import { LayoutGrid, Activity, Sparkles, Sliders, ChevronLeft, ChevronRight, Terminal, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skiper43 } from '@/components/ui/skiper43';

export type WorkspaceTab = 'overview' | 'analytics' | 'predictions' | 'simulator';

interface WorkspaceRailProps {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  badgeCounts?: {
    analytics?: number;
    predictions?: number;
  };
  className?: string;
}

interface NavItem {
  id: WorkspaceTab;
  number: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badge?: number;
  tooltip: string;
  shortcut: string;
}

export const WorkspaceRail: React.FC<WorkspaceRailProps> = ({
  activeTab,
  onTabChange,
  isCollapsed = false,
  onToggleCollapse,
  badgeCounts = { analytics: 15, predictions: 13 },
  className = '',
}) => {
  const navItems: NavItem[] = [
    {
      id: 'overview',
      number: '01',
      label: 'OVERVIEW & TWIN',
      icon: LayoutGrid,
      accentColor: 'text-cyan-400',
      tooltip: 'Digital Twin Hero & SCADA Command Center',
      shortcut: '1',
    },
    {
      id: 'analytics',
      number: '02',
      label: 'REAL-TIME ANALYTICS',
      icon: Activity,
      accentColor: 'text-sky-400',
      badge: badgeCounts.analytics,
      tooltip: 'Live Multi-Channel SCADA Waveforms & Load Stream',
      shortcut: '2',
    },
    {
      id: 'predictions',
      number: '03',
      label: 'AI INTELLIGENCE',
      icon: Sparkles,
      accentColor: 'text-purple-400',
      badge: badgeCounts.predictions,
      tooltip: 'Multi-Horizon Failure Radar & Arrhenius Forecast',
      shortcut: '3',
    },
    {
      id: 'simulator',
      number: '04',
      label: 'SIMULATOR COCKPIT',
      icon: Sliders,
      accentColor: 'text-emerald-400',
      tooltip: 'In-Silico Physics Engine & CSS Setpoint Dispatch',
      shortcut: '4',
    },
  ];

  return (
    <aside
      className={`sticky top-[96px] h-[calc(100vh-96px)] z-30 bg-[#070A0F]/65 border-r border-[#1E2A3B]/70 backdrop-blur-xl flex flex-col justify-between transition-all duration-200 shrink-0 ${
        isCollapsed ? 'w-14' : 'w-56'
      } ${className}`}
    >
      {/* Upper Navigation Stack */}
      <div className="flex flex-col py-3 px-1.5 space-y-1">
        <div className={`px-2.5 py-1 mb-2 flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-widest ${isCollapsed ? 'justify-center' : ''}`}>
          {!isCollapsed && <span>WORKSPACES</span>}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
              className="p-1 rounded-sm text-slate-400 hover:text-slate-200 hover:bg-[#141E2E] transition"
            >
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          const buttonContent = (
            <button
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-sm font-mono text-xs transition cursor-pointer ${
                isActive
                  ? 'bg-[#0F1622] text-slate-100 border border-[#2A3B52] shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0B1017] border border-transparent'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <motion.div
                  layoutId="activeWorkspaceBar"
                  className="absolute left-0 top-1 bottom-1 w-1 bg-cyan-400 rounded-r-sm shadow-[0_0_8px_rgba(0,240,255,0.7)]"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              {/* Number Index */}
              <span
                className={`text-[10px] font-bold tracking-wider ${
                  isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-400'
                } ${isCollapsed ? 'hidden' : 'inline-block'}`}
              >
                {item.number}
              </span>

              {/* Icon */}
              <Icon
                className={`w-4 h-4 shrink-0 transition ${
                  isActive ? item.accentColor : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />

              {/* Text Label */}
              {!isCollapsed && (
                <span className="truncate tracking-wide font-semibold text-[11px]">
                  {item.label}
                </span>
              )}

              {/* Badge Counter */}
              {item.badge !== undefined && !isCollapsed && (
                <span className="ml-auto text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-[#070A0F] border border-[#1E2A3B] text-slate-400 group-hover:text-slate-300">
                  {item.badge}
                </span>
              )}
            </button>
          );

          if (isCollapsed) {
            return (
              <Skiper43
                key={item.id}
                content={`${item.number} ${item.label}: ${item.tooltip}`}
                shortcut={item.shortcut}
                side="right"
              >
                {buttonContent}
              </Skiper43>
            );
          }

          return <div key={item.id}>{buttonContent}</div>;
        })}
      </div>

      {/* Lower Rail Meta Details */}
      <div className="p-2.5 border-t border-[#1E2A3B] bg-[#070A0F]/80 space-y-2 font-mono text-[9.5px]">
        {!isCollapsed ? (
          <>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                SCADA INGESTION
              </span>
              <span className="font-bold text-slate-200">10 Hz</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                TWIN MODEL
              </span>
              <span className="font-bold text-cyan-300">PINN v4</span>
            </div>
            <div className="text-[9px] text-slate-400 pt-1 border-t border-[#1E2A3B]/60 truncate">
              BAGHEWALA &bull; RAJASTHAN
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-1.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          </div>
        )}
      </div>
    </aside>
  );
};

export default WorkspaceRail;
