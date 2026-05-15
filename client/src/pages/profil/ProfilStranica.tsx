import { useState, useContext } from 'react';
import AuthContext from '../../contexts/auth/AuthContext';
import { usersApi } from '../../api_services/users/UsersAPIService';

export default function ProfilStranica() {
  const authContext = useContext(AuthContext);
  const [staraLozinka, setStaraLozinka] = useState('');
  const [novaLozinka, setNovaLozinka] = useState('');
  const [novaSlika, setNovaSlika] = useState<string | undefined>(undefined);
  const [poruka, setPoruka] = useState({ tip: '', tekst: '' });

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Provera velicine (2MB)
      const maksimalnaVelicina = 2 * 1024 * 1024; 
      if (file.size > maksimalnaVelicina) {
        setPoruka({ tip: 'error', tekst: 'Slika je prevelika! Maksimalna dozvoljena veličina je 2MB.' });
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setNovaSlika(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPoruka({ tip: '', tekst: '' });

    if (novaLozinka) {
      if (!staraLozinka) {
        setPoruka({ tip: 'error', tekst: 'Morate uneti staru lozinku da biste je promenili!' });
        return;
      }
    
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(novaLozinka)) {
        setPoruka({ tip: 'error', tekst: 'Lozinka mora imati min. 8 karaktera, barem jedno veliko slovo i jedan broj.' });
        return;
      }
    }

    const uspeh = await usersApi.azurirajProfil(
      staraLozinka || undefined,
      novaLozinka || undefined, 
      novaSlika || undefined
    );

    if (uspeh) {
      setPoruka({ tip: 'success', tekst: 'Profil je uspešno ažuriran! Osvežite stranicu da vidite promene na Navbaru.' });
      setStaraLozinka('');
      setNovaLozinka('');
    } else {
      setPoruka({ tip: 'error', tekst: 'Nije uspelo. Proverite da li je stara lozinka ispravna.' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gray-800 p-8 text-center text-white">
          <div className="relative inline-block">
            {novaSlika || authContext?.user?.profile_picture ? (
              <img src={novaSlika || authContext?.user?.profile_picture} alt="Profil" className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 mx-auto mb-4" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-600 flex items-center justify-center text-4xl mx-auto mb-4 border-4 border-blue-500">
                {authContext?.user?.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold">{authContext?.user?.username}</h1>
          <p className="text-gray-400 capitalize">Uloga: {authContext?.user?.role === 'player' ? 'Igrač' : authContext?.user?.role}</p>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-6">
          {poruka.tekst && (
            <div className={`p-4 rounded-lg text-sm font-bold ${poruka.tip === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {poruka.tekst}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Promeni profilnu sliku</label>
            <input type="file" accept="image/*" onChange={handleFileChange} 
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-6 mt-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Trenutna (stara) lozinka</label>
              <input type="password" value={staraLozinka} onChange={e => setStaraLozinka(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none" 
                placeholder="Unesite staru..." />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nova lozinka</label>
              <input type="password" value={novaLozinka} onChange={e => setNovaLozinka(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none" 
                placeholder="Min. 8 karaktera..." />
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-md">
            Sačuvaj izmene
          </button>
        </form>
      </div>
    </div>
  );
}