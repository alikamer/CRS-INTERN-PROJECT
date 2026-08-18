import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { getCustomerInsights, getInsightsBrands } from '../services/api';
import BrandScopeSelector from '../components/BrandScopeSelector';

const SEGMENT_GRID = {
  'Kaybetmek Üzereyiz': { colStart: 1, colEnd: 3, rowStart: 1, rowEnd: 2, color: '#e8837b' },
  'Riskli': { colStart: 1, colEnd: 3, rowStart: 2, rowEnd: 4, color: '#eeb28f' },
  'Uykuda': { colStart: 1, colEnd: 3, rowStart: 4, rowEnd: 6, color: '#aebfc9' },
  'Sadık Müşteri': { colStart: 3, colEnd: 4, rowStart: 1, rowEnd: 3, color: '#a293a8' },
  'İlgi Bekleyen': { colStart: 3, colEnd: 4, rowStart: 3, rowEnd: 4, color: '#f3d271' },
  'Uykuya Dalıyor': { colStart: 3, colEnd: 4, rowStart: 4, rowEnd: 6, color: '#a6d6d1' },
  'Şampiyon': { colStart: 4, colEnd: 6, rowStart: 1, rowEnd: 3, color: '#74acec' },
  'Potansiyel Sadık': { colStart: 4, colEnd: 6, rowStart: 3, rowEnd: 5, color: '#7ec98d' },
  'Umut Vaadeden': { colStart: 4, colEnd: 5, rowStart: 5, rowEnd: 6, color: '#bfa23e' },
  'Yeni Müşteri': { colStart: 5, colEnd: 6, rowStart: 5, rowEnd: 6, color: '#c6ce68' },
};

const SegmentGridChart = ({ items }) => {
  if (!items || items.length === 0) {
    return <p className="text-sm text-[#747775] py-6 text-center">Segment verisi bulunmuyor.</p>;
  }

  return (
    <div className="flex gap-2">
      <div className="flex flex-col justify-between text-[11px] text-[#747775] py-1" style={{ writingMode: 'vertical-rl' }}>
        <span className="rotate-180 tracking-wide">Frequency Score</span>
      </div>

      <div className="flex-1 space-y-1.5">
        <div className="flex gap-1.5">
          <div className="flex flex-col justify-between text-[11px] text-[#747775] w-4 py-1" style={{ height: 320 }}>
            <span>5</span>
            <span>4</span>
            <span>3</span>
            <span>2</span>
            <span>1</span>
          </div>

          <div
            className="flex-1 grid gap-1"
            style={{ gridTemplateColumns: 'repeat(5, 1fr)', gridTemplateRows: 'repeat(5, 1fr)', height: 320 }}
          >
            {items.map((item) => {
              const grid = SEGMENT_GRID[item.label];
              if (!grid) return null;
              return (
                <div
                  key={item.label}
                  className="rounded-lg p-3 flex flex-col justify-start overflow-hidden text-white"
                  style={{
                    gridColumn: `${grid.colStart} / ${grid.colEnd}`,
                    gridRow: `${grid.rowStart} / ${grid.rowEnd}`,
                    backgroundColor: grid.color,
                  }}
                >
                  <p className="text-sm font-bold leading-tight">{item.label}</p>
                  <p className="text-[11px] opacity-90 mt-1">
                    {item.count.toLocaleString('tr-TR')} kullanıcı (%{item.percentage})
                  </p>
                  <p className="text-[11px] opacity-90">
                    Ort. Harcama: ₺{item.avgMonetary.toLocaleString('tr-TR')}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-1.5 pl-[calc(1rem+0.375rem)]">
          <div className="flex-1 flex justify-between text-[11px] text-[#747775] px-1">
            <span>0</span>
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
        </div>
        <p className="text-[11px] text-[#747775] text-center pl-[calc(1rem+0.375rem)]">Recency Score</p>
      </div>
    </div>
  );
};

const Segmentation = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [mode, setMode] = useState('own');
  const [brands, setBrands] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState('');

  useEffect(() => {
    fetchSegments();
  }, []);

  useEffect(() => {
    if (data?.subscriptionPlan === 'Premium' && brands.length === 0) {
      getInsightsBrands().then(setBrands).catch((err) => console.error('Marka listesi alınamadı', err));
    }
  }, [data, brands.length]);

  const fetchSegments = async (params) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCustomerInsights(params);
      setData(response);
    } catch (err) {
      console.error('Segmentasyon verisi çekilemedi:', err);
      setError(err.response?.data?.message || err.message || 'Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    if (nextMode === 'own') {
      fetchSegments();
    } else if (nextMode === 'all') {
      fetchSegments({ allBrands: true });
    }
  };

  const handleSelectedBrandChange = (brandId) => {
    setSelectedBrandId(brandId);
    if (brandId) {
      fetchSegments({ brandId });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="w-8 h-8 text-[#0B57D0] animate-spin" />
        <p className="text-sm text-[#5E5E5E]">Segmentasyon hazırlanıyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ga4-card p-6 flex items-start gap-4">
        <AlertCircle className="w-5 h-5 text-[#C5221F] shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-bold text-sm text-[#1F1F1F]">Segmentasyon Yüklenemedi</h3>
          <p className="text-sm text-[#5E5E5E] mt-1">{error}</p>
          <button
            onClick={() => fetchSegments()}
            className="mt-3 bg-[#0B57D0] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#0842A0] transition-colors"
          >
            Yeniden Yükle
          </button>
        </div>
      </div>
    );
  }

  const hasCustomers = data?.demographics && data.demographics.totalCustomers > 0;
  const isPremium = data?.subscriptionPlan === 'Premium';
  const segments = data?.rfmSegments ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F1F1F] tracking-tight">Segmentasyon</h1>
        <p className="text-sm text-[#5E5E5E] mt-1">
          {data?.viewedBrandName ? `${data.viewedBrandName} müşterilerinin` : 'Markanızdan alışveriş yapan müşterilerin'} en son ne zaman alışveriş yaptığı ve ne sıklıkla alışveriş yaptığı baz alınarak sektör standardı RFM modeliyle 10 segmente ayrılması.
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
        <div className="ga4-card p-6 space-y-5">
          <h2 className="text-base font-bold text-[#1F1F1F] border-b border-[#E1E3E1] pb-3">RFM</h2>
          <SegmentGridChart items={segments} />
        </div>
      )}
    </div>
  );
};

export default Segmentation;
