import { useState, useEffect } from 'react';
import { getPendingTenants, getBrands, approveTenant, rejectTenant } from '../services/api';
import { Check, X, Building2, Phone, Mail } from 'lucide-react';

const TenantApplications = () => {
  const [pendingTenants, setPendingTenants] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [brandId, setBrandId] = useState('');
  const [subscriptionTier, setSubscriptionTier] = useState('Basic');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tenants, brandList] = await Promise.all([getPendingTenants(), getBrands()]);
      setPendingTenants(tenants);
      setBrands(brandList);
    } catch (err) {
      console.error('Tenant applications fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (tenant) => {
    setSelectedTenant(tenant);
    setBrandId('');
    setSubscriptionTier('Basic');
  };

  const handleApprove = async () => {
    if (!brandId) {
      setActionMessage('Lütfen marka seçin.');
      return;
    }
    try {
      await approveTenant(selectedTenant.tenantId, brandId, subscriptionTier);
      setActionMessage('Şirket onaylandı, hesap aktif edildi.');
      setSelectedTenant(null);
      fetchData();
    } catch (err) {
      setActionMessage(err.response?.data?.Message || 'Onay işlemi başarısız.');
    }
  };

  const handleReject = async () => {
    try {
      await rejectTenant(selectedTenant.tenantId);
      setActionMessage('Şirket başvurusu reddedildi.');
      setSelectedTenant(null);
      fetchData();
    } catch (err) {
      setActionMessage(err.response?.data?.Message || 'Reddetme işlemi başarısız.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1F1F1F] tracking-tight">Onay Bekleyen Şirket Başvuruları</h1>
        <p className="text-sm text-[#5E5E5E] mt-1">
          Yeni şirket başvurularını inceleyip onaylayın veya reddedin.
        </p>
      </div>

      {actionMessage && (
        <div className="p-3 bg-[#E8F0FE] text-[#1F1F1F] rounded-xl text-sm flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="font-semibold text-[#0B57D0] hover:underline ml-4">Kapat</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 ga4-card p-5 space-y-4">
          <h3 className="font-bold text-[#1F1F1F] text-sm border-b border-[#E1E3E1] pb-3 flex items-center justify-between">
            <span>Bekleyen Başvurular</span>
            <span className="ga4-badge-amber text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingTenants.length}</span>
          </h3>

          {loading ? (
            <p className="text-[#747775] text-xs py-4 text-center">Yükleniyor...</p>
          ) : pendingTenants.length === 0 ? (
            <div className="py-8 text-center text-[#747775] text-xs space-y-1">
              <Check className="w-7 h-7 mx-auto text-[#137333]" />
              <p>Onay bekleyen başvuru yok!</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {pendingTenants.map((t) => (
                <div
                  key={t.tenantId}
                  onClick={() => handleSelect(t)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedTenant?.tenantId === t.tenantId
                      ? 'border-[#0B57D0] bg-[#E8F0FE]'
                      : 'border-[#E1E3E1] hover:border-[#C6C7C6] bg-white'
                  }`}
                >
                  <p className="font-bold text-xs text-[#1F1F1F]">{t.companyName}</p>
                  <p className="text-[11px] text-[#747775]">{new Date(t.createdAt).toLocaleDateString('tr-TR')}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 ga4-card p-6">
          {!selectedTenant ? (
            <div className="py-20 text-center text-[#747775] space-y-3">
              <Building2 className="w-10 h-10 mx-auto text-[#C6C7C6]" />
              <p className="text-xs font-medium">Detay ve onay için soldaki listeden bir başvuru seçin.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border-b border-[#E1E3E1] pb-4">
                <h3 className="text-base font-bold text-[#1F1F1F]">{selectedTenant.companyName}</h3>
                <p className="text-[11px] text-[#747775]">Başvuru ID: {selectedTenant.tenantId}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-[#F0F4F9] rounded-xl p-3.5">
                  <p className="text-[10px] font-bold text-[#747775] uppercase tracking-wider mb-1">İletişim Kişisi</p>
                  <p className="font-semibold text-[#1F1F1F]">{selectedTenant.contactFirstName} {selectedTenant.contactLastName}</p>
                </div>
                <div className="bg-[#F0F4F9] rounded-xl p-3.5 flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#0B57D0] shrink-0" />
                  <span className="text-[#1F1F1F] font-medium">{selectedTenant.contactPhoneNumber}</span>
                </div>
                <div className="bg-[#F0F4F9] rounded-xl p-3.5 flex items-center gap-2.5 md:col-span-2">
                  <Mail className="w-4 h-4 text-[#0B57D0] shrink-0" />
                  <span className="text-[#1F1F1F] font-medium">{selectedTenant.contactEmail}</span>
                </div>
              </div>

              <div className="border-t border-[#E1E3E1] pt-4 space-y-3">
                <h5 className="text-[10px] font-bold text-[#747775] uppercase tracking-wider">Onay Bilgileri</h5>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="px-3 py-2 border border-[#E1E3E1] rounded-xl text-xs bg-white outline-none focus:border-[#0B57D0]"
                  >
                    <option value="">Marka Seçin</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <select
                    value={subscriptionTier}
                    onChange={(e) => setSubscriptionTier(e.target.value)}
                    className="px-3 py-2 border border-[#E1E3E1] rounded-xl text-xs bg-white outline-none focus:border-[#0B57D0]"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Normal">Normal</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={handleReject}
                    className="flex-1 bg-white border border-[#FAD2CF] hover:bg-[#FCE8E6] text-[#C5221F] px-4 py-2 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" /> Reddet
                  </button>
                  <button
                    onClick={handleApprove}
                    className="flex-1 bg-[#137333] hover:bg-[#0F5C29] text-white px-4 py-2 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Onayla & Aktif Et
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantApplications;
