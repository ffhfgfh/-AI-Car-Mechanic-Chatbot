'use client';

import React, { useState, useEffect } from 'react';
import { HeaderNav } from '../components/HeaderNav';
import { LuxuryHero } from '../components/LuxuryHero';
import { DesignDnaSection } from '../components/DesignDnaSection';
import { ScrollProgress } from '../components/ScrollProgress';
import { ScrollFeaturesSection } from '../components/ScrollFeaturesSection';
import { ScrollWorkflowSection } from '../components/ScrollWorkflowSection';
import { FloatingScrollCTA } from '../components/FloatingScrollCTA';
import { ChatDrawer } from '../components/ChatDrawer';
import { BookingModal } from '../components/BookingModal';
import { CheckCircle, Car, ShieldCheck } from 'lucide-react';
import { api, ChatSession, Booking } from '../lib/api';

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingSuccessAlert, setBookingSuccessAlert] = useState<Booking | null>(null);

  // Fetch past sessions on page mount
  useEffect(() => {
    loadSessionsAndInitialize();
  }, []);

  const loadSessionsAndInitialize = async () => {
    try {
      const fetchedSessions = await api.getSessions();
      setSessions(fetchedSessions);

      if (fetchedSessions.length > 0) {
        const active = await api.getSession(fetchedSessions[0].session_id);
        setCurrentSession(active);
      } else {
        await handleNewSession();
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
      await handleNewSession();
    }
  };

  const handleNewSession = async () => {
    setIsLoading(true);
    try {
      const newSession = await api.createSession();
      setCurrentSession(newSession);
      const updatedList = await api.getSessions();
      setSessions(updatedList);
    } catch (err) {
      console.error('Failed to create new session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const sessionData = await api.getSession(sessionId);
      setCurrentSession(sessionData);
    } catch (err) {
      console.error('Failed to load selected session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text: string, mediaId?: string) => {
    if (!currentSession) return;

    setIsLoading(true);
    try {
      const response = await api.sendMessage({
        session_id: currentSession.session_id,
        message: text,
        media_id: mediaId,
        car_make: currentSession.car_make,
        car_model: currentSession.car_model,
        car_year: currentSession.car_year,
      });

      const updatedSession = await api.getSession(response.session_id);
      setCurrentSession(updatedSession);

      const updatedSessions = await api.getSessions();
      setSessions(updatedSessions);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVehicleUpdate = async (make: string, model: string, year: string) => {
    if (!currentSession) return;
    try {
      const updated = await api.createSession({
        car_make: make,
        car_model: model,
        car_year: year,
      });
      setCurrentSession(updated);
    } catch (err) {
      console.error('Failed to update vehicle details:', err);
    }
  };

  const handleBookingCreated = (booking: Booking) => {
    setBookingSuccessAlert(booking);
    if (currentSession) {
      handleSelectSession(currentSession.session_id);
    }
    setTimeout(() => {
      setBookingSuccessAlert(null);
    }, 8000);
  };

  const handleStartDiagnosisWithPrompt = async (promptText?: string) => {
    setIsChatDrawerOpen(true);
    if (promptText) {
      await handleSendMessage(promptText);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-red-600 selection:text-white">
      {/* Top Scroll Progress Indicator */}
      <ScrollProgress />

      {/* Top Header Navigation */}
      <HeaderNav
        onOpenChat={() => setIsChatDrawerOpen(true)}
        onOpen3D={() => setIsChatDrawerOpen(true)}
        onOpenBooking={() => setIsBookingModalOpen(true)}
      />

      {/* Success Alert Banner for Booking */}
      {bookingSuccessAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-950/95 border-2 border-emerald-500 text-emerald-100 px-6 py-4 rounded-2xl shadow-2xl flex items-start gap-4 max-w-lg w-full backdrop-blur-md animate-bounce">
          <CheckCircle className="w-7 h-7 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-sm block text-emerald-300">Appointment Successfully Confirmed!</span>
            <div className="text-slate-200">
              <span className="block font-semibold">🚘 Company & Model: <strong className="text-emerald-300">{bookingSuccessAlert.car_company} {bookingSuccessAlert.car_model}</strong></span>
              <span className="block font-semibold">📅 Selected Date: <strong className="text-sky-300">{bookingSuccessAlert.preferred_date} ({bookingSuccessAlert.preferred_time})</strong></span>
              <span className="block font-semibold">🔧 Vehicle Problem: <strong className="text-amber-300">{bookingSuccessAlert.vehicle_problem}</strong></span>
            </div>
            <span className="block text-[11px] text-slate-400 pt-1">Booking ID: <code className="bg-emerald-900 font-mono px-2 py-0.5 rounded text-white">{bookingSuccessAlert.booking_id}</code></span>
          </div>
        </div>
      )}

      {/* Main Luxury Landing Page Sections with Scroll Triggers */}
      <main>
        {/* 1. Hero Section with Scroll Parallax & Dodge Challenger Visual */}
        <LuxuryHero
          onStartDiagnosis={() => handleStartDiagnosisWithPrompt()}
          onOpen3D={() => setIsChatDrawerOpen(true)}
        />

        {/* 2. Scroll-Triggered Vehicle Diagnostic Feature Grid */}
        <ScrollFeaturesSection
          onStartDiagnosis={() => handleStartDiagnosisWithPrompt()}
        />

        {/* 3. Design DNA Section */}
        <DesignDnaSection
          onOpen3D={() => setIsChatDrawerOpen(true)}
          onStartDiagnosis={() => handleStartDiagnosisWithPrompt()}
        />

        {/* 4. Interactive 3-Step Scroll Workflow */}
        <ScrollWorkflowSection
          onStartDiagnosis={() => handleStartDiagnosisWithPrompt()}
          onOpenBooking={() => setIsBookingModalOpen(true)}
        />
      </main>

      {/* Footer Section */}
      <footer className="w-full bg-slate-900 text-slate-400 text-xs py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg text-white font-bold">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-white tracking-widest uppercase text-sm">
                AUTOMECHANIC <span className="text-red-600">AI</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">Virtual Automotive Diagnostics & Mechanic Booking Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <span>© 2026 AutoMechanic AI Studio</span>
          </div>
        </div>
      </footer>

      {/* Sliding AI Car Mechanic Assistant Drawer Panel */}
      <ChatDrawer
        isOpen={isChatDrawerOpen}
        onClose={() => setIsChatDrawerOpen(false)}
        sessions={sessions}
        currentSession={currentSession}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onSendMessage={handleSendMessage}
        onBookClick={() => setIsBookingModalOpen(true)}
        isLoading={isLoading}
        onVehicleUpdate={handleVehicleUpdate}
      />

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        sessionId={currentSession?.session_id}
        diagnosis={currentSession?.diagnosis}
        carMake={currentSession?.car_make}
        carModel={currentSession?.car_model}
        vehicleInfo={
          currentSession?.car_make
            ? `${currentSession.car_year || ''} ${currentSession.car_make} ${currentSession.car_model}`.trim()
            : undefined
        }
        onBookingCreated={handleBookingCreated}
      />

      {/* Floating Scroll Quick-Action Pill */}
      <FloatingScrollCTA
        onOpenChat={() => setIsChatDrawerOpen(true)}
        onOpenBooking={() => setIsBookingModalOpen(true)}
      />
    </div>
  );
}
