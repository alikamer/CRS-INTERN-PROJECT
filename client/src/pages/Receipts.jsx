import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import api from '../services/api';
import ReceiptForm from '../components/ReceiptForm';

const Receipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 5; // Sayfa başına gösterilecek fiş sayısı

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchReceipts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      /// Vatandaşın yüklediği tüm fişleri yeni yazdığımız my-receipts noktasından (Endpoint) çekiyoruz.
      const response = await api.get('/Receipts/my-receipts');
      
      /// Gelen veri direkt fiş listemiz, onu State'e (Hafızaya) alıyoruz.
      setReceipts(response.data);
      setTotalCount(response.data.length);
    } catch (error) {
      console.error('Fişler çekilirken hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    /// Arama işlemi şimdilik frontend'de yapılabilir ama MVP'de filtrelemeyi basit tutuyoruz.
    fetchReceipts();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Fiş Listesi</h2>
          <p className="text-sm text-gray-500 mt-1">Sisteme yüklenen tüm fişleri buradan görüntüleyebilirsiniz.</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Mağaza veya Durum ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full md:w-64 text-gray-900"
          />
          <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium transition-colors">
            Ara
          </button>
        </form>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4 mr-2" /> Yeni Fiş Ekle
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border border-gray-100 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm">
                  <th className="py-3 px-4 font-semibold text-gray-600">Mağaza</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Tarih</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Tutar</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Durum</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {receipts.length > 0 ? (
                  receipts.map((receipt) => (
                    <tr key={receipt.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900">{receipt.brandId}</td>
                      <td className="py-3 px-4 text-gray-500">{new Date(receipt.receiptDate).toLocaleDateString('tr-TR')}</td>
                      <td className="py-3 px-4 text-gray-900 font-medium">₺{receipt.totalAmount.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          receipt.status === 'Approved' ? 'bg-green-100 text-green-700' :
                          receipt.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {receipt.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-gray-500">
                      {searchTerm ? 'Arama kriterlerinize uygun fiş bulunamadı.' : 'Henüz hiç fiş eklenmemiş.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <div className="text-sm text-gray-500">
              Toplam <span className="font-medium text-gray-900">{totalCount}</span> kayıttan <span className="font-medium text-gray-900">{totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> - <span className="font-medium text-gray-900">{Math.min(currentPage * pageSize, totalCount)}</span> arası gösteriliyor
            </div>
            <div className="flex gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
              >
                Önceki
              </button>
              <div className="flex items-center justify-center px-4 py-1.5 bg-gray-50 text-gray-900 rounded-md text-sm font-medium border border-gray-200">
                {currentPage} / {totalPages || 1}
              </div>
              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
              >
                Sonraki
              </button>
            </div>
          </div>
        </>
      )}

      <ReceiptForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => fetchReceipts(searchTerm, currentPage)} 
      />
    </div>
  );
};

export default Receipts;
