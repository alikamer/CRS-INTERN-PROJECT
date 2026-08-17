import { useState, useEffect } from 'react';
import { getAllTenants, updateTenantSubscription, deactivateTenant, activateTenant } from '../services/api';

const statusTextClass = (status) => {
  if (status === 'Active') return 'text-[#137333]';
  if (status === 'WaitingForApproval') return 'text-[#B06000]';
  if (status === 'Rejected') return 'text-[#C5221F]';
  return 'text-[#747775]'; // Inactive
};

const statusLabel = (status) => {
  if (status === 'Active') return 'Aktif';
  if (status === 'WaitingForApproval') return 'Onay Bekliyor';
  if (status === 'Rejected') return 'Reddedildi';
  return 'Pasif';
};

const TenantManagement = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const fetchTenants = () => {
    getAllTenants()
      .then(setTenants)
      .catch((err) => console.error('Tenant listesi alınamadı', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleSubscriptionChange = async (tenantId, newTier) => {
    try {
      await updateTenantSubscription(tenantId, newTier);
      setActionMessage('Abonelik paketi güncellendi.');
      fetchTenants();
    } catch (err) {
      setActionMessage(err.response?.data?.Message || 'Abonelik güncelleme başarısız.');
    }
  };

  const handleDeactivate = async (tenantId) => {
    try {
      await deactivateTenant(tenantId);
      setActionMessage('Şirket pasife alındı.');
      fetchTenants();
    } catch (err) {
      setActionMessage(err.response?.data?.Message || 'Pasife alma başarısız.');
    }
  };

  const handleActivate = async (tenantId) => {
    try {
      await activateTenant(tenantId);
      setActionMessage('Şirket tekrar aktif edildi.');
      fetchTenants();
    } catch (err) {
      setActionMessage(err.response?.data?.Message || 'Aktif etme başarısız.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F1F1F] tracking-tight">Şirket Yönetimi</h1>
        <p className="text-sm text-[#5E5E5E] mt-1">
          Platformdaki tüm şirketler ve abonelik durumları.
        </p>
      </div>

      {actionMessage && (
        <div className="p-3 bg-[#E8F0FE] text-[#1F1F1F] rounded-xl text-sm flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="font-semibold text-[#0B57D0] hover:underline ml-4">Kapat</button>
        </div>
      )}

      <div className="ga4-card p-5">
        {loading ? (
          <p className="text-[#747775] text-sm py-8 text-center">Yükleniyor...</p>
        ) : tenants.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-[#747775]">Henüz kayıtlı şirket yok.</p>
            <p className="text-sm text-[#C6C7C6] mt-1">Şirketler kayıt olduğunda burada listelenecek.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[12px] font-bold text-[#747775] uppercase tracking-wider border-b border-[#E1E3E1]">
                  <th className="py-3 px-4">Şirket</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4">Abonelik</th>
                  <th className="py-3 px-4">Marka</th>
                  <th className="py-3 px-4">Ekip</th>
                  <th className="py-3 px-4">Kayıt Tarihi</th>
                  <th className="py-3 px-4">İşlem</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {tenants.map((t) => (
                  <tr key={t.tenantId} className="border-b border-[#E1E3E1] hover:bg-[#F8F9FA] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#1F1F1F]">{t.companyName}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[13px] font-medium ${statusTextClass(t.status)}`}>
                        {statusLabel(t.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {t.status === 'Active' ? (
                        <select
                          value={t.subscriptionTier}
                          onChange={(e) => handleSubscriptionChange(t.tenantId, e.target.value)}
                          className="px-2 py-1 border border-[#E1E3E1] rounded-lg text-[13px] bg-white outline-none focus:border-[#0B57D0]"
                        >
                          <option value="Basic">Basic</option>
                          <option value="Normal">Normal</option>
                          <option value="Premium">Premium</option>
                        </select>
                      ) : (
                        <span className="text-[13px] font-medium text-[#5E5E5E]">
                          {t.subscriptionTier}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#5E5E5E]">{t.brandName || '—'}</td>
                    <td className="py-3 px-4 text-[#5E5E5E]">{t.memberCount}</td>
                    <td className="py-3 px-4 text-[#5E5E5E]">{new Date(t.createdAt).toLocaleDateString('tr-TR')}</td>
                    <td className="py-3 px-4">
                      {t.status === 'Active' && (
                        <button
                          onClick={() => handleDeactivate(t.tenantId)}
                          className="text-[13px] font-medium text-[#C5221F] hover:underline"
                        >
                          Pasife Al
                        </button>
                      )}
                      {t.status === 'Inactive' && (
                        <button
                          onClick={() => handleActivate(t.tenantId)}
                          className="text-[13px] font-medium text-[#137333] hover:underline"
                        >
                          Aktif Et
                        </button>
                      )}
                      {(t.status === 'WaitingForApproval' || t.status === 'Rejected') && (
                        <span className="text-[13px] text-[#747775]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantManagement;
