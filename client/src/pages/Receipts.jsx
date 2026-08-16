import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import api from '../services/api';
import ReceiptForm from '../components/ReceiptForm';
import AdminAllReceiptsTable from '../components/AdminAllReceiptsTable';
import { useAuth } from '../context/AuthContext';

const Receipts = () => {
  const { user } = useAuth();
  const role = user?.role || 'Consumer';

  if (role === 'SystemAdmin') {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-[#1F1F1F] tracking-tight">Tüm Fiş Kayıtları</h1>
          <p className="text-sm text-[#5E5E5E] mt-1">Sistemdeki tüm fişleri görüntüleyin ve filtreleyin.</p>
        </div>
        <AdminAllReceiptsTable />
      </div>
    );
  }

  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchReceipts();
  }, [currentPage]);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/Receipts/my-receipts');
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
    fetchReceipts();
  };

  return (
    <div className="ga4-card p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-[#E1E3E1] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#1F1F1F]">Fiş Listesi Raporu</h2>
          <p className="text-xs text-[#5E5E5E] mt-0.5">Sisteme kaydedilmiş dijital fişlerin tam dökümü.</p>
        </div>
        <div className="flex items-center space-x-2">
          <form onSubmit={handleSearch} className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-[#747775] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Fiş veya Mağaza ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-[#E1E3E1] rounded-full focus:outline-none focus:border-[#0B57D0] text-xs bg-[#F0F4F9]"
            />
          </form>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-[#0B57D0] text-white rounded-full hover:bg-[#0842A0] text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Yeni Fiş Ekle
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#0B57D0]"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border border-[#E1E3E1] rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F0F4F9] border-b border-[#E1E3E1] text-xs font-bold text-[#5E5E5E]">
                  <th className="py-3 px-4">Fiş No</th>
                  <th className="py-3 px-4">Tarih</th>
                  <th className="py-3 px-4">Tutar</th>
                  <th className="py-3 px-4">Durum</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {receipts.length > 0 ? (
                  receipts.map((receipt) => (
                    <tr key={receipt.id} className="border-b border-[#E1E3E1] hover:bg-[#F8F9FA] transition-colors">
                      <td className="py-3 px-4 font-bold text-[#1F1F1F]">#{receipt.id.substring(0, 8)}</td>
                      <td className="py-3 px-4 text-[#5E5E5E]">{new Date(receipt.receiptDate).toLocaleDateString('tr-TR')}</td>
                      <td className="py-3 px-4 text-[#1F1F1F] font-bold">₺{receipt.totalAmount.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          receipt.status === 'Approved' ? 'ga4-badge-green' :
                          receipt.status === 'Pending' ? 'ga4-badge-amber' :
                          'ga4-badge-red'
                        }`}>
                          {receipt.status === 'Approved' ? 'Onaylandı' : receipt.status === 'Pending' ? 'Beklemede' : 'Reddedildi'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-10 text-center text-[#747775] text-xs">
                      {searchTerm ? 'Arama kriterlerinize uygun fiş bulunamadı.' : 'Henüz hiç fiş eklenmemiş.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4 text-xs">
            <div className="text-[#5E5E5E]">
              Toplam <span className="font-bold text-[#1F1F1F]">{totalCount}</span> kayıttan gösteriliyor
            </div>
            <div className="flex gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 border border-[#E1E3E1] rounded-full disabled:opacity-50 hover:bg-[#F0F4F9] text-xs font-semibold text-[#1F1F1F]"
              >
                Önceki
              </button>
              <div className="flex items-center justify-center px-3 py-1 bg-[#F0F4F9] text-[#1F1F1F] rounded-full text-xs font-bold">
                {currentPage} / {totalPages || 1}
              </div>
              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1 border border-[#E1E3E1] rounded-full disabled:opacity-50 hover:bg-[#F0F4F9] text-xs font-semibold text-[#1F1F1F]"
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
        onSuccess={() => fetchReceipts()} 
      />
    </div>
  );
};

export default Receipts;
