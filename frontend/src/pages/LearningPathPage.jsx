import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkle, TrendUp, Warning, Lightbulb, Robot } from '@phosphor-icons/react';
import { toast } from 'sonner';
import Button3D from '@/components/Button3D';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LearningPathPage = () => {
  const { user } = useAuth();
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    // Load cached path from user object
    if (user?.learningPath) {
      setPath(user.learningPath);
    }
  }, [user]);

  const generatePath = async () => {
    setGenerating(true);
    try {
      const { data } = await axios.post(`${API}/ai/learning-path`, {}, {
        withCredentials: true,
        timeout: 90000
      });
      setPath(data);
      toast.success('Shaxsiy o\'quv yo\'lingiz tayyor!');
    } catch (error) {
      toast.error('AI tahlilida xatolik: ' + (error.response?.data?.detail || error.message));
    } finally {
      setGenerating(false);
    }
  };

  const priorityColors = {
    high: 'bg-danger text-white',
    medium: 'bg-warning text-white',
    low: 'bg-success text-white'
  };
  const priorityLabels = {
    high: "Yuqori muhim",
    medium: "O'rtacha",
    low: "Past"
  };

  return (
    <div className="p-6" data-testid="learning-path-page">
      <div className="mb-8">
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-primaryPurple dark:text-primaryPink mb-2 flex items-center gap-3">
          <Sparkle weight="fill" size={40} />
          AI Shaxsiy O'quv Yo'li
        </h1>
        <p className="font-body text-neutralTextLight dark:text-neutralTextDark">
          Kimi AI sizning natijalaringizni tahlil qilib, shaxsiy o'quv rejasi tavsiya qiladi
        </p>
      </div>

      {!path ? (
        <div className="bg-gradient-to-br from-primaryPurple to-primaryPink rounded-3xl p-8 text-white text-center">
          <Robot weight="fill" size={80} className="mx-auto mb-4 opacity-90" />
          <h2 className="font-heading font-black text-2xl mb-3">
            AI sizning o'quv yo'lingizni tahlil qilishi mumkin
          </h2>
          <p className="font-body mb-6 opacity-90">
            Test natijalaringiz va darslar progressi asosida shaxsiy reja tuziladi
          </p>
          <Button3D variant="pink" size="lg" onClick={generatePath} disabled={generating} data-testid="generate-path">
            {generating ? 'AI tahlil qilmoqda... (30-60s)' : "Shaxsiy yo'l yaratish"}
          </Button3D>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Motivation */}
          {path.motivationMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-primaryPurple to-primaryPink rounded-3xl p-6 text-white"
            >
              <p className="font-body text-lg italic">"{path.motivationMessage}"</p>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-card rounded-3xl p-6 border-2 border-success">
              <h3 className="font-heading font-bold text-xl mb-4 text-success flex items-center gap-2">
                <TrendUp weight="fill" size={28} />
                Kuchli fanlaringiz
              </h3>
              {(path.strengths || []).length === 0 ? (
                <p className="font-body text-sm text-neutralTextLight dark:text-neutralTextDark">
                  Hali ma'lumot yo'q. Ko'proq test ishlang!
                </p>
              ) : (
                <ul className="space-y-2">
                  {path.strengths.map((s, idx) => (
                    <li key={idx} className="font-body flex items-center gap-2 text-neutralTextLight dark:text-white">
                      <span className="w-2 h-2 rounded-full bg-success"></span>
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>

            {/* Weaknesses */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-card rounded-3xl p-6 border-2 border-warning">
              <h3 className="font-heading font-bold text-xl mb-4 text-warning flex items-center gap-2">
                <Warning weight="fill" size={28} />
                Yaxshilash kerak
              </h3>
              {(path.weaknesses || []).length === 0 ? (
                <p className="font-body text-sm text-neutralTextLight dark:text-neutralTextDark">
                  Ajoyib! Zaif fanlar topilmadi
                </p>
              ) : (
                <ul className="space-y-2">
                  {path.weaknesses.map((w, idx) => (
                    <li key={idx} className="font-body flex items-center gap-2 text-neutralTextLight dark:text-white">
                      <span className="w-2 h-2 rounded-full bg-warning"></span>
                      {w}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </div>

          {/* Recommendations */}
          <div className="bg-white dark:bg-card rounded-3xl p-6 border-2 border-primaryPurple">
            <h3 className="font-heading font-bold text-xl mb-4 text-primaryPurple flex items-center gap-2">
              <Lightbulb weight="fill" size={28} />
              Tavsiyalar
            </h3>
            <div className="space-y-3">
              {(path.recommendations || []).map((rec, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 rounded-2xl bg-muted/50 border border-primaryPurple/20"
                  data-testid={`recommendation-${idx}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-heading font-bold text-neutralTextLight dark:text-white">{rec.subject}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${priorityColors[rec.priority] || priorityColors.medium}`}>
                      {priorityLabels[rec.priority] || rec.priority}
                    </span>
                  </div>
                  <p className="font-body text-sm text-neutralTextLight dark:text-neutralTextDark">{rec.advice}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Performance stats */}
          {path.userPerformance && path.userPerformance.length > 0 && (
            <div className="bg-white dark:bg-card rounded-3xl p-6 border-2 border-primaryBlue">
              <h3 className="font-heading font-bold text-xl mb-4 text-primaryBlue">
                📊 Test statistikalaringiz
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {path.userPerformance.map((p, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-muted/30">
                    <div className="font-body font-bold text-neutralTextLight dark:text-white">{p.subject}</div>
                    <div className="text-sm text-neutralTextLight dark:text-neutralTextDark">{p.attempts} marta urindi</div>
                    <div className="text-2xl font-heading font-black text-primaryPurple">{p.avgScore}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            <Button3D variant="purple" onClick={generatePath} disabled={generating} data-testid="regenerate-path">
              {generating ? 'Yangilanmoqda...' : "🔄 Qaytadan tahlil qilish"}
            </Button3D>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPathPage;
