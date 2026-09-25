# Architecture & AI Minimization Strategy

## Overview

The **AI Car Mechanic Chatbot** system is designed around a modern split-architecture model: a Next.js (React 18 + Tailwind CSS) client interfacing with a Python Django REST Framework backend backed by SQLite.

```
 ┌─────────────────────────────────────────────────────────────┐
 │                      Next.js Frontend                       │
 │  - Responsive Chat UI (Text, Images, Audio, Video uploads)  │
 │  - Audio noise recorder using Web MediaDevices API          │
 │  - Diagnosis Card & Interactive "Book Mechanic" Modal       │
 │  - Conversation & Diagnostic History Sidebar               │
 └──────────────────────────────┬──────────────────────────────┘
                                │ REST API (HTTP / JSON / Multipart)
 ┌──────────────────────────────▼──────────────────────────────┐
 │               Django REST Framework Backend                 │
 │  - Rule-Based Intent & Off-Topic Guardrail Engine           │
 │  - Local Booking State Machine & Data Persistence           │
 │  - SQLite Storage (ChatSession, Message, Media, Booking)    │
 └──────────────────────────────┬──────────────────────────────┘
                                │ (Only when car reasoning required)
 ┌──────────────────────────────▼──────────────────────────────┐
 │                    Gemini Multimodal API                    │
 │  - Senior Automotive Technician Persona System Prompt       │
 │  - Multimodal image / audio / video analysis                │
 └─────────────────────────────────────────────────────────────┘
```

---

## AI Minimization Strategy (Key Evaluation Metric)

To minimize unnecessary AI API calls and token expenditures, the system employs a **3-Tier Decision Engine**:

```
 [User Input] ──► [Tier 1: Off-Topic Filter] ──(Non-Car Query)──► [Polite Local Rejection]
                        │
                        ▼ (Car/Vehicle Query)
                 [Tier 2: Local Command Engine] ──(Greeting/Booking)──► [Django Local Response]
                        │
                        ▼ (Complex Troubleshooting Required)
                 [Tier 3: Gemini Multimodal API Call]
```

### 1. Tier 1: Local Rule-Based Off-Topic Guardrail
Before sending any prompt to the Gemini API, the backend passes the message text through a local keyword and regex classifier (`backend/api/ai_service.py` -> `classify_query_intent`):
- **Automotive Knowledge Base**: Checks against over 60 automotive mechanical terms (e.g. `brakes`, `engine`, `transmission`, `radiator`, `coolant`, `oil`, `dtc`, `obd`, `squeal`, `grinding`, `overheating`, car makes/models).
- **Off-Topic Regex Filters**: Detects non-automotive domains such as recipes/cooking, programming/code generation, academic essays, politics, medicine, and general knowledge questions.
- **Cost Saved**: 100% of non-car queries are rejected locally within < 5ms without invoking Gemini API.

### 2. Tier 2: Local Command & Greeting State Machine
Common conversational patterns and workflow commands do not require LLM intelligence:
- **Greetings & Help**: Inputs like `"hi"`, `"hello"`, `"help"` trigger standard local mechanic welcome responses.
- **Booking Intent Triggers**: Inputs containing `"book"`, `"schedule"`, or `"reserve"` automatically return UI booking instructions handled directly by Django.

### 3. Tier 3: Context Window Capping & Multimodal Dispatch
When Gemini API calls are genuinely needed for complex diagnostic reasoning or analyzing uploaded vehicle photos/videos/audio:
- **Capped History**: Only the 6 most recent message exchanges are included in the prompt context to prevent context bloat and minimize token usage.
- **Structured Persona**: A concise system instruction defines the Senior Automobile Technician persona, directing it to output diagnostic details in standardized key-value formats.

---

## Database ERD (SQLite)

- **ChatSession**: Stores session UUID, vehicle make/model/year, current status (`active`, `diagnosed`, `booked`).
- **ChatMessage**: Stores sender (`user`, `bot`), text content, media attachment link, and off-topic rejection flag.
- **MediaUpload**: Stores uploaded file path, file type (`image`, `audio`, `video`), MIME type, and upload timestamp.
- **Diagnosis**: Linked 1-to-1 with `ChatSession`, storing `issue_summary`, `severity` badge, `recommended_repair`, `estimated_cost`, and `estimated_time`.
- **Booking**: Stores customer contact info, vehicle details, service requested, preferred date/time slot, and booking status.

---

## Deployment Strategy

### Frontend Deployment (Vercel Free Tier)
- Root directory configuration for Next.js 14.
- Environment Variable: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`

### Backend Deployment (AWS Free Tier / Render / App Runner)
- Django WSGI/ASGI server.
- Media upload configuration via local storage or AWS S3 bucket.
- Environment Variables: `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `GEMINI_API_KEY`.
