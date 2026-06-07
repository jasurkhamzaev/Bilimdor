import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trophy, Medal, Crown, Star } from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data } = await axios.get(`${API}/leaderboard?limit=50`, { withCredentials: true });
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown weight="fill" size={32} className="text-warning" />;
    if (rank === 2) return <Medal weight="fill" size={32} className="text-neutralTextLight" />;
    if (rank === 3) return <Medal weight="fill" size={32} className="text-primaryPink" />;
    return <span className="font-heading font-black text-2xl text-primaryPurple">#{rank}</span>;
  };

  const getRankBg = (rank) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-primaryPurple to-primaryPink';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primaryPurple"></div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="leaderboard-page">
      <div className="mb-8">
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-primaryPurple dark:text-primaryPink mb-2 flex items-center gap-3">
          <Trophy weight="fill" size={40} className="text-warning" />
          Reyting
        </h1>
        <p className="font-body text-neutralTextLight dark:text-neutralTextDark">
          Eng yaxshi o'quvchilar ro'yxati - har 10 soniyada yangilanadi
        </p>
      </div>

      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 0, 2].map((idx) => {
            const player = leaderboard[idx];
            const rank = idx + 1;
            return (
              <div
                key={player.id}
                className={`bg-gradient-to-br ${getRankBg(rank)} rounded-3xl p-6 text-white text-center ${
                  rank === 1 ? 'transform md:-translate-y-4' : ''
                }`}
                data-testid={`podium-${rank}`}
              >
                <div className="flex justify-center mb-3">
                  {getRankIcon(rank)}
                </div>
                <div className="w-16 h-16 rounded-full bg-white/30 mx-auto mb-3 flex items-center justify-center">
                  <span className="font-heading font-black text-2xl">
                    {player.firstName?.[0]}{player.lastName?.[0]}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-base sm:text-lg truncate">
                  {player.firstName} {player.lastName}
                </h3>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star weight="fill" size={20} />
                  <span className="font-heading font-black text-2xl">{player.xp}</span>
                </div>
                <p className="font-body text-sm opacity-80">XP</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white dark:bg-backgroundDark rounded-3xl border-2 border-primaryPurple/20 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          {leaderboard.length === 0 ? (
            <div className="p-12 text-center text-neutralTextLight dark:text-neutralTextDark">
              <p className="font-body">Hozircha o'quvchilar yo'q. Birinchi bo'ling!</p>
            </div>
          ) : (
            leaderboard.map((player, idx) => {
              const isCurrentUser = player.id === user?.id;
              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 border-b border-primaryPurple/10 ${
                    isCurrentUser ? 'bg-primaryPurple/10' : 'hover:bg-primaryPurple/5'
                  } transition-colors`}
                  data-testid={`leaderboard-row-${idx + 1}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 text-center">
                      {getRankIcon(player.rank)}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primaryPurple to-primaryPink flex items-center justify-center text-white font-bold">
                      {player.firstName?.[0]}{player.lastName?.[0]}
                    </div>
                    <div>
                      <h4 className="font-body font-bold text-neutralTextLight dark:text-white">
                        {player.firstName} {player.lastName}
                        {isCurrentUser && <span className="ml-2 text-xs text-primaryPink">(Siz)</span>}
                      </h4>
                      <p className="font-body text-xs text-neutralTextLight dark:text-neutralTextDark">
                        Daraja {player.level}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star weight="fill" size={20} className="text-warning" />
                    <span className="font-heading font-black text-xl text-primaryPurple">{player.xp}</span>
                    <span className="font-body text-sm text-neutralTextLight dark:text-neutralTextDark">XP</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
