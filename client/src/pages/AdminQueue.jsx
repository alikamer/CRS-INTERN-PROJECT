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
    <div className="space-y-8">
      <div className="bg-amber-600 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="bg-white/20 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            SystemAdmin Onay Masası
          </span>
          <h2 className="text-2xl font-bold mt-2">Onay Bekleyen Fiş Kuyruğu</h2>
          <p className="text-amber-100 text-sm mt-1">
            Vatandaşların yüklediği fişleri inceleyin, OCR satırlarını doğrulayın veya manuel ürün kalemleri ekleyip fişi onaylayın.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-800 text-sm flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="font-bold text-indigo-600">Kapat</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="font-semibold text-gray-800 text-lg border-b pb-3">Bekleyen Fişler ({pendingReceipts.length})</h3>

          {loading ? (
            <p className="text-gray-400 text-sm py-4">Kuyruk yükleniyor...</p>
          ) : pendingReceipts.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">
              <Check className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              Onay bekleyen fiş yok!
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {pendingReceipts.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedReceipt(r)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedReceipt?.id === r.id 
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-sm' 
                      : 'border-gray-100 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-900">{r.brandName}</p>
                      <p className="text-xs text-gray-400">{new Date(r.receiptDate).toLocaleDateString('tr-TR')}</p>
                    </div>
                    <span className="font-extrabold text-indigo-600">₺{r.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {!selectedReceipt ? (
            <div className="py-20 text-center text-gray-400 space-y-3">
              <ImageIcon className="w-12 h-12 mx-auto text-gray-300" />
              <p className="font-medium">Detay ve onay için soldaki listeden bir fiş seçin.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedReceipt.brandName} Fişi</h3>
                  <p className="text-xs text-gray-400">Fiş ID: {selectedReceipt.id}</p>
                </div>
                <button
                  onClick={() => handleApprove(selectedReceipt.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Check className="w-4 h-4" /> Fişi Onayla & Puanı Yükle
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center min-h-[220px]">
                  {selectedReceipt.imageUrl ? (
                    <img 
                      src={selectedReceipt.imageUrl} 
                      alt="Fiş Görseli" 
                      className="max-h-60 object-contain rounded shadow-sm" 
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x400?text=Fis+Gorseli'; }}
                    />
                  ) : (
                    <div className="text-center text-gray-400 text-sm">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                      Görsel bulunamadı
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 text-sm">Ürün Kalemleri ({selectedReceipt.items?.length || 0})</h4>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedReceipt.items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg text-xs">
                        <div>
                          <span className="font-bold text-gray-800">{item.productName}</span>
                          <span className="text-gray-400 ml-2">({item.category})</span>
                        </div>
                        <span className="font-semibold">{item.quantity}x ₺{item.unitPrice} = ₺{item.totalPrice}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <h5 className="text-xs font-bold text-gray-700 uppercase">Yeni Kalem Ekle</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        placeholder="Ürün Adı (Örn: Tişört)" 
                        value={newItem.productName} 
                        onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })}
                        className="px-3 py-1.5 border rounded-lg text-xs"
                      />
                      <input 
                        type="number" 
                        placeholder="Birim Fiyat (₺)" 
                        value={newItem.unitPrice} 
                        onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value })}
                        className="px-3 py-1.5 border rounded-lg text-xs"
                      />
                      <input 
                        type="number" 
                        placeholder="Adet" 
                        value={newItem.quantity} 
                        onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                        className="px-3 py-1.5 border rounded-lg text-xs"
                      />
                      <select 
                        value={newItem.category} 
                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        className="px-3 py-1.5 border rounded-lg text-xs"
                      >
                        <option value="Giyim">Giyim</option>
                        <option value="Gıda">Gıda</option>
                        <option value="Elektronik">Elektronik</option>
                        <option value="Kozmetik">Kozmetik</option>
                      </select>
                    </div>
                    <button 
                      onClick={() => handleAddItem(selectedReceipt.id)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
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
