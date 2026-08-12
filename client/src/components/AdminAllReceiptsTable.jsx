import { useState, useEffect } from 'react';
import api from '../services/api';

/*
  2.
   tablo component 
 * Bu bileşen  React statelerini  (page, size, status) tutar
 ve her sayfa değiştiğinde API'yi çağırarak backend'den yeni sayfanın verilerini çeker.
 */
const AdminAllReceiptsTable = () => {
  const [receipts, setReceipts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, pageSize, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = `/Receipts/all?pageNumber=${page}&pageSize=${pageSize}`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      const response = await api.get(url);
      const data = response.data;
      
      /*
       * Backend'den dönen data PagedResult<ReceiptDto> olduğu için içinde
       * data.items, data.totalCount, data.pageNumber vb. özellikleri bulunuyor.
       */
      setReceipts(data.items || []);
      setTotalCount(data.totalCount || 0);
      const calcPages = Math.ceil((data.totalCount || 0) / pageSize);
      setTotalPages(calcPages === 0 ? 1 : calcPages);
    } catch (error) {
      console.error("Tablo verisi çekilirken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  return (
    <div className="ga4-card p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#1F1F1F]">Tüm Fişler (Sayfalı Liste)</h2>
          <p className="text-xs text-[#5E5E5E]">Sistemdeki tüm fişleri listeleyip filtreleyebilirsiniz.</p>
        </div>
        <div>
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-[#E1E3E1] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#0B57D0]"
          >
            <option value="">Tümü (Filtresiz)</option>
            <option value="Pending">Bekleyenler</option>
            <option value="Approved">Onaylananlar</option>
            <option value="Rejected">Reddedilenler</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto border border-[#E1E3E1] rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F0F4F9] text-[#444746] text-xs font-semibold uppercase tracking-wider">
              <th className="px-4 py-3 border-b border-[#E1E3E1]">ID / Marka</th>
              <th className="px-4 py-3 border-b border-[#E1E3E1]">Tarih</th>
              <th className="px-4 py-3 border-b border-[#E1E3E1]">Tutar</th>
              <th className="px-4 py-3 border-b border-[#E1E3E1]">Durum</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="text-center py-4 text-sm">Yükleniyor...</td></tr>
            ) : receipts.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-4 text-sm">Kayıt bulunamadı.</td></tr>
            ) : (
              receipts.map((r, i) => (
                <tr key={r.id || i} className="hover:bg-[#F8F9FA] transition-colors border-b border-[#E1E3E1] last:border-0">
                  <td className="px-4 py-3 text-sm font-medium text-[#1F1F1F]">
                    {r.brandId?.substring(0,8)}...
                  </td>
                  <td className="px-4 py-3 text-sm text-[#444746]">
                    {new Date(r.receiptDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-[#0B57D0]">
                    {r.totalAmount?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                      ${r.status === 'Approved' ? 'bg-green-100 text-green-700' 
                      : r.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-red-100 text-red-700'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-[#444746]">
        <div>
          Toplam <span className="font-bold">{totalCount}</span> kayıttan 
          <span className="font-bold ml-1">{totalCount === 0 ? 0 : (page - 1) * pageSize + 1}</span> - 
          <span className="font-bold mx-1">{Math.min(page * pageSize, totalCount)}</span> 
          arası gösteriliyor.
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handlePrevPage} 
            disabled={page === 1 || loading}
            className="px-3 py-1 bg-white border border-[#E1E3E1] rounded-lg disabled:opacity-50 hover:bg-[#F0F4F9] transition-colors font-medium text-[#0B57D0]"
          >
            Önceki
          </button>
          <span>Sayfa {page} / {totalPages}</span>
          <button 
            onClick={handleNextPage} 
            disabled={page === totalPages || loading || totalPages === 0}
            className="px-3 py-1 bg-white border border-[#E1E3E1] rounded-lg disabled:opacity-50 hover:bg-[#F0F4F9] transition-colors font-medium text-[#0B57D0]"
          >
            Sonraki
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAllReceiptsTable;
