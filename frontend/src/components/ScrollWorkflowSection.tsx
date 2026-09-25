'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquarePlus, Stethoscope, CalendarCheck, CheckCircle } from 'lucide-react';

interface ScrollWorkflowSectionProps {
  onStartDiagnosis: () => void;
  onOpenBooking: () => void;
}

const steps = [
  {
    step: '01',
    icon: MessageSquarePlus,
    title: 'Input Car Symptoms or Upload Media',
    description: 'Describe engine noises, warning lights, brake issues, or upload dash photos and audio clips.',
    tag: 'Step 1 - Symptom Log',
    color: 'from-amber-500 to-red-500',
    accentText: 'text-amber-400',
    borderColor: 'border-amber-500/30',
  },
  {
    step: '02',
    icon: Stethoscope,
    title: 'Senior AI Technician Analysis',
    description: 'Our AI engine asks relevant follow-up questions (Make, Model, Mileage, Fuel Type) before delivering an accurate diagnosis.',
    tag: 'Step 2 - 2-Turn Diagnostic',
    color: 'from-cyan-500 to-blue-500',
    accentText: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
  },
  {
    step: '03',
    icon: CalendarCheck,
    title: 'Structured Diagnosis & Mechanic Booking',
    description: 'Receive a full DiagnosisCard with estimated urgency and book a physical shop inspection with a single click.',
    tag: 'Step 3 - Instant Dispatch',
    color: 'from-emerald-500 to-teal-500',
    accentText: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
  },
];

export const ScrollWorkflowSection: React.FC<ScrollWorkflowSectionProps> = ({
  onStartDiagnosis,
  onOpenBooking,
}) => {
  return (
    <section className="relative py-28 px-6 bg-slate-900 text-white border-t border-slate-800 overflow-hidden">
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-20 space-y-3"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-red-500 bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20">
            Seamless Workflow
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
            3-Step AI Automotive Repair Journey
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            From initial symptom input to certified mechanic dispatch in less than two minutes.
          </p>
        </motion.div>

        {/* Workflow Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className={`relative rounded-3xl bg-slate-950/80 border ${s.borderColor} p-8 flex flex-col justify-between backdrop-blur-xl shadow-2xl group hover:border-slate-400/50 transition-all`}
              >
                {/* Glowing Top Number Badge */}
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className={`text-4xl font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>
                      {s.step}
                    </span>
                    <div className={`p-3 rounded-2xl bg-slate-900 border border-slate-800 ${s.accentText}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-slate-900 text-slate-400 border border-slate-800 mb-4 inline-block">
                    {s.tag}
                  </span>

                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-amber-300 transition-colors">
                    {s.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {s.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-900 flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <CheckCircle className={`w-4 h-4 ${s.accentText}`} />
                  <span>Verified Operational Flow</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Action Button Strip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={onStartDiagnosis}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-sm uppercase tracking-wider shadow-lg hover:brightness-110 hover:scale-105 transition-all"
          >
            Start Diagnostic Chat
          </button>
          <button
            onClick={onOpenBooking}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm uppercase tracking-wider transition-all"
          >
            Schedule Mechanic Booking Directly
          </button>
        </motion.div>
      </div>
    </section>
  );
};
