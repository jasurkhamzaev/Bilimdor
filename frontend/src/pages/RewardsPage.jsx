import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Crown, Diamond, Lock } from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500'
};

const rarityLabels = {
  common: 'ODDIY',
  rare: 'KAMYOB',
  epic: 'EPIK',
  legendary: 'AFSONAVIY'
};

const RewardsPage = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('rewards');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const [rewardsRes, achRes, userAchRes] = await Promise.all([
        axios.get(`${API}/rewards`, { withCredentials: true }),
        axios.get(`${API}/achievements`, { withCredentials: true }),
        axios.get(`${API}/user-achievements`, { withCredentials: true })
      ]);
      setRewards(rewardsRes.data);
      setAchievements(achRes.data);
      setUserAchievements(userAchRes.data);
    } catch (error) {
      console.error('Error fetching rewards:', error);
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

  const items = tab === 'rewards' ? rewards : achievements;

  return (
    <div className="p-6" data-testid="rewards-page">
      <div className="mb-8">
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-primaryPurple dark:text-primaryPink mb-2 flex items-center gap-3">
          <Trophy weight="fill" size={40} className="text-warning" />
          Mukofotlar va Yutuqlar
        </h1>
        <p className="font-body text-neutralTextLight dark:text-neutralTextDark">
          XP toplab yangi mukofotlar va yutuqlarga ega bo'ling
        </p>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setTab('rewards')}
          className={`px-6 py-3 rounded-2xl font-body font-bold transition-all ${
            tab === 'rewards' ? 'bg-primaryPurple text-white' : 'bg-muted text-neutralTextLight dark:text-neutralTextDark'
          }`}
          data-testid="tab-rewards"
        >
          Mukofotlar ({rewards.length})
        </button>
        <button
          onClick={() => setTab('achievements')}
          className={`px-6 py-3 rounded-2xl font-body font-bold transition-all ${
            tab === 'achievements' ? 'bg-primaryPurple text-white' : 'bg-muted text-neutralTextLight dark:text-neutralTextDark'
          }`}
          data-testid="tab-achievements"
        >
          Yutuqlar ({achievements.length})
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, idx) => {
          const isUnlocked = tab === 'rewards'
            ? user?.xp >= (item.xpRequired || 0)
            : userAchievements.some(ua => ua.achievementId === item.id);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`relative rounded-3xl p-6 border-2 transition-all ${
                isUnlocked ? 'border-primaryPurple bg-white dark:bg-backgroundDark hover:scale-105' : 'border-muted bg-muted/50 opacity-70'
              }`}
              data-testid={`item-${idx}`}
            >
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${rarityColors[item.rarity]}`}>
                {rarityLabels[item.rarity]}
              </div>

              <div className={`w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br ${rarityColors[item.rarity]} flex items-center justify-center`}>
                {isUnlocked ? (
                  item.rarity === 'legendary' ? <Crown weight="fill" size={40} className="text-white" />
                  : item.rarity === 'epic' ? <Diamond weight="fill" size={40} className="text-white" />
                  : item.rarity === 'rare' ? <Star weight="fill" size={40} className="text-white" />
                  : <Medal weight="fill" size={40} className="text-white" />
                ) : (
                  <Lock weight="fill" size={40} className="text-white" />
                )}
              </div>

              <h3 className="font-heading font-bold text-lg text-center mb-2 text-neutralTextLight dark:text-white">
                {item.nameUz}
              </h3>
              <p className="font-body text-sm text-center text-neutralTextLight dark:text-neutralTextDark mb-3">
                {item.description || item.nameUz}
              </p>

              {tab === 'rewards' && (
                <div className="text-center">
                  <span className="font-body text-sm text-primaryPurple font-bold">
                    {item.xpRequired} XP kerak
                  </span>
                </div>
              )}
              {tab === 'achievements' && (
                <div className="text-center">
                  <span className="font-body text-sm text-success font-bold">
                    +{item.xpReward} XP
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RewardsPage;
