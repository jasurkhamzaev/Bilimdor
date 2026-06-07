import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Moon, Sun, Globe } from '@phosphor-icons/react';
import Button3D from './Button3D';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_knowledge-islands-1/artifacts/s2uxgizu_image.png";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const changeLanguage = () => {
    const next = i18n.language === 'uz' ? 'ru' : i18n.language === 'ru' ? 'en' : 'uz';
    i18n.changeLanguage(next);
    localStorage.setItem('language', next);
  };

  return (
    <nav className="sticky top-0 z-50 bg-backgroundLight/80 dark:bg-backgroundDark/80 backdrop-blur-xl border-b-2 border-primaryPink/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-3" data-testid="navbar-logo-link">
            <img src={LOGO_URL} alt="Hashimjon Akademiyasi" className="w-14 h-14 rounded-2xl object-contain" />
            <span className="font-heading font-black text-base sm:text-xl text-primaryPurple dark:text-primaryPink hidden sm:inline">
              {t('appName')}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <a href="/#islands" className="font-body font-bold text-neutralTextLight dark:text-neutralTextDark hover:text-primaryPurple transition-colors" data-testid="navbar-islands-link">
              {t('navbar.islands')}
            </a>
            <a href="/#subjects" className="font-body font-bold text-neutralTextLight dark:text-neutralTextDark hover:text-primaryPurple transition-colors" data-testid="navbar-subjects-link">
              {t('navbar.subjects')}
            </a>
            <a href="/#leaderboard" className="font-body font-bold text-neutralTextLight dark:text-neutralTextDark hover:text-primaryPurple transition-colors" data-testid="navbar-leaderboard-link">
              {t('navbar.leaderboard')}
            </a>
            <a href="/#rewards" className="font-body font-bold text-neutralTextLight dark:text-neutralTextDark hover:text-primaryPurple transition-colors" data-testid="navbar-rewards-link">
              {t('navbar.rewards')}
            </a>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={changeLanguage} className="p-2 rounded-xl hover:bg-primaryPurple/10 flex items-center gap-1" data-testid="navbar-language-toggle">
              <Globe size={24} className="text-primaryPurple" />
              <span className="text-xs font-bold text-primaryPurple uppercase">{i18n.language}</span>
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-primaryPurple/10" data-testid="navbar-theme-toggle">
              {theme === 'light' ? <Moon size={24} className="text-primaryPurple" /> : <Sun size={24} className="text-primaryPink" />}
            </button>
            {user ? (
              <Link to="/dashboard" data-testid="navbar-dashboard-button">
                <Button3D variant="purple" size="sm">Dashboard</Button3D>
              </Link>
            ) : (
              <Link to="/auth" data-testid="navbar-login-button">
                <Button3D variant="pink" size="sm">{t('auth.login')}</Button3D>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
