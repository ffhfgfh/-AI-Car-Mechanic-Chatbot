'use client';

import React from 'react';
import { PlusCircle, MessageSquare, Wrench, Calendar, CheckCircle2, Car, ChevronRight, X } from 'lucide-react';
import { ChatSession } from '../lib/api';

interface HistorySidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  isOpen,
  onClose,
}) => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-40 w-72 bg-slate-950/70 backdrop-blur-md border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-sm">AutoMechanic AI</h1>
              <p className="text-[11px] text-slate-400">Virtual Technician Agent</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Troubleshooting Session Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewSession();
              onClose();
            }}
            className="w-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent hover:from-amber-500/30 hover:to-amber-500/20 text-amber-300 border border-amber-500/50 hover:border-amber-400 font-bold py-2.5 px-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_15px_rgba(245,158,11,0.15)] group"
          >
            <PlusCircle className="w-4 h-4 text-amber-400 group-hover:rotate-90 transition-transform duration-300" />
            <span className="uppercase tracking-wider">New Diagnosis Session</span>
          </button>
        </div>

        {/* History Sessions List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2.5">
          <div className="text-[10px] font-extrabold text-amber-400/90 uppercase tracking-widest px-2 py-1 flex items-center gap-1.5">
            <Car className="w-3 h-3 text-amber-400" />
            <span>Recent Diagnoses & History</span>
          </div>

          {sessions.length === 0 ? (
            <div className="text-xs text-slate-500 text-center py-6 px-2 italic">
              No previous conversation history found.
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.session_id === activeSessionId;
              const hasDiag = !!session.diagnosis;
              const isBooked = session.status === 'booked';
              const title = session.car_make && session.car_model 
                ? `${session.car_year || ''} ${session.car_make} ${session.car_model}`.trim()
                : `Troubleshooting #${session.session_id.substring(0, 6)}`;

              return (
                <button
                  key={session.session_id}
                  onClick={() => {
                    onSelectSession(session.session_id);
                    onClose();
                  }}
                  className={`w-full text-left p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between group transform hover:-translate-y-0.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-slate-800/90 via-slate-850/90 to-slate-800/90 border-amber-500/80 text-white shadow-[0_0_20px_rgba(245,158,11,0.2)] backdrop-blur-md'
                      : 'bg-slate-900/50 border-slate-800/60 text-slate-300 hover:bg-slate-850/70 hover:border-slate-700/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-2 rounded-xl shrink-0 ${
                      isBooked ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]' :
                      hasDiag ? 'bg-amber-950/80 text-amber-400 border border-amber-700/80 shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'bg-slate-800/80 text-slate-400'
                    }`}>
                      {isBooked ? <Calendar className="w-4 h-4 animate-pulse" /> :
                       hasDiag ? <Wrench className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <p className={`font-bold text-xs truncate leading-tight group-hover:text-amber-300 transition-colors ${isActive ? 'text-amber-400' : ''}`}>
                        {title}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5 flex items-center gap-1 font-mono">
                        {isBooked ? <span className="text-emerald-400 font-bold">Booked</span> :
                         hasDiag ? <span className="text-amber-400 font-bold">Diag: {session.diagnosis?.severity?.toUpperCase()}</span> : 'In Progress'}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 shrink-0 text-slate-500 transition-all duration-200 ${isActive ? 'text-amber-400 translate-x-1' : 'group-hover:translate-x-1 group-hover:text-amber-300'}`} />
                </button>
              );
            })
          )}
        </div>

      </aside>
    </>
  );
};
