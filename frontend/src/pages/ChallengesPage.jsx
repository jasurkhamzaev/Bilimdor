import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Check, Target } from '@phosphor-icons/react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ChallengesPage = () => {
  const { user, checkAuth } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const { data } = await axios.get(`${API}/challenges/daily`, { withCredentials: true });
      setChallenges(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const completeChallenge = async (challengeId) => {
    try {
      const { data } = await axios.post(`${API}/challenges/complete`, { challengeId }, { withCredentials: true });
      if (data.xpAwarded) {
        toast.success(`+${data.xpAdded} XP qo'lga kiritdingiz!`);
        await checkAuth();
        fetchChallenges();
      } else {
        toast.info('Bu vazifa allaqachon tugatilgan');
      }
    } catch (error) {
      toast.error('Xatolik');
    }
  };

  if (loading) return <div className="p-6 flex justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primaryPurple"></div></div>;

  return (
    <div className="p-6" data-testid="challenges-page">
      <div className="mb-8">
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-primaryPurple dark:text-primaryPink mb-2 flex items-center gap-3">
          <Target weight="fill" size={40} />
          Kunlik Vazifalar
        </h1>
        <p className="font-body text-neutralTextLight dark:text-neutralTextDark">
          Har kuni yangi vazifalarni tugatib XP toplang!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((ch, idx) => (
          <motion.div
            key={ch.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`rounded-3xl p-6 border-2 transition-all ${
              ch.completed ? 'border-success bg-success/10' : 'border-primaryPurple bg-white dark:bg-card hover:scale-105'
            }`}
            data-testid={`challenge-${ch.id}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-5xl">{ch.icon}</div>
              {ch.completed && (
                <div className="w-10 h-10 rounded-full bg-success text-white flex items-center justify-center">
                  <Check weight="bold" size={24} />
                </div>
              )}
            </div>
            
            <h3 className="font-heading font-bold text-lg mb-2 text-neutralTextLight dark:text-white">
              {ch.title}
            </h3>
            <p className="font-body text-sm text-neutralTextLight dark:text-neutralTextDark mb-4">
              {ch.description}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="font-body font-bold text-primaryPink">+{ch.xpReward} XP</span>
              {!ch.completed ? (
                <button
                  onClick={() => completeChallenge(ch.id)}
                  className="px-4 py-2 rounded-2xl bg-primaryPurple text-white font-bold text-sm hover:bg-primaryPink transition-colors"
                  data-testid={`complete-${ch.id}`}
                >
                  Bajardim
                </button>
              ) : (
                <span className="text-success font-bold text-sm">Tugatildi ✓</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ChallengesPage;
