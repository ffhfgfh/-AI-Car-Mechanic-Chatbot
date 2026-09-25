'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Calendar, ArrowUp } from 'lucide-react';

interface FloatingScrollCTAProps {
  onOpenChat: () => void;
  onOpenBooking: () => void;
}

export const FloatingScrollCTA: React.FC<FloatingScrollCTAProps> = ({
  onOpenChat,
  onOpenBooking,
}) => {
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setShowCTA(true);
      } else {
        setShowCTA(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {showCTA && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3"
        >
          {/* Scroll To Top Button */}
          <button
            onClick={scrollToTop}
            title="Scroll to top"
            className="p-3.5 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 shadow-xl backdrop-blur-md transition-all hover:scale-110"
          >
            <ArrowUp className="w-4 h-4" />
          </button>

          {/* Book Mechanic Quick Pill */}
          <button
            onClick={onOpenBooking}
            className="hidden sm:flex items-center gap-2 px-4 py-3 rounded-full bg-slate-900/90 border border-emerald-500/40 text-emerald-400 font-bold text-xs shadow-xl backdrop-blur-md hover:bg-slate-800 transition-all hover:scale-105"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Book Mechanic</span>
          </button>

          {/* Start AI Diagnosis Main Glowing Pill */}
          <button
            onClick={onOpenChat}
            className="flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(239,68,68,0.6)] hover:shadow-[0_0_35px_rgba(239,68,68,0.9)] hover:scale-105 transition-all backdrop-blur-md"
          >
            <Bot className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>⚡ Start AI Diagnosis</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
