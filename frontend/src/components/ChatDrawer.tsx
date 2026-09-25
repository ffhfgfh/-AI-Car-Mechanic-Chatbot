'use client';

import React, { useState } from 'react';
import { X, Wrench, MessageSquare, Plus, Car, History } from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { HistorySidebar } from './HistorySidebar';
import { ChatSession, Booking } from '../lib/api';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onSendMessage: (text: string, mediaId?: string) => Promise<void>;
  onBookClick: () => void;
  isLoading: boolean;
  onVehicleUpdate: (make: string, model: string, year: string) => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSession,
  onSelectSession,
  onNewSession,
  onSendMessage,
  onBookClick,
  isLoading,
  onVehicleUpdate,
}) => {
  const [showHistory, setShowHistory] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md transition-opacity">
      <div className="w-full max-w-6xl h-full bg-slate-950 flex flex-col relative shadow-2xl animate-in slide-in-from-right duration-300 overflow-hidden">
        {/* Real Mustang Shelby GT500 Background Photo */}
        <img
          src="/images/chatbot-bg.jpg"
          alt="Chatbot Mustang Background"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 pointer-events-none"
        />

        {/* Ambient Dark Gradient & Glass Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/80 pointer-events-none" />

        {/* Drawer Header Bar */}
        <div className="relative z-10 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex items-center justify-between text-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 text-slate-300 hover:text-amber-400 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-medium backdrop-blur-sm"
              title="Toggle Conversation History"
            >
              <History className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">History ({sessions.length})</span>
            </button>
            <div className="p-2 bg-red-600 rounded-lg text-white font-bold hidden sm:block shadow-md">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white uppercase tracking-wider">AI Car Mechanic Diagnostic Studio</h2>
              <p className="text-[11px] text-slate-400">Senior Technician Agent • Virtual Vehicle Diagnostics</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-xl transition-colors backdrop-blur-sm"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area with History Sidebar */}
        <div className="relative z-10 flex-1 flex overflow-hidden">
          <HistorySidebar
            sessions={sessions}
            activeSessionId={currentSession?.session_id || null}
            onSelectSession={onSelectSession}
            onNewSession={onNewSession}
            isOpen={showHistory}
            onClose={() => setShowHistory(false)}
          />

          <ChatInterface
            session={currentSession}
            onSendMessage={onSendMessage}
            onBookClick={onBookClick}
            onNewChat={onNewSession}
            isLoading={isLoading}
            onVehicleUpdate={onVehicleUpdate}
          />
        </div>
      </div>
    </div>
  );
};
