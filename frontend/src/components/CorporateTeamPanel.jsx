import { useState, useEffect } from 'react';
import { getTeam, inviteTeamMember } from '../services/api';
import { UserPlus, Crown, User } from 'lucide-react';

const CorporateTeamPanel = () => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const data = await getTeam();
      setTeam(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      await inviteTeamMember(email);
      setMessage('Ekip üyesi eklendi.');
      setEmail('');
      fetchTeam();
    } catch (err) {
      setError(err.response?.data?.Message || 'Ekleme başarısız oldu.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-[#747775] text-sm">Yükleniyor...</div>;
  if (!team) return null;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="ga4-card overflow-hidden">
        <div className="px-8 py-5 border-b border-[#E1E3E1]">
          <h2 className="text-base font-semibold text-[#1F1F1F]">Ekip Üyeleri</h2>
          <p className="text-sm text-[#747775] mt-0.5">Şirketinize bağlı, sisteme giriş yapabilen kişiler.</p>
        </div>

        <div className="p-8 space-y-3">
          {team.members.map((m) => (
            <div key={m.appUserId} className="flex items-center justify-between px-4 py-3 bg-[#F0F4F9] rounded-xl border border-[#E1E3E1]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#0B57D0] text-white flex items-center justify-center text-sm font-bold">
                  {m.firstName ? m.firstName[0].toUpperCase() : m.email[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1F1F1F]">{m.firstName} {m.lastName}</p>
                  <p className="text-sm text-[#747775]">{m.email}</p>
                </div>
              </div>
              <span className={`flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1 rounded-full ${m.role === 'Owner' ? 'ga4-badge-amber' : 'bg-[#F0F4F9] text-[#5E5E5E] border border-[#E1E3E1]'}`}>
                {m.role === 'Owner' ? <Crown className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                {m.role === 'Owner' ? 'Sahip' : 'Üye'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {team.pendingInvites.length > 0 && (
        <div className="ga4-card overflow-hidden">
          <div className="px-8 py-5 border-b border-[#E1E3E1]">
            <h2 className="text-base font-semibold text-[#1F1F1F]">Bekleyen Davetler</h2>
            <p className="text-sm text-[#747775] mt-0.5">Bu mailler kayıt olduğunda otomatik olarak ekibinize katılır.</p>
          </div>
          <div className="p-8 space-y-2">
            {team.pendingInvites.map((inv) => (
              <div key={inv.email} className="flex items-center justify-between px-4 py-3 bg-[#F0F4F9] rounded-xl border border-[#E1E3E1]">
                <span className="text-sm text-[#1F1F1F]">{inv.email}</span>
                <span className="text-sm text-[#747775]">{new Date(inv.createdAt).toLocaleDateString('tr-TR')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {team.currentUserIsOwner && (
        <div className="ga4-card overflow-hidden">
          <div className="px-8 py-5 border-b border-[#E1E3E1]">
            <h2 className="text-base font-semibold text-[#1F1F1F]">Ekip Üyesi Ekle</h2>
            <p className="text-sm text-[#747775] mt-0.5">Meslektaşınızın mailini girin, sistemde hesabı varsa direkt eklenir, yoksa kayıt olduğunda otomatik katılır.</p>
          </div>
          <form onSubmit={handleInvite} className="p-8 space-y-4">
            {message && <div className="p-3 bg-[#E6F4EA] text-[#137333] text-sm rounded-xl border border-[#CEEAD6]">{message}</div>}
            {error && <div className="p-3 bg-[#FCE8E6] text-[#C5221F] text-sm rounded-xl border border-[#FAD2CF]">{error}</div>}
            <div className="flex gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="meslektas@sirket.com"
                className="flex-1 px-4 py-2.5 bg-white border border-[#E1E3E1] rounded-xl text-[#1F1F1F] text-sm focus:outline-none focus:ring-1 focus:ring-[#0B57D0] focus:border-[#0B57D0] transition-colors"
              />
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white bg-[#0B57D0] hover:bg-[#0842A0] rounded-xl transition-colors disabled:opacity-70"
              >
                <UserPlus className="w-4 h-4" />
                {submitting ? 'Ekleniyor...' : 'Ekle'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CorporateTeamPanel;
