import { useState, useEffect } from 'react';
import {
  getAllBrandsForManagement,
  createBrand,
  updateBrand,
  deactivateBrand,
  activateBrand,
} from '../services/api';
import { Tag, Ban, PlayCircle, Pencil, Plus, X, Check } from 'lucide-react';

const BrandManagement = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const [newName, setNewName] = useState('');
  const [newLogoUrl, setNewLogoUrl] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState('');

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
      await createBrand(newName.trim(), newLogoUrl.trim() || null);
      setActionMessage('Marka oluşturuldu.');
      setNewName('');
      setNewLogoUrl('');
      fetchBrands();
    } catch (err) {
      setActionMessage(err.response?.data?.Message || 'Marka oluşturma başarısız.');
    }
  };

  const startEdit = (brand) => {
    setEditingId(brand.id);
    setEditName(brand.name);
    setEditLogoUrl(brand.logoUrl || '');
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (brandId) => {
    try {
      await updateBrand(brandId, editName.trim(), editLogoUrl.trim() || null);
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
        <h1 className="text-xl font-bold text-[#1F1F1F] tracking-tight">Marka Yönetimi</h1>
        <p className="text-sm text-[#5E5E5E] mt-1">
          Fişlerin bağlı olduğu marka kataloğu. Pasife alınan bir marka, yeni şirket onaylarındaki
          marka seçim listesinden kalkar; geçmiş fiş kayıtları etkilenmez.
        </p>
      </div>

      {actionMessage && (
        <div className="p-3 bg-[#E8F0FE] text-[#1F1F1F] rounded-xl text-sm flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="font-semibold text-[#0B57D0] hover:underline ml-4">Kapat</button>
        </div>
      )}

      <div className="ga4-card p-5">
        <h3 className="font-bold text-[#1F1F1F] text-sm mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#0B57D0]" /> Yeni Marka Ekle
        </h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
          <input
            type="text"
            placeholder="Marka Adı (örn. Boyner)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="px-3 py-2 border border-[#E1E3E1] rounded-xl text-xs bg-white outline-none focus:border-[#0B57D0]"
          />
          <input
            type="text"
            placeholder="Logo URL (opsiyonel)"
            value={newLogoUrl}
            onChange={(e) => setNewLogoUrl(e.target.value)}
            className="px-3 py-2 border border-[#E1E3E1] rounded-xl text-xs bg-white outline-none focus:border-[#0B57D0]"
          />
          <button
            type="submit"
            className="bg-[#0B57D0] hover:bg-[#0842A0] text-white px-4 py-2 rounded-full font-bold text-xs transition-all"
          >
            Ekle
          </button>
        </form>
      </div>

      <div className="ga4-card p-5">
        {loading ? (
          <p className="text-[#747775] text-xs py-8 text-center">Yükleniyor...</p>
        ) : brands.length === 0 ? (
          <div className="py-16 text-center text-[#747775] space-y-3">
            <Tag className="w-10 h-10 mx-auto text-[#C6C7C6]" />
            <p className="text-xs font-medium">Henüz kayıtlı marka yok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-[#747775] uppercase tracking-wider border-b border-[#E1E3E1]">
                  <th className="py-3 px-4">Marka</th>
                  <th className="py-3 px-4">Logo URL</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4">İşlem</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {brands.map((b) => (
                  <tr key={b.id} className="border-b border-[#E1E3E1] hover:bg-[#F8F9FA] transition-colors">
                    {editingId === b.id ? (
                      <>
                        <td className="py-2 px-4">
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-2 py-1 border border-[#E1E3E1] rounded-lg text-xs w-full outline-none focus:border-[#0B57D0]"
                          />
                        </td>
                        <td className="py-2 px-4">
                          <input
                            value={editLogoUrl}
                            onChange={(e) => setEditLogoUrl(e.target.value)}
                            className="px-2 py-1 border border-[#E1E3E1] rounded-lg text-xs w-full outline-none focus:border-[#0B57D0]"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${b.isActive ? 'ga4-badge-green' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
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
                        <td className="py-3 px-4 font-bold text-[#1F1F1F]">{b.name}</td>
                        <td className="py-3 px-4 text-[#5E5E5E] truncate max-w-xs">{b.logoUrl || '—'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${b.isActive ? 'ga4-badge-green' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                            {b.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => startEdit(b)}
                              className="flex items-center gap-1 text-[11px] font-bold text-[#0B57D0] hover:bg-[#E8F0FE] px-2.5 py-1 rounded-full transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Düzenle
                            </button>
                            {b.isActive ? (
                              <button
                                onClick={() => handleDeactivate(b.id)}
                                className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-full transition-colors"
                              >
                                <Ban className="w-3.5 h-3.5" /> Pasife Al
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivate(b.id)}
                                className="flex items-center gap-1 text-[11px] font-bold text-[#137333] hover:bg-[#E6F4EA] px-2.5 py-1 rounded-full transition-colors"
                              >
                                <PlayCircle className="w-3.5 h-3.5" /> Aktif Et
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
