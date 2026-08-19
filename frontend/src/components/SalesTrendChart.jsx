import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const MONTH_LABELS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

const formatMonthLabel = (label) => {
  const [year, month] = label.split('-');
  const monthName = MONTH_LABELS[Number(month) - 1] ?? month;
  return `${monthName} ${year}`;
};

const formatCurrency = (value) => `₺${Number(value).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;

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

/// <summary>Aylık ciro trendini çizgi grafik olarak gösterir. Segmentasyon/Kitle Analizi/Genel Dashboard arasında paylaşılır.</summary>
const SalesTrendChart = ({ items, height = 300 }) => {
  if (!items || items.length === 0) {
    return <p className="text-sm text-[#747775] py-6 text-center">Satış trendi verisi bulunmuyor.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
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

export default SalesTrendChart;
