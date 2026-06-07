import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Trophy, Fire, Star, Target } from '@phosphor-icons/react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const StudentDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [islands, setIslands] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [islandsRes, progressRes] = await Promise.all([
        axios.get(`${API}/islands`, { withCredentials: true }),
        axios.get(`${API}/progress`, { withCredentials: true })
      ]);
      
      setIslands(islandsRes.data);
      setProgress(progressRes.data);
      
      const completedLessons = progressRes.data.filter(p => p.completed).length;
      setStats({
        xp: user.xp || 0,
        level: user.level || 1,
        streak: user.streak || 0,
        completedLessons
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primaryPurple"></div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="student-dashboard">
      <div className="mb-8">
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-primaryPurple dark:text-primaryPink mb-2" data-testid="dashboard-welcome">
          {t('dashboard.welcome')}, {user.firstName}!
        </h1>
        <p className="font-body text-neutralTextLight dark:text-neutralTextDark">
          {t('greeting')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-primaryPurple to-primaryPink rounded-3xl p-6 text-white" data-testid="xp-card">
          <div className="flex items-center justify-between mb-2">
            <Star weight="fill" size={32} />
            <span className="font-heading font-black text-3xl">{stats.xp}</span>
          </div>
          <p className="font-body font-bold">{t('dashboard.xp')}</p>
        </div>

        <div className="bg-gradient-to-br from-primaryBlue to-primaryPurple rounded-3xl p-6 text-white" data-testid="level-card">
          <div className="flex items-center justify-between mb-2">
            <Trophy weight="fill" size={32} />
            <span className="font-heading font-black text-3xl">{stats.level}</span>
          </div>
          <p className="font-body font-bold">{t('dashboard.rank')}</p>
        </div>

        <div className="bg-gradient-to-br from-primaryPink to-danger rounded-3xl p-6 text-white" data-testid="streak-card">
          <div className="flex items-center justify-between mb-2">
            <Fire weight="fill" size={32} />
            <span className="font-heading font-black text-3xl">{stats.streak}</span>
          </div>
          <p className="font-body font-bold">{t('dashboard.streak')} kun</p>
        </div>

        <div className="bg-gradient-to-br from-success to-primaryBlue rounded-3xl p-6 text-white" data-testid="completed-card">
          <div className="flex items-center justify-between mb-2">
            <Target weight="fill" size={32} />
            <span className="font-heading font-black text-3xl">{stats.completedLessons}</span>
          </div>
          <p className="font-body font-bold">Tugallangan darslar</p>
        </div>
      </div>

      {/* Islands */}
      <div className="mb-8">
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-neutralTextLight dark:text-white mb-6">
          {t('dashboard.myIslands')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {islands.map((island) => (
            <div
              key={island.id}
              className="bg-white dark:bg-backgroundDark rounded-3xl p-6 border-2 border-primaryPurple hover:scale-105 transition-transform cursor-pointer"
              style={{ borderColor: island.color }}
              data-testid={`island-card-${island.id}`}
            >
              <img
                src={island.imageUrl}
                alt={island.name}
                className="w-full h-48 object-cover rounded-2xl mb-4"
              />
              <h3 className="font-heading font-bold text-xl mb-2 text-neutralTextLight dark:text-white">
                {island.nameUz}
              </h3>
              <p className="font-body text-sm text-neutralTextLight dark:text-neutralTextDark mb-2">
                {island.descriptionUz}
              </p>
              <p className="font-body text-xs font-bold" style={{ color: island.color }}>
                {island.gradeMin}-{island.gradeMax} sinflar
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;