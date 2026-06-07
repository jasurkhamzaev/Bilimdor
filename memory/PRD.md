# Hashimjon Akademiyasi - PRD

## Original Problem Statement
Build a production-ready educational platform "Hashimjon Akademiyasi" for Uzbekistan children (ages 6-18), students from grades 1-11, teachers, parents, and administrators. Inspired by Duolingo, Disney, Khan Academy Kids. Premium gamified EdTech platform with knowledge islands, lessons, gamification (XP, levels, badges, achievements), leaderboards, rewards, and role-based dashboards.

## User Choices
- AI Integration: Mixed providers (deferred - API keys to be provided later)
- Payment System: Not needed initially
- File Storage: Object storage enabled (Emergent Object Storage)
- Email Service: Console logs for now
- Authentication: JWT-based custom auth with email/password

## Tech Stack
- **Backend**: FastAPI + MongoDB (Motor async driver), JWT auth with bcrypt
- **Frontend**: React 19, Tailwind CSS, Shadcn UI, Framer Motion, Zustand
- **Internationalization**: i18next (Uzbek/Russian)
- **Theme**: Dark/Light mode with localStorage persistence
- **Storage**: Emergent Object Storage
- **Icons**: @phosphor-icons/react

## Architecture
- Backend: `/app/backend/server.py` - all API endpoints prefixed with `/api`
- Frontend routes:
  - `/` - Landing page (public)
  - `/auth` - Login/Register
  - `/dashboard` - Role-based dashboard (Student/Teacher/Admin)

## Database Collections
- users (with bcrypt password hash, roles: student/teacher/admin)
- islands (3 seeded: Quvonch, Kashfiyot, Kelajak)
- subjects
- lessons
- user_progress
- files (object storage references)
- password_reset_tokens (TTL indexed)
- login_attempts

## Implemented Features (June 2026)

### Backend
- ✅ JWT auth with httpOnly cookies (access + refresh tokens)
- ✅ Admin seeding on startup (admin@hashimjon.uz / admin123)
- ✅ Auto-seeded 3 knowledge islands
- ✅ Role-based authorization (student/teacher/admin)
- ✅ User registration with grade, parent phone
- ✅ Streak tracking on login
- ✅ XP tracking and reward system
- ✅ Islands, Subjects, Lessons CRUD with Pydantic body models
- ✅ User progress tracking with XP rewards
- ✅ Leaderboard endpoint (sorted by XP)
- ✅ Object storage integration for file uploads
- ✅ CORS properly configured
- ✅ MongoDB indexes (unique email, TTL on tokens)

### Frontend
- ✅ Premium Landing Page with Hero, Knowledge Islands (3), Features sections
- ✅ Animated UI with Framer Motion
- ✅ 3D Duolingo-style buttons (border-b-4, push-down on active)
- ✅ Authentication page with Login/Register tabs
- ✅ Role-based Dashboard (StudentDashboard, TeacherDashboard, AdminDashboard)
- ✅ Sidebar navigation with role-aware menu items
- ✅ Dark/Light theme toggle (persistent in localStorage)
- ✅ Language toggle (Uzbek/Russian) with i18next
- ✅ Stat cards for Student (XP, Level, Streak, Completed Lessons)
- ✅ Protected routes with auth context
- ✅ Toast notifications (sonner)

## Test Results (Iteration 1)
- Backend: 100% (15/15 tests passed)
- Frontend: 100% (after dashboard fix applied by testing agent)
- Critical bug fixed: App.js DashboardContent context issue

## Prioritized Backlog (P0/P1/P2)

### P0 (Critical - Next Phase)
1. Implement Subjects detail page (per island)
2. Implement Lessons viewer (video + content + quiz)
3. Implement Quiz system (questions, answers, scoring)
4. Implement Leaderboard page with ranking
5. Implement Rewards page with badges/achievements

### P1 (High Priority)
1. Teacher CMS - create/edit lessons, assignments
2. Admin CMS - manage users, islands, subjects
3. AI Tutor integration (when user provides API key)
4. AI Homework Helper
5. AI Quiz Generator
6. Real-time messaging system
7. Daily/Weekly/Monthly challenges
8. Avatar customization & skins

### P2 (Medium Priority)
1. Parent dashboard
2. Friend system
3. Certificates generation on lesson completion
4. Push notifications (PWA)
5. Offline support
6. Advanced analytics dashboard
7. Email notifications (when service provided)

## User Personas
1. **Student (6-18 years)**: Learns through gamified lessons, earns XP, climbs leaderboard
2. **Teacher**: Creates lessons, monitors student progress, sends messages
3. **Admin**: Manages entire platform, content moderation, user management
4. **Parent**: (future) Monitors child's learning progress

## Next Steps
- Add API keys when user provides them for AI features
- Build out lesson content viewer
- Implement quiz system
- Develop full CMS for teachers/admins
