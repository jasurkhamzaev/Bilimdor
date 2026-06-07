import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash, Users, ShieldCheck } from '@phosphor-icons/react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminUsersCMS = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${API}/admin/users`, { withCredentials: true });
      setUsers(data);
    } catch (error) {
      toast.error('Foydalanuvchilarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Foydalanuvchini o\'chirishni tasdiqlaysizmi?')) return;
    try {
      await axios.delete(`${API}/admin/users/${userId}`, { withCredentials: true });
      toast.success('Foydalanuvchi o\'chirildi');
      fetchUsers();
    } catch (error) {
      toast.error('O\'chirishda xatolik');
    }
  };

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);

  const roleLabels = { admin: 'Admin', teacher: 'O\'qituvchi', student: 'O\'quvchi' };
  const roleColors = { admin: 'bg-danger', teacher: 'bg-primaryBlue', student: 'bg-success' };

  if (loading) return <div className="p-6 flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primaryPurple"></div></div>;

  return (
    <div className="p-6" data-testid="admin-users-cms">
      <div className="mb-8">
        <h1 className="font-heading font-black text-3xl text-primaryPurple dark:text-primaryPink flex items-center gap-3">
          <Users weight="fill" size={36} />
          Foydalanuvchilar
        </h1>
        <p className="font-body text-neutralTextLight dark:text-neutralTextDark">Jami: {users.length} ta foydalanuvchi</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'admin', 'teacher', 'student'].map(role => (
          <button
            key={role}
            onClick={() => setFilter(role)}
            className={`px-4 py-2 rounded-2xl font-body font-bold text-sm transition-all ${
              filter === role ? 'bg-primaryPurple text-white' : 'bg-muted text-neutralTextLight dark:text-neutralTextDark'
            }`}
            data-testid={`filter-${role}`}
          >
            {role === 'all' ? 'Hammasi' : roleLabels[role]} ({role === 'all' ? users.length : users.filter(u => u.role === role).length})
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-backgroundDark rounded-3xl border-2 border-primaryPurple/20 overflow-hidden">
        <table className="w-full">
          <thead className="bg-primaryPurple/10">
            <tr>
              <th className="px-4 py-3 text-left font-heading font-bold text-sm">Ism</th>
              <th className="px-4 py-3 text-left font-heading font-bold text-sm">Email</th>
              <th className="px-4 py-3 text-left font-heading font-bold text-sm">Rol</th>
              <th className="px-4 py-3 text-left font-heading font-bold text-sm">XP</th>
              <th className="px-4 py-3 text-left font-heading font-bold text-sm">Sinf</th>
              <th className="px-4 py-3 text-right font-heading font-bold text-sm">Amal</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center font-body text-neutralTextLight dark:text-neutralTextDark">Foydalanuvchilar yo'q</td></tr>
            ) : filtered.map((u) => (
              <tr key={u.id} className="border-t border-primaryPurple/10 hover:bg-primaryPurple/5" data-testid={`user-row-${u.id}`}>
                <td className="px-4 py-3 font-body">{u.firstName} {u.lastName}</td>
                <td className="px-4 py-3 font-body text-sm">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-white text-xs font-bold ${roleColors[u.role]}`}>
                    {roleLabels[u.role]}
                  </span>
                </td>
                <td className="px-4 py-3 font-body font-bold text-primaryPurple">{u.xp || 0}</td>
                <td className="px-4 py-3 font-body">{u.grade || '-'}</td>
                <td className="px-4 py-3 text-right">
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="p-2 rounded-xl hover:bg-danger/10 text-danger"
                      data-testid={`delete-user-${u.id}`}
                    >
                      <Trash weight="fill" size={20} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersCMS;
