import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const role = localStorage.getItem('role') || 'Consumer';
    const email = localStorage.getItem('email') || '';

    if (token) {
      setUser({ token, refreshToken, email, role });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/Auth/login', { email, password });
      const { token, refreshToken, role } = response.data;

      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('role', role || 'Consumer');
      localStorage.setItem('email', email);

      setUser({ email, token, refreshToken, role: role || 'Consumer' });
      return { success: true, role: role || 'Consumer' };
    } catch (error) {
      console.error("Login failed", error);
      return { success: false, error: error.response?.data?.Message || 'Giriş başarısız' };
    }
  };

  const register = async (firstName,lastName,phoneNumber,email, password) => {
    try {
      //Backend tarafına registerDto ya uygun 5 veri yollayacağız 
      const response = await api.post('/Auth/register', {
         email,
         password,
        phoneNumber,
      lastName,
    firstName
   });
      const { token, refreshToken, role } = response.data;

      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('role', role || 'Consumer');
      localStorage.setItem('email', email);

      setUser({ email, token, refreshToken, role: role || 'Consumer' });
      return { success: true, role: role || 'Consumer' };
    } catch (error) {
      console.error("Register failed", error);
      return { success: false, error: error.response?.data?.Message || 'Kayıt başarısız' };
    }
  };

  const switchRoleForTesting = (newRole) => {
    localStorage.setItem('role', newRole);
    setUser(prev => prev ? { ...prev, role: newRole } : { role: newRole });
  };

   //  Kullanıcı giriş yaptığında refreshToken info tutuldu
   //  Kullanıcı çıktığında  arka planda /api/auth/revoke-token isteği atılarak veritabanındaki token iptal edildi.
  const logout = async () => {
    const currentRefreshToken = localStorage.getItem('refreshToken');
    if (currentRefreshToken) {
      try {
        await api.post('/Auth/revoke-token', { refreshToken: currentRefreshToken });
      } catch (err) {
        console.error("Revoke token error", err);
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    setUser(null);
  };



  
  return (
    <AuthContext.Provider value={{ user, login, register, logout, switchRoleForTesting, loading }}>            
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
