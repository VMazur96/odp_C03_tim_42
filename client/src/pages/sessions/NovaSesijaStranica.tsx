import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionApi } from '../../api_services/sessions/SessionAPIService';
import { userGamesApi } from '../../api_services/user_games/UserGamesAPIService';
import { usersApi } from '../../api_services/users/UsersAPIService';
import type { UserGameDto } from '../../models/user_games/UserGameDto';
import type { UserDto } from '../../models/users/UserDto';

export default function NovaSesijaStranica() {
  const navigate = useNavigate();
  
  // Stanja za formu
  const [mojeIgre, setMojeIgre] = useState<UserGameDto[]>([]);
  const [gameId, setGameId] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10)); // Danasnji datum
  const [duration, setDuration] = useState<number>(60);
  const [note, setNote] = useState<string>('');
  
  // Stanja za pretragu korisnika
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<UserDto[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<UserDto[]>([]);

  // Ucitava igre iz korisnicke kolekcije pri ucitavanju
  useEffect(() => {
    const ucitajIgre = async () => {
      const kolekcija = await userGamesApi.dohvatiMojuKolekciju();
      // Filtrira da moze da bira samo igre koje poseduje (owned)
      setMojeIgre(kolekcija.filter(g => g.status === 'owned' || g.status === 'previously_owned'));
    };
    ucitajIgre();
  }, []);

  // Pretraga korisnika
  const handlePretraga = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      const rezultati = await usersApi.pretragaKorisnika(query);
      setSearchResults(rezultati);
    } else {
      setSearchResults([]);
    }
  };

  // Dodavanje igraca u listu za sesiju
  const dodajIgraca = (igrac: UserDto) => {
    if (!selectedPlayers.find(p => p.id === igrac.id)) {
      setSelectedPlayers([...selectedPlayers, igrac]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  // Uklanjanje igraca sa liste
  const ukloniIgraca = (id: number) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== id));
  };

  // Slanje forme na server
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (gameId === 0) {
      alert("Moraš izabrati igru iz svoje kolekcije!");
      return;
    }
    
    // Skuplja samo ID-jeve odabranih igraca
    const playerIds = selectedPlayers.map(p => p.id);
    
    const kreirano = await sessionApi.kreirajSesiju(gameId, date, duration, note, playerIds);
    if (kreirano) {
      navigate('/sesije'); // Vrati ga na listu sesija
    } else {
      alert("Došlo je do greške pri čuvanju sesije.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-8 border-t-4 border-green-500">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Evidentiraj Novu Sesiju</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* IGRA I DATUM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Igra (iz tvoje kolekcije)</label>
              <select 
                value={gameId} 
                onChange={e => setGameId(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
                required
              >
                <option value={0}>-- Izaberi igru --</option>
                {mojeIgre.map(igra => (
                  <option key={igra.gameId} value={igra.gameId}>{igra.gameName}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Datum igranja</label>
              <input 
                type="date" 
                value={date}
                max={new Date().toISOString().slice(0, 10)}
                onChange={e => setDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* TRAJANJE I BELESKA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Trajanje (u minutima)</label>
              <input 
                type="number" 
                min="5"
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Beleška (opciono)</label>
              <input 
                type="text" 
                placeholder="Npr. Pobedio sam za dlaku..."
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
            </div>
          </div>

          <hr className="my-2 border-gray-200" />

          {/* PRETRAGA IGRACA */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">👥 Dodaj prijatelje (Pretraga po imenu)</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Kucaj ime igrača (min. 3 slova)..."
                value={searchQuery}
                onChange={handlePretraga}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none bg-blue-50"
              />
              
              {/* Rezultati pretrage (Dropdown) */}
              {searchResults.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map(igrac => (
                    <li 
                      key={igrac.id} 
                      onClick={() => dodajIgraca(igrac)}
                      className="p-3 hover:bg-blue-100 cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-0"
                    >
                      {igrac.profile_image ? (
                        <img src={igrac.profile_image} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      )}
                      <span className="font-semibold text-gray-800">{igrac.korisnickoIme}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Prikaz odabranih igraca */}
            {selectedPlayers.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm font-semibold text-gray-600 mb-2">Odabrani igrači za ovu sesiju:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPlayers.map(igrac => (
                    <span key={igrac.id} className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm">
                      {igrac.korisnickoIme}
                      <button type="button" onClick={() => ukloniIgraca(igrac.id)} className="text-blue-200 hover:text-white font-bold">&times;</button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-4 rounded-xl transition shadow-md">
            💾 Sačuvaj Sesiju
          </button>
        </form>

      </div>
    </div>
  );
}