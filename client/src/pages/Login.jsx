import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const success = await login(email, password);
    if (success) {
      navigate('/');
    } else {
      setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <LogIn className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Hoş Geldiniz</h2>
          <p className="text-white/80 mt-2">B2B Fiş Analiz Platformu</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-white px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              placeholder="ornek@sirket.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-white text-indigo-600 font-semibold rounded-lg shadow-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-500 transition-all"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
