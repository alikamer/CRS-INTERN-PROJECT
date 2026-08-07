import { useState, useEffect } from 'react';
import api from '../services/api';
import { Award, Receipt, Upload, CheckCircle2, Clock } from 'lucide-react';

const ConsumerDashboard = () => {
  const [myReceipts, setMyReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();
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

  const totalPoints = myReceipts
    .filter(r => r.status === 'Approved')
    .reduce((sum, r) => sum + (r.totalAmount * 0.05), 0);

  const approvedCount = myReceipts.filter(r => r.status === 'Approved').length;
  const pendingCount = myReceipts.filter(r => r.status === 'Pending').length;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="bg-white/20 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Vatandaş Portalı (B2C)
          </span>
          <h2 className="text-2xl font-bold mt-2">Hoş Geldiniz! Sadakat Puanlarınız Hazır.</h2>
          <p className="text-indigo-100 text-sm mt-1">
            Yüklediğiniz her onaylı fiş tutarının %5'i sadakat puanı olarak hesabınıza tanımlanır.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center space-x-4 min-w-[200px]">
          <div className="bg-yellow-400 p-3 rounded-lg text-indigo-900">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs text-indigo-200 uppercase font-medium">Toplam Puan</div>
            <div className="text-2xl font-black">{totalPoints.toFixed(2)} Puan</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Toplam Yüklenen Fiş</p>
            <p className="text-2xl font-bold text-gray-900">{myReceipts.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Onaylanan Fişler</p>
            <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Onay Bekleyenler</p>
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Son Fiş Hareketleriniz</h3>
        </div>

        {loading ? (
          <p className="text-gray-500 text-center py-6">Yükleniyor...</p>
        ) : myReceipts.length === 0 ? (
          <div className="text-center py-12">
            <Upload className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Henüz fiş yüklemediniz.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {myReceipts.map((receipt) => (
              <div key={receipt.id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">Fiş #{receipt.id.substring(0, 8)}</p>
                  <p className="text-xs text-gray-400">{new Date(receipt.receiptDate).toLocaleDateString('tr-TR')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">₺{receipt.totalAmount.toFixed(2)}</p>
                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${
                    receipt.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
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
