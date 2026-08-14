import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import ConsumerDashboard from './pages/ConsumerDashboard';
import CorporateAnalytics from './pages/CorporateAnalytics';
import AdminQueue from './pages/AdminQueue';
import TenantApplications from './pages/TenantApplications';
import TenantManagement from './pages/TenantManagement';
import BrandManagement from './pages/BrandManagement';
import Receipts from './pages/Receipts';
import Settings from './pages/Settings';

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
            <Route path="/tenant-applications" element={<TenantApplications />} />
            <Route path="/tenant-management" element={<TenantManagement />} />
            <Route path="/brand-management" element={<BrandManagement />} />
            <Route path="/receipts" element={<Receipts />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
