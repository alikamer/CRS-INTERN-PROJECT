import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getCustomerInsights, getInsightsBrands } from '../services/api';
import BrandScopeSelector from '../components/BrandScopeSelector';

const SEQUENTIAL_BLUE = ['#b7d3f6', '#86b6ef', '#5598e7', '#2a78d6', '#1c5cab', '#104281'];
const NEUTRAL_GRAY = '#C6C7C6';
const GENDER_COLORS = { Erkek: '#A8C7FA', Kadın: '#F4A6C6' };
const REPEAT_RATE_COLORS = { 'Tekrar Eden': '#1baf7a', 'Tek Seferlik': '#eda100' };

const barColor = (label, index) => (label === 'Bilinmiyor' ? NEUTRAL_GRAY : SEQUENTIAL_BLUE[index] || NEUTRAL_GRAY);

const MONTH_LABELS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

const formatMonthLabel = (label) => {
  const [year, month] = label.split('-');
  const monthName = MONTH_LABELS[Number(month) - 1] ?? month;
  return `${monthName} ${year}`;
};

const formatCurrency = (value) => `₺${Number(value).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;

const OrderedDistributionList = ({ items, getColor = barColor }) => (
  <div className="space-y-4">
    {items.map((item, index) => (
      <div key={item.label} className="space-y-1.5">
        <div className="flex justify-between items-baseline text-sm">
          <span className="font-medium text-[#1F1F1F]">{item.label}</span>
          <span className="font-semibold text-[#1F1F1F]">%{item.percentage}</span>
        </div>
        <div className="w-full bg-[#F0F4F9] h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(item.percentage, 100)}%`, backgroundColor: getColor(item.label, index) }}
          />
        </div>
      </div>
    ))}
  </div>
);

const RankedDistributionList = ({ items, maxItems }) => {
  const [expanded, setExpanded] = useState(false);
  const visible = !expanded && maxItems ? items.slice(0, maxItems) : items;
  const remaining = items.length - visible.length;

  return (
    <div className="space-y-4">
      {visible.map((item) => (
        <div key={item.label} className="space-y-1.5">
          <div className="flex justify-between items-baseline text-sm">
            <span className="font-medium text-[#1F1F1F]">{item.label}</span>
            <span className="font-semibold text-[#1F1F1F]">%{item.percentage}</span>
          </div>
          <div className="w-full bg-[#F0F4F9] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#2a78d6] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(item.percentage, 100)}%` }}
            />
          </div>
        </div>
      ))}
      {remaining > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="text-sm font-medium text-[#0B57D0] hover:underline"
        >
          +{remaining} şehir daha
        </button>
      )}
      {expanded && maxItems && items.length > maxItems && (
        <button
          onClick={() => setExpanded(false)}
          className="text-sm font-medium text-[#0B57D0] hover:underline"
        >
          Daha az göster
        </button>
      )}
    </div>
  );
};

const GenderTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-white border border-[#E1E3E1] rounded-lg shadow-md px-3 py-2 text-sm">
      <p className="font-semibold text-[#1F1F1F]">{item.label}</p>
      <p className="text-[#5E5E5E]">%{item.percentage}</p>
    </div>
  );
};

const renderSliceLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) / 2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#1F1F1F" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700}>
      {`%${percentage}`}
    </text>
  );
};

