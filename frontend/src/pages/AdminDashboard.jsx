import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Book, Island, Trophy, Gear } from '@phosphor-icons/react';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-6" data-testid="admin-dashboard">
      <div className="mb-8">
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-primaryPurple dark:text-primaryPink mb-2">
          Admin Panel
        </h1>
        <p className="font-body text-neutralTextLight dark:text-neutralTextDark">
          Xush kelibsiz, {user.firstName} {user.lastName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-primaryPurple to-primaryPink rounded-3xl p-6 text-white cursor-pointer hover:scale-105 transition-transform" data-testid="users-management-card">
          <Users weight="fill" size={48} className="mb-4" />
          <h3 className="font-heading font-bold text-xl mb-2">Foydalanuvchilar</h3>
          <p className="font-body text-sm">Foydalanuvchilarni boshqarish</p>
        </div>

        <div className="bg-gradient-to-br from-primaryBlue to-primaryPurple rounded-3xl p-6 text-white cursor-pointer hover:scale-105 transition-transform" data-testid="islands-management-card">
          <Island weight="fill" size={48} className="mb-4" />
          <h3 className="font-heading font-bold text-xl mb-2">Orollar</h3>
          <p className="font-body text-sm">Orollarni boshqarish</p>
        </div>

        <div className="bg-gradient-to-br from-success to-primaryBlue rounded-3xl p-6 text-white cursor-pointer hover:scale-105 transition-transform" data-testid="lessons-management-card">
          <Book weight="fill" size={48} className="mb-4" />
          <h3 className="font-heading font-bold text-xl mb-2">Darslar</h3>
          <p className="font-body text-sm">Darslarni boshqarish</p>
        </div>

        <div className="bg-gradient-to-br from-primaryPink to-danger rounded-3xl p-6 text-white cursor-pointer hover:scale-105 transition-transform" data-testid="rewards-management-card">
          <Trophy weight="fill" size={48} className="mb-4" />
          <h3 className="font-heading font-bold text-xl mb-2">Mukofotlar</h3>
          <p className="font-body text-sm">Mukofotlarni boshqarish</p>
        </div>

        <div className="bg-gradient-to-br from-warning to-primaryPink rounded-3xl p-6 text-white cursor-pointer hover:scale-105 transition-transform" data-testid="settings-card">
          <Gear weight="fill" size={48} className="mb-4" />
          <h3 className="font-heading font-bold text-xl mb-2">Sozlamalar</h3>
          <p className="font-body text-sm">Tizim sozlamalari</p>
        </div>
      </div>

      <div className="bg-white dark:bg-backgroundDark rounded-3xl p-8 border-2 border-primaryPurple">
        <h2 className="font-heading font-bold text-2xl mb-4 text-neutralTextLight dark:text-white">
          Tez orada...
        </h2>
        <p className="font-body text-neutralTextLight dark:text-neutralTextDark">
          Admin panel funksiyalari yaqinda qo'shiladi. Siz butun platformani boshqarish, foydalanuvchilarni nazorat qilish va tizim sozlamalarini o'zgartirish imkoniyatiga ega bo'lasiz.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;