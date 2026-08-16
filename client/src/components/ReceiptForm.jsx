import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import api from '../services/api';

/// <summary>
/// Vatandaşın yeni fiş ekle butonuna bastığında açılan o havalı pencere (Modal).
/// Form verilerini toplayıp Backend'in upload servisine fırlatır.
/// </summary>
const ReceiptForm = ({ isOpen, onClose, onSuccess }) => {
  const [brandId, setBrandId] = useState('');
  const [receiptDate, setReceiptDate] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      /// API'ye normal JSON değil, fotoğraf göndereceğimiz için veriyi mecburen form-data kalıbına sokuyoruz.
      const formData = new FormData();
      formData.append('BrandId', brandId);
      formData.append('ReceiptDate', receiptDate);
      formData.append('TotalAmount', totalAmount);
      if (image) {
        formData.append('Image', image);
      }

      await api.post('/Receipts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Fiş yüklenirken bir hata oluştu. Bilgileri kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E1E3E1] flex justify-between items-center bg-[#F0F4F9]">
          <h3 className="text-lg font-bold text-[#1F1F1F]">Yeni Fiş Yükle</h3>
          <button onClick={onClose} className="text-[#747775] hover:text-[#5E5E5E] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-[#FCE8E6] text-[#C5221F] px-4 py-3 rounded-xl text-sm border border-[#FAD2CF]">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#1F1F1F] mb-1">Marka ID (Şimdilik Guid)</label>
            <input
              type="text"
              required
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full px-4 py-2 border border-[#E1E3E1] rounded-lg focus:ring-2 focus:ring-[#0B57D0] focus:border-[#0B57D0] outline-none transition-all"
              placeholder="00000000-0000-0000-0000-000000000000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1F1F1F] mb-1">Tarih</label>
              <input
                type="date"
                required
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
                className="w-full px-4 py-2 border border-[#E1E3E1] rounded-lg focus:ring-2 focus:ring-[#0B57D0] focus:border-[#0B57D0] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F1F1F] mb-1">Tutar (₺)</label>
              <input
                type="number"
                step="0.01"
                required
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full px-4 py-2 border border-[#E1E3E1] rounded-lg focus:ring-2 focus:ring-[#0B57D0] focus:border-[#0B57D0] outline-none transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F1F1F] mb-1">Fiş Fotoğrafı</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[#C6C7C6] border-dashed rounded-lg hover:border-[#0B57D0] transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-[#C6C7C6]" />
                <div className="flex text-sm text-[#5E5E5E] justify-center">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#0B57D0] hover:text-[#0842A0] focus-within:outline-none">
                    <span>Fotoğraf Seç</span>
                    <input type="file" className="sr-only" accept="image/*" onChange={(e) => setImage(e.target.files[0])} required />
                  </label>
                </div>
                <p className="text-xs text-[#747775]">{image ? image.name : 'PNG, JPG, max 10MB'}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-[#5E5E5E] bg-[#F0F4F9] hover:bg-[#E1E3E1] rounded-lg font-medium transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-white bg-[#0B57D0] hover:bg-[#0842A0] rounded-lg font-medium transition-colors shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {loading ? 'Yükleniyor...' : 'Fişi Yükle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReceiptForm;
