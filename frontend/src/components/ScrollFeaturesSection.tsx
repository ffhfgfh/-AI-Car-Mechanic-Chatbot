'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Activity, ShieldCheck, Wrench, Sparkles, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

interface ScrollFeaturesSectionProps {
  onStartDiagnosis: () => void;
}

const features = [
  {
    icon: Activity,
    title: 'Acoustic Sound Analyzer',
    subtitle: 'Multimodal Audio Intelligence',
    description: 'Upload audio or video clips of knockings, squeals, or rattles. Our AI spectrum engine isolates engine frequencies to detect bearing wear and belt slippage.',
    badge: 'Audio AI',
    color: 'from-amber-500/20 to-red-500/20',
    borderColor: 'border-amber-500/40',
    accentColor: 'text-amber-400',
    stat: '99.8%',
    statLabel: 'Frequency Precision',
  },
  {
    icon: Cpu,
    title: 'Dashboard & OBD-II Vision',
    subtitle: 'Instant Warning Light Decoder',
    description: 'Snap a photo of dashboard warning lights, check engine icons, or damaged parts. Neural vision models immediately cross-reference OEM technical manuals.',
    badge: 'Visual Vision',
    color: 'from-cyan-500/20 to-blue-500/20',
    borderColor: 'border-cyan-500/40',
    accentColor: 'text-cyan-400',
    stat: '< 2 Turns',
    statLabel: 'Follow-Up Accuracy',
  },
  {
    icon: ShieldCheck,
    title: 'Non-Automotive Guardrails',
    subtitle: 'Strict Mechanical Focus',
    description: 'Built exclusively for vehicle diagnostics. Irrelevant or non-car queries are instantly detected and gracefully redirected to vehicle troubleshooting.',
    badge: 'Guardrail Safe',
    color: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/40',
    accentColor: 'text-emerald-400',
    stat: '100%',
    statLabel: 'Safety Compliant',
  },
  {
    icon: Wrench,
    title: 'Instant Mechanic Booking',
    subtitle: 'Direct Workshop Dispatch',
    description: 'Transform AI diagnoses directly into service bookings with preferred dates, vehicle profiles, and automatic tracking references (e.g. BK-A9F321).',
    badge: 'Direct Booking',
    color: 'from-red-500/20 to-pink-500/20',
    borderColor: 'border-red-500/40',
    accentColor: 'text-red-400',
    stat: '24/7',
    statLabel: 'Active Scheduling',
  },
];

export const ScrollFeaturesSection: React.FC<ScrollFeaturesSectionProps> = ({ onStartDiagnosis }) => {
  return (
    <section className="relative py-28 px-6 bg-slate-950 text-white overflow-hidden border-t border-slate-800">
      {/* Dynamic Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Scroll Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto mb-20 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-widest backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Diagnostics Engine
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-100 uppercase">
            Built for <span className="bg-gradient-to-r from-red-500 via-amber-400 to-cyan-400 bg-clip-text text-transparent">Senior Mechanics</span> & Car Owners
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Powered by advanced multimodal intelligence, real-time diagnostic reasoning, and strict non-automotive guardrails to get your vehicle back on the road safely.
          </p>
        </motion.div>

        {/* Scroll-Triggered Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: 'easeOut' }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className={`relative group rounded-3xl bg-slate-900/80 border ${feature.borderColor} p-6 flex flex-col justify-between backdrop-blur-xl shadow-2xl overflow-hidden hover:border-slate-400/50 transition-all`}
              >
                {/* Top Subtle Gradient Light Beam */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                <div>
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className={`p-3 rounded-2xl bg-slate-800/90 border border-slate-700 ${feature.accentColor} shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-100 mb-1 tracking-tight group-hover:text-white transition-colors relative z-10">
                    {feature.title}
                  </h3>
                  <p className={`text-xs font-semibold ${feature.accentColor} mb-3 relative z-10`}>
                    {feature.subtitle}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6 relative z-10">
                    {feature.description}
                  </p>
                </div>

                {/* Stat Metric Footer */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between relative z-10">
                  <div>
                    <span className={`text-xl font-black ${feature.accentColor} block leading-none`}>
                      {feature.stat}
                    </span>
                    <span className="text-[10px] text-slate-400 tracking-wide font-medium">
                      {feature.statLabel}
                    </span>
                  </div>
                  <CheckCircle2 className={`w-4 h-4 ${feature.accentColor}`} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Scroll CTA Strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <button
            onClick={onStartDiagnosis}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:shadow-[0_0_35px_rgba(239,68,68,0.8)] hover:scale-105 transition-all"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
            Launch AI Vehicle Inspector
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
