import { useContext } from 'react';
import AuthContext from '../../contexts/auth/AuthContext';

export default function PlayerDashboard() {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    return <div className="p-10 text-center">Učitavanje...</div>;
  }

  const { user } = authContext;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl p-8">
        <div className="flex items-center space-x-6 border-b pb-6 mb-6">
          {/* PRIKAZ PROFILNE SLIKE */}
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg bg-gray-200">
            {user?.profile_picture ? (
              <img 
                src={user.profile_picture} 
                alt="Profilna slika" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-4xl text-gray-500 font-bold uppercase">
                {user?.username?.charAt(0) || 'U'}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">Moj Profil</h1>
            <p className="text-gray-500">
              Prijavljeni ste kao: <span className="font-semibold text-blue-600">{user?.username}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h2 className="text-xl font-bold text-blue-800 mb-2">Moja Kolekcija</h2>
            <p className="text-blue-600">Ovde će se uskoro pojaviti igre koje poseduješ.</p>
          </div>
          
          <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
            <h2 className="text-xl font-bold text-orange-800 mb-2">Lista Želja</h2>
            <p className="text-orange-600">Igre koje planiraš da nabaviš.</p>
          </div>
        </div>
      </div>
    </div>
  );
}