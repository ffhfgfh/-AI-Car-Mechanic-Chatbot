'use client';

import React from 'react';
import { Car, Wrench, MessageSquare, Box } from 'lucide-react';

interface HeaderNavProps {
  onOpenChat: () => void;
  onOpen3D: () => void;
  onOpenBooking: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  onOpenChat,
  onOpen3D,
  onOpenBooking,
}) => {
  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-6 py-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wider text-slate-700 uppercase">
          <a href="#about" className="hover:text-red-600 transition-colors">About</a>
          <a href="#design-dna" className="hover:text-red-600 transition-colors">Design DNA</a>
          <button onClick={onOpenChat} className="hover:text-red-600 transition-colors flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5 text-red-500" /> AI Diagnostic Studio
          </button>
        </nav>

        {/* Center Logo */}
        <div className="flex flex-col items-center group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="relative flex items-center justify-center">
            <div className="w-10 h-6 border-b-2 border-slate-900 rounded-b-full relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping absolute -top-1"></span>
              <Car className="w-5 h-5 text-slate-900 z-10" />
            </div>
          </div>
          <span className="font-extrabold text-sm tracking-widest uppercase mt-1 text-slate-900 group-hover:text-red-600 transition-colors">
            AUTOMECHANIC <span className="text-red-600">AI</span>
          </span>
        </div>

        {/* Right Nav Links & AI Launcher */}
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wider text-slate-700 uppercase">
            <a href="#partners" className="hover:text-red-600 transition-colors">Partners</a>
            <button onClick={onOpenBooking} className="hover:text-red-600 transition-colors flex items-center gap-1">
              <Wrench className="w-3.5 h-3.5 text-red-500" /> Book Mechanic
            </button>
          </nav>

          <button
            onClick={onOpenChat}
            className="bg-slate-900 hover:bg-red-600 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
          >
            <MessageSquare className="w-4 h-4 text-red-400" />
            <span>AI Diagnostic Agent</span>
          </button>
        </div>
      </div>
    </header>
  );
};
