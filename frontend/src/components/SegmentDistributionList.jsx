export const SEGMENT_COLORS = {
  'Kaybetmek Üzereyiz': '#D3564C',
  'Riskli': '#C97A3D',
  'Uykuda': '#7C93A3',
  'Sadık Müşteri': '#7C6B85',
  'İlgi Bekleyen': '#B98A2E',
  'Uykuya Dalıyor': '#5A9791',
  'Şampiyon': '#0B57D0',
  'Potansiyel Sadık': '#4E9B63',
  'Umut Vaadeden': '#A6832E',
  'Yeni Müşteri': '#8FA23E',
  'Kayıp': '#8B3A32',
};

// Şampiyon (en değerli) → Kayıp (en değersiz) sırasıyla, RFM segment hiyerarşisi
export const SEGMENT_ORDER = [
  'Şampiyon',
  'Sadık Müşteri',
  'Potansiyel Sadık',
  'Yeni Müşteri',
  'Umut Vaadeden',
  'İlgi Bekleyen',
  'Uykuya Dalıyor',
  'Uykuda',
  'Riskli',
  'Kaybetmek Üzereyiz',
  'Kayıp',
];

/// <summary>RFM segmentlerini sıralı, çubuklu bir liste olarak gösterir. Segmentasyon ve Genel Dashboard arasında paylaşılır.</summary>
const SegmentDistributionList = ({ items, maxItems }) => {
  if (!items || items.length === 0) {
    return <p className="text-sm text-[#747775] py-6 text-center">Segment verisi bulunmuyor.</p>;
  }

  const ordered = [...items].sort(
    (a, b) => SEGMENT_ORDER.indexOf(a.label) - SEGMENT_ORDER.indexOf(b.label)
  );
  const visible = maxItems ? ordered.slice(0, maxItems) : ordered;
  const maxPercentage = Math.max(...items.map((item) => item.percentage));

  return (
    <div className="space-y-4">
      {visible.map((item) => {
        const color = SEGMENT_COLORS[item.label] ?? '#8E918F';
        return (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium text-[#1F1F1F]">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                {item.label}
              </span>
              <span className="text-[#1F1F1F]">
                {item.count.toLocaleString('tr-TR')}
                <span className="text-[#747775] text-sm ml-1.5">%{item.percentage}</span>
              </span>
            </div>
            <div className="w-full bg-[#F0F4F9] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(item.percentage / maxPercentage) * 100}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SegmentDistributionList;
