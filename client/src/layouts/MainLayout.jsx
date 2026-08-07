import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Receipt, Settings, LogOut, Menu, BarChart3, ShieldCheck, UserCheck } from 'lucide-react';
import { useState } from 'react';

const MainLayout = () => {
  const { logout, user, switchRoleForTesting } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const role = user?.role || 'Consumer';

  const getNavItems = () => {
    switch (role) {
      case 'CorporateUser':
        return [
          { path: '/', label: 'Kurumsal Analiz', icon: BarChart3 },
          { path: '/settings', label: 'Ayarlar', icon: Settings },
        ];
      case 'SystemAdmin':
        return [
          { path: '/', label: 'Admin Onay Kuyruğu', icon: ShieldCheck },
          { path: '/receipts', label: 'Tüm Fişler', icon: Receipt },
          { path: '/settings', label: 'Ayarlar', icon: Settings },
        ];
      case 'Consumer':
      default:
        return [
          { path: '/', label: 'Vatandaş Paneli', icon: LayoutDashboard },
          { path: '/receipts', label: 'Fiş Yükle & Geçmiş', icon: Receipt },
          { path: '/settings', label: 'Ayarlar', icon: Settings },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen && <span className="font-bold text-xl text-indigo-600">CRS B2B Receipts</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-3">
          {sidebarOpen && (
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Aktif Rol Simülasyonu</p>
              <div className="flex gap-1">
                <button
                  onClick={() => switchRoleForTesting('Consumer')}
                  className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${role === 'Consumer' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  B2C Vatandaş
                </button>
                <button
                  onClick={() => switchRoleForTesting('CorporateUser')}
                  className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${role === 'CorporateUser' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  B2B Şirket
                </button>
                <button
                  onClick={() => switchRoleForTesting('SystemAdmin')}
                  className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${role === 'SystemAdmin' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Admin
                </button>
              </div>
              <p className="text-xs font-medium text-gray-900 truncate mt-1">{user?.email}</p>
            </div>
          )}

          <button
            onClick={logout}
            className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Çıkış Yap</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-gray-800">
            {navItems.find(item => item.path === location.pathname)?.label || 'Portal'}
          </h1>
          <div className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full uppercase border border-indigo-100">
              {role === 'Consumer' ? 'B2C Vatandaş Portal' : role === 'CorporateUser' ? 'B2B Şirket Portal' : 'Admin Onay Portal'}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
