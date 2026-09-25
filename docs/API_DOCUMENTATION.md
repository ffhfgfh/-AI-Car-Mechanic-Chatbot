# REST API Documentation - AI Car Mechanic Chatbot

This document details the REST APIs implemented in the Django REST Framework backend for the **AI Car Mechanic Chatbot** platform.

Base URL: `http://localhost:8000/api`

---

## Required Minimum Endpoints

### 1. Send Chat Message & Process Intent
`POST /api/chat/`

Submits a message or uploaded media item to the virtual mechanic chatbot. Evaluates query intent locally using a rule-based domain filter to reject off-topic non-car queries before calling the Gemini API.

#### Request Body (JSON):
```json
{
  "session_id": "8f3a1b02-5c4d-4e29-91a7-123456789abc",
  "message": "My brakes are squealing and grinding when coming to a complete stop.",
  "media_id": "optional-uuid-of-uploaded-media",
  "car_make": "Toyota",
  "car_model": "Camry",
  "car_year": "2020"
}
```

#### Response (200 OK):
```json
{
  "session_id": "8f3a1b02-5c4d-4e29-91a7-123456789abc",
  "reply": "Brake squealing or grinding usually points to worn brake pads, rotor scoring, or sticking calipers...",
  "is_rejected": false,
  "user_message": {
    "id": 1,
    "sender": "user",
    "content": "My brakes are squealing...",
    "created_at": "2026-09-23T19:00:00Z"
  },
  "bot_message": {
    "id": 2,
    "sender": "bot",
    "content": "Brake squealing or grinding...",
    "is_rejected": false,
    "created_at": "2026-09-23T19:00:02Z"
  },
  "diagnosis": {
    "id": 1,
    "session_id": "8f3a1b02-5c4d-4e29-91a7-123456789abc",
    "issue_summary": "Worn Front Brake Pads & Rotor Resurfacing",
    "severity": "high",
    "recommended_repair": "Replace front brake pads and inspect rotors",
    "estimated_cost": "$180 - $350",
    "estimated_time": "1.5 hours"
  },
  "session_status": "diagnosed"
}
```

#### Off-Topic Rejection Response (200 OK):
When user asks a non-car question (e.g. "How do I make chocolate cake?"):
```json
{
  "session_id": "8f3a1b02-5c4d-4e29-91a7-123456789abc",
  "reply": "I am a Senior Automobile Technician specializing in vehicle diagnostics... I can only assist with car and vehicle-related queries.",
  "is_rejected": true,
  "diagnosis": null,
  "session_status": "active"
}
```

---

### 2. Media Upload (Images, Audio, Video)
`POST /api/upload/`

Uploads an image (JPG/PNG), audio recording (WAV/MP3/WebM), or video clip (MP4/WebM) to media storage.

#### Request Headers:
`Content-Type: multipart/form-data`

#### Request Body:
`file`: Binary media file

#### Response (201 Created):
```json
{
  "id": "c9284f1a-3d2e-4b5c-[uuid]",
  "file": "/media/chat_uploads/2026/09/23/engine_noise.webm",
  "file_url": "http://localhost:8000/media/chat_uploads/2026/09/23/engine_noise.webm",
  "file_type": "audio",
  "mime_type": "audio/webm",
  "original_name": "engine_noise.webm",
  "created_at": "2026-09-23T19:05:00Z"
}
```

---

### 3. Generate / Retrieve Diagnosis
`POST /api/diagnosis/`

Explicitly generates or retrieves a diagnostic assessment summary for an active session.

#### Request Body (JSON):
```json
{
  "session_id": "8f3a1b02-5c4d-4e29-91a7-123456789abc",
  "issue_summary": "Worn Brake Pads & Scored Rotors",
  "severity": "high",
  "recommended_repair": "Front brake pad replacement and rotor machining",
  "estimated_cost": "$220 - $320",
  "estimated_time": "1.5 hours"
}
```

#### Response (200 OK):
```json
{
  "id": 1,
  "session_id": "8f3a1b02-5c4d-4e29-91a7-123456789abc",
  "issue_summary": "Worn Brake Pads & Scored Rotors",
  "severity": "high",
  "recommended_repair": "Front brake pad replacement and rotor machining",
  "estimated_cost": "$220 - $320",
  "estimated_time": "1.5 hours",
  "created_at": "2026-09-23T19:06:00Z"
}
```

---

### 4. Create Mechanic Booking
`POST /api/booking/`

Creates a new certified mechanic appointment linked to a chat session or diagnosis.

#### Request Body (JSON):
```json
{
  "session_id": "8f3a1b02-5c4d-4e29-91a7-123456789abc",
  "customer_name": "Jane Smith",
  "customer_email": "jane.smith@example.com",
  "customer_phone": "+1 (555) 234-5678",
  "vehicle_info": "2020 Toyota Camry",
  "service_requested": "Front Brake Pad Replacement",
  "preferred_date": "2026-09-25",
  "preferred_time": "10:00 AM",
  "notes": "Please call 30 minutes before arrival."
}
```

#### Response (201 Created):
```json
{
  "booking_id": "b1f8e329-90a1-4321-88ef-999999999999",
  "session": "8f3a1b02-5c4d-4e29-91a7-123456789abc",
  "customer_name": "Jane Smith",
  "customer_email": "jane.smith@example.com",
  "customer_phone": "+1 (555) 234-5678",
  "vehicle_info": "2020 Toyota Camry",
  "service_requested": "Front Brake Pad Replacement",
  "preferred_date": "2026-09-25",
  "preferred_time": "10:00 AM",
  "notes": "Please call 30 minutes before arrival.",
  "status": "confirmed",
  "created_at": "2026-09-23T19:07:00Z"
}
```

---

### 5. Get Booking Details
`GET /api/booking/{id}/`

Retrieves a specific mechanic booking record by booking ID.

#### Response (200 OK):
```json
{
  "booking_id": "b1f8e329-90a1-4321-88ef-999999999999",
  "customer_name": "Jane Smith",
  "customer_email": "jane.smith@example.com",
  "customer_phone": "+1 (555) 234-5678",
  "vehicle_info": "2020 Toyota Camry",
  "service_requested": "Front Brake Pad Replacement",
  "preferred_date": "2026-09-25",
  "preferred_time": "10:00 AM",
  "status": "confirmed",
  "created_at": "2026-09-23T19:07:00Z"
}
```
