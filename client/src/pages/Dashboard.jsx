const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-gray-500 text-sm font-medium">Toplam Fiş</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">1,284</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-gray-500 text-sm font-medium">Aylık Harcama</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">₺45,231.00</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-gray-500 text-sm font-medium">Bekleyen Onaylar</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">12</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-96 flex items-center justify-center">
        <p className="text-gray-400">Yakında: RFM Analiz Grafikleri</p>
      </div>
    </div>
  );
};

export default Dashboard;
