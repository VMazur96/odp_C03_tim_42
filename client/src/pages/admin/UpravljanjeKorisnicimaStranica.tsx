import { useState, useEffect, useContext } from 'react';
import { adminKorisniciApi } from '../../api_services/users/AdminKorisniciAPIService';
import type { AdminUserDto } from '../../models/users/AdminUserDto';
import AuthContext from '../../contexts/auth/AuthContext';

export default function UpravljanjeKorisnicimaStranica() {
  const [korisnici, setKorisnici] = useState<AdminUserDto[]>([]);
  const [ucitavanje, setUcitavanje] = useState(true);
  const [poruka, setPoruka] = useState<{ tekst: string; tip: 'success' | 'error' } | null>(null);
  
  const authContext = useContext(AuthContext);

  const ucitajKorisnike = async () => {
    const podaci = await adminKorisniciApi.getAllUsers();
    setKorisnici(podaci);
    setUcitavanje(false);
  };

  useEffect(() => {
    const inicijalnoUcitavanje = async () => {
      const podaci = await adminKorisniciApi.getAllUsers();
      setKorisnici(podaci);
      setUcitavanje(false);
    };
    
    inicijalnoUcitavanje();
  }, []);

  const handlePromenaUloge = async (korisnikId: number, trenutnaUloga: string, novaUloga: string) => {
    if (trenutnaUloga === novaUloga) return;

    if (window.confirm(`Da li ste sigurni da želite da promenite ulogu ovom korisniku u "${novaUloga}"?`)) {
      const rezultat = await adminKorisniciApi.promeniUlogu(korisnikId, novaUloga);
      
      if (rezultat.success) {
        setPoruka({ tekst: 'Uloga je uspešno promenjena!', tip: 'success' });
        ucitajKorisnike(); // Osvežavamo tabelu da prikažemo nove podatke
      } else {
        setPoruka({ tekst: rezultat.message || 'Greška pri promeni uloge.', tip: 'error' });
      }
      
      setTimeout(() => setPoruka(null), 3000);
    }
  };

  if (ucitavanje) return <div className="text-center py-10">Učitavanje korisnika...</div>;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Svi Korisnici Sistema</h1>

      {poruka && (
        <div className={`p-4 mb-6 rounded-md font-semibold ${poruka.tip === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {poruka.tekst}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="p-4 font-bold text-gray-700">ID</th>
              <th className="p-4 font-bold text-gray-700">Korisničko ime</th>
              <th className="p-4 font-bold text-gray-700">Email</th>
              <th className="p-4 font-bold text-gray-700">Trenutna Uloga</th>
              <th className="p-4 font-bold text-gray-700 text-right">Akcija (Promeni ulogu)</th>
            </tr>
          </thead>
          <tbody>
            {korisnici.map((k) => {
              const isTrenutniKorisnik = authContext?.user?.id === k.id;
              
              return (
                <tr key={k.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-gray-500">#{k.id}</td>
                  <td className="p-4 font-semibold text-gray-800">
                    {k.username} {isTrenutniKorisnik && <span className="text-xs text-blue-500 ml-2">(Vi)</span>}
                  </td>
                  <td className="p-4 text-gray-600">{k.email || 'Nema email'}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${k.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                      {k.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {isTrenutniKorisnik ? (
                      <span className="text-gray-400 text-sm italic">Ne možete menjati svoju ulogu</span>
                    ) : (
                      <select 
                        value={k.role}
                        onChange={(e) => handlePromenaUloge(k.id, k.role, e.target.value)}
                        className="p-2 border border-gray-300 rounded focus:ring focus:ring-blue-200 focus:outline-none"
                      >
                        <option value="guest">Gost (guest)</option>
                        <option value="player">Igrač (player)</option>
                        <option value="admin">Administrator (admin)</option>
                      </select>
                    )}
                  </td>
                </tr>
              );
            })}
            {korisnici.length === 0 && (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">Nema registrovanih korisnika.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}