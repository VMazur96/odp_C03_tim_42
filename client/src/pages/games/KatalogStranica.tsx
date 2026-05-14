import { useState, useEffect, useContext } from 'react';
import type { GameDto } from '../../models/games/GameDto';
import { gameApi } from '../../api_services/games/GameAPIService';
import AuthContext from '../../contexts/auth/AuthContext';
import { userGamesApi } from '../../api_services/user_games/UserGamesAPIService';
import { Link } from 'react-router-dom';

export default function KatalogStranica() {
  const [igre, setIgre] = useState<GameDto[]>([]);
  const [ucitavanje, setUcitavanje] = useState<boolean>(true);
  
  const [statusiIgara, setStatusiIgara] = useState<Record<number, string>>({});

  // STATE-OVI ZA PRETRAGU I SORTIRANJE
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortiranje, setSortiranje] = useState<string>('naziv');
  const [filterTrajanje, setFilterTrajanje] = useState<number>(0);
  
  // Filteri za broj igrača, težinu i mehaniku
  const [filterIgraci, setFilterIgraci] = useState<string>('');
  const [filterTezina, setFilterTezina] = useState<string>('');
  const [filterMehanika, setFilterMehanika] = useState<string>('');

  const [oceneIgara, setOceneIgara] = useState<Record<number, number>>({});
  const [beleskeIgara, setBeleskeIgara] = useState<Record<number, string>>({});

  const authContext = useContext(AuthContext);

  useEffect(() => {
    const pronadjiIgre = async () => {
      const podaci = await gameApi.getAllGames();
      setIgre(podaci);
      setUcitavanje(false);
    };
    pronadjiIgre();
  }, []);

  const handleStatusChange = (igraId: number, noviStatus: string) => {
    setStatusiIgara(prev => ({ ...prev, [igraId]: noviStatus }));
  };

  const handleDodajUKolekciju = async (igraId: number) => {
    const status = statusiIgara[igraId] || 'wishlist'; 
    
    const ocena = oceneIgara[igraId] || null;
    const beleska = beleskeIgara[igraId] || null;
    
    const uspesno = await userGamesApi.dodajUKolekciju(igraId, status, ocena, beleska);
    if (uspesno) {
      alert("Igra je uspešno dodata u tvoju kolekciju!");
    } else {
      alert("Došlo je do greške pri dodavanju igre.");
    }
  };

  // Padajuci meni 
  const sveMehanike = Array.from(
    new Set(igre.flatMap(igra => igra.mechanics || []))
  ).sort();

  // FILTRIRANJE I SORTIRANJE
  const prikazaneIgre = igre
    .filter((igra) => igra.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((igra) => filterTrajanje === 0 || igra.duration_min <= filterTrajanje)
    .filter((igra) => {
      // Filteri za broj igrača, težinu i mehaniku
      if (filterIgraci) {
        const trazeno = parseInt(filterIgraci, 10);
        if (trazeno < igra.min_players || trazeno > igra.max_players) return false;
      }
      if (filterTezina && Math.round(igra.weight).toString() !== filterTezina) return false;
      if (filterMehanika && !igra.mechanics?.includes(filterMehanika)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortiranje === 'naziv') return a.name.localeCompare(b.name);
      if (sortiranje === 'godina') return (b.release_year || 0) - (a.release_year || 0);
      if (sortiranje === 'tezina') return b.weight - a.weight;
      if (sortiranje === 'ocena') return (b.average_rating || 0) - (a.average_rating || 0); // Sortiranje po oceni
      return 0;
    });

  if (ucitavanje) {
    return <div className="form-container">Ucitavanje kataloga...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-2xl p-8 text-center">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-8 tracking-wide">
            Globalni katalog igara
          </h1>
        </div>

        {/* MENI ZA PRETRAGU I SORTIRANJE*/}
        <div className="flex flex-col md:flex-row justify-between items-center bg-blue-50 p-4 rounded-lg mb-8 shadow-sm gap-4">
          
          <input 
            type="text" 
            placeholder="Pretraži igre..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border rounded-md w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          
          <div className="flex flex-wrap justify-center gap-2 w-full md:w-3/4">
            
            <input 
              type="number" 
              placeholder="Broj igrača" 
              min="1"
              value={filterIgraci}
              onChange={(e) => setFilterIgraci(e.target.value)}
              className="p-2 border rounded-md w-28 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <select
              value={filterTrajanje}
              onChange={(e) => setFilterTrajanje(Number(e.target.value))}
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value={0}>Sva trajanja</option>
              <option value={30}>Do 30 min</option>
              <option value={60}>Do 60 min</option>
              <option value={120}>Do 120 min</option>
            </select>

            <select
              value={filterTezina}
              onChange={(e) => setFilterTezina(e.target.value)}
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Sve težine</option>
              <option value="1">Vrlo laka (1)</option>
              <option value="2">Laka (2)</option>
              <option value="3">Srednja (3)</option>
              <option value="4">Teška (4)</option>
              <option value="5">Ekspertska (5)</option>
            </select>

            <select
              value={filterMehanika}
              onChange={(e) => setFilterMehanika(e.target.value)}
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Sve mehanike</option>
              {sveMehanike.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select 
              value={sortiranje} 
              onChange={(e) => setSortiranje(e.target.value)}
              className="p-2 border rounded-md bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="naziv">A-Z</option>
              <option value="godina">Najnovije</option>
              <option value="tezina">Najteže</option>
              <option value="ocena">Najbolje ocenjene</option>
            </select>
          </div>
        </div>
        
        <div className="games-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {prikazaneIgre.length === 0 ? (
            <div className="col-span-full py-12 text-gray-500 text-lg text-center">
              <p>Trenutno nema igara koje odgovaraju pretrazi.</p>
            </div>
          ) : (
            prikazaneIgre.map((igra) => (
              <div key={igra.id} className="game-card bg-white border rounded-xl transform transition duration-300 hover:scale-105 flex flex-col justify-between h-full overflow-hidden shadow-sm hover:shadow-md">
                
                <Link to={`/igre/${igra.id}`} className="grow cursor-pointer group flex flex-col">
                  <div>
                    {igra.cover_image ? (
                      <img src={igra.cover_image} alt={igra.name} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">Nema slike</div>
                    )}
                    
                    <div className="p-4">
                      <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {igra.name}
                      </h2>
                      <p className="text-gray-600 mt-2 text-sm"><strong>Igrači:</strong> {igra.min_players} - {igra.max_players}</p>
                      <p className="text-gray-600 text-sm"><strong>Trajanje:</strong> {igra.duration_min} min</p>
                      <p className="text-gray-600 text-sm"><strong>Težina:</strong> {igra.weight} / 5</p>
                      <p className="text-gray-600 text-xs mt-3 italic"><strong>Izdavač:</strong> {igra.publisher} ({igra.release_year})</p>
                    </div>
                  </div>
                </Link>

                {authContext?.isAuthenticated && (
                  <div className="p-4 pt-0 border-t border-gray-100 mt-4 bg-gray-50">
                    <select
                      value={statusiIgara[igra.id] || 'wishlist'}
                      onChange={(e) => handleStatusChange(igra.id, e.target.value)}
                      className="w-full p-2 mb-2 text-sm border border-gray-300 rounded focus:ring focus:ring-blue-200 focus:outline-none"
                    >
                      <option value="wishlist">Želim (Wishlist)</option>
                      <option value="owned">Imam (Owned)</option>
                      <option value="previously_owned">Imao ranije</option>
                    </select>

                    <div className="flex gap-2 mb-2">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        placeholder="Ocena (1-10)"
                        value={oceneIgara[igra.id] || ''}
                        onChange={(e) => setOceneIgara(prev => ({ ...prev, [igra.id]: Number(e.target.value) }))}
                        className="w-1/3 p-2 text-sm border border-gray-300 rounded focus:ring focus:ring-blue-200 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Beleška..."
                        value={beleskeIgara[igra.id] || ''}
                        onChange={(e) => setBeleskeIgara(prev => ({ ...prev, [igra.id]: e.target.value }))}
                        className="w-2/3 p-2 text-sm border border-gray-300 rounded focus:ring focus:ring-blue-200 focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={() => handleDodajUKolekciju(igra.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
                    >
                      Dodaj u kolekciju
                    </button>
                  </div>
                )}
                
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}