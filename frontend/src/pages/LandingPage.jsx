import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Sparkle, Trophy, GameController } from '@phosphor-icons/react';
import Button3D from '@/components/Button3D';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MagicalIsland, MagicalSkyBackground, MagicalParticles } from '@/components/MagicalIsland';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const HERO_IMAGE = "https://customer-assets.emergentagent.com/job_knowledge-islands-1/artifacts/wkp8o7rq_image.png";

const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [islands, setIslands] = React.useState([]);

  React.useEffect(() => {
    axios.get(`${API}/islands`).then(({ data }) => setIslands(data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-backgroundLight dark:bg-backgroundDark">
      <Navbar />
      
      {/* Hero Section - with new Hashimjon image */}
      <section className="relative overflow-hidden min-h-[600px] py-12 sm:py-20" data-testid="hero-section">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-200 via-pink-100 to-blue-200 dark:from-purple-900 dark:via-indigo-900 dark:to-blue-900" />
          <MagicalParticles count={30} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/80 backdrop-blur border-2 border-primaryPurple shadow-lg" data-testid="hero-badge">
                <Star weight="fill" size={20} className="text-warning" />
                <span className="font-body font-bold text-primaryPurple">{t('hero.badge')}</span>
              </div>

              <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-primaryPink via-primaryPurple to-primaryBlue bg-clip-text text-transparent" data-testid="hero-title">
                Hashimjon<br/>Akademiyasi
              </h1>

              <p className="font-body text-base sm:text-lg text-neutralTextLight dark:text-neutralTextDark mb-8 leading-relaxed" data-testid="hero-description">
                {t('hero.description')}
              </p>

              <div className="flex flex-wrap gap-4">
                <Button3D variant="pink" size="lg" onClick={() => navigate('/auth')} data-testid="hero-start-button">
                  {t('hero.startButton')}
                </Button3D>
                <Button3D variant="purple" size="lg" onClick={() => document.getElementById('islands').scrollIntoView({ behavior: 'smooth' })} data-testid="hero-map-button">
                  {t('hero.mapButton')}
                </Button3D>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="font-heading font-black text-3xl text-primaryPurple">12K+</div>
                  <div className="font-body text-sm text-neutralTextLight dark:text-neutralTextDark">O'quvchilar</div>
                </div>
                <div className="text-center">
                  <div className="font-heading font-black text-3xl text-primaryPink">500+</div>
                  <div className="font-body text-sm text-neutralTextLight dark:text-neutralTextDark">Darslar</div>
                </div>
                <div className="text-center">
                  <div className="font-heading font-black text-3xl text-primaryBlue">Top 1</div>
                  <div className="font-body text-sm text-neutralTextLight dark:text-neutralTextDark">O'zbekiston</div>
                </div>
              </div>
            </motion.div>

            {/* Hero Hashimjon Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative"
              >
                <div className="absolute inset-0 rounded-full blur-3xl bg-primaryPurple/40 scale-90" />
                <img
                  src={HERO_IMAGE}
                  alt="Hashimjon"
                  className="relative w-full max-w-md mx-auto rounded-3xl shadow-2xl"
                  data-testid="hero-image"
                />
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1, duration: 0.6 }}
                  className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 bg-white dark:bg-card rounded-2xl p-4 shadow-2xl border-2 border-primaryPink"
                >
                  <div className="font-body font-bold text-neutralTextLight dark:text-white text-sm sm:text-base" data-testid="hero-greeting">
                    {t('hero.hashimjonGreeting')} 👋
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Premium Knowledge Islands Section */}
      <section id="islands" className="relative py-20 overflow-hidden" data-testid="islands-section">
        <MagicalSkyBackground variant="day" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/90 backdrop-blur border-2 border-primaryPurple shadow-lg">
              <span className="text-xl">🗺</span>
              <span className="font-body font-bold text-primaryPurple">Bilim Xaritasi</span>
            </div>

            <h2 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl mb-4 bg-gradient-to-r from-primaryPink via-primaryPurple to-primaryBlue bg-clip-text text-transparent">
              Sehrli Bilim Orollari
            </h2>
            <p className="font-body text-base sm:text-lg text-neutralTextLight dark:text-neutralTextDark max-w-2xl mx-auto">
              O'zingizga mos bilim dunyosini tanlang va sarguzashtni boshlang
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-8 pt-20 md:pt-12">
            {islands.map((island, idx) => (
              <MagicalIsland
                key={island.id}
                island={island}
                index={idx}
                onClick={() => navigate('/auth')}
                showHashimjon={true}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-backgroundLight dark:bg-backgroundDark" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl mb-4 text-primaryPurple dark:text-primaryPink">
              Nima uchun Hashimjon Akademiyasi?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-card rounded-3xl p-8 border-2 border-primaryPink shadow-lg hover:scale-105 transition-transform"
            >
              <GameController weight="duotone" size={48} className="text-primaryPink mb-4" />
              <h3 className="font-heading font-bold text-xl mb-3 text-neutralTextLight dark:text-white">O'yinlar orqali o'rganish</h3>
              <p className="font-body text-neutralTextLight dark:text-neutralTextDark">Interaktiv o'yinlar va qiziqarli vazifalar orqali bilim oling</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-card rounded-3xl p-8 border-2 border-primaryPurple shadow-lg hover:scale-105 transition-transform"
            >
              <Trophy weight="duotone" size={48} className="text-primaryPurple mb-4" />
              <h3 className="font-heading font-bold text-xl mb-3 text-neutralTextLight dark:text-white">Mukofotlar tizimi</h3>
              <p className="font-body text-neutralTextLight dark:text-neutralTextDark">Har bir muvaffaqiyat uchun mukofotlar va yutuqlar qo'lga kiriting</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-card rounded-3xl p-8 border-2 border-primaryBlue shadow-lg hover:scale-105 transition-transform"
            >
              <Sparkle weight="duotone" size={48} className="text-primaryBlue mb-4" />
              <h3 className="font-heading font-bold text-xl mb-3 text-neutralTextLight dark:text-white">AI O'qituvchi</h3>
              <p className="font-body text-neutralTextLight dark:text-neutralTextDark">Sun'iy intellekt asosida shaxsiy o'qituvchi yordami</p>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
