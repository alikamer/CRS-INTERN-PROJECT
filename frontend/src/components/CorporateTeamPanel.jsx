import { useState, useEffect } from 'react';
import { getTeam, inviteTeamMember, removeTeamMember, cancelTeamInvite } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CorporateTeamPanel = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [actionError, setActionError] = useState('');
  const [removingId, setRemovingId] = useState(null);
  const [busyMemberId, setBusyMemberId] = useState(null);
  const [busyInviteId, setBusyInviteId] = useState(null);

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
      await fetchTeam();
    } catch (err) {
      setError(err.response?.data?.Message || 'Ekleme başarısız oldu.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmRemove = async (appUserId) => {
    setBusyMemberId(appUserId);
    setActionError('');
    try {
      await removeTeamMember(appUserId);
      setRemovingId(null);
      await fetchTeam();
    } catch (err) {
      setActionError(err.response?.data?.Message || 'Çıkarma işlemi başarısız oldu.');
    } finally {
      setBusyMemberId(null);
    }
  };

  const handleCancelInvite = async (inviteId) => {
    setBusyInviteId(inviteId);
    setActionError('');
    try {
      await cancelTeamInvite(inviteId);
      await fetchTeam();
    } catch (err) {
      setActionError(err.response?.data?.Message || 'İptal işlemi başarısız oldu.');
    } finally {
      setBusyInviteId(null);
    }
  };

  if (loading) return <div className="p-8 text-[#747775] text-sm">Yükleniyor...</div>;
  if (!team) return null;

  return (
    <div className="max-w-5xl grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
      <div className="space-y-6">
        {team.currentUserIsOwner && (
          <div className="ga4-card overflow-hidden">
            <div className="px-6 py-5 border-b border-[#E1E3E1]">
              <h2 className="text-base font-semibold text-[#1F1F1F]">Ekip Üyesi Ekle</h2>
              <p className="text-sm text-[#747775] mt-0.5">Sistemde hesabı varsa direkt eklenir, yoksa kayıt olduğunda otomatik katılır.</p>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-3">
              {message && <p className="text-sm text-[#137333]">{message}</p>}
              {error && <p className="text-sm text-[#C5221F]">{error}</p>}
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="meslektas@sirket.com"
                className="w-full px-4 py-2.5 bg-white border border-[#E1E3E1] rounded-xl text-[#1F1F1F] text-sm focus:outline-none focus:ring-1 focus:ring-[#0B57D0] focus:border-[#0B57D0] transition-colors"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-5 py-2.5 text-sm font-medium text-white bg-[#0B57D0] hover:bg-[#0842A0] rounded-xl transition-colors disabled:opacity-70"
              >
                {submitting ? 'Ekleniyor...' : 'Ekle'}
              </button>
            </form>
          </div>
        )}

        {team.pendingInvites.length > 0 && (
          <div className="ga4-card overflow-hidden">
            <div className="px-6 py-5 border-b border-[#E1E3E1]">
              <h2 className="text-base font-semibold text-[#1F1F1F]">Bekleyen Davetler</h2>
            </div>
            <div className="px-6 py-2 divide-y divide-[#E1E3E1]">
              {team.pendingInvites.map((inv) => (
                <div key={inv.id} className="py-3 space-y-1.5">
                  <p className="text-sm text-[#1F1F1F] truncate">{inv.email}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#747775]">{new Date(inv.createdAt).toLocaleDateString('tr-TR')}</p>
                    {team.currentUserIsOwner && (
                      <button
                        onClick={() => handleCancelInvite(inv.id)}
                        disabled={busyInviteId === inv.id}
                        className="text-sm text-[#747775] hover:text-[#C5221F] hover:underline disabled:opacity-50"
                      >
                        {busyInviteId === inv.id ? 'İptal ediliyor...' : 'İptal Et'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="ga4-card overflow-hidden">
        <div className="px-6 py-5 border-b border-[#E1E3E1]">
          <h2 className="text-base font-semibold text-[#1F1F1F]">Ekip Üyeleri</h2>
          <p className="text-sm text-[#747775] mt-0.5">Şirketinize bağlı, sisteme giriş yapabilen kişiler.</p>
        </div>

        {actionError && (
          <div className="mx-6 mt-5 p-3 bg-[#FCE8E6] text-[#C5221F] text-sm rounded-xl border border-[#FAD2CF]">
            {actionError}
          </div>
        )}

        <div className="px-6 py-2 divide-y divide-[#E1E3E1]">
          {team.members.map((m) => {
            const isSelf = user?.email === m.email;
            const canRemove = team.currentUserIsOwner && m.role !== 'Owner' && !isSelf;

            return (
              <div key={m.appUserId} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#0B57D0] text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {m.firstName ? m.firstName[0].toUpperCase() : m.email[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1F1F1F] truncate">{m.firstName} {m.lastName}</p>
                    <p className="text-sm text-[#747775] truncate">{m.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      m.role === 'Owner' ? 'bg-[#0B57D0] text-white' : 'bg-[#F0F4F9] text-[#5E5E5E] border border-[#E1E3E1]'
                    }`}
                  >
                    {m.role === 'Owner' ? 'Şirket Yöneticisi' : 'Ekip Üyesi'}
                  </span>

                  {canRemove && (
                    removingId === m.appUserId ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => confirmRemove(m.appUserId)}
                          disabled={busyMemberId === m.appUserId}
                          className="text-sm font-medium text-[#C5221F] hover:underline disabled:opacity-60"
                        >
                          {busyMemberId === m.appUserId ? 'Çıkarılıyor...' : 'Onayla'}
                        </button>
                        <button
                          onClick={() => setRemovingId(null)}
                          className="text-sm text-[#747775] hover:underline"
                        >
                          Vazgeç
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRemovingId(m.appUserId)}
                        className="text-sm text-[#747775] hover:text-[#C5221F] hover:underline"
                      >
                        Kaldır
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CorporateTeamPanel;
