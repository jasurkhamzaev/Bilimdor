import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Star, Sparkle, Island, Trophy, GameController } from '@phosphor-icons/react';
import Button3D from '@/components/Button3D';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-backgroundLight dark:bg-backgroundDark">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20" data-testid="hero-section">
        <div className="absolute inset-0 bg-gradient-to-br from-primaryPink/20 via-primaryPurple/20 to-primaryBlue/20" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block mb-6 px-4 py-2 rounded-full bg-primaryPurple/10 border-2 border-primaryPurple" data-testid="hero-badge">
                <span className="font-body font-bold text-primaryPurple flex items-center gap-2">
                  <Star weight="fill" size={20} />
                  {t('hero.badge')}
                </span>
              </div>

              <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-primaryPurple via-primaryPink to-primaryBlue bg-clip-text text-transparent" data-testid="hero-title">
                {t('hero.title')}
              </h1>

              <p className="font-body text-base sm:text-lg text-neutralTextLight dark:text-neutralTextDark mb-8 leading-relaxed" data-testid="hero-description">
                {t('hero.description')}
              </p>

              <div className="flex flex-wrap gap-4">
                <Button3D
                  variant="pink"
                  size="lg"
                  onClick={() => navigate('/auth')}
                  data-testid="hero-start-button"
                >
                  {t('hero.startButton')}
                </Button3D>
                <Button3D
                  variant="purple"
                  size="lg"
                  onClick={() => document.getElementById('islands').scrollIntoView({ behavior: 'smooth' })}
                  data-testid="hero-map-button"
                >
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

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative animate-float">
                <img
                  src="https://images.unsplash.com/photo-1639628735078-ed2f038a193e?q=85"
                  alt="Hashimjon"
                  className="w-full max-w-md mx-auto rounded-3xl shadow-2xl"
                  data-testid="hero-image"
                />
                <div className="absolute -top-6 -right-6 bg-white dark:bg-backgroundDark rounded-2xl p-4 shadow-xl border-2 border-primaryPink">
                  <div className="font-body font-bold text-neutralTextLight dark:text-neutralTextDark" data-testid="hero-greeting">
                    {t('hero.hashimjonGreeting')} 👋
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Knowledge Islands Section */}
      <section id="islands" className="py-20 bg-white dark:bg-backgroundDark" data-testid="islands-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl mb-4 text-primaryPurple dark:text-primaryPink">
              Bilim Orollari
            </h2>
            <p className="font-body text-base sm:text-lg text-neutralTextLight dark:text-neutralTextDark">
              Har bir orol yangi sarguzasht va bilimlar bilan to'la
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Island 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group"
              data-testid="island-quvonch"
            >
              <div className="bg-gradient-to-br from-pink-100 to-yellow-100 dark:from-pink-900/20 dark:to-yellow-900/20 rounded-3xl p-8 border-2 border-primaryPink transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-primaryPink flex items-center justify-center mb-4 mx-auto">
                  <Island weight="fill" size={32} className="text-white" />
                </div>
                <h3 className="font-heading font-bold text-xl sm:text-2xl mb-2 text-center text-neutralTextLight dark:text-white">
                  {t('islands.quvonch.name')}
                </h3>
                <p className="font-body text-sm text-center text-primaryPink font-bold mb-4">
                  {t('islands.quvonch.grades')}
                </p>
                <p className="font-body text-base text-center text-neutralTextLight dark:text-neutralTextDark">
                  {t('islands.quvonch.description')}
                </p>
              </div>
            </motion.div>

            {/* Island 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group"
              data-testid="island-kashfiyot"
            >
              <div className="bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/20 dark:to-green-900/20 rounded-3xl p-8 border-2 border-primaryBlue transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-primaryBlue flex items-center justify-center mb-4 mx-auto">
                  <Sparkle weight="fill" size={32} className="text-white" />
                </div>
                <h3 className="font-heading font-bold text-xl sm:text-2xl mb-2 text-center text-neutralTextLight dark:text-white">
                  {t('islands.kashfiyot.name')}
                </h3>
                <p className="font-body text-sm text-center text-primaryBlue font-bold mb-4">
                  {t('islands.kashfiyot.grades')}
                </p>
                <p className="font-body text-base text-center text-neutralTextLight dark:text-neutralTextDark">
                  {t('islands.kashfiyot.description')}
                </p>
              </div>
            </motion.div>

            {/* Island 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="group"
              data-testid="island-kelajak"
            >
              <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-3xl p-8 border-2 border-primaryPurple transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-primaryPurple flex items-center justify-center mb-4 mx-auto">
                  <Trophy weight="fill" size={32} className="text-white" />
                </div>
                <h3 className="font-heading font-bold text-xl sm:text-2xl mb-2 text-center text-neutralTextLight dark:text-white">
                  {t('islands.kelajak.name')}
                </h3>
                <p className="font-body text-sm text-center text-primaryPurple font-bold mb-4">
                  {t('islands.kelajak.grades')}
                </p>
                <p className="font-body text-base text-center text-neutralTextLight dark:text-neutralTextDark">
                  {t('islands.kelajak.description')}
                </p>
              </div>
            </motion.div>
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
              className="bg-white dark:bg-backgroundDark rounded-3xl p-8 border-2 border-primaryPink shadow-lg"
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
              className="bg-white dark:bg-backgroundDark rounded-3xl p-8 border-2 border-primaryPurple shadow-lg"
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
              className="bg-white dark:bg-backgroundDark rounded-3xl p-8 border-2 border-primaryBlue shadow-lg"
            >
              <Star weight="duotone" size={48} className="text-primaryBlue mb-4" />
              <h3 className="font-heading font-bold text-xl mb-3 text-neutralTextLight dark:text-white">Reyting tizimi</h3>
              <p className="font-body text-neutralTextLight dark:text-neutralTextDark">Do'stlaringiz bilan raqobatlashing va eng yaxshilar orasiga kiring</p>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;