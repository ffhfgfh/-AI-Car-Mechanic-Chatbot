# 🚗 AutoMechanic AI — Senior Automobile Technician Chatbot

A full-stack, AI-powered Virtual Automobile Mechanic web platform built for vehicle diagnostics, multimodal media analysis (dashboard lights, engine noises, damage photos/videos), 2-turn diagnostic follow-up questions, non-automotive query guardrails, and instant certified mechanic booking.

---

## 🌟 Key Features

### 🏎️ Frontend (Next.js 14 + Tailwind CSS + Framer Motion)
- **Senior Mechanic AI Persona**: Simulates an experienced ASE-certified master technician providing structured automotive troubleshooting.
- **Scroll-Triggered Animations**:
  - **Top Scroll Progress Indicator**: Glowing luxury gradient progress bar tracking page depth.
  - **Parallax Background Scrolling**: Smooth vertical parallax on the **2023 Dodge Challenger SRT Hellcat** hero visual.
  - **Scroll-Triggered Feature Showcase**: Animated cards (`Acoustic Sound Spectrum`, `OBD-II Vision Decoder`, `Non-Automotive Guardrail`, `Instant Dispatch`) with staggered entrance and live metrics.
  - **3-Step Repair Workflow**: Interactive journey steps that illuminate sequentially on scroll.
  - **Floating Scroll Quick Action**: `⚡ Start AI Diagnosis` floating pill that appears after scrolling past the hero section.
- **Shelby Mustang Eleanor GT500 Background**: Dark glassmorphism chat studio floating over an iconic Mustang GT500 sunset background photo.
- **Multimodal Uploads**: Analyze photos of dashboard warning lights, videos of idling engines, or audio recordings of unusual noises.
- **Structured Diagnosis & Booking**: Generates an interactive `DiagnosisCard` (Problem, Severity, Repair Steps, Est. Cost) with a 1-click **Book Mechanic** scheduling workflow.
- **Conversation History**: Full session sidebar tracking diagnostic status (`In Progress`, `Diag Ready`, `Booked`).

### ⚙️ Backend (Python 3.10+ + Django REST Framework + SQLite)
- **All 5 Core Minimum REST APIs**: Fully implemented, tested, and verified (`POST /api/chat/`, `POST /api/upload/`, `POST /api/diagnosis/`, `POST /api/booking/`, `GET /api/booking/{id}/`).
- **Strict Non-Automotive Guardrails**: Intercepts off-topic queries (coding, cooking, general knowledge) and politely redirects users to vehicle troubleshooting without wasting AI tokens.
- **Multimodal AI Service**: Integrated with Google GenAI / DeepSeek models for technical automotive reasoning.

---

## 📁 Project Structure

```
project1/
├── backend/                  # Django REST Framework Backend
│   ├── api/                  # Django App (Views, Models, AI Service, Tests)
│   ├── car_mechanic_backend/ # Project Configuration & Settings
│   ├── manage.py             # Django CLI Manager
│   └── requirements.txt      # Python Dependencies
├── frontend/                 # Next.js 14 React Frontend
│   ├── src/
│   │   ├── app/              # Next.js App Router (page.tsx, layout.tsx)
│   │   ├── components/       # UI Components (LuxuryHero, ChatDrawer, ScrollFeatures, etc.)
│   │   └── lib/              # API Client (api.ts)
│   ├── public/images/        # High-res car photography assets
│   └── package.json          # Node.js Dependencies
└── docs/                     # Documentation Specifications
    ├── API_DOCUMENTATION.md  # Detailed OpenAPI REST Specs
    └── ARCHITECTURE.md       # Architectural System Strategy
```

---

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed on your system:

- **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **npm**: `v9.0.0` or higher
- **Python**: `v3.10` or higher ([Download Python](https://www.python.org/))
- **Git**: ([Download Git](https://git-scm.com/))

---

## 🛠️ Step-by-Step Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/ffhfgfh/-AI-Car-Mechanic-Chatbot.git
cd -AI-Car-Mechanic-Chatbot
```

---

### 2. Backend Setup (Django)

```bash
# Navigate to the backend directory
cd backend

# (Optional but recommended) Create and activate a Python virtual environment
# On Windows (PowerShell):
python -m venv venv
.\venv\Scripts\Activate.ps1

# On Linux/macOS:
# python3 -m venv venv
# source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# (Optional) Add your Gemini API Key in .env (Fallback logic works automatically if omitted)
# GEMINI_API_KEY=your_gemini_api_key_here

# Run Django database migrations
python manage.py makemigrations api
python manage.py migrate

# Run Backend Unit Tests (Verifies all 7 test cases)
python manage.py test api

# Start Django backend server on port 8000
python manage.py runserver 127.0.0.1:8000
```

The Django REST backend server will be running live at `http://127.0.0.1:8000/api/`.

---

### 3. Frontend Setup (Next.js)

Open a new terminal window:

```bash
# Navigate to the frontend directory
cd frontend

# Install Node modules
npm install

# Start Next.js development server
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.

---

### 4. Running Production Build

To build and serve the optimized production bundle locally:

```bash
cd frontend

# Build production bundle
npm run build

# Start production server on port 3000
npm run start -- -p 3000
```

---

## 📡 REST API Reference

All backend endpoints are hosted under `/api/`:

| Method | Endpoint Path | Description | Request Payload | Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/chat/` | Send message & receive AI technician response / 2-turn questions | `{ session_id, message, media_id, car_make, car_model, car_year }` | `200 OK` (Message Object) |
| `POST` | `/api/upload/` | Upload multimodal file (photo/video/audio) | `Multipart FormData` (file, file_type) | `201 Created` (Media Object) |
| `POST` | `/api/diagnosis/` | Generate structured diagnostic breakdown | `{ session_id }` | `200 OK` (Diagnosis Card JSON) |
| `POST` | `/api/booking/` | Reserve mechanic appointment | `{ car_company, car_model, vehicle_problem, preferred_date, preferred_time }` | `201 Created` (Booking Details) |
| `GET` | `/api/booking/{id}/` | Fetch booking confirmation by database ID or code (e.g. `BK-A9F321`) | `URL Parameter` | `200 OK` (Booking Details) |

---

## 🧪 Running Automated Unit Tests

To run the full suite of automated Django unit tests:

```bash
cd backend
python manage.py test api
```

**Test Coverage Highlights**:
1. ✅ Non-automotive off-topic query filtering.
2. ✅ Car diagnostic chat session persistence.
3. ✅ Multimodal media upload processing.
4. ✅ Diagnostic assessment card generation.
5. ✅ Mechanic service appointment creation and retrieval by booking code.

---

## 📄 License & Attribution

- Built for Virtual Automotive Diagnostics & Mechanic Dispatching.
- Car photography assets property of respective OEMs.
- © 2026 AutoMechanic AI Studio.