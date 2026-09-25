'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Car, Wrench, ShieldAlert, Bot, User, Loader2, Play, Image as ImageIcon, Volume2, Film, AlertCircle, RefreshCw, Plus } from 'lucide-react';
import { MediaUploader } from './MediaUploader';
import { DiagnosisCard } from './DiagnosisCard';
import { ChatSession, ChatMessage, MediaUpload, Diagnosis, api } from '../lib/api';

interface ChatInterfaceProps {
  session: ChatSession | null;
  onSendMessage: (text: string, mediaId?: string) => Promise<void>;
  onBookClick: () => void;
  onNewChat: () => void;
  isLoading: boolean;
  onVehicleUpdate: (make: string, model: string, year: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  session,
  onSendMessage,
  onBookClick,
  onNewChat,
  isLoading,
  onVehicleUpdate,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaUpload | null>(null);

  // Vehicle selector state
  const [make, setMake] = useState(session?.car_make || '');
  const [model, setModel] = useState(session?.car_model || '');
  const [year, setYear] = useState(session?.car_year || '');
  const [showVehicleEditor, setShowVehicleEditor] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session) {
      setMake(session.car_make || '');
      setModel(session.car_model || '');
      setYear(session.car_year || '');
    }
  }, [session]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages, isLoading]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedMedia) || isLoading) return;

    const textToSend = inputText.trim();
    const mediaIdToSend = selectedMedia?.id;

    setInputText('');
    setSelectedMedia(null);

    await onSendMessage(textToSend, mediaIdToSend);
  };

  const saveVehicleInfo = (e: React.FormEvent) => {
    e.preventDefault();
    onVehicleUpdate(make, model, year);
    setShowVehicleEditor(false);
  };

  // Helper to render media attachment inside chat bubble
  const renderMediaContent = (media?: MediaUpload | null) => {
    if (!media) return null;

    const fileUrl = media.file_url || media.file;

    if (media.file_type === 'image') {
      return (
        <div className="mt-2 rounded-lg overflow-hidden border border-slate-700 max-w-sm">
          <img src={fileUrl} alt={media.original_name || 'Car photo'} className="w-full max-h-60 object-cover" />
        </div>
      );
    }

    if (media.file_type === 'audio') {
      return (
        <div className="mt-2 p-2 bg-slate-900/80 rounded-lg border border-slate-700 flex items-center gap-2 max-w-xs">
          <Volume2 className="w-5 h-5 text-sky-400 shrink-0" />
          <audio controls src={fileUrl} className="w-full h-8 text-xs" />
        </div>
      );
    }

    if (media.file_type === 'video') {
      return (
        <div className="mt-2 rounded-lg overflow-hidden border border-slate-700 max-w-sm">
          <video controls src={fileUrl} className="w-full max-h-60 bg-black" />
        </div>
      );
    }

    return (
      <div className="mt-2 p-2 bg-slate-900/80 rounded-lg border border-slate-700 flex items-center gap-2 text-xs">
        <Film className="w-4 h-4 text-amber-400" />
        <a href={fileUrl} target="_blank" rel="noreferrer" className="underline text-sky-300 truncate">
          {media.original_name || 'Download Media File'}
        </a>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent text-slate-100 relative z-10">
      {/* Top Header Bar */}
      <header className="p-4 bg-slate-900/85 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-xl text-slate-950 font-bold shadow-lg">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-100 text-sm sm:text-base">
                {session?.car_make && session?.car_model
                  ? `${session.car_year || ''} ${session.car_make} ${session.car_model}`
                  : 'Select Vehicle Information'}
              </h2>
              <button
                onClick={() => setShowVehicleEditor(!showVehicleEditor)}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-medium"
              >
                <Wrench className="w-3 h-3" />
                <span>{showVehicleEditor ? 'Close' : 'Edit Vehicle'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Senior Mechanic Agent • {session?.status === 'booked' ? 'Appointment Confirmed' : session?.status === 'diagnosed' ? 'Diagnosis Ready' : 'Active Troubleshooting'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewChat}
            className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-amber-400 border border-amber-500/30 text-xs font-semibold py-2 px-3.5 rounded-lg shadow backdrop-blur-sm transition-colors"
            title="Start a new troubleshooting chat"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          <button
            onClick={onBookClick}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs py-2 px-3.5 rounded-lg shadow-md transition-all transform hover:scale-[1.02]"
            title="Book a certified mechanic appointment"
          >
            <Wrench className="w-4 h-4" />
            <span>Book Mechanic</span>
          </button>
        </div>
      </header>

      {/* Vehicle Info Editor Accordion */}
      {showVehicleEditor && (
        <form onSubmit={saveVehicleInfo} className="bg-slate-900/90 border-b border-slate-800 p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs backdrop-blur-md">
          <div>
            <label className="block text-slate-400 mb-1">Make</label>
            <input
              type="text"
              placeholder="e.g. Toyota"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded p-2 text-white"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Model</label>
            <input
              type="text"
              placeholder="e.g. Camry"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded p-2 text-white"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Year</label>
            <input
              type="text"
              placeholder="e.g. 2020"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded p-2 text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold p-2 rounded transition-colors shadow"
            >
              Save Vehicle Info
            </button>
          </div>
        </form>
      )}

      {/* Main Chat Conversation Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Welcome Banner */}
        <div className="bg-slate-900/75 border border-slate-800/80 rounded-2xl p-4 text-center max-w-xl mx-auto my-2 backdrop-blur-md shadow-xl">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400 mx-auto mb-2 shadow">
            <Wrench className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-200 text-sm">Virtual Car Mechanic Assistant</h3>
          <p className="text-xs text-slate-400 mt-1">
            Describe your car problem (noises, warning lights, fluid leaks, braking issues) or upload photos, videos, and sound clips of the issue.
          </p>
        </div>

        {/* Message Thread */}
        {session?.messages?.map((msg) => {
          const isUser = msg.sender === 'user';
          const isRejected = msg.is_rejected;

          return (
            <div
              key={msg.id || Math.random()}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                  isUser
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : isRejected
                    ? 'bg-red-900 text-red-300 border border-red-700'
                    : 'bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-bold'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : isRejected ? <AlertCircle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble Content */}
              <div
                className={`max-w-[85%] sm:max-w-xl rounded-2xl px-4 py-3 text-sm shadow-xl backdrop-blur-md ${
                  isUser
                    ? 'bg-amber-600/90 text-slate-950 font-medium rounded-tr-none border border-amber-500/50'
                    : isRejected
                    ? 'bg-red-950/85 border border-red-800 text-red-200 rounded-tl-none'
                    : 'bg-slate-900/85 border border-slate-800 text-slate-100 rounded-tl-none'
                }`}
              >
                {/* Off-topic Rejection Tag */}
                {isRejected && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400 mb-1.5 pb-1 border-b border-red-900">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Non-Automotive Query Filtered</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

                {renderMediaContent(msg.media)}

                <div className={`mt-1.5 text-[10px] opacity-70 text-right ${isUser ? 'text-slate-900' : 'text-slate-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Diagnostic Assessment Card Rendered directly in conversation ONLY for automotive queries */}
        {(() => {
          const msgs = session?.messages || [];
          const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
          const isRejectedMsg = lastMsg?.is_rejected || (lastMsg?.content && lastMsg.content.includes("I am a Senior Automobile Technician specializing in vehicle diagnostics"));

          if (session?.diagnosis && !isRejectedMsg) {
            return (
              <div className="flex justify-start pl-11">
                <DiagnosisCard
                  diagnosis={session.diagnosis}
                  onBookClick={onBookClick}
                  isBooked={session.status === 'booked'}
                />
              </div>
            );
          }
          return null;
        })()}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-9 h-9 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2.5 text-xs text-amber-300 shadow-lg backdrop-blur-md">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span className="font-medium">Analyzing vehicle symptoms & diagnostic database...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Interactive Message Input Bar */}
      <footer className="p-4 bg-slate-900/90 border-t border-slate-800/80 backdrop-blur-md">
        <form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto flex flex-col gap-2.5">
          {/* Interactive Quick Diagnostic Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Wrench className="w-3 h-3 text-amber-400" />
              <span>Quick Issues:</span>
            </span>
            {[
              { label: '🔥 Overheating / Steam', text: 'Engine overheating with temperature gauge high and steam from hood.' },
              { label: '🛑 Squealing / Grinding Brakes', text: 'Brakes are squealing and grinding when pressing the brake pedal.' },
              { label: '🔋 Dead Battery / No Start', text: 'Car battery is dead, turning key makes a clicking sound.' },
              { label: '⚙️ Check Engine Light On', text: 'Check engine light illuminated on dashboard and idling rough.' },
              { label: '💨 Flat Tyre / Steering Shake', text: 'Steering wheel shaking violently and tyre tread worn unevenly.' },
            ].map((chip, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSendMessage(chip.text)}
                disabled={isLoading}
                className="shrink-0 bg-slate-950/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/60 text-slate-300 hover:text-amber-300 text-xs py-1.5 px-3 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm backdrop-blur-sm"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Media upload toolbar / preview */}
          <MediaUploader
            onMediaUploaded={(media) => setSelectedMedia(media)}
            onClearMedia={() => setSelectedMedia(null)}
            selectedMedia={selectedMedia}
          />

          <div className="flex items-center gap-2 bg-slate-950/90 border-2 border-slate-800 rounded-2xl p-2 focus-within:border-amber-500/80 shadow-inner backdrop-blur-sm transition-all duration-300">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleFormSubmit(e);
                }
              }}
              placeholder="Describe your car problem or click a quick issue chip above..."
              rows={1}
              className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm px-3 py-1.5 focus:outline-none resize-none max-h-24"
            />

            <button
              type="submit"
              disabled={(!inputText.trim() && !selectedMedia) || isLoading}
              className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-black rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.7)] transition-all duration-300 transform hover:scale-105 active:scale-95 shrink-0"
            >
              <Send className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
};
