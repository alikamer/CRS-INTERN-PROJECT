import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getCustomerInsights, getInsightsBrands } from '../services/api';

const SEQUENTIAL_BLUE = ['#b7d3f6', '#86b6ef', '#5598e7', '#2a78d6', '#1c5cab', '#104281'];
const NEUTRAL_GRAY = '#C6C7C6';
const GENDER_COLORS = { Erkek: '#A8C7FA', Kadın: '#F4A6C6' };

const barColor = (label, index) => (label === 'Bilinmiyor' ? NEUTRAL_GRAY : SEQUENTIAL_BLUE[index] || NEUTRAL_GRAY);

const OrderedDistributionList = ({ items }) => (
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
            style={{ width: `${Math.min(item.percentage, 100)}%`, backgroundColor: barColor(item.label, index) }}
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

const GenderPieChart = ({ items }) => {
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
            <Cell key={item.label} fill={GENDER_COLORS[item.label] || NEUTRAL_GRAY} />
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

const BrandScopeSelector = ({ mode, onModeChange, brands, selectedBrandId, onSelectedBrandChange }) => (
  <div className="ga4-card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
    <span className="text-sm font-semibold text-[#1F1F1F] shrink-0">Kapsam:</span>
    <div className="flex items-center gap-1 bg-[#F0F4F9] rounded-full p-1">
      {[
        { key: 'own', label: 'Kendi Markam' },
        { key: 'all', label: 'Tüm Markalar' },
        { key: 'select', label: 'Marka Seç' },
      ].map((option) => (
        <button
          key={option.key}
          onClick={() => onModeChange(option.key)}
          className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
            mode === option.key ? 'bg-white text-[#0B57D0] shadow-xs' : 'text-[#5E5E5E] hover:text-[#1F1F1F]'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
    {mode === 'select' && (
      <select
        value={selectedBrandId}
        onChange={(e) => onSelectedBrandChange(e.target.value)}
        className="px-3 py-1.5 border border-[#E1E3E1] rounded-lg text-sm bg-white outline-none focus:border-[#0B57D0]"
      >
        <option value="">Marka seçin</option>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>
    )}
  </div>
);

const CustomerInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F1F1F] tracking-tight">Kitle Analizi</h1>
        <p className="text-sm text-[#5E5E5E] mt-1">
          {data?.viewedBrandName ? `${data.viewedBrandName} müşterilerinin` : 'Markanızdan alışveriş yapan müşterilerin'} yaş, cinsiyet, şehir ve gelir seviyesi dağılımı.
        </p>
      </div>

      {isPremium && (
        <BrandScopeSelector
          mode={mode}
          onModeChange={handleModeChange}
          brands={brands}
          selectedBrandId={selectedBrandId}
          onSelectedBrandChange={handleSelectedBrandChange}
        />
      )}

      {!hasCustomers ? (
        <div className="ga4-card p-6">
          <p className="text-sm text-[#747775] py-6 text-center">
            Henüz analiz için yeterli müşteri verisi bulunmuyor.
          </p>
        </div>
      ) : (
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
            <GenderPieChart items={demographics.genderDistribution} />
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
      )}
    </div>
  );
};

export default CustomerInsights;
