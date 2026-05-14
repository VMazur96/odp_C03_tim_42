import { useContext } from 'react';
import AuthContext from '../../contexts/auth/AuthContext';

export default function ProfilStranica() {
  const authContext = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-8 border-t-4 border-blue-600">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <img 
            src={authContext?.user?.profile_picture || 'https://via.placeholder.com/150'} 
            alt="Profil" 
            className="w-32 h-32 rounded-full border-4 border-gray-200 object-cover"
          />
          <div>
            <h1 className="text-4xl font-extrabold text-gray-800">
              {authContext?.user?.username}
            </h1>
            <p className="text-gray-500 text-lg mt-2">Uloga: <span className="font-semibold">{authContext?.user?.role}</span></p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500">
          <p>Forma za izmenu lozinke i profilne slike.</p>
        </div>
      </div>
    </div>
  );
}