import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Receipt } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    let result;
    if (isLoginMode) {
      result = await login(email, password);
    } else {
      result = await register(firstName, lastName, phoneNumber, email, password);
    }
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || (isLoginMode ? 'Giriş başarısız.' : 'Kayıt başarısız.'));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F4F9] p-4">

      {/* Login Card */}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-[#E1E3E1] p-8">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-[#0B57D0] to-[#4285F4] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <Receipt className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1F1F1F] tracking-tight">
            {isLoginMode ? 'Hoş Geldiniz' : 'Aramıza Katılın'}
          </h1>
          <p className="text-[#5E5E5E] mt-1 text-sm">CRS Fiş Analiz Platformu</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 text-[#C5221F] border border-red-200 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* YALNIZCA KAYIT OL (REGISTER) MODUNDAYKEN GÖSTERİLECEK ALANLAR */}
          {!isLoginMode && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1F1F1F] mb-1.5">Ad</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F0F4F9] border border-[#E1E3E1] rounded-xl text-[#1F1F1F] placeholder-[#747775] focus:outline-none focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] transition-all"
                    placeholder="Ahmet"
                    required={!isLoginMode}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1F1F1F] mb-1.5">Soyad</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F0F4F9] border border-[#E1E3E1] rounded-xl text-[#1F1F1F] placeholder-[#747775] focus:outline-none focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] transition-all"
                    placeholder="Yılmaz"
                    required={!isLoginMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F1F1F] mb-1.5">Telefon Numarası</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F0F4F9] border border-[#E1E3E1] rounded-xl text-[#1F1F1F] placeholder-[#747775] focus:outline-none focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] transition-all"
                  placeholder="0532 123 45 67"
                  required={!isLoginMode}
                />
              </div>
            </>
          )}
          <div>
            
            <label className="block text-sm font-medium text-[#1F1F1F] mb-1.5">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#F0F4F9] border border-[#E1E3E1] rounded-xl text-[#1F1F1F] placeholder-[#747775] focus:outline-none focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] transition-all"
              placeholder="ornek@sirket.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1F1F1F] mb-1.5">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#F0F4F9] border border-[#E1E3E1] rounded-xl text-[#1F1F1F] placeholder-[#747775] focus:outline-none focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#0B57D0] hover:bg-[#0842A0] text-white rounded-xl font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0B57D0] focus:ring-offset-2 transition-all"
          >
            {isLoginMode ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </form>

        {/* Toggle Login/Register */}
        <div className="mt-6 text-center">
          <p className="text-[#5E5E5E] text-sm">
            {isLoginMode ? 'Hesabınız yok mu? ' : 'Zaten hesabınız var mı? '}
            <button
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError('');
              }}
              className="text-[#0B57D0] hover:text-[#0842A0] font-semibold focus:outline-none transition-colors"
            >
              {isLoginMode ? 'Hemen Kayıt Olun' : 'Giriş Yapın'}
            </button>
          </p>
        </div>
      </div>

      {/* Tagline */}
      <p className="text-[#747775] text-xs mt-6">
        CRS Smart Receipt — B2B Fiş Analiz ve CRM Platformu
      </p>
    </div>
  );
};

export default Login;
