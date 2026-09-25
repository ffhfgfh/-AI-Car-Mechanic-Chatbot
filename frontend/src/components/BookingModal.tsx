'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, User, Mail, Phone, Car, Wrench, CheckCircle, Loader2 } from 'lucide-react';
import { api, Diagnosis, Booking } from '../lib/api';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
  diagnosis?: Diagnosis | null;
  carMake?: string;
  carModel?: string;
  vehicleInfo?: string;
  onBookingCreated: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  sessionId,
  diagnosis,
  carMake,
  carModel,
  vehicleInfo,
  onBookingCreated,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [carCompanyInput, setCarCompanyInput] = useState(carMake || 'Toyota');
  const [carModelInput, setCarModelInput] = useState(carModel || 'Camry');
  const [vehicleProblemInput, setVehicleProblemInput] = useState(
    diagnosis?.issue_summary || 'Vehicle Mechanical / Diagnostic Inspection'
  );
  const [preferredDate, setPreferredDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [preferredTime, setPreferredTime] = useState('10:00 AM');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !customerPhone || !preferredDate || !carCompanyInput || !carModelInput) {
      setError('Please fill in all required contact, car company, car model, and appointment date fields.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const booking = await api.createBooking({
        session_id: sessionId,
        diagnosis_id: diagnosis?.id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        car_company: carCompanyInput,
        car_model: carModelInput,
        vehicle_info: vehicleInfo || `${carCompanyInput} ${carModelInput}`,
        vehicle_problem: vehicleProblemInput,
        service_requested: diagnosis?.recommended_repair || vehicleProblemInput,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        notes,
      });

      onBookingCreated(booking);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit mechanic booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 bg-amber-500/20 border border-amber-500/50 rounded-xl text-amber-400">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Book Certified Mechanic</h2>
            <p className="text-xs text-slate-400">Reserve a repair slot with an authorized technician</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-950/70 border border-red-800 text-red-300 text-xs rounded-lg">
            {error}
          </div>
        )}

        {diagnosis && (
          <div className="mt-4 p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs">
            <span className="text-amber-400 font-semibold block">Diagnosed Service:</span>
            <span className="text-slate-200 block font-medium mt-0.5">{diagnosis.recommended_repair}</span>
            <div className="flex gap-4 mt-2 text-slate-400">
              <span>Est. Cost: <strong className="text-emerald-400">{diagnosis.estimated_cost}</strong></span>
              <span>Est. Time: <strong className="text-sky-400">{diagnosis.estimated_time}</strong></span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-sm">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number *</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Car Company Name *</label>
              <div className="relative">
                <Car className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={carCompanyInput}
                  onChange={(e) => setCarCompanyInput(e.target.value)}
                  placeholder="e.g. Toyota, Honda, Ford, BMW"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Car Model *</label>
              <div className="relative">
                <Car className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={carModelInput}
                  onChange={(e) => setCarModelInput(e.target.value)}
                  placeholder="e.g. Camry, Civic, Mustang"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Problem Facing in Vehicle *</label>
            <div className="relative">
              <Wrench className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={vehicleProblemInput}
                onChange={(e) => setVehicleProblemInput(e.target.value)}
                placeholder="e.g. Engine Overheating, Transmission Slipping, Squeaky Brakes"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Preferred Date *</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="date"
                  required
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Preferred Time Slot</label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Additional Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Please check tire pressures as well."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Reservation...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Confirm Booking</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
