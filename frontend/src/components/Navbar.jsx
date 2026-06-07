import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Star, Moon, Sun, Globe } from '@phosphor-icons/react';
import Button3D from './Button3D';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <nav className="sticky top-0 z-50 bg-backgroundLight/80 dark:bg-backgroundDark/80 backdrop-blur-xl border-b-2 border-primaryPink/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-3" data-testid="navbar-logo-link">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primaryPurple to-primaryPink flex items-center justify-center">
              <Star weight="fill" size={24} className="text-white" />
            </div>
            <span className="font-heading font-black text-xl text-primaryPurple dark:text-primaryPink">
              {t('appName')}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/#islands"
              className="font-body font-bold text-neutralTextLight dark:text-neutralTextDark hover:text-primaryPurple transition-colors"
              data-testid="navbar-islands-link"
            >
              {t('navbar.islands')}
            </Link>
            <Link
              to="/#subjects"
              className="font-body font-bold text-neutralTextLight dark:text-neutralTextDark hover:text-primaryPurple transition-colors"
              data-testid="navbar-subjects-link"
            >
              {t('navbar.subjects')}
            </Link>
            <Link
              to="/#leaderboard"
              className="font-body font-bold text-neutralTextLight dark:text-neutralTextDark hover:text-primaryPurple transition-colors"
              data-testid="navbar-leaderboard-link"
            >
              {t('navbar.leaderboard')}
            </Link>
            <Link
              to="/#rewards"
              className="font-body font-bold text-neutralTextLight dark:text-neutralTextDark hover:text-primaryPurple transition-colors"
              data-testid="navbar-rewards-link"
            >
              {t('navbar.rewards')}
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => changeLanguage(i18n.language === 'uz' ? 'ru' : 'uz')}
              className="p-2 rounded-xl hover:bg-primaryPurple/10 transition-colors"
              data-testid="navbar-language-toggle"
            >
              <Globe size={24} className="text-primaryPurple" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-primaryPurple/10 transition-colors"
              data-testid="navbar-theme-toggle"
            >
              {theme === 'light' ? (
                <Moon size={24} className="text-primaryPurple" />
              ) : (
                <Sun size={24} className="text-primaryPink" />
              )}
            </button>

            {user ? (
              <Link to="/dashboard" data-testid="navbar-dashboard-button">
                <Button3D variant="purple" size="sm">
                  Dashboard
                </Button3D>
              </Link>
            ) : (
              <Link to="/auth" data-testid="navbar-login-button">
                <Button3D variant="pink" size="sm">
                  {t('auth.login')}
                </Button3D>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;