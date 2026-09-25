'use client';

import React from 'react';
import { Wrench, CalendarCheck, AlertTriangle, ShieldAlert, CheckCircle2, DollarSign, Clock, Sparkles } from 'lucide-react';
import { Diagnosis } from '../lib/api';

interface DiagnosisCardProps {
  diagnosis: Diagnosis;
  onBookClick: () => void;
  isBooked?: boolean;
}

export const DiagnosisCard: React.FC<DiagnosisCardProps> = ({ diagnosis, onBookClick, isBooked = false }) => {
  const confidenceStr = diagnosis.confidence || '78%';
  const issueStr = diagnosis.issue_summary || 'Brake Pad Wear';
  const causeStr = diagnosis.possible_cause || 'Brake pads may be worn down to metal indicators or rotors scored.';
  const actionStr = diagnosis.recommended_action || 'Inspect brake pads and brake rotors immediately.';
  const repairStr = diagnosis.recommended_repair || 'Brake inspection / pad replacement';
  
  const symptomsRaw = diagnosis.symptoms_detected || '✓ Grinding noise\n✓ Noise while braking\n✓ Reduced braking performance';
  const symptomsList = symptomsRaw
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);

  const getUrgencyBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return (
          <span className="bg-gradient-to-r from-red-950 to-rose-950 border border-red-500 text-red-200 font-extrabold px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>⚠️ CRITICAL (Do Not Drive)</span>
          </span>
        );
      case 'high':
        return (
          <span className="bg-gradient-to-r from-amber-950 to-amber-900 border border-amber-500/80 text-amber-200 font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs shadow-[0_0_12px_rgba(245,158,11,0.3)]">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>⚠️ High Urgency</span>
          </span>
        );
      case 'medium':
        return (
          <span className="bg-gradient-to-r from-sky-950 to-blue-950 border border-sky-500/60 text-sky-200 font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs shadow-[0_0_10px_rgba(56,189,248,0.2)]">
            <AlertTriangle className="w-4 h-4 text-sky-400 shrink-0" />
            <span>⚡ Medium Urgency</span>
          </span>
        );
      default:
        return (
          <span className="bg-gradient-to-r from-emerald-950 to-teal-950 border border-emerald-500/60 text-emerald-200 font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>🟢 Low Urgency</span>
          </span>
        );
    }
  };

  return (
    <div className="my-5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/80 rounded-3xl p-6 shadow-[0_0_40px_rgba(245,158,11,0.2)] text-slate-100 max-w-xl font-sans relative overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500 group">
      {/* Animated Top Light Beam Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-500 animate-pulse" />

      {/* Top Header Row */}
      <div className="border-b border-amber-500/30 pb-4 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 border border-amber-400/50 rounded-2xl text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-amber-400 text-base tracking-wide uppercase flex items-center gap-1.5">
                <span>🔧 Vehicle Diagnosis</span>
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">ASE Certified Technician Assessment</span>
          </div>
        </div>

        <div>
          {getUrgencyBadge(diagnosis.severity)}
        </div>
      </div>

      {/* Main Structured Details List */}
      <div className="space-y-3.5 text-xs sm:text-sm">
        {/* Possible Issue */}
        <div className="bg-slate-900/90 border border-slate-800/90 p-4 rounded-2xl shadow-inner group-hover:border-amber-500/40 transition-colors">
          <span className="text-amber-400 text-xs font-extrabold uppercase tracking-wider block mb-1">
            Possible Issue:
          </span>
          <p className="font-extrabold text-white text-lg tracking-tight drop-shadow-sm">{issueStr}</p>
        </div>

        {/* Confidence Rating */}
        <div className="bg-slate-900/90 border border-slate-800/90 p-3.5 rounded-2xl flex items-center justify-between">
          <span className="text-slate-400 text-xs font-extrabold uppercase tracking-wider">
            Confidence:
          </span>
          <span className="font-black text-emerald-400 text-base px-3.5 py-1 bg-emerald-950/90 border border-emerald-500/60 rounded-xl shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            {confidenceStr}
          </span>
        </div>

        {/* Symptoms Detected */}
        <div className="bg-slate-900/90 border border-slate-800/90 p-4 rounded-2xl">
          <span className="text-amber-400 text-xs font-extrabold uppercase tracking-wider block mb-2.5">
            Symptoms Detected:
          </span>
          <ul className="space-y-2 text-slate-200 font-semibold">
            {symptomsList.map((symptom, idx) => (
              <li key={idx} className="flex items-start gap-2.5 bg-slate-950/60 p-2 rounded-xl border border-slate-800/50">
                <span className="text-emerald-400 font-bold shrink-0 text-sm">✓</span>
                <span className="text-slate-200">{symptom.replace(/^✓\s*/, '')}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Possible Cause */}
        <div className="bg-slate-900/90 border border-slate-800/90 p-3.5 rounded-2xl">
          <span className="text-slate-400 text-xs font-extrabold uppercase tracking-wider block mb-1">
            Possible Cause:
          </span>
          <p className="text-slate-200 font-medium leading-relaxed">{causeStr}</p>
        </div>

        {/* Recommended Action */}
        <div className="bg-slate-900/90 border border-slate-800/90 p-3.5 rounded-2xl">
          <span className="text-slate-400 text-xs font-extrabold uppercase tracking-wider block mb-1">
            Recommended Action:
          </span>
          <p className="text-slate-200 font-medium leading-relaxed">{actionStr}</p>
        </div>

        {/* Urgency Level Row */}
        <div className="bg-slate-900/90 border border-slate-800/90 p-3.5 rounded-2xl flex items-center justify-between">
          <span className="text-slate-400 text-xs font-extrabold uppercase tracking-wider">
            Urgency:
          </span>
          <div>
            {getUrgencyBadge(diagnosis.severity)}
          </div>
        </div>

        {/* Estimated Repair & Pricing Grid */}
        <div className="bg-slate-900/90 border border-amber-500/50 p-4 rounded-2xl space-y-3 shadow-md">
          <div>
            <span className="text-amber-400 text-xs font-extrabold uppercase tracking-wider block">
              Estimated Repair:
            </span>
            <p className="font-extrabold text-white text-base mt-0.5">{repairStr}</p>
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-slate-800 text-xs font-bold">
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-800/80">
              <DollarSign className="w-4 h-4" />
              <span>Est. Cost: <strong className="text-white">{diagnosis.estimated_cost}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-sky-400 bg-sky-950/80 px-3 py-1.5 rounded-xl border border-sky-800/80">
              <Clock className="w-4 h-4" />
              <span>Est. Time: <strong className="text-white">{diagnosis.estimated_time}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Interactive CTA Button */}
      <div className="pt-4 mt-5 border-t border-amber-500/30">
        {isBooked ? (
          <div className="w-full bg-gradient-to-r from-emerald-950 to-teal-950 border border-emerald-500 text-emerald-300 font-bold text-xs py-3.5 px-4 rounded-2xl text-center flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <CalendarCheck className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span>Mechanic Appointment Scheduled</span>
          </div>
        ) : (
          <button
            onClick={onBookClick}
            className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm py-4 px-6 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:shadow-[0_0_40px_rgba(245,158,11,0.8)] flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-amber-300 uppercase tracking-wider"
          >
            <CalendarCheck className="w-5 h-5 text-slate-950" />
            <span>[ Book Mechanic ]</span>
          </button>
        )}
      </div>
    </div>
  );
};
