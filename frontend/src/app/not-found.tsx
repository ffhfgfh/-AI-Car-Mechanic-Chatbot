'use client';

import React from 'react';
import Link from 'next/link';
import { Wrench, ArrowLeft, Car } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-red-600/20 border border-red-500/40 flex items-center justify-center mx-auto shadow-2xl shadow-red-900/40">
          <Wrench className="w-12 h-12 text-red-500 animate-pulse" />
        </div>
      </div>

      <h1 className="text-6xl font-black tracking-tight text-white mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-300 mb-4">Diagnostic Route Not Found</h2>
      <p className="text-sm text-slate-400 max-w-md mb-8">
        The automotive technician page you are looking for has been moved, removed, or never existed in the garage system.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-red-900/30"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Garage Home
        </Link>
      </div>
    </div>
  );
}
