import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Trophy, Fire, BookOpen, Star, ChartBar } from '@phosphor-icons/react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ParentDashboard = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For demo: fetch all students as potential children
    Promise.all([
      axios.get(`${API}/leaderboard?limit=10`, { withCredentials: true })
    ]).then(([lb]) => {
      setLeaderboard(lb.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6 flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primaryPurple"></div></div>;
  }

  return (
    <div className="p-6" data-testid="parent-dashboard">
      <div className="mb-8">
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-primaryPurple dark:text-primaryPink mb-2 flex items-center gap-3">
          <Users weight="fill" size={40} />
          Ota-ona Paneli
        </h1>
        <p className="font-body text-neutralTextLight dark:text-neutralTextDark">
          Xush kelibsiz, {user.firstName} {user.lastName}! Farzandingiz progressini kuzating.
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-primaryPurple to-primaryPink rounded-3xl p-6 text-white">
          <BookOpen weight="fill" size={32} className="mb-3" />
          <h3 className="font-heading font-bold text-xl mb-1">Farzandlar</h3>
          <p className="font-body text-3xl font-black">0</p>
          <p className="font-body text-sm opacity-80">Hozircha qo'shilmagan</p>
        </div>

        <div className="bg-gradient-to-br from-primaryBlue to-primaryPurple rounded-3xl p-6 text-white">
          <Trophy weight="fill" size={32} className="mb-3" />
          <h3 className="font-heading font-bold text-xl mb-1">Top o'quvchilar</h3>
          <p className="font-body text-3xl font-black">{leaderboard.length}</p>
          <p className="font-body text-sm opacity-80">Reytingda</p>
        </div>

        <div className="bg-gradient-to-br from-success to-primaryBlue rounded-3xl p-6 text-white">
          <ChartBar weight="fill" size={32} className="mb-3" />
          <h3 className="font-heading font-bold text-xl mb-1">Statistika</h3>
          <p className="font-body text-3xl font-black">{leaderboard.reduce((s, p) => s + (p.xp || 0), 0)}</p>
          <p className="font-body text-sm opacity-80">Jami XP</p>
        </div>
      </div>

      {/* Children placeholder */}
      <div className="bg-white dark:bg-card rounded-3xl p-8 border-2 border-primaryPurple/30 mb-8">
        <h2 className="font-heading font-bold text-2xl mb-4 text-neutralTextLight dark:text-white">
          Farzandlaringiz
        </h2>
        <div className="text-center py-12">
          <Users weight="fill" size={64} className="mx-auto text-primaryPurple/30 mb-4" />
          <p className="font-body text-neutralTextLight dark:text-neutralTextDark mb-4">
            Farzandlaringizni qo'shish funksiyasi tez orada qo'shiladi.
          </p>
          <p className="font-body text-sm text-neutralTextLight dark:text-neutralTextDark">
            Farzandingizning hisobini bog'lash uchun ularning emailini kiriting (yaqin orada).
          </p>
        </div>
      </div>

      {/* Top Students */}
      <div className="bg-white dark:bg-card rounded-3xl p-8 border-2 border-primaryPurple/30">
        <h2 className="font-heading font-bold text-2xl mb-4 text-neutralTextLight dark:text-white flex items-center gap-2">
          <Trophy weight="fill" size={24} className="text-warning" />
          Eng yaxshi o'quvchilar
        </h2>
        <div className="space-y-3">
          {leaderboard.slice(0, 5).map((student) => (
            <div key={student.id} className="flex items-center justify-between p-3 rounded-2xl bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primaryPurple to-primaryPink flex items-center justify-center text-white font-bold text-sm">
                  #{student.rank}
                </div>
                <div>
                  <div className="font-body font-bold text-neutralTextLight dark:text-white">
                    {student.firstName} {student.lastName}
                  </div>
                  <div className="font-body text-xs text-neutralTextLight dark:text-neutralTextDark">
                    Daraja {student.level}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star weight="fill" size={16} className="text-warning" />
                <span className="font-heading font-bold text-primaryPurple">{student.xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
