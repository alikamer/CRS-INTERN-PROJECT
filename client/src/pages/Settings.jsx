import { useState, useEffect, useRef } from 'react';
import { getConsumerProfile, updateConsumerProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Edit2, Check, X } from 'lucide-react';

const CITIES = [
  "Adana","Adıyaman","Afyonkarahisar","Ağrı","Amasya","Ankara","Antalya","Artvin","Aydın","Balıkesir",
  "Bilecik","Bingöl","Bitlis","Bolu","Burdur","Bursa","Çanakkale","Çankırı","Çorum","Denizli",
  "Diyarbakır","Edirne","Elazığ","Erzincan","Erzurum","Eskişehir","Gaziantep","Giresun","Gümüşhane","Hakkari",
  "Hatay","Isparta","Mersin","İstanbul","İzmir","Kars","Kastamonu","Kayseri","Kırklareli","Kırşehir",
  "Kocaeli","Konya","Kütahya","Malatya","Manisa","Kahramanmaraş","Mardin","Muğla","Muş","Nevşehir",
  "Niğde","Ordu","Rize","Sakarya","Samsun","Siirt","Sinop","Sivas","Tekirdağ","Tokat",
  "Trabzon","Tunceli","Şanlıurfa","Uşak","Van","Yozgat","Zonguldak","Aksaray","Bayburt","Karaman",
  "Kırıkkale","Batman","Şırnak","Bartın","Ardahan","Iğdır","Yalova","Karabük","Kilis","Osmaniye","Düzce"
];

const ReadOnlyField = ({ label, value }) => (
  <div>
    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">{label}</label>
    <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 text-sm cursor-not-allowed select-none">
      {value || <span className="text-slate-300 italic">Belirtilmemiş</span>}
    </div>
  </div>
);

