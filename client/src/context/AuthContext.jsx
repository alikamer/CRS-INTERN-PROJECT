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
    const name = localStorage.getItem('name') || '';

    if (token) {
      setUser({ token, refreshToken, email, role, name });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/Auth/login', { email, password });
      const { token, refreshToken, role, firstName } = response.data;

      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('role', role || 'Consumer');
      localStorage.setItem('email', email);
      if (firstName) localStorage.setItem('name', firstName);

      setUser({ email, token, refreshToken, role: role || 'Consumer', name: firstName || '' });
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
      const { token, refreshToken, role, firstName } = response.data;

      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('role', role || 'Consumer');
      localStorage.setItem('email', email);
      if (firstName) localStorage.setItem('name', firstName);

      setUser({ email, token, refreshToken, role: role || 'Consumer', name: firstName || '' });
      return { success: true, role: role || 'Consumer' };
    } catch (error) {
      console.error("Register failed", error);
      return { success: false, error: error.response?.data?.Message || 'Kayıt başarısız' };
    }
  };

  const registerTenant = async (companyName, firstName, lastName, phoneNumber, email, password) => {
    try {
      const response = await api.post('/Auth/register-tenant', {
        companyName,
        firstName,
        lastName,
        phoneNumber,
        email,
        password,
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Tenant register failed", error);
      return { success: false, error: error.response?.data?.Message || 'Başvuru gönderilemedi' };
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
    localStorage.removeItem('name');
    setUser(null);
  };



  
  return (
    <AuthContext.Provider value={{ user, login, register, registerTenant, logout, switchRoleForTesting, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
