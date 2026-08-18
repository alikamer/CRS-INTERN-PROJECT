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

export default BrandScopeSelector;
