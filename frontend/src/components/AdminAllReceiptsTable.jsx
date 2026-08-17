import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import api, { getAllBrandsForManagement } from '../services/api';
import BrandLogo from './BrandLogo';

const getPageNumbers = (current, total) => {
  const delta = 1;
  const range = [];
  const withDots = [];
  let last;
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }
  range.forEach((i) => {
    if (last) {
      if (i - last === 2) {
        withDots.push(last + 1);
      } else if (i - last !== 1) {
        withDots.push('...');
      }
    }
    withDots.push(i);
    last = i;
  });
  return withDots;
};

/*
  2.
   tablo component
 * Bu bileşen  React statelerini  (page, size, status) tutar
 ve her sayfa değiştiğinde API'yi çağırarak backend'den yeni sayfanın verilerini çeker.
 */

// Sırala dropdown'ındaki tek seçim, backend'in ayrı ayrı istediği sortBy + sortDescending çiftine ayrıştırılıyor
const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Tarih (Yeni → Eski)', sortBy: 'date', sortDescending: true },
  { value: 'date_asc', label: 'Tarih (Eski → Yeni)', sortBy: 'date', sortDescending: false },
  { value: 'amount_desc', label: 'Tutar (Yüksek → Düşük)', sortBy: 'amount', sortDescending: true },
  { value: 'amount_asc', label: 'Tutar (Düşük → Yüksek)', sortBy: 'amount', sortDescending: false },
];

