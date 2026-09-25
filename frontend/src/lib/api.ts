import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export interface MediaUpload {
  id: string;
  file: string;
  file_url: string;
  file_type: 'image' | 'audio' | 'video' | 'file';
  mime_type: string;
  original_name: string;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  sender: 'user' | 'bot' | 'system';
  content: string;
  media?: MediaUpload | null;
  is_rejected?: boolean;
  created_at: string;
}

export interface Diagnosis {
  id: number;
  session_id: string;
  issue_summary: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence?: string;
  symptoms_detected?: string;
  possible_cause?: string;
  recommended_action?: string;
  recommended_repair: string;
  estimated_cost: string;
  estimated_time: string;
  created_at: string;
}

export interface ChatSession {
  session_id: string;
  car_make: string;
  car_model: string;
  car_year: string;
  status: 'active' | 'diagnosed' | 'booked';
  messages: ChatMessage[];
  diagnosis?: Diagnosis | null;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  booking_id: string;
  session?: string;
  diagnosis?: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  car_company: string;
  car_model: string;
  vehicle_info: string;
  vehicle_problem: string;
  service_requested: string;
  preferred_date: string;
  preferred_time: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

export const api = {
  // Session operations
  createSession: async (vehicle?: { car_make?: string; car_model?: string; car_year?: string }) => {
    const res = await axios.post<ChatSession>(`${API_BASE_URL}/sessions/`, vehicle || {});
    return res.data;
  },

  getSession: async (sessionId: string) => {
    const res = await axios.get<ChatSession>(`${API_BASE_URL}/chat/${sessionId}/`);
    return res.data;
  },

  getSessions: async () => {
    const res = await axios.get<ChatSession[]>(`${API_BASE_URL}/sessions/`);
    return res.data;
  },

  // POST /api/chat/
  sendMessage: async (data: {
    session_id?: string;
    message: string;
    media_id?: string;
    car_make?: string;
    car_model?: string;
    car_year?: string;
  }) => {
    const res = await axios.post<{
      session_id: string;
      reply: string;
      is_rejected: boolean;
      user_message: ChatMessage;
      bot_message: ChatMessage;
      diagnosis?: Diagnosis | null;
      session_status: string;
    }>(`${API_BASE_URL}/chat/`, data);
    return res.data;
  },

  // POST /api/upload/
  uploadMedia: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post<MediaUpload>(`${API_BASE_URL}/upload/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // POST /api/diagnosis/
  requestDiagnosis: async (sessionId: string) => {
    const res = await axios.post<Diagnosis>(`${API_BASE_URL}/diagnosis/`, { session_id: sessionId });
    return res.data;
  },

  // POST /api/booking/
  createBooking: async (bookingData: {
    session_id?: string;
    diagnosis_id?: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    car_company?: string;
    car_model?: string;
    vehicle_info?: string;
    vehicle_problem?: string;
    service_requested?: string;
    preferred_date: string;
    preferred_time?: string;
    notes?: string;
  }) => {
    const res = await axios.post<Booking>(`${API_BASE_URL}/booking/`, bookingData);
    return res.data;
  },

  // GET /api/booking/{id}/
  getBooking: async (bookingId: string) => {
    const res = await axios.get<Booking>(`${API_BASE_URL}/booking/${bookingId}/`);
    return res.data;
  },
};
