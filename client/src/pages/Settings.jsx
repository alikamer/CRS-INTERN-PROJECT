import { useState, useEffect, useRef } from 'react';
import { getConsumerProfile, updateConsumerProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, Edit2, Check, X } from 'lucide-react';

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

  const [accountData, setAccountData] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '' });
  const [profileData, setProfileData] = useState({ dateOfBirth: '', gender: '', city: '', incomeLevel: '' });
  const [editProfileData, setEditProfileData] = useState({});

  const [editingAccount, setEditingAccount] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  const [savingAccount, setSavingAccount] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const cityDropdownRef = useRef(null);

  useEffect(() => {
    if (role === 'Consumer') {
      getConsumerProfile().then(data => {
        if (data) {
          setAccountData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phoneNumber: data.phoneNumber || ''
          });
          const pd = {
            dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
            gender: data.gender || '',
            city: data.city || '',
            incomeLevel: data.incomeLevel || ''
          };
          setProfileData(pd);
          setEditProfileData(pd);
          setCitySearchTerm(data.city || '');
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

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileError('');
    setProfileMessage('');
    try {
      const payload = {
        dateOfBirth: editProfileData.dateOfBirth || null,
        gender: editProfileData.gender || null,
        city: editProfileData.city || null,
        incomeLevel: editProfileData.incomeLevel || null
      };
      await updateConsumerProfile(payload);
      setProfileData({ ...editProfileData });
      setCitySearchTerm(editProfileData.city || '');
      setEditingProfile(false);
      setProfileMessage('Profil bilgileri güncellendi.');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch {
      setProfileError('Güncelleme sırasında bir hata oluştu.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelProfile = () => {
    setEditProfileData({ ...profileData });
    setCitySearchTerm(profileData.city || '');
    setEditingProfile(false);
    setProfileError('');
  };

  if (loading) {
    return <div className="p-8 text-slate-400 text-sm">Yükleniyor...</div>;
  }

  if (role !== 'Consumer') {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-3xl">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Ayarlar</h2>
        <p className="text-slate-500 text-sm">Bu hesap türü için profil ayarları yapılandırılmamıştır.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#EEF3FC] flex items-center justify-center">
              <User className="w-4 h-4 text-[#0B57D0]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">Hesap Bilgileri</h3>
              <p className="text-xs text-slate-400 mt-0.5">E-posta adresi değiştirilemez.</p>
            </div>
          </div>
          {!editingAccount && (
            <button
              onClick={() => setEditingAccount(true)}
              className="flex items-center space-x-1.5 text-xs font-medium text-[#0B57D0] hover:bg-[#EEF3FC] px-3 py-1.5 rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Düzenle</span>
            </button>
          )}
          {editingAccount && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setEditingAccount(false)}
                disabled={savingAccount}
                className="flex items-center space-x-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>İptal</span>
              </button>
              <button
                onClick={() => setEditingAccount(false)}
                disabled={savingAccount}
                className="flex items-center space-x-1.5 text-xs font-medium text-white bg-[#0B57D0] hover:bg-[#0842a0] px-3 py-1.5 rounded-lg transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Kaydet</span>
              </button>
            </div>
          )}
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {editingAccount ? (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Ad</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57D0] transition-colors"
                  value={accountData.firstName}
                  onChange={e => setAccountData({ ...accountData, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Soyad</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57D0] transition-colors"
                  value={accountData.lastName}
                  onChange={e => setAccountData({ ...accountData, lastName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Telefon</label>
                <input
                  type="tel"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57D0] transition-colors"
                  value={accountData.phoneNumber}
                  onChange={e => setAccountData({ ...accountData, phoneNumber: e.target.value })}
                />
              </div>
              <ReadOnlyField label="E-posta" value={accountData.email} />
            </>
          ) : (
            <>
              <ReadOnlyField label="Ad" value={accountData.firstName} />
              <ReadOnlyField label="Soyad" value={accountData.lastName} />
              <ReadOnlyField label="Telefon" value={accountData.phoneNumber} />
              <ReadOnlyField label="E-posta" value={accountData.email} />
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#EEF3FC] flex items-center justify-center">
              <MapPin className="w-4 h-4 text-[#0B57D0]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">Profil Bilgileri</h3>
              <p className="text-xs text-slate-400 mt-0.5">Demografik bilgilerinizi güncelleyebilirsiniz.</p>
            </div>
          </div>
          {!editingProfile && (
            <button
              onClick={() => { setEditProfileData({ ...profileData }); setEditingProfile(true); }}
              className="flex items-center space-x-1.5 text-xs font-medium text-[#0B57D0] hover:bg-[#EEF3FC] px-3 py-1.5 rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Düzenle</span>
            </button>
          )}
          {editingProfile && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCancelProfile}
                disabled={savingProfile}
                className="flex items-center space-x-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>İptal</span>
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="flex items-center space-x-1.5 text-xs font-medium text-white bg-[#0B57D0] hover:bg-[#0842a0] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-70"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{savingProfile ? 'Kaydediliyor...' : 'Kaydet'}</span>
              </button>
            </div>
          )}
        </div>

        <div className="p-8">
          {profileMessage && (
            <div className="mb-5 p-3 bg-green-50 text-green-700 text-sm rounded-xl border border-green-100">{profileMessage}</div>
          )}
          {profileError && (
            <div className="mb-5 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{profileError}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {editingProfile ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Doğum Tarihi</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57D0] transition-colors"
                    value={editProfileData.dateOfBirth}
                    onChange={e => setEditProfileData({ ...editProfileData, dateOfBirth: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Cinsiyet</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Erkek', 'Kadın'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setEditProfileData({ ...editProfileData, gender: g })}
                        className={`py-2.5 rounded-xl border font-medium text-sm transition-all ${
                          editProfileData.gender === g
                            ? 'bg-[#0B57D0] text-white border-[#0B57D0] shadow-md shadow-blue-500/20'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div ref={cityDropdownRef} className="relative">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Şehir</label>
                  <div
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between focus-within:ring-2 focus-within:ring-[#0B57D0] transition-colors cursor-text"
                    onClick={() => setIsCityDropdownOpen(true)}
                  >
                    <input
                      type="text"
                      placeholder="Şehir ara..."
                      className="bg-transparent border-none outline-none w-full text-slate-700 text-sm"
                      value={citySearchTerm}
                      onChange={e => { setCitySearchTerm(e.target.value); setIsCityDropdownOpen(true); }}
                    />
                    <span className="text-slate-300 text-xs ml-2">▼</span>
                  </div>
                  {isCityDropdownOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto py-1">
                      {filteredCities.length > 0 ? filteredCities.map(city => (
                        <div
                          key={city}
                          className={`px-4 py-2 text-sm cursor-pointer hover:bg-slate-50 ${editProfileData.city === city ? 'bg-blue-50 text-[#0B57D0] font-medium' : 'text-slate-700'}`}
                          onClick={() => {
                            setEditProfileData({ ...editProfileData, city });
                            setCitySearchTerm(city);
                            setIsCityDropdownOpen(false);
                          }}
                        >
                          {city}
                        </div>
                      )) : (
                        <div className="px-4 py-3 text-sm text-slate-400 text-center">Sonuç bulunamadı</div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Aylık Gelir</label>
                  <select
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57D0] transition-colors"
                    value={editProfileData.incomeLevel}
                    onChange={e => setEditProfileData({ ...editProfileData, incomeLevel: e.target.value })}
                  >
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
                <ReadOnlyField label="Doğum Tarihi" value={profileData.dateOfBirth} />
                <ReadOnlyField label="Cinsiyet" value={profileData.gender} />
                <ReadOnlyField label="Şehir" value={profileData.city} />
                <ReadOnlyField label="Aylık Gelir" value={profileData.incomeLevel} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
