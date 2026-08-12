import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import api from '../services/api';

const CorporateAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/analytics/dashboard');
      setData(response.data);
    } catch (err) {
      console.error("Analitik verileri çekilemedi:", err);
      setError(err.response?.data?.message || err.message || "Analiz verileri yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="w-8 h-8 text-[#0B57D0] animate-spin" />
        <p className="text-sm text-[#5E5E5E]">Rapor Özeti Hazırlanıyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ga4-card p-6 flex items-start gap-4">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-bold text-sm text-[#1F1F1F]">Rapor Yüklenemedi</h3>
          <p className="text-sm text-[#5E5E5E] mt-1">{error}</p>
          <button 
            onClick={fetchAnalyticsData}
            className="mt-3 bg-[#0B57D0] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#0842A0] transition-colors"
          >
            Yeniden Yükle
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Page Header — plain text, no banner card */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1F1F1F] tracking-tight">{data.tenantName}</h1>
          <p className="text-sm text-[#5E5E5E] mt-1">
            B2B fiş işleme metrikleri ve harcama analizi
            <span className="text-xs text-[#747775] ml-2">· Son 30 gün · {data.subscriptionPlan} Paket</span>
          </p>
        </div>
      </div>

      {/* Metrics — single card with dividers, no separate cards */}
      <div className="ga4-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E1E3E1]">
          <div className="pb-4 md:pb-0 md:pr-6">
            <p className="text-xs text-[#5E5E5E] mb-1">Toplam Fiş Adedi</p>
            <p className="text-3xl font-bold text-[#1F1F1F] tracking-tight">{data.totalReceiptCount}</p>
            <p className="text-xs text-[#747775] mt-1">Onaylanmış dijital fişler</p>
          </div>
          <div className="py-4 md:py-0 md:px-6">
            <p className="text-xs text-[#5E5E5E] mb-1">Yakalanan Toplam Ciro</p>
            <p className="text-3xl font-bold text-[#1F1F1F] tracking-tight">
              ₺{Number(data.totalRevenueCaptured).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-[#747775] mt-1">Doğrulanmış ciro hacmi</p>
          </div>
          <div className="pt-4 md:pt-0 md:pl-6">
            <p className="text-xs text-[#5E5E5E] mb-1">Ortalama Sepet Tutarı</p>
            <p className="text-3xl font-bold text-[#1F1F1F] tracking-tight">
              ₺{Number(data.averageBasketAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-[#747775] mt-1">Fiş başına düşen harcama</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="ga4-card p-6 space-y-5">
          <h2 className="text-sm font-bold text-[#1F1F1F] border-b border-[#E1E3E1] pb-3">
            Harcama Kategorileri Dağılımı
          </h2>

          {data.categoryBreakdown && data.categoryBreakdown.length > 0 ? (
            <div className="space-y-4">
              {data.categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-[#1F1F1F]">{cat.categoryName}</span>
                    <span className="text-[#1F1F1F]">
                      ₺{Number(cat.totalAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      <span className="text-[#747775] text-xs ml-1.5">%{cat.percentage}</span>
                    </span>
                  </div>
                  <div className="w-full bg-[#F0F4F9] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#0B57D0] h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#747775] py-6 text-center">Kategorize edilmiş veri bulunmuyor.</p>
          )}
        </div>

        {/* Market Share */}
        <div className="ga4-card p-6 space-y-5">
          <div className="border-b border-[#E1E3E1] pb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-bold text-[#1F1F1F]">Pazar Payı Kıyaslaması</h2>
            <span className="text-xs text-[#747775]">
              {data.subscriptionPlan === "Premium" ? "Tüm markalar açık" : "Rakip isimleri maskeli"}
            </span>
          </div>

          {data.marketShareAnalysis && data.marketShareAnalysis.length > 0 ? (
            <div className="space-y-3.5">
              {data.marketShareAnalysis.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-baseline justify-between text-sm">
                    <div className="flex items-baseline gap-2">
                      <span className={`font-medium ${item.isCurrentBrand ? 'text-[#0B57D0]' : 'text-[#1F1F1F]'}`}>
                        {item.brandName}
                      </span>
                      {item.isCurrentBrand && (
                        <span className="text-[11px] text-[#0B57D0]">· sizin markanız</span>
                      )}
                    </div>
                    <span className="text-[#1F1F1F]">%{item.marketSharePercentage}</span>
                  </div>
                  <div className="w-full bg-[#F0F4F9] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${item.isCurrentBrand ? 'bg-[#0B57D0]' : 'bg-[#C6C7C6]'}`} 
                      style={{ width: `${Math.min(item.marketSharePercentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#747775] py-6 text-center">Pazar payı verisi bulunmuyor.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CorporateAnalytics;
