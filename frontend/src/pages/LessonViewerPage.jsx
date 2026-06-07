import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, PlayCircle, CheckCircle, XCircle, Trophy } from '@phosphor-icons/react';
import { toast } from 'sonner';
import Button3D from '@/components/Button3D';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LessonViewerPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const fetchData = async () => {
    try {
      const lessonRes = await axios.get(`${API}/lessons/${lessonId}`, { withCredentials: true });
      setLesson(lessonRes.data);
      const quizzesRes = await axios.get(`${API}/quizzes?lesson_id=${lessonId}`, { withCredentials: true });
      if (quizzesRes.data.length > 0) {
        setQuiz(quizzesRes.data[0]);
      }
    } catch (error) {
      toast.error('Darsni yuklab bo\'lmadi');
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async () => {
    try {
      await axios.post(
        `${API}/progress/${lessonId}`,
        { progress: 100 },
        { withCredentials: true }
      );
      toast.success(`Tabriklaymiz! +${lesson.xpReward} XP qo'lga kiritdingiz!`);
      if (quiz) {
        setShowQuiz(true);
      }
    } catch (error) {
      toast.error('Saqlashda xatolik');
    }
  };

  const submitQuiz = async () => {
    if (!quiz) return;
    const answerArray = quiz.questions.map((_, idx) => answers[idx] ?? -1);
    if (answerArray.some(a => a === -1)) {
      toast.error('Iltimos barcha savollarga javob bering');
      return;
    }
    try {
      const { data } = await axios.post(
        `${API}/quizzes/submit`,
        { quizId: quiz.id, answers: answerArray },
        { withCredentials: true }
      );
      setResult(data);
      setSubmitted(true);
      if (data.passed) {
        toast.success(`Test muvaffaqiyatli! Ball: ${data.score}%, +${quiz.xpReward} XP`);
      } else {
        toast.error(`Test natija: ${data.score}%. Yana urinib ko'ring!`);
      }
    } catch (error) {
      toast.error('Testni yuborishda xatolik');
    }
  };

  if (loading || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primaryPurple"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto" data-testid="lesson-viewer">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 font-body font-bold text-primaryPurple hover:text-primaryPink"
        data-testid="back-button"
      >
        <ArrowLeft weight="bold" size={20} /> Orqaga
      </button>

      <h1 className="font-heading font-black text-3xl sm:text-4xl mb-4 text-primaryPurple dark:text-primaryPink">
        {lesson.titleUz}
      </h1>
      <p className="font-body text-lg text-neutralTextLight dark:text-neutralTextDark mb-8">
        {lesson.description}
      </p>

      {/* Video Player */}
      {lesson.videoUrl && (
        <div className="mb-8 rounded-3xl overflow-hidden bg-black aspect-video border-2 border-primaryPurple">
          <iframe
            src={lesson.videoUrl}
            title={lesson.titleUz}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            data-testid="video-player"
          />
        </div>
      )}

      {/* Content */}
      <div className="bg-white dark:bg-backgroundDark rounded-3xl p-8 border-2 border-primaryPurple/20 mb-8">
        <div className="prose dark:prose-invert max-w-none font-body text-base leading-relaxed text-neutralTextLight dark:text-neutralTextDark whitespace-pre-wrap">
          {lesson.content}
        </div>
      </div>

      {!showQuiz && !submitted && (
        <div className="text-center">
          <Button3D variant="purple" size="lg" onClick={markComplete} data-testid="complete-lesson">
            Darsni tugatdim ({quiz ? 'Testga o\'tish' : `+${lesson.xpReward} XP`})
          </Button3D>
        </div>
      )}

      {/* Quiz */}
      {showQuiz && quiz && !submitted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-backgroundDark rounded-3xl p-8 border-2 border-primaryPink"
          data-testid="quiz-section"
        >
          <h2 className="font-heading font-black text-2xl mb-6 text-primaryPink flex items-center gap-2">
            <Trophy weight="fill" size={32} />
            {quiz.titleUz}
          </h2>
          {quiz.questions.map((q, qIdx) => (
            <div key={q.id} className="mb-6" data-testid={`question-${qIdx}`}>
              <p className="font-body font-bold text-lg mb-3 text-neutralTextLight dark:text-white">
                {qIdx + 1}. {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => setAnswers({ ...answers, [qIdx]: oIdx })}
                    className={`w-full text-left px-4 py-3 rounded-2xl border-2 font-body transition-all ${
                      answers[qIdx] === oIdx
                        ? 'border-primaryPurple bg-primaryPurple text-white'
                        : 'border-muted hover:border-primaryPurple text-neutralTextLight dark:text-white'
                    }`}
                    data-testid={`option-${qIdx}-${oIdx}`}
                  >
                    {String.fromCharCode(65 + oIdx)}. {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <Button3D variant="pink" size="lg" onClick={submitQuiz} data-testid="submit-quiz">
            Javoblarni yuborish
          </Button3D>
        </motion.div>
      )}

      {/* Results */}
      {submitted && result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-3xl p-8 text-center text-white ${
            result.passed ? 'bg-gradient-to-br from-success to-primaryBlue' : 'bg-gradient-to-br from-danger to-warning'
          }`}
          data-testid="quiz-result"
        >
          {result.passed ? (
            <CheckCircle weight="fill" size={80} className="mx-auto mb-4" />
          ) : (
            <XCircle weight="fill" size={80} className="mx-auto mb-4" />
          )}
          <h2 className="font-heading font-black text-3xl mb-2">
            {result.passed ? 'Tabriklaymiz!' : 'Yana urinib ko\'ring'}
          </h2>
          <p className="font-body text-xl mb-2">
            Natija: {result.score}% ({result.correctCount}/{result.totalQuestions})
          </p>
          {result.passed && <p className="font-body text-lg">+{quiz.xpReward} XP qo'lga kiritdingiz!</p>}
          <div className="mt-6 flex gap-3 justify-center flex-wrap">
            <Button3D variant="purple" onClick={() => navigate('/dashboard')} data-testid="back-to-dashboard">
              Dashboard
            </Button3D>
            {result.passed && (
              <a
                href={`${API}/certificates/${lessonId}`}
                target="_blank"
                rel="noreferrer"
                data-testid="download-certificate"
              >
                <Button3D variant="pink">
                  📜 Sertifikatni yuklab olish
                </Button3D>
              </a>
            )}
            {!result.passed && (
              <Button3D variant="pink" onClick={() => { setSubmitted(false); setAnswers({}); setResult(null); }} data-testid="retry-quiz">
                Qaytadan urinish
              </Button3D>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LessonViewerPage;
