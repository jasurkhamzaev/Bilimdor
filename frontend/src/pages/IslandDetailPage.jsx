import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Lock, CheckCircle } from '@phosphor-icons/react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const IslandDetailPage = () => {
  const { islandId } = useParams();
  const navigate = useNavigate();
  const [island, setIsland] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [islandId]);

  const fetchData = async () => {
    try {
      const [islandRes, subjectsRes] = await Promise.all([
        axios.get(`${API}/islands/${islandId}`, { withCredentials: true }),
        axios.get(`${API}/subjects?island_id=${islandId}`, { withCredentials: true })
      ]);
      setIsland(islandRes.data);
      setSubjects(subjectsRes.data);
      if (subjectsRes.data.length > 0) {
        setSelectedSubject(subjectsRes.data[0]);
        const lessonsRes = await axios.get(`${API}/lessons?subject_id=${subjectsRes.data[0].id}`, { withCredentials: true });
        setLessons(lessonsRes.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectSubject = async (subject) => {
    setSelectedSubject(subject);
    try {
      const { data } = await axios.get(`${API}/lessons?subject_id=${subject.id}`, { withCredentials: true });
      setLessons(data);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading || !island) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primaryPurple"></div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="island-detail-page">
      <button
        onClick={() => navigate('/dashboard/islands')}
        className="flex items-center gap-2 mb-6 font-body font-bold text-primaryPurple hover:text-primaryPink"
        data-testid="back-button"
      >
        <ArrowLeft weight="bold" size={20} /> Orqaga
      </button>

      <div className="mb-8 p-6 rounded-3xl" style={{ backgroundColor: island.color + '30' }}>
        <h1 className="font-heading font-black text-3xl sm:text-4xl mb-2" style={{ color: island.color }}>
          {island.nameUz}
        </h1>
        <p className="font-body text-neutralTextLight dark:text-neutralTextDark">
          {island.descriptionUz}
        </p>
      </div>

      <h2 className="font-heading font-bold text-2xl mb-4 text-neutralTextLight dark:text-white">Fanlar</h2>
      <div className="flex flex-wrap gap-3 mb-8">
        {subjects.map((s) => (
          <button
            key={s.id}
            onClick={() => selectSubject(s)}
            className={`px-6 py-3 rounded-2xl font-body font-bold transition-all ${
              selectedSubject?.id === s.id
                ? 'text-white'
                : 'bg-muted text-neutralTextLight dark:text-neutralTextDark'
            }`}
            style={selectedSubject?.id === s.id ? { backgroundColor: s.color } : {}}
            data-testid={`subject-${s.id}`}
          >
            {s.nameUz}
          </button>
        ))}
      </div>

      <h2 className="font-heading font-bold text-2xl mb-4 text-neutralTextLight dark:text-white">
        Darslar ({lessons.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lessons.length === 0 && (
          <p className="font-body text-neutralTextLight dark:text-neutralTextDark col-span-full">
            Bu fan uchun darslar hali qo'shilmagan. Tez orada qo'shamiz!
          </p>
        )}
        {lessons.map((lesson, idx) => (
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => navigate(`/dashboard/lessons/${lesson.id}`)}
            className="bg-white dark:bg-backgroundDark rounded-3xl p-6 border-2 border-primaryPurple/20 cursor-pointer hover:border-primaryPurple hover:scale-[1.02] transition-all"
            data-testid={`lesson-${lesson.id}`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primaryPurple flex items-center justify-center flex-shrink-0">
                <BookOpen weight="fill" size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-bold text-lg mb-1 text-neutralTextLight dark:text-white">
                  {lesson.titleUz}
                </h3>
                <p className="font-body text-sm text-neutralTextLight dark:text-neutralTextDark mb-2">
                  {lesson.description}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-body font-bold text-primaryPink">+{lesson.xpReward} XP</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default IslandDetailPage;
