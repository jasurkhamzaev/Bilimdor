import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash, BookOpen, Sparkle } from '@phosphor-icons/react';
import { toast } from 'sonner';
import Button3D from '@/components/Button3D';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TeacherLessonsCMS = () => {
  const [lessons, setLessons] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiGrade, setAiGrade] = useState(5);
  const [generating, setGenerating] = useState(false);
  
  const [form, setForm] = useState({
    title: '', titleUz: '', titleRu: '', description: '', subjectId: '',
    content: '', videoUrl: '', order: 1, xpReward: 50, isPublished: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [lessonsRes, subjectsRes] = await Promise.all([
        axios.get(`${API}/lessons`, { withCredentials: true }),
        axios.get(`${API}/subjects`, { withCredentials: true })
      ]);
      setLessons(lessonsRes.data);
      setSubjects(subjectsRes.data);
    } catch (error) {
      toast.error('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.subjectId || !form.content) {
      toast.error('Iltimos majburiy maydonlarni to\'ldiring');
      return;
    }
    try {
      await axios.post(`${API}/lessons`, {
        ...form,
        titleUz: form.titleUz || form.title,
        titleRu: form.titleRu || form.title,
        isPublished: true
      }, { withCredentials: true });
      toast.success('Dars yaratildi!');
      setOpen(false);
      setForm({ title: '', titleUz: '', titleRu: '', description: '', subjectId: '', content: '', videoUrl: '', order: 1, xpReward: 50, isPublished: false });
      fetchData();
    } catch (error) {
      toast.error('Saqlashda xatolik: ' + (error.response?.data?.detail || error.message));
    }
  };

  const generateQuiz = async (lessonId, lessonTitle) => {
    setGenerating(true);
    try {
      const { data } = await axios.post(
        `${API}/ai/generate-quiz`,
        { topic: lessonTitle, grade: 5, numQuestions: 5, language: 'uz' },
        { withCredentials: true, timeout: 60000 }
      );
      
      // Create quiz from generated questions
      await axios.post(`${API}/quizzes`, {
        lessonId: lessonId,
        title: `${lessonTitle} testi`,
        titleUz: `${lessonTitle} testi`,
        titleRu: `Тест: ${lessonTitle}`,
        questions: data.questions.map(q => ({
          id: crypto.randomUUID(),
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || ''
        })),
        passingScore: 70,
        xpReward: 30
      }, { withCredentials: true });
      
      toast.success('AI test muvaffaqiyatli yaratildi!');
    } catch (error) {
      toast.error('Test yaratishda xatolik');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="p-6 flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primaryPurple"></div></div>;

  return (
    <div className="p-6" data-testid="teacher-lessons-cms">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-heading font-black text-3xl text-primaryPurple dark:text-primaryPink">Darslar boshqaruvi</h1>
          <p className="font-body text-neutralTextLight dark:text-neutralTextDark">Yangi darslar yarating va testlar qo'shing</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button3D variant="pink" data-testid="add-lesson-button">
              <Plus weight="bold" size={20} className="inline mr-2" /> Yangi dars
            </Button3D>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yangi dars yaratish</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Sarlavha (Uzbek)</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, titleUz: e.target.value })} data-testid="lesson-title-input" />
              </div>
              <div>
                <Label>Tavsif</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="lesson-description-input" />
              </div>
              <div>
                <Label>Fan</Label>
                <Select value={form.subjectId} onValueChange={(v) => setForm({ ...form, subjectId: v })}>
                  <SelectTrigger data-testid="lesson-subject-select"><SelectValue placeholder="Fanni tanlang" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.nameUz}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Video URL (YouTube embed)</Label>
                <Input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://www.youtube.com/embed/..." data-testid="lesson-video-input" />
              </div>
              <div>
                <Label>Dars matni</Label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} data-testid="lesson-content-input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tartib</Label>
                  <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })} data-testid="lesson-order-input" />
                </div>
                <div>
                  <Label>XP mukofot</Label>
                  <Input type="number" value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: parseInt(e.target.value) })} data-testid="lesson-xp-input" />
                </div>
              </div>
              <Button3D variant="purple" onClick={handleSubmit} className="w-full" data-testid="save-lesson">
                Saqlash
              </Button3D>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessons.length === 0 ? (
          <p className="font-body text-neutralTextLight dark:text-neutralTextDark col-span-full">
            Darslar hali qo'shilmagan. "Yangi dars" tugmasini bosing.
          </p>
        ) : lessons.map((lesson) => (
          <div key={lesson.id} className="bg-white dark:bg-backgroundDark rounded-3xl p-6 border-2 border-primaryPurple/20" data-testid={`lesson-card-${lesson.id}`}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-primaryPurple flex items-center justify-center">
                <BookOpen weight="fill" size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-bold text-lg text-neutralTextLight dark:text-white">{lesson.titleUz}</h3>
                <p className="font-body text-xs text-primaryPink">+{lesson.xpReward} XP</p>
              </div>
            </div>
            <p className="font-body text-sm text-neutralTextLight dark:text-neutralTextDark mb-4 line-clamp-2">{lesson.description}</p>
            <button
              onClick={() => generateQuiz(lesson.id, lesson.titleUz)}
              disabled={generating}
              className="w-full px-4 py-2 rounded-2xl bg-gradient-to-r from-primaryPurple to-primaryPink text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              data-testid={`generate-quiz-${lesson.id}`}
            >
              <Sparkle weight="fill" size={16} />
              {generating ? 'AI yaratmoqda...' : 'AI bilan test yaratish'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherLessonsCMS;
