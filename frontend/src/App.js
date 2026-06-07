import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/layouts/DashboardLayout';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import StudentDashboard from '@/pages/StudentDashboard';
import TeacherDashboard from '@/pages/TeacherDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import ParentDashboard from '@/pages/ParentDashboard';
import IslandsPage from '@/pages/IslandsPage';
import IslandDetailPage from '@/pages/IslandDetailPage';
import LessonViewerPage from '@/pages/LessonViewerPage';
import LeaderboardPage from '@/pages/LeaderboardPage';
import RewardsPage from '@/pages/RewardsPage';
import TeacherLessonsCMS from '@/pages/TeacherLessonsCMS';
import AdminUsersCMS from '@/pages/AdminUsersCMS';
import AvatarStorePage from '@/pages/AvatarStorePage';
import ChallengesPage from '@/pages/ChallengesPage';
import ChatPage from '@/pages/ChatPage';
import '@/App.css';

function DashboardContent() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'teacher') return <TeacherDashboard />;
  if (user?.role === 'parent') return <ParentDashboard />;
  return <StudentDashboard />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardContent />} />
              <Route path="islands" element={<IslandsPage />} />
              <Route path="islands/:islandId" element={<IslandDetailPage />} />
              <Route path="lessons" element={<TeacherLessonsCMS />} />
              <Route path="lessons/:lessonId" element={<LessonViewerPage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="rewards" element={<RewardsPage />} />
              <Route path="users" element={<AdminUsersCMS />} />
              <Route path="avatars" element={<AvatarStorePage />} />
              <Route path="challenges" element={<ChallengesPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="games" element={<div className="p-6"><h1 className="font-heading font-black text-3xl text-primaryPurple">O'yinlar</h1><p className="font-body mt-2">Tez orada qo'shiladi...</p></div>} />
              <Route path="settings" element={<div className="p-6"><h1 className="font-heading font-black text-3xl text-primaryPurple">Sozlamalar</h1><p className="font-body mt-2">Tez orada qo'shiladi...</p></div>} />
              <Route path="students" element={<div className="p-6"><h1 className="font-heading font-black text-3xl text-primaryPurple">O'quvchilar</h1><p className="font-body mt-2">Tez orada qo'shiladi...</p></div>} />
              <Route path="analytics" element={<div className="p-6"><h1 className="font-heading font-black text-3xl text-primaryPurple">Analitika</h1><p className="font-body mt-2">Tez orada qo'shiladi...</p></div>} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
