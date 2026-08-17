import { useState, useEffect } from 'react';
import {
  getAllBrandsForManagement,
  createBrand,
  updateBrand,
  deactivateBrand,
  activateBrand,
} from '../services/api';
import { X, Check } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

const BrandManagement = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const [newName, setNewName] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const fetchBrands = () => {
    getAllBrandsForManagement()
      .then(setBrands)
      .catch((err) => console.error('Marka listesi alınamadı', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      setActionMessage('Marka adı boş olamaz.');
      return;
    }
    try {
      await createBrand(newName.trim());
      setActionMessage('Marka oluşturuldu.');
      setNewName('');
      fetchBrands();
    } catch (err) {
      setActionMessage(err.response?.data?.Message || 'Marka oluşturma başarısız.');
    }
  };

  const startEdit = (brand) => {
    setEditingId(brand.id);
    setEditName(brand.name);
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (brandId) => {
    try {
      // LogoUrl artık UI'da düzenlenmiyor ama backend alanı hâlâ var (altyapı olarak duruyor);
      // burada dokunmadan aynen geri gönderiyoruz, yoksa isim düzenlerken var olan logo sıfırlanır.
      const existingLogoUrl = brands.find((b) => b.id === brandId)?.logoUrl ?? null;
      await updateBrand(brandId, editName.trim(), existingLogoUrl);
      setActionMessage('Marka güncellendi.');
      setEditingId(null);
      fetchBrands();
    } catch (err) {
      setActionMessage(err.response?.data?.Message || 'Marka güncelleme başarısız.');
    }
  };

  const handleDeactivate = async (brandId) => {
    try {
      await deactivateBrand(brandId);
      setActionMessage('Marka pasife alındı.');
      fetchBrands();
    } catch (err) {
      setActionMessage(err.response?.data?.Message || 'Pasife alma başarısız.');
    }
  };

  const handleActivate = async (brandId) => {
    try {
      await activateBrand(brandId);
      setActionMessage('Marka tekrar aktif edildi.');
      fetchBrands();
    } catch (err) {
      setActionMessage(err.response?.data?.Message || 'Aktif etme başarısız.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F1F1F] tracking-tight">Marka Yönetimi</h1>
        <p className="text-sm text-[#5E5E5E] mt-1">
          Fiş formundaki marka kataloğunu yönetin.
        </p>
      </div>

      {actionMessage && (
        <div className="p-3 bg-[#E8F0FE] text-[#1F1F1F] rounded-xl text-sm flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="font-semibold text-[#0B57D0] hover:underline ml-4">Kapat</button>
        </div>
      )}

      <div className="ga4-card p-5">
        <h2 className="text-base font-bold text-[#1F1F1F] border-b border-[#E1E3E1] pb-3 mb-4">
          Yeni Marka Ekle
        </h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
          <input
            type="text"
            placeholder="Marka Adı (örn. Boyner)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="px-3 py-2 border border-[#E1E3E1] rounded-xl text-sm bg-white outline-none focus:border-[#0B57D0]"
          />
          <button
            type="submit"
            className="bg-[#0B57D0] hover:bg-[#0842A0] text-white px-4 py-2 rounded-full font-bold text-sm transition-all"
          >
            Ekle
          </button>
        </form>
      </div>

      <div className="ga4-card p-5">
        {loading ? (
          <p className="text-[#747775] text-sm py-8 text-center">Yükleniyor...</p>
        ) : brands.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-[#747775]">Henüz kayıtlı marka yok.</p>
            <p className="text-sm text-[#C6C7C6] mt-1">Yukarıdaki formdan ilk markayı ekleyebilirsiniz.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[12px] font-bold text-[#747775] uppercase tracking-wider border-b border-[#E1E3E1]">
                  <th className="py-3 px-4">Marka</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4">İşlem</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {brands.map((b) => (
                  <tr key={b.id} className="border-b border-[#E1E3E1] hover:bg-[#F8F9FA] transition-colors">
                    {editingId === b.id ? (
                      <>
                        <td className="py-2 px-4">
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-2 py-1 border border-[#E1E3E1] rounded-lg text-sm w-full outline-none focus:border-[#0B57D0]"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[13px] font-medium ${b.isActive ? 'text-[#137333]' : 'text-[#747775]'}`}>
                            {b.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => saveEdit(b.id)} className="text-[#137333] hover:bg-[#E6F4EA] p-1.5 rounded-full transition-colors">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={cancelEdit} className="text-[#747775] hover:bg-[#F0F4F9] p-1.5 rounded-full transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4 font-bold text-[#1F1F1F]">
                          <div className="flex items-center gap-2.5">
                            <BrandLogo name={b.name} logoUrl={b.logoUrl} size={36} />
                            {b.name}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[13px] font-medium ${b.isActive ? 'text-[#137333]' : 'text-[#747775]'}`}>
                            {b.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => startEdit(b)}
                              className="text-[13px] font-medium text-[#0B57D0] hover:underline"
                            >
                              Düzenle
                            </button>
                            {b.isActive ? (
                              <button
                                onClick={() => handleDeactivate(b.id)}
                                className="text-[13px] font-medium text-[#C5221F] hover:underline"
                              >
                                Pasife Al
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivate(b.id)}
                                className="text-[13px] font-medium text-[#137333] hover:underline"
                              >
                                Aktif Et
                              </button>
                            )}
                          </div>
                        </td>
                      </>
                    )}
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

export default BrandManagement;
