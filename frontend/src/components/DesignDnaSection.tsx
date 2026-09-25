'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Play, Film } from 'lucide-react';

interface DesignDnaSectionProps {
  onOpen3D: () => void;
  onStartDiagnosis: () => void;
}

export const DesignDnaSection: React.FC<DesignDnaSectionProps> = ({
  onOpen3D,
  onStartDiagnosis,
}) => {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  return (
    <section id="design-dna" className="w-full bg-white text-slate-900 py-20 px-6 border-t border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Design DNA */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-4 space-y-6"
        >
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 font-serif">
            Design DNA
          </h2>

          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            We believe that the purest creations are those where the design, the driving experience, the passenger experience, and engineering all play an equal role.
          </p>

          <button
            onClick={onStartDiagnosis}
            className="group bg-red-600 hover:bg-slate-900 text-white font-bold text-xs uppercase px-5 py-3 rounded-lg shadow flex items-center gap-3 transition-all"
          >
            <span>Our System</span>
            <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ChevronRight className="w-3.5 h-3.5 text-white" />
            </div>
          </button>
        </motion.div>

        {/* Center Column: Supercar Image with Circular "Play Video" Overlay */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-5 relative group"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 aspect-[4/3] bg-slate-900 flex items-center justify-center">
            {isPlayingVideo ? (
              <div className="w-full h-full bg-slate-950 p-6 flex flex-col items-center justify-center text-center text-white space-y-4">
                <Film className="w-12 h-12 text-red-600 animate-pulse" />
                <h4 className="font-bold text-sm">Vehicle Inspection Video Demonstration</h4>
                <p className="text-xs text-slate-400">Showing multi-point diagnostic telemetry and acoustic frequency analysis.</p>
                <button
                  onClick={() => setIsPlayingVideo(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-4 py-2 rounded-lg"
                >
                  Close Video
                </button>
              </div>
            ) : (
              <>
                {/* Real Supercar Background Photo */}
                <img
                  src="/images/supercar-dna.jpg"
                  alt="Supercar Design DNA"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Circular "Play Video" Button (Matches red ring overlay design) */}
                <button
                  onClick={() => setIsPlayingVideo(true)}
                  className="absolute bottom-6 left-6 w-24 h-24 rounded-full border-2 border-red-600 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center text-red-600 shadow-2xl group-hover:scale-110 transition-all cursor-pointer"
                >
                  <Play className="w-6 h-6 fill-red-600 text-red-600 ml-1" />
                  <span className="text-[10px] font-extrabold uppercase mt-1 tracking-wider">Play Video</span>
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Right Column: "Beautiful From Every Angle." */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="lg:col-span-3 space-y-6"
        >
          <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-snug font-serif">
            Beautiful From Every Angle.
          </h3>

          <button
            onClick={onOpen3D}
            className="group bg-red-600 hover:bg-slate-900 text-white font-bold text-xs uppercase px-5 py-3 rounded-lg shadow flex items-center gap-3 transition-all"
          >
            <span>Visit Gallery</span>
            <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ChevronRight className="w-3.5 h-3.5 text-white" />
            </div>
          </button>
        </motion.div>
      </div>
    </section>
  );
};
