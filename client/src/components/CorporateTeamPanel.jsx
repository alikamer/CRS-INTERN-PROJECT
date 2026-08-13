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

  if (loading) return <div className="p-8 text-slate-400 text-sm">Yükleniyor...</div>;
  if (!team) return null;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Ekip Üyeleri</h2>
          <p className="text-xs text-slate-400 mt-0.5">Şirketinize bağlı, sisteme giriş yapabilen kişiler.</p>
        </div>

        <div className="p-8 space-y-3">
          {team.members.map((m) => (
            <div key={m.appUserId} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#0B57D0] text-white flex items-center justify-center text-xs font-bold">
                  {m.firstName ? m.firstName[0].toUpperCase() : m.email[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{m.firstName} {m.lastName}</p>
                  <p className="text-xs text-slate-400">{m.email}</p>
                </div>
              </div>
              <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${m.role === 'Owner' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                {m.role === 'Owner' ? <Crown className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                {m.role === 'Owner' ? 'Sahip' : 'Üye'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {team.pendingInvites.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">Bekleyen Davetler</h2>
            <p className="text-xs text-slate-400 mt-0.5">Bu mailler kayıt olduğunda otomatik olarak ekibinize katılır.</p>
          </div>
          <div className="p-8 space-y-2">
            {team.pendingInvites.map((inv) => (
              <div key={inv.email} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-sm text-slate-700">{inv.email}</span>
                <span className="text-xs text-slate-400">{new Date(inv.createdAt).toLocaleDateString('tr-TR')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {team.currentUserIsOwner && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">Ekip Üyesi Ekle</h2>
            <p className="text-xs text-slate-400 mt-0.5">Meslektaşınızın mailini girin, sistemde hesabı varsa direkt eklenir, yoksa kayıt olduğunda otomatik katılır.</p>
          </div>
          <form onSubmit={handleInvite} className="p-8 space-y-4">
            {message && <div className="p-3 bg-green-50 text-green-700 text-sm rounded-xl border border-green-100">{message}</div>}
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{error}</div>}
            <div className="flex gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="meslektas@sirket.com"
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57D0] transition-colors"
              />
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white bg-[#0B57D0] hover:bg-[#0842a0] rounded-xl transition-colors disabled:opacity-70"
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
