'use client';

import React, { useState } from 'react';
import { ChevronRight, Maximize2, Sparkles, Wrench, RotateCcw } from 'lucide-react';
import dynamic from 'next/dynamic';

const Car3DViewer = dynamic(
  () => import('./Car3DViewer').then((mod) => mod.Car3DViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[380px] bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center text-slate-400 text-xs font-semibold">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading 3D Vehicle Inspector...</span>
        </div>
      </div>
    ),
  }
);

interface Interactive3DSectionProps {
  onOpenBooking: () => void;
  onStartDiagnosis: (promptText?: string) => void;
}

export const Interactive3DSection: React.FC<Interactive3DSectionProps> = ({
  onOpenBooking,
  onStartDiagnosis,
}) => {
  const [activeModel, setActiveModel] = useState('Dodge Challenger SRT');
  const [selected3DPart, setSelected3DPart] = useState<string | null>(null);

  const timelineModels = [
    { name: 'Dodge Challenger SRT', year: '2023' },
    { name: 'Batista 2019', year: '2019' },
    { name: 'Cisitalia 2010', year: '2010' },
  ];

  const handleComponentSelect = (partName: string, promptText: string) => {
    setSelected3DPart(partName);
    onStartDiagnosis(promptText);
  };

  return (
    <section id="3d-inspector" className="w-full bg-slate-50 text-slate-900 py-20 px-6 border-t border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-md">
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 font-serif">
              Timeless Design
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              With energizing performance derived from optimized aerodynamics and precision mechanical engineering.
            </p>
          </div>

          {/* Timeline Model Links */}
          <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-wider">
            {timelineModels.map((m) => {
              const isSelected = activeModel === m.name;
              return (
                <button
                  key={m.name}
                  onClick={() => setActiveModel(m.name)}
                  className={`pb-1 border-b-2 transition-all ${
                    isSelected
                      ? 'border-red-600 text-red-600 font-extrabold'
                      : 'border-transparent text-slate-400 hover:text-slate-800'
                  }`}
                >
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center 3D Interactive Model Canvas surrounded by Red Orbit Ring */}
        <div className="relative rounded-3xl bg-slate-950 border border-slate-800 p-4 shadow-2xl h-[450px] flex flex-col justify-between overflow-hidden">
          {/* Decorative Red Orbit Dotted Ring Graphic Overlay */}
          <div className="absolute inset-4 rounded-full border-2 border-dashed border-red-600/30 pointer-events-none animate-[spin_60s_linear_infinite]"></div>

          <Car3DViewer
            onSelectComponent={handleComponentSelect}
            selectedComponent={selected3DPart}
          />
        </div>

        {/* Bottom Specs & Action Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-4 border-t border-slate-200">
          <div className="space-y-1 max-w-md">
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 font-serif">
              {activeModel}
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              This car perfectly restrains elegance in a simple way with flawless technical details and real-time AI mechanical diagnostics.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenBooking}
              className="group bg-red-600 hover:bg-slate-900 text-white font-bold text-xs uppercase px-6 py-3.5 rounded-lg shadow-lg flex items-center gap-3 transition-all"
            >
              <span>Apply Now / Book Mechanic</span>
              <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ChevronRight className="w-3.5 h-3.5 text-white" />
              </div>
            </button>

            <button
              onClick={() => onStartDiagnosis()}
              className="p-3 bg-slate-900 hover:bg-red-600 text-white rounded-lg shadow transition-colors"
              title="Full-screen AI Diagnostic Assistant"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
