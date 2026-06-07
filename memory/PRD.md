# Hashimjon Akademiyasi - PRD (Phase 3 Complete)

## Status: Production-ready Educational Platform

## Tech Stack
- Backend: FastAPI + MongoDB (Motor), JWT auth, bcrypt, openai SDK for Kimi K2.6, reportlab for PDFs, WebSocket for real-time chat
- Frontend: React 19, Tailwind CSS, Shadcn UI, Framer Motion, Zustand, i18next (UZ/RU)
- AI: Kimi K2.6 (Moonshot AI - user's API key)
- Storage: Emergent Object Storage (key placeholder - file upload deferred)

## Phase 3 Features (June 2026)

### Backend (Verified 17/17 after ObjectId leak fix)
- ✅ Parent role added to registration
- ✅ Daily Challenges system: GET /api/challenges/daily (auto-creates 3 daily), POST /api/challenges/complete (idempotent XP)
- ✅ Avatar Store: 9 avatars (common/rare/epic/legendary), purchase with XP
- ✅ Certificate PDF generation: GET /api/certificates/{lesson_id} - PDF returned only on lesson completion (uses reportlab)
- ✅ Streaming AI: POST /api/ai/tutor-stream (SSE) - reduces perceived latency
- ✅ WebSocket Chat: /api/ws/chat/{room_id} with token auth + history

### Frontend - Major Visual Overhaul
- ✅ **Shield Logo** - New Hashimjon branded shield logo in navbar, sidebar, auth page
- ✅ **Hero Hashimjon Image** - Premium 3D-illustrated character with magical aurora background
- ✅ **Premium Magical Islands Redesign** - Floating circular worlds with:
  - Rotating dashed border rings around each island
  - Floating visual emojis (🌈, 🤖, 🚀, etc.) arranged in circular pattern
  - Hashimjon character with speech bubbles next to each island
  - Subject grid (6 emoji subjects) below each island
  - Smooth float animations with glow effects
  - "Sayohatni boshlash →" CTA button per island
- ✅ **Magical Sky Background** - Aurora gradients, animated clouds (4 moving), particles (30+ stars), sun
- ✅ **Authentication** - Role selector with 3 cards (Student/Teacher/Parent) with icons
- ✅ **Parent Dashboard** - Top students leaderboard view, info cards
- ✅ **Avatar Store Page** - 9-avatar grid, rarity gradients, lock states, XP requirement
- ✅ **Daily Challenges Page** - 3 challenge cards with "Bajardim" buttons
- ✅ **WebSocket Chat Page** - Real-time messaging UI
- ✅ **Certificate Download** - Available on quiz pass in Lesson Viewer

## All Routes
- `/` Landing (public)
- `/auth` Login/Register
- `/dashboard` Role-based (Student/Teacher/Admin/Parent)
- `/dashboard/islands` Magical Islands Map
- `/dashboard/islands/:id` Island Detail (subjects + lessons)
- `/dashboard/lessons` Teacher CMS / Student lesson list
- `/dashboard/lessons/:id` Lesson Viewer (video + content + quiz + certificate)
- `/dashboard/challenges` Daily Challenges
- `/dashboard/avatars` Avatar Store
- `/dashboard/leaderboard` Real-time leaderboard
- `/dashboard/rewards` Rewards & Achievements
- `/dashboard/chat` WebSocket Chat
- `/dashboard/users` Admin Users CMS

## Test Credentials
- Admin: `admin@hashimjon.uz` / `admin123`
- Sample students/teachers/parents can be registered via UI

## Backlog (Future Phases)
- AI Personalized Learning Path (track weakness)
- Refactor server.py into routers (now ~1700 lines)
- TTL on ai_chat_history collection
- Avatar inventory tracking
- WebSocket chat token retrieval via dedicated endpoint
- Unicode font for certificates (Cyrillic/Uzbek)
- Image-based AI quiz illustrations
- Voice integration (TTS for Hashimjon)
