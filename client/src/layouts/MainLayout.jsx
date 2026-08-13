import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConsumerProfileModal from '../components/ConsumerProfileModal';
import { 
  BarChart3, 
  Receipt, 
  Settings, 
  LogOut, 
  Menu, 
  ShieldCheck, 
  Search, 
  HelpCircle, 
  Bell, 
  ChevronDown, 
  LayoutDashboard,
  Sparkles,
  SlidersHorizontal,
  Building,
  Building2
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const MainLayout = () => {
  const { logout, user, switchRoleForTesting } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const role = user?.role || 'Consumer';

  useEffect(() => {
    if (role === 'Consumer' && !sessionStorage.getItem('profileCheckDone')) {
      sessionStorage.setItem('profileCheckDone', 'true');
      import('../services/api').then(({ getConsumerProfile }) => {
        getConsumerProfile().then(profile => {
          if (profile && (!profile.city || !profile.gender || !profile.dateOfBirth)) {
            const timer = setTimeout(() => setShowProfileModal(true), 1500);
            return () => clearTimeout(timer);
          }
        }).catch(err => console.error("Profil kontrolü başarısız:", err));
      });
    }
  }, [role]);

  const getNavItems = () => {
    switch (role) {
      case 'CorporateUser':
        return [
          { path: '/', label: 'Rapor Özeti (Analiz)', icon: BarChart3, category: 'Analiz' },
          { path: '/settings', label: 'Yönetim & Ayarlar', icon: Settings, category: 'Yapılandırma' },
        ];
      case 'SystemAdmin':
        return [
          { path: '/', label: 'Onay Kuyruğu', icon: ShieldCheck, category: 'Admin' },
          { path: '/tenant-applications', label: 'Şirket Başvuruları', icon: Building2, category: 'Admin' },
          { path: '/receipts', label: 'Tüm Fiş Kayıtları', icon: Receipt, category: 'Admin' },
          { path: '/settings', label: 'Sistem Ayarları', icon: Settings, category: 'Admin' },
        ];
      case 'Consumer':
      default:
        return [
          { path: '/', label: 'Vatandaş Özeti', icon: LayoutDashboard, category: 'Raporlar' },
          { path: '/receipts', label: 'Fiş Yükle & Geçmiş', icon: Receipt, category: 'Raporlar' },
          { path: '/settings', label: 'Ayarlar', icon: Settings, category: 'Yapılandırma' },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1F1F1F] flex font-sans antialiased">
      {/* Dark Navigation Rail / Sidebar */}
      <aside className={`ga4-sidebar transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col z-30 shrink-0 select-none shadow-md overflow-x-hidden`}>
        {/* Logo & Branding */}
        <div className={`h-16 flex items-center border-b border-[#2A3345] shrink-0 ${sidebarOpen ? 'justify-between px-5' : 'justify-center'}`}>
          {sidebarOpen && (
            <div className="flex items-center space-x-3 overflow-hidden">
              {/* CRS Receipt Platform Logo */}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0B57D0] to-[#4285F4] flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/30">
                <Receipt className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-white tracking-tight leading-none">
                  CRS Receipt
                </span>
                <span className="text-[11px] text-[#A8C7FA] tracking-wide mt-1 truncate">
                  Smart Fiş Platformu
                </span>
              </div>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-2 text-[#C4C7C5] hover:bg-[#2A3345] hover:text-white rounded-full transition-colors shrink-0"
            title="Menüyü Daralt/Genişlet"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarOpen && (
            <div className="px-3 pt-3 pb-1.5 text-[11px] font-semibold text-[#8E918F] uppercase tracking-wider">
              Menü
            </div>
          )}
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3.5 px-4 py-2.5 rounded-full text-xs font-medium transition-all ${
                  isActive 
                    ? 'bg-[#D3E3FD] text-[#041E49] font-bold shadow-xs' 
                    : 'text-[#C4C7C5] hover:bg-[#2A3345] hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#041E49]' : 'text-[#A8C7FA]'}`} />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* GA4 Bottom Admin & Role Quick Switcher */}
        <div className="p-3 border-t border-[#2A3345] space-y-2">
          {sidebarOpen && user && (
            <div className="p-3 rounded-2xl bg-[#2A3345]/60 border border-[#344155] space-y-2 text-xs">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-[#1A73E8] text-white flex items-center justify-center text-xs font-bold">
                  {user.name ? user.name[0].toUpperCase() : user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">{user.name || user.email || 'Kullanıcı'}</p>
                  <p className="text-[10px] text-[#A8C7FA] truncate">{user.email}</p>
                </div>
              </div>

              {/* Dev Testing Role Switcher */}
              <div className="pt-2 border-t border-[#344155]">
                <p className="text-[10px] font-bold text-[#8E918F] uppercase tracking-wider mb-1">Rol Testi</p>
                <div className="grid grid-cols-3 gap-1">
                  {['CorporateUser', 'Consumer', 'SystemAdmin'].map((r) => (
                    <button
                      key={r}
                      onClick={() => switchRoleForTesting(r)}
                      className={`text-[9px] py-1 px-1 rounded-md font-semibold transition-all ${
                        role === r 
                          ? 'bg-[#D3E3FD] text-[#041E49]' 
                          : 'bg-[#1C2433] text-[#C4C7C5] hover:bg-[#344155]'
                      }`}
                    >
                      {r === 'CorporateUser' ? 'B2B' : r === 'Consumer' ? 'B2C' : 'Admin'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-2.5 w-full rounded-full text-[#C4C7C5] hover:bg-red-900/30 hover:text-red-300 transition-colors text-xs font-medium"
          >
            <LogOut className="w-4 h-4 shrink-0 text-[#8E918F]" />
            {sidebarOpen && <span>Oturumu Kapat</span>}
          </button>
        </div>
      </aside>

      {/* Main Content & Top Header Viewport */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* GA4 Top Header Bar */}
        <header className="h-16 ga4-header flex items-center justify-between px-6 sticky top-0 z-20 shrink-0">
          {/* Property Selector & Search Bar */}
          <div className="flex items-center space-x-4 flex-1 max-w-2xl">
            {/* Account / Property Selector Box */}
            <div className="hidden sm:flex items-center space-x-2 bg-[#F0F4F9] text-[#1F1F1F] px-3.5 py-1.5 rounded-full border border-[#C6C7C6]/60">
              <Building className="w-4 h-4 text-[#0B57D0]" />
              <span className="text-xs font-semibold truncate">
                {role === 'CorporateUser' ? 'Zara Tekstil A.Ş.' : role === 'SystemAdmin' ? 'CRS Admin Konsol' : 'Vatandaş Hesabı'}
              </span>
            </div>

            {/* GA4 Global Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#5E5E5E] absolute left-3.5 top-2.5" />
              <input
                type="text"
                disabled
                placeholder="Arama (Çok Yakında)"
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-[#F0F4F9] border border-transparent rounded-full outline-none placeholder-[#747775] cursor-not-allowed opacity-60"
              />
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-3">
            <button className="p-2 text-[#5E5E5E] hover:bg-[#F0F4F9] rounded-full transition-colors" title="Yardım">
              <HelpCircle className="w-4 h-4" />
            </button>
            <button className="p-2 text-[#5E5E5E] hover:bg-[#F0F4F9] rounded-full transition-colors opacity-50 cursor-not-allowed" title="Bildirimler (Yakında)">
              <Bell className="w-4 h-4" />
            </button>
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-8 h-8 rounded-full bg-[#0B57D0] text-white flex items-center justify-center font-bold text-xs shadow-xs transition-transform hover:scale-105 hover:ring-2 hover:ring-[#4285F4]"
                title="Profil & Ayarlar"
              >
                {user?.name ? user.name[0].toUpperCase() : user?.email?.[0]?.toUpperCase() || 'U'}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in-up">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || user?.email || 'Kullanıcı'}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Profil Ayarları</span>
                    </Link>
                    <button
                      onClick={() => { setDropdownOpen(false); logout(); }}
                      className="flex items-center space-x-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Viewport Area */}
        <div className="flex-1 overflow-auto p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>

      <ConsumerProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)}
        onSuccess={() => {
          setShowProfileModal(false);
        }}
      />
    </div>
  );
};

export default MainLayout;