const Settings = () => {
  const { user } = useAuth();
  const role = user?.role || 'Consumer';

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [data, setData] = useState({
    firstName: '', lastName: '', email: '', phoneNumber: '',
    dateOfBirth: '', gender: '', city: '', incomeLevel: ''
  });
  const [editData, setEditData] = useState({ ...data });

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const cityDropdownRef = useRef(null);

  useEffect(() => {
    if (role === 'Consumer') {
      getConsumerProfile().then(profile => {
        if (profile) {
          const loaded = {
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            email: profile.email || '',
            phoneNumber: profile.phoneNumber || '',
            dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
            gender: profile.gender || '',
            city: profile.city || '',
            incomeLevel: profile.incomeLevel || ''
          };
          setData(loaded);
          setEditData(loaded);
          setCitySearchTerm(profile.city || '');
        }
      }).catch(console.error).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCities = CITIES.filter(c => c.toLowerCase().includes(citySearchTerm.toLowerCase()));

  const handleEdit = () => {
    setEditData({ ...data });
    setCitySearchTerm(data.city || '');
    setEditing(true);
    setMessage('');
    setError('');
  };

  const handleCancel = () => {
    setEditData({ ...data });
    setCitySearchTerm(data.city || '');
    setEditing(false);
    setError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await updateConsumerProfile({
        dateOfBirth: editData.dateOfBirth || null,
        gender: editData.gender || null,
        city: editData.city || null,
        incomeLevel: editData.incomeLevel || null
      });
      setData({ ...editData });
      setCitySearchTerm(editData.city || '');
      setEditing(false);
      setMessage('Bilgiler güncellendi.');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setError('Güncelleme sırasında bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-400 text-sm">Yükleniyor...</div>;

  if (role !== 'Consumer') {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-3xl">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Ayarlar</h2>
        <p className="text-slate-500 text-sm">Bu hesap türü için profil ayarları yapılandırılmamıştır.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Hesap &amp; Profil Bilgileri</h2>
            <p className="text-xs text-slate-400 mt-0.5">E-posta adresi değiştirilemez.</p>
          </div>
          {!editing ? (
            <button
              onClick={handleEdit}
              className="flex items-center space-x-1.5 text-xs font-medium text-[#0B57D0] hover:bg-[#EEF3FC] px-3 py-1.5 rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Düzenle</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center space-x-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>İptal</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-1.5 text-xs font-medium text-white bg-[#0B57D0] hover:bg-[#0842a0] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-70"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{saving ? 'Kaydediliyor...' : 'Kaydet'}</span>
              </button>
            </div>
          )}
        </div>

        <div className="p-8">
          {message && (
            <div className="mb-6 p-3 bg-green-50 text-green-700 text-sm rounded-xl border border-green-100">{message}</div>
          )}
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {editing ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Ad</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57D0] transition-colors"
                    value={editData.firstName} onChange={e => setEditData({ ...editData, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Soyad</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57D0] transition-colors"
                    value={editData.lastName} onChange={e => setEditData({ ...editData, lastName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Telefon</label>
                  <input type="tel" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57D0] transition-colors"
                    value={editData.phoneNumber} onChange={e => setEditData({ ...editData, phoneNumber: e.target.value })} />
                </div>
                <ReadOnlyField label="E-posta" value={data.email} />
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Doğum Tarihi</label>
                  <input type="date" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57D0] transition-colors"
                    value={editData.dateOfBirth} onChange={e => setEditData({ ...editData, dateOfBirth: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Cinsiyet</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Erkek', 'Kadın'].map(g => (
                      <button key={g} type="button"
                        onClick={() => setEditData({ ...editData, gender: g })}
                        className={`py-2.5 rounded-xl border font-medium text-sm transition-all ${editData.gender === g ? 'bg-[#0B57D0] text-white border-[#0B57D0]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div ref={cityDropdownRef} className="relative">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Şehir</label>
                  <div className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between focus-within:ring-2 focus-within:ring-[#0B57D0] transition-colors cursor-text"
                    onClick={() => setIsCityDropdownOpen(true)}>
                    <input type="text" placeholder="Şehir ara..." className="bg-transparent border-none outline-none w-full text-slate-700 text-sm"
                      value={citySearchTerm} onChange={e => { setCitySearchTerm(e.target.value); setIsCityDropdownOpen(true); }} />
                    <span className="text-slate-300 text-xs ml-2">▼</span>
                  </div>
                  {isCityDropdownOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto py-1">
                      {filteredCities.length > 0 ? filteredCities.map(city => (
                        <div key={city}
                          className={`px-4 py-2 text-sm cursor-pointer hover:bg-slate-50 ${editData.city === city ? 'bg-blue-50 text-[#0B57D0] font-medium' : 'text-slate-700'}`}
                          onClick={() => { setEditData({ ...editData, city }); setCitySearchTerm(city); setIsCityDropdownOpen(false); }}>
                          {city}
                        </div>
                      )) : <div className="px-4 py-3 text-sm text-slate-400 text-center">Sonuç bulunamadı</div>}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Aylık Gelir</label>
                  <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57D0] transition-colors"
                    value={editData.incomeLevel} onChange={e => setEditData({ ...editData, incomeLevel: e.target.value })}>
                    <option value="">Belirtmek İstemiyorum</option>
                    <option value="0-17002">Asgari Ücret ve Altı</option>
                    <option value="17003-30000">17.000 - 30.000 TL</option>
                    <option value="30001-50000">30.000 - 50.000 TL</option>
                    <option value="50001+">50.000 TL ve Üzeri</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <ReadOnlyField label="Ad" value={data.firstName} />
                <ReadOnlyField label="Soyad" value={data.lastName} />
                <ReadOnlyField label="Telefon" value={data.phoneNumber} />
                <ReadOnlyField label="E-posta" value={data.email} />
                <ReadOnlyField label="Doğum Tarihi" value={data.dateOfBirth} />
                <ReadOnlyField label="Cinsiyet" value={data.gender} />
                <ReadOnlyField label="Şehir" value={data.city} />
                <ReadOnlyField label="Aylık Gelir" value={data.incomeLevel} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
