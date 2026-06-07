import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MagicalIsland, MagicalSkyBackground } from '@/components/MagicalIsland';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const IslandsPage = () => {
  const navigate = useNavigate();
  const [islands, setIslands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/islands`, { withCredentials: true })
      .then(({ data }) => setIslands(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primaryPurple"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden" data-testid="islands-page">
      <MagicalSkyBackground variant="day" />
      
      <div className="relative z-10 p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/90 backdrop-blur border-2 border-primaryPurple shadow-lg">
            <span className="text-xl">🗺</span>
            <span className="font-body font-bold text-primaryPurple">Bilim Xaritasi</span>
          </div>

          <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl mb-4 bg-gradient-to-r from-primaryPink via-primaryPurple to-primaryBlue bg-clip-text text-transparent">
            Sehrli Bilim Orollari
          </h1>
          <p className="font-body text-base sm:text-lg text-neutralTextLight dark:text-white max-w-2xl mx-auto">
            O'zingizga mos bilim dunyosini tanlang va sarguzashtni boshlang
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-8 pt-16 max-w-7xl mx-auto">
          {islands.map((island, idx) => (
            <MagicalIsland
              key={island.id}
              island={island}
              index={idx}
              onClick={() => navigate(`/dashboard/islands/${island.id}`)}
              showHashimjon={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default IslandsPage;
