import { TrendingUp, ShoppingBag, DollarSign, PieChart, ShieldAlert } from 'lucide-react';

const CorporateAnalytics = () => {
  const dummyData = {
    tenantName: "Zara Tekstil A.Ş.",
    subscriptionPlan: "Normal",
    totalReceiptCount: 142,
    totalRevenueCaptured: 85400.00,
    averageBasketAmount: 601.40,
    categoryBreakdown: [
      { categoryName: "Giyim & Aksesuar", totalAmount: 52000, percentage: 60.8 },
      { categoryName: "Ayakkabı", totalAmount: 21400, percentage: 25.1 },
      { categoryName: "Kozmetik & Parfüm", totalAmount: 12000, percentage: 14.1 }
    ],
    marketShareAnalysis: [
      { brandName: "Zara", marketSharePercentage: 42.5, isCurrentBrand: true },
      { brandName: "Rakip Marka 1", marketSharePercentage: 31.0, isCurrentBrand: false },
      { brandName: "Rakip Marka 2", marketSharePercentage: 26.5, isCurrentBrand: false }
    ]
  };

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-500/30 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full uppercase border border-indigo-500/40">
              B2B Kurumsal Analiz Portalı
            </span>
            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full uppercase border border-emerald-500/30">
              {dummyData.subscriptionPlan} Paket
            </span>
          </div>
          <h2 className="text-2xl font-bold mt-2">{dummyData.tenantName}</h2>
          <p className="text-slate-400 text-sm mt-1">Gerçek zamanlı fiş tüketim verileri, kategori dağılımı ve rakip pazar payı raporu.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm font-medium">Toplam İşlenen Fiş</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-3">{dummyData.totalReceiptCount}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm font-medium">Toplam Yakalanan Ciro</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-3">₺{dummyData.totalRevenueCaptured.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm font-medium">Ortalama Sepet Tutarı</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-3">₺{dummyData.averageBasketAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-600" /> Kategori Bazlı Harcama Dağılımı
          </h3>
          <div className="space-y-4">
            {dummyData.categoryBreakdown.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-700">{cat.categoryName}</span>
                  <span className="text-gray-900 font-bold">₺{cat.totalAmount.toFixed(2)} (%{cat.percentage})</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${cat.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" /> Pazar Payı & Rakip Analizi
            </h3>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Rakip İsimleri Maskeli (Normal Paket)
            </span>
          </div>

          <div className="space-y-4">
            {dummyData.marketShareAnalysis.map((item, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-xl border transition-all ${
                  item.isCurrentBrand ? 'bg-indigo-50/50 border-indigo-200' : 'bg-gray-50 border-gray-100'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm ${item.isCurrentBrand ? 'text-indigo-900' : 'text-gray-700'}`}>
                      {item.brandName}
                    </span>
                    {item.isCurrentBrand && (
                      <span className="bg-indigo-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                        Sizin Markanız
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-900">%{item.marketSharePercentage}</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${item.isCurrentBrand ? 'bg-indigo-600' : 'bg-slate-400'}`} 
                    style={{ width: `${item.marketSharePercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateAnalytics;
