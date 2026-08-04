import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists on load
    const token = localStorage.getItem('token');
    if (token) {
      // Decode token or fetch user profile here. For now, we'll just set a mock user.
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // .NET 8 Backend'e gerçek istek atıyoruz
      const response = await api.post('/auth/login', { email, password });
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      setUser({ email, token });
      return true;
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