const CategoricalDonutChart = ({ items, colors }) => {
  if (items.length === 0) {
    return <p className="text-sm text-[#747775] py-6 text-center">Veri bulunmuyor.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={items}
          dataKey="percentage"
          nameKey="label"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
          cornerRadius={4}
          stroke="none"
          label={renderSliceLabel}
          labelLine={false}
        >
          {items.map((item) => (
            <Cell key={item.label} fill={colors[item.label] || NEUTRAL_GRAY} />
          ))}
        </Pie>
        <Tooltip content={<GenderTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={32}
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span className="text-sm text-[#5E5E5E]">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

const SalesTrendTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-white border border-[#E1E3E1] rounded-lg shadow-md px-3 py-2 text-sm">
      <p className="font-semibold text-[#1F1F1F]">{formatMonthLabel(item.label)}</p>
      <p className="text-[#5E5E5E]">{formatCurrency(item.value)}</p>
    </div>
  );
};

const SalesTrendChart = ({ items }) => {
  if (!items || items.length === 0) {
    return <p className="text-sm text-[#747775] py-6 text-center">Satış trendi verisi bulunmuyor.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={items} margin={{ top: 8, right: 12, left: 0, bottom: 16 }}>
        <CartesianGrid stroke="#E1E3E1" vertical={false} />
        <XAxis
          dataKey="label"
          tickFormatter={formatMonthLabel}
          interval={0}
          angle={-35}
          textAnchor="end"
          height={60}
          tick={{ fontSize: 12, fontWeight: 600, fill: '#3C4043' }}
          axisLine={{ stroke: '#E1E3E1' }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `₺${Number(v).toLocaleString('tr-TR')}`}
          tick={{ fontSize: 12, fill: '#5E5E5E' }}
          axisLine={false}
          tickLine={false}
          width={70}
        />
        <Tooltip content={<SalesTrendTooltip />} />
        <Line type="monotone" dataKey="value" stroke="#0B57D0" strokeWidth={2.5} dot={{ r: 3, fill: '#0B57D0' }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

const InsightsTabSelector = ({ activeTab, onTabChange }) => (
  <div className="flex items-center gap-1 bg-[#F0F4F9] rounded-full p-1 w-fit">
    {[
      { key: 'demographics', label: 'Demografi' },
      { key: 'behavior', label: 'Davranış' },
    ].map((tab) => (
      <button
        key={tab.key}
        onClick={() => onTabChange(tab.key)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
          activeTab === tab.key ? 'bg-white text-[#0B57D0] shadow-xs' : 'text-[#5E5E5E] hover:text-[#1F1F1F]'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

const CustomerInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('demographics');
  const [mode, setMode] = useState('own');
  const [brands, setBrands] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState('');

  useEffect(() => {
    fetchInsights();
  }, []);

  useEffect(() => {
    if (data?.subscriptionPlan === 'Premium' && brands.length === 0) {
      getInsightsBrands().then(setBrands).catch((err) => console.error('Marka listesi alınamadı', err));
    }
  }, [data, brands.length]);

  const fetchInsights = async (params) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCustomerInsights(params);
      setData(response);
    } catch (err) {
      console.error('Müşteri içgörüleri çekilemedi:', err);
      setError(err.response?.data?.message || err.message || 'Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    if (nextMode === 'own') {
      fetchInsights();
    } else if (nextMode === 'all') {
      fetchInsights({ allBrands: true });
    }
    // 'select' modunda kullanıcı bir marka seçene kadar bekleniyor.
  };

  const handleSelectedBrandChange = (brandId) => {
    setSelectedBrandId(brandId);
    if (brandId) {
      fetchInsights({ brandId });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="w-8 h-8 text-[#0B57D0] animate-spin" />
        <p className="text-sm text-[#5E5E5E]">Kitle analizi hazırlanıyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ga4-card p-6 flex items-start gap-4">
        <AlertCircle className="w-5 h-5 text-[#C5221F] shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-bold text-sm text-[#1F1F1F]">İçgörüler Yüklenemedi</h3>
          <p className="text-sm text-[#5E5E5E] mt-1">{error}</p>
          <button
            onClick={() => fetchInsights()}
            className="mt-3 bg-[#0B57D0] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#0842A0] transition-colors"
          >
            Yeniden Yükle
          </button>
        </div>
      </div>
    );
  }

  const demographics = data?.demographics;
  const incomeLevel = data?.incomeLevel;
  const hasCustomers = demographics && demographics.totalCustomers > 0;
  const isPremium = data?.subscriptionPlan === 'Premium';

  const topAgeBand = hasCustomers
    ? [...demographics.ageDistribution].sort((a, b) => b.count - a.count)[0]
    : null;
  const repeatRate = hasCustomers
    ? (data.repeatCustomerRate ?? []).find((r) => r.label === 'Tekrar Eden')
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F1F1F] tracking-tight">Kitle Analizi</h1>
        <p className="text-sm text-[#5E5E5E] mt-1">
          {data?.viewedBrandName ? `${data.viewedBrandName} müşterilerinin` : 'Markanızdan alışveriş yapan müşterilerin'} yaş, cinsiyet, şehir, gelir seviyesi dağılımı, satış trendi ve tekrar eden müşteri oranı.
        </p>
      </div>

      {hasCustomers && (
        <div className="ga4-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E1E3E1]">
            <div className="pb-4 md:pb-0 md:pr-6">
              <p className="text-sm text-[#5E5E5E] mb-1">Toplam Müşteri</p>
              <p className="text-3xl font-bold text-[#1F1F1F] tracking-tight">{demographics.totalCustomers.toLocaleString('tr-TR')}</p>
              <p className="text-sm text-[#747775] mt-1">Analiz kapsamındaki benzersiz müşteri</p>
            </div>
            <div className="py-4 md:py-0 md:px-6">
              <p className="text-sm text-[#5E5E5E] mb-1">En Yoğun Yaş Grubu</p>
              <p className="text-3xl font-bold text-[#1F1F1F] tracking-tight">{topAgeBand?.label ?? '—'}</p>
              <p className="text-sm text-[#747775] mt-1">{topAgeBand ? `Müşterilerin %${topAgeBand.percentage}'i` : ''}</p>
            </div>
            <div className="pt-4 md:pt-0 md:pl-6">
              <p className="text-sm text-[#5E5E5E] mb-1">Tekrar Eden Müşteri Oranı</p>
              <p className="text-3xl font-bold text-[#1F1F1F] tracking-tight">%{repeatRate?.percentage ?? 0}</p>
              <p className="text-sm text-[#747775] mt-1">Birden fazla onaylı fişi olanlar</p>
            </div>
          </div>
        </div>
      )}

      {isPremium && (
        <BrandScopeSelector
          mode={mode}
          onModeChange={handleModeChange}
          brands={brands}
          selectedBrandId={selectedBrandId}
          onSelectedBrandChange={handleSelectedBrandChange}
        />
      )}

      {hasCustomers && <InsightsTabSelector activeTab={activeTab} onTabChange={setActiveTab} />}

      {!hasCustomers ? (
        <div className="ga4-card p-6">
          <p className="text-sm text-[#747775] py-6 text-center">
            Henüz analiz için yeterli müşteri verisi bulunmuyor.
          </p>
        </div>
      ) : activeTab === 'demographics' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="ga4-card p-6 space-y-5">
            <h2 className="text-base font-bold text-[#1F1F1F] border-b border-[#E1E3E1] pb-3">
              Yaş Dağılımı
            </h2>
            <OrderedDistributionList items={demographics.ageDistribution} />
          </div>

          <div className="ga4-card p-6 space-y-5">
            <h2 className="text-base font-bold text-[#1F1F1F] border-b border-[#E1E3E1] pb-3">
              Cinsiyet Dağılımı
            </h2>
            <CategoricalDonutChart items={demographics.genderDistribution} colors={GENDER_COLORS} />
          </div>

          <div className="ga4-card p-6 space-y-5">
            <h2 className="text-base font-bold text-[#1F1F1F] border-b border-[#E1E3E1] pb-3">
              Şehir Dağılımı
            </h2>
            <RankedDistributionList items={demographics.cityDistribution} maxItems={8} />
          </div>

          <div className="ga4-card p-6 space-y-5">
            <h2 className="text-base font-bold text-[#1F1F1F] border-b border-[#E1E3E1] pb-3">
              Gelir Seviyesi Dağılımı
            </h2>
            <OrderedDistributionList items={incomeLevel.incomeDistribution} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 ga4-card p-6 space-y-5">
            <h2 className="text-base font-bold text-[#1F1F1F] border-b border-[#E1E3E1] pb-3">
              Aylık Satış Trendi
            </h2>
            <SalesTrendChart items={data.salesTrend} />
          </div>

          <div className="ga4-card p-6 space-y-5">
            <h2 className="text-base font-bold text-[#1F1F1F] border-b border-[#E1E3E1] pb-3">
              Tekrar Eden Müşteri Oranı
            </h2>
            <CategoricalDonutChart items={data.repeatCustomerRate ?? []} colors={REPEAT_RATE_COLORS} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerInsights;