const AdminAllReceiptsTable = () => {
  const [receipts, setReceipts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortOption, setSortOption] = useState('date_desc');
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [imageLightboxOpen, setImageLightboxOpen] = useState(false);

  useEffect(() => {
    getAllBrandsForManagement().then(setBrands).catch((err) => console.error('Marka listesi alınamadı', err));
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, pageSize, statusFilter, brandFilter, dateFrom, dateTo, sortOption]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { sortBy, sortDescending } = SORT_OPTIONS.find((o) => o.value === sortOption);
      let url = `/Receipts/all?pageNumber=${page}&pageSize=${pageSize}&sortBy=${sortBy}&sortDescending=${sortDescending}`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      if (brandFilter) {
        url += `&brandId=${brandFilter}`;
      }
      if (dateFrom) {
        url += `&dateFrom=${dateFrom}`;
      }
      if (dateTo) {
        url += `&dateTo=${dateTo}`;
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

  const brandName = (brandId) => brands.find((b) => b.id === brandId)?.name || `${brandId?.substring(0, 8)}...`;

  // Herhangi bir filtre/sıralama değişince sayfa 1'e dönsün, yoksa örn. 3. sayfadayken filtre değiştirince boş sonuç görünebilir
  const withPageReset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  return (
    <div className="ga4-card p-6 mt-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-[#1F1F1F]">Tüm Fişler (Sayfalı Liste)</h2>
        <p className="text-sm text-[#5E5E5E]">Sistemdeki tüm fişleri listeleyip filtreleyebilirsiniz.</p>
      </div>

      <div className="bg-[#F8F9FA] border border-[#E1E3E1] rounded-2xl p-4 mb-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-[1fr_1fr_1.4fr_1.2fr] gap-4">
          <div>
            <label className="block text-[11px] font-bold text-[#747775] uppercase tracking-wider mb-1.5">Marka</label>
            <select
              value={brandFilter}
              onChange={(e) => withPageReset(setBrandFilter)(e.target.value)}
              className="w-full bg-white border border-[#E1E3E1] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0B57D0] transition-colors"
            >
              <option value="">Tümü</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#747775] uppercase tracking-wider mb-1.5">Durum</label>
            <select
              value={statusFilter}
              onChange={(e) => withPageReset(setStatusFilter)(e.target.value)}
              className="w-full bg-white border border-[#E1E3E1] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0B57D0] transition-colors"
            >
              <option value="">Tümü</option>
              <option value="Pending">Bekleyenler</option>
              <option value="Approved">Onaylananlar</option>
              <option value="Rejected">Reddedilenler</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#747775] uppercase tracking-wider mb-1.5">Tarih Aralığı</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => withPageReset(setDateFrom)(e.target.value)}
                className="w-full bg-white border border-[#E1E3E1] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0B57D0] transition-colors"
                title="Başlangıç tarihi"
              />
              <span className="text-[#C6C7C6] shrink-0">–</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => withPageReset(setDateTo)(e.target.value)}
                className="w-full bg-white border border-[#E1E3E1] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0B57D0] transition-colors"
                title="Bitiş tarihi"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#747775] uppercase tracking-wider mb-1.5">Sırala</label>
            <select
              value={sortOption}
              onChange={(e) => withPageReset(setSortOption)(e.target.value)}
              className="w-full bg-white border border-[#E1E3E1] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0B57D0] transition-colors"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border border-[#E1E3E1] rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F0F4F9] text-[#444746] text-sm font-semibold uppercase tracking-wider">
              <th className="px-4 py-3 border-b border-[#E1E3E1]">Marka</th>
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
                <tr
                  key={r.id || i}
                  onClick={() => setSelectedReceipt(r)}
                  className="hover:bg-[#F8F9FA] transition-colors border-b border-[#E1E3E1] last:border-0 cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm font-medium text-[#1F1F1F]">
                    {r.brandName || brandName(r.brandId)}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#444746]">
                    {new Date(r.receiptDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-[#0B57D0]">
                    {r.totalAmount?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-sm font-semibold border
                      ${r.status === 'Approved' ? 'ga4-badge-green'
                      : r.status === 'Pending' ? 'ga4-badge-amber'
                      : 'ga4-badge-red'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 mt-4 text-sm text-[#444746]">
        <div>
          Toplam <span className="font-bold">{totalCount}</span> kayıttan
          <span className="font-bold ml-1">{totalCount === 0 ? 0 : (page - 1) * pageSize + 1}</span> -
          <span className="font-bold mx-1">{Math.min(page * pageSize, totalCount)}</span>
          arası gösteriliyor.
        </div>
        <div className="flex items-center gap-2 flex-wrap lg:justify-end">
          <button
            onClick={handlePrevPage}
            disabled={page === 1 || loading}
            className="w-9 h-9 flex items-center justify-center bg-white border border-[#E1E3E1] rounded-full disabled:opacity-40 hover:bg-[#F0F4F9] transition-colors text-[#0B57D0] shrink-0"
            title="Önceki sayfa"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {getPageNumbers(page, totalPages).map((p, idx) =>
            p === '...' ? (
              <span key={`dots-${idx}`} className="w-9 h-9 flex items-center justify-center text-[#747775] shrink-0">…</span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                disabled={loading}
                className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-colors shrink-0 ${
                  p === page
                    ? 'bg-[#0B57D0] text-white'
                    : 'bg-white border border-[#E1E3E1] text-[#1F1F1F] hover:bg-[#F0F4F9]'
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={handleNextPage}
            disabled={page === totalPages || loading || totalPages === 0}
            className="w-9 h-9 flex items-center justify-center bg-white border border-[#E1E3E1] rounded-full disabled:opacity-40 hover:bg-[#F0F4F9] transition-colors text-[#0B57D0] shrink-0"
            title="Sonraki sayfa"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setSelectedReceipt(null); setImageLightboxOpen(false); }}
              className="absolute top-5 right-5 text-[#747775] hover:bg-[#F0F4F9] p-1.5 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-10">
              <div className="flex justify-between items-start gap-6 pb-6 border-b-2 border-[#0B57D0]">
                <div className="flex items-start gap-4">
                  {selectedReceipt.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageLightboxOpen(true)}
                      className="shrink-0 rounded-xl overflow-hidden border border-[#E1E3E1] hover:ring-2 hover:ring-[#0B57D0] transition-all"
                    >
                      <img
                        src={selectedReceipt.imageUrl}
                        alt="Fiş Görseli"
                        className="w-16 h-16 object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/64?text=Fis'; }}
                      />
                    </button>
                  )}
                  <div>
                    <p className="text-[12px] font-semibold text-[#747775] uppercase tracking-widest mb-1">Mağaza</p>
                    <div className="flex items-center gap-2.5">
                      <BrandLogo
                        name={selectedReceipt.brandName || brandName(selectedReceipt.brandId)}
                        logoUrl={brands.find((b) => b.id === selectedReceipt.brandId)?.logoUrl}
                        size={40}
                      />
                      <h3 className="text-2xl font-bold text-[#1F1F1F] leading-tight">
                        {selectedReceipt.brandName || brandName(selectedReceipt.brandId)}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <h4 className="text-xl font-extrabold text-[#0B57D0] tracking-wide">FİŞ</h4>
                  <p className="text-sm text-[#747775] mt-1">No: {selectedReceipt.id.substring(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-[#747775]">{new Date(selectedReceipt.receiptDate).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>

              <div className="flex justify-between items-center py-5">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${
                  selectedReceipt.status === 'Approved' ? 'ga4-badge-green'
                  : selectedReceipt.status === 'Pending' ? 'ga4-badge-amber'
                  : 'ga4-badge-red'
                }`}>
                  {selectedReceipt.status}
                </span>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E1E3E1] text-[13px] font-bold text-[#747775] uppercase tracking-wider">
                    <th className="py-2">Ürün Açıklaması</th>
                    <th className="py-2 text-center">Adet</th>
                    <th className="py-2 text-right">Fiyat</th>
                    <th className="py-2 text-right">Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedReceipt.items?.length > 0 ? selectedReceipt.items.map((item) => (
                    <tr key={item.id} className="border-b border-[#F0F4F9]">
                      <td className="py-3">
                        <span className="text-sm font-medium text-[#1F1F1F]">{item.productName}</span>
                        <span className="block text-[13px] text-[#747775]">{item.category}</span>
                      </td>
                      <td className="py-3 text-center text-sm text-[#5E5E5E]">{item.quantity}</td>
                      <td className="py-3 text-right text-sm text-[#5E5E5E]">₺{item.unitPrice}</td>
                      <td className="py-3 text-right text-sm font-semibold text-[#1F1F1F]">₺{item.totalPrice}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-sm text-[#747775]">Ürün kalemi eklenmemiş.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="flex justify-end mt-6">
                <div className="w-64 flex justify-between items-center pt-4 border-t border-[#E1E3E1]">
                  <span className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide">Genel Toplam</span>
                  <span className="text-lg font-extrabold text-[#0B57D0]">
                    {selectedReceipt.totalAmount?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {imageLightboxOpen && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
              onClick={() => setImageLightboxOpen(false)}
            >
              <button
                onClick={() => setImageLightboxOpen(false)}
                className="absolute top-5 right-5 text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={selectedReceipt.imageUrl}
                alt="Fiş Görseli"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x500?text=Fis+Gorseli'; }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAllReceiptsTable;
