import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Book, Users, ChartBar, ChatCircle } from '@phosphor-icons/react';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="p-6" data-testid="teacher-dashboard">
      <div className="mb-8">
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-primaryPurple dark:text-primaryPink mb-2">
          O'qituvchi Paneli
        </h1>
        <p className="font-body text-neutralTextLight dark:text-neutralTextDark">
          Xush kelibsiz, {user.firstName} {user.lastName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-primaryPurple to-primaryPink rounded-3xl p-6 text-white cursor-pointer hover:scale-105 transition-transform" data-testid="lessons-card">
          <Book weight="fill" size={48} className="mb-4" />
          <h3 className="font-heading font-bold text-xl mb-2">Darslar</h3>
          <p className="font-body text-sm">Darslarni boshqarish</p>
        </div>

        <div className="bg-gradient-to-br from-primaryBlue to-primaryPurple rounded-3xl p-6 text-white cursor-pointer hover:scale-105 transition-transform" data-testid="students-card">
          <Users weight="fill" size={48} className="mb-4" />
          <h3 className="font-heading font-bold text-xl mb-2">O'quvchilar</h3>
          <p className="font-body text-sm">O'quvchilarni kuzatish</p>
        </div>

        <div className="bg-gradient-to-br from-success to-primaryBlue rounded-3xl p-6 text-white cursor-pointer hover:scale-105 transition-transform" data-testid="analytics-card">
          <ChartBar weight="fill" size={48} className="mb-4" />
          <h3 className="font-heading font-bold text-xl mb-2">Analitika</h3>
          <p className="font-body text-sm">Statistika va hisobotlar</p>
        </div>

        <div className="bg-gradient-to-br from-primaryPink to-danger rounded-3xl p-6 text-white cursor-pointer hover:scale-105 transition-transform" data-testid="messages-card">
          <ChatCircle weight="fill" size={48} className="mb-4" />
          <h3 className="font-heading font-bold text-xl mb-2">Xabarlar</h3>
          <p className="font-body text-sm">O'quvchilar bilan muloqot</p>
        </div>
      </div>

      <div className="bg-white dark:bg-backgroundDark rounded-3xl p-8 border-2 border-primaryPurple">
        <h2 className="font-heading font-bold text-2xl mb-4 text-neutralTextLight dark:text-white">
          Tez orada...
        </h2>
        <p className="font-body text-neutralTextLight dark:text-neutralTextDark">
          O'qituvchi paneli funksiyalari yaqinda qo'shiladi. Siz darslar yaratish, o'quvchilarni kuzatish va boshqa ko'plab imkoniyatlarga ega bo'lasiz.
        </p>
      </div>
    </div>
  );
};

export default TeacherDashboard;