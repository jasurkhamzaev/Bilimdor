import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Student, Chalkboard, UsersThree } from '@phosphor-icons/react';
import Button3D from '@/components/Button3D';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_knowledge-islands-1/artifacts/s2uxgizu_image.png";

const AuthPage = () => {
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    email: '', password: '', confirmPassword: '', firstName: '', lastName: '',
    phone: '', grade: '', parentPhone: '', role: 'student'
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(loginData.email, loginData.password);
    setLoading(false);
    if (result.success) {
      toast.success('Muvaffaqiyatli kirdingiz!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Parollar mos kelmaydi');
      return;
    }
    setLoading(true);
    const { confirmPassword, ...submitData } = registerData;
    const result = await register(submitData);
    setLoading(false);
    if (result.success) {
      toast.success("Ro'yxatdan o'tdingiz!");
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  const roleOptions = [
    { value: 'student', icon: Student, label: "O'quvchi", color: 'primaryPurple', description: 'Darslarni o\'rgan' },
    { value: 'teacher', icon: Chalkboard, label: "O'qituvchi", color: 'primaryBlue', description: 'Darslarni boshqar' },
    { value: 'parent', icon: UsersThree, label: 'Ota-ona', color: 'primaryPink', description: "Farzandni kuzat" }
  ];

  return (
    <div className="min-h-screen bg-backgroundLight dark:bg-backgroundDark">
      <Navbar />
      
      <div className="flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <img src={LOGO_URL} alt="Logo" className="w-24 h-24 mx-auto mb-3 rounded-2xl" />
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-primaryPurple dark:text-primaryPink mb-1">
              {t('appName')}
            </h1>
            <p className="font-body text-sm text-neutralTextLight dark:text-neutralTextDark">
              {t('greeting')}
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6" data-testid="auth-tabs">
              <TabsTrigger value="login" data-testid="login-tab">{t('auth.login')}</TabsTrigger>
              <TabsTrigger value="register" data-testid="register-tab">{t('auth.register')}</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4" data-testid="login-form">
                <div>
                  <Label htmlFor="login-email">{t('auth.email')}</Label>
                  <Input id="login-email" type="email" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} required className="h-14 rounded-2xl border-2" data-testid="login-email-input" />
                </div>
                <div>
                  <Label htmlFor="login-password">{t('auth.password')}</Label>
                  <Input id="login-password" type="password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required className="h-14 rounded-2xl border-2" data-testid="login-password-input" />
                </div>
                <Button3D type="submit" variant="purple" className="w-full" disabled={loading} data-testid="login-submit-button">
                  {loading ? 'Yuklanmoqda...' : t('auth.loginButton')}
                </Button3D>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4" data-testid="register-form">
                {/* Role selection */}
                <div>
                  <Label className="mb-2 block">Ro'yxatdan o'tish turi</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {roleOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setRegisterData({ ...registerData, role: opt.value })}
                        className={`p-3 rounded-2xl border-2 transition-all text-center ${
                          registerData.role === opt.value
                            ? 'border-primaryPurple bg-primaryPurple text-white scale-105'
                            : 'border-muted hover:border-primaryPurple'
                        }`}
                        data-testid={`role-${opt.value}`}
                      >
                        <opt.icon weight="fill" size={28} className="mx-auto mb-1" />
                        <div className="text-xs font-bold">{opt.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">{t('auth.firstName')}</Label>
                    <Input id="firstName" value={registerData.firstName} onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })} required className="h-12 rounded-2xl border-2" data-testid="register-firstname-input" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">{t('auth.lastName')}</Label>
                    <Input id="lastName" value={registerData.lastName} onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })} required className="h-12 rounded-2xl border-2" data-testid="register-lastname-input" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="register-email">{t('auth.email')}</Label>
                  <Input id="register-email" type="email" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} required className="h-12 rounded-2xl border-2" data-testid="register-email-input" />
                </div>
                {registerData.role === 'student' && (
                  <div>
                    <Label htmlFor="grade">{t('auth.grade')}</Label>
                    <Input id="grade" type="number" min="1" max="11" value={registerData.grade} onChange={(e) => setRegisterData({ ...registerData, grade: parseInt(e.target.value) })} className="h-12 rounded-2xl border-2" data-testid="register-grade-input" />
                  </div>
                )}
                <div>
                  <Label htmlFor="register-password">{t('auth.password')}</Label>
                  <Input id="register-password" type="password" value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} required className="h-12 rounded-2xl border-2" data-testid="register-password-input" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                  <Input id="confirmPassword" type="password" value={registerData.confirmPassword} onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })} required className="h-12 rounded-2xl border-2" data-testid="register-confirm-password-input" />
                </div>
                <Button3D type="submit" variant="pink" className="w-full" disabled={loading} data-testid="register-submit-button">
                  {loading ? 'Yuklanmoqda...' : t('auth.registerButton')}
                </Button3D>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
