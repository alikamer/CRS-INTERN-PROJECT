import React, { useState, useRef, useEffect } from 'react';
import { updateConsumerProfile } from '../services/api';

const TURKEY_CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
  "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
  "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari",
  "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
  "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
  "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat",
  "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman",
  "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

const ConsumerProfileModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    gender: '',
    city: '',
    incomeLevel: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Şehir araması için state'ler
  const [citySearch, setCitySearch] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const cityDropdownRef = useRef(null);

  // Dışarı tıklanınca şehir dropdown'ını kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCities = TURKEY_CITIES.filter(c => 
    c.toLocaleLowerCase('tr-TR').includes(citySearch.toLocaleLowerCase('tr-TR'))
  );

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Boş stringleri null'a çevir ki backend'de hata döndürmesin 
      const payload = {
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        city: formData.city || null,
        incomeLevel: formData.incomeLevel || null
      };

      await updateConsumerProfile(payload);
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Profil güncellenirken bir hata oluştu.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-md p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        
        <div className="bg-slate-50 border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Profilini Tamamla</h2>
            <p className="text-sm text-slate-500 mt-1">Sana özel kampanyalar için seni daha iyi tanıyalım.</p>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}
          
          <form id="profileForm" onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Doğum Tarihi</label>
              <input 
                type="date" 
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cinsiyet</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, gender: 'Erkek'})}
                  className={`py-2.5 rounded-lg border font-medium transition-all ${
                    formData.gender === 'Erkek' 
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Erkek
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, gender: 'Kadın'})}
                  className={`py-2.5 rounded-lg border font-medium transition-all ${
                    formData.gender === 'Kadın' 
                      ? 'bg-pink-50 border-pink-500 text-pink-700 shadow-sm' 
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Kadın
                </button>
              </div>
            </div>

            <div ref={cityDropdownRef} className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">Şehir</label>
              <div 
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-text flex items-center justify-between focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-colors"
                onClick={() => setIsCityDropdownOpen(true)}
              >
                <input
                  type="text"
                  placeholder="Şehir ara (Örn: İstanbul)"
                  value={isCityDropdownOpen ? citySearch : (formData.city || '')}
                  onChange={(e) => {
                    setCitySearch(e.target.value);
                    if(!isCityDropdownOpen) setIsCityDropdownOpen(true);
                  }}
                  onFocus={() => setIsCityDropdownOpen(true)}
                  className="w-full bg-transparent outline-none text-slate-800"
                />
                <span className="text-slate-400 text-xs">▼</span>
              </div>
              
              {isCityDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredCities.length > 0 ? (
                    filteredCities.map(city => (
                      <div
                        key={city}
                        onClick={() => {
                          setFormData({...formData, city});
                          setCitySearch('');
                          setIsCityDropdownOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-blue-50 hover:text-blue-700 cursor-pointer text-slate-700 transition-colors"
                      >
                        {city}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500 text-center">Şehir bulunamadı</div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Aylık Gelir Seviyesi</label>
              <select 
                value={formData.incomeLevel}
                onChange={(e) => setFormData({...formData, incomeLevel: e.target.value})}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors appearance-none"
              >
                <option value="" disabled>Seçiniz</option>
                <option value="Asgari Ücret ve Altı">Asgari Ücret ve Altı</option>
                <option value="20.000 TL - 40.000 TL">20.000 TL - 40.000 TL</option>
                <option value="40.000 TL - 70.000 TL">40.000 TL - 70.000 TL</option>
                <option value="70.000 TL Üzeri">70.000 TL Üzeri</option>
              </select>
            </div>

          </form>
        </div>

        <div className="border-t bg-slate-50 px-6 py-4 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Daha Sonra
          </button>
          <button
            type="submit"
            form="profileForm"
            disabled={loading}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-70 flex items-center"
          >
            {loading ? 'Kaydediliyor...' : 'Şimdi Tamamla'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConsumerProfileModal;
