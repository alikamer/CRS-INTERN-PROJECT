import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import api, { getCustomerInsights } from '../services/api';
import SalesTrendChart from '../components/SalesTrendChart';
import SegmentDistributionList from '../components/SegmentDistributionList';

const CATEGORICAL_PALETTE = ['#0B57D0', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#4a3aa7', '#e34948'];
const OVERFLOW_COLOR = '#C6C7C6';
const categoricalColor = (index) => CATEGORICAL_PALETTE[index] ?? OVERFLOW_COLOR;

const GeneralDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashboardRes, insightsRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        getCustomerInsights(),
      ]);
      setDashboard(dashboardRes.data);
      setInsights(insightsRes);
    } catch (err) {
      console.error('Genel dashboard verisi çekilemedi:', err);
      setError(err.response?.data?.message || err.message || 'Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="w-8 h-8 text-[#0B57D0] animate-spin" />
        <p className="text-sm text-[#5E5E5E]">Genel dashboard hazırlanıyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ga4-card p-6 flex items-start gap-4">
        <AlertCircle className="w-5 h-5 text-[#C5221F] shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-bold text-sm text-[#1F1F1F]">Dashboard Yüklenemedi</h3>
          <p className="text-sm text-[#5E5E5E] mt-1">{error}</p>
          <button
            onClick={fetchAll}
            className="mt-3 bg-[#0B57D0] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#0842A0] transition-colors"
          >
            Yeniden Yükle
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const demographics = insights?.demographics;
  const hasCustomers = demographics && demographics.totalCustomers > 0;
  const repeatRate = hasCustomers ? (insights.repeatCustomerRate ?? []).find((r) => r.label === 'Tekrar Eden') : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F1F1F] tracking-tight">Genel Dashboard</h1>
        <p className="text-sm text-[#5E5E5E] mt-1">
          {dashboard.tenantName} için ciro, müşteri ve segment verilerinin tek bakışta özeti.
        </p>
      </div>

      <div className="ga4-card p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-4 divide-x-0 lg:divide-x divide-[#E1E3E1]">
          <div className="lg:pr-6">
            <p className="text-sm text-[#5E5E5E] mb-1">Toplam Fiş Adedi</p>
            <p className="text-2xl font-bold text-[#1F1F1F] tracking-tight">{dashboard.totalReceiptCount}</p>
          </div>
          <div className="lg:px-6">
            <p className="text-sm text-[#5E5E5E] mb-1">Yakalanan Toplam Ciro</p>
            <p className="text-2xl font-bold text-[#1F1F1F] tracking-tight">
              ₺{Number(dashboard.totalRevenueCaptured).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="lg:px-6">
            <p className="text-sm text-[#5E5E5E] mb-1">Toplam Müşteri</p>
            <p className="text-2xl font-bold text-[#1F1F1F] tracking-tight">
              {hasCustomers ? demographics.totalCustomers.toLocaleString('tr-TR') : '—'}
            </p>
          </div>
          <div className="lg:pl-6">
            <p className="text-sm text-[#5E5E5E] mb-1">Tekrar Eden Müşteri Oranı</p>
            <p className="text-2xl font-bold text-[#1F1F1F] tracking-tight">%{repeatRate?.percentage ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="ga4-card p-6 space-y-5">
        <h2 className="text-base font-bold text-[#1F1F1F] border-b border-[#E1E3E1] pb-3">Aylık Satış Trendi</h2>
        {hasCustomers ? (
          <SalesTrendChart items={insights.salesTrend} height={260} />
        ) : (
          <p className="text-sm text-[#747775] py-6 text-center">Henüz analiz için yeterli müşteri verisi bulunmuyor.</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="ga4-card p-6 space-y-5">
          <h2 className="text-base font-bold text-[#1F1F1F] border-b border-[#E1E3E1] pb-3">RFM Segment Dağılımı</h2>
          {hasCustomers ? (
            <SegmentDistributionList items={insights.rfmSegments} maxItems={5} />
          ) : (
            <p className="text-sm text-[#747775] py-6 text-center">Henüz analiz için yeterli müşteri verisi bulunmuyor.</p>
          )}
        </div>

        <div className="ga4-card p-6 space-y-5">
          <h2 className="text-base font-bold text-[#1F1F1F] border-b border-[#E1E3E1] pb-3">Harcama Kategorileri</h2>
          {dashboard.categoryBreakdown && dashboard.categoryBreakdown.length > 0 ? (
            <div className="space-y-4">
              {dashboard.categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-[#1F1F1F]">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: categoricalColor(idx) }} />
                      {cat.categoryName}
                    </span>
                    <span className="text-[#1F1F1F]">
                      ₺{Number(cat.totalAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      <span className="text-[#747775] text-sm ml-1.5">%{cat.percentage}</span>
                    </span>
                  </div>
                  <div className="w-full bg-[#F0F4F9] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(cat.percentage, 100)}%`, backgroundColor: categoricalColor(idx) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#747775] py-6 text-center">Kategorize edilmiş veri bulunmuyor.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneralDashboard;
