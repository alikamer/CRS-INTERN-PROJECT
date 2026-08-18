import CorporateTeamPanel from '../components/CorporateTeamPanel';

const TeamManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F1F1F] tracking-tight">Ekip Yönetimi</h1>
        <p className="text-sm text-[#5E5E5E] mt-1">
          Şirketinize bağlı kullanıcıları görüntüleyin, yeni bir meslektaşınızı davet edin.
        </p>
      </div>

      <CorporateTeamPanel />
    </div>
  );
};

export default TeamManagement;
