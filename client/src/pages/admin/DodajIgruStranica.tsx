import { useState, useEffect } from 'react';
import { mechanicApi } from '../../api_services/mechanics/MechanicAPIService';
import { gameApi } from '../../api_services/games/GameAPIService';
import type { MechanicDto } from '../../models/mechanics/MechanicDto';

export default function DodajIgruStranica() {
  const [mehanike, setMehanike] = useState<MechanicDto[]>([]);
  const [ucitavanje, setUcitavanje] = useState(true);
  const [poruka, setPoruka] = useState<{ tekst: string; tip: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    name: '', description: '', min_players: 1, max_players: 4,
    duration_min: 30, weight: 1.0, release_year: 2024, publisher: ''
  });
  const [slikaBase64, setSlikaBase64] = useState<string>('');
  const [izabraneMehanike, setIzabraneMehanike] = useState<number[]>([]);

  useEffect(() => {
    const ucitajPodatke = async () => {
      const ucitaneMehanike = await mechanicApi.getAll();
      setMehanike(ucitaneMehanike);
      setUcitavanje(false);
    };
    ucitajPodatke();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSlikaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setPoruka({ tekst: 'Slika je prevelika (max 2MB)', tip: 'error' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlikaBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMehanikaToggle = (id: number) => {
    setIzabraneMehanike(prev => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      min_players: Number(formData.min_players),
      max_players: Number(formData.max_players),
      duration_min: Number(formData.duration_min),
      weight: Number(formData.weight),
      release_year: Number(formData.release_year),
      cover_image: slikaBase64
    };

    const rezultat = await gameApi.createGame(payload, izabraneMehanike);
    
    if (rezultat.success) {
      setPoruka({ tekst: rezultat.message, tip: 'success' });

      setFormData({ name: '', description: '', min_players: 1, max_players: 4, duration_min: 30, weight: 1.0, release_year: 2024, publisher: '' });
      setSlikaBase64('');
      setIzabraneMehanike([]);
    } else {
      setPoruka({ tekst: rezultat.message, tip: 'error' });
    }
    window.scrollTo(0, 0);
  };

  if (ucitavanje) return <div className="text-center py-10">Učitavanje podataka...</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Dodaj Novu Igru u Katalog</h1>

      {poruka && (
        <div className={`p-4 mb-6 rounded-md font-semibold ${poruka.tip === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {poruka.tekst}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Naziv i Izdavač */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-gray-700 font-bold mb-2">Naziv Igre *</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required maxLength={120} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Izdavač (Publisher)</label>
            <input type="text" name="publisher" value={formData.publisher} onChange={handleInputChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Godina Izdavanja</label>
            <input type="number" name="release_year" value={formData.release_year} onChange={handleInputChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Brojevi: Igrači, Trajanje, Težina */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">Min. Igrača *</label>
            <input type="number" name="min_players" min="1" value={formData.min_players} onChange={handleInputChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Max. Igrača *</label>
            <input type="number" name="max_players" min={formData.min_players} value={formData.max_players} onChange={handleInputChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Trajanje (min) *</label>
            <input type="number" name="duration_min" min="5" value={formData.duration_min} onChange={handleInputChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Težina (1.0 - 5.0) *</label>
            <input type="number" name="weight" step="0.1" min="1.0" max="5.0" value={formData.weight} onChange={handleInputChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Opis */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-gray-700 font-bold mb-2">Opis Igre</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
          </div>

          {/* Slika */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-gray-700 font-bold mb-2">Slika Igre (Cover)</label>
            <input type="file" accept="image/*" onChange={handleSlikaChange} className="w-full p-2 border rounded-lg" />
            {slikaBase64 && <img src={slikaBase64} alt="Preview" className="mt-4 h-32 object-contain rounded-md shadow" />}
          </div>

          {/* Mehanike - Checkbox lista */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-gray-700 font-bold mb-3">Mehanike (Opciono)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-gray-50 p-4 border rounded-lg">
              {mehanike.map(m => (
                <label key={m.id} className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={izabraneMehanike.includes(m.id)}
                    onChange={() => handleMehanikaToggle(m.id)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-gray-700 text-sm">{m.name}</span>
                </label>
              ))}
            </div>
          </div>

        </div>

        <button type="submit" className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition duration-200">
          Kreiraj Igru
        </button>
      </form>
    </div>
  );
}