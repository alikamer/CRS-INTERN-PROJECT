import { useState, useEffect } from 'react';
import api, { getMyCoupons, redeemCoupon } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ConsumerDashboard = () => {
  const { user } = useAuth();
  const [myReceipts, setMyReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState(null);

  useEffect(() => {
    fetchReceipts();
    fetchCoupons();
  }, []);

  const fetchReceipts = async () => {
    try {
      const res = await api.get('/Receipts/my-receipts');
      setMyReceipts(res.data);
    } catch (err) {
      console.error('Receipts fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      const data = await getMyCoupons();
      setCoupons(data);
    } catch (err) {
      console.error('Coupons fetch error', err);
    } finally {
      setCouponsLoading(false);
    }
  };

  const handleRedeem = async (couponId) => {
    setRedeemingId(couponId);
    try {
      await redeemCoupon(couponId);
      await fetchCoupons();
    } catch (err) {
      console.error('Coupon redeem error', err);
      alert(err.response?.data || 'Kupon kullanılırken bir hata oluştu.');
    } finally {
      setRedeemingId(null);
    }
  };

  const couponStatusLabel = {
    Active: 'Aktif',
    Redeemed: 'Kullanıldı',
    Expired: 'Süresi Doldu',
  };

  const couponStatusColor = {
    Active: 'text-[#137333]',
    Redeemed: 'text-[#747775]',
    Expired: 'text-[#C5221F]',
  };

  const totalPoints = myReceipts
    .filter(r => r.status === 'Approved')
    .reduce((sum, r) => sum + (r.totalAmount * 0.05), 0);

  const approvedCount = myReceipts.filter(r => r.status === 'Approved').length;
  const pendingCount = myReceipts.filter(r => r.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Welcome & Points */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1F1F1F] tracking-tight">
            {user?.name ? `Hoş Geldiniz, ${user.name}` : 'Hoş Geldiniz'}
          </h1>
          <p className="text-sm text-[#5E5E5E] mt-1">
            Yüklediğiniz her onaylı fiş tutarının %5'i sadakat puanı olarak hesabınıza tanımlanır.
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-[#747775] uppercase font-semibold tracking-wider">Sadakat Puanınız</p>
          <p className="text-3xl font-bold text-[#0B57D0] tracking-tight">{totalPoints.toFixed(0)}</p>
        </div>
      </div>

      {/* Stats — single card with divided metrics */}
      <div className="ga4-card p-5">
        <div className="grid grid-cols-3 divide-x divide-[#E1E3E1]">
          <div className="pr-5">
            <p className="text-xs text-[#5E5E5E] mb-1">Yüklenen Fiş</p>
            <p className="text-2xl font-bold text-[#1F1F1F]">{myReceipts.length}</p>
          </div>
          <div className="px-5">
            <p className="text-xs text-[#5E5E5E] mb-1">Onaylanan</p>
            <p className="text-2xl font-bold text-[#137333]">{approvedCount}</p>
          </div>
          <div className="pl-5">
            <p className="text-xs text-[#5E5E5E] mb-1">Bekleyen</p>
            <p className="text-2xl font-bold text-[#B06000]">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Coupons */}
      <div className="ga4-card p-6 space-y-4">
        <h2 className="text-sm font-bold text-[#1F1F1F] border-b border-[#E1E3E1] pb-3">
          Kuponlarım
        </h2>

        {couponsLoading ? (
          <p className="text-sm text-[#747775] text-center py-6">Yükleniyor...</p>
        ) : coupons.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-[#747775]">Henüz kuponunuz yok.</p>
            <p className="text-xs text-[#C6C7C6] mt-1">Her 5 onaylı fişte bir indirim kuponu kazanırsınız.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E1E3E1]">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-[#1F1F1F]">
                    %{coupon.discountPercentage} İndirim <span className="font-normal text-[#747775]">#{coupon.code}</span>
                  </p>
                  <p className="text-xs text-[#747775]">
                    {coupon.brandName ? `${coupon.brandName}'da geçerli` : 'Abone markalarda geçerli'}
                    {' · '}
                    Son kullanma: {new Date(coupon.expiresAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div className="text-right">
                  {coupon.status === 'Active' ? (
                    <button
                      onClick={() => handleRedeem(coupon.id)}
                      disabled={redeemingId === coupon.id}
                      className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-[#0B57D0] text-white disabled:opacity-50"
                    >
                      {redeemingId === coupon.id ? 'İşleniyor...' : 'Kullandım'}
                    </button>
                  ) : (
                    <span className={`text-[11px] font-medium ${couponStatusColor[coupon.status]}`}>
                      {couponStatusLabel[coupon.status]}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Receipts */}
      <div className="ga4-card p-6 space-y-4">
        <h2 className="text-sm font-bold text-[#1F1F1F] border-b border-[#E1E3E1] pb-3">
          Son Fiş Hareketleriniz
        </h2>

        {loading ? (
          <p className="text-sm text-[#747775] text-center py-6">Yükleniyor...</p>
        ) : myReceipts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-[#747775]">Henüz fiş yükle mediniz.</p>
            <p className="text-xs text-[#C6C7C6] mt-1">Fiş Yükle & Geçmiş sayfasından ilk fişinizi ekleyebilirsiniz.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E1E3E1]">
            {myReceipts.map((receipt) => (
              <div key={receipt.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-[#1F1F1F]">
                    {receipt.brandName || 'Fiş'} <span className="font-normal text-[#747775]">#{receipt.id.substring(0, 8)}</span>
                  </p>
                  <p className="text-xs text-[#747775]">{new Date(receipt.receiptDate).toLocaleDateString('tr-TR')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-[#1F1F1F]">₺{receipt.totalAmount.toFixed(2)}</p>
                  <span className={`text-[11px] font-medium ${
                    receipt.status === 'Approved' ? 'text-[#137333]' : 'text-[#B06000]'
                  }`}>
                    {receipt.status === 'Approved' ? 'Onaylandı' : 'Beklemede'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumerDashboard;
