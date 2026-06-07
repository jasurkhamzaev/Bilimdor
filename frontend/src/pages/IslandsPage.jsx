import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Island, ArrowRight } from '@phosphor-icons/react';

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
    <div className="p-6" data-testid="islands-page">
      <h1 className="font-heading font-black text-3xl sm:text-4xl text-primaryPurple dark:text-primaryPink mb-2 flex items-center gap-3">
        <Island weight="fill" size={40} />
        Bilim Orollari
      </h1>
      <p className="font-body text-neutralTextLight dark:text-neutralTextDark mb-8">
        Sehrli bilim orollarini kashf qiling
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {islands.map((island, idx) => (
          <motion.div
            key={island.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => navigate(`/dashboard/islands/${island.id}`)}
            className="bg-white dark:bg-backgroundDark rounded-3xl overflow-hidden border-2 cursor-pointer hover:scale-105 transition-transform"
            style={{ borderColor: island.color }}
            data-testid={`island-${island.id}`}
          >
            <div className="h-48 relative overflow-hidden" style={{ backgroundColor: island.color + '30' }}>
              <img src={island.imageUrl} alt={island.nameUz} className="w-full h-full object-cover" />
            </div>
            <div className="p-6">
              <h3 className="font-heading font-bold text-xl mb-2 text-neutralTextLight dark:text-white">
                {island.nameUz}
              </h3>
              <p className="font-body text-sm font-bold mb-3" style={{ color: island.color }}>
                {island.gradeMin}-{island.gradeMax} sinflar
              </p>
              <p className="font-body text-sm text-neutralTextLight dark:text-neutralTextDark mb-4">
                {island.descriptionUz}
              </p>
              <button
                className="flex items-center gap-2 font-body font-bold text-primaryPurple hover:text-primaryPink transition-colors"
                data-testid={`open-island-${island.id}`}
              >
                Kirish <ArrowRight weight="bold" size={20} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default IslandsPage;
