import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Check } from '@phosphor-icons/react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500'
};

const AvatarStorePage = () => {
  const { user, checkAuth } = useAuth();
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    axios.get(`${API}/avatars`, { withCredentials: true })
      .then(({ data }) => setAvatars(data))
      .finally(() => setLoading(false));
  }, []);

  const purchase = async (avatarId) => {
    setPurchasing(avatarId);
    try {
      await axios.post(`${API}/avatars/purchase`, { avatarId }, { withCredentials: true });
      toast.success('Avatar muvaffaqiyatli tanlandi!');
      await checkAuth();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Xatolik');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) return <div className="p-6 flex justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primaryPurple"></div></div>;

  return (
    <div className="p-6" data-testid="avatar-store">
      <div className="mb-8">
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-primaryPurple dark:text-primaryPink mb-2">
          Avatar Do'koni
        </h1>
        <p className="font-body text-neutralTextLight dark:text-neutralTextDark">
          XP toplab yangi avatarlarni qo'lga kiriting. Sizning XP: <span className="font-bold text-primaryPurple">{user?.xp || 0}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {avatars.map((avatar, idx) => {
          const canPurchase = (user?.xp || 0) >= avatar.xpRequired;
          const isCurrent = user?.avatar === avatar.id;
          
          return (
            <motion.div
              key={avatar.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`relative rounded-3xl p-6 border-2 transition-all ${
                isCurrent ? 'border-success bg-success/10' : canPurchase ? 'border-primaryPurple bg-white dark:bg-card hover:scale-105 cursor-pointer' : 'border-muted bg-muted/30 opacity-70'
              }`}
              onClick={() => canPurchase && !isCurrent && purchase(avatar.id)}
              data-testid={`avatar-${avatar.id}`}
            >
              {isCurrent && (
                <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-success text-white flex items-center justify-center">
                  <Check weight="bold" size={20} />
                </div>
              )}
              
              <div className={`w-24 h-24 mx-auto mb-3 rounded-3xl bg-gradient-to-br ${rarityColors[avatar.rarity]} flex items-center justify-center text-5xl relative`}>
                {canPurchase ? avatar.emoji : <Lock weight="fill" size={32} className="text-white" />}
              </div>
              
              <h3 className="font-heading font-bold text-center mb-1 text-neutralTextLight dark:text-white">
                {avatar.name}
              </h3>
              
              <div className="text-center">
                {avatar.xpRequired === 0 ? (
                  <span className="text-xs font-bold text-success">BEPUL</span>
                ) : (
                  <span className={`text-xs font-bold ${canPurchase ? 'text-primaryPurple' : 'text-neutralTextLight dark:text-neutralTextDark'}`}>
                    {avatar.xpRequired} XP
                  </span>
                )}
              </div>
              
              {purchasing === avatar.id && (
                <div className="absolute inset-0 bg-white/80 rounded-3xl flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryPurple"></div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AvatarStorePage;
