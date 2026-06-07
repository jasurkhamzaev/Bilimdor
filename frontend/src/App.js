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
import '@/App.css';

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
              <Route
                index
                element={
                  <ProtectedRoute>
                    <DashboardContent />
                  </ProtectedRoute>
                }
              />
              <Route path="islands" element={<div className="p-6">Islands page coming soon...</div>} />
              <Route path="lessons" element={<div className="p-6">Lessons page coming soon...</div>} />
              <Route path="games" element={<div className="p-6">Games page coming soon...</div>} />
              <Route path="rewards" element={<div className="p-6">Rewards page coming soon...</div>} />
              <Route path="leaderboard" element={<div className="p-6">Leaderboard page coming soon...</div>} />
              <Route path="chat" element={<div className="p-6">Chat page coming soon...</div>} />
              <Route path="settings" element={<div className="p-6">Settings page coming soon...</div>} />
              <Route path="students" element={<div className="p-6">Students page coming soon...</div>} />
              <Route path="analytics" element={<div className="p-6">Analytics page coming soon...</div>} />
              <Route path="users" element={<div className="p-6">Users page coming soon...</div>} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

function DashboardContent() {
  const { user: currentUser } = useAuth();

  if (currentUser?.role === 'admin') {
    return <AdminDashboard />;
  } else if (currentUser?.role === 'teacher') {
    return <TeacherDashboard />;
  } else {
    return <StudentDashboard />;
  }
}

export default App;