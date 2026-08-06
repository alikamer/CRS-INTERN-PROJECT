import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      /// Sisteme daha önce girmişsek (token varsa) içeri direkt alıyoruz.
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      /// .NET 8 Backend'e (AuthController) gerçek giriş (Login) isteği atıyoruz.
      const response = await api.post('/Auth/login', { email, password });
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      setUser({ email, token });
      return true;
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
  };

  const register = async (email, password) => {
    try {
      /// Sisteme kayıt olmak (Vatandaş) için istek atıyoruz.
      const response = await api.post('/Auth/register', { email, password });
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      setUser({ email, token });
      return true;
    } catch (error) {
      console.error("Register failed", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
