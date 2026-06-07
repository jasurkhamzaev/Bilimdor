import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import {
  House,
  Island,
  Book,
  GameController,
  Trophy,
  ChartBar,
  ChatCircle,
  Gear,
  SignOut,
  Moon,
  Sun,
  Globe
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import AITutorChat from '@/components/AITutorChat';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Tizimdan chiqdingiz');
    navigate('/', { replace: true });
  };

  const handleLanguageToggle = () => {
    const next = i18n.language === 'uz' ? 'ru' : i18n.language === 'ru' ? 'en' : 'uz';
    i18n.changeLanguage(next);
    localStorage.setItem('language', next);
  };

  const studentLinks = [
    { to: '/dashboard', icon: House, label: 'Dashboard', end: true },
    { to: '/dashboard/islands', icon: Island, label: t('dashboard.myIslands') },
    { to: '/dashboard/challenges', icon: GameController, label: 'Vazifalar' },
    { to: '/dashboard/avatars', icon: ChatCircle, label: 'Avatarlar' },
    { to: '/dashboard/rewards', icon: Trophy, label: t('dashboard.rewards') },
    { to: '/dashboard/leaderboard', icon: ChartBar, label: t('dashboard.leaderboard') },
    { to: '/dashboard/chat', icon: ChatCircle, label: t('dashboard.chat') },
    { to: '/dashboard/settings', icon: Gear, label: t('dashboard.settings') }
  ];

  const teacherLinks = [
    { to: '/dashboard', icon: House, label: 'Dashboard', end: true },
    { to: '/dashboard/lessons', icon: Book, label: 'Darslar' },
    { to: '/dashboard/students', icon: ChatCircle, label: 'O\'quvchilar' },
    { to: '/dashboard/leaderboard', icon: ChartBar, label: 'Reyting' },
    { to: '/dashboard/analytics', icon: ChartBar, label: 'Analitika' },
    { to: '/dashboard/settings', icon: Gear, label: 'Sozlamalar' }
  ];

  const parentLinks = [
    { to: '/dashboard', icon: House, label: 'Dashboard', end: true },
    { to: '/dashboard/leaderboard', icon: ChartBar, label: 'Reyting' },
    { to: '/dashboard/rewards', icon: Trophy, label: 'Mukofotlar' },
    { to: '/dashboard/settings', icon: Gear, label: 'Sozlamalar' }
  ];

  const adminLinks = [
    { to: '/dashboard', icon: House, label: 'Dashboard', end: true },
    { to: '/dashboard/users', icon: ChatCircle, label: 'Foydalanuvchilar' },
    { to: '/dashboard/islands', icon: Island, label: 'Orollar' },
    { to: '/dashboard/lessons', icon: Book, label: 'Darslar' },
    { to: '/dashboard/leaderboard', icon: ChartBar, label: 'Reyting' },
    { to: '/dashboard/rewards', icon: Trophy, label: 'Mukofotlar' },
    { to: '/dashboard/settings', icon: Gear, label: 'Sozlamalar' }
  ];

  const links = user?.role === 'admin' ? adminLinks
    : user?.role === 'teacher' ? teacherLinks
    : user?.role === 'parent' ? parentLinks
    : studentLinks;

  return (
    <div className="flex min-h-screen bg-backgroundLight dark:bg-backgroundDark" data-testid="dashboard-layout">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-backgroundDark border-r-2 border-primaryPurple/20 flex flex-col" data-testid="dashboard-sidebar">
        <div className="p-6 border-b-2 border-primaryPurple/20">
          <div className="flex items-center gap-3 mb-3">
            <img src="https://customer-assets.emergentagent.com/job_knowledge-islands-1/artifacts/s2uxgizu_image.png" alt="Logo" className="w-12 h-12 rounded-xl object-contain" />
            <h1 className="font-heading font-black text-base text-primaryPurple dark:text-primaryPink leading-tight">
              {t('appName')}
            </h1>
          </div>
          <p className="font-body text-sm text-neutralTextLight dark:text-neutralTextDark">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="font-body text-xs text-primaryPurple dark:text-primaryPink font-bold">
            {user?.role === 'admin' ? 'Admin' : user?.role === 'teacher' ? "O'qituvchi" : user?.role === 'parent' ? "Ota-ona" : "O'quvchi"}
          </p>
        </div>

        <nav className="flex-1 p-4" data-testid="dashboard-nav">
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl font-body font-bold transition-all ${
                      isActive
                        ? 'bg-primaryPurple text-white'
                        : 'text-neutralTextLight dark:text-neutralTextDark hover:bg-primaryPurple/10'
                    }`
                  }
                  data-testid={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <link.icon weight="fill" size={24} />
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t-2 border-primaryPurple/20 space-y-2">
          <button
            onClick={() => changeLanguage(i18n.language === 'uz' ? 'ru' : 'uz')}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-body font-bold text-neutralTextLight dark:text-neutralTextDark hover:bg-primaryPurple/10 w-full transition-all"
            data-testid="sidebar-language-toggle"
          >
            <Globe weight="fill" size={24} />
            {i18n.language === 'uz' ? 'O\'zbekcha' : 'Русский'}
          </button>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-body font-bold text-neutralTextLight dark:text-neutralTextDark hover:bg-primaryPurple/10 w-full transition-all"
            data-testid="sidebar-theme-toggle"
          >
            {theme === 'light' ? <Moon weight="fill" size={24} /> : <Sun weight="fill" size={24} />}
            {theme === 'light' ? 'Qorong\'i' : 'Yorqin'}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-body font-bold text-danger hover:bg-danger/10 w-full transition-all"
            data-testid="sidebar-logout-button"
          >
            <SignOut weight="fill" size={24} />
            Chiqish
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto" data-testid="dashboard-main">
        <Outlet />
      </main>

      {/* AI Tutor Floating Chat */}
      <AITutorChat />
    </div>
  );
};

export default DashboardLayout;