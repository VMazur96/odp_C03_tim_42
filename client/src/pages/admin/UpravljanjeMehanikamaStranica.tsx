import { useState, useEffect } from 'react';
import { mechanicApi } from '../../api_services/mechanics/MechanicAPIService';
import type { MechanicDto } from '../../models/mechanics/MechanicDto';

export default function UpravljanjeMehanikamaStranica() {
  const [mehanike, setMehanike] = useState<MechanicDto[]>([]);
  const [noviNaziv, setNoviNaziv] = useState('');
  const [ucitavanje, setUcitavanje] = useState(true);
  const [poruka, setPoruka] = useState<{ tekst: string; tip: 'success' | 'error' } | null>(null);

  const ucitajMehanike = async () => {
    const podaci = await mechanicApi.getAll();
    setMehanike(podaci);
    setUcitavanje(false);
  };

  useEffect(() => {
    const inicijalnoUcitavanje = async () => {
      const podaci = await mechanicApi.getAll();
      setMehanike(podaci);
      setUcitavanje(false);
    };
    
    inicijalnoUcitavanje();
  }, []);

  const handleDodaj = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noviNaziv.trim()) return;

    const rezultat = await mechanicApi.add(noviNaziv);
    if (rezultat.success) {
      setNoviNaziv('');
      setPoruka({ tekst: 'Mehanika je uspešno dodata!', tip: 'success' });
      ucitajMehanike();
    } else {
      setPoruka({ tekst: rezultat.message || 'Greška.', tip: 'error' });
    }
    
    // Skloni poruku posle 3 sekunde
    setTimeout(() => setPoruka(null), 3000);
  };

  const handleObrisi = async (id: number, naziv: string) => {
    if (window.confirm(`Da li ste sigurni da želite da obrišete mehaniku "${naziv}"?`)) {
      const rezultat = await mechanicApi.delete(id);
      if (rezultat.success) {
        setPoruka({ tekst: rezultat.message || 'Uspešno obrisano.', tip: 'success' });
        setMehanike(mehanike.filter(m => m.id !== id));
      } else {
        // Ovde će se ispisati ona greška "Mehanika je dodeljena igri..."
        setPoruka({ tekst: rezultat.message || 'Greška pri brisanju.', tip: 'error' });
      }
      setTimeout(() => setPoruka(null), 3000);
    }
  };

  if (ucitavanje) return <div className="text-center py-10">Učitavanje mehanika...</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Upravljanje Mehanikama</h1>

      {poruka && (
        <div className={`p-4 mb-6 rounded-md font-semibold ${poruka.tip === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {poruka.tekst}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Dodaj novu mehaniku</h2>
        <form onSubmit={handleDodaj} className="flex gap-4">
          <input 
            type="text" 
            value={noviNaziv}
            onChange={(e) => setNoviNaziv(e.target.value)}
            placeholder="Npr. Worker Placement" 
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition">
            Dodaj
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="p-4 font-bold text-gray-700">ID</th>
              <th className="p-4 font-bold text-gray-700">Naziv Mehanike</th>
              <th className="p-4 font-bold text-gray-700 text-right">Akcije</th>
            </tr>
          </thead>
          <tbody>
            {mehanike.map((m) => (
              <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 text-gray-500">#{m.id}</td>
                <td className="p-4 font-semibold text-gray-800">{m.name}</td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleObrisi(m.id, m.name)}
                    className="text-red-500 hover:text-red-700 font-bold px-3 py-1 bg-red-50 hover:bg-red-100 rounded transition"
                  >
                    Obriši
                  </button>
                </td>
              </tr>
            ))}
            {mehanike.length === 0 && (
              <tr><td colSpan={3} className="p-4 text-center text-gray-500">Nema dodatih mehanika.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}