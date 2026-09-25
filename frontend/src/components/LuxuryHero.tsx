'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';

interface LuxuryHeroProps {
  onStartDiagnosis: () => void;
  onOpen3D: () => void;
}

export const LuxuryHero: React.FC<LuxuryHeroProps> = ({
  onStartDiagnosis,
  onOpen3D,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-15%']);

  return (
    <section
      ref={containerRef}
      id="about"
      className="relative w-full bg-slate-50 text-slate-900 pt-12 pb-20 px-6 overflow-hidden"
    >
      {/* Red Accent Graphic Stripes (Top Left & Bottom Left) */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute top-16 left-0 w-32 h-3 bg-red-600 -rotate-12 transform -translate-x-8 shadow-sm pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute top-24 left-0 w-44 h-3 bg-red-600 -rotate-12 transform -translate-x-12 shadow-sm pointer-events-none"
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Heading */}
        <motion.div
          style={{ y: textY }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="lg:col-span-5 space-y-6"
        >
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.05] text-slate-900 font-serif">
            Pure. Rare.<br />
            <span className="text-red-600">Beautiful.</span>
          </h1>

          <div className="flex items-center gap-3 pt-2">
            <span className="w-8 h-0.5 bg-red-600"></span>
            <p className="text-xs uppercase font-bold tracking-widest text-slate-500">
              Next-Gen Automotive AI Troubleshooting
            </p>
          </div>
        </motion.div>

        {/* Center Dodge Challenger Visual & Schematic Card */}
        <div className="lg:col-span-7 relative flex flex-col items-center justify-center">
          {/* Top Right Year & Model Label */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute top-0 right-4 text-right z-10"
          >
            <span className="text-4xl font-black text-red-600 tracking-tight">2023</span>
            <span className="text-sm font-extrabold text-slate-900 ml-2 uppercase tracking-wider">
              Dodge Challenger SRT
            </span>
          </motion.div>

          {/* Dodge Challenger Display Card with Photo Background & Scroll Parallax */}
          <motion.div
            onClick={onOpen3D}
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
            className="w-full h-80 sm:h-96 rounded-3xl border-2 border-slate-200 shadow-2xl relative flex flex-col items-center justify-center group cursor-pointer overflow-hidden transform hover:-translate-y-1.5 transition-all duration-300"
          >
            {/* Real Dodge Challenger Background Photo with Scroll Parallax */}
            <motion.img
              style={{ y: imageY }}
              src="/images/dodge-challenger.jpg"
              alt="2023 Dodge Challenger SRT"
              className="absolute inset-0 w-full h-[125%] object-cover object-center group-hover:scale-105 transition-transform duration-700 -top-[12%]"
            />

            {/* Subtle Gradient & Blueprint Grid Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-slate-900/10 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>

            {/* Technical Measurement Overlay Line */}
            <div className="absolute bottom-16 left-6 right-6 hidden sm:flex items-center justify-between text-white text-xs font-mono font-bold tracking-widest drop-shadow-lg pointer-events-none">
              <span className="bg-slate-950/80 px-3 py-1 rounded-lg border border-slate-700/80 backdrop-blur-md">
                WHEELBASE 2,950 MM
              </span>
              <span className="bg-red-600/90 text-white px-3 py-1 rounded-lg font-black uppercase shadow">
                SRT HELLCAT V8
              </span>
            </div>

            {/* Floating Interactive Badge */}
            <div className="absolute bottom-4 left-6 bg-slate-950/90 text-white text-xs font-bold px-4 py-2.5 rounded-2xl flex items-center gap-2.5 shadow-2xl backdrop-blur-md border border-slate-700 group-hover:border-red-500 transition-colors">
              <Sparkles className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>Click to Launch AI Dodge Challenger Diagnostics</span>
            </div>
          </motion.div>

          {/* Bottom Right Description & CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-200"
          >
            <p className="text-xs text-slate-600 max-w-sm leading-relaxed font-medium">
              We have a truly global team of the most illustrious design innovators and master automobile diagnostic engineers.
            </p>

            <button
              onClick={onStartDiagnosis}
              className="group bg-red-600 hover:bg-slate-900 text-white font-bold text-xs uppercase px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all shrink-0"
            >
              <span>Start AI Diagnosis</span>
              <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ChevronRight className="w-4 h-4 text-white" />
              </div>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
