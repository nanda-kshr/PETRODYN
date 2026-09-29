'use client';

import React, { useState } from 'react';
import {
  Flame,
  LayoutGrid,
  Activity,
  Cpu,
  Sliders,
  ShieldCheck,
  Glasses,
  Compass,
  Radio,
  Sparkles,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type SiteNavId =
  | 'home'
  | 'dashboard'
  | 'digital-twin'
  | 'optimization'
  | 'data-quality'
  | 'vr-simulator'
  | 'baghewala';

interface SiteNavbarProps {
  currentView: SiteNavId;
  onNavigate: (view: SiteNavId) => void;
  isConnected?: boolean;
  isFxEnabled?: boolean;
  onToggleFx?: () => void;
}

interface NavItem {
  id: SiteNavId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isHot?: boolean;
}

export const SiteNavbar: React.FC<SiteNavbarProps> = ({
  currentView,
  onNavigate,
  isConnected = true,
  isFxEnabled = true,
  onToggleFx,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Flame },
    { id: 'dashboard', label: 'Live Dashboard', icon: LayoutGrid, isHot: true },
    { id: 'digital-twin', label: 'Digital Twin', icon: Cpu },
    { id: 'optimization', label: 'Optimization', icon: Sliders },
    { id: 'data-quality', label: 'Data Quality', icon: ShieldCheck },
    { id: 'vr-simulator', label: 'VR Simulator', icon: Glasses },
    { id: 'baghewala', label: 'Baghewala Field', icon: Compass },
  ];

  const handleNavClick = (id: SiteNavId) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#070A0F]/90 backdrop-blur-xl border-b border-[#1E2A3B] transition-all">
      <div className="max-w-[1780px] mx-auto px-3 sm:px-5 h-12 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 group cursor-pointer text-left"
          >
            <div className="w-7 h-7 rounded-sm bg-gradient-to-br from-cyan-500/20 via-sky-500/10 to-transparent border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              <Flame className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-bold tracking-wider text-slate-100 group-hover:text-cyan-300 transition-colors">
                  THERMO-LIFT
                </span>
                <span className="hidden sm:inline-block text-[8.5px] font-mono px-1 rounded-sm bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-semibold uppercase tracking-wider">
                  WELL-TO-SURFACE
                </span>
              </div>
              <span className="text-[9px] font-mono text-slate-400 hidden md:block">
                Baghewala Heavy Oil CSS-SRP Twin
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-mono text-xs transition cursor-pointer ${
                  isActive
                    ? 'text-cyan-300 bg-[#0F1622] border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0F1622]/60 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.isHot && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping ml-0.5" />
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeSiteNavIndicator"
                    className="absolute -bottom-[9px] left-2 right-2 h-0.5 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action and Telemetry Status */}
        <div className="flex items-center gap-2.5">
          {/* Quick Dashboard Action if on other pages */}
          {currentView !== 'dashboard' && (
            <button
              type="button"
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-mono font-bold bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 transition active:scale-95 shadow-[0_0_12px_rgba(6,182,212,0.15)] cursor-pointer"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Launch Console</span>
            </button>
          )}

          {/* SCADA Status */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-sm bg-[#0B1017] border border-[#1E2A3B] text-[9.5px] font-mono text-slate-300">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            <span className="text-slate-400">{isConnected ? 'SCADA 10Hz' : 'OFFLINE'}</span>
          </div>

          {/* FX Toggle */}
          {onToggleFx && (
            <button
              type="button"
              onClick={onToggleFx}
              aria-label="Toggle visual shaders"
              className={`hidden md:flex items-center gap-1 px-2 py-1 rounded-sm text-[9.5px] font-mono border transition cursor-pointer ${
                isFxEnabled
                  ? 'bg-[#0F1622] border-cyan-500/40 text-cyan-300'
                  : 'bg-[#070A0F] border-[#1E2A3B] text-slate-400'
              }`}
            >
              <Sparkles className={`w-3 h-3 ${isFxEnabled ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{isFxEnabled ? 'FX' : 'NO-FX'}</span>
            </button>
          )}

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="lg:hidden p-1.5 rounded-sm bg-[#0F1622] border border-[#1E2A3B] text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#070A0F]/95 border-b border-[#1E2A3B] px-4 py-3 space-y-1 font-mono text-xs"
          >
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-sm transition ${
                    isActive
                      ? 'bg-[#0F1622] text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#0B1017]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.isHot && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      LIVE
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default SiteNavbar;
