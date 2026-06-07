import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Floating particles background
export const MagicalParticles = ({ count = 30 }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-white"
          initial={{
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
            opacity: 0
          }}
          animate={{
            y: ['0%', '-100%'],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'linear'
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: '0 0 8px rgba(255,255,255,0.8)'
          }}
        />
      ))}
    </div>
  );
};

// Floating cloud SVG
const Cloud = ({ delay = 0, top = '20%', size = 80, opacity = 0.6 }) => (
  <motion.div
    className="absolute"
    style={{ top, opacity }}
    initial={{ x: '-150px' }}
    animate={{ x: '110vw' }}
    transition={{ duration: 60 + delay * 10, repeat: Infinity, delay, ease: 'linear' }}
  >
    <svg width={size} height={size / 2} viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="30" rx="20" ry="15" fill="white" />
      <ellipse cx="40" cy="25" rx="25" ry="20" fill="white" />
      <ellipse cx="65" cy="30" rx="20" ry="15" fill="white" />
      <ellipse cx="80" cy="35" rx="15" ry="12" fill="white" />
    </svg>
  </motion.div>
);

const islandConfigs = {
  quvonch: {
    bgGradient: 'from-pink-300 via-yellow-200 to-pink-400',
    glowColor: 'rgba(232, 121, 168, 0.6)',
    accentColor: '#E879A8',
    sky: 'from-pink-200 via-purple-100 to-blue-200',
    emoji: '🌈',
    visualEmojis: ['🌈', '📚', '🔢', '🐶', '🌸', '🎨'],
    subjects: [
      { icon: '📖', label: "O'qish" },
      { icon: '🔤', label: 'Ona tili' },
      { icon: '➕', label: 'Matematika' },
      { icon: '🌳', label: 'Tabiat' },
      { icon: '🎨', label: "San'at" },
      { icon: '🎵', label: 'Musiqa' }
    ],
    hashimjonMsg: 'Bu yerda ilk bilimlar boshlanadi! ✨',
    atmosphere: 'Quvonchli sarguzasht'
  },
  kashfiyot: {
    bgGradient: 'from-blue-400 via-cyan-300 to-emerald-400',
    glowColor: 'rgba(91, 141, 239, 0.6)',
    accentColor: '#5B8DEF',
    sky: 'from-blue-300 via-cyan-200 to-green-200',
    emoji: '🔬',
    visualEmojis: ['🤖', '🌍', '🦖', '🔭', '🧪', '🗺'],
    subjects: [
      { icon: '🤖', label: 'Texnologiya' },
      { icon: '🧪', label: 'Kimyo' },
      { icon: '🌍', label: 'Geografiya' },
      { icon: '📜', label: 'Tarix' },
      { icon: '🧬', label: 'Biologiya' },
      { icon: '📐', label: 'Geometriya' }
    ],
    hashimjonMsg: 'Keling, birga kashf qilamiz! 🔭',
    atmosphere: 'Kashfiyot va izlanish'
  },
  kelajak: {
    bgGradient: 'from-purple-700 via-indigo-600 to-cyan-500',
    glowColor: 'rgba(155, 89, 245, 0.7)',
    accentColor: '#9B59F5',
    sky: 'from-purple-900 via-indigo-800 to-blue-900',
    emoji: '🚀',
    visualEmojis: ['🚀', '🧠', '💻', '🛰', '🎓', '⚛'],
    subjects: [
      { icon: '💻', label: 'Dasturlash' },
      { icon: '🧠', label: "Sun'iy intellekt" },
      { icon: '⚛', label: 'Fizika' },
      { icon: '🧬', label: 'Biologiya' },
      { icon: '📊', label: 'Matematika' },
      { icon: '🎓', label: 'Universitetga' }
    ],
    hashimjonMsg: 'Kelajak aynan shu yerda yaratiladi! 🌟',
    atmosphere: 'Kelajak texnologiyalari'
  }
};

export const getIslandConfig = (name) => {
  const key = name?.toLowerCase().includes('quvonch') ? 'quvonch'
    : name?.toLowerCase().includes('kashfiyot') ? 'kashfiyot'
    : name?.toLowerCase().includes('kelajak') ? 'kelajak'
    : 'quvonch';
  return islandConfigs[key];
};

