import { useState, useEffect } from 'react';
import api from '../services/api';
import { Check, Plus, AlertCircle, Image as ImageIcon } from 'lucide-react';

const AdminQueue = () => {
  const [pendingReceipts, setPendingReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [newItem, setNewItem] = useState({ productName: '', unitPrice: '', quantity: 1, category: 'Giyim' });
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchPendingReceipts();
  }, []);

  const fetchPendingReceipts = async () => {
    try {
      const res = await api.get('/Admin/pending-receipts');
      setPendingReceipts(res.data);
    } catch (err) {
      console.error('Admin API error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (receiptId) => {
    if (!newItem.productName || !newItem.unitPrice) {
      setActionMessage('Lütfen ürün adı ve birim fiyatı doldurun.');
      return;
    }

    try {
      await api.post(`/Admin/receipts/${receiptId}/items`, {
        productName: newItem.productName,
        unitPrice: parseFloat(newItem.unitPrice),
        quantity: parseInt(newItem.quantity),
        category: newItem.category
      });

      setActionMessage('Ürün kalemi eklendi!');
      setNewItem({ productName: '', unitPrice: '', quantity: 1, category: 'Giyim' });
      fetchPendingReceipts();
    } catch (err) {
      setActionMessage(err.response?.data?.Message || 'Kalem eklenemedi.');
    }
  };

  const handleApprove = async (receiptId) => {
    try {
      await api.post(`/Admin/receipts/${receiptId}/approve`);
      setActionMessage('Fiş onaylandı ve vatandaşa puan yüklendi!');
      setSelectedReceipt(null);
      fetchPendingReceipts();
    } catch (err) {
      setActionMessage(err.response?.data?.Message || 'Fiş onaylanamadı.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-[#1F1F1F] tracking-tight">Onay Bekleyen Fiş Kuyruğu</h1>
        <p className="text-sm text-[#5E5E5E] mt-1">
          Vatandaşların yüklediği fişleri inceleyin, ürün kalemleri ekleyip fişi onaylayın.
        </p>
      </div>

      {actionMessage && (
        <div className="p-3 bg-[#E8F0FE] text-[#1F1F1F] rounded-xl text-sm flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="font-semibold text-[#0B57D0] hover:underline ml-4">Kapat</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending List Side Panel */}
        <div className="lg:col-span-1 ga4-card p-5 space-y-4">
          <h3 className="font-bold text-[#1F1F1F] text-sm border-b border-[#E1E3E1] pb-3 flex items-center justify-between">
            <span>Bekleyen Fişler</span>
            <span className="ga4-badge-amber text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingReceipts.length}</span>
          </h3>

          {loading ? (
            <p className="text-[#747775] text-xs py-4 text-center">Kuyruk yükleniyor...</p>
          ) : pendingReceipts.length === 0 ? (
            <div className="py-8 text-center text-[#747775] text-xs space-y-1">
              <Check className="w-7 h-7 mx-auto text-[#137333]" />
              <p>Onay bekleyen fiş yok!</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {pendingReceipts.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedReceipt(r)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedReceipt?.id === r.id 
                      ? 'border-[#0B57D0] bg-[#E8F0FE]' 
                      : 'border-[#E1E3E1] hover:border-[#C6C7C6] bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-xs text-[#1F1F1F]">{r.brandName}</p>
                      <p className="text-[11px] text-[#747775]">{new Date(r.receiptDate).toLocaleDateString('tr-TR')}</p>
                    </div>
                    <span className="font-bold text-xs text-[#0B57D0] font-mono">₺{r.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Receipt Inspector Panel */}
        <div className="lg:col-span-2 ga4-card p-6">
          {!selectedReceipt ? (
            <div className="py-20 text-center text-[#747775] space-y-3">
              <ImageIcon className="w-10 h-10 mx-auto text-[#C6C7C6]" />
              <p className="text-xs font-medium">Detay ve onay için soldaki listeden bir fiş seçin.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-[#E1E3E1] pb-4">
                <div>
                  <h3 className="text-base font-bold text-[#1F1F1F]">{selectedReceipt.brandName} Fişi</h3>
                  <p className="text-[11px] text-[#747775]">Fiş ID: {selectedReceipt.id}</p>
                </div>
                <button
                  onClick={() => handleApprove(selectedReceipt.id)}
                  className="bg-[#137333] hover:bg-[#0F5C29] text-white px-4 py-2 rounded-full font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-4 h-4" /> Fişi Onayla & Puan Yükle
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#F0F4F9] border border-[#E1E3E1] rounded-2xl p-4 flex flex-col items-center justify-center min-h-[220px]">
                  {selectedReceipt.imageUrl ? (
                    <img 
                      src={selectedReceipt.imageUrl} 
                      alt="Fiş Görseli" 
                      className="max-h-60 object-contain rounded shadow-xs" 
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x400?text=Fis+Gorseli'; }}
                    />
                  ) : (
                    <div className="text-center text-[#747775] text-xs">
                      <AlertCircle className="w-7 h-7 mx-auto mb-2 text-[#B06000]" />
                      Görsel bulunamadı
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-[#1F1F1F] text-xs uppercase tracking-wider">
                    Ürün Kalemleri ({selectedReceipt.items?.length || 0})
                  </h4>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedReceipt.items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-[#F0F4F9] p-2.5 rounded-xl text-xs">
                        <div>
                          <span className="font-bold text-[#1F1F1F]">{item.productName}</span>
                          <span className="text-[#747775] ml-2">({item.category})</span>
                        </div>
                        <span className="font-semibold text-[#1F1F1F]">{item.quantity}x ₺{item.unitPrice} = ₺{item.totalPrice}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#E1E3E1] pt-3 space-y-2.5">
                    <h5 className="text-[10px] font-bold text-[#747775] uppercase tracking-wider">Yeni Kalem Ekle</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        placeholder="Ürün Adı" 
                        value={newItem.productName} 
                        onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })}
                        className="px-3 py-1.5 border border-[#E1E3E1] rounded-xl text-xs bg-white outline-none focus:border-[#0B57D0]"
                      />
                      <input 
                        type="number" 
                        placeholder="Birim Fiyat (₺)" 
                        value={newItem.unitPrice} 
                        onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value })}
                        className="px-3 py-1.5 border border-[#E1E3E1] rounded-xl text-xs bg-white outline-none focus:border-[#0B57D0]"
                      />
                      <input 
                        type="number" 
                        placeholder="Adet" 
                        value={newItem.quantity} 
                        onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                        className="px-3 py-1.5 border border-[#E1E3E1] rounded-xl text-xs bg-white outline-none focus:border-[#0B57D0]"
                      />
                      <select 
                        value={newItem.category} 
                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        className="px-3 py-1.5 border border-[#E1E3E1] rounded-xl text-xs bg-white outline-none focus:border-[#0B57D0]"
                      >
                        <option value="Giyim">Giyim</option>
                        <option value="Gıda">Gıda</option>
                        <option value="Elektronik">Elektronik</option>
                        <option value="Kozmetik">Kozmetik</option>
                      </select>
                    </div>
                    <button 
                      onClick={() => handleAddItem(selectedReceipt.id)}
                      className="w-full bg-[#0B57D0] hover:bg-[#0842A0] text-white text-xs font-semibold py-2 rounded-full transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Kalem Ekle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminQueue;
