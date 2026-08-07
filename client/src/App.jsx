import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import ConsumerDashboard from './pages/ConsumerDashboard';
import CorporateAnalytics from './pages/CorporateAnalytics';
import AdminQueue from './pages/AdminQueue';
import Receipts from './pages/Receipts';

const RoleBasedHome = () => {
  const { user } = useAuth();
  const role = user?.role || 'Consumer';

  if (role === 'CorporateUser') {
    return <CorporateAnalytics />;
  }

  if (role === 'SystemAdmin') {
    return <AdminQueue />;
  }

  return <ConsumerDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/" element={<RoleBasedHome />} />
            <Route path="/receipts" element={<Receipts />} />
            <Route path="/settings" element={<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><h3 className="font-semibold text-gray-800">Hesap & Rol Ayarları</h3><p className="text-gray-500 text-sm mt-2">Mevcut oturum rolünüzü sol menüdeki geçiş simülatöründen değiştirebilir veya test edebilirsiniz.</p></div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
