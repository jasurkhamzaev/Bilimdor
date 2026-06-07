# Hashimjon Akademiyasi - PRD

## Original Problem Statement
Build a production-ready educational platform "Hashimjon Akademiyasi" for Uzbekistan children (ages 6-18). Inspired by Duolingo, Disney, Khan Academy Kids. Premium gamified EdTech platform with knowledge islands, lessons, gamification, leaderboards, rewards, role-based dashboards, AI tutor, CMS for teachers/admins.

## User Choices
- AI: Kimi K2.6 (Moonshot AI) via api.moonshot.ai - their own API key
- Payment: Not needed
- Storage: Object storage (placeholder key, infrastructure ready)
- Email: Console log
- Auth: JWT-based

## Tech Stack
- Backend: FastAPI + MongoDB (Motor), JWT auth with bcrypt, openai SDK for Kimi
- Frontend: React 19, Tailwind CSS, Shadcn UI, Framer Motion, Zustand
- AI: Kimi K2.6 (Moonshot AI, OpenAI-compatible)
- i18n: Uzbek/Russian
- Theme: Dark/Light mode

## Implemented Features (June 2026)

### Backend (24/24 tests passed)
- ✅ JWT auth with httpOnly cookies, role-based access (student/teacher/admin)
- ✅ Auto-seeded: admin user, 3 islands, 8 subjects, 2 sample lessons, 1 quiz, 6 achievements, 6 rewards
- ✅ Islands, Subjects, Lessons CRUD with Pydantic body models
- ✅ Quiz system: CRUD + submit with auto-grading, XP rewards (one-pass-per-quiz to prevent farming)
- ✅ Achievements & Rewards endpoints
- ✅ Assignments/Homework CRUD
- ✅ User progress tracking with XP rewards
- ✅ Leaderboard (sorted by XP, top 100)
- ✅ Admin endpoints: list/delete users
- ✅ **AI Integration (Kimi K2.6):**
  - POST /api/ai/tutor - conversational tutor with session history (Uzbek persona)
  - POST /api/ai/homework-helper - step-by-step homework guidance
  - POST /api/ai/generate-quiz - auto-generate quizzes from topics
- ✅ Object storage integration (file upload/download)

### Frontend (~95% functional)
- ✅ Premium Landing Page (Hero, 3 islands, features)
- ✅ Auth (Login/Register)
- ✅ Role-based Dashboards (Student/Teacher/Admin)
- ✅ **Islands Pages**: List + Detail (subjects + lessons)
- ✅ **Lesson Viewer**: YouTube video player + content + quiz with results
- ✅ **Teacher CMS**: Create lessons + AI quiz generation
- ✅ **Admin Users CMS**: Filterable user list with role badges, delete
- ✅ **Leaderboard**: Podium top 3 + full list, auto-refresh every 10s
- ✅ **Rewards/Achievements**: Tabs with rarity (common/rare/epic/legendary), locked/unlocked states
- ✅ **AI Tutor Floating Chat**: Hashimjon AI in Uzbek, session-based history
- ✅ Sidebar with role-aware navigation
- ✅ Dark/Light mode + UZ/RU language toggle
- ✅ 3D Duolingo-style buttons

## Test Results
- Iteration 1: Backend 100% (15/15), Frontend fixed
- Iteration 2: Backend 100% (24/24), Frontend ~85% → fixed to ~95% (AI chat panel z-index)

## Login Credentials
- Admin: `admin@hashimjon.uz` / `admin123`

## Files
- Backend: `/app/backend/server.py` (single file, ~1300 lines)
- Frontend pages: `/app/frontend/src/pages/`
- Frontend components: `/app/frontend/src/components/`
- Contexts: `/app/frontend/src/contexts/`

## P0 Backlog (Future)
- Refresh assignments UI for teachers
- Avatar customization & skins
- Daily/Weekly/Monthly challenges system
- Certificates PDF generation on lesson completion
- Real-time messaging (WebSocket)
- Parent dashboard
- Friend system
- AI Quiz Generator UI improvements (streaming)
- Refactor server.py into routers (auth, lessons, quizzes, ai, admin)

## Known Limitations
- Object storage 401 (placeholder EMERGENT_LLM_KEY) - file upload not functional
- AI responses 30-60s (Kimi K2.6 latency) - UI has loading indicator
- Quiz farming protected: one XP award per quiz pass

## Architecture Notes
- All API routes prefixed `/api`
- Auth via httpOnly cookies (access_token 15min, refresh_token 7d)
- AI chat history persisted in `ai_chat_history` collection
- Quiz submissions tracked in `quiz_submissions`
