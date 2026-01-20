# Crystal Clear Windows - AI Calling Agent PRD

## Original Problem Statement
Build an AI agent for a window washing company. The AI agent calls a customer after the customer has provided their details (name, email and phone number) on a Contact Me form. The purpose of the call is to confirm the phone number, acknowledge the request and ask the customer about their timeline in subscribing to the windows washing service.

## User Personas
1. **Customer** - Homeowner/business owner looking for window washing services
2. **Admin Staff** - Company employees managing leads and follow-ups

## Core Requirements (Static)
- Contact form (name, email, phone number)
- AI calling agent that:
  - Confirms phone number
  - Acknowledges the service request
  - Asks about timeline for service
- Log conversations to Google Sheets
- Schedule follow-ups in calendar
- Modern/clean minimalist design

## Tech Stack
- **Frontend**: React with Tailwind CSS + Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Voice AI**: Vapi Web SDK (REAL - browser-based voice calls)
- **Integrations**: Google Sheets (MOCKED), Google Calendar (MOCKED)

## Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Landing Page  │────▶│  Contact Form   │────▶│   MongoDB       │
│   (React)       │     │  Submission     │     │   (contacts)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │  Vapi Web SDK   │
                        │  (Browser Voice)│
                        └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐     ┌───────────────┐
                        │   Call Logs     │────▶│  Scheduled    │
                        │   (MongoDB)     │     │  Events       │
                        └─────────────────┘     └───────────────┘
```

## What's Been Implemented (Jan 20, 2026)

### Backend (FastAPI)
- ✅ Contact CRUD endpoints (POST/GET /api/contacts)
- ✅ Vapi call logging endpoint (POST /api/calls/log)
- ✅ AI Call initiation endpoint (POST /api/calls/initiate) - for demo mode
- ✅ Call logs endpoints (GET /api/calls)
- ✅ Scheduled events endpoints (POST/GET /api/schedule)
- ✅ Dashboard stats endpoint (GET /api/stats)
- ✅ Mock Google Sheets logging (POST /api/sheets/log)

### Frontend (React)
- ✅ Landing page with hero section and contact form (UK phone format)
- ✅ Features section highlighting key benefits
- ✅ **REAL Vapi Voice Integration** - Browser-based voice calls with AI assistant
- ✅ Live transcript display during voice calls
- ✅ Admin Dashboard with:
  - Overview tab (stats, recent contacts, recent calls)
  - Contacts tab (full list with call action)
  - Call Logs tab (history with transcript detail view)
  - Schedule tab (calendar + scheduled follow-ups)
- ✅ Responsive design (mobile + desktop)

### Vapi Integration
- Public Key: fa42cea9-cad7-4b6a-ba56-b114cd3726c9
- Assistant ID: ffdbd713-6f8f-403f-945e-7f1eafa85abb
- Features: Real-time voice, live transcription, mute control

### Design System
- Crystal Blue (#0EA5E9) primary color
- Clean Slate (#F1F5F9) secondary
- Safety Orange (#F97316) CTA accent
- Outfit + Plus Jakarta Sans fonts
- Rounded cards, pill buttons, glass effects

## Prioritized Backlog

### P0 (Must Have - Next Phase)
- [ ] Real Twilio integration for voice calls
- [ ] Real OpenAI GPT integration for AI conversation
- [ ] Real Google Sheets integration for logging
- [ ] Real Google Calendar integration for scheduling

### P1 (Should Have)
- [ ] User authentication (admin login)
- [ ] Email notifications when contact submits form
- [ ] SMS confirmation to customer
- [ ] Call recording storage

### P2 (Nice to Have)
- [ ] Customer portal for tracking request status
- [ ] Analytics dashboard with charts
- [ ] Multi-language support
- [ ] Webhook integrations

## Next Tasks
1. Obtain API keys (Twilio, OpenAI, Google Cloud)
2. Implement real Twilio + OpenAI voice integration
3. Set up Google OAuth for Sheets/Calendar
4. Add admin authentication
5. Deploy to production