// Premium floating island card with 3D feel
export const MagicalIsland = ({ island, index, onClick, showHashimjon = true }) => {
  const config = getIslandConfig(island.nameUz || island.name);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2, duration: 0.8, type: 'spring' }}
      className="relative cursor-pointer group"
      onClick={onClick}
      data-testid={`magical-island-${island.id}`}
    >
      {/* Hashimjon character beside island */}
      {showHashimjon && (
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.2 + 0.6 }}
          className="absolute -top-16 -left-4 sm:-left-8 z-20 hidden md:block"
        >
          <div className="relative">
            <motion.img
              src="https://images.unsplash.com/photo-1639628735078-ed2f038a193e?q=85&w=200"
              alt="Hashimjon"
              className="w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <div className="absolute -top-2 -right-32 bg-white rounded-2xl p-2 px-3 shadow-lg whitespace-nowrap text-xs font-bold text-neutralTextLight max-w-[180px]">
              {config.hashimjonMsg}
              <div className="absolute -left-2 top-3 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white"></div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Floating Island */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4 + index * 0.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        {/* Glow effect under island */}
        <div
          className="absolute -inset-8 rounded-full blur-3xl opacity-50 group-hover:opacity-90 transition-opacity duration-500"
          style={{ background: config.glowColor }}
        />

        {/* Main island shape - circular floating world */}
        <motion.div
          whileHover={{ scale: 1.08, rotate: 2 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="relative w-full aspect-square max-w-md mx-auto"
        >
          {/* Sky/Background circle */}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.sky} shadow-2xl border-4 border-white/40 overflow-hidden`}>
            {/* Mini particles inside */}
            <MagicalParticles count={15} />
            
            {/* Floating emojis */}
            {config.visualEmojis.map((emoji, idx) => {
              const angle = (idx / config.visualEmojis.length) * 2 * Math.PI;
              const radius = 35;
              const x = 50 + radius * Math.cos(angle);
              const y = 50 + radius * Math.sin(angle);
              return (
                <motion.div
                  key={idx}
                  className="absolute text-3xl"
                  style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{
                    duration: 3 + idx * 0.3,
                    repeat: Infinity,
                    delay: idx * 0.2
                  }}
                >
                  {emoji}
                </motion.div>
              );
            })}

            {/* Center main emoji */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center text-7xl sm:text-8xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {config.emoji}
            </motion.div>
          </div>

          {/* Island base (rocky ground) */}
          <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-gradient-to-b ${config.bgGradient} rounded-b-full rounded-t-3xl shadow-2xl opacity-90`}></div>
          
          {/* Rotating ring around island */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-dashed opacity-30"
            style={{ borderColor: config.accentColor }}
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>

        {/* Island Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.2 + 0.4 }}
          className="mt-8 bg-white/95 dark:bg-backgroundDark/95 backdrop-blur-xl rounded-3xl p-6 border-2 shadow-xl"
          style={{ borderColor: config.accentColor }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-black text-xl sm:text-2xl text-neutralTextLight dark:text-white">
              {island.nameUz || island.name}
            </h3>
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: config.accentColor }}>
              {island.gradeMin}-{island.gradeMax} sinf
            </span>
          </div>
          
          <p className="font-body text-sm text-neutralTextLight dark:text-neutralTextDark mb-4">
            {config.atmosphere}
          </p>

          {/* Subjects grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {config.subjects.slice(0, 6).map((s, idx) => (
              <div key={idx} className="bg-muted rounded-xl p-2 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-[10px] font-bold text-neutralTextLight dark:text-neutralTextDark truncate">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <button
            className="w-full py-3 rounded-2xl font-bold text-white shadow-lg hover:shadow-xl transition-all border-b-4"
            style={{
              backgroundColor: config.accentColor,
              borderBottomColor: config.accentColor + 'CC'
            }}
            data-testid={`enter-island-${island.id}`}
          >
            Sayohatni boshlash →
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// Sky background with clouds, birds, stars
export const MagicalSkyBackground = ({ variant = 'day' }) => {
  const isNight = variant === 'night';
  
  return (
    <div className={`absolute inset-0 overflow-hidden ${isNight ? 'bg-gradient-to-b from-indigo-900 via-purple-900 to-blue-950' : 'bg-gradient-to-b from-blue-300 via-purple-200 to-pink-200'}`}>
      {/* Aurora effect */}
      <div className="absolute inset-0 opacity-30">
        <motion.div
          className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, #E879A8, transparent 70%)' }}
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 right-0 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, #9B59F5, transparent 70%)' }}
          animate={{ x: [0, -80, 0], y: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, #5B8DEF, transparent 70%)' }}
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity }}
        />
      </div>

      {/* Clouds */}
      <Cloud delay={0} top="10%" size={120} opacity={0.7} />
      <Cloud delay={3} top="25%" size={80} opacity={0.5} />
      <Cloud delay={6} top="45%" size={100} opacity={0.6} />
      <Cloud delay={9} top="65%" size={90} opacity={0.4} />

      {/* Stars (always visible) */}
      <MagicalParticles count={40} />

      {/* Sun/Moon */}
      <div className="absolute top-10 right-10">
        <motion.div
          className={`w-20 h-20 rounded-full ${isNight ? 'bg-gradient-to-br from-yellow-100 to-yellow-200' : 'bg-gradient-to-br from-yellow-300 to-orange-400'}`}
          style={{ boxShadow: isNight ? '0 0 60px rgba(255, 255, 200, 0.5)' : '0 0 80px rgba(255, 200, 0, 0.8)' }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>
    </div>
  );
};
